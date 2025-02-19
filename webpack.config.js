const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  if (env.mode === "production") {
    if (argv.platform === "web") {
      config.plugins.push(
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: "./web/service-worker.js",
          swDest: "service-worker.js",
        })
      );
      config.output.publicPath = "/";
    }
  }

  if (env.mode === "development") {
    if (argv.platform === "web") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
        })
      );
    }
  }

  config.module.rules.push({
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  });

  config.optimization.minimize = true;
  config.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
          pure_funcs: ["console.info", "console.debug"],
        },
        output: {
          comments: false,
        },
      },
    }),
  ];

  config.externals = {
    react: "React",
    "react-dom": "ReactDOM",
  };

  config.optimization.splitChunks = {
    chunks: "all",
    minSize: 20000,
    maxSize: 70000,
    minChunks: 1,
    maxAsyncRequests: 20,
    maxInitialRequests: 20,
    automaticNameDelimiter: "~",
    automaticNameMaxLength: 30,
    cacheGroups: {
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
        name: "vendors",
      },
      common: {
        name: "common",
        minChunks: 2,
        priority: -5,
        reuseExistingChunk: true,
      },
    },
  };

  config.output = {
    ...config.output,
    filename: "[name].js",
    path: __dirname + "/dist",
    clean: true,
  };

  return config;
};
