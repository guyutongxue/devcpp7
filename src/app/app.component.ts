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

import { Component, HostListener, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

import { HotkeysService } from './services/hotkeys.service';
import { StatusService } from './services/status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private statusService: StatusService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
    this.windowHeight = window.innerHeight;
  }

  private windowHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = window.innerHeight;
  }

  get headerHeight() {
    return 32 + 1 * 32;
  }

  get footerHeight() {
    return 20;
  }

  get mainViewHeight() {
    return this.windowHeight - this.headerHeight - this.footerHeight;
  }

  async ngOnInit() {
    // this.electronService.ipcRenderer.invoke('window/toggleDevTools');
    const [mingwPath, clangdPath] = await Promise.all([
      this.electronService.getConfig('env.mingwPath'),
      this.electronService.getConfig('env.clangdPath')
    ]);
    // if (mingwPath === null || clangdPath === null) {
    //   this.setEnvModal = true;
    // }
    // if (mingwPath !== null)
    //   this.tempMingwPath = mingwPath;
    // if (clangdPath !== null)
    //   this.tempClangdPath = clangdPath;
  }

  setEnvModal: boolean = false;
  tempMingwPath: string = "";
  tempClangdPath: string = "";

  confirmPaths(): void {
    this.electronService.setConfig('env.mingwPath', this.tempMingwPath);
    this.electronService.setConfig('env.clangdPath', this.tempClangdPath);
    this.setEnvModal = false;
  }

  get currentStatus() {
    if (this.statusService.isBuilding) return "正在编译中";
    if (this.statusService.isDebugging) return "正在调试中";
    return "就绪";
  }
}
