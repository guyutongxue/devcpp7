# Explanation of source

## Background and Foreground

As an Electron application, Dev-C++ 7 includes 2 part: foreground process (renderer proces) and background process (main process). Background process run JavaScript in Nodejs (V8 engine) and foreground process run JavaScript (include HTML/CSS) in Chromium (Blink engine).

(That's why this application has a very large size.)

Two processes communicate through IPC. Here IPC is provided by Electron.

## Foreground detail

The foreground is built under the Angular framework. It deals with codes that don't need the support of filesystem, compiler, or linter (Such as UI).

The Angular app is started at `src/main.ts`. It will load the root module located at `src/app/app.module.ts`. All components, services, and directives are located at `src/app`.

```
|- src
|  |- app
|  |  |- ... other components
|  |  |- services
|  |  |  +- ... services
|  |  +- app.module.ts
|  |- main.ts      // Foreground entry (Root JS)
|  |- index.html   // Root HTML
|  +- styles.scss  // Root CSS
|- main.ts         // Background entry (we will talk it later)
```

All components' location equals to its view location. (i.e. If A is B's child component, then A's folder is located under B's folder.)

All services are located at `src/app/services`. (Exclude `ElectronService` which is provided by the `angular-electron` template.)

Notice that `EditorService` and `TabsService` are the most fundamental services. You cannot inject other services into them. `EditorService` is injected into `TabsService`.

I use `ng-zorro-antd` as the UI framework. Sometimes I also use `codicon` for more icons.

The editor component `ngx-monaco-editor` is a wrapper of Monaco Editor. It won't render on Electron-hot-load environment (I don't know why). But it works under browsers and production mode.

The Editor communicates with Language Server by LSP through Electron's IPC. It will request to start Language Server when initializing, so Language Server won't work in the browser. Components like `outline` need Language Server working.

When opening/saving/compiling/running, foreground process will send a request to the background, and background deal with these request, and return an optional response.

Angular will translate all TypeScript-written-things to runtime JavaScript. When building, TypeScript compiler compiles all things into JS, then WebPack packs all JS (including `node_modules`) into a single JS file. The corresponding `tsconfig.json` is located at `src`.

## Background detail

The entry point of this whole project is also the entry point of the background project. It is `main.ts` in the root directory.

First, it will open an Electron window (here, a foreground process will start). Then It will hook all handles of IPC, and listening to request from the renderer. This part of the code is located at `src/background/background.ts`.

When it received a start-language-server request, it will start an Express Server in a new process through `child_process.fork`. The Server will run on a runtime-determined port (3000 is preferred) and send the port info back to the foreground. The Language Server - Clangd is *inside* the compiler set (or it won't find header files).

When it received a compile (or run) request, it will execute the compiler in the `extraResource` folder.

Background codes are written in TypeScript, and they will be compiled into JavaScript when building (or serving). The corresponding `tsconfig.json` is located at the root folder.

