import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

import { ProblemsComponent } from './problems/problems.component';
import { OutputComponent } from './output/output.component'

@NgModule({
  declarations: [ ProblemsComponent, OutputComponent ],
  imports: [
    CommonModule,
    ClipboardModule,
    NzIconModule,
    NzTableModule,
    NzCollapseModule
  ]
})
export class ToolsModule { }
