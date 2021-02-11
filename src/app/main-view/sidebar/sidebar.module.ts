import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { OutlineComponent } from './outline/outline.component';
import { WatchComponent } from './watch/watch.component';

@NgModule({
  declarations: [ OutlineComponent, WatchComponent ],
  imports: [
    CommonModule,
    NzTreeModule,
    NzTreeViewModule,
    NzTagModule,
    NzIconModule
  ],
  exports: [ OutlineComponent, WatchComponent ]
})
export class SidebarModule { }
