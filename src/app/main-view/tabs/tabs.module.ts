import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../../app-routing.module'
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { TabsComponent } from './tabs/tabs.component'
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [EditorComponent, TabsComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    NzTabsModule,
    MonacoEditorModule,
  ],
  exports: [TabsComponent]
})
export class TabsModule { }
