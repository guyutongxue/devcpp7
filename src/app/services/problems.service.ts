import { Injectable } from '@angular/core';
import { GccDiagnostics } from '../../background/handlers/typing'

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {

  panelHeight: number = 200;

  problems: GccDiagnostics;

  constructor() { }


}