const path = require('path');

module.exports = {
  entry: "./src/bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/bdk-cli/playground/",
    filename: "playground.js",
  }
};
