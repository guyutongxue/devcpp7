import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ProblemsComponent } from './problems/problems.component'

const routes: Routes = [
  {
    path: 'problems',
    component: ProblemsComponent,
    outlet: 'tools'
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule {}