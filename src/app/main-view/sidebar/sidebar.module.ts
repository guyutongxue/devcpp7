import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutlineComponent } from './outline/outline.component'

@NgModule({
  declarations: [ OutlineComponent ],
  imports: [
    CommonModule
  ],
  exports: [ OutlineComponent ]
})
export class SidebarModule { }
