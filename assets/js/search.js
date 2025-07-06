// defer属性で読み込むため、DOMContentLoadedは不要です。

const searchBox = document.getElementById("search-box");
const tagsContainer = document.getElementById("tags-container");
const resultsGrid = document.getElementById("results-grid");
const resultsCount = document.getElementById("results-count");
const reverseLookupList = document.getElementById("reverse-lookup-list"); // ★追加

let allCheatsheets = [];
let activeTags = new Set();

// JSONデータを読み込む
fetch("data/cheatsheet.json")
  .then((response) => {
    if (!response.ok) throw new Error("cheatsheet.jsonの読み込みに失敗");
    return response.json();
  })
  .then((data) => {
    allCheatsheets = data;
    displayTags(allCheatsheets);
    displayReverseLookup(allCheatsheets);
    filterAndDisplay();
  })
  .catch((error) => {
    console.error(error);
    if (resultsGrid)
      resultsGrid.innerHTML = "<p>データの読み込みに失敗しました。</p>";
  });

/**
 * やりたいことのグループ定義
 * 実務でよくあるタスクを、非エンジニアにも分かりやすい言葉で表現します。
 */
const reverseLookupGroups = [
  {
    title: "メールを自動で送りたい (Gmail)",
    items: [
      "workspace-gmail-001", // Gmailでメールを送信する
      "workspace-gmail-003", // 詳細オプションを指定してメールを送信
      "workspace-gmail-002", // 添付ファイル付きでメールを送信する
      "recipe-marketing-002", // 【レシピ】シートのリストに一括で個別メールを送信（差し込みメール）
      "recipe-daily-003", // 【レシピ】特定のGmailをLINEに自動で転送・通知する
      "workspace-gmail-004", // メールを下書きとして保存する
    ],
  },
  {
    title: "スプレッドシートの値を読み書き・操作したい",
    items: [
      "spreadsheet-cell-001", // 単一セルの値を取得する (getValue)
      "spreadsheet-cell-003", // 単一セルに値を設定する (setValue)
      "spreadsheet-cell-002", // 複数範囲の値を二次元配列で取得する (getValues)
      "spreadsheet-cell-004", // 複数範囲に値を一括で設定する (setValues)
      "spreadsheet-row-001", // 最終行にデータを1行追加する (appendRow)
      "spreadsheet-last-row-001", // データが入力されている最終行を取得する
      "spreadsheet-sheet-001", // アクティブなシートを取得する
      "spreadsheet-sheet-002", // IDを指定してスプレッドシートを開く
    ],
  },
  {
    title: "決まった時間に何かをさせたい (自動実行)",
    items: [
      "automation-trigger-001", // 毎日決まった時間に実行するトリガーを設定
      "automation-trigger-005", // 毎週月曜日の朝に実行するトリガーを設置
      "recipe-marketing-005", // 【レシピ】複数担当者の日報シートをマスターシートに毎朝集計
    ],
  },
  {
    title: "カレンダーに予定を入れたり、通知したりしたい",
    items: [
      "workspace-calendar-001", // Googleカレンダーに予定を作成する
      "recipe-marketing-001", // 【レシピ】カレンダーの特定予定5分前に参加者へリマインダーメールを送信
      "workspace-calendar-003", // IDを指定してカレンダーを取得する
      "workspace-calendar-002", // 特定の日付の予定をすべて取得する
    ],
  },
  {
    title: "ファイルやフォルダを自動で作成・整理したい (Google ドライブ)",
    items: [
      "workspace-drive-001", // Googleドライブにテキストファイルを作成する
      "recipe-marketing-003", // 【レシピ】スプレッドシートのデータから見積書を自動作成する
      "workspace-drive-002", // 名前を指定してフォルダを検索し、その中にファイルを作成する
      "workspace-drive-003", // フォルダ内のファイルをループ処理する
      "workspace-drive-004", // ファイルをコピーする
    ],
  },
  {
    title: "画面にボタンやメニュー、ダイアログを出したい",
    items: [
      "ui-menu-001", // スプレッドシートにカスタムメニューを追加する
      "ui-dialog-001", // シンプルなアラートダイアログを表示
      "ui-dialog-002", // ユーザーからの入力を受け付けるプロンプトを表示
      "ui-html-001", // HTMLを使ってカスタムサイドバーを表示する
      "ui-html-002", // HTMLサービスでモーダルダイアログを表示
      "ui-menu-002", // セパレーターとサブメニューを持つメニューを作成
    ],
  },
  {
    title: "何かの操作をきっかけに自動で動かしたい",
    items: [
      "automation-trigger-003", // ファイルを開いた時に実行する (onOpen)
      "automation-trigger-004", // セルを編集した時に実行する (onEdit)
      "automation-trigger-002", // フォーム送信時に処理を実行する
      "recipe-marketing-004", // 【レシピ】Webフォームの問い合わせをSlackとスプレッドシートに即時通知
    ],
  },
  {
    title: "エラーが起きたら通知がほしい・解決したい",
    items: [
      "beginner-error-001", // try-catchによるエラー処理
      "beginner-error-002", // finallyとエラー通知を組み合わせた高度なエラー処理
      "debug-error-001", // TypeError: Cannot read property '...' of null
      "debug-error-002", // ReferenceError: ... is not defined
      "debug-error-003", // Exceeded maximum execution time
      "debug-error-004", // エラー: 承認が必要です (Authorization is required)
      "debug-error-005", // エラー: 1日に送信できるメールの上限数を超えました
    ],
  },
  {
    title: "外部サービスと連携したい (Slack, LINE, 天気予報など)",
    items: [
      "external-api-001", // 外部APIを叩いてJSONデータを取得する
      "external-api-002", // 外部APIにPOSTリクエストを送信する
      "recipe-marketing-004", // 【レシピ】Webフォームの問い合わせをSlackとスプレッドシートに即時通知
      "recipe-daily-002", // 【レシピ】毎朝の天気予報をLINEに自動通知する
      "recipe-daily-003", // 【レシピ】特定のGmailをLINEに自動で転送・通知する
    ],
  },
];

