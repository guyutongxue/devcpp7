// Copyright (C) 2021 Guyutongxue
//
// This file is part of devcpp7.
//
// devcpp7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// devcpp7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with devcpp7.  If not, see <http://www.gnu.org/licenses/>.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ElectronService } from '../../../../../core/services';
import { SettingsGuard, SettingsService } from '../../../../../services/settings.service';

@Component({
  selector: 'app-theme-setting',
  templateUrl: './theme-setting.component.html',
  styleUrls: ['./theme-setting.component.scss']
})
export class ThemeSettingComponent implements OnInit {

  themeList: string[] = ['1', '2'];

  constructor(private settingsService: SettingsService,
    private electronService: ElectronService,
    private settingsGuard: SettingsGuard) {
  }

  get currentThemeOptions(): { activeName: string } {
    return this.settingsService.getOptions('editor').theme;
  }

  ngOnInit(): void {
    this.settingsGuard.lastVisitedUrl['~editor'] = 'theme';
    this.refreshList();
  }

  refreshList(): void {
    this.electronService.ipcRenderer.invoke('theme/getList').then(v => this.themeList = v);
  }

  onChange(): void {
    this.settingsService.onChange('editor');
  }

}
