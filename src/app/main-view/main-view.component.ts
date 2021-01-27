import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router';
import { SplitAreaDirective } from 'angular-split';
import { ProblemsService } from '../services/problems.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  // https://github.com/angular-split/angular-split/issues/224
  encapsulation: ViewEncapsulation.None
})
export class MainViewComponent implements OnInit, AfterViewInit {
  @ViewChildren(SplitAreaDirective) private areasEl: QueryList<SplitAreaDirective>;
  private splitArea(id: string): SplitAreaDirective {
    if (typeof this.areasEl === "undefined") return null;
    return this.areasEl.find(i => i.elRef.nativeElement.id === id);
  }

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
      disabled: true
    }
  ];
  currentSidebarUrl = null;

  readonly toolsItems = [
    {
      title: '问题',
      url: 'problems',
      disabled: false
    },
    {
      title: '输出',
      url: 'output',
      disabled: true
    }
  ]
  currentToolsUrl = null;

  constructor(private router: Router, private problemsService: ProblemsService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.showSidebar('outline');
    this.showTools(null);
  }

  showSidebar(who: string): void {
    if (who === this.currentSidebarUrl || who === null) {
      this.currentSidebarUrl = null;
      this.router.navigate([{
        outlets: {
          sidebar: null
        }
      }]);
      this.splitArea("sidebarArea")?.collapse();
    } else {
      if (this.sidebarItems.find(i => i.url === who).disabled) return;
      this.currentSidebarUrl = who;
      this.router.navigate([{
        outlets: {
          sidebar: who
        }
      }]);
      this.splitArea("sidebarArea")?.expand();
    }
  }

  showTools(who: string): void {
    if (who === this.currentToolsUrl || who === null) {
      this.currentToolsUrl = null;
      this.router.navigate([{
        outlets: {
          tools: null
        }
      }]);
      this.splitArea("toolsArea")?.collapse();
    } else {
      if (this.toolsItems.find(i => i.url === who).disabled) return;
      this.currentToolsUrl = who;
      this.router.navigate([{
        outlets: {
          tools: who
        }
      }]);
      this.splitArea("toolsArea")?.expand();
    }
  }

  toolsSizeOnChange(event: { sizes: number[] }) {
    this.problemsService.panelHeight = event.sizes[1];
  }
}
