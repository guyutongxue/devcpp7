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

import * as path from 'path';
import * as fs from 'fs';

import { store, typedIpcMain, extraResourcesPath } from "../basicUtil";

function ignoreByClangdFilter(arg: string) {
  if (arg.startsWith('DYN')) return false;
  if (arg.startsWith('-fexec-charset')) return false;
  if (arg.startsWith('-finput-charset')) return false;
  return true;
}

function updateClangdCompileArgs(value: string[]) {
  const flags = [
    '-xc++', '--target=x86_64-pc-windows-gnu', ...value.filter(ignoreByClangdFilter)
  ];
  fs.writeFileSync(path.join(extraResourcesPath, '/anon_workspace/compile_flags.txt'), flags.join('\n'));
}


typedIpcMain.handle('store/get', (_, key) => {
  return store.get(key);
});
typedIpcMain.handle('store/set', (_, key, value) => {
  store.set(key, value);
  switch (key) {
    case 'build.compileArgs':
      updateClangdCompileArgs(value as string[]);
      break;
  }
});
typedIpcMain.handle('store/reset', (_, key) => {
  if (typeof key === "undefined") {
    store.clear();
  } else {
    store.reset(key);
  }
});
