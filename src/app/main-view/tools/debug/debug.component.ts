import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DebugService } from '../../../services/debug.service';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit, AfterViewChecked {

  constructor(
    private fileService: FileService,
    private debugService: DebugService) { }

  @ViewChild("cOutput") private cOutput: ElementRef;

  selectedIndex: number = 0;

  isDebugging: boolean = false;

  expr: string = "";
  exprVal: string = "";

  consoleOutput: string = "";
  promptColor: string = "#262626";
  consoleInput: string = "";
  consoleInputEnabled = true;


  get enabled(): boolean {
    return this.fileService.currentFileType() !== "none";
  }

  ngOnInit(): void {
    this.debugService.consoleOutput$.subscribe(value => {
      this.consoleOutput = value;
    });
    this.debugService.isDebugging.subscribe(value => {
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
    this.debugService.startDebug();
  }

  exitDebug() {
    this.debugService.exitDebug();
  }

  async sendCommand() {
    this.consoleInputEnabled = false;
    const result = await this.debugService.sendCommand(this.consoleInput);
    this.consoleInputEnabled = true;
    this.consoleInput = "";
    if (result.message !== "error") this.promptColor = "green";
    else this.promptColor = "red";
  }

  debugContinue() {
    this.debugService.debugContinue();
  }
  debugStepover() {
    this.debugService.debugStepover();
  }
  debugStepinto() {
    this.debugService.debugStepinto();
  }
  debugStepout() {
    this.debugService.debugStepout();
  }
  debugRestart() {
    this.debugService.debugRestart();
  }

  async evalExpr() {
    const result = await this.debugService.evalExpr(this.expr);
    if (result !== null) this.exprVal = result;
  }
}
