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
import { Router } from '@angular/router';
import { NzNotificationDataOptions, NzNotificationService } from 'ng-zorro-antd/notification';
import { ElectronService } from '../core/services';
import { BuildResult, GccDiagnostics } from '../core/ipcTyping';
import { FileService } from './file.service';
import { ProblemsService } from './problems.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuildService {

  isBuilding$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private notifyOption: NzNotificationDataOptions = {
    nzDuration: 3000
  };

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private notification: NzNotificationService,
    private fileService: FileService,
    private problemsService: ProblemsService
  ) {
    this.electronService.ipcRenderer.on("ng:build/buildStarted", (_) => {
      this.isBuilding$.next(true);
    });
    this.electronService.ipcRenderer.on("ng:build/buildComplete", (_, result) => {
      this.isBuilding$.next(false);
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
      this.problemsService.unknownerr.next(`Error: ${result.what.error as string}\n\nstderr: ${result.what.stderr}`);
    } else if (result.stage === "link") {
      this.problemsService.linkerr.next(result.linkerr);
    }
  }

  private sendBuildRequest(srcPath: string) {
    console.log("sending request");
    this.electronService.ipcRenderer.invoke("build/build", {
      path: srcPath
    });
  }

  private sendRunExeRequest(srcPath: string, forceCompile: boolean) {
    this.electronService.ipcRenderer.invoke("build/runExe", {
      path: srcPath,
      forceCompile
    });
  }

  async compile(): Promise<void> {
    const srcPath = await this.fileService.saveOnNeed();
    if (srcPath !== null)
      this.sendBuildRequest(srcPath);
  }

  async runExe(forceCompile = false): Promise<void> {
    const srcPath = await this.fileService.saveOnNeed();
    if (srcPath !== null)
      this.sendRunExeRequest(srcPath, forceCompile);
  }
}
