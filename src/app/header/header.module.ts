import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FolderOpenOutline, SaveOutline, PlusOutline } from '@ant-design/icons-angular/icons';

import { FileControlComponent } from './file-control/file-control.component';
import { BuildControlComponent } from './build-control/build-control.component';

@NgModule({
  declarations: [FileControlComponent, BuildControlComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule.forChild([FolderOpenOutline, SaveOutline, PlusOutline])
  ],
  exports: [
    FileControlComponent,
    BuildControlComponent
  ]
})
export class HeaderModule { }
