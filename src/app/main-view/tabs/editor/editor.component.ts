import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import ReconnectingWebSocket from 'reconnecting-websocket';

import { TabsService } from '../../../services/tabs.service'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: "cpp",
    theme: "vs-light"
  };
  key: string;
  code: string;
  editor: monaco.editor.IStandaloneCodeEditor;

  constructor(private route: ActivatedRoute,
    private tabsService: TabsService) { }


  private keyOnChange(key: string) {
    this.key = key;
    this.code = this.tabsService.getByKey(key).value.code;
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      this.keyOnChange(routeParams['key']);
    });
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    console.log(this.editor);
    this.editor.setModel(monaco.editor.createModel(this.code, 'cpp', monaco.Uri.parse('file:///1.cpp')));
    MonacoServices.install(require('monaco-editor-core/esm/vs/platform/commands/common/commands').CommandsRegistry);
    // create the web socket
    const url = this.createUrl();
    const webSocket = this.createWebSocket(url) as any;
    // listen when the web socket is opened
    console.log("Hello");
    listen({
      webSocket,
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
      maxRetries: 8,
      debug: false
    };
    return new ReconnectingWebSocket(socketUrl, [], socketOptions) as any;
  }
}
