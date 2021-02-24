import { Injectable } from '@angular/core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { DocumentSymbol, SemanticTokens } from 'vscode-languageserver-protocol';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';

import { Tab } from './tabs.service';
import { ElectronService } from '../core/services';
import { classicTheme } from '../configs/editorTheme';
import { cppLang, cppLangConf } from '../configs/cppLanguageConfig';
import { defaultKeybindings } from '../configs/editorKeybindings';

// All standard C++ headers filename
const stdCppHeaders = [
  'concepts', 'coroutine', 'cstdlib', 'csignal', 'csetjmp', 'cstdarg', 'typeinfo', 'typeindex', 'type_traits', 'bitset', 'functional', 'utility', 'ctime', 'chrono', 'cstddef', 'initializer_list', 'tuple', 'any', 'optional', 'variant', 'compare', 'version', 'source_location', 'new', 'memory', 'scoped_allocator', 'memory_resource', 'climits', 'cfloat', 'cstdint', 'cinttypes', 'limits', 'exception', 'stdexcept', 'cassert', 'system_error', 'cerrno', 'cctype', 'cwctype', 'cstring', 'cwchar', 'cuchar', 'string', 'string_view', 'charconv', 'format', 'array', 'vector', 'deque', 'list', 'forward_list', 'set', 'map', 'unordered_set', 'unordered_map', 'stack', 'queue', 'span', 'iterator', 'ranges', 'algorithm', 'execution', 'cmath', 'complex', 'valarray', 'random', 'numeric', 'ratio', 'cfenv', 'bit', 'numbers', 'locale', 'clocale', 'codecvt', 'iosfwd', 'ios', 'istream', 'ostream', 'iostream', 'fstream', 'sstream', 'syncstream', 'strstream', 'iomanip', 'streambuf', 'cstdio', 'filesystem', 'regex', 'atomic', 'thread', 'stop_token', 'mutex', 'shared_mutex', 'future', 'condition_variable', 'semaphore', 'latch', 'barrier'
];

function isCpp(filename: string) {
  if (stdCppHeaders.includes(filename)) return true;
  const ext = filename.split('.').pop();
  return ['cc', 'cxx', 'cpp', 'h'].includes(ext);
}

const clangdSemanticTokensLegend: monaco.languages.SemanticTokensLegend = {
  tokenModifiers: [], // No token modifier supported now (12.0.0-rc1)
  // See https://github.com/llvm/llvm-project/blob/4dc8365/clang-tools-extra/clangd/SemanticHighlighting.h#L30
  tokenTypes: [
    "variable",  // Global var
    "variable",  // Local var
    "variable",  // Param
    "function",  // Function (global)
    "function",  // Member function
    "function",  // Static member function
    "variable",  // Member data
    "variable",  // Static member data
    "type",      // Class type
    "type",      // Enum type
    "number",    // Enum member
    "type",      // Type-alias (rely on template)
    "type",      // Other type
    "",          // Unknown
    "type",      // Namespace
    "type",      // Template param
    "type",      // Concept
    "type",      // Primitive type (type-alias)
    "macro",     // Macro
    "comment"    // Inactive Code
  ]
}

interface EditorBreakpointDecInfo {
  id: string;
  hitCount: number | null;
  expression: string | null;
}

export interface EditorBreakpointInfo extends EditorBreakpointDecInfo {
  line: number;
}

interface ModelInfo {
  cursor: monaco.IPosition;
  scrollTop: number;
  bkptDecs: EditorBreakpointDecInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  isInit = false;
  isLanguageClientStarted = false;
  editorMessage: Subject<{ type: string; arg?: any }> = new Subject();

  private editor: monaco.editor.IStandaloneCodeEditor;
  private languageClient: MonacoLanguageClient;
  private editorText = new BehaviorSubject<string>("");
  editorText$ = this.editorText.asObservable();

  private modelInfos: { [uri: string]: ModelInfo } = {};
  private breakpointInfos = new BehaviorSubject<EditorBreakpointInfo[]>([]);
  breakpointInfos$ = this.breakpointInfos.asObservable();

  private traceDecoration: string[];
  private lastTraceUri: monaco.Uri = null;

