// Copyright (C) 2021 Guyutongxue
// 
// This file is part of Dev-C++ 7.
// 
// Dev-C++ 7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Dev-C++ 7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Dev-C++ 7.  If not, see <http://www.gnu.org/licenses/>.

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
    return this.statusService.saveEnabled;
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
