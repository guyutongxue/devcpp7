// Copyright (C) 2021 Guyutongxue
// 
// This file is part of Dev-C++ 7.
// 
// Dev-C++ 7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Dev-C++ 7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Dev-C++ 7.  If not, see <http://www.gnu.org/licenses/>.

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import { EditorService } from '../../../services/editor.service'
import { TabsService } from '../../../services/tabs.service'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit, OnDestroy {

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: true,
    lineNumbersMinChars: 2,
    'semanticHighlighting.enabled': true
  };
  key: string;
  get code(){
    return this.editorService.getCode();
  }

  constructor(private route: ActivatedRoute,
    private tabsService: TabsService,
    private editorService: EditorService) { }


  private keyOnChange(key: string) {
    if (typeof key === "undefined") this.key = null;
    this.key = key;
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      this.keyOnChange(routeParams['key']);
    });
    console.log(this.editorService);
  }

  ngOnDestroy() {
    this.editorService.editorDestroy();
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    if (!this.editorService.isLanguageClientStarted) this.editorService.startLanguageClient();
    this.editorService.editorInit(editor);
    if (this.key) {
      let activeTab = this.tabsService.getByKey(this.key).value;
      this.editorService.switchToModel(activeTab);
    }
  }

}
