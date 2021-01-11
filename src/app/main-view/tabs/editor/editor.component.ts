import { Component, OnInit } from '@angular/core';
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import ReconnectingWebSocket from 'reconnecting-websocket';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: "cpp",
    theme: "vs-light"
  };
  code: string = '#include <iostream>\nint main() {\n    std::cout << "Hello, world!" << std::endl;\n}';

  constructor() { }

  ngOnInit(): void {
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.setModel(monaco.editor.createModel(this.code, 'cpp', monaco.Uri.parse('file:///1.cpp')));
    MonacoServices.install(require('monaco-editor-core/esm/vs/platform/commands/common/commands').CommandsRegistry);
    // create the web socket
    const url = this.createUrl();
    const webSocket = this.createWebSocket(url) as any;
    // listen when the web socket is opened
    console.log("Hello");
    listen({
      webSocket ,
      onConnection: (connection: MessageConnection) => {
        // create and start the language client
        const languageClient = this.createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      }
    });
  }

  public createUrl(): string {
        return 'ws://localhost:3000/langServer';
  }

  public createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
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
  }

  public createWebSocket(socketUrl: string): WebSocket {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false
    };
    return new ReconnectingWebSocket(socketUrl, [], socketOptions) as any;
  }
}
