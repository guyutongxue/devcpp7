import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { TabsRoutingModule } from './main-view/tabs/tabs-routing.module'
import { SidebarRoutingModule } from './main-view/sidebar/sidebar-routing.module'
import { ToolsRoutingModule } from './main-view/tools/tools-routing.module'

const routes: Routes = [
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    TabsRoutingModule,
    SidebarRoutingModule,
    ToolsRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
