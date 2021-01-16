import * as electron from 'electron';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getWindow } from '../basicUtil';
import { SaveFileOptions, SaveAsFileOptions } from './typing'

// interface Result { success: boolean, [key: string]: any };

/**
 * Save file
 * @param event 
 * @param arg 
 */
export function saveFile(event: electron.IpcMainEvent, arg: SaveFileOptions) {
  try {
    fs.writeFileSync(arg.path, arg.content, "utf-8");
    event.returnValue = {
      success: true
    };
  } catch (e) {
    event.returnValue = {
      success: false,
      error: e
    }
  }
}

/**
 * Open a save dialog and choose path for it. 
 * @param event 
 * @param arg 
 */
export async function saveAsFile(event: electron.IpcMainEvent, arg: SaveAsFileOptions) {
  try {
    let options: electron.SaveDialogOptions = {
      defaultPath: arg.defaultFilename,

      filters: [
        { name: "C++ 源文件", extensions: ["cpp", "h", "hpp", "cc", "cxx"] },
        { name: "C 源文件", extensions: ["c", "h"] },
        { name: "所有文件", extensions: ["*"] },
      ],
    };
    await electron.dialog.showSaveDialog(getWindow(), options).then(r => {
      try {
        if (!r.canceled) {
          fs.writeFileSync(r.filePath as string, arg.content, "utf-8");
          event.returnValue = {
            success: true,
            path: r.filePath as string
          }
        } else {
          event.returnValue = {
            success: false,
            reason: "User cancelled operation."
          };
        }
      } catch (e) {
        event.returnValue = {
          success: false,
          error: e
        };
      }
    });
  } catch (e) {
    event.returnValue = {
      success: false,
      error: e
    }
  }
}

/**
 * Open an open dialog and choose which file to open.
 * @param event 
 * @param arg 
 */
export async function openFile(event: electron.IpcMainEvent, arg: any) {
  try {
    let options: electron.OpenDialogOptions = {
      filters: [
        { name: "C++ Source Files", extensions: ["cpp"] },
        { name: "All Files", extensions: ["*"] },
      ],
      properties: [
        "openFile",
        "multiSelections"
      ]
    };
    electron.dialog.showOpenDialog(getWindow(), options).then(r => {
      try {
        if (!r.canceled) {
          interface FileInfo {
            path: string,
            content: string,
            key: string
          }
          let files: FileInfo[] = [];
          r.filePaths.forEach(filePath => {
            let key: string;
            let content = fs.readFileSync(filePath).toString("utf-8");
            key = uuidv4();
            files.push({
              content: content,
              key: key,
              path: filePath
            });
          });
          event.returnValue = {
            success: true,
            files: files
          };
        } else {
          event.returnValue = {
            success: false,
            reason: "User cancelled operation."
          }
        }
      } catch (e) {
        event.returnValue = {
          success: false,
          error: e
        };
      }
    });
  } catch (e) {
    event.returnValue = {
      success: false,
      error: e
    };
  }
}
