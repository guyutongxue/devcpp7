import { Component, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-file-control',
  templateUrl: './file-control.component.html',
  styleUrls: ['./file-control.component.scss']
})
export class FileControlComponent implements OnInit {

  constructor(
    private fileService: FileService,
    private statusService: StatusService
  ) { }

  get isSaveEnable() {
    return this.fileService.currentFileType() !== "none"
      && !this.statusService.isBuilding
      && !this.statusService.isDebugging;
  }

  ngOnInit(): void { }

  newFile() {
    this.fileService.new();
  }

  openFile() {
    this.fileService.open();
  }

  saveFile() {
    this.fileService.save();
  }
}
