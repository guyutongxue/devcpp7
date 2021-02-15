import { Injectable } from '@angular/core';

import { DebugService } from './debug.service';
import { BuildService } from './build.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  statusMessage: BehaviorSubject<string> = new BehaviorSubject("");
  isDebugging: boolean = false;
  isBuilding: boolean = false;

  constructor(
    debugService: DebugService,
    buildService: BuildService
  ) { 
    debugService.isDebugging$.subscribe(v => this.isDebugging = v);
    buildService.isBuilding$.subscribe(v => this.isBuilding = v);
  }
}
