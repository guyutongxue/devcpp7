import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GdbResponse } from 'tsgdbmi';
import { ElectronService } from '../core/services/electron/electron.service';
import { SendRequestOptions, SendRequestResult } from '../../background/handlers/typing';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  isDebugging: boolean = false;

  private allOutput: string = "";
  consoleOutput: BehaviorSubject<string> = new BehaviorSubject("");

  constructor(private electronService: ElectronService) {
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', async () => {
      await this.sendMiRequest("-break-insert main");
      await this.sendMiRequest("-exec-run");
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging = false;
    });
    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = this.descape(response.payload as string);
      this.consoleOutput.next(this.allOutput += newstr);
    });
    this.electronService.ipcRenderer.on('ng:debug/notify', (_, response: GdbResponse) => {
      console.log(response);
      if (response.message === "running") {
        this.isDebugging = true;
      }
      if (response.message === "stopped" && (response.payload["reason"] as string).startsWith("exited")) {
        this.sendMiRequest("-gdb-exit");
        this.isDebugging = false;
      }
    })
  }
  private sendMiRequest(command: string) {
    return this.electronService.ipcRenderer.invoke("debug/sendRequest", <SendRequestOptions>{
      type: "mi",
      command: command
    }) as Promise<SendRequestResult>;
  }

  private descape(src: string) {
    return src.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
  }

  startDebug(srcPath: string) {
    this.electronService.ipcRenderer.send('debug/start', {
      srcPath: srcPath
    });
  }
  exitDebug() {
    this.electronService.ipcRenderer.send('debug/exit');
  }

  sendCommand(command: string) {
    this.electronService.ipcRenderer.invoke('debug/sendRequest', <SendRequestOptions>{
      type: "cli",
      command: command
    }) as Promise<SendRequestResult>;
  }
}
