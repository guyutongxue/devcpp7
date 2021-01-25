import { Injectable } from '@angular/core';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ElectronService } from '../core/services/electron/electron.service'
import { EditorService } from './editor.service';
import { Tab, TabsService } from './tabs.service'

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private nextUntitledNumber: number = 1;
  constructor(
    private editorService: EditorService,
    private tabsService: TabsService,
    private electronService: ElectronService) {
    this.electronService.ipcRenderer.on('ng:file-control/save', (_) => {
        this.save();
    });
    this.editorService.eventEmitter.subscribe((message: string) => {
      if (message === "requestSave") {
        this.save();
      }
    })
   }

  private succUntitledNumber() {
    this.nextUntitledNumber++;
  }

  saveAs(tab?: Tab) {
    if (typeof tab === "undefined") this.tabsService.getActive().value;
    let result = this.electronService.ipcRenderer.sendSync("file/saveAs", {
      content: tab.code,
      defaultFilename:
        tab.path === null
          ? tab.title
          : tab.path,
    });
    if (!result.success) {
      if ("error" in result) {
        alert(result.error);
      }
      return false;
    }
    this.tabsService.saveCode(tab.key, result.path);
    return true;
  }

  save(tab?: Tab) {
    this.tabsService.syncActiveCode();
    if (typeof tab === "undefined") tab = this.tabsService.getActive().value;
    // new file, not stored yet
    if (tab.path === null) {
      return this.saveAs(tab);
    } else {
      let result = this.electronService.ipcRenderer.sendSync("file/save", {
        content: tab.code,
        path: tab.path,
      });
      if (!result.success) {
        if ("error" in result) {
          alert(result.error);
        }
        return false;
      }
      this.tabsService.saveCode(tab.key, tab.path);
      return true;
    }
  }

  open() {
    let result = this.electronService.ipcRenderer.sendSync("file/open", {});
    if (!result.success) {
      if ("error" in result) {
        alert(result.error);
      }
      return false;
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
    return true;
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
