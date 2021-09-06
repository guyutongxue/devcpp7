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
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../core/services';
import { FileService } from './file.service';
import { Tab } from './tabs.service';
import { ThemeService } from './theme.service';


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
  'editor': {
    theme: {
      activeName: string;
    };
  }
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

  abstract reset(): Promise<void> | void;
  abstract save(): Promise<void> | void;
}

class BuildSubSetting extends SubSetting<'build'> {
  constructor(private electronService: ElectronService) {
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

  async reset() {
    await Promise.all([
      this.electronService.getConfig('build.compileArgs').then(v => this.options.sfb = new SfbOptions(v)),
      this.electronService.getConfig('advanced.ioEncoding').then(v => this.options.env.ioEncoding = v),
      this.electronService.getConfig('env.mingwPath').then(v => this.options.env.mingwPath = v),
      this.electronService.getConfig('env.useBundledMingw').then(v => this.options.env.useBundledMingw = v),
      this.electronService.getConfig('env.clangdPath').then(v => this.options.env.clangdPath = v),
      this.electronService.getConfig('env.useBundledClangd').then(v => this.options.env.useBundledClangd = v),
    ]);
    super.updateSaved();
  }

  save() {
    this.electronService.setConfig('build.compileArgs', [
      ...this.options.sfb.toList(),
      ...this.options.sfb.other
    ]);
    this.electronService.setConfig('advanced.ioEncoding', this.options.env.ioEncoding);
    this.electronService.setConfig('env.mingwPath', this.options.env.mingwPath);
    this.electronService.setConfig('env.useBundledMingw', this.options.env.useBundledMingw);
    this.electronService.setConfig('env.clangdPath', this.options.env.clangdPath);
    this.electronService.setConfig('env.useBundledClangd', this.options.env.useBundledClangd);
    super.updateSaved();
  }
}

class EditorSubSetting extends SubSetting<'editor'> {
  constructor(private electronService: ElectronService, private themeService: ThemeService) {
    super('editor', '编辑器设置');
    this.options = {
      theme: {
        activeName: '',
      }
    };
  }

  async reset() {
    await Promise.all([
      this.electronService.getConfig('theme.active').then(v => this.options.theme.activeName = v)
      // this.electronService.getConfig('editor.fontFamily').then(v => this.options.fontFamily = v),
      // this.electronService.getConfig('editor.fontSize').then(v => this.options.fontSize = v),
      // this.electronService.getConfig('editor.fontLigatures').then(v => this.options.fontLigatures = v),
      // this.electronService.getConfig('editor.fontWeight').then(v => this.options.fontWeight = v),
      // this.electronService.getConfig('editor.fontStyle').then(v => this.options.fontStyle = v),
      // this.electronService.getConfig('editor.lineHeight').then(v => this.options.lineHeight = v),
      // this.electronService.getConfig('editor.letterSpacing').then(v => this.options.letterSpacing = v),
      // this.electronService.getConfig('editor.tabSize').then(v => this.options.tabSize = v),
    ]);
    super.updateSaved();
  }

  save() {
    this.electronService.setConfig('theme.active', this.options.theme.activeName);
    // this.electronService.setConfig('editor.fontFamily', this.options.fontFamily);
    // this.electronService.setConfig('editor.fontSize', this.options.fontSize);
    // this.electronService.setConfig('editor.fontLigatures', this.options.fontLigatures);
    // this.electronService.setConfig('editor.fontWeight', this.options.fontWeight);
    // this.electronService.setConfig('editor.fontStyle', this.options.fontStyle);
    // this.electronService.setConfig('editor.lineHeight', this.options.lineHeight);
    // this.electronService.setConfig('editor.letterSpacing', this.options.letterSpacing);
    // this.electronService.setConfig('editor.tabSize', this.options.tabSize);
    this.themeService.setTheme(this.options.theme.activeName);
    super.updateSaved();
  }
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private subSettings: { [K in keyof OptionsType]: SubSetting<K> } = {
    build: new BuildSubSetting(this.electronService),
    editor: new EditorSubSetting(this.electronService, this.themeService)
  };

  constructor(
    private fileService: FileService,
    private themeService: ThemeService,
    private electronService: ElectronService) {
    // this.resetBuildOption();
  }

  getOptions<K extends keyof OptionsType>(url: K): OptionsType[K] {
    return (this.subSettings[url] as SubSetting<K>).options;
  }

  onChange<K extends keyof OptionsType>(url: K): void {
    this.subSettings[url].updateSaved(false);
  }

  async openSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].reset();
    this.subSettings[url].open(this.fileService);
  }

  async resetSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].reset();
  }

  async saveSetting<K extends keyof OptionsType>(url: K): Promise<void> {
    await this.subSettings[url].save();
  }

  saveTab(tab: Tab): boolean {
    this.subSettings[tab.key.substr(1)].save();
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
      "~build": "sfb",
      "~editor": "theme"
    };

  lastVisitedUrl: {
    [key: string]: string;
  } = {};

  constructor(private router: Router) { }

  canActivate(activatedRoute: ActivatedRouteSnapshot): boolean {
    const parentUrl = activatedRoute.parent.url[1].path;
    if (!(parentUrl in this.lastVisitedUrl)) {
      this.lastVisitedUrl[parentUrl] = this.homeUrl[parentUrl];
    }
    this.router.navigate([
      "setting",
      parentUrl,
      this.lastVisitedUrl[parentUrl]
    ]);
    return false;
  }
}
