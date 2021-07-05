/**
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License.
 */

const http = require("http");
const url = require("url");
const net = require("net");
const ws = require("ws");
const express = require("express");
const rpc = require("@codingame/monaco-jsonrpc");
const lsp = require("vscode-languageserver");

/**
 *
 * @param {rpc.IWebSocket} socket
 * @param {string} serverPath
 * @param {NodeJS.ProcessEnv} env
 * @param {string[]} args
 */
function launch(socket, serverPath, env, args) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  const server = require("@codingame/monaco-jsonrpc/lib/server");
  const socketConnection = server.createConnection(reader, writer, () => socket.dispose());
  const serverConnection = server.createServerProcess('C++', serverPath, args, {
    env
  });
  server.forward(socketConnection, serverConnection, message => {
    if (rpc.isRequestMessage(message)) {
      if (message.method === lsp.InitializeRequest.type.method) {
        /** @type lsp.InitializeParams */
        const initializeParams = message.params;
        initializeParams.processId = process.pid;
      }
    }
    return message;
  });
}


console.log(process.argv);
// ["electron", "server.js", port, execPath, PATH, argv... ]
if (process.argv.length < 5) {
  console.log(`Usage: server.js <port> <execPath> <PATH> [<argv>...]`);
  process.exit(1);
}
const [port, execPath, PATH, ...serverArgs] = process.argv.slice(2);
if (!/^\+?(0|[1-9]\d*)$/.test(port)) { // not a port number
  console.log(`Port "${port}" invalid.`);
  process.exit(1);
}

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception: ', err.toString());
  if (err.stack) {
    console.error(err.stack);
  }
});

// create the express application
const app = express();
// server the static content, i.e. index.html
app.use(express.static(__dirname));
// start the server
const server = app.listen(port);
// create the web socket
const wss = new ws.Server({
  noServer: true,
  perMessageDeflate: false
});

/**
 *
 * @param {http.IncomingMessage} request
 * @param {net.Socket} socket
 * @param {Buffer} head
 */
const handler = (request, socket, head) => {
  const pathname = request.url ? url.parse(request.url).pathname : undefined;
  if (pathname === '/langServer') {
    wss.handleUpgrade(request, socket, head, webSocket => {
      /** @type rpc.IWebSocket */
      const socket = {
        send: content => webSocket.send(content, error => {
          if (error) {
            throw error;
          }
        }),
        onMessage: cb => webSocket.on('message', cb),
        onError: cb => webSocket.on('error', cb),
        onClose: cb => webSocket.on('close', cb),
        dispose: () => webSocket.close()
      };
      // launch the server when the web socket is opened
      if (webSocket.readyState === webSocket.OPEN) {
        launch(socket, execPath, { Path: PATH }, serverArgs);
      } else {
        webSocket.on('open', () => {
          launch(socket, execPath, { Path: PATH }, serverArgs);
        });
      }
    });
  }
}
server.on('upgrade', handler);
