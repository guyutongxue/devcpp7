import { GdbController } from "tsgdbmi";
import { IpcMainEvent } from 'electron';
import * as path from 'path';

import { doCompile } from './build';
import { extraResourcesPath, getWindow } from '../basicUtil';


const gdb = new GdbController();
// gdb.onResponse((response) => {
//     // console.log(response);
// })
const gdbPath = path.join(extraResourcesPath, 'mingw64/bin/gdb.exe');
const startupCommand = [
    '-gdb-set new-console on',
    '-enable-pretty-printing'
]

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
    for (const command of startupCommand) {
        console.log(await gdb.sendRequest(command));
    }
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
    console.log("exit");
    event.returnValue = {
        success: true
    }
}