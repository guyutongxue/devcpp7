import { GdbController } from "tsgdbmi";
import * as path from 'path';

import { doCompile } from './build';
import { extraResourcesPath, getWebContents, getWindow, typedIpcMain } from '../basicUtil';
import { ioEncoding } from "./constants";

const gdb = new GdbController(ioEncoding);
gdb.onResponse(response => {
    switch (response.type) {
        case "console":
            getWebContents().send('ng:debug/console', response);
            break;
        case "notify":
            getWebContents().send('ng:debug/notify', response);
            getWindow().focus();
            break;
        case "result":
            getWebContents().send('ng:debug/result', response);
            break;
        default:
            break;
    }
});
gdb.onClose(() => {
    getWebContents().send('ng:debug/debuggerStopped');
});
const gdbPath = path.join(extraResourcesPath, 'mingw64/bin/gdb.exe');
const startupCommand = [
    '-gdb-set new-console on',
    '-enable-pretty-printing'
];

typedIpcMain.handle('debug/start', async (_, arg) => {
    const result = await doCompile(arg.srcPath);
    getWebContents().send('ng:build/buildComplete', result);
    if (!result.success) {
        return {
            success: false,
            error: "Compilation failed."
        }
    }
    if (gdb.isRunning) {
        return {
            success: false,
            error: "GDB is already running."
        }
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
                return {
                    success: false,
                    error: `Startup command '${command}' execution failed`
                };
            }
        }
    } catch (e) {
        return {
            success: false,
            error: e
        }
    }
    getWebContents().send('ng:debug/debuggerStarted');
    return {
        success: true
    }
});

typedIpcMain.handle('debug/exit', (_) => {
    if (!gdb.isRunning) {
        return;
    }
    gdb.exit();
});

typedIpcMain.handle('debug/sendRequest', (_, arg) => {
    if (!gdb.isRunning) {
        return {
            success: false,
            error: "GDB not started"
        };
    }
    try {
        console.log("request: " + arg.command);
        gdb.sendRequest(arg.command, false);
        return {
            success: true
        };
    } catch (e) {
        return {
            success: false,
            error: e
        };
    }
});