import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as path from 'path';
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

  isDebugging: boolean = false;

  expr: string = "";
  exprVal: string = "";

  consoleOutput: string = "";
  promptColor: string = "#262626";
  consoleInput: string = "";
  consoleInputEnabled = true;

  callStack: FrameInfo[] = [];
  bkptList: FrameInfo[] = [];

  currentEditBkptline: number = null;
  currentEditValue: string = "";

  get enabled(): boolean {
    return this.fileService.currentFileType() !== "none";
  }

  getEditorBreakpoints() {
    return this.debugService.editorBkptList;
  }

  ngOnInit(): void {
    this.debugService.consoleOutput$.subscribe(value => {
      this.consoleOutput = value;
    });
    this.debugService.isDebugging.subscribe(value => {
      this.isDebugging = value;
      if (value) {
        this.promptColor = "#262626";
      }
    });
    this.debugService.callStack$.subscribe(value => {
      this.callStack = value;
    })
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
    const result = await this.debugService.evalExpr(this.expr);
    if (result !== null) this.exprVal = result;
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
    if (this.isDebugging) return;
    this.currentEditValue = data.expression;
    this.currentEditBkptline = data.line;
  }
  stopEditBkpt(data: EditorBreakpointInfo) {
    if (this.currentEditValue.trim() !== "") {
      this.debugService.changeBkptCondition(data.id, this.currentEditValue);
    }
    this.currentEditBkptline = null;
  }
}
