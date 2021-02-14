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
