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

  editorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorService.monacoInit(editor);
    if (this.key) {
      let activeTab = this.tabsService.getByKey(this.key).value;
      this.editorService.switchToModel(activeTab);
    }
    if (!this.editorService.isLanguageClientStarted) this.editorService.startLanguageClient();
  }

}
