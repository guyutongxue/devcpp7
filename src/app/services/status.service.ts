import { Injectable } from '@angular/core';

import { DebugService } from './debug.service';
import { BuildService } from './build.service';
import { BehaviorSubject } from 'rxjs';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  statusMessage: BehaviorSubject<string> = new BehaviorSubject("");
  isDebugging: boolean = false;
  isBuilding: boolean = false;

  constructor(
    private fileService: FileService,
    private debugService: DebugService,
    private buildService: BuildService
  ) { 
    this.debugService.isDebugging$.subscribe(v => this.isDebugging = v);
    this.buildService.isBuilding$.subscribe(v => this.isBuilding = v);
  }

  get saveEnabled() {
    return this.fileService.currentFileType() !== "none" && !this.isDebugging && !this.isBuilding;
  }
}
