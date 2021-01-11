import * as child_process from 'child_process';
import * as path from 'path';
import * as isAsar from 'electron-is-running-in-asar';

// very stupid to import a package, but useful.
const extraResourcesPath =
  !isAsar()
    ? path.join(__dirname, '../extraResources')
    : path.join((process as any).resourcesPath, 'extraResources');

child_process.fork(
    path.resolve(__dirname, 'server/server.js'),
    [
        '3000',
        path.join(extraResourcesPath, 'clangd_11.0.0/bin/clangd.exe'),
        `--compile-commands-dir=${path.join(extraResourcesPath)}`
    ]
);