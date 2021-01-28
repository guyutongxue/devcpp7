import { Message } from "vscode-ws-jsonrpc";

export interface SaveFileOptions {
    content: string;
    path: string;
}
export interface SaveAsFileOptions {
    content: string;
    defaultFilename: string;
}

export interface StartLanguageServerResult {
    port: number;
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
    stage?: "compile" | "link" | "unknown";
    diagnostics: GccDiagnostics;
    linkerr?: string;
    what?: {
        error: any,
        stderr: string
    } 
}