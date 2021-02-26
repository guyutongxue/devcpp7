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

import * as electron from 'electron';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getWindow, typedIpcMain } from '../basicUtil';

// interface Result { success: boolean, [key: string]: any };

typedIpcMain.handle('file/save', (_, arg) => {
  try {
    fs.writeFileSync(arg.path, arg.content, "utf-8");
    return {
      success: true
    };
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
});

typedIpcMain.handle('file/saveAs', async (_, arg) => {
  try {
    let options: electron.SaveDialogOptions = {
      defaultPath: arg.defaultFilename,
      filters: [
        { name: "C++ 源文件", extensions: ["cpp", "h", "hpp", "cc", "cxx"] },
        { name: "C 源文件", extensions: ["c", "h"] },
        { name: "所有文件", extensions: ["*"] },
      ],
    };
    const r = await electron.dialog.showSaveDialog(getWindow(), options);
    if (!r.canceled) {
      fs.writeFileSync(r.filePath, arg.content, "utf-8");
      return {
        success: true,
        path: r.filePath
      }
    } else {
      return {
        success: false,
        cancelled: true
      };
    }
  } catch (e) {
    return {
      success: false,
      cancelled: false,
      error: e
    };
  }
});


typedIpcMain.handle('file/open', async (_, arg) => {
  interface FileInfo {
    path: string;
    content: string;
    key: string;
  };
  try {
    const files: FileInfo[] = [];
    arg.paths.forEach(path => {
      const content = fs.readFileSync(path).toString("utf-8");
      const key = uuidv4();
      files.push({
        content: content,
        key: key,
        path: path
      });
    });
    if (arg.showDialog) {
      const options: electron.OpenDialogOptions = {
        filters: [
          { name: "C++ Source Files", extensions: ["cpp"] },
          { name: "All Files", extensions: ["*"] },
        ],
        properties: [
          "openFile",
          "multiSelections"
        ]
      };
      const result = await electron.dialog.showOpenDialog(getWindow(), options);
      if (!result.canceled) {
        result.filePaths.forEach(path => {
          const content = fs.readFileSync(path).toString("utf-8");
          const key = uuidv4();
          files.push({
            content: content,
            key: key,
            path: path
          });
        });
      }
    }
    return {
      success: true,
      files: files
    };
  } catch (e) {
    return {
      success: false,
      error: e
    };
  }
});
