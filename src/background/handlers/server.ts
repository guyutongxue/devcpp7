import * as child_process from 'child_process';
import * as path from 'path';
import * as getPort from 'get-port';
import * as electron from 'electron';

import { extraResourcesPath } from '../basicUtil';
import { StartLanguageServerResult } from './typing'

async function doStart() {
    const port = await getPort({ port: 3000 });
    const process = child_process.fork(
        path.resolve(__dirname, '../server/server.js'),
        [
            port.toString(),
            path.join(extraResourcesPath, 'mingw64/bin/clangd.exe'),
            `--compile-commands-dir=${path.join(extraResourcesPath, 'anon_workspace')}`,
            // `--log=verbose`
        ],
        {
            stdio: "ignore"
        }
    );
    return { port, process };
}

export async function startLanguageServer(event: electron.IpcMainEvent, arg: any) {
    console.log("Starting language server...")
    const result = await doStart();
    global['langServerProcess'] = result.process;
    console.log("done");
    event.returnValue = {
        port: result.port
    } as StartLanguageServerResult;
}

export async function stopLanguageServer(event: electron.IpcMainEvent, arg: any) {
    if (global['langServerProcess'] !== null) {
        const pid: child_process.ChildProcess = global['langServerProcess'];
        pid.kill();
    }
} 