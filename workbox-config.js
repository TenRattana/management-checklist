module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,ttf,png,ico,html,json}"],
  swDest: "dist/sw.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
