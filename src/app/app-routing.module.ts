import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { TabsRoutingModule } from './main-view/tabs/tabs-routing.module'

const routes: Routes = [
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    TabsRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
