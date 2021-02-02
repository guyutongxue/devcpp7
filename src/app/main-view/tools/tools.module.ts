import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

import { ProblemsComponent } from './problems/problems.component';
import { OutputComponent } from './output/output.component';
import { DebugComponent } from './debug/debug.component';

@NgModule({
  declarations: [ ProblemsComponent, OutputComponent, DebugComponent ],
  imports: [
    CommonModule,
    ClipboardModule,
    NzIconModule,
    NzButtonModule,
    NzTableModule,
    NzCollapseModule
  ]
})
export class ToolsModule { }
