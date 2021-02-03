import { Injectable } from '@angular/core';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ElectronService } from '../core/services/electron/electron.service'
import { EditorService } from './editor.service';
import { Tab, TabsService } from './tabs.service';
import { OpenFileOptions, SaveFileOptions, SaveAsFileOptions } from '../../background/handlers/typing'

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
    this.editorService.editorMessage.subscribe(({ type, arg }) => {
      switch (type) {
        case "requestSave":
          this.save();
          break;
        case "requestOpen":
          // Do not locate if we are in a temporary file
          if (this.tabsService.getActive().value.path === null) break;
          this.locate(arg.path, arg.selection.startLineNumber, arg.selection.startColumn);
          break;
      }
    });
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
    } as SaveAsFileOptions);
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
      } as SaveFileOptions);
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
    const result = this.electronService.ipcRenderer.sendSync("file/open", {
      showDialog: true,
      paths: []
    } as OpenFileOptions);
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
    const newKey = uuidv4();
    this.tabsService.add({
      key: newKey,
      type: "file",
      title: `new${this.nextUntitledNumber}.cpp`
    });
    this.tabsService.changeActive(newKey);
    this.succUntitledNumber();
  }

  /**
   * Locate to a specify position of a file
   * @param filepath 
   * @param row position
   * @param col position
   * @param type "cursor" means set cursor to that position, "debug" means set trace line 
   */
  locate(filepath: string, row: number, col: number, type: "cursor" | "debug" = "cursor") {
    const target = this.tabsService.tabList.find(t => t.path === filepath);
    if (typeof target === "undefined") {
      const result = this.electronService.ipcRenderer.sendSync("file/open", {
        showDialog: false,
        paths: [
          filepath
        ]
      } as OpenFileOptions);
      if (!result.success || result.files.length < 1) {
        if ("error" in result) {
          alert(result.error);
        }
        return false;
      }
      const file = result.files[0];
      this.tabsService.add({
        key: file.key,
        type: "file",
        title: path.basename(file.path),
        code: file.content,
        path: file.path,
      });
      this.tabsService.changeActive(file.key);
    } else {
      this.tabsService.changeActive(target.key);
    }
    if (type === "cursor") {
      this.editorService.setPosition({
        lineNumber: row,
        column: col
      });
    } else if (type === "debug") {
      this.editorService.showTrace(row);
    }
  }
}
