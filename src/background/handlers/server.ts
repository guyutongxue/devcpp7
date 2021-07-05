// Copyright (C) 2021 Guyutongxue
//
// This file is part of Dev-C++ 7.
//
// Dev-C++ 7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dev-C++ 7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dev-C++ 7.  If not, see <http://www.gnu.org/licenses/>.

import * as child_process from 'child_process';
import * as path from 'path';
import * as getPort from 'get-port';

import { extraResourcesPath, typedIpcMain } from '../basicUtil';


async function doStart() {
  const port = await getPort({ port: 3000 });
  const process = child_process.fork(
    path.join(__dirname, 'server/server.js'),
    [
      port.toString(),
      path.join(extraResourcesPath, 'clangd/bin/clangd.exe'),
      path.join(extraResourcesPath, 'mingw64/bin'),
      // `--compile-commands-dir=${path.join(extraResourcesPath, 'anon_workspace')}`,
      // `--log=verbose`
    ],
    {
      stdio: "ignore"
    }
  );
  return { port, process };
}

function getServerProc(): child_process.ChildProcess | null {
  return global['langServerProcess'];
}
function setServerProc(proc: child_process.ChildProcess | null) {
  global['langServerProcess'] = proc;
}

typedIpcMain.handle('langServer/start', async (_) => {
  console.log("Starting language server...")
  const result = await doStart();
  console.log("done");
  setServerProc(result.process);
  result.process.addListener('close', () => setServerProc(null));
  return {
    port: result.port
  };
});

typedIpcMain.handle('langServer/stop', (_) => {
  const proc = getServerProc();
  if (proc !== null) {
    proc.kill();
  }
});
