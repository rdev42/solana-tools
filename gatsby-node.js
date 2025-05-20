/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig();

  if (config.externals && config.externals[0]) {
    config.externals[0]["node:crypto"] = require.resolve("crypto-browserify");
  }
  actions.replaceWebpackConfig(config);

  actions.setWebpackConfig({
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.ProvidePlugin({
        React: "react",
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      new webpack.NormalModuleReplacementPlugin(/node:crypto/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    ],
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        os: require.resolve("os-browserify/browser"),
        fs: require.resolve("browserify-fs"),
        path: require.resolve("path-browserify"),
      },
    },
  });
};
