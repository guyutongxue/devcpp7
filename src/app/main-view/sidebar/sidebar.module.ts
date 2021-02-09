import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { OutlineComponent } from './outline/outline.component';
import { WatchComponent } from './watch/watch.component';

@NgModule({
  declarations: [ OutlineComponent, WatchComponent ],
  imports: [
    CommonModule,
    NzTreeViewModule,
    NzListModule,
    NzTagModule,
    NzIconModule
  ],
  exports: [ OutlineComponent, WatchComponent ]
})
export class SidebarModule { }
