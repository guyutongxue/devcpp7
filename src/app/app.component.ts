import { Component, HostListener, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

import { HotkeysService } from './services/hotkeys.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private hotkeysService: HotkeysService,
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
    this.windowHeight = window.innerHeight;
  }

  private windowHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowHeight = window.innerHeight;
  }

  get headerHeight() {
    return 32 + 1 * 32;
  }

  get footerHeight() {
    return 20;
  }

  get mainViewHeight() {
    return this.windowHeight - this.headerHeight - this.footerHeight;
  }

  ngOnInit() : void {

  }
}
