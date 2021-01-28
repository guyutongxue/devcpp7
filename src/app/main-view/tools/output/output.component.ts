import { Component, OnInit } from '@angular/core';
import { ProblemsService } from '../../../services/problems.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss']
})
export class OutputComponent implements OnInit {

  constructor(private problemsService: ProblemsService) { }

  compileMessage: string;
  linkMessage: string;
  otherMessage: string;

  ngOnInit(): void {
    this.problemsService.problems.subscribe(data => {
      this.compileMessage = JSON.stringify(data);
    });
    this.problemsService.linkerr.subscribe(data => {
      this.linkMessage = data;
    });
    this.problemsService.unknownerr.subscribe(data => {
      this.otherMessage = data;
    })
  }

}
