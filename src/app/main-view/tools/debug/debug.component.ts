import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {

  constructor(private electronService: ElectronService) { }

  ngOnInit(): void {
  }

  startDebug() {
    this.electronService.ipcRenderer.send('debug/start', { srcPath: 'C:\\Users\\Guyutongxue\\Downloads\\a.cpp' });
  }

  exitDebug() {
    this.electronService.ipcRenderer.send('debug/exit');
  }

}
