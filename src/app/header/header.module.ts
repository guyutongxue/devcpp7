import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation'

import { FileControlComponent } from './file-control/file-control.component';
import { BuildControlComponent } from './build-control/build-control.component';
import { HeaderComponent } from './header.component';
import { HeaderDropdownComponent, ShortcutTranslatePipe, TypeofPipe } from './header-dropdown/header-dropdown.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    FileControlComponent,
    BuildControlComponent,
    HeaderComponent,
    HeaderDropdownComponent,
    TypeofPipe, 
    ShortcutTranslatePipe
  ],
  imports: [
    CommonModule,
    NzDropDownModule,
    NzButtonModule,
    NzModalModule,
    NzNotificationModule,
    NzIconModule,
    NzNoAnimationModule,
    CoreModule
  ],
  exports: [HeaderComponent]
})
export class HeaderModule { }
