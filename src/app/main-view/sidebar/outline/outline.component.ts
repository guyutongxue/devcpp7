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
  position: monaco.IPosition
}

@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit {
  len: number;
  private symbols$: Observable<DocumentSymbol[]>
  constructor(private editorService: EditorService) { }

  ngOnInit(): void {
    this.symbols$ = this.editorService.editorText$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(text => this.editorService.getSymbols())
    );
    this.symbols$.subscribe(e => {
      if (e === null) this.len = -1;
      else this.len = e.length;
      this.dataSource.setData(e);
    })
  }
  private transformer(symbol: DocumentSymbol, level: number) :FlatNode {
    return {
      expandable: !!symbol.children && symbol.children.length > 0,
      name: symbol.name,
      level: level,
      kind: symbol.kind,
      position: {
        lineNumber: symbol.range.start.line + 1,
        column: symbol.range.start.character + 1
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
    console.log(node.position);
    this.editorService.setPosition(node.position);
  }
}
