import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AngularSplitModule } from 'angular-split'

import { MainViewComponent } from './main-view.component';
import { TabsModule } from './tabs/tabs.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { ToolsModule } from './tools/tools.module'

@NgModule({
  declarations: [MainViewComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    NzMenuModule,
    NzToolTipModule,
    NzButtonModule,
    NzIconModule,
    AngularSplitModule,
    TabsModule,
    SidebarModule,
    ToolsModule
  ],
  exports: [MainViewComponent]
})
export class MainViewModule { }
