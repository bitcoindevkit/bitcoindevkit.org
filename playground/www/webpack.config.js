const path = require('path');

module.exports = {
  entry: "./src/bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/repl/playground/",
    filename: "playground.js",
  }
};
