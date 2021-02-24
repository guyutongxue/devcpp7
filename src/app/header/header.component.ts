import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from '../core/services';
import { BuildService } from '../services/build.service';
import { DebugService } from '../services/debug.service';
import { FileService } from '../services/file.service';
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(
    private electronService: ElectronService,
    private statusService: StatusService,
    private fileService: FileService,
    private buildService: BuildService,
    private debugService: DebugService
  ) { }

  ngOnInit(): void {
  }
  
  fileNew(): void {
    this.fileService.new();
  }
  fileOpen(): void {
    this.fileService.open();
  }
  fileSave(): void {
    this.fileService.save();
  }
  fileSaveAs(): void {
    this.fileService.saveAs();
  }
  get fileSaveEnabled() {
    return this.statusService.saveEnabled;
  }

  buildBuild() {
    this.buildService.compile();
  }
  buildRunExe() {
    this.buildService.runExe();
  }

  debugStart() {
    this.debugService.startDebug();
  }
  debugExit() {
    this.debugService.exitDebug();
  }
  get debugEnabled() {
    return this.fileService.currentFileType() !== "none";
  }
  get isDebugging() {
    return this.statusService.isDebugging;
  }

  toggleDevTools() {
    this.electronService.ipcRenderer.invoke("window/toggleDevTools");
  }
}
