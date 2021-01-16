
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