  constructor(private monacoEditorLoaderService: MonacoEditorLoaderService, private electronService: ElectronService) {
    this.editorText.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(_ => {
      const model = this.editor?.getModel();
      if (model) {
        this.updateBkptInfo(model);
      }
    })
    this.monacoEditorLoaderService.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1)
    ).subscribe(() => {
      monaco.languages.register({
        id: 'cpp',
        extensions: [
          '.cc', '.cxx', '.cpp', '.h'
        ],
        aliases: ['C++', 'Cpp', 'cpp']
      });
      monaco.languages.setMonarchTokensProvider('cpp', cppLang);
      monaco.languages.setLanguageConfiguration('cpp', cppLangConf);
      monaco.languages.registerDocumentSemanticTokensProvider('cpp', {
        getLegend() {
          return clangdSemanticTokensLegend;
        },
        provideDocumentSemanticTokens: async (model: monaco.editor.ITextModel) => {
          return {
            data: new Uint32Array(await this.getSemanticTokens(model))
          }
        },
        releaseDocumentSemanticTokens() { }
      })
      monaco.editor.defineTheme('devcpp-classic', classicTheme);
      this.startLanguageClient();
    })
  }

  private getUri(tab: Tab): monaco.Uri {
    let uri = tab.type + "://";
    if (tab.path === null) uri += '/anon_workspace/' + tab.title;
    else uri += '/' + tab.path.replace(/\\/g, '/');
    return monaco.Uri.parse(uri);
  }

  /** Turn breakpoint info to editor decoration */
  private bkptInfoToDecoration(line: number): monaco.editor.IModelDeltaDecoration {
    return {
      range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: 'bkpt-line-decoration',
        glyphMarginClassName: 'bkpt-glyph-margin codicon codicon-circle-filled',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    };
  }

  async startLanguageClient() {
    const result = await this.electronService.ipcRenderer.invoke('langServer/start');
    MonacoServices.install(require('monaco-editor-core/esm/vs/platform/commands/common/commands').CommandsRegistry);
    // create the web socket
    const socketUrl = `ws://localhost:${result.port}/langServer`;
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: 8,
      debug: false
    };
    const webSocket = new ReconnectingWebSocket(socketUrl, [], socketOptions) as any;
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: (connection: MessageConnection) => {
        // create and start the language client
        this.languageClient = new MonacoLanguageClient({
          name: `C++ Client`,
          clientOptions: {
            // use a language id as a document selector
            documentSelector: ['cpp'],
            // disable the default error handler
            errorHandler: {
              error: () => ErrorAction.Continue,
              closed: () => CloseAction.DoNotRestart
            }
          },
          // create a language client connection from the JSON RPC connection on demand
          connectionProvider: {
            get: (errorHandler, closeHandler) => {
              return Promise.resolve(createConnection(<any>connection, errorHandler, closeHandler));
            }
          }
        });
        const disposable = this.languageClient.start();
        this.isLanguageClientStarted = true;
        connection.onClose(() => {
          this.isLanguageClientStarted = false;
          disposable.dispose();
        });
      }
    });
  }

  // https://github.com/microsoft/monaco-editor/issues/2000
  private interceptOpenEditor() {
    const editorService = (this.editor as any)._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (input: { options: any, resource: monaco.Uri }, source) => {
      const result = await openEditorBase(input, source);
      if (result === null) {
        const selection: monaco.IRange = input.options?.selection;
        this.editorMessage.next({
          type: "requestOpen",
          arg: {
            selection: selection ?? ({ startColumn: 1, startLineNumber: 1, endColumn: 1, endLineNumber: 1 } as monaco.IRange),
            path: input.resource.path.substr(1) // Remove prefix '/' from URI
          }
        });
      }
      return result;
    };
  }

  private mouseDownListener = (e: monaco.editor.IEditorMouseEvent) => {
    // Add or remove breakpoints
    if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
      const lineNumber = e.target.range.startLineNumber;
      const currentModel = this.editor.getModel();
      const uri = currentModel.uri.toString();
      const index = this.modelInfos[uri].bkptDecs.findIndex(v =>
        currentModel.getDecorationRange(v.id).startLineNumber === lineNumber
      );
      if (index !== -1) {
        currentModel.deltaDecorations([this.modelInfos[uri].bkptDecs[index].id], []);
        this.modelInfos[uri].bkptDecs.splice(index, 1);
      } else {
        this.modelInfos[uri].bkptDecs.push({
          id: currentModel.deltaDecorations([], [this.bkptInfoToDecoration(lineNumber)])[0],
          hitCount: null,
          expression: null
        });
      }
      this.updateBkptInfo(currentModel);
    }
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    monaco.editor.setTheme('devcpp-classic');
    this.editor = editor;
    for (let i of defaultKeybindings) {
      this.editor.addCommand(i.keybinding, () => {
        this.editorMessage.next({ type: i.message });
      })
    }
    this.interceptOpenEditor();
    this.editor.onMouseDown(this.mouseDownListener);
    this.editor.onDidChangeModel((e) => {
      this.editorText.next(monaco.editor.getModel(e.newModelUrl).getValue());
    });
    this.isInit = true;
    this.editorMessage.next({ type: "initCompleted" });
  }

  editorDestroy() {
    this.editorText.next("");
    this.editor = null;
    this.isInit = false;
  }


  switchToModel(tab: Tab, replace: boolean = false) {
    const uri = this.getUri(tab);
    const newUri = uri.toString();
    let newModel = monaco.editor.getModel(uri);
    const oldModel = this.editor.getModel();
    const oldUri = oldModel?.uri.toString();
    if (oldUri in this.modelInfos) {
      this.modelInfos[oldUri].cursor = this.editor.getPosition();
      this.modelInfos[oldUri].scrollTop = this.editor.getScrollTop();
    }
    if (newModel === null) {
      newModel = monaco.editor.createModel(tab.code, isCpp(tab.title) ? 'cpp' : 'text', uri);
      newModel.onDidChangeContent(_ => {
        tab.saved = false;
        this.editorText.next(newModel.getValue());
      });
      this.modelInfos[newUri] = {
        cursor: { column: 1, lineNumber: 1 },
        scrollTop: 0,
        bkptDecs: [],
      };
      if (replace && oldModel !== null) {
        // "Inherit" old decorations to new model
        for (const bkptInfo of this.modelInfos[oldUri].bkptDecs) {
          const line = oldModel.getDecorationRange(bkptInfo.id).startLineNumber;
          this.modelInfos[newUri].bkptDecs.push({
            id: newModel.deltaDecorations([], [this.bkptInfoToDecoration(line)])[0],
            expression: bkptInfo.expression,
            hitCount: bkptInfo.hitCount
          });
        }
        this.modelInfos[newUri].cursor = this.modelInfos[oldUri].cursor;
        this.modelInfos[newUri].scrollTop = this.modelInfos[oldUri].scrollTop;
        delete this.modelInfos[oldUri];
      }
    }
    this.editor.setModel(newModel);
    console.log('switch to ', newUri, tab);
    if (replace) {
      oldModel.dispose();
    }
    this.editor.setPosition(this.modelInfos[newUri].cursor);
    this.editor.setScrollTop(this.modelInfos[newUri].scrollTop);
    this.editor.focus();
  }

  async getSymbols(): Promise<DocumentSymbol[]> {
    if (!this.isInit) return Promise.resolve([]);
    if (this.editor.getModel() === null) return Promise.resolve([]);
    if (!this.isLanguageClientStarted) return Promise.resolve([]);
    return this.languageClient.sendRequest("textDocument/documentSymbol", {
      textDocument: {
        uri: this.editor.getModel().uri.toString()
      }
    });
  }

  private async getSemanticTokens(model?: monaco.editor.ITextModel): Promise<number[]> {
    if (!this.isInit) return Promise.resolve(null);
    if (!this.isLanguageClientStarted) return Promise.resolve(null);
    if (typeof model === 'undefined') model = this.editor.getModel();
    if (model === null) return Promise.resolve(null);
    return (await this.languageClient.sendRequest<SemanticTokens>("textDocument/semanticTokens/full", {
      textDocument: {
        uri: model.uri.toString()
      }
    })).data;
  }

  getCode() {
    if (!this.isInit) return "";
    return this.editor.getValue();
  }
  setSelection(range: monaco.IRange) {
    this.editor.setSelection(range);
    this.editor.revealRange(range);
    this.editor.focus();
  }
  setPosition(position: monaco.IPosition) {
    this.editor.setPosition(position);
    this.editor.revealLine(position.lineNumber);
    this.editor.focus();
  }

  destroy(tab: Tab) {
    const uri = this.getUri(tab);
    console.log('destroy ', uri.toString());
    const target = monaco.editor.getModel(uri);
    delete this.modelInfos[uri.toString()];
    if (this.lastTraceUri === uri) this.lastTraceUri = null;
    target.dispose();
  }

  private updateBkptInfo(model: monaco.editor.ITextModel) {
    const uri = model.uri.toString();
    if (uri in this.modelInfos)
      this.breakpointInfos.next(this.modelInfos[uri].bkptDecs.map(dec => ({
        line: model.getDecorationRange(dec.id).startLineNumber,
        ...dec
      })));
  }

  changeBkptCondition(id: string, expression: string) {
    const currentModel = this.editor.getModel();
    this.modelInfos[currentModel.uri.toString()].bkptDecs.find(v => v.id === id).expression = expression;
    this.updateBkptInfo(currentModel);
  }

  showTrace(line: number) {
    this.hideTrace();
    const currentModel = this.editor.getModel();
    this.traceDecoration = currentModel.deltaDecorations(this.traceDecoration, [{
      range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: 'trace-line-decoration',
        glyphMarginClassName: 'trace-glyph-margin codicon codicon-debug-stackframe',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }]);
    this.lastTraceUri = currentModel.uri;
    this.editor.revealLine(line);
  }
  hideTrace() {
    if (this.lastTraceUri !== null)
      monaco.editor.getModel(this.lastTraceUri)?.deltaDecorations(this.traceDecoration, []);
    this.traceDecoration = [];
  }
}