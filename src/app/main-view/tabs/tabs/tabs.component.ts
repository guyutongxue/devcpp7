import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  selectedIndex: number = 0;
  tabs = [1, 2, 3];

  constructor() { }

  ngOnInit(): void {
  }
  newTab() { }
  closeTab( e: { index: number }) { }
}
