/**
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io)
 * Original file licensed under the MIT License.
 */

import * as http from "http";
import * as url from "url";
import * as net from "net";
import * as ws from "ws";
import * as express from "express";
import * as rpc from "@codingame/monaco-jsonrpc";
import { launch } from "./server-launcher";

console.log(process.argv);
// ["elecetron", "server.js", port, exec, argv... ]
let argv: string[] = process.argv.slice(2);
if (argv.length < 2) {
    console.log(`Usage: server.ts <port> <langserver> [<argv>...]`);
    process.exit(1);
}
if (!/^\+?(0|[1-9]\d*)$/.test(argv[0])) { // not a port number
    console.log(`Port "${argv[0]}" invalid.`);
    process.exit(1);
}

process.on('uncaughtException', function (err: any) {
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
const server = app.listen(3000);
// create the web socket
const wss = new ws.Server({
    noServer: true,
    perMessageDeflate: false
});
server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === '/langServer') {
        wss.handleUpgrade(request, socket, head, webSocket => {
            const socket: rpc.IWebSocket = {
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
                launch(socket, argv[1], argv.slice(2));
            } else {
                webSocket.on('open', () => launch(socket, argv[1], argv.slice(2)));
            }
        });
    }
})