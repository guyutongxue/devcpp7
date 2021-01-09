import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  // https://github.com/angular-split/angular-split/issues/224
  encapsulation: ViewEncapsulation.None
})
export class MainViewComponent implements OnInit {
  sidebarHeight: number = null;
  constructor() { }

  ngOnInit(): void {
  }
}
