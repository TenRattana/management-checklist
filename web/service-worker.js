self.__WB_MANIFEST = self.__WB_MANIFEST || [];

import { clientsClaim } from "workbox-core";
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

clientsClaim();
// precacheAndRoute([
//   ...self.__WB_MANIFEST,
//   "/entry-*.js",
//   '/assets/fonts/Poppins-Regular.ttf',
//   '/assets/fonts/Sarabun-Regular.ttf',  
// ]);

precacheAndRoute([
  ...self.__WB_MANIFEST,
  '/assets/fonts/Poppins-Regular.ttf',
  '/assets/fonts/Sarabun-Regular.ttf',
  '/assets/fonts/MaterialIcons.ttf', 
]);

registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") {
      return false;
    } 

    if (url.pathname.startsWith("/_")) {
      return false;
    } 

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } 

    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

registerRoute(
  ({ url }) =>
    url.origin === self.location.origin && url.pathname.endsWith(".png"), 
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

registerRoute(
  ({ request }) => ["style", "script"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "static-cache",
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/assets/fonts/') && /\.(woff|woff2|ttf|otf)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // อายุแคช 30 วัน
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({
    cacheName: 'json-cache',
  })
);

// registerRoute(
//   ({ url }) => url.pathname.startsWith('/assets/images/') && /\.(jpg|png)$/i.test(url.pathname),
//   new CacheFirst({
//     cacheName: 'images-cache',
//     plugins: [
//       new ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 60 * 60 * 24 * 30,
//       }),
//     ],
//   })
// );

// registerRoute(
//   ({ url }) => url.pathname.startsWith('/assets/animations/') && /\.(lottie|json)$/i.test(url.pathname),
//   new CacheFirst({
//     cacheName: 'animations-cache',
//     plugins: [
//       new ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 60 * 60 * 24 * 30,
//       }),
//     ],
//   })
// );

// registerRoute(
//   ({ url }) => /assets\/animations\/.*\.(?:lottie|json)$/i.test(url.pathname), 
//   new workbox.strategies.CacheFirst({
//     cacheName: 'animations-cache',
//     plugins: [
//       new ExpirationPlugin({ maxEntries: 50 }),
//     ],
//   })
// );

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!["fonts-cache", "static-cache", "images-cache"].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("install", (event) => {
  self.skipWaiting(); 
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); 
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);  
    })
  );
});