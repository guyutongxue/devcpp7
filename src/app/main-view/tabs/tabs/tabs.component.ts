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
