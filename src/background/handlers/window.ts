import { getWebContents, getWindow, typedIpcMain } from "../basicUtil";

typedIpcMain.handle('window/toggleDevTools', (_) => {
    getWebContents().toggleDevTools();
});

typedIpcMain.handle('window/setTitle', (_, title) => {
    if (title === "") getWindow().setTitle('Dev-C++ 7');
    else getWindow().setTitle(title + ' - Dev-C++ 7');
})