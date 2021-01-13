import { Component, OnInit } from '@angular/core';

import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-control',
  templateUrl: './file-control.component.html',
  styleUrls: ['./file-control.component.scss']
})
export class FileControlComponent implements OnInit {

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
  }

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
