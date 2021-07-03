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
import { SettingsService } from '../../../../services/settings.service'

@Component({
  selector: 'app-build-setting',
  templateUrl: './build-setting.component.html',
  styleUrls: ['./build-setting.component.scss']
})
export class BuildSettingComponent implements OnInit {

  customArgsDivClass: string[] = []

  constructor(private settingsService: SettingsService, private electronService: ElectronService) { }

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
    console.log(this.currentOptions);
  }

  get currentOptions() {
    return this.settingsService.currentBuildOptions;
  }

  saveOption() {
    this.settingsService.saveBuildOption();
  }

  resetOption() {
    this.settingsService.resetBuildOption();
  }

  get buildedArgs() {
    return this.currentOptions.toList();
  }

  customSubmit(value: string) {
    const index = this.currentOptions.other.indexOf(value);
    if (index === -1)
      this.currentOptions.other.push(value);
  }
  customRemove(value: string) {
    const index = this.currentOptions.other.indexOf(value);
    if (index !== -1)
      this.currentOptions.other.splice(index, 1);
  }
  removeLast() {
    console.log("pp");
    if (this.currentOptions.other.length > 0)
      this.currentOptions.other.pop();
  }

}
