import { saveFile, saveAsFile, openFile } from './file';
import { build, runExe } from './build';
import { ipcMain } from 'electron';

ipcMain.on('file/save', saveFile);
ipcMain.on('file/saveAs', saveAsFile);
ipcMain.on('file/open', openFile);

ipcMain.on('build/build', build);
ipcMain.on('build/runExe', runExe);