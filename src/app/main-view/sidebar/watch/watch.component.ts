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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TreeControl } from '@angular/cdk/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DebugService } from '../../../services/debug.service';
import { WatchService, DynamicDatasource, GdbVarInfoNode } from '../../../services/watch.service';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WatchComponent implements OnInit {

  localVariables$: Observable<NzTreeNodeOptions[]>;
  isDebugging$: Observable<boolean>;
  treeControl: TreeControl<GdbVarInfoNode>;
  dataSource: DynamicDatasource;
  editingNodeId: string | null = null;
  editingValue: string = "";

  constructor(private debugService: DebugService, private watchService: WatchService) { }

  ngOnInit(): void {
    this.localVariables$ = this.debugService.localVariables$.pipe(
      map(arr => arr.map<NzTreeNodeOptions>(val => ({
        key: val["name"],
        title: `${val["name"]} : ${val["value"]}`,
        isLeaf: true
      })))
    );
    this.isDebugging$ = this.debugService.isDebugging$.pipe(
      distinctUntilChanged()
    );
    this.dataSource = this.watchService.dataSource;
    this.treeControl = this.watchService.treeControl;
  }

  tryEdit(node: GdbVarInfoNode) {
    if (node.level !== 0) return;
    this.watchService.editNode(node);
    this.editingValue = node.expression;
    this.editingNodeId = node.id;
  }
  saveEdit(node: GdbVarInfoNode) {
    if (this.editingValue.trim() !== "")
      this.watchService.saveNode(node, this.editingValue);
    else
      this.watchService.deleteNode(node, 'user');
    this.editingNodeId = null;
  }

  newVariable() {
    const newId = this.watchService.newNode();
    this.editingValue = '';
    this.editingNodeId = newId;
  }

  clearAll() {
    this.watchService.clearAllNode();
  }
}
