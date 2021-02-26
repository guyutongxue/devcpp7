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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

import { CoreModule } from '../../core/core.module';

import { ProblemsComponent } from './problems/problems.component';
import { OutputComponent } from './output/output.component';
import { DebugComponent } from './debug/debug.component';

@NgModule({
  declarations: [ ProblemsComponent, OutputComponent, DebugComponent ],
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    NzIconModule,
    NzToolTipModule,
    NzButtonModule,
    NzInputModule,
    NzTableModule,
    NzTabsModule,
    NzCollapseModule,
    CoreModule
  ]
})
export class ToolsModule { }
