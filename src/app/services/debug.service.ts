import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, firstValueFrom, Observable, Subject } from 'rxjs';
import { GdbArray, GdbResponse, GdbVal } from 'tsgdbmi';
import { ElectronService } from '../core/services/electron/electron.service';
import { SendRequestOptions } from '../../background/handlers/typing';
import { EditorBreakpointInfo, EditorService } from './editor.service';
import { FileService } from './file.service';
import { catchError, debounceTime, filter, switchMap, timeout } from 'rxjs/operators';

function escape(src: string) {
  return src.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}

interface TraceLine { file: string; line: number };
export interface FrameInfo {
  file: string;
  line: number;
  func: string;
  level: number;
};

export interface BreakpointInfo {
  file: string;
  line: number;
  func?: string;
}

export interface GdbVarInfo {
  id: string;
  expression: string;
  value: string;
  expandable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  isDebugging: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private allOutput: string = "";
  private consoleOutput: BehaviorSubject<string> = new BehaviorSubject("");
  consoleOutput$: Observable<string> = this.consoleOutput.asObservable();

  private sourcePath: string;
  private initBreakpoints: EditorBreakpointInfo[] = [];

  // use this subject to set rate limit of "running"/"stopped" event.
  private traceLine: Subject<TraceLine | null> = new Subject();

  // private bkptList: Subject<BreakpointInfo[]> = new Subject();
  // bkptList$: Observable<BreakpointInfo[]> = this.bkptList.asObservable();
  editorBkptList: EditorBreakpointInfo[] = [];

  private requestResults: Subject<GdbResponse> = new Subject();

  programStop: BehaviorSubject<void> = new BehaviorSubject(undefined);
  localVariables$: Observable<GdbArray> = this.programStop.pipe(
    switchMap(() => this.getLocalVariables()),
    catchError(err => (alert(err), EMPTY))
  );
  callStack$: Observable<FrameInfo[]> = this.programStop.pipe(
    switchMap(() => this.getCallStack()),
    catchError(err => (alert(err), EMPTY))
  );

  constructor(
    private electronService: ElectronService,
    private fileService: FileService,
    private editorService: EditorService) {

    this.electronService.ipcRenderer.on('ng:debug/debuggerStarted', async () => {
      this.consoleOutput.next("");
      for (const breakInfo of this.initBreakpoints) {
        await this.sendMiRequest(`-break-insert ${this.bkptConditionCmd(breakInfo)} "${escape(this.sourcePath)}:${breakInfo.line}"`);
      }
      await this.sendMiRequest("-exec-run");
    });

    this.electronService.ipcRenderer.on('ng:debug/debuggerClosed', () => {
      this.exitCleaning();
    });

    this.electronService.ipcRenderer.on('ng:debug/console', (_, response: GdbResponse) => {
      const newstr = response.payload as string;
      this.consoleOutput.next(this.allOutput += newstr);
    });

    this.electronService.ipcRenderer.on('ng:debug/notify', (_, response: GdbResponse) => {
      if (response.message === "running") {
        // Program is running (continue or init start or restart)
        this.isDebugging.next(true);
        this.traceLine.next(null);
      } else if (response.message === "stopped") {
        const reason = response.payload["reason"] as string;
        if (reason.startsWith("exited")) {
          // Program exited. Stop debugging
          this.sendMiRequest("-gdb-exit");
          this.exitCleaning();
        } else if (["breakpoint-hit", "end-stepping-range", "function-finished"].includes(reason)) {
          // Program stopped during step-by-step debugging
          console.log(response.payload);
          if ("file" in response.payload["frame"]) {
            const stopFile = response.payload["frame"]["file"] as string;
            const stopLine = Number.parseInt(response.payload["frame"]["line"] as string);
            this.traceLine.next({ file: stopFile, line: stopLine });
            this.programStop.next();
          }
        }
      } else {
        console.log(response);
      }
    });

    this.electronService.ipcRenderer.on("ng:debug/result", (_, response: GdbResponse) => {
      this.requestResults.next(response);
    })

    this.traceLine.pipe(
      debounceTime(100)
    ).subscribe(value => {
      if (value === null) this.editorService.hideTrace();
      else this.fileService.locate(value.file, value.line, 1, "debug");
    });

    this.editorService.breakpointInfos$.subscribe(value => {
      this.editorBkptList = value;
    })
  }

  private exitCleaning(): void {
    this.isDebugging.next(false);
    this.traceLine.next(null);
    this.programStop.next();
  }

  private bkptConditionCmd(info: EditorBreakpointInfo) {
    const cmds: string[] = [];
    if (info.expression !== null) {
      cmds.push(`-c "${escape(info.expression)}"`);
    }
    if (info.hitCount !== null) {
      cmds.push(`-i ${info.hitCount}`);
    }
    return cmds.join(' ');
  }

