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
        for(let fileReplacement of options.fileReplacements) {
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
    // These things seems doesn't work...
    config.resolve.alias = {
        'vscode': path.resolve(__dirname, './node_modules/monaco-languageclient/lib/vscode-compatibility')
    };
    config.node = {
        "fs": "empty",
        "global": true,
        "crypto": "empty",
        "tls": "empty",
        "net": "empty",
        "process": true,
        "module": false,
        "clearImmediate": false,
        "setImmediate": true
    };
    return config;
}
