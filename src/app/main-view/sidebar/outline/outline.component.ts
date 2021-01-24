import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { Observable } from 'rxjs';

import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { DocumentSymbol } from 'monaco-languageclient'

import { EditorService } from '../../../services/editor.service';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  kind: monaco.languages.SymbolKind,
  range: monaco.IRange
}

@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit {
  private symbols$: Observable<DocumentSymbol[]>
  constructor(private editorService: EditorService) { }

  ngOnInit(): void {
    this.symbols$ = this.editorService.editorText$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(_ => this.editorService.getSymbols())
    );
    this.symbols$.subscribe(e => {
      if (e === null) this.dataSource.setData([]);
      else this.dataSource.setData(e);
    })
  }
  private transformer(symbol: DocumentSymbol, level: number) :FlatNode {
    return {
      expandable: !!symbol.children && symbol.children.length > 0,
      name: symbol.name,
      level: level,
      kind: symbol.kind,
      range: {
        startLineNumber: symbol.range.start.line + 1,
        startColumn: symbol.range.start.character + 1,
        endLineNumber: symbol.range.end.line + 1,
        endColumn: symbol.range.end.character + 1
      }
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);


  hasChild = (_: number, node: FlatNode) => node.expandable;

  selectNode(node: FlatNode) {
    console.log(node.range);
    this.editorService.setPosition({
      lineNumber: node.range.startLineNumber,
      column: node.range.startColumn
    });
  }
}