/**
 * 逆引きリストをHTMLとして生成・表示する関数
 * @param {Array} allItems - 全チートシートデータ
 */
function displayReverseLookup(allItems) {
  if (!reverseLookupList) return;

  // データをIDで簡単に検索できるようにMapに変換
  const allItemsMap = new Map(allItems.map((item) => [item.id, item]));

  const categoryPageMap = {
    "はじめてのGAS": "beginner.html",
    "スプレッドシート操作": "spreadsheet.html",
    "Workspaceサービス連携": "workspace.html",
    "自動化とトリガー": "automation.html",
    "UIとHTML": "ui.html",
    "外部連携と設定管理": "integration.html",
    "開発と設定ファイル": "environment.html",
    "レシピ": "recipes.html",
    "エラーとデバッグ": "troubleshooting.html",
  };

  reverseLookupGroups.forEach((group) => {
    const groupTitle = document.createElement("h4");
    groupTitle.textContent = group.title;
    reverseLookupList.appendChild(groupTitle);

    const list = document.createElement("ul");
    group.items.forEach((itemId) => {
      const item = allItemsMap.get(itemId);
      if (item) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        const pageFile = categoryPageMap[item.category];
        if (pageFile) {
          link.href = `category/${pageFile}#${item.id}`;
        }
        link.textContent = item.title;
        listItem.appendChild(link);
        list.appendChild(listItem);
      }
    });
    reverseLookupList.appendChild(list);
  });
}

// タグ一覧を動的に生成・表示
function displayTags(items) {
  // (この関数は変更なし)
  if (!tagsContainer) return;
  const allTags = new Set();
  items.forEach((item) => {
    item.tags.forEach((tag) => allTags.add(tag));
  });
  const sortedTags = [...allTags].sort((a, b) => a.localeCompare(b, "ja"));
  sortedTags.forEach((tag) => {
    const tagButton = document.createElement("button");
    tagButton.className = "tag-button";
    tagButton.textContent = tag;
    tagButton.dataset.tag = tag;
    tagsContainer.appendChild(tagButton);
  });
}

// フィルタリングして結果を表示するメインの関数
function filterAndDisplay() {
  // (この関数は変更なし)
  const searchText = searchBox ? searchBox.value.toLowerCase().trim() : "";
  const filteredItems = allCheatsheets.filter((item) => {
    const matchesTags =
      activeTags.size === 0 ||
      [...activeTags].every((tag) => item.tags.includes(tag));
    const matchesText =
      !searchText ||
      item.title.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchText));
    return matchesTags && matchesText;
  });
  displayResults(filteredItems);
}

// 検索結果をHTMLに描画
function displayResults(items) {
  // (この関数は変更なし)
  if (!resultsGrid || !resultsCount) return;
  resultsGrid.innerHTML = "";
  resultsCount.textContent = `${items.length}件のチートシートが見つかりました`;
  if (items.length === 0) {
    resultsGrid.innerHTML = "<p>該当するチートシートはありません。</p>";
    return;
  }
  const categoryPageMap = {
    "はじめてのGAS": "beginner.html",
    "スプレッドシート操作": "spreadsheet.html",
    "Workspaceサービス連携": "workspace.html",
    "自動化とトリガー": "automation.html",
    "UIとHTML": "ui.html",
    "外部連携と設定管理": "integration.html",
    "開発と設定ファイル": "environment.html",
    "レシピ": "recipes.html",
    "エラーとデバッグ": "troubleshooting.html",
  };
  items.forEach((item) => {
    const card = document.createElement("a");
    const pageFile = categoryPageMap[item.category];
    if (pageFile) {
      card.href = `category/${pageFile}#${item.id}`;
    }
    card.className = "result-card";
    card.innerHTML = `
            <div class="card-category">${item.category}</div>
            <h4 class="card-title">${item.title}</h4>
            <p class="card-description">${item.description}</p>
            <div class="card-tags">タグ: ${item.tags.join(", ")}</div>
        `;
    resultsGrid.appendChild(card);
  });
}

// イベントリスナーの設定
if (searchBox) searchBox.addEventListener("input", filterAndDisplay);
if (tagsContainer) {
  tagsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("tag-button")) {
      const tag = e.target.dataset.tag;
      e.target.classList.toggle("active");
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }
      filterAndDisplay();
    }
  });
}
