import { Injectable } from '@angular/core';
import { ElectronService } from '../core/services/electron/electron.service'

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  isDebugging: boolean = false;

  constructor(private electronService: ElectronService) { 
    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', () => {
      this.isDebugging = true;
    });
    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.isDebugging = false;
    })
  }

  startDebug(srcPath: string) {
    this.electronService.ipcRenderer.send('debug/start', {
      srcPath: srcPath
    });
  }
  exitDebug() {
    this.electronService.ipcRenderer.send('debug/exit');
  }
}
