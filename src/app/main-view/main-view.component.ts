import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router';
import { SplitAreaDirective } from 'angular-split';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  // https://github.com/angular-split/angular-split/issues/224
  encapsulation: ViewEncapsulation.None
})
export class MainViewComponent implements OnInit {
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

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.showSidebar('outline');
  }

  showSidebar(who: string): void {
    if (who === this.currentSidebarUrl) {
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
}
