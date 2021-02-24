import { getWebContents, typedIpcMain } from "../basicUtil";

typedIpcMain.handle('window/toggleDevTools', (_) => {
    getWebContents().toggleDevTools();
})