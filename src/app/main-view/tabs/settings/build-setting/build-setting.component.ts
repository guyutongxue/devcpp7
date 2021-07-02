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
import { ElectronService } from '../../../../core/services';


class OptionList {
  std: string = '';
  gnu: boolean = false;

  O: string = '';
  g: boolean = false;

  Wall: boolean = false;
  Wextra: boolean = false;
  Werror: boolean = false;

  // Dynamic options:
  // Dynamic options will be evaluated until building.
  // Storing dynamic options with a 'DYN' prefix.
  fexec_charset: boolean = true;

  other: string[] = [];
}

function parseOption(str: string[]): OptionList {
  const result = new OptionList();
  for (const opt of str) {
    if (opt.startsWith('-std')) {
      if (opt.startsWith('-std=c++')) {
        result.std = opt.substr(8);
        result.gnu = false;
      } else if (opt.startsWith('-std=gnu++')) {
        result.std = opt.substr(10);
        result.gnu = true;
      }
    }
    else if (opt.startsWith('-O'))
      result.O = opt.substr(2);
    else if (opt === '-g')
      result.g = true;
    else if (opt === '-Wall')
      result.Wall = true;
    else if (opt === '-Wextra')
      result.Wextra = true;
    else if (opt === '-Werror')
      result.Werror = true;
    else if (opt === 'DYN-fexec-charset')
      result.fexec_charset = true;
    else {
      result.other.push(opt);
    }
  }
  return result;
}

function buildOption(option: OptionList): string[] {
  const result: string[] = [];
  if (option.std !== '') {
    if (option.gnu)
      result.push(`-std=gnu++${option.std}`);
    else
      result.push(`-std=c++${option.std}`);
  }
  if (option.O !== '')
    result.push(`-O${option.O}`);
  if (option.g) result.push('-g');
  if (option.Wall) result.push('-Wall');
  if (option.Wextra) result.push('-Wextra');
  if (option.Werror) result.push('-Werror');
  if (option.fexec_charset) result.push('DYN-fexec-charset');
  return result;
}

@Component({
  selector: 'app-build-setting',
  templateUrl: './build-setting.component.html',
  styleUrls: ['./build-setting.component.scss']
})
export class BuildSettingComponent implements OnInit {

  customArgsDivClass: string[] = []

  constructor(private electronService: ElectronService) { }

  currentOptionList: OptionList = new OptionList();

  stdOptions = [
    '98',
    '11',
    '14',
    '17',
    '2a',
  ];
  optOptions = [
    '1', '2', '3', 's', 'fast', 'g'
  ]

  listOfTagOptions = [];

  ngOnInit() {
    this.initOption();
  }



  async initOption() {
    const args = await this.electronService.getConfig('build.compileArgs');
    console.log(args);
    this.currentOptionList = parseOption(args);
    console.log(this.currentOptionList);
  }

  saveOption() {
    const result = [ ...this.buildedArgs, ...this.currentOptionList.other ];
    this.electronService.setConfig('build.compileArgs', result);
  }

  get buildedArgs() {
    return buildOption(this.currentOptionList);
  }

  customSubmit(value: string) {
    const index = this.currentOptionList.other.indexOf(value);
    if (index === -1)
      this.currentOptionList.other.push(value);
  }
  customRemove(value: string) {
    const index = this.currentOptionList.other.indexOf(value);
    if (index !== -1)
      this.currentOptionList.other.splice(index, 1);
  }
  removeLast() {
    console.log("pp");
    if (this.currentOptionList.other.length > 0)
      this.currentOptionList.other.pop();
  }

}
