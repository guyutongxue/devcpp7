import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProblemsService } from '../../../services/problems.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss']
})
export class OutputComponent implements OnInit {

  constructor(private problemsService: ProblemsService) { }

  compileMessage$: Observable<string>;
  linkMessage$: Observable<string>;
  otherMessage$: Observable<string>;

  ngOnInit(): void {
    this.compileMessage$ = this.problemsService.problems.pipe(
      map(data => JSON.stringify(data).replace(/\n/g, '\\'))
    );
    this.linkMessage$ = this.problemsService.linkerr;
    this.otherMessage$ = this.problemsService.unknownerr;
  }

}
