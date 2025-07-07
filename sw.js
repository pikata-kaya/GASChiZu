// キャッシュの名前とバージョン
const CACHE_NAME = "gas-cheatsheet-v1.0";

// ここには、サイトの骨格となるApp Shellだけを残します。
const urlsToCache = [
  // 共通ファイル
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/css/style.css",
  "/assets/js/main.js",

  // UIに必須のアイコン
  "/assets/img/icon-192x192.png",
  "/assets/img/icon-512x512.png",

  // データ
  "/data/cheatsheet.json",

  // JSファイル
  "/assets/js/search.js",
  "/assets/js/category-tabs.js",

  // 各カテゴリーページHTML
  "/category/beginner.html",
  "/category/spreadsheet.html",
  "/category/workspace.html",
  "/category/automation.html",
  "/category/ui.html",
  "/category/integration.html",
  "/category/environment.html",
  "/category/recipes.html",
  "/category/troubleshooting.html",
];

// PWAのインストール処理（変更なし）
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// 古いキャッシュの削除処理（変更なし）
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// fetchイベントの処理を「動的キャッシュ」戦略に変更
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. キャッシュにリソースがあれば、それを返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. キャッシュになければ、ネットワークから取得しにいく
      return fetch(event.request.clone()).then((networkResponse) => {
        // 取得に失敗したか、外部リソースの場合はそのまま返す
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        // 3. 取得に成功したら、キャッシュに保存してからブラウザに返す
        // (ユーザーが見た画像などが、このタイミングでキャッシュされる)
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
