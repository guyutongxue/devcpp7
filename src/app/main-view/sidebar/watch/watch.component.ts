import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TreeControl } from '@angular/cdk/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import {  Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DebugService } from '../../../services/debug.service';
import { WatchService, DynamicDatasource, GdbVarInfoNode } from '../../../services/watch.service';
import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';

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
    this.isDebugging$ = this.debugService.isDebugging.pipe(
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
