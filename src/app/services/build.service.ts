import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import { NzNotificationDataOptions, NzNotificationService } from 'ng-zorro-antd/notification';
import { ElectronService } from '../core/services/electron/electron.service';
import { BuildResult, GccDiagnostics } from '../../background/handlers/typing';
import { FileService } from './file.service';
import { ProblemsService } from './problems.service';

@Injectable({
  providedIn: 'root'
})
export class BuildService {

  isCompiling: boolean = false;
  private notifyOption: NzNotificationDataOptions = {
    nzDuration: 3000
  }

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private notification: NzNotificationService,
    private fileService: FileService,
    private problemsService: ProblemsService
  ) {
    this.electronService.ipcRenderer.on("ng:build-control/buildStarted", (_) => {
      this.isCompiling = true;
    })
    this.electronService.ipcRenderer.on("ng:build-control/buildComplete", (_, result: BuildResult) => {
      this.isCompiling = false;
      console.log("Compile result: ", result);
      if (result.success) {
        if (result.diagnostics.length === 0) {
          this.notification.success("编译成功", "", this.notifyOption);
          this.problemsService.linkerr.next("");
          this.problemsService.problems.next([]);
        } else {
          this.showProblems(result.diagnostics);
          this.notification.warning("编译成功，但存在警告", "", this.notifyOption);
        }
      } else {
        switch (result.stage) {
          case "compile":
            this.showProblems(result.diagnostics);
            this.notification.error("编译错误", "", this.notifyOption);
            break;
          case "link":
            this.showProblems(result.diagnostics);
            this.notification.error("链接错误", result.linkerr, this.notifyOption);
            this.showOutput(result);
            break;
          default:
            this.showOutput(result);
            this.notification.error("未知错误", result.what.stderr, this.notifyOption);
            break;
        }
      }
    });
  }
  
  private showProblems(diagnostics: GccDiagnostics) {
    this.router.navigate([{
      outlets: {
        tools: 'problems'
      }
    }]);
    this.problemsService.problems.next(diagnostics);
  }
  private showOutput(result: BuildResult) {
    this.router.navigate([{
      outlets: {
        tools: 'output'
      }
    }]);
    if (result.stage === "unknown") {
      this.problemsService.unknownerr.next(`Error: ${result.what.error}\n\nstderr: ${result.what.stderr}`);
    } else if (result.stage === "link") {
      this.problemsService.linkerr.next(result.linkerr);
    }
  }

  private sendBuildRequest(srcPath: string) {
    console.log("sending request");
    this.electronService.ipcRenderer.send("build/build", {
      path: srcPath
    });
  }

  private sendRunExeRequest(srcPath: string) {
    this.electronService.ipcRenderer.send("build/runExe", {
      path: srcPath
    });
  }

  compile(): void {
    const srcPath = this.fileService.saveOnNeed();
    if (srcPath !== null)
      this.sendBuildRequest(srcPath);
  }

  runExe(): void {
    const srcPath = this.fileService.saveOnNeed();
    if (srcPath !== null)
      this.sendRunExeRequest(srcPath);
  }
}
