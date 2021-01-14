import { Injectable } from '@angular/core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import * as path from 'path';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { Tab } from './tabs.service'

export const devCppClassicTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  colors: {},
  rules: [
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
  private isInit = false;
  private editor : monaco.editor.IStandaloneCodeEditor;

  constructor() { }

  private getUri(tab: Tab): monaco.Uri {
    let uri = tab.type + "://";
    if (tab.path === null) uri += '/anon_workspace/' + tab.title;
    else uri += path.join('/', tab.path.replace(/\\/g, '/'));
    console.log(uri);
    return monaco.Uri.parse(uri);
  }

  startLanguageClient(port: number) {
    if (!this.isInit) return;
    MonacoServices.install(require('monaco-editor-core/esm/vs/platform/commands/common/commands').CommandsRegistry);
    // create the web socket
    const socketUrl = `ws://localhost:${port}/langServer`;
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
        connection.onClose(() => disposable.dispose());
      }
    });
  }

  monacoInit(editor: monaco.editor.IStandaloneCodeEditor) {
    monaco.editor.defineTheme('devcpp-classic', devCppClassicTheme);
    monaco.editor.setTheme('devcpp-classic');
    this.editor = editor;
    this.isInit = true;
  }

  switchToModel(tab: Tab, disposeOld = false) {
    let uri = this.getUri(tab);
    let newModel = monaco.editor.getModel(uri) ?? monaco.editor.createModel(tab.code, 'cpp', uri);
    let oldModel = this.editor.getModel();
    this.editor.setModel(newModel);
    if (disposeOld) oldModel.dispose();
  }

  getCode() {
    return this.editor.getModel().getValue();
  }

}
