import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../../app-routing.module'
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CloseOutline } from '@ant-design/icons-angular/icons';

import { TabsComponent } from './tabs/tabs.component'
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [TabsComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    NzTabsModule,
    NzIconModule.forChild([CloseOutline])
  ],
  exports: [TabsComponent]
})
export class TabsModule { }
