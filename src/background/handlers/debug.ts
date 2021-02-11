import { GdbController } from "tsgdbmi";
import { IpcMainEvent } from 'electron';
import * as path from 'path';

import { doCompile } from './build';
import { extraResourcesPath, getWindow } from '../basicUtil';
import { SendRequestOptions, SendRequestResult } from './typing';
import { ioEncoding } from "./constants";

const gdb = new GdbController(ioEncoding);
gdb.onResponse(response => {
    switch (response.type) {
        case "console":
            getWindow().webContents.send('ng:debug/console', response);
            break;
        case "notify":
            getWindow().webContents.send('ng:debug/notify', response);
            getWindow().focus();
            break;
        case "result":
            getWindow().webContents.send('ng:debug/result', response);
            break;
        default:
            break;
    }
});
gdb.onClose(() => {
    getWindow().webContents.send('ng:debug/debuggerClosed');
});
const gdbPath = path.join(extraResourcesPath, 'mingw64/bin/gdb.exe');
const startupCommand = [
    '-gdb-set new-console on',
    '-enable-pretty-printing'
];

export async function startDebugger(event: IpcMainEvent, arg: { srcPath: string }) {
    
    const result = await doCompile(arg.srcPath);
    getWindow().webContents.send('ng:build-control/buildComplete', result);
    if (!result.success) {
        event.returnValue = {
            success: false,
            reason: "Compilation failed."
        }
        return;
    }
    if (gdb.isRunning) {
        event.returnValue = {
            success: false,
            reason: "GDB is already running."
        }
        return;
    };
    const cwd = path.dirname(result.output);
    const filename = path.basename(result.output);
    gdb.launch(gdbPath, [filename], {
        cwd: cwd
    });
    try {
        for (const command of startupCommand) {
            const response = await gdb.sendRequest(command);
            if (response.message === "error") {
                event.returnValue = {
                    success: false,
                    reason: `Startup command '${command}' execution failed`
                };
                return;
            }
        }
    } catch (e) {
        event.returnValue = {
            success: false,
            error: e
        } as SendRequestResult;
        return;
    }
    getWindow().webContents.send('ng:debug/debuggerStarted');
    event.returnValue = {
        success: true
    }
}

export async function exitDebugger(event: IpcMainEvent) {
    if (!gdb.isRunning) {
        event.returnValue = {
            success: false,
            reason: "GDB not started."
        }
    }
    gdb.exit();
    event.returnValue = {
        success: true
    }
}

export function sendRequest(event: IpcMainEvent, arg: SendRequestOptions): void {
    if (!gdb.isRunning) {
        event.returnValue = {
            success: false,
            message: "GDB not started"
        } as SendRequestResult;
        return;
    }
    try {
        console.log("request: " + arg.command);
        gdb.sendRequest(arg.command, false);
        // console.log("result: ", result);
        event.returnValue = { success: true } as SendRequestResult;
        return;
    } catch (e) {
        event.returnValue = {
            success: false,
            error: e
        } as SendRequestResult;
        return;
    }
}