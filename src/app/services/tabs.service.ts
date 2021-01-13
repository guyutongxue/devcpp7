import { Injectable } from '@angular/core';
import * as path from 'path';

interface Tab {
  key: string, // An unique udid for each tab
  type: "file" | "devcpp",
  title: string,
  code: string,
  path: string,
  saved: boolean
}

interface TabOptions {
  key: string,
  type: "file" | "devcpp",
  title: string,
  code?: string,
  path?: string
}

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  tabList: Tab[] = [{
    key: "aaa",
    type: "file",
    title: "a.cpp",
    code: "int main() {}",
    path: null,
    saved: false
  }];

  activeTabKey: string = null;
  constructor() {
  }

  getActive() {
    if (this.activeTabKey === null) return undefined;
    return this.tabList.find(x => x.key === this.activeTabKey);
  }
  
  getByKey(key: string): Tab {
    return this.tabList.find(x => x.key === key);
  }
  private getIndexByKey(key: string): number {
    return this.tabList.findIndex((x: Tab) => x.key === key);
  }

  changeActiveByKey(key: string) {
    this.activeTabKey = key;
  }

  empty() {
    return this.tabList.length === 0;
  }

  add(options: TabOptions) {
    let newTab: Tab = {
      key: options.key,
      type: options.type,
      title: options.title,
      code: options.code ?? "",
      saved: options.path ? true : false,
      path: options.path ?? ""
    };
    this.tabList.push(newTab);
  }

  remove(key: string) {
    this.removeAt(this.getIndexByKey(key));
  }

  removeAt(index: number) {
    let target = this.tabList[index];
    if (target.saved === false) {
      // [TODO]
    }
    this.tabList.splice(index, 1);
    // closing current tab
    if (this.activeTabKey === target.key) {
      if (this.empty()) {
        // The only tab in MainView
        this.activeTabKey = null;
      } else if (index === this.tabList.length) {
        // The last tab, move to front
        this.activeTabKey = this.tabList[index - 1].key;
      } else {
        // Stay on current index (next tab)
        this.activeTabKey = this.tabList[index].key;
      }
    }
  }

  sortableHandler(oldIndex: number, newIndex: number) {
    this.tabList.splice(newIndex, 0, this.tabList.splice(oldIndex, 1)[0]);
  }

  updateCode(key: string, newCode: string) {
    let target = this.getByKey(key);
    target.code = newCode;
    target.saved = false;
  }

  saveCode(key: string, savePath: string) {
    let target = this.getByKey(key);
    target.saved = true;
    target.path = savePath;
    target.title = path.basename(savePath);
  }
}
