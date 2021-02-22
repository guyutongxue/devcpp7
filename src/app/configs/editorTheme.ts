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