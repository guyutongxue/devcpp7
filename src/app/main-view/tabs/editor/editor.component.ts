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
