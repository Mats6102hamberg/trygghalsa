/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  NetworkOnly,
  BackgroundSyncQueue,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Background sync queue for medication logging when offline
const medicationLogQueue = new BackgroundSyncQueue("medication-log-queue", {
  maxRetentionTime: 24 * 60, // 24 hours
});

// Intercept medication log POSTs for offline queueing
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (
    url.pathname === "/api/medications/log" &&
    event.request.method === "POST"
  ) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request.clone());
          return response;
        } catch {
          await medicationLogQueue.pushRequest({
            request: event.request,
          });
          // Return synthetic 202 so UI stays optimistic
          return new Response(JSON.stringify({ queued: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          });
        }
      })()
    );
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Never cache Clerk auth requests
    {
      matcher: ({ url }: { url: URL }) => /\.clerk\./.test(url.hostname),
      handler: new NetworkOnly(),
    },
    // Critical health data: stale-while-revalidate
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname === "/api/medications/today",
      handler: new StaleWhileRevalidate({
        cacheName: "medications-today",
      }),
    },
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname === "/api/dashboard/today",
      handler: new StaleWhileRevalidate({
        cacheName: "dashboard-today",
      }),
    },
    {
      matcher: ({ url }: { url: URL }) => url.pathname === "/api/medications",
      handler: new StaleWhileRevalidate({
        cacheName: "medications-list",
      }),
    },
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname === "/api/settings/home",
      handler: new StaleWhileRevalidate({
        cacheName: "home-settings",
      }),
    },
    // Other API routes: network-first with 5s timeout
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-general",
        networkTimeoutSeconds: 5,
      }),
    },
    // Default caching for static assets and pages
    ...defaultCache,
  ],
});

serwist.addEventListeners();
