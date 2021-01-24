import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CaretDownFill } from '@ant-design/icons-angular/icons';

import { OutlineComponent } from './outline/outline.component'

@NgModule({
  declarations: [ OutlineComponent ],
  imports: [
    CommonModule,
    NzTreeViewModule,
    NzIconModule.forChild([ CaretDownFill ])
  ],
  exports: [ OutlineComponent ]
})
export class SidebarModule { }
