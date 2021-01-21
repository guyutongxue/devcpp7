import { Injectable, EventEmitter } from '@angular/core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';

import { Tab } from './tabs.service'
import { ElectronService } from '../core/services';
import { StartLanguageServerResult } from '../../background/handlers/typing';

export const devCppClassicTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  colors: {
    'editor.background': '#ffffff',
    // 'editor.selectionBackground': '#000080', // https://github.com/microsoft/vscode/issues/36490
    // 'editor.selectionForeground': '#ffffff',
  },
  rules: [
    {
      token: '',
      foreground: '#000000',
      background: '#ffffff'
    },
    {
      token: 'string',
      foreground: '#0000ff',
      fontStyle: 'bold',
    },
    {
      token: 'keyword',
      foreground: '#000000',
      fontStyle: 'bold',
    },
    {
      token: "delimiter",
      foreground: '#ff0000',
      fontStyle: 'bold'
    },
    {
      token: 'number',
      foreground: '#800080',
    },
    {
      token: "comments",
      foreground: '#0078d7',
      fontStyle: 'italic'
    }
  ]
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  isInit = false;
  isLanguageClientStarted = false;
  eventEmitter: EventEmitter<string> = new EventEmitter();
  private editor: monaco.editor.IStandaloneCodeEditor;

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
        const languageClient = new MonacoLanguageClient({
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
        const disposable = languageClient.start();
        this.isLanguageClientStarted = true;
        connection.onClose(() => {
          this.isLanguageClientStarted = false;
          disposable.dispose();
        });
      }
    });
  }

  monacoInit(editor: monaco.editor.IStandaloneCodeEditor) {
    monaco.editor.defineTheme('devcpp-classic', devCppClassicTheme);
    monaco.editor.setTheme('devcpp-classic');
    this.editor = editor;
    this.isInit = true;
    this.eventEmitter.emit("initCompleted");
  }

  switchToModel(tab: Tab, disposeOld = false) {
    let uri = this.getUri(tab);
    let newModel = monaco.editor.getModel(uri) ?? monaco.editor.createModel(tab.code, 'cpp', uri);
    let oldModel = this.editor.getModel();
    this.editor.setModel(newModel);
    console.log('switch to ', uri.toString());
    newModel.onDidChangeContent(e => tab.saved = false);
    if (disposeOld) oldModel.dispose();
  }

  getCode() {
    return this.editor.getModel().getValue();
  }

  destroy(tab: Tab) {
    let uri = this.getUri(tab);
    console.log('destroy ', uri.toString());
    monaco.editor.getModel(uri).dispose();
  }

}
