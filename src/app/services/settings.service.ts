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
import { ActivatedRouteSnapshot, CanActivate, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services';
import { FileService } from './file.service';
import { Tab } from './tabs.service';


export class SfbOptions {
  std = '';
  gnu = false;

  O = '';
  g = false;

  Wall = false;
  Wextra = false;
  Werror = false;

  // Dynamic options:
  // Dynamic options will be evaluated until building.
  // Storing dynamic options with a 'DYN' prefix.
  fexec_charset = true;

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

export interface EnvOptions {
  ioEncoding: string;
  mingwPath: string;
  useBundledMingw: boolean;
  clangdPath: string;
  useBundledClangd: boolean;
}

type OptionsType = {
  'build': {
    sfb: SfbOptions;
    env: EnvOptions;
  },
  // 'editor': {}
};

abstract class SubSetting<Url extends keyof OptionsType> {
  options: OptionsType[Url];

  private tab: Tab | null = null;
  private saved: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(private url: Url, private name: string) {
    this.saved.subscribe(v => {
      if (this.tab !== null) {
        this.tab.saved = v;
      }
    });
  }

  open(fileService: FileService) {
    this.tab = fileService.newSettings(this.url, this.name);
  }

  updateSaved(value = true) {
    this.saved.next(value);
  }

  abstract reset(electron: ElectronService): Promise<void> | void;
  abstract save(electron: ElectronService): Promise<void> | void;
}

class BuildSubSetting extends SubSetting<'build'> {
  constructor() {
    super('build', '编译设置');
    this.options = {
      sfb: new SfbOptions(),
      env: {
        ioEncoding: 'cp936',
        mingwPath: null,
        useBundledMingw: true,
        clangdPath: null,
        useBundledClangd: true,
      }
    };
  }

  async reset(electron: ElectronService) {
    await Promise.all([
      electron.getConfig('build.compileArgs').then(v => this.options.sfb = new SfbOptions(v)),
      electron.getConfig('advanced.ioEncoding').then(v => this.options.env.ioEncoding = v),
      electron.getConfig('env.mingwPath').then(v => this.options.env.mingwPath = v),
      electron.getConfig('env.useBundledMingw').then(v => this.options.env.useBundledMingw = v),
      electron.getConfig('env.clangdPath').then(v => this.options.env.clangdPath = v),
      electron.getConfig('env.useBundledClangd').then(v => this.options.env.useBundledClangd = v),
    ]);
    super.updateSaved();
  }

  save(electron: ElectronService) {
    electron.setConfig('build.compileArgs', [
      ...this.options.sfb.toList(),
      ...this.options.sfb.other
    ]);
    electron.setConfig('advanced.ioEncoding', this.options.env.ioEncoding);
    electron.setConfig('env.mingwPath', this.options.env.mingwPath);
    electron.setConfig('env.useBundledMingw', this.options.env.useBundledMingw);
    electron.setConfig('env.clangdPath', this.options.env.clangdPath);
    electron.setConfig('env.useBundledClangd', this.options.env.useBundledClangd);
    super.updateSaved();
  }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  subSettings: { [K in keyof OptionsType]: SubSetting<K> } = {
    build: new BuildSubSetting(),
    // editor: null
  };

  constructor(private router: Router, private fileService: FileService, private electronService: ElectronService) {
    // this.resetBuildOption();
  }

  getOptions<K extends keyof OptionsType>(url: K): OptionsType[K] {
    return (this.subSettings[url] as SubSetting<K>).options;
  }

  onChange<K extends keyof OptionsType>(url: K): void {
    this.subSettings[url].updateSaved(false);
  }

  async openSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].reset(this.electronService);
    this.subSettings[url].open(this.fileService);
  }

  async resetSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].reset(this.electronService);
  }

  async saveSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].save(this.electronService);
  }

  saveTab(tab: Tab): boolean {
    this.subSettings[tab.key.substr(1)].save(this.electronService);
    return true;
  }
}


// This guard redirect setting page to the correct subsetting tab which has last been visited
@Injectable({
  providedIn: 'root'
})
export class SettingsGuard implements CanActivate {

  private readonly homeUrl: {
    [key: string]: string;
  } = {
      "~build": "sfb"
    };

  lastVisitedUrl: string | null = null;

  constructor(private router: Router) { }

  canActivate(activatedRoute: ActivatedRouteSnapshot): boolean {
    const parentUrl = activatedRoute.parent.url[1].path;
    if (this.lastVisitedUrl === null) {
      this.lastVisitedUrl = this.homeUrl[parentUrl] ?? "";
    }
    this.router.navigate([
      "setting",
      parentUrl,
      this.lastVisitedUrl
    ]);
    return false;
  }
}
