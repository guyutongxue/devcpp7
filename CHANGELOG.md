# Changelog

## 2109.1

- Fix bugs:
  - Reopen settings tab should locate to correct page (last release doesn't fix it properly)

## 2109.0

- Features
  - GCC diagnostics translation powered by [gcc-translation](https://github.com/Guyutongxue/gcc-translation)
  - Use your own MinGW instead of the bundle one. Change portable release to "no-mingw"
  - Change editor theme. Now it have 4 initial themes:
    - VS Code Light+
    - Vs Code Dark+
    - Dev-C++ Classic+
    - Monokai
    - (You can define your own theme if you want.)
- Fix bugs:
  - Reopen settings tab should locate to correct page

## 2108.0

- Fix bugs:
  - Clangd should recognize compiler options.

> I do not have time on developing this. 😞

## 2107.0

- Features:
  - Ability to adjust code pages (GBK or UTF-8 or sth else)
  - Modal for unsaved settings

## 2105.0

- Fix bugs:
  - `ConsolePauser.exe` not launched when path contains space.
  - [#1](https://github.com/Guyutongxue/devcpp7/issues/1)

## 2104.1

- Fix bug - `spawn` failed when path contains spaces

## 2104.0

- Fix a packing problem.

## 2103.0

- Fix unknown error - set env:Path while compiling

## 2102.0

- First release - basic features finish

## alpha2

- Migrate from Vue.js to Angular

## alpha1

- Start developing Dev-C++ 7 with Vue.js and Electron.
