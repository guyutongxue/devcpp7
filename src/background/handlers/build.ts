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

import * as path from 'path';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import { execFile, spawn } from 'child_process';
import { extraResourcesPath, typedIpcMain, getWebContents, store } from '../basicUtil';
import { GccDiagnostics, BuildResult } from '../ipcTyping';
import { ioEncoding } from './constants';

// function encode(src: string) {
//   return encodeURIComponent(src);
// }

function changeExt(srcPath: string, ext: string) {
  return path.join(path.dirname(srcPath), path.parse(srcPath).name + ext);
}

function getExecutablePath(srcPath: string) {
  return path.join(path.dirname(srcPath), path.parse(srcPath).name + ".exe");
}

function isCompiled(srcPath: string): boolean {
  const exePath = getExecutablePath(srcPath);
  if (fs.existsSync(exePath)) {
    return fs.statSync(exePath).mtime > fs.statSync(srcPath).mtime;
  } else
    return false;
}

interface ExecCompilerResult {
  success: boolean,
  stderr: string
}

function parseDynamic(arg: string): string {
  if (arg.startsWith('DYN')) {
    const argval = arg.substr(3);
    if (argval === "-fexec-charset") {
      // -fexec-charset=GBK
      return argval + '=' + store.get('advanced.ioEncoding');
    } else throw new Error("unknown dynamic option");
  } else return arg;
}

async function execCompiler(srcPath: string, noLink: boolean, debugInfo: boolean): Promise<ExecCompilerResult> {
  let outputFileName: string;
  const cwd = path.dirname(srcPath);
  let args: string[];
  if (noLink) {
    outputFileName = path.basename(changeExt(srcPath, '.o'));
    args = [
      ...store.get('build.compileArgs').map(parseDynamic),
      ...(debugInfo ? ['-g'] : []),
      '-c',
      srcPath,
      '-o',
      outputFileName,
      '-fdiagnostics-format=json',
    ]
  } else {
    outputFileName = path.basename(getExecutablePath(srcPath));
    args = [
      ...store.get('build.compileArgs').map(parseDynamic),
      srcPath,
      '-o',
      outputFileName,
    ]
  }
  return new Promise((resolve, _) => {
    execFile(path.join(extraResourcesPath, 'mingw64/bin/g++.exe'), args, {
      cwd: cwd,
      encoding: 'buffer',
      env: {
        Path: process.env.Path + (path.delimiter + path.join(extraResourcesPath, 'mingw64/bin'))
      }
    }, (error, _, stderrBuf) => {
      const stderr = iconv.decode(stderrBuf, ioEncoding);
      if (error) {
        resolve({
          success: false,
          stderr
        });
      } else {
        resolve({
          success: true,
          stderr
        });
      }
    });
  });
}



export async function doCompile(srcPath: string, debugInfo = false): Promise<BuildResult> {
  getWebContents().send('ng:build/buildStarted');
  //
  // generate .o
  const compileResult = await execCompiler(srcPath, true, debugInfo);
  let diagnostics: GccDiagnostics = [];
  try {
    diagnostics = JSON.parse(compileResult.stderr);
  } catch (e) {
    return {
      success: false,
      stage: "unknown",
      diagnostics: diagnostics,
      what: {
        error: e,
        stderr: compileResult.stderr
      }
    };
  }
  if (!compileResult.success) {
    return {
      success: false,
      stage: "compile",
      diagnostics: diagnostics
    };
  }
  // generate .exe
  const linkResult = await execCompiler(changeExt(srcPath, '.o'), false, debugInfo);
  if (!linkResult.success) {
    return {
      success: false,
      stage: "link",
      linkerr: linkResult.stderr,
      diagnostics: diagnostics
    };
  } else {
    // remove .o
    fs.unlinkSync(changeExt(srcPath, '.o'));
    return {
      success: true,
      linkerr: linkResult.stderr,
      diagnostics: diagnostics,
      output: getExecutablePath(srcPath)
    };
  }
}

typedIpcMain.handle('build/build', async (_, arg) => {
  console.log("Receive build request. Compiling");
  const result = await doCompile(arg.path);
  console.log("Compilation finish. Returning value");
  getWebContents().send('ng:build/buildComplete', result);
});

typedIpcMain.handle('build/runExe', async (_, arg) => {
  console.log(arg.path);
  console.log(getExecutablePath(arg.path));
  if (arg.forceCompile || !isCompiled(arg.path)) {
    const result = await doCompile(arg.path);
    getWebContents().send('ng:build/buildComplete', result);
    if (!result.success) return;
  }
  const cpPath = path.join(extraResourcesPath, 'bin/ConsolePauser.exe');
  // https://github.com/nodejs/node/issues/7367#issuecomment-229721296
  const result = spawn(JSON.stringify(cpPath), [
    getExecutablePath(arg.path)
  ], {
    detached: true,
    shell: true,
    cwd: path.dirname(arg.path)
  });
  console.log(result.pid);
  result.on('error', console.error);
  result.on('exit', () => console.log('exit'));
});
