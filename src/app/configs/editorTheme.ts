import { } from 'monaco-languageclient';
export const classicTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
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
      token: "comments",
      foreground: '#0078d7',
      fontStyle: 'italic'
    },
    {
      token: 'function',
      fontStyle: 'italic'
    }
  ]
}