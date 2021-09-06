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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { EmptyPageComponent } from '../empty-page/empty-page.component';
import { BuildSettingComponent } from './settings/build-setting/build-setting.component';
import { SfbSettingComponent } from './settings/build-setting/sfb-setting/sfb-setting.component';
import { EnvSettingComponent } from './settings/build-setting/env-setting/env-setting.component';
import { SettingsGuard } from '../../services/settings.service';
import { EditorSettingComponent } from './settings/editor-setting/editor-setting.component';
import { ThemeSettingComponent } from './settings/editor-setting/theme-setting/theme-setting.component';

const routes: Routes = [
  {
    path: 'empty',
    component: EmptyPageComponent
  },
  {
    path: 'file/:key',
    component: EditorComponent
  },
  {
    path: 'setting/~build',
    component: BuildSettingComponent,
    children: [
      {
        path: '',
        canActivate: [SettingsGuard],
        component: EmptyPageComponent
      },
      {
        path: 'sfb',
        component: SfbSettingComponent
      },
      {
        path: 'env',
        component: EnvSettingComponent
      }
    ]
  },
  {
    path: 'setting/~editor',
    component: EditorSettingComponent,
    children: [
      {
        path: '',
        canActivate: [SettingsGuard],
        component: EmptyPageComponent
      },
      {
        path: 'theme',
        component: ThemeSettingComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'empty'
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule { }
