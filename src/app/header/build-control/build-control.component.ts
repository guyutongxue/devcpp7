import { Component, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';
import { BuildService } from '../../services/build.service';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(
    private fileService: FileService,            // save file before compile
    private buildService: BuildService,
    private statusService: StatusService
  ) { }

  get enabled() {
    return this.fileService.currentFileType() !== "none";
  }

  get isBuildingOrDebugging() {
    return this.statusService.isBuilding || this.statusService.isDebugging;
  }

  ngOnInit(): void { }

  compile() {
    this.buildService.compile();
  }

  runExe() {
    this.buildService.runExe();
  }
}
