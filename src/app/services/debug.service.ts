import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GdbResponse } from 'tsgdbmi';
import { ElectronService } from '../core/services/electron/electron.service';
import { SendRequestOptions, SendRequestResult } from '../../background/handlers/typing';
import { EditorService } from './editor.service';

function descape(src: string) {
  let result = "";
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\\') {
      i++;
      switch (src[i]) {
        case '\\': result += '\\'; break;
        case '"': result += '"'; break;
        case 'n': result += '\n'; break;
        case 't': result += '\t'; break;
      }
    } else {
      result += src[i];
    }
  }
  return result;
}

function escape(src: string) {
  return src.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  private isDebugging: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDebugging$: Observable<boolean> = this.isDebugging.asObservable();

  private allOutput: string = "";
  private consoleOutput: BehaviorSubject<string> = new BehaviorSubject("");
  consoleOutput$: Observable<string> = this.consoleOutput.asObservable();

  private sourcePath: string;
  private editorBreakpoints: number[] = [];

  constructor(private electronService: ElectronService, private editorService: EditorService) {
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', async () => {
      this.consoleOutput.next("");
      for (const breakline of this.editorBreakpoints) {
        await this.sendMiRequest(`-break-insert "${escape(this.sourcePath)}:${breakline}"`);
      }
      await this.sendMiRequest("-exec-run");
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging.next(false);
    });
    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = descape(response.payload as string);
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

  startDebug(srcPath: string) {
    this.sourcePath = srcPath;
    this.editorBreakpoints = this.editorService.getBreakpoints();
    this.electronService.ipcRenderer.send('debug/start', {
      srcPath: this.sourcePath
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
