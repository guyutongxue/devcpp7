import { Component, OnInit } from '@angular/core';

import { BuildService } from '../../services/build.service';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(
    private buildService: BuildService,
    private statusService: StatusService
  ) { }

  get enabled() {
    return this.statusService.saveEnabled;
  }

  ngOnInit(): void { }

  compile() {
    this.buildService.compile();
  }

  runExe() {
    this.buildService.runExe();
  }
}
