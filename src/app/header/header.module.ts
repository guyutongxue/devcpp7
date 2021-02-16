import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { FileControlComponent } from './file-control/file-control.component';
import { BuildControlComponent } from './build-control/build-control.component';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [FileControlComponent, BuildControlComponent, HeaderComponent],
  imports: [
    CommonModule,
    NzMenuModule,
    NzButtonModule,
    NzModalModule,
    NzNotificationModule,
    NzIconModule
  ],
  exports: [HeaderComponent]
})
export class HeaderModule { }
