import { Component, Input, OnInit } from '@angular/core';

import { Pipe, PipeTransform } from '@angular/core';
import { Command, StatusService } from '../../services/status.service';

export type DropdownList = Array<
string | {
  title: string,
  children: string[]
}
>

@Pipe({
  name: 'typeof'
})
export class TypeofPipe implements PipeTransform {
  transform(value: any): any {
    return typeof value;
  }
}

@Pipe({
  name: 'shortcutTranslate'
})
export class ShortcutTranslatePipe implements PipeTransform {
  transform(value: string): string {
    if (value === null) return '';
    return value.split('.').map(v => {
      switch (v) {
        case 'control': return 'Ctrl';
        case 'alt': return 'Alt';
        case 'shift': return 'Shift';
        default: return v.toUpperCase();
      }
    }).join('+');
  }
}

@Component({
  selector: 'app-header-dropdown',
  templateUrl: './header-dropdown.component.html',
  styleUrls: ['./header-dropdown.component.scss']
})
export class HeaderDropdownComponent implements OnInit {

  readonly commandList: {
    [key: string]: Command
  }

  constructor(
    private statusService: StatusService
  ) { 
    this.commandList = this.statusService.commandList
  }

  @Input('data') list: DropdownList;

  ngOnInit(): void {
  }

}
