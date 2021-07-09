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

const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  node: {
    __dirname: false
  },
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [
          path.resolve(__dirname, "src/background"),
          path.resolve(__dirname, "main.ts"),
        ]
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.node'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "tsconfig.serve.json")
      })
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/background/server', to: 'server' }
      ]
    })
  ],
  target: 'electron-main',
  entry: './main.ts',
  output: {
    filename: 'background-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
};
