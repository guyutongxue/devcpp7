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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';


import { TabsComponent } from './tabs/tabs.component'
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [TabsComponent, EditorComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    NzTabsModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    MonacoEditorModule
  ],
  exports: [TabsComponent]
})
export class TabsModule { }
