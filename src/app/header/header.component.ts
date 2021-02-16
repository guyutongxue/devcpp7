import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit(): void {
  }

  toggleDevTools() {
    this.electronService.ipcRenderer.send("window/toggleDevTools");
  }
}
