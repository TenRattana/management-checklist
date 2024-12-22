const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const TerserPlugin = require("terser-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // // ตรวจสอบว่าอยู่ในโหมด production หรือ development
  // if (env.mode === 'production') {
  //   // Web-specific logic สำหรับการเพิ่ม Workbox ใน production
  //   if (argv.platform === "web") {
  //     const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
  //     config.plugins.push(
  //       new WorkboxWebpackPlugin.InjectManifest({
  //         swSrc: './web/service-worker.js',
  //         swDest: 'service-worker.js',
  //       })
  //     );
  //     config.output.publicPath = '/';
  //   }
  // }

  // if (env.mode === "development") {
  //   // Web-specific logic สำหรับการใช้ Bundle Analyzer ใน development
  //   if (argv.platform === "web") {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //       })
  //     );
  //   }
  // }

  // เพิ่มการตั้งค่า loader สำหรับ CSS ทั้งใน Web และ Mobile
  config.module.rules.push({
    test: /\.css$/,
    use: ["style-loader", "css-loader"],
  });

  // ปรับการบีบอัดไฟล์ JavaScript สำหรับการใช้งานทุกแพลตฟอร์ม
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

  // แยกการตั้งค่า Externals สำหรับ React และ ReactDOM เพื่อไม่ให้รวมอยู่ใน Bundle
  config.externals = {
    react: "React",
    "react-dom": "ReactDOM",
  };

  // การตั้งค่าการแยก Chunk สำหรับทั้ง Web และ Mobile
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

  return config;
};
