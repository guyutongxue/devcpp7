import { Component, OnInit } from '@angular/core';
import { EditorService } from '../../../services/editor.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'
import { Observable } from 'rxjs';
@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit {
  len: number;
  private symbols$: Observable<monaco.languages.DocumentSymbol[]>
  constructor(private editorService: EditorService) { }

  ngOnInit(): void {
    this.symbols$ = this.editorService.editorText$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(text => this.editorService.getSymbols())
    );
    this.symbols$.subscribe(e => {
      if (e === null) this.len = -1;
      else this.len = e.length;
    })
  }

}
