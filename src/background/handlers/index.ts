import { ipcMain } from 'electron';

import { saveFile, saveAsFile, openFile } from './file';
import { build, runExe } from './build';
import { startLanguageServer, stopLanguageServer } from './server'
import { exitDebugger, sendRequest, startDebugger } from './debug';
import { toggleDevTools } from './window';

ipcMain.on('file/save', saveFile);
ipcMain.on('file/saveAs', saveAsFile);
ipcMain.on('file/open', openFile);

ipcMain.on('build/build', build);
ipcMain.on('build/runExe', runExe);

ipcMain.on('langServer/start', startLanguageServer);
ipcMain.on('langServer/stop', stopLanguageServer);

ipcMain.on('debug/start', startDebugger);
ipcMain.on('debug/exit', exitDebugger);
ipcMain.on('debug/sendRequest', sendRequest);

ipcMain.on('window/toggleDevTools', toggleDevTools)