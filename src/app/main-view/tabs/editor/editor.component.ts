import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  constructor() { }

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: "cpp",
    theme: "vs-light"
  };
  code: string = '#include <iostream>\nint main() {\n    std::cout << "Hello, world!" << std::endl;\n}';
  ngOnInit(): void {
  }

}
