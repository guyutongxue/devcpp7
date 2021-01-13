import { Component, OnInit } from '@angular/core';
import { TabsService } from '../../../services/tabs.service'

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  selectedIndex: number = 0;
  keyList: string[];

  constructor(private tabsService: TabsService) { }

  ngOnInit(): void { }
  
  get tabList() {
    return this.tabsService.tabList;
  }

  get activeKey(): string {
    return this.tabsService.activeTabKey;
  }
  set activeKey(key: string) {
    this.tabsService.changeActiveByKey(key);
  }

  getTabByKey(key: string) {
    return this.tabsService.getByKey(key);
  }

  newTab() { 

  }
  closeTab(e: { index: number }) { 
    this.tabsService.removeAt(e.index);
  }
}
