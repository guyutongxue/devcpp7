import { Injectable } from '@angular/core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { DocumentSymbol } from 'vscode-languageserver-protocol';
import { BehaviorSubject, Subject } from 'rxjs';
import { Tab } from './tabs.service'
import { ElectronService } from '../core/services';
import { classicTheme } from '../configs/editorTheme';
import { defaultKeybindings } from '../configs/editorKeybindings'
import { StartLanguageServerResult } from '../../background/handlers/typing';

// All standard C++ headers filename
const stdCppHeaders = [
  'concepts', 'coroutine', 'cstdlib', 'csignal', 'csetjmp', 'cstdarg', 'typeinfo', 'typeindex', 'type_traits', 'bitset', 'functional', 'utility', 'ctime', 'chrono', 'cstddef', 'initializer_list', 'tuple', 'any', 'optional', 'variant', 'compare', 'version', 'source_location', 'new', 'memory', 'scoped_allocator', 'memory_resource', 'climits', 'cfloat', 'cstdint', 'cinttypes', 'limits', 'exception', 'stdexcept', 'cassert', 'system_error', 'cerrno', 'cctype', 'cwctype', 'cstring', 'cwchar', 'cuchar', 'string', 'string_view', 'charconv', 'format', 'array', 'vector', 'deque', 'list', 'forward_list', 'set', 'map', 'unordered_set', 'unordered_map', 'stack', 'queue', 'span', 'iterator', 'ranges', 'algorithm', 'execution', 'cmath', 'complex', 'valarray', 'random', 'numeric', 'ratio', 'cfenv', 'bit', 'numbers', 'locale', 'clocale', 'codecvt', 'iosfwd', 'ios', 'istream', 'ostream', 'iostream', 'fstream', 'sstream', 'syncstream', 'strstream', 'iomanip', 'streambuf', 'cstdio', 'filesystem', 'regex', 'atomic', 'thread', 'stop_token', 'mutex', 'shared_mutex', 'future', 'condition_variable', 'semaphore', 'latch', 'barrier'
];

function isCpp(filename: string) {
  if (stdCppHeaders.includes(filename)) return true;
  const ext = filename.split('.').pop();
  return ['cc', 'cxx', 'cpp', 'h'].includes(ext);
}

export interface EditorBreakpointInfo {
  line: number;
  hitCount: number | null;
  expression: string | null;
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

  private breakpointInfos: { [uri: string]: EditorBreakpointInfo[] } = {};
  private breakpointDecorations: { [uri: string]: string[] } = {};
  private traceDecoration: string[];
  private lastTraceUri: monaco.Uri = null;

  constructor(private electronService: ElectronService) { }

  private getUri(tab: Tab): monaco.Uri {
    let uri = tab.type + "://";
    if (tab.path === null) uri += '/anon_workspace/' + tab.title;
    else uri += '/' + tab.path.replace(/\\/g, '/');
    return monaco.Uri.parse(uri);
  }

  /** Turn breakpoint infos to editor decorations */
  private bkptInfosToDecoration(info: EditorBreakpointInfo[]): monaco.editor.IModelDeltaDecoration[] {
    return info.map(i => ({
      range: { startLineNumber: i.line, startColumn: 1, endLineNumber: i.line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: 'bkpt-line-decoration',
        glyphMarginClassName: 'bkpt-glyph-margin codicon codicon-circle-filled',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }));
  }

  startLanguageClient() {
    const result: StartLanguageServerResult = this.electronService.ipcRenderer.sendSync('langServer/start');
    if (!this.isInit) return;
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
      const index = this.breakpointInfos[uri].findIndex(v => v.line === lineNumber);
      if (index !== -1) {
        this.breakpointInfos[uri].splice(index, 1);
      } else {
        this.breakpointInfos[uri].push({
          line: lineNumber,
          hitCount: null,
          expression: null
        });
      }
      this.breakpointDecorations[uri] = currentModel.deltaDecorations(
        this.breakpointDecorations[uri],
        this.bkptInfosToDecoration(this.breakpointInfos[uri])
      );
    }
  }

  monacoInit(editor: monaco.editor.IStandaloneCodeEditor) {
    monaco.editor.defineTheme('devcpp-classic', classicTheme);
    monaco.editor.setTheme('devcpp-classic');
    this.editor = editor;
    for (let i of defaultKeybindings) {
      this.editor.addCommand(i.keybinding, () => {
        this.editorMessage.next({ type: i.message });
      })
    }
    this.interceptOpenEditor();
    this.editor.onMouseDown(this.mouseDownListener);
    this.isInit = true;
    this.editorMessage.next({ type: "initCompleted" });
  }


  switchToModel(tab: Tab, replace: boolean = false) {
    const uri = this.getUri(tab);
    let newModel = monaco.editor.getModel(uri);
    const oldModel = this.editor.getModel();
    if (newModel === null) {
      newModel = monaco.editor.createModel(tab.code, isCpp(tab.title) ? 'cpp' : 'text', uri);
      newModel.onDidChangeContent(_ => {
        tab.saved = false;
        this.editorText.next(newModel.getValue());
      });
      if (replace) {
        // "Inherit" old decorations to new model
        const oldUri = oldModel.uri.toString();
        this.breakpointInfos[uri.toString()] = this.breakpointInfos[oldUri];
        this.breakpointDecorations[uri.toString()] = newModel.deltaDecorations([], this.bkptInfosToDecoration(this.breakpointInfos[oldUri]));
        delete this.breakpointInfos[oldUri];
        delete this.breakpointDecorations[oldUri];
      } else {
        // set empty breakpoints
        this.breakpointInfos[uri.toString()] = [];
        this.breakpointDecorations[uri.toString()] = [];
      }
    }
    this.editor.setModel(newModel);
    console.log('switch to ', uri.toString());
    this.editorText.next(newModel.getValue());
    if (replace) {
      oldModel.dispose();
    }
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
    delete this.breakpointInfos[uri.toString()];
    delete this.breakpointDecorations[uri.toString()];
    if (this.lastTraceUri === uri) this.lastTraceUri = null;
    target.setValue("");
    target.dispose();
  }

  getCurrentBreakpoints() {
    return this.breakpointInfos[this.editor.getModel().uri.toString()];
  }

  showTrace(line: number) {
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