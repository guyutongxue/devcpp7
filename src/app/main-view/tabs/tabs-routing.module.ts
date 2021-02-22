import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { EmptyPageComponent } from '../empty-page/empty-page.component';

const routes: Routes = [
  {
    path: 'file/:key',
    component: EditorComponent
  },
  {
    path: 'empty',
    component: EmptyPageComponent
  },
  {
    path: '**',
    redirectTo: 'empty'
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule { }
