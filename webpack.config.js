const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.module.rules.push({
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  });

  config.optimization = {
    runtimeChunk: "single",
  };

  return config;
};
