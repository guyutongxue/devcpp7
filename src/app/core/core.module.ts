import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofocusDirective } from './directives/autofocus.directive';
import { IconComponent } from './icon/icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [AutofocusDirective, IconComponent],
  imports: [
    CommonModule,
    NzIconModule
  ],
  exports: [ AutofocusDirective, IconComponent ]
})
export class CoreModule { }
