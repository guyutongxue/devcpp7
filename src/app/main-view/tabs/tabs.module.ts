import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    MonacoEditorModule,
  ]
})
export class TabsModule { }
