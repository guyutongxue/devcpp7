import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { OutlineComponent } from './outline/outline.component';
import { WatchComponent } from './watch/watch.component';

const routes: Routes = [
  {
    path: 'outline',
    component: OutlineComponent,
    outlet: 'sidebar'
  },
  {
    path: 'watch',
    component: WatchComponent,
    outlet: 'sidebar'
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SidebarRoutingModule {}