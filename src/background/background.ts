import * as child_process from 'child_process';
import * as path from 'path';
import { extraResourcesPath } from './basicUtil'

// Start language server
child_process.fork(
    path.resolve(__dirname, 'server/server.js'),
    [
        '3000',
        path.join(extraResourcesPath, 'mingw64/bin/clangd.exe'),
        `--compile-commands-dir=${path.join(extraResourcesPath, 'anon_workspace')}`
    ],
    {
        stdio: "ignore"
    }
);

// Hook all handlers
require('./handlers/main.js');