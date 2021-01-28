import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GccDiagnostics } from '../../background/handlers/typing'

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  panelHeight: number = 200;

  problems = new BehaviorSubject<GccDiagnostics>([]);
  linkerr = new BehaviorSubject<string>("");
  unknownerr = new BehaviorSubject<string>("");

  constructor() { }

}
