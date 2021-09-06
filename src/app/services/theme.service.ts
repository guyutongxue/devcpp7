// Copyright (C) 2021 Guyutongxue
//
// This file is part of devcpp7.
//
// devcpp7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// devcpp7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with devcpp7.  If not, see <http://www.gnu.org/licenses/>.

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ElectronService } from '../core/services';
import { EditorService } from './editor.service';

// https://github.com/yangjunhan/nz-themes/blob/master/src/app/theme.service.ts

enum ThemeType {
  Light = "light",
  Dark = "dark"
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(
    private electronService: ElectronService,
    private editorService: EditorService,
    @Inject(DOCUMENT) private document: Document
  ) {
    console.log(this);
  }

  private currentTheme: ThemeType | null = null;

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.Dark ? ThemeType.Light : ThemeType.Dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    this.document.documentElement.classList.remove(theme);
    const removedThemeStyle = this.document.getElementById(theme);
    if (removedThemeStyle) {
      this.document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = this.document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      this.document.head.append(style);
    });
  }

  private loadMainTheme(): Promise<Event> {
    const theme = this.currentTheme;
    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          this.document.documentElement.classList.add(theme);
          this.removeUnusedTheme(this.reverseTheme(theme));
          resolve(e);
        },
        (e) => reject(e)
      );
    });
  }

  private async changeMainTheme(theme: ThemeType) {
    if (theme == this.currentTheme) return;
    this.currentTheme = theme;
    return this.loadMainTheme();
  }

  private setRootCssVariable(name: string, value: string) {
    // this.rootCssVariables[name] = value;
    this.document.documentElement.style.setProperty(name, value);
  }

  async setTheme(name?: string): Promise<void> {
    const result = await this.electronService.ipcRenderer.invoke('theme/getData', name);
    if (typeof result === 'undefined') {
      // yarn start, result is undefined
      this.changeMainTheme(ThemeType.Light);
      return;
    }
    if (!result.success) {
      alert(result.error);
    }
    const theme = result.theme;
    this.changeMainTheme(theme.type as ThemeType);
    this.setRootCssVariable("--breakpoint-background-color", theme.colors.breakpoint);
    this.setRootCssVariable("--debug-step-background-color", theme.colors.debugStep);
    const nonTokenColors = [
      "background", "foreground", "activeLine", "debugStep", "breakpoint"
    ];
    const rules: monaco.editor.ITokenThemeRule[] = Object.entries(theme.colors)
      .filter(([key, _]) => !nonTokenColors.includes(key))
      .map(([key, value]) => {
        const styles: string[] = [];
        if (theme.boldTokens.includes(key)) styles.push("bold");
        if (theme.italicTokens.includes(key)) styles.push("italic");
        if (theme.underlineTokens.includes(key)) styles.push("underline");
        return {
          token: key,
          foreground: value,
          fontStyle: styles.join(" ")
        };
      });
    const editorTheme: monaco.editor.IStandaloneThemeData = {
      base: theme.type === 'light' ? 'vs': 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': theme.colors.background,
        'editor.lineHighlightBackground': theme.colors.activeLine,
      },
      rules: [
        {
          token: '',
          foreground: theme.colors.foreground,
        },
        ...rules
      ]
    };
    this.editorService.setEditorTheme(editorTheme);
  }
}
