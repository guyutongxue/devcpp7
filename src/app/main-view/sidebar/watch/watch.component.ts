import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GdbArray } from 'tsgdbmi';
import { DebugService } from '../../../services/debug.service';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss']
})
export class WatchComponent implements OnInit {

  localVariables$: Observable<GdbArray>;

  constructor(private debugService: DebugService) { 
  }

  ngOnInit(): void {
    this.localVariables$ = this.debugService.localVariables$;
  }

}
