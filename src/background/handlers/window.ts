import { IpcMainEvent } from "electron/main";
import { getWindow } from "../basicUtil";

export function toggleDevTools(_: IpcMainEvent) {
    getWindow().webContents.toggleDevTools();
}