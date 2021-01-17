import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from '../../app-routing.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';


import { TabsComponent } from './tabs/tabs.component'
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [TabsComponent, EditorComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    NzTabsModule,
    NzIconModule.forChild([CloseOutline]),
    MonacoEditorModule
  ],
  exports: [TabsComponent]
})
export class TabsModule { }
