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

import { Injectable } from '@angular/core';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl, TreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { DebugService, GdbVarInfo } from './debug.service';
import { map, tap } from 'rxjs/operators';


export interface GdbVarInfoNode extends GdbVarInfo {
  level: number;
  expanded: boolean;
  loading?: boolean;
}

export class DynamicDatasource implements DataSource<GdbVarInfoNode> {

  constructor(private treeControl: TreeControl<GdbVarInfoNode>,
    private flattenedData: BehaviorSubject<GdbVarInfoNode[]>,
    private onExpand: (node: GdbVarInfoNode) => void,
    private onShrink: (node: GdbVarInfoNode) => void) {
    treeControl.dataNodes = this.flattenedData.value;
  }

  connect(collectionViewer: CollectionViewer): Observable<GdbVarInfoNode[]> {
    const changes: Observable<any>[] = [
      collectionViewer.viewChange,
      this.treeControl.expansionModel.changed.pipe(tap(change => this.handleExpansionChange(change))),
      this.flattenedData
    ];
    return merge(changes).pipe(
      map(() => {
        return this.expandFlattenedNodes(this.flattenedData.value);
      })
    );
  }

  expandFlattenedNodes(nodes: GdbVarInfoNode[]): GdbVarInfoNode[] {
    const treeControl = this.treeControl;
    const results: GdbVarInfoNode[] = [];
    const currentExpand: boolean[] = [];
    currentExpand[0] = true;

    nodes.forEach(node => {
      let expand = true;
      for (let i = 0; i <= treeControl.getLevel(node); i++) {
        expand = expand && currentExpand[i];
      }
      if (expand) {
        results.push(node);
      }
      if (treeControl.isExpandable(node)) {
        currentExpand[treeControl.getLevel(node) + 1] = node.expanded;
      }
    });
    return results;
  }

  handleExpansionChange(change: SelectionChange<GdbVarInfoNode>): void {
    const changeList = [...change.added, ...change.removed];
    for (const change of changeList) {
      if (change.expanded) this.onShrink(change);
      else this.onExpand(change);
    }
  }

  disconnect(): void { }
}

@Injectable({
  providedIn: 'root'
})
export class WatchService {

  private flattenedData = new BehaviorSubject<GdbVarInfoNode[]>([]);
  treeControl = new FlatTreeControl<GdbVarInfoNode>(
    node => node.level,
    node => node.value !== null && node.expandable,
  );
  dataSource = new DynamicDatasource(
    this.treeControl,
    this.flattenedData,
    (a) => { this.loadChildren(a); },
    (a) => { this.deleteNode(a, 'collapse'); }
  );
  private nextId = 0;

  constructor(private debugService: DebugService) {
    this.debugService.programStop.subscribe(() => {
      this.tryCreateVar(this.flattenedData.value)
        .then(() => this.updateVar(this.flattenedData.value));
    });
  }

  private async tryCreateVar(data: GdbVarInfoNode[]) {
    const needCreateVar: GdbVarInfoNode[] = [];
    data.forEach(v => {
      if (v.value === null) {
        v.loading = true;
        needCreateVar.push(v);
      }
    });
    this.flattenedData.next(data);
    const result = await this.debugService.createVariables(needCreateVar);
    this.flattenedData.next(data.map<GdbVarInfoNode>(v => ({
      ...(result.find(o => o?.id === v.id) ?? v),
      level: v.level,
      expanded: v.expanded,
      loading: false
    })));
  }

  private async updateVar(data: GdbVarInfoNode[]) {
    const needUpdateVar = data.filter(v => v.value !== null);
    const { deleteList, collapseList } = await this.debugService.updateVariables(needUpdateVar);
    for (const id of collapseList) {
      const target = data.find(v => v.id === id);
      this.deleteNode(target, 'collapse');
    }
    for (const id of deleteList) {
      const target = data.find(v => v.id === id);
      this.deleteNode(target, 'invalid');
    }
  }


  private async loadChildren(node: GdbVarInfoNode) {
    node.loading = true;
    const children = await this.debugService.getVariableChildren(node.id);
    node.loading = false;
    const flattenedData = this.flattenedData.value;
    const index = flattenedData.findIndex(v => v.id === node.id);
    flattenedData.splice(index + 1, 0, ...(children.map(c => ({
      ...c,
      expanded: false,
      level: node.level + 1
    }))));
    flattenedData[index].expanded = true;
    this.flattenedData.next(flattenedData);
  }

  /**
   *
   * @param node
   * @param reason 'user' User delete this node
   * @param reason 'gdb' This variable is no longer valid
   * @param reason 'collapse' Delete child nodes because of collapsion
   */
  deleteNode(node: GdbVarInfoNode, reason: "user" | "invalid" | "collapse"): void {
    node = { ...node }; // Make a copy first
    const flattenedData = this.flattenedData.value;
    const fromIndex = flattenedData.findIndex(v => v.id === node.id) + 1;
    const toIndex = flattenedData.findIndex((val, index) => index >= fromIndex && val.level === node.level);
    flattenedData[fromIndex - 1].expanded = false;
    if (toIndex === -1) flattenedData.splice(fromIndex);
    else flattenedData.splice(fromIndex, toIndex - fromIndex);
    if (reason === 'user') flattenedData.splice(fromIndex - 1, 1);
    if (reason === 'invalid') flattenedData[fromIndex - 1].value = null;
    this.flattenedData.next(flattenedData);
    if (node.value !== null)
      this.debugService.deleteVariable(node.id, reason === 'collapse');
  }

  editNode(node: GdbVarInfoNode) {
    this.deleteNode(node, 'invalid');
  }
  saveNode(node: GdbVarInfoNode, expr: string) {
    const flattenedData = this.flattenedData.value;
    const target = flattenedData.find(v => v.id === node.id);
    target.expression = expr;
    target.id = `v${this.nextId++}`;
    this.flattenedData.next(flattenedData);
    this.tryCreateVar(this.flattenedData.value);
  }
  newNode(): string {
    const flattenedData = this.flattenedData.value;
    const newId = `v${this.nextId++}`;
    flattenedData.push({
      id: newId,
      expression: '',
      expandable: false,
      value: null,
      expanded: false,
      level: 0
    });
    this.flattenedData.next(flattenedData);
    return newId;
  }

  clearAllNode() {
    const flattenedData = this.flattenedData.value;
    for (const i of flattenedData.filter(v => v.level === 0)) {
      this.deleteNode(i, 'user');
    }
  }
}
