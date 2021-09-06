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
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-editor-setting',
  templateUrl: './editor-setting.component.html',
  styleUrls: ['./editor-setting.component.scss']
})
export class EditorSettingComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private settingsService: SettingsService,) { }

  ngOnInit() { }

  saveOption() {
    this.settingsService.saveSetting('editor');
  }

  resetOption() {
    this.settingsService.resetSetting('editor');
  }

}
