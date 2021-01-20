import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { BuildResult } from '../../../background/handlers/typing';
import { ElectronService } from '../../core/services';
import { TabsService } from '../../services/tabs.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(private notification: NzNotificationService,
    private electronService: ElectronService,
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

  compile(): void {
    this.electronService.ipcRenderer.send("build/build", {
      path: this.tabsService.getActive().value.path
    });

  }

  runExe(): void {
    this.electronService.ipcRenderer.send("build/runExe", {
      path: this.tabsService.getActive().value.path
    });
  }
}
