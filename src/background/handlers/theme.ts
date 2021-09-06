// Copyright (C) 2021 Guyutongxue
//
// This file is part of devcpp7.
//
// devcpp7 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// devcpp7 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with devcpp7.  If not, see <http://www.gnu.org/licenses/>.

import * as fallbackTheme from '../../extraResources/themes/classic.json';
import * as fs from 'fs';
import * as path from 'path';
import { extraResourcesPath, store, typedIpcMain } from '../basicUtil';
import { Theme } from '../ipcTyping';

typedIpcMain.handle('theme/getList', (_) => {
  const themePath = path.join(extraResourcesPath, 'themes');
  if (!fs.existsSync(themePath)) return [];
  const themeList = fs.readdirSync(themePath)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5));
  return themeList;
});

typedIpcMain.handle('theme/getData', (_, name?) => {
  if (typeof name === 'undefined') {
    name = store.get('theme.active');
  }
  const jsonPath = path.join(extraResourcesPath, 'themes', `${name}.json`);
  if (!fs.existsSync(jsonPath)) {
    return {
      success: false,
      theme: <Theme>fallbackTheme,
      error: `Theme file ${name}.json not found.`
    };
  }
  let theme: Theme | null = null;
  try {
    theme = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error(e);
    return {
      success: false,
      theme: <Theme>fallbackTheme,
      error: `Theme file ${name}.json is not a valid JSON file.`
    };
  }
  // validate
  if (!(('type' in theme) &&
    ('name' in theme) &&
    (theme.type === 'dark' || theme.type === 'light'))) {
    console.error("Invalid theme type");
    return {
      success: false,
      theme: <Theme>fallbackTheme,
      error: `Theme file ${name}.json is not a valid theme file.`
    };
  }

  return {
    success: true,
    theme: {
      type: theme.type,
      name: theme.name,
      colors: {
        debugStep: fallbackTheme.colors.debugStep,
        breakpoint: fallbackTheme.colors.breakpoint,
        ...theme.colors
      },
      boldTokens: theme.boldTokens ?? [],
      italicTokens: theme.italicTokens ?? [],
      underlineTokens: theme.underlineTokens ?? []
    }
  };
});
