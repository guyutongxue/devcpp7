import { Component, OnInit } from '@angular/core';
import { NzNotificationDataOptions, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

import { BuildResult, GccDiagnostics } from '../../../background/handlers/typing';
import { ElectronService } from '../../core/services';
import { FileService } from '../../services/file.service';
import { TabsService } from '../../services/tabs.service';
import { ProblemsService } from '../../services/problems.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(private router: Router,            // show problems / output tab
    private notification: NzNotificationService, // show notifications
    private electronService: ElectronService,    // connect with background
    private fileService: FileService,            // save file before compile
    private tabsService: TabsService,            // whether enable compiling (has active tab)
    private problemsService: ProblemsService     // send compiler output
  ) { }

  get isDisabled() {
    return !this.tabsService.hasActiveFile;
  }

  private notifyOption: NzNotificationDataOptions = {
    nzDuration: 3000
  }

  ngOnInit(): void {
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

  private sendBuildRequest() {
    console.log("sending request");
    this.electronService.ipcRenderer.send("build/build", {
      path: this.tabsService.getActive().value.path
    });
  }

  private sendRunExeRequest() {
    this.electronService.ipcRenderer.send("build/runExe", {
      path: this.tabsService.getActive().value.path
    });
  }

  isCompiling: boolean = false;

  compile(): void {
    const isSaved = this.tabsService.getActive().value.saved;
    if (isSaved || (!isSaved && this.fileService.save()))
      this.sendBuildRequest();
  }

  runExe(): void {
    const isSaved = this.tabsService.getActive().value.saved;
    if (isSaved || (!isSaved && this.fileService.save()))
      this.sendRunExeRequest();
  }
}
