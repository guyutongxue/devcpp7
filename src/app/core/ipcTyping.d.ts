import { GdbResponse } from 'tsgdbmi';

// Use electron-typed-ipc to solve IPC typing problem.

// Migrate background/typing.d.ts to here


interface FileSaveOptions {
    content: string;
    path: string;
}
type FileSaveResult = {
    success: true;
} | {
    success: false;
    error: any
}

interface FileSaveAsOptions {
    content: string;
    defaultFilename: string;
}
type FileSaveAsResult = {
    success: true;
    path: string;
} | {
    success: false;
    cancelled: true;
} | {
    success: false;
    cancelled: false;
    error: any;
}

interface FileOpenOptions {
    /** Whether show a dialog to let user choose which file should open */
    showDialog: boolean;
    /** Always open these files */ 
    paths: string[];
}
type FileOpenResult = {
    success: true;
    files: Array<{
        path: string;
        content: string;
        key: string;
    }>;
} | {
    success: false;
    error: any;
}

interface BuildOptions {
    path: string;
}
interface GccDiagnosticPosition {
    file: string;
    line: number;
    column: number;
    "display-column"?: number;
    "byte-column"?: number;
}
interface GccDiagnosticLocation {
    label?: string;
    caret: GccDiagnosticPosition;
    start?: GccDiagnosticPosition;
    finish?: GccDiagnosticPosition;
}
interface GccDiagnosticFixit {
    start: GccDiagnosticPosition;
    next: GccDiagnosticPosition;
    string: string;
}
interface GccDiagnosticEvent {
    depth: number;
    description: string;
    function: string;
    location: GccDiagnosticPosition;
}
interface GccDiagnostic {
    kind: "note" | "warning" | "error";
    message: string;
    option?: string;
    option_url?: string;
    locations: GccDiagnosticLocation[];
    fixits?: GccDiagnosticFixit[];
    path?: GccDiagnosticEvent[];
    children?: GccDiagnostic[];
}
export type GccDiagnostics = GccDiagnostic[];
export interface BuildResult {
    success: boolean;
    output?: string;
    stage?: "compile" | "link" | "unknown";
    diagnostics: GccDiagnostics;
    linkerr?: string;
    what?: {
        error: any,
        stderr: string
    }
}


interface LanguageServerStartResult {
    port: number;
}

interface DebugStartOptions {
    srcPath: string;
}
type DebugStartResult = {
    success: true;
} | {
    success: false;
    error: string;
}

interface DebugSendRequestOptions {
    command: string;
}
type DebugSendRequestResult = {
    success: true;
} | {
    success: false;
    error: any;
}

// Async IPC
// Command invoked from ipcRenderer, handled by ipcMain
export type IpcCommands = {
    'file/save': (options: FileSaveOptions) => FileSaveResult;
    'file/saveAs': (options: FileSaveAsOptions) => FileSaveAsResult;
    'file/open': (options: FileOpenOptions) => FileOpenResult;

    'build/build': (options: BuildOptions) => void;
    'build/runExe': (options: BuildOptions) => void;

    'langServer/start': () => LanguageServerStartResult;
    'langServer/stop': () => void;

    'debug/start': (options: DebugStartOptions) => DebugStartResult;
    'debug/exit': () => void
    'debug/sendRequest': (options: DebugSendRequestOptions) => DebugSendRequestResult;

    'window/toggleDevTools': () => void;
    'window/setTitle': (title: string) => void;
}

// Sync IPC
// Event emitted from ipcMain, received by ipcRenderer
export type IpcEvents = {
    'ng:build/buildStarted': () => void;
    'ng:build/buildComplete': (result: BuildResult) => void;

    'ng:debug/debuggerStarted': () => void;
    'ng:debug/debuggerStopped': () => void;
    'ng:debug/console': (response: GdbResponse) => void;
    'ng:debug/notify': (response: GdbResponse) => void;
    'ng:debug/result': (response: GdbResponse) => void;

}