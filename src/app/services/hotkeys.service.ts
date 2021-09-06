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

import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';

interface Options {
  element: any;
  keys: string;
}

@Injectable({
  providedIn: 'root'
})
export class HotkeysService {

  private readonly defaults: Partial<Options> = {
    element: this.document
  };

  constructor(private eventManager: EventManager,
    @Inject(DOCUMENT) private document: Document
  ) { }

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
    });
  }
}
