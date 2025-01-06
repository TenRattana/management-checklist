module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,html,ttf,png,ico}"],
  swDest: "dist/sw.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
