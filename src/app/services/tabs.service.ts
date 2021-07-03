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

import { Injectable } from '@angular/core';
import * as path from 'path';
import { ElectronService } from '../core/services';
import { EditorService } from './editor.service';

export interface Tab {
  key: string, // An unique udid for each tab
  type: "file" | "setting",
  title: string,
  code: string,
  path: string,
  saved: boolean
}

interface Enumerate<T> {
  index: number;
  value: T;
}
const nullEnum: Enumerate<any> = {
  index: null,
  value: null
};

interface TabOptions {
  key: string,
  type: "file" | "setting",
  title: string,
  code?: string,
  path?: string
}

// const initTab: Tab[] = [{
//   key: "aaa",
//   type: "file",
//   title: "a.cpp",
//   code: "int main() {}",
//   path: null,
//   saved: false
// }, {
//   key: "bbb",
//   type: "file",
//   title: "b.cpp",
//   code: "#include <cstdio>\nint main() { ; ; ; }",
//   path: null,
//   saved: false
// }];

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  tabList: Tab[] = [];
  private activeTabKey: string = null;

  constructor(private electronService: ElectronService, private editorService: EditorService) {
    // TabsService controls how EditorService works.
    // When EditorService is not initialized, TabsService should do noting.
    // So I add `if (!this.editorService.isInit) return;` in each function
    // that use EditorService.
    // When initialization finished, it will send a event. TabsService will
    // do necessary initialization by calling `getActive` then.
    this.editorService.editorMessage.subscribe(({type, arg}) => {
      if (type === "initCompleted") {
        this.getActive();
      }
    })
  }

  syncActiveCode() {
    if (!this.editorService.isInit) return;
    if (this.getActive().value === null) return;
    this.getActive().value.code = this.editorService.getCode();
  }

  getActive(): Enumerate<Tab> {
    if (this.activeTabKey === null) return nullEnum;
    return this.getByKey(this.activeTabKey)
  }

  getByKey(key: string): Enumerate<Tab> {
    const index = this.tabList.findIndex((x: Tab) => x.key === key);
    if (index === -1) return nullEnum;
    return {
      index,
      value: this.tabList[index]
    }
  }

  changeActive(key?: string): void;
  changeActive(index: number): void;
  changeActive(arg: any) {
    if (typeof arg === "undefined") {
      if (this.editorService.isInit) this.editorService.switchToModel(this.getActive().value);
      return;
    }
    if (this.activeTabKey !== null) {
      this.syncActiveCode();
    }
    if (typeof arg === "string") {
      this.activeTabKey = arg;
    }
    else if (typeof arg === "number") {
      this.activeTabKey = this.tabList[arg].key;
    }
    const newActive = this.getActive().value;
    if (newActive.type === "file" && this.editorService.isInit)
      this.editorService.switchToModel(newActive);
    this.electronService.ipcRenderer.invoke('window/setTitle', newActive.path ?? newActive.title);
  }

  get hasActiveFile() {
    const activeTab = this.getActive().value;
    return activeTab !== null && activeTab.type === "file";
  }

  add(options: TabOptions) {
    const newTab: Tab = {
      key: options.key,
      type: options.type,
      title: options.title,
      code: options.code ?? "",
      saved: true, // !(options.type === "file" && typeof options.path === "undefined") // use this if create unsaved new file
      path: options.path ?? null
    };
    this.tabList.push(newTab);
  }

  /** @return new active index */
  remove(key: string): number {
    // Clone it, for we will remove it's src later
    const index = this.getByKey(key).index;
    let newIndex = -1;
    const target: Tab = { ...this.tabList[index] };
    this.tabList.splice(index, 1);
    // closing current tab
    if (this.activeTabKey === key) {
      this.activeTabKey = null;
      if (this.tabList.length === 0) {
        // The only tab in MainView
        this.electronService.ipcRenderer.invoke('window/setTitle', '');
      } else if (index === this.tabList.length) {
        // The last tab, move to front
        newIndex = index - 1;
      } else {
        // Stay on current index (next tab)
        newIndex = index;
      }
    }
    if (target.type === "file")
      this.editorService.destroy(target);
    return newIndex;
  }

  saveCode(key: string, savePath: string) {
    if (!this.editorService.isInit) return;
    const target = this.getByKey(key).value;
    const oldPath = target.path;
    target.saved = true;
    target.path = savePath;
    target.title = path.basename(savePath);
    this.editorService.switchToModel(target, savePath !== oldPath);
  }
}
