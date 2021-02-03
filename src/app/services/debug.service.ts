import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GdbResponse } from 'tsgdbmi';
import { ElectronService } from '../core/services/electron/electron.service';
import { SendRequestOptions, SendRequestResult } from '../../background/handlers/typing';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  private isDebugging: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDebugging$: Observable<boolean> = this.isDebugging.asObservable();

  private allOutput: string = "";
  private consoleOutput: BehaviorSubject<string> = new BehaviorSubject("");
  consoleOutput$: Observable<string> = this.consoleOutput.asObservable();

  constructor(private electronService: ElectronService) {
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', async () => {
      this.consoleOutput.next("");
      await this.sendMiRequest("-break-insert main");
      await this.sendMiRequest("-exec-run");
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging.next(false);
    });
    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = this.descape(response.payload as string);
      this.consoleOutput.next(this.allOutput += newstr);
    });
    this.electronService.ipcRenderer.on('ng:debug/notify', (_, response: GdbResponse) => {
      console.log(response);
      if (response.message === "running") {
        this.isDebugging.next(true);
      }
      if (response.message === "stopped" && (response.payload["reason"] as string).startsWith("exited")) {
        this.sendMiRequest("-gdb-exit");
        this.isDebugging.next(false);
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
    return this.electronService.ipcRenderer.invoke('debug/sendRequest', <SendRequestOptions>{
      type: "cli",
      command: command
    }) as Promise<SendRequestResult>;
  }
}
