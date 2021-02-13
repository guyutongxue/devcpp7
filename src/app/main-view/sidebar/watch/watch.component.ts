import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl, TreeControl } from '@angular/cdk/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, merge, Observable, of, Subscription } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';
import { GdbArray } from 'tsgdbmi';
import { DebugService, GdbVarInfo } from '../../../services/debug.service';

interface FlatNode extends GdbVarInfo {
  level: number;
  loading?: boolean;
}

const TREE_DATA: FlatNode[] = [
  {
    id: "v0",
    expression: 'a',
    value: null,
    level: 0,
    expandable: true
  },
  {
    id: "v1",
    expression: 'b',
    value: null,
    level: 0,
    expandable: true
  }
];

function getChildren(node: FlatNode): Observable<FlatNode[]> {
  return of([
    {
      id: Date.now().toString(10),
      expression: `Child Node (level-${node.level + 1})`,
      value: null,
      level: node.level + 1,
      expandable: true
    },
    {
      id: Date.now().toString(10),
      expression: `Child Node (level-${node.level + 1})`,
      value: null,
      level: node.level + 1,
      expandable: true
    },
    {
      id: Date.now().toString(10),
      expression: `Leaf Node (level-${node.level + 1})`,
      value: null,
      level: node.level + 1,
      expandable: false
    }
  ]).pipe(delay(500));
}


class DynamicDatasource implements DataSource<FlatNode> {

  constructor(private treeControl: TreeControl<FlatNode>,
    private flattenedData: BehaviorSubject<FlatNode[]>,
    private onExpand: (node: FlatNode) => void,
    private onShrink: (node: FlatNode) => void) {
    treeControl.dataNodes = this.flattenedData.value;
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
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

  expandFlattenedNodes(nodes: FlatNode[]): FlatNode[] {
    const treeControl = this.treeControl;
    const results: FlatNode[] = [];
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
        currentExpand[treeControl.getLevel(node) + 1] = treeControl.isExpanded(node);
      }
    });
    return results;
  }

  handleExpansionChange(change: SelectionChange<FlatNode>): void {
    if (change.added) {
      change.added.forEach(node => this.onExpand(node));
    }
    if (change.removed) {
      change.removed.forEach(node => this.onShrink(node));
    }
  }

  disconnect(): void { }
}

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WatchComponent implements OnInit, OnDestroy {

  localVariables$: Observable<NzTreeNodeOptions[]>;
  isDebugging$: Observable<boolean>;
  private programStopSubscription: Subscription;

  flattenedData: BehaviorSubject<FlatNode[]> = new BehaviorSubject(TREE_DATA);
  editingNodeId: string | null = null;
  editingValue: string = "";

  constructor(private debugService: DebugService) { }

  ngOnInit(): void {
    this.localVariables$ = this.debugService.localVariables$.pipe(
      map(arr => arr.map<NzTreeNodeOptions>(val => ({
        key: val["name"],
        title: `${val["name"]} : ${val["value"]}`,
        isLeaf: true
      })))
    );
    this.isDebugging$ = this.debugService.isDebugging;
    this.programStopSubscription = this.debugService.programStop.subscribe(async _ => {
      await this.tryCreateVar(this.flattenedData.value);
      this.updateVar(this.flattenedData.value);
    })
    console.log(this.debugService);
  }

  ngOnDestroy(): void {
    this.programStopSubscription.unsubscribe();
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.value !== null && node.expandable
  );
  dataSource = new DynamicDatasource(
    this.treeControl,
    this.flattenedData,
    (a) => { this.loadChildren(a) },
    (a) => { this.deleteNode(a, true) }
  );

  private async tryCreateVar(data: FlatNode[]) {
    const needCreateVar: FlatNode[] = [];
    data.forEach(v => {
      if (v.value === null) {
        v.loading = true;
        needCreateVar.push(v);
      }
    });
    this.flattenedData.next(data);
    const result = await this.debugService.createVariables(needCreateVar);
    console.log(result);
    this.flattenedData.next(data.map(v => ({
      ...(result.find(o => o?.id === v.id) ?? v),
      level: v.level,
      loading: false
    })));
  }

  private async updateVar(data: FlatNode[]) {
    const needUpdateVar = data.filter(v => v.value !== null);
    const { deleteList, collapseList } = await this.debugService.updateVariables(needUpdateVar);
    for (const id of collapseList) {
      const target = data.find(v => v.id === id);
      this.deleteNode(target, true);
    }
    for (const id of deleteList) {
      const target = data.find(v => v.id === id);
      target.value = null;
    }
    this.flattenedData.next(data);
  }

  async loadChildren(node: FlatNode) {
    node.loading = true;
    const children = await this.debugService.getVariableChildren(node.id);
    node.loading = false;
    const flattenedData = this.flattenedData.value;
    const index = flattenedData.indexOf(node);
    flattenedData.splice(index + 1, 0, ...(children.map(c => ({
      ...c,
      level: node.level + 1
    }))));
    this.flattenedData.next(flattenedData);
  }

  deleteNode(node: FlatNode, childrenOnly = false): void {
    const flattenedData = this.flattenedData.value;
    const fromIndex = flattenedData.findIndex(v => v.id === node.id) + 1;
    const toIndex = flattenedData.findIndex((val, index) => index >= fromIndex && val.level === node.level);
    if (toIndex === -1) flattenedData.splice(fromIndex);
    else flattenedData.splice(fromIndex, toIndex - fromIndex);
    if (!childrenOnly) flattenedData.splice(fromIndex - 1, 1);
    this.flattenedData.next(flattenedData);
    this.debugService.deleteVariable(node.id, childrenOnly);
  }

  tryEdit(node: FlatNode) {
    console.log(node);
    if (node.level !== 0) return;
    this.deleteNode(node, true);
    this.editingValue = node.expression;
    this.editingNodeId = node.id;
    this.treeControl.collapse(node);
  }
  saveEdit(node: FlatNode) {
    node.expression = this.editingValue;
    this.editingNodeId = null;
  }
}
