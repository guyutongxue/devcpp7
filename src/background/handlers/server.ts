import * as child_process from 'child_process';
import * as path from 'path';
import * as getPort from 'get-port';

import { extraResourcesPath, typedIpcMain } from '../basicUtil';

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

typedIpcMain.handle('langServer/start', async (_) => {
    console.log("Starting language server...")
    const result = await doStart();
    global['langServerProcess'] = result.process;
    console.log("done");
    return {
        port: result.port
    };
});

typedIpcMain.handle('langServer/stop', (_) => {
    if (global['langServerProcess'] !== null) {
        const pid: child_process.ChildProcess = global['langServerProcess'];
        pid.kill();
    }
});