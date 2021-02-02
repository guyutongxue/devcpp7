import { Component, OnInit } from '@angular/core';
import { DebugService } from '../../../services/debug.service'
import { TabsService } from '../../../services/tabs.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {

  constructor(
    private tabsService: TabsService,
    private debugService: DebugService) { }
  
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
  }

  startDebug() {
    this.debugService.startDebug(this.targetTab.path);
  }

  exitDebug() {
    this.debugService.exitDebug();
  }

}
