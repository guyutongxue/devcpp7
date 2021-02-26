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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Command } from '../services/status.service';
import { DropdownList } from './header-dropdown/header-dropdown.component';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  readonly commandList: {
    [key: string]: Command
  }

  fileMenuId: DropdownList = [
    "file.new",
    "file.open",
    "#divider",
    "file.save",
    "file.saveAs"
  ];
  editMenuId: DropdownList = [
    "edit.undo",
    "edit.redo",
    "#divider",
    "edit.cut",
    "edit.copy",
    "edit.paste",
    "#divider",
    "edit.find",
    "edit.replace",
    "#divider",
    "edit.commentLine"
  ];
  runMenuId: DropdownList = [
    "build.build",
    "build.run",
    "build.buildRun",
    "#divider",
    "debug.start",
    "debug.exit"
  ];

  helpMenuId: DropdownList = [
    "window.toggleDevtools"
  ]

  constructor() {
  }

  ngOnInit(): void {
  }
}
