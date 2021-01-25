import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  // https://github.com/angular-split/angular-split/issues/224
  encapsulation: ViewEncapsulation.None
})
export class MainViewComponent implements OnInit {
  sidebarHeight: number = null;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  showOutline(): void {
    this.router.navigate([{
      outlets: {
        sidebar: 'outline'
      }
    }])
  }
}
