import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { OutlineComponent } from './outline/outline.component';
import { WatchComponent } from './watch/watch.component';

@NgModule({
  declarations: [ OutlineComponent, WatchComponent ],
  imports: [
    CommonModule,
    FormsModule,
    NzTreeModule,
    NzTreeViewModule,
    NzInputModule,
    NzTagModule,
    NzIconModule
  ],
  exports: [ OutlineComponent, WatchComponent ]
})
export class SidebarModule { }
