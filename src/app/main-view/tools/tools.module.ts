import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table'

import { ProblemsComponent } from './problems/problems.component'

@NgModule({
  declarations: [ ProblemsComponent ],
  imports: [
    CommonModule,
    NzTableModule
  ]
})
export class ToolsModule { }
