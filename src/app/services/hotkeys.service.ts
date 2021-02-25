import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';

import { EditorService } from './editor.service';

interface Options {
  element: any;
  keys: string;
}

const EDITOR_ACTIONS: {
  [key: string]: string
} = {
  // ^C ^V ^X ^A should not be triggered globally (may be used in other <input>)
  // 'control.c': 'editor.action.clipboardCopyAction',
  // 'control.v': 'editor.action.clipboardPasteAction',
  // 'control.x': 'editor.action.clipboardCutAction',
  // 'control.a': 'editor.action.selectAll',
  'control.z': 'undo',
  'control.y': 'redo',
  'control.f': 'editor.find',
  'control.h': 'editor.action.startFindReplaceAction',
  'control./': 'editor.action.commentLine'
};

@Injectable({
  providedIn: 'root'
})
export class HotkeysService {

  private readonly defaults: Partial<Options> = {
    element: this.document
  }

  constructor(private eventManager: EventManager,
    @Inject(DOCUMENT) private document: Document,
    private editorService: EditorService
  ) {
    for (const key in EDITOR_ACTIONS) {
      console.log(key, "added");
      this.addShortcut({
        keys: key
      }).subscribe(() => {
        if (document.activeElement.tagName.toUpperCase() !== "INPUT")
          this.editorService.runAction(EDITOR_ACTIONS[key]);
      })
    }
  }

  addShortcut(options: Partial<Options>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;
    return new Observable(observer => {
      const handler = (e: KeyboardEvent) => {
        e.preventDefault();
        observer.next(e);
      };
      const dispose = this.eventManager.addEventListener(
        merged.element, event, handler
      );
      return () => dispose();
    })
  }
}
