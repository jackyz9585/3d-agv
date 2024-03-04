const webpack = require("webpack");
const path = require("path");

const resolve = (dir) => {
  return path.join(__dirname, dir);
};
module.exports = {
  publicPath: "/3D",
  productionSourceMap: true,
  lintOnSave: false,
  devServer: {
    // 设置代理
    proxy: {
      "/api/*": {
        target: "http://192.168.1.127:9995",
        ws: false, // 是否启用websockets
        changOrigin: true, // 开启代理
        autoRewrite: true,
        cookieDomainRewrite: true,
        pathRewrite: {
          "/api/wmstest": "/api/wmstest",
        },
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "windows.jQuery": "jquery",
      }),
    ],
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(true);
    config.resolve.alias
      .set("@", resolve("src/"))
      .set("@BaseScence", resolve("src/components/BaseScence/"))
      .set("@Command", resolve("src/components/BaseScence/Command"));

    config.module
      .rule("tsvg")
      .test(/\.svg$/)
      .include.add(resolve("src/assets/svg"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "[name]",
      });
  },
};
