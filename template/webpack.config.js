const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const sass = require("node-sass");
const cheerio = require("cheerio");
const moment = require("moment");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const StyleExtHtmlWebpackPlugin = require("style-ext-html-webpack-plugin");
const GraphBundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const BabiliPlugin = require("babili-webpack-plugin");
const packageInfo = require("./package.json");

const postcssPlugins = [
  require("postcss-remove-selectors")({selectors: [
    /figure|hr|pre|abbr|code|kbd|samp|dfn|mark|small|sub|sup|audio|video|details|menu|summary|canvas|template|code|figcaption|main|input|fieldset/,
    /button|optgroup|select|textarea|legend|progress|textarea|file-upload-button|::-webkit-file-upload-button/,
    /b$/, 'html [type="button"]', '[type="', "[hidden]"
  ]}),
  require("postcss-cssnext")({browsers: ["last 1 versions", "IE 11", "Safari >= 9"], cascade: false}),
  require("postcss-discard-comments")({removeAll: true})
];

const cssPipeline = ExtractTextPlugin.extract({
  fallback: "style-loader",
  use: [
    "css-loader",
    {loader: "postcss-loader", options: {plugins: () => postcssPlugins}},
    {loader: "sass-loader", options: {
      outputStyle: "compressed",
      functions: {svg: param => new sass.types.String(`url('data:image/svg+xml;utf8,${fs.readFileSync(param.getValue())}')`)},
      includePaths: ["lazier.sass", "ribbon.css", "normalize.css", "fixed-data-table", "react-select", "react-dates"].map(l => `node_modules/${l}`)}
    }
  ]
});

const loadIcons = function(...whitelist){
  const library = cheerio.load(fs.readFileSync(path.resolve(process.cwd(), "src/css/font-awesome.svg"), "utf-8"));

  const icons = library("symbol[id^=icon-]").toArray().reduce((accu, dom, index) => {
    const icon = library(dom);
    const name = icon.attr("id").replace(/^icon-/g, "");
    const tag = `i${index}`;

    icon.attr("id", tag);
    icon.find("title").remove();

    if(whitelist.includes(name)){
      const definition = icon.wrap("<div/>").parent().html().replace(/\n/mg, "").replace(/^\s+/mg, "");
      accu[name] = {tag, reference: `<svg class="icon icon-${name} %s"><use xlink:href="#${tag}"></use></svg>`, definition};
    }

    return accu;
  }, {});

  icons._imported = new Set();

  return icons;
};

module.exports = function(env){
  if(!env)
    env = "development";

  const environment = Object.assign(
    {
      environment: env,
      serviceWorkerEnabled: true
    },
    packageInfo.site.common, packageInfo.site[env] || {}
  );
  const version = JSON.stringify(moment.utc().format("YYYYMMDD-HHmm"));

  const plugins = [
    new webpack.DefinePlugin({
      env: JSON.stringify(environment),
      version,
      ICONS: JSON.stringify(loadIcons()),
      "process.env": {NODE_ENV: JSON.stringify(env)} // This is needed by React for production mode
    }),
    new HtmlWebpackPlugin({template: "src/index.html.jsx", minify: {collapseWhitespace: true}, excludeAssets: [/\.js$/]}),
    new HtmlWebpackExcludeAssetsPlugin(),
    new ExtractTextPlugin({filename: "css/style.css"})
  ];

  if(env === "production")
    plugins.push(...[new BabiliPlugin({mangle: false}), new StyleExtHtmlWebpackPlugin()]); // PI: Remove mangle when Safari 10 is dropped: https://github.com/mishoo/UglifyJS2/issues/1753
  else
    plugins.push(new GraphBundleAnalyzerPlugin({openAnalyzer: false}));

  return {
    entry: {
      "js/app.js": "./src/js/application.jsx",
      "sw.js": "./src/js/service-worker.js"
    },
    output: {filename: "[name]", path: path.resolve(__dirname, "dist"), publicPath: "/"},
    module: {
      rules: [
        {
          test: /\.jsx?$/, exclude: /node_modules/,
          use: {loader: "babel-loader", options: {presets: ["react", ["env", {targets: {browsers: ["last 2 versions"]}}]]}}
        },
        {test: /\.scss$/, use: cssPipeline},
        {
          test: /\.(?:png|jpg|svg|)$/,
          use: [
            {
              loader: "file-loader",
              options: {name: "[path][name].[ext]", outputPath: p => `${p.replace("src/", "")}`, publicPath: p => `/${p.replace("src/", "")}`}
            }
          ]
        },
      ]
    },
    resolve: {extensions: [".js", ".jsx"]},
    plugins,
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      historyApiFallback: true,
      compress: true,
      host: "home.cowtech.it",
      port: 4200
    }
  };
};
