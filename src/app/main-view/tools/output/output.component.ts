// Copyright (C) 2021 Guyutongxue
// 
// This file is part of Dev-C++ 7.
// 
// Dev-C++ 7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Dev-C++ 7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Dev-C++ 7.  If not, see <http://www.gnu.org/licenses/>.

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
