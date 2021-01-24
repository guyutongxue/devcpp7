import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

import { BuildResult } from '../../../background/handlers/typing';
import { ElectronService } from '../../core/services';
import { FileService } from '../../services/file.service';
import { TabsService } from '../../services/tabs.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(private notification: NzNotificationService,
    private modal: NzModalService,
    private electronService: ElectronService,
    private fileService: FileService,
    private tabsService: TabsService) { }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on("ng:build-control/built", (event, result: BuildResult) => {
      if (result.success) {
        if (result.diagnostics.length === 0) {
          this.notification.success("编译成功", "");
        } else {
          this.notification.warning("编译成功，但存在警告", "");
        }
      } else {
        if (result.stage === "compile") {
          this.notification.error("编译错误", result.diagnostics.toString());
        } else {
          this.notification.error("链接错误", result.linkerr);
        }
      }
    });
  }

  private sendBuildRequest() {
    this.electronService.ipcRenderer.send("build/build", {
      path: this.tabsService.getActive().value.path
    });
  }

  compile(): void {
    if (!this.tabsService.getActive().value.saved) {
      this.modal.confirm({
        nzTitle: '未保存',
        nzContent: '需要先保存文件，然后才能编译。是否保存？',
        nzOkText: '保存',
        nzOnOk: () => {
          this.fileService.save();
          this.sendBuildRequest();
        },
        nzCancelText: '取消',
      });
    } else {
      this.sendBuildRequest();
    }

  }

  runExe(): void {
    this.electronService.ipcRenderer.send("build/runExe", {
      path: this.tabsService.getActive().value.path
    });
  }
}
