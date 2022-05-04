//Polyfill Node.js core modules in Webpack. This module is only needed for webpack 5+.
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

/**
 * Custom angular webpack configuration
 */
module.exports = (config, options) => {
  config.target = 'electron-renderer';
  config.node = {
    global: true
  };
  config.plugins = [...config.plugins,new NodePolyfillPlugin({excludeAliases: ["console", "process"]})];

  return config;
}
