// キャッシュの名前とバージョン
const CACHE_NAME = "gas-cheatsheet-v2.0";

// キャッシュするファイルのリスト
const urlsToCache = [
  // 共通ファイル
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/css/style.css",
  "/assets/js/main.js",
  "/assets/img/icon-192x192.png",
  "/assets/img/icon-512x512.png",

  // データ
  "/data/cheatsheet.json",

  // トップページ用JS
  "/assets/js/search.js",

  // カテゴリーページ用JS
  "/assets/js/category-tabs.js",

  // 各カテゴリーページHTML
  "/category/basics.html",
  "/category/spreadsheet.html",
  "/category/workspace.html",
  "/category/automation.html",
  "/category/ui.html",
  "/category/integration.html",
  "/category/environment.html",
];

// PWAのインストール時に実行されるイベント
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and added all files");
      return cache.addAll(urlsToCache);
    })
  );
});

// 新しいService Workerが有効になった時に、古いキャッシュを削除する処理を追加
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

// サイトへのリクエストがあった場合に実行されるイベント
self.addEventListener("fetch", (event) => {
  // 注意: 外部ライブラリ(CDN)はキャッシュ対象外
  if (event.request.url.startsWith("http")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // キャッシュに一致するファイルがあれば、それを返す
        if (response) {
          return response;
        }
        // キャッシュになければ、ネットワークから取得しにいく
        return fetch(event.request);
      })
    );
  }
});
