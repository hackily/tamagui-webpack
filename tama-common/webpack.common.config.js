const dotenv = require("dotenv");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

dotenv.config({
  path: path.resolve(__dirname, "../tama-common/.env"),
});

const ENVIRONMENT_VARIABLES = ["TAMA_COMMON_TEST"].reduce((env, variable) => {
  // eslint-disable-next-line no-param-reassign
  env[variable] = JSON.stringify(process.env[variable]);
  return env;
}, {});

const DEV = process.env.NODE_ENV !== "production";
const NODE_ENV = process.env.NODE_ENV || "development";
const TARGET = process.env.TARGET || "web";

const getConfig = (serviceDir, port) => {
  const inclusions = [
    path.resolve(serviceDir, "src"),
    path.resolve(serviceDir, "../tama-common"),
    path.resolve(serviceDir, "../node_modules/@tamagui"),
  ];
  const config = {
    resolve: {
      extensions: [".web.js", ".js", ".jsx", ".ts", ".tsx"],
      symlinks: true,
      alias: {
        "react-native$": "react-native-web",
        "react-native-svg": "react-native-svg-web",
        "@react-native-picker/picker": "react-native-web",
        "react-pdf": "react-pdf/dist/umd/entry.webpack",
      },
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: inclusions,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: {
                plugins: [
                  process.env.NODE_ENV === "development" &&
                    require.resolve("react-refresh/babel"),
                ].filter(Boolean),
              },
            },
          ],
        },
        // Handle CSV
        {
          test: /\.csv$/,
          loader: "csv-loader",
          options: {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true,
          },
        },
        // Handle SVG
        {
          test: /\.svg$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: "removeViewBox",
                      active: false,
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.ejs$/,
          loader: "ejs-loader",
          options: { esModule: false },
        },
        // Handle files
        {
          test: /\.(jpg|gif|png|woff|woff2|eot|ttf|ico|xml)(\?v=[0-9]\.[0-9]\.[0-9])?$/, // eslint-disable-line max-len
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
        // Handle Markdown
        {
          test: /\.md$/,
          type: "asset/source",
        },
        // Handle css loader
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        // Handle scss loader
        {
          test: /\.scss$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules/,
      }),
      new webpack.DefinePlugin({
        process: {
          env: {
            __DEV__: NODE_ENV === "development" ? "true" : "false",
            IS_STATIC: '""',
            NODE_ENV: JSON.stringify(NODE_ENV),
            TAMAGUI_TARGET: JSON.stringify("web"),
            DEBUG: JSON.stringify(process.env.DEBUG || ""),
            BROWSER: JSON.stringify(TARGET !== "node"),
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: `./src/index.ejs`,
      }),
      new webpack.ProvidePlugin({
        React: "react",
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  };

  switch (process.env.NODE_ENV) {
    case "development": {
      config.mode = "development";
      config.entry = {
        app: [
          "core-js-pure/stable",
          "regenerator-runtime/runtime",
          "./src/index.js",
        ],
      };
      config.devServer = {
        // To prevent the overlay from failing integration tests
        client: {
          overlay: false,
        },
        // To allow history API to work
        historyApiFallback: true,
        // To allow dev server to work inside Docker
        allowedHosts: ["host.docker.internal", "localhost"],
        host: "0.0.0.0",
        hot: true,
        port,
        static: {
          directory: "./build",
        },
      };
      config.output = {
        filename: "bundle.js",
        path: path.resolve(serviceDir, "build"),
        publicPath: "/",
      };
      config.devtool = "inline-source-map";
      config.plugins.unshift(
        new webpack.DefinePlugin({
          process: {
            env: {
              NODE_ENV: JSON.stringify("development"),
              IS_STATIC: '""',
              TAMAGUI_TARGET: JSON.stringify("web"),
              DEBUG: JSON.stringify(process.env.DEBUG || ""),
              BROWSER: JSON.stringify(TARGET !== "node"),
            },
          },
          ...ENVIRONMENT_VARIABLES,
        })
      );
      config.plugins.unshift(
        new HtmlWebpackPlugin({
          filename: path.resolve(config.output.path, "index.html"),
          template: `./src/index.ejs`,
        })
      );
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
      config.plugins.push(new ReactRefreshWebpackPlugin());
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
      break;
    }
    default: {
      throw Error("Invalid environment specified - must be dev or build.");
    }
  }
  return config;
};

module.exports = {
  getConfig,
};
