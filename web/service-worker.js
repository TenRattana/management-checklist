self.__WB_MANIFEST = self.__WB_MANIFEST || [];

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// แคชไฟล์จาก precaching
precacheAndRoute(self.__WB_MANIFEST);

// ใช้ StaleWhileRevalidate สำหรับไฟล์ static เช่น CSS, JS
registerRoute(
  ({ request }) => ["style", "script"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "static-cache",
  })
);

// เพิ่มการจัดการ cache สำหรับ image assets
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100, // จำกัดจำนวนรายการ
        maxAgeSeconds: 60 * 60 * 24 * 30, // เก็บไว้ 30 วัน
      }),
    ],
  })
);
