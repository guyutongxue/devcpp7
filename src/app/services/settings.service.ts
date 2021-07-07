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

import { Injectable } from '@angular/core';
import { ElectronService } from '../core/services';


export class BuildOptions {
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

  constructor(str?: string[]) {
    // default value
    if (typeof str === "undefined") return;
    // read from str
    this.fexec_charset = false;
    for (const opt of str) {
      if (opt.startsWith('-std')) {
        if (opt.startsWith('-std=c++')) {
          this.std = opt.substr(8);
          this.gnu = false;
        } else if (opt.startsWith('-std=gnu++')) {
          this.std = opt.substr(10);
          this.gnu = true;
        }
      }
      else if (opt.startsWith('-O'))
        this.O = opt.substr(2);
      else if (opt === '-g')
        this.g = true;
      else if (opt === '-Wall')
        this.Wall = true;
      else if (opt === '-Wextra')
        this.Wextra = true;
      else if (opt === '-Werror')
        this.Werror = true;
      else if (opt === 'DYN-fexec-charset')
        this.fexec_charset = true;
      else {
        this.other.push(opt);
      }
    }
  }

  toList(): string[] {
    const result: string[] = [];
    if (this.std !== '') {
      if (this.gnu)
        result.push(`-std=gnu++${this.std}`);
      else
        result.push(`-std=c++${this.std}`);
    }
    if (this.O !== '')
      result.push(`-O${this.O}`);
    if (this.g) result.push('-g');
    if (this.Wall) result.push('-Wall');
    if (this.Wextra) result.push('-Wextra');
    if (this.Werror) result.push('-Werror');
    if (this.fexec_charset) result.push('DYN-fexec-charset');
    return result;
  }

}


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  /** Current Single-File-Build Options */
  currentSfbOptions: BuildOptions = new BuildOptions();

  constructor(private electronService: ElectronService) {
    this.resetBuildOption();
  }

  async resetBuildOption() {
    this.currentSfbOptions = new BuildOptions(await this.electronService.getConfig('build.compileArgs'));
  }

  async saveBuildOption() {
    this.electronService.setConfig('build.compileArgs', [
      ...this.currentSfbOptions.toList(),
      ...this.currentSfbOptions.other
    ]);
  }

}
