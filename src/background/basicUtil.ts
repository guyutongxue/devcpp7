import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isAsar from 'electron-is-running-in-asar';

// very stupid to import a package, but useful.
export const extraResourcesPath =
  !isAsar()
    ? path.join(__dirname, '../extraResources')
    : path.join((process as any).resourcesPath, 'extraResources');

export function getWindow(): BrowserWindow {
  return global["win"] as BrowserWindow;
}