import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GdbResponse } from 'tsgdbmi'
import { ElectronService } from '../core/services/electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  isDebugging: boolean = false;

  private allOutput: string = "";
  consoleOutput: BehaviorSubject<string> = new BehaviorSubject("");

  constructor(private electronService: ElectronService) { 
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', () => {
      this.isDebugging = true;
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging = false;
    });
    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = this.descape(response.payload as string);
      this.consoleOutput.next(this.allOutput += newstr);
    })
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
    this.electronService.ipcRenderer.send('debug/sendRequest', {
      command: command
    });
  }
}
