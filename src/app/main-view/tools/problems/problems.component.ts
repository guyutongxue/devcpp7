import { Component, ElementRef, OnInit } from '@angular/core';
import { GccDiagnostic, GccDiagnosticPosition } from '../../../../background/handlers/typing';
import { ProblemsService } from '../../../services/problems.service';
import * as path from 'path'

export interface ITreeNode extends GccDiagnostic {
  level: number;
  expand: boolean;
  parent?: ITreeNode;
}


@Component({
  selector: 'app-problems',
  templateUrl: './problems.component.html',
  styleUrls: ['./problems.component.scss']
})
export class ProblemsComponent implements OnInit {

  readonly iconMap: { [key: string]: { type: string, color: string } } = {
    error: {
      type: 'close-circle',
      color: 'red'
    },
    warning: {
      type: 'warning',
      color: 'orange'
    },
    note: {
      type: 'info-circle',
      color: 'blue'
    } 
  }

  printPosition(position: GccDiagnosticPosition) {
    return `${path.basename(position.file.replace(/\n/g,'\\'))}:${position.line}:${position.column}`;
  }
  
  flattenData: ITreeNode[] = [];

  constructor(private problemsService: ProblemsService) { }

  ngOnInit(): void {
    this.problemsService.problems.subscribe(rawData => {
      this.flattenData = [];
      rawData.forEach(item => {
        this.flattenData.splice(-1, 0, ...this.flattener(item));
      });
      console.log(this.flattenData);
    })
  }

  get tableHeight(): number {
    return this.problemsService.panelHeight - this.tableHeaderHeight;
  }

  // Ant-design: font-size * line-height + 2 * padding
  private readonly tableHeaderHeight: number = 14 * 1.5715 + 2 * 8; 

  private flattener(root: GccDiagnostic): ITreeNode[] {
    const stack: ITreeNode[] = [];
    const array: ITreeNode[] = [];
    stack.push({ ...root, level: 0, expand: false });
    while (stack.length !== 0) {
      const node = stack.pop()!;
      array.push(node);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], level: node.level! + 1, expand: false, parent: node });
        }
      }
    }
    return array;
  }

}
