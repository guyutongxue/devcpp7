import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import { EditorService } from '../../../services/editor.service'
import { TabsService } from '../../../services/tabs.service'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {

  };
  key: string;
  code: string; // binding [(ngModel)] in <ngx-monaco-editor> is necessary

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
  }

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorService.monacoInit(editor);
    if (this.key) this.editorService.switchToModel(this.tabsService.getByKey(this.key).value);
    this.editorService.startLanguageClient();
  }

}
