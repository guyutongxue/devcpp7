import { Component, ElementRef, OnInit } from '@angular/core';
import { GccDiagnostic } from '../../../../background/handlers/typing';
import { ProblemsService } from '../../../services/problems.service'

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
  // [[TODO]]
  private diagRawData: GccDiagnostic[] = require("./temp.json");
  flattenData: ITreeNode[] = [];

  constructor(private problemsService: ProblemsService) { }

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

  ngOnInit(): void {
    this.diagRawData.forEach(item => {
      this.flattenData.splice(-1, 0, ...this.flattener(item));
    });
  }
}
