import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { fromEventPattern } from 'rxjs';
import { TabsService } from '../../../services/tabs.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {

  constructor(private router: Router,
    private tabsService: TabsService) { }

  ngOnInit(): void { 
    if (this.tabsService.getActive().index !== null)
      this.activeIndex = this.activeIndex;
  }

  get tabList() {
    return this.tabsService.tabList;
  }

  get activeIndex(): number {
    return this.tabsService.getActive().index;
  }
  set activeIndex(index: number) {
    this.router.navigate(['file/' + this.tabList[index].key]);
    this.tabsService.changeActive(index);
  }

  closeTab(e: { index: number }) {
    this.tabsService.removeAt(e.index);
    if (this.tabList.length === 0) {
      this.router.navigate(['']);
    }
  }

  // https://github.com/NG-ZORRO/ng-zorro-antd/issues/3461
  cdkOnDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tabsService.tabList, event.previousIndex, event.currentIndex);
    // this.activeIndex = event.currentIndex;
  }
}
