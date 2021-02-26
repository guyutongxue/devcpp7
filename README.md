# Dev-C++ 7
<p align="center">
<img src="./src/assets/icons/favicon.png" height="70" alt="Dev C++ 7"> =
<img src="https://s3.ax1x.com/2021/01/22/sombEd.png" height="70" alt="Angular">+
<img src="https://s3.ax1x.com/2021/01/22/somL4I.png" height="70" alt="Electron">+
<img src="https://s3.ax1x.com/2021/01/22/som7HH.png" height="70" alt="Monaco Editor">+
<img src="https://s3.ax1x.com/2021/01/22/somqUA.png" height="70" alt="MinGW-w64">+
<img src="https://s3.ax1x.com/2021/01/22/somXCt.png" height="70" alt="Clangd">
</p>

## Info

A project simulating legacy Dev-C++, a tiny C++ IDE, powered by Angular, Electron, Monaco Editor, MinGW-w64 and Clangd.

**This repository has no relationship to Bloodshed's Dev-C++.**

![Snapshot](https://s3.ax1x.com/2021/02/22/yHDron.png)

## Current Status

**Under construction, but may be in abeyance later**

Current features:
- Basic New/Open/Save
- Features provided by LSP: suggestions, hover message, outline, squiggles, etc.
- Basic single file Compile/Run
- Basic step-by-step debug

## :warning: Warning

**This project is not aimed to replace legacy Dev-C++.** If you want a newer version of that, please check [royqh1979/Dev-CPP](https://github.com/royqh1979/Dev-CPP). This project is just a practice of using Angular and Electron to built a desktop application. So it:
- **WON'T** support 32-bit system.
- **WON'T** test on any system lower than Windows 10.
- **WON'T** provide the options of changing compiler set.
- **MAY NOT** support C project or file.
- **MAY NOT** support l11n. (Only Simplified Chinese now.)
- **PRETTY LARGER** than legacy Dev-C++ (because of Electron, Clangd and so on).

## Build instructions

This repo is based on [angular-electron](https://github.com/maximegris/angular-electron) template. Following instructions are copied from there.

### Install dependencies

Install Node.js on Windows, then type
```
npm install
```
in the root directory of this project to install all the dependencies.

### Dealing with extraResousrce

Follow [here](src/extraResources/README.md).

### Included Commands

| Command                  | Description                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm start`              | Hot reload both in electron & browser                                     |
| `npm run ng:serve`       | Execute the app in the browser                                            |
| `npm run build`          | Build the app. Your built files are in the /dist folder.                  |
| `npm run build:prod`     | Build the app with Angular aot. Your built files are in the /dist folder. |
| `npm run electron:local` | Builds your application and start electron                                |
| `npm run electron:build` | Builds your application and creates an app by electron-builder            |
