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

  constructor(private electronService: ElectronService) { }

  private getUri(tab: Tab): monaco.Uri {
    let uri = tab.type + "://";
    if (tab.path === null) uri += '/anon_workspace/' + tab.title;
    else uri += '/' + tab.path.replace(/\\/g, '/');
    return monaco.Uri.parse(uri);
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
        // console.log("Open definition for:", input);
        // console.log("Corresponding model:",);
        console.log("Source: ", source);
        // source.setModel(monaco.editor.getModel(input.resource));
      }
      return result;
    };
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
    this.isInit = true;
    this.editorMessage.next({ type: "initCompleted" });
  }

  switchToModel(tab: Tab, disposeOld: boolean = false) {
    let uri = this.getUri(tab);
    let newModel = monaco.editor.getModel(uri);
    if (newModel === null) {
      newModel = monaco.editor.createModel(tab.code, 'cpp', uri);
      newModel.onDidChangeContent(_ => {
        tab.saved = false;
        this.editorText.next(newModel.getValue());
      });
    }
    let oldModel = this.editor.getModel();
    this.editor.setModel(newModel);
    console.log('switch to ', uri.toString());
    this.editorText.next(newModel.getValue());
    if (disposeOld) oldModel.dispose();
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
    target.setValue("");
    target.dispose();
  }

}