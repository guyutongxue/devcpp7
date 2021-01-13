import * as electron from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { execFile, spawn } from 'child_process';
import { getWindow, extraResourcesPath } from '../basicUtil'

function getExecutablePath(srcPath: string, ext: string = '.exe') {
  return path.join(path.dirname(srcPath), path.parse(srcPath).name + ext);
}

function isCompiled(srcPath: string): boolean {
  const exePath = getExecutablePath(srcPath);
  if (fs.existsSync(exePath)) {
    return fs.statSync(exePath).mtime > fs.statSync(srcPath).mtime;
  } else
    return false;
}

async function execCompiler(srcPath: string, noLink: boolean = true): Promise<{ success: boolean, stderr: string }> {
  let outputFileName: string;
  let args: string[];
  if (noLink) {
    outputFileName = getExecutablePath(srcPath, '.o');
    args = [
      '-c',
      srcPath,
      '-o',
      outputFileName,
      '-fdiagnostics-format=json',
    ]
  } else {
    outputFileName = getExecutablePath(srcPath);
    args = [
      srcPath,
      '-o',
      outputFileName,
    ]
  }
  return new Promise((resolve, reject) => {
    execFile(path.join(extraResourcesPath, 'mingw64/bin/g++.exe'), args, (error, stdout, stderr) => {
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

interface BuildResult { success: boolean, stage?: "compile" | "link", diagnostics: any[], linkerr?: string }

async function doCompile(srcPath: string): Promise<BuildResult> {
  // 
  // generate .o
  const compileResult = await execCompiler(srcPath);
  const diagnostics: any[] = JSON.parse(compileResult.stderr);
  if (!compileResult.success) {
    return {
      success: false,
      stage: "compile",
      diagnostics: diagnostics
    };
  }
  // generate .exe
  const linkResult = await execCompiler(getExecutablePath(srcPath, '.o'), false);
  if (!linkResult.success) {
    return {
      success: false,
      stage: "link",
      linkerr: linkResult.stderr,
      diagnostics: diagnostics
    };
  } else {
    // remove .o
    fs.unlinkSync(getExecutablePath(srcPath, '.o'));
    return {
      success: true,
      linkerr: linkResult.stderr,
      diagnostics: diagnostics
    };
  }
}

export async function build(event: electron.IpcMainEvent, arg: { path: string }) {
  const result = await doCompile(arg.path);
  getWindow().webContents.send('v:buildControl/compiled', result);
}

export async function runExe(event: electron.IpcMainEvent, arg: { path: string }) {
  console.log(arg.path);
  if (!isCompiled(arg.path)) {
    const result = await doCompile(arg.path);
    getWindow().webContents.send('v:buildControl/compiled', result);
    if (!result.success) return;
  }
  spawn('cmd.exe', [
    '/C',
    path.join(extraResourcesPath, 'bin/ConsolePauser.exe'),
    getExecutablePath(arg.path)
  ], {
    detached: true
  });
}