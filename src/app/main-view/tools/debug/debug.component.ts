import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DebugService } from '../../../services/debug.service'
import { TabsService } from '../../../services/tabs.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: [
    './debug.component.scss',
    '../../../codicon/codicon.css'
  ],
  // encapsulation: ViewEncapsulation.None
})
export class DebugComponent implements OnInit {

  constructor(
    private tabsService: TabsService,
    private debugService: DebugService) { }

  selectedIndex: number = 0;
  consoleOutput: string = "";
  consoleInput: string = "";
  
  private get targetTab() {
    return this.tabsService.getActive().value;
  }

  get enabled(): boolean {
    if (this.targetTab === null) return false;
    if (this.targetTab.path === null) return false;
    return true;
  }

  get isDebugging() {
    return this.debugService.isDebugging;
  }

  ngOnInit(): void {
    this.debugService.consoleOutput.subscribe(value => {
      this.consoleOutput = value;
    })
  }

  startDebug() {
    this.debugService.startDebug(this.targetTab.path);
  }

  exitDebug() {
    this.debugService.exitDebug();
  }

  sendCommand() {
    this.debugService.sendCommand(this.consoleInput);
  }
}
