import { Injectable } from '@angular/core';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ElectronService } from '../core/services'
import { EditorService } from './editor.service';
import { Tab, TabsService } from './tabs.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private nextUntitledNumber: number = 1;
  constructor(
    private editorService: EditorService,
    private tabsService: TabsService,
    private electronService: ElectronService) {
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

  /**
   * Return current file type.
   * If no active file, return "none";
   * If active file is not in disk (a temp new file), return "temp";
   * If active file is located at disk, return "file".
   */
  currentFileType(): "none" | "temp" | "file" {
    const activeTab = this.tabsService.getActive().value;
    if (activeTab === null || activeTab.type !== "file") return "none";
    if (activeTab.path === null) return "temp";
    return "file";
  }

  currentFileName(): string | null {
    return this.tabsService.getActive().value?.title ?? null;
  }

  async saveAs(tab?: Tab) : Promise<string | null> {
    this.tabsService.syncActiveCode();
    if (typeof tab === "undefined") tab = this.tabsService.getActive().value;
    const result = await this.electronService.ipcRenderer.invoke("file/saveAs", {
      content: tab.code,
      defaultFilename:
        tab.path === null
          ? tab.title
          : tab.path,
    });
    if (result.success === false) {
      if (result.cancelled === false) {
        alert(result.error);
      }
      return null;
    } else {
      this.tabsService.saveCode(tab.key, result.path);
      return result.path;
    }
  }

  /** @return saved file path, null if not successful */
  async save(tab?: Tab): Promise<string | null> {
    this.tabsService.syncActiveCode();
    if (typeof tab === "undefined") tab = this.tabsService.getActive().value;
    // new file, not stored yet
    if (tab.path === null) {
      return this.saveAs(tab);
    } else {
      const result = await this.electronService.ipcRenderer.invoke("file/save", {
        content: tab.code,
        path: tab.path,
      });
      if (result.success === false) {
        alert(result.error);
        return null;
      }
      this.tabsService.saveCode(tab.key, tab.path);
      return tab.path;
    }
  }

  /** Save active file when it's not saved */
  async saveOnNeed(): Promise<string | null> {
    const target = this.tabsService.getActive().value;
    if (!target.saved) return this.save(target);
    else return target.path;
  }

  async open() {
    const result = await this.electronService.ipcRenderer.invoke("file/open", {
      showDialog: true,
      paths: []
    });
    if (result.success === false) {
      alert(result.error);
      return false;
    }
    const tabList = this.tabsService.tabList.map(tab => tab.path);
    for (const file of result.files) {
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
  async locate(filepath: string, row: number, col: number, type: "cursor" | "debug" = "cursor") {
    const target = this.tabsService.tabList.find(t => t.path === filepath);
    if (typeof target === "undefined") {
      const result = await this.electronService.ipcRenderer.invoke("file/open", {
        showDialog: false,
        paths: [
          filepath
        ]
      });
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
