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
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from '../../app-routing.module';

import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';


import { TabsComponent } from './tabs/tabs.component';
import { EditorComponent } from './editor/editor.component';
import { BuildSettingComponent } from './settings/build-setting/build-setting.component';
import { SfbSettingComponent } from './settings/build-setting/sfb-setting/sfb-setting.component';
import { EnvSettingComponent } from './settings/build-setting/env-setting/env-setting.component';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [TabsComponent, EditorComponent, BuildSettingComponent, SfbSettingComponent, EnvSettingComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    NzTabsModule,
    NzLayoutModule,
    NzGridModule,
    NzMenuModule,
    NzButtonModule,
    NzSelectModule,
    NzCheckboxModule,
    NzTagModule,
    NzInputModule,
    NzModalModule,
    NzAlertModule,
    NzIconModule,
    MonacoEditorModule
  ],
  exports: [TabsComponent]
})
export class TabsModule { }
