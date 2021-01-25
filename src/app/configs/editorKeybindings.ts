import {  } from 'monaco-languageclient';
export const defaultKeybindings: {
    keybinding: number,
    message: string
}[] = [
        {
            keybinding: 2048 | 49,
            // keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            message: 'requestSave'
        }
    ];