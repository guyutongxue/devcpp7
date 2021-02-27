/**
 * Custom angular webpack configuration
 */
const path = require('path');

/**
 *
 * @param {import('webpack').Configuration} config
 * @param {import('@angular-builders/custom-webpack').CustomWebpackBrowserSchema} options
 */
module.exports = (config, options) => {
  config.target = 'electron-renderer';

  if (options.fileReplacements) {
    for (let fileReplacement of options.fileReplacements) {
      if (fileReplacement.replace !== 'src/environments/environment.ts') {
        continue;
      }

      let fileReplacementParts = fileReplacement['with'].split('.');
      if (fileReplacementParts.length > 1 && ['web'].indexOf(fileReplacementParts[1]) >= 0) {
        config.target = 'web';
      }
      break;
    }
  }

  config.resolve.alias = {
    'vscode': path.resolve(__dirname, './node_modules/monaco-languageclient/lib/vscode-compatibility')
  };
  config.resolve.fallback = {
    "path": require.resolve("path-browserify"),
    "crypto": false,
    "fs": false,
    "os": false,
    "tls": false,
    "net": false,
    // "process": true,
    "module": false,
    "clearImmediate": false,
    // "setImmediate": true
  }
  config.node = {
    "global": true,
  };
  return config;
}
