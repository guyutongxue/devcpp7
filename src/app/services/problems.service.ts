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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GccDiagnostics } from '../core/ipcTyping';

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  panelHeight = 200;

  problems = new BehaviorSubject<GccDiagnostics>([]);
  linkerr = new BehaviorSubject<string>("");
  unknownerr = new BehaviorSubject<string>("");

  constructor() { }

}
