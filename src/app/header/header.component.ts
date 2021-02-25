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
