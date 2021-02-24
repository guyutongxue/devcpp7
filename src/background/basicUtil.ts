import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron';
import * as isAsar from 'electron-is-running-in-asar';
import { TypedIpcMain, TypedWebContents } from 'electron-typed-ipc';

import { IpcEvents, IpcCommands } from '../app/core/ipcTyping'

// very stupid to import a package, but useful.
export const extraResourcesPath =
  !isAsar()
    ? path.join(__dirname, '../extraResources')
    : path.join((process as any).resourcesPath, 'extraResources');

export function getWindow(): BrowserWindow {
  return global["win"] as BrowserWindow;
}
export function getWebContents(): TypedWebContents<IpcEvents> {
  return getWindow().webContents;
}

export const typedIpcMain = ipcMain as TypedIpcMain<IpcEvents, IpcCommands>