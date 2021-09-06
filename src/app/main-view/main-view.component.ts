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

import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IOutputData } from 'angular-split';
import { ProblemsService } from '../services/problems.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  readonly sidebarItems = [
    {
      title: '大纲',
      url: 'outline',
      icon: 'partition',
      disabled: false
    },
    {
      title: '项目管理',
      url: 'project',
      icon: 'project',
      disabled: true
    },
    {
      title: '调试查看',
      url: 'watch',
      icon: 'eye',
      disabled: false
    }
  ];
  currentOutletUrl(name: string) {
    const routerChildren = this.router.parseUrl(this.router.url).root.children;
    if (name in routerChildren) {
      return routerChildren[name].segments[0].path;
    }
    return null;
  }

  readonly toolsItems = [
    {
      title: '问题',
      url: 'problems',
      disabled: false
    },
    {
      title: '输出',
      url: 'output',
      disabled: false
    },
    {
      title: '调试',
      url: 'debug',
      disabled: false
    }
  ];

  constructor(private router: Router, private problemsService: ProblemsService) { }

  ngOnInit(): void { }

  showSidebar(who: string): void {
    if (who === this.currentOutletUrl("sidebar") || who === null) {
      this.router.navigate([{
        outlets: {
          sidebar: null
        }
      }]);
    } else {
      if (this.sidebarItems.find(i => i.url === who).disabled) return;
      this.router.navigate([{
        outlets: {
          sidebar: who
        }
      }]);
    }
  }

  showTools(who: string): void {
    if (who === this.currentOutletUrl("tools") || who === null) {
      this.router.navigate([{
        outlets: {
          tools: null
        }
      }]);
    } else {
      if (this.toolsItems.find(i => i.url === who).disabled) return;
      this.router.navigate([{
        outlets: {
          tools: who
        }
      }]);
    }
  }

  toolsSizeOnChange(event: IOutputData) {
    this.problemsService.panelHeight = event.sizes[1] as number;
  }
}
