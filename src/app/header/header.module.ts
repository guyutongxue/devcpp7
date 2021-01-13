import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button'

import { FileControlComponent } from './file-control/file-control.component'

@NgModule({
  declarations: [ FileControlComponent ],
  imports: [
    CommonModule,
    NzButtonModule
  ]
})
export class HeaderModule { }
