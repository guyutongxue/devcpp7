import { Injectable } from '@angular/core';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ElectronService } from '../core/services/electron/electron.service'
import { TabsService } from './tabs.service'

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private nextUntitledNumber: number = 1;
  constructor(private tabsService: TabsService, private electronService: ElectronService) { }

  private succUntitledNumber() {
    this.nextUntitledNumber++;
  }

  saveAs() {
    let activeTab = this.tabsService.getActive().value;
    let result = this.electronService.ipcRenderer.sendSync("file/saveAs", {
      content: activeTab.code,
      defaultFilename:
        activeTab.path === null
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
    this.tabsService.syncActiveCode();
    // new file, not stored yet
    let activeTab = this.tabsService.getActive().value;
    if (activeTab.path === null) {
      this.saveAs();
    } else {
      let result = this.electronService.ipcRenderer.sendSync("file/save", {
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
    let result = this.electronService.ipcRenderer.sendSync("file/open", {});
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
      this.tabsService.changeActive(file.key);
    }
  }

  new() {
    let newKey = uuidv4();
    this.tabsService.add({
      key: newKey,
      type: "file",
      title: `new${this.nextUntitledNumber}.cpp`
    });
    this.tabsService.changeActive(newKey);
    this.succUntitledNumber();
  }
}
