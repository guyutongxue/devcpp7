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

import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Tab, TabsService } from '../../../services/tabs.service'
import { Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { StatusService } from '../../../services/status.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {

  constructor(private router: Router,
    private tabsService: TabsService,
    private fileService: FileService,
    private statusService: StatusService
  ) { }

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
    if (index >= 0) {
      this.router.navigate(['file/' + this.tabList[index].key]);
      this.tabsService.changeActive(index);
    }
  }

  private doRemoveTab(tab: Tab) {
    this.tabsService.remove(tab.key);
    if (this.tabList.length === 0) {
      this.router.navigate(['empty']);
    }
  }

  closeTab(e: { index: number }) {
    if (this.statusService.isBuilding || this.statusService.isDebugging) {
      return;
    }
    const target = this.tabList[e.index];
    if (target.saved === false) {
      this.notSaveModalShow(target);
    } else {
      this.doRemoveTab(target);
    }
  }

  // https://github.com/NG-ZORRO/ng-zorro-antd/issues/3461
  cdkOnDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tabsService.tabList, event.previousIndex, event.currentIndex);
    // this.activeIndex = event.currentIndex;
  }

  notSaveModalTab: Tab;
  notSaveModalVisible: boolean = false;
  notSaveModalYes() {
    this.notSaveModalVisible = false;
    if (this.fileService.save(this.notSaveModalTab))
      this.doRemoveTab(this.notSaveModalTab);
  }
  notSaveModalNo() {
    this.notSaveModalVisible = false;
    this.doRemoveTab(this.notSaveModalTab);
  }
  notSaveModalCancel() {
    this.notSaveModalVisible = false;
  }

  private notSaveModalShow(target: Tab) {
    this.notSaveModalTab = target;
    this.notSaveModalVisible = true;
  }
}
