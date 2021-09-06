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

import { Component, Input, OnInit } from '@angular/core';

import { Pipe, PipeTransform } from '@angular/core';
import { Command, StatusService } from '../../services/status.service';

export type DropdownList = Array<
  string | {
    title: string,
    children: string[]
  }
>;

@Pipe({
  name: 'typeof'
})
export class TypeofPipe implements PipeTransform {
  transform<T>(value: any, typeofChecker: T): T {
    return typeof value === typeof typeofChecker ? value : undefined;
  }
}

@Pipe({
  name: 'shortcutTranslate'
})
export class ShortcutTranslatePipe implements PipeTransform {
  transform(value: string): string {
    if (value === null) return '';
    return value.split('.').map(v => {
      switch (v) {
        case 'control': return 'Ctrl';
        case 'alt': return 'Alt';
        case 'shift': return 'Shift';
        default: return v.toUpperCase();
      }
    }).join('+');
  }
}

@Component({
  selector: 'app-header-dropdown',
  templateUrl: './header-dropdown.component.html',
  styleUrls: ['./header-dropdown.component.scss']
})
export class HeaderDropdownComponent implements OnInit {

  readonly commandList: {
    [key: string]: Command
  };

  constructor(
    private statusService: StatusService
  ) {
    this.commandList = this.statusService.commandList;
  }

  @Input('data') list: DropdownList;

  ngOnInit(): void {
  }

}
