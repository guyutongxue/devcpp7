import { Injectable } from '@angular/core';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ipcRenderer } from 'electron'

import { TabsService } from './tabs.service'

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private nextUntitledNumber: number = 1;
  constructor(private tabsService: TabsService) { }

  private succUntitledNumber() {
    this.nextUntitledNumber++;
  }

  saveAs() {
    let activeTab = this.tabsService.getActive();
    let result = ipcRenderer.sendSync("file/saveAs", {
      content: activeTab.code,
      defaultFilename:
        activeTab.path === ""
          ? activeTab.title
          : activeTab.path,
    });
    if (!result.success) {
      if ("error" in result) {
        alert(result.error);
      }
      return;
    }
    this.tabsService.saveCode(activeTab.key, result.path);
  }

  save() {
    // new file, not stored yet
    let activeTab = this.tabsService.getActive();
    if (activeTab.path === null) {
      this.saveAs();
    } else {
      let result = ipcRenderer.sendSync("file/save", {
        content: activeTab.code,
        path: activeTab.path,
      });
      if (!result.success) {
        if ("error" in result) {
          alert(result.error);
        }
        return;
      }
      this.tabsService.saveCode(activeTab.key, activeTab.path);
    }
  }

  open() {
    let result = ipcRenderer.sendSync("file/open", {});
    if (!result.success) {
      if ("error" in result) {
        alert(result.error);
      }
      return;
    }
    let tabList = this.tabsService.tabList.map(tab => tab.path);
    for (let file of result.files) {
      if (tabList.includes(file.path)) {
        continue;
      }
      this.tabsService.add({
        key: file.key,
        type: "file",
        title: path.basename(file.path),
        code: file.content,
        path: file.path,
      });
      this.tabsService.changeActiveByKey(file.key);
    }
  }
  
  new() {
    let newKey = uuidv4();
    this.tabsService.add({
      key: newKey,
      type: "file",
      title: `new${this.nextUntitledNumber}.cpp`
    });
    this.tabsService.changeActiveByKey(newKey);
    this.succUntitledNumber();
  }
}
