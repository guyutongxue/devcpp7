import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
export class DebugComponent implements OnInit, AfterViewChecked {

  constructor(
    private tabsService: TabsService,
    private debugService: DebugService) { }

  @ViewChild("cOutput") private cOutput: ElementRef;

  selectedIndex: number = 0;

  isDebugging: boolean = false;

  consoleOutput: string = "";
  promptColor: string = "#262626";
  consoleInput: string = "";
  consoleInputEnabled = true;

  private get targetTab() {
    return this.tabsService.getActive().value;
  }

  get enabled(): boolean {
    if (this.targetTab === null) return false;
    if (this.targetTab.path === null) return false;
    return true;
  }

  ngOnInit(): void {
    this.debugService.consoleOutput$.subscribe(value => {
      this.consoleOutput = value;
    });
    this.debugService.isDebugging$.subscribe(value => {
      this.isDebugging = value;
      if (value) {
        this.promptColor = "#262626";
      }
    })
  }

  ngAfterViewChecked(): void {    
    try {
      this.cOutput.nativeElement.scrollTop = this.cOutput.nativeElement.scrollHeight;
    } catch (_) { }
  }

  startDebug() {
    this.debugService.startDebug(this.targetTab.path);
  }

  exitDebug() {
    this.debugService.exitDebug();
  }

  async sendCommand() {
    this.consoleInputEnabled = false;
    const result = await this.debugService.sendCommand(this.consoleInput);
    this.consoleInputEnabled = true;
    this.consoleInput = "";
    if (result.success) this.promptColor = "green";
    else this.promptColor = "red";
  }
}
