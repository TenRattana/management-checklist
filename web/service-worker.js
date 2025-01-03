self.__WB_MANIFEST = self.__WB_MANIFEST || [];

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

console.log("Precache Manifest:", self.__WB_MANIFEST);

precacheAndRoute([
  ...self.__WB_MANIFEST,
  "/entry-*.js",  
]);

registerRoute(
  ({ request }) => ["style", "script"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "static-cache",
  })
);

registerRoute(
  ({ url }) => /assets\/fonts\/.*\.(?:woff|woff2|ttf|otf)$/i.test(url.pathname),
  new workbox.strategies.CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => /assets\/images\/.*\.(?:png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i.test(url.pathname),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => /assets\/animations\/.*\.(?:lottie|json)$/i.test(url.pathname), 
  new workbox.strategies.CacheFirst({
    cacheName: 'animations-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/entry-") && url.pathname.endsWith(".js"),
  new StaleWhileRevalidate({
    cacheName: "entry-cache",
  })
);

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
});
