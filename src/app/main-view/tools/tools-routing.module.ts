import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ProblemsComponent } from './problems/problems.component'
import { OutputComponent } from './output/output.component';
import { DebugComponent } from './debug/debug.component';

const routes: Routes = [
  {
    path: 'problems',
    component: ProblemsComponent,
    outlet: 'tools'
  },
  {
    path: 'output',
    component: OutputComponent,
    outlet: 'tools'
  },
  {
    path: 'debug',
    component: DebugComponent,
    outlet: 'tools'
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule {}