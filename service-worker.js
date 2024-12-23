self.__WB_MANIFEST = self.__WB_MANIFEST || [];

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === "http://172.20.10.3/m_checklist/Services/",
  new CacheFirst({
    cacheName: "api-cache",
  })
);
