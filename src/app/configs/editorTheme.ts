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

import { } from 'monaco-languageclient';
export const classicTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: false,
  colors: {
    'editor.background': '#ffffff',
    "editor.lineHighlightBackground": "#ccffff",
    // 'editor.selectionBackground': '#000080', // https://github.com/microsoft/vscode/issues/36490
    // 'editor.selectionForeground': '#ffffff',
  },
  rules: [
    {
      token: '',
      foreground: '#000000',
      background: '#ffffff'
    },
    {
      token: 'preprocessor',
      foreground: '#008000'
    },
    {
      token: 'string',
      foreground: '#0000ff',
      fontStyle: 'bold',
    },
    {
      token: 'string.char',
      foreground: '#000000',
      fontStyle: ''
    },
    {
      token: 'keyword',
      foreground: '#000000',
      fontStyle: 'bold',
    },
    {
      token: "delimiter",
      foreground: '#ff0000',
      fontStyle: 'bold'
    },
    {
      token: 'number',
      foreground: '#800080',
    },
    {
      token: "comment",
      foreground: '#0078d7',
      fontStyle: 'italic'
    },
    {
      token: 'macro',
      foreground: '#008000'
    },
    {
      token: 'type',
      foreground: '#267f99'
    },
    {
      token: 'variable',
      foreground: '#001080'
    },
    {
      token: 'function',
      foreground: '#795e26'
    }
  ]
}