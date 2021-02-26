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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'
import { Observable, Subscription } from 'rxjs';

import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { DocumentSymbol, SymbolKind } from 'vscode-languageserver-protocol'

import { EditorService } from '../../../services/editor.service';


interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  kind: SymbolKind,
  range: monaco.IRange
}

const iconData: {
  [key: number]: {
    class: string
  }
} =
{
  [SymbolKind.File]: { class: 'symbol-file' },
  [SymbolKind.Module]: { class: 'symbol-module' },
  [SymbolKind.Namespace]: { class: 'symbol-namespace' },
  [SymbolKind.Package]: { class: 'symbol-package' },
  [SymbolKind.Class]: { class: 'symbol-class' },
  [SymbolKind.Method]: { class: 'symbol-method' },
  [SymbolKind.Property]: { class: 'symbol-property' },
  [SymbolKind.Field]: { class: 'symbol-field' },
  [SymbolKind.Constructor]: { class: 'symbol-constructor' },
  [SymbolKind.Enum]: { class: 'symbol-enum' },
  [SymbolKind.Interface]: { class: 'symbol-interface' },
  [SymbolKind.Function]: { class: 'symbol-function' },
  [SymbolKind.Variable]: { class: 'symbol-variable' },
  [SymbolKind.Constant]: { class: 'symbol-constant' },
  [SymbolKind.String]: { class: 'symbol-string' },
  [SymbolKind.Number]: { class: 'symbol-numeric' },
  [SymbolKind.Boolean]: { class: 'symbol-boolean' },
  [SymbolKind.Array]: { class: 'symbol-array' },
  [SymbolKind.Object]: { class: 'symbol-object' },
  [SymbolKind.Key]: { class: 'symbol-key' },
  [SymbolKind.Null]: { class: 'symbol-null' },
  [SymbolKind.EnumMember]: { class: 'symbol-enum-member' },
  [SymbolKind.Struct]: { class: 'symbol-struct' },
  [SymbolKind.Event]: { class: 'symbol-event' },
  [SymbolKind.Operator]: { class: 'symbol-operator' },
  [SymbolKind.TypeParameter]: { class: 'symbol-type-parameter' }
};


@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit, OnDestroy {
  private symbols$: Observable<DocumentSymbol[]>;
  private symbolsSubscription: Subscription;
  iconData = iconData;

  constructor(private editorService: EditorService) { }

  ngOnInit(): void {
    this.symbols$ = this.editorService.editorText$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(_ => this.editorService.getSymbols())
    );
    this.symbolsSubscription = this.symbols$.subscribe(e => {
      if (e === null) this.dataSource.setData([]);
      else this.dataSource.setData(e);
    })
  }
  ngOnDestroy(): void {
    this.symbolsSubscription.unsubscribe();
  }

  private transformer(symbol: DocumentSymbol, level: number): FlatNode {
    return {
      expandable: !!symbol.children && symbol.children.length > 0,
      name: symbol.name,
      level: level,
      kind: symbol.kind,
      range: {
        startLineNumber: symbol.selectionRange.start.line + 1,
        startColumn: symbol.selectionRange.start.character + 1,
        endLineNumber: symbol.selectionRange.end.line + 1,
        endColumn: symbol.selectionRange.end.character + 1
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
    this.editorService.setPosition({
      lineNumber: node.range.startLineNumber,
      column: node.range.startColumn
    });
  }
}
