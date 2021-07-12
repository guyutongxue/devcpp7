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

import { typedIpcMain, getACP } from "../basicUtil";
import * as iconv from "iconv-lite";

// Codepages that are missing from iconv-lite
const missingCP: { [key: string]: string } = {
  "1200": "utf16le",
  "1201": "utf16be",
  "12000": "utf32le",
  "12001": "utf32be",
  "16969": "utf64le",
  "20127": "ascii", // deprecated
  "65000": "utf7",
  "65001": "utf8",
}

typedIpcMain.handle('encode/getCp', (_) => {
  const cp: string = getACP().toString();
  if (cp in missingCP)
    return missingCP[cp];
  return cp;
});

typedIpcMain.handle('encode/verify', (_, encode: string) => {
  return iconv.encodingExists(encode);
});
