import { Component, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';
import { BuildService } from '../../services/build.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(
    private fileService: FileService,            // save file before compile
    private buildService: BuildService
  ) { }

  get enabled() {
    return this.fileService.currentFileType() !== "none";
  }

  get isCompiling() {
    return this.buildService.isCompiling;
  }

  ngOnInit(): void { }

  compile() {
    this.buildService.compile();
  }

  runExe() {
    this.buildService.runExe();
  }
}
