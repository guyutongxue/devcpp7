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

import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DebugService, FrameInfo } from '../../../services/debug.service';
import { EditorBreakpointInfo } from '../../../services/editor.service';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, AfterViewChecked {

  constructor(
    private fileService: FileService,
    private debugService: DebugService) { }

  @ViewChild("cOutput") private cOutput: ElementRef;

  selectedIndex: number = 0;

  isDebugging$: Observable<boolean>;

  expr: string = "";
  exprVal: string = "";

  consoleOutput$: Observable<string>;
  promptColor: string = "#262626";
  consoleInput: string = "";
  consoleInputEnabled = true;

  callStack$: Observable<FrameInfo[]>;
  // bkptList: FrameInfo[] = [];

  currentEditBkptline: number = null;
  currentEditValue: string = "";

  get enabled(): boolean {
    return this.fileService.currentFileType() !== "none";
  }

  getEditorBreakpoints() {
    return this.debugService.editorBkptList;
  }

  ngOnInit(): void {
    this.consoleOutput$ = this.debugService.consoleOutput$;
    this.isDebugging$ = this.debugService.isDebugging$.pipe(tap(value => {
      if (value) this.promptColor = "#262626";
    }));
    this.callStack$ = this.debugService.callStack$;
  }

  ngAfterViewChecked(): void {    
    try {
      this.cOutput.nativeElement.scrollTop = this.cOutput.nativeElement.scrollHeight;
    } catch (_) { }
  }

  startDebug() {
    this.debugService.startDebug();
  }

  exitDebug() {
    this.debugService.exitDebug();
  }

  async sendCommand() {
    this.consoleInputEnabled = false;
    const result = await this.debugService.sendCommand(this.consoleInput);
    this.consoleInputEnabled = true;
    this.consoleInput = "";
    if (result.message !== "error") this.promptColor = "green";
    else this.promptColor = "red";
  }

  debugContinue() {
    this.debugService.debugContinue();
  }
  debugStepover() {
    this.debugService.debugStepover();
  }
  debugStepinto() {
    this.debugService.debugStepinto();
  }
  debugStepout() {
    this.debugService.debugStepout();
  }
  debugRestart() {
    this.debugService.debugRestart();
  }

  async evalExpr() {
    this.exprVal = await this.debugService.evalExpr(this.expr);
  }

  printPosition(data: FrameInfo | EditorBreakpointInfo) {
    if ("file" in data)
      return `${path.basename(data.file.replace(/\n/g, '\\'))}:${data.line}`;
    else
      return `${this.fileService.currentFileName()}:${data.line}`;
  }
  locate(frame: FrameInfo) {
    this.fileService.locate(frame.file, frame.line, 1);
  }
  locateLine(line: number) {
    this.debugService.locateEditorBreakpoint(line);
  }

  startEditBkpt(data: EditorBreakpointInfo) {
    if (this.debugService.isDebugging$.value) return;
    this.currentEditValue = data.expression;
    this.currentEditBkptline = data.line;
  }
  stopEditBkpt(data: EditorBreakpointInfo) {
    if (this.currentEditValue.trim() !== "") {
      this.debugService.changeBkptCondition(data.id, this.currentEditValue);
    } else {
      this.debugService.changeBkptCondition(data.id, null);
    }
    this.currentEditBkptline = null;
  }
}
