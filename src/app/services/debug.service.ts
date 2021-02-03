import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GdbResponse } from 'tsgdbmi';
import { ElectronService } from '../core/services/electron/electron.service';
import { SendRequestOptions, SendRequestResult } from '../../background/handlers/typing';
import { EditorService } from './editor.service';
import { FileService } from './file.service';
import { debounceTime } from 'rxjs/operators';

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

  // use this subject to set rate limit of "running"/"stopped" event.
  private traceLine: Subject<{ file?: string, line?: number }> = new Subject();

  constructor(
    private electronService: ElectronService,
    private fileService: FileService,
    private editorService: EditorService) {
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', async () => {
      this.consoleOutput.next("");
      for (const breakline of this.editorBreakpoints) {
        await this.sendMiRequest(`-break-insert "${escape(this.sourcePath)}:${breakline}"`);
      }
      await this.sendMiRequest("-exec-run");
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging.next(false);
      this.traceLine.next({});
    });
    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = descape(response.payload as string);
      this.consoleOutput.next(this.allOutput += newstr);
    });
    this.electronService.ipcRenderer.on('ng:debug/notify', (_, response: GdbResponse) => {
      if (response.message === "running") {
        // Program is running (continue or init start or restart)
        this.isDebugging.next(true);
        this.traceLine.next({});
      } else if (response.message === "stopped") {
        const reason = response.payload["reason"] as string;
        if (reason.startsWith("exited")) {
          // Program exited. Stop debugging
          this.sendMiRequest("-gdb-exit");
          this.isDebugging.next(false);
          this.traceLine.next({});
        } else if (["breakpoint-hit", "end-stepping-range", "function-finished"].includes(reason)) {
          // Program stopped during step-by-step debugging
          console.log(response.payload);
          if ("file" in response.payload["frame"]) {
            const stopFile = response.payload["frame"]["file"] as string;
            const stopLine = Number.parseInt(response.payload["frame"]["line"] as string);
            this.traceLine.next({ file: stopFile, line: stopLine });
          }
        }
      } else {
        console.log(response);
      }
    });
    this.traceLine.pipe(
      debounceTime(100)
    ).subscribe(value => {
      if (typeof value.file === "undefined") this.editorService.hideTrace();
      else this.fileService.locate(value.file, value.line, 1, "debug");
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

  debugContinue() {
    return this.sendMiRequest("-exec-continue");
  }
  debugStepover() {
    return this.sendMiRequest("-exec-next");
  }
  debugStepinto() {
    return this.sendMiRequest("-exec-step");
  }
  debugStepout() {
    return this.sendMiRequest("-exec-finish");
  }
  debugRestart() {
    return this.sendMiRequest("-exec-run");
  }
}
