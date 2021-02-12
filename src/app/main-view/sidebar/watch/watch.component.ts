import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl, TreeControl } from '@angular/cdk/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';
import { GdbArray } from 'tsgdbmi';
import { DebugService, GdbVarInfo } from '../../../services/debug.service';

interface FlatNode extends GdbVarInfo {
  expandable: boolean;
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
export class WatchComponent implements OnInit {

  localVariables$: Observable<NzTreeNodeOptions[]>;
  isDebugging$: Observable<boolean>;

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
    console.log(this.debugService);
  }
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  dataSource = new DynamicDatasource(this.treeControl, this.flattenedData, (a) => { this.loadChildren(a) }, (a)=>{ this.deleteChildren(a) });

  hasChild = (_: number, node: FlatNode) => node.expandable;

  loadChildren(node: FlatNode): void {
    node.loading = true;
    getChildren(node).pipe(
      take(1)
    ).subscribe(children => {
      node.loading = false;
      const flattenedData = this.flattenedData.value;
      const index = flattenedData.indexOf(node);
      flattenedData.splice(index + 1, 0, ...children);
      this.flattenedData.next(flattenedData);
    });
  }

  deleteChildren(node: FlatNode): void {
    const flattenedData = this.flattenedData.value;
    const fromIndex = flattenedData.indexOf(node) + 1;
    const toIndex = flattenedData.findIndex((val, index) => index >= fromIndex && val.level === node.level);
    if (toIndex === -1) flattenedData.splice(fromIndex);
    else flattenedData.splice(fromIndex, toIndex - fromIndex);
    this.flattenedData.next(flattenedData);
  }

  tryEdit(node: FlatNode) {
    console.log(node);
    if (node.level !== 0) return;
    this.deleteChildren(node);
    this.editingValue = node.expression;
    this.editingNodeId = node.id;
    this.treeControl.collapse(node);
  }
  saveEdit(node: FlatNode) {
    node.expression = this.editingValue;
    this.editingNodeId = null;
  }
}
