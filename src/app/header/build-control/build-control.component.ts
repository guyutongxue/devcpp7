import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services';
import { TabsService } from '../../services/tabs.service';

@Component({
  selector: 'app-build-control',
  templateUrl: './build-control.component.html',
  styleUrls: ['./build-control.component.scss']
})
export class BuildControlComponent implements OnInit {

  constructor(private electronService: ElectronService, private tabsService: TabsService) { }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on("ng:build-control/build", () => { });
  }

  compile(): void {
    this.electronService.ipcRenderer.sendSync("build/build", {
      path: this.tabsService.getActive().value.path
    } );

  }

  runExe(): void {

  }
}
