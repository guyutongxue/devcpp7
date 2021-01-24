import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AngularSplitModule } from 'angular-split'

import { MainViewComponent } from './main-view.component';
import { TabsModule } from './tabs/tabs.module';
import { SidebarModule } from './sidebar/sidebar.module';

@NgModule({
  declarations: [ MainViewComponent ],
  imports: [
    CommonModule,
    AppRoutingModule,
    NzTabsModule,
    AngularSplitModule,
    TabsModule,
    SidebarModule,
  ],
  exports: [ MainViewComponent ]
})
export class MainViewModule {}