  private sendMiRequest(command: string): Promise<GdbResponse> {
    const token = Math.floor(Math.random() * 1000000);
    this.electronService.ipcRenderer.send("debug/sendRequest", <SendRequestOptions>{
      command: `${token}${command}`
    })
    return firstValueFrom(this.requestResults.pipe(
      filter(result => result.token === token),
      timeout(1000)
    ));
  }

  startDebug() {
    this.sourcePath = this.fileService.saveOnNeed();
    if (this.sourcePath === null) return;
    this.initBreakpoints = this.editorBkptList;
    this.electronService.ipcRenderer.send('debug/start', {
      srcPath: this.sourcePath
    });
  }
  exitDebug() {
    this.electronService.ipcRenderer.send('debug/exit');
  }

  sendCommand(command: string) {
    return this.sendMiRequest(`-interpreter-exec console "${escape(command)}"`);
  }

  debugContinue() {
    return this.sendMiRequest("-exec-continue");
  }
  debugStepover() {
    return this.sendMiRequest("-exec-next");
  }
  debugStepinto() {
    return this.sendMiRequest("-exec-step");
  }
  debugStepout() {
    return this.sendMiRequest("-exec-finish");
  }
  debugRestart() {
    return this.sendMiRequest("-exec-run");
  }

  async evalExpr(expr: string): Promise<string> {
    const result = await this.sendMiRequest(`-data-evaluate-expression "${escape(expr)}"`);
    if (result.message !== "error") {
      return result.payload["value"];
    } else {
      return result.payload["msg"];
    }
  }

  changeBkptCondition(id: string, expression: string) {
    this.editorService.changeBkptCondition(id, expression);
  }

  locateEditorBreakpoint(line: number) {
    this.editorService.setPosition({
      lineNumber: line,
      column: 1
    });
  }

  async getCallStack(): Promise<FrameInfo[]> {
    if (!this.isDebugging.value) return [];
    const result = await this.sendMiRequest("-stack-list-frames");
    if (result.message !== "error") {
      return (result.payload["stack"] as GdbArray).map<FrameInfo>(value => ({
        file: value["file"],
        line: Number.parseInt(value["line"]),
        func: value["func"],
        level: Number.parseInt(value["level"])
      }));
    } else {
      return Promise.reject(result.payload["msg"]);
    }
  }

  async getLocalVariables(): Promise<GdbArray> {
    if (!this.isDebugging.value) return [];
    const result = await this.sendMiRequest("-stack-list-variables --all-values");
    if (result.message !== "error") {
      return result.payload["variables"];
    } else {
      return Promise.reject(result.payload["msg"]);
    }
  }

  private isVariableExpandable(x: GdbVal) {
    return !!(x["dynamic"] ?? x["numchild"] !== "0")
  }
  
  async createVariables(origin: GdbVarInfo[]): Promise<GdbVarInfo[]> {
    if (!this.isDebugging.value) return [];
    return Promise.all(origin.map(async o => {
      const result = await this.sendMiRequest(`-var-create ${o.id} * (${o.expression})`);
      if (result.message === "error") return null;
      else return {
        id: result.payload["name"],
        expression: o.expression,
        value: result.payload["value"] ?? "",
        expandable: this.isVariableExpandable(result.payload)
      } as GdbVarInfo;
    }))
  }
 
  async getVariableChildren(variableId: string): Promise<GdbVarInfo[]> {
    if (!this.isDebugging.value) return [];
    const result = await this.sendMiRequest(`-var-list-children --all-values ${variableId}`);
    if (result.message === "error") return Promise.reject();
    const children = result.payload["children"] as GdbArray;
    return children.map(val => ({
      id: val["name"],
      expression: val["exp"],
      value: val["value"] ?? "",
      expandable: this.isVariableExpandable(val)
    }));
  }

  async updateVariables(origin: GdbVarInfo[]) {
    const deleteList: string[] = [];
    const collapseList: string[] = [];
    if (!this.isDebugging.value) return { deleteList: origin.map(v => v.id), collapseList };
    const result = await this.sendMiRequest('-var-update --all-values *');
    if (result.message === "error") return;
    const changeList = result.payload["changelist"] as GdbArray;
    for (const change of changeList) {
      if (change["in_scope"] !== "true") {
        deleteList.push(change["name"])
        continue;
      }
      if (change["new_num_children"]) {
        collapseList.push(change["name"]);
      }
      const target = origin.find(o => o.id === change["name"]);
      target.value = change["value"];
    }
    return { deleteList, collapseList };
  } 

  async deleteVariable(variableId: string, childrenOnly = false) {
    if (this.isDebugging.value) this.sendMiRequest(`-var-delete ${childrenOnly ? '-c' : ''} ${variableId}`);
  }
}
