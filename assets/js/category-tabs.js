const categoryHeader = document.querySelector(".category-header h2");
if (categoryHeader) {
  const CATEGORY_NAME = categoryHeader.textContent.trim();
  const jsonPath = "../data/cheatsheet.json";

  fetch(jsonPath)
    .then((response) => {
      if (!response.ok) throw new Error("cheatsheet.jsonの読み込みに失敗");
      return response.json();
    })
    .then((data) => {
      const categoryData = data.filter(
        (item) => item.category === CATEGORY_NAME
      );
      buildUI(categoryData);
    })
    .catch((error) => {
      console.error(error);
      const contentContainer = document.querySelector(".content-container");
      if (contentContainer)
        contentContainer.innerHTML = "<p>データの読み込みに失敗しました。</p>";
    });
}

function buildUI(items) {
  if (typeof marked !== "undefined") {
    marked.setOptions({ gfm: true, breaks: true });
  }
  const tabs = [...new Set(items.map((item) => item.tab))];
  const tabMenu = document.querySelector(".tab-menu");
  const contentContainer = document.querySelector(".content-container");
  if (!tabMenu || !contentContainer) return;
  tabMenu.innerHTML = "";
  contentContainer.innerHTML = "";
  tabs.forEach((tabName, index) => {
    const tabId = `panel-${index}`;
    const tabItem = document.createElement("li");
    tabItem.className = "tab-item";
    tabItem.dataset.tab = tabId;
    tabItem.textContent = tabName;
    const contentPanel = document.createElement("div");
    contentPanel.id = tabId;
    contentPanel.className = "content-panel";
    if (index === 0) {
      tabItem.classList.add("active");
      contentPanel.classList.add("active");
    }
    tabMenu.appendChild(tabItem);
    contentContainer.appendChild(contentPanel);
  });
  items.forEach((item) => {
    const tabIndex = tabs.indexOf(item.tab);
    if (tabIndex === -1) return;
    const panel = document.getElementById(`panel-${tabIndex}`);
    if (panel) {
      panel.appendChild(createCheatsheetItem(item));
    }
  });
  if (window.matchMedia("(max-width: 768px)").matches) {
    setupAccordionFromGeneratedUI();
  } else {
    setupTabsFromGeneratedUI();
  }
  if (typeof hljs !== "undefined") {
    document.querySelectorAll(".code-snippet code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }
  handleAnchorLinkOnLoad();
}

function setupTabsFromGeneratedUI() {
  const tabItems = document.querySelectorAll(".tab-item");
  tabItems.forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-item")
        .forEach((item) => item.classList.remove("active"));
      document
        .querySelectorAll(".content-panel")
        .forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      const targetPanel = document.getElementById(tab.dataset.tab);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });
}

function setupAccordionFromGeneratedUI() {
  const contentContainer = document.querySelector(".content-container");
  const tabMenu = document.querySelector(".tab-menu");
  if (!contentContainer || !tabMenu) return;
  const accordionHtml = Array.from(tabMenu.children)
    .map((tab) => {
      const panelId = tab.dataset.tab;
      const panel = document.getElementById(panelId);
      return `
            <div class="accordion-item">
                <button class="accordion-trigger">${tab.textContent}</button>
                <div class="accordion-content">${panel.innerHTML}</div>
            </div>
        `;
    })
    .join("");
  contentContainer.innerHTML = accordionHtml;
  contentContainer.addEventListener("click", (event) => {
    const trigger = event.target.closest(".accordion-trigger");
    if (trigger) trigger.parentElement.classList.toggle("is-open");
  });
}

function createCheatsheetItem(item) {
  console.log("表示しようとしているアイテム:", item);
  const itemElement = document.createElement("div");
  itemElement.className = "cheatsheet-item card";
  itemElement.id = item.id;
  let screenshotHtml = "";
  if (item.screenshot_url) {
    const escapedUrl = escapeHtml(item.screenshot_url);
    const escapedTitle = escapeHtml(item.title);
    screenshotHtml = `<img src="${escapedUrl}" alt="${escapedTitle}のスクリーンショット" class="cheatsheet-screenshot">`;
  }
  const descriptionHtml = item.description
    ? marked.parse(item.description)
    : "";
  const resultHtml = item.result ? marked.parse(item.result) : "";
  const escapedTitle = item.title ? escapeHtml(item.title) : "";
  const escapedCode = item.code ? escapeHtml(item.code) : "";
  let levelBadgeHtml = "";
  if (item.level) {
    const escapedLevel = escapeHtml(item.level);
    levelBadgeHtml = `<span class="level-badge ${escapedLevel}">${escapedLevel}</span>`;
  }
  itemElement.innerHTML = `
        <h3>
            <span class="cheatsheet-title-text">${escapedTitle}</span>
            ${levelBadgeHtml}
        </h3>
        <div class="cheatsheet-body">
            ${screenshotHtml}
            <div class="prose">${descriptionHtml}</div>
            <div class="code-header"><h4>コード:</h4><button class="copy-button" aria-label="コードをコピー">コピー</button></div>
            <pre class="code-snippet"><code class="language-javascript">${escapedCode}</code></pre>
            <h4>実行結果・補足:</h4>
            <div class="result-box prose">${resultHtml}</div>
        </div>
    `;
  return itemElement;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[match])
  );
}

function handleAnchorLinkOnLoad() {
  const hash = window.location.hash;
  if (!hash) return;
  const targetId = hash.substring(1);
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;
  if (window.matchMedia("(min-width: 769px)").matches) {
    const parentContentPanel = targetElement.closest(".content-panel");
    if (!parentContentPanel) return;
    const panelId = parentContentPanel.id;
    const targetTab = document.querySelector(
      `.tab-item[data-tab="${panelId}"]`
    );
    if (!targetTab) return;
    document
      .querySelectorAll(".tab-item")
      .forEach((item) => item.classList.remove("active"));
    document
      .querySelectorAll(".content-panel")
      .forEach((panel) => panel.classList.remove("active"));
    targetTab.classList.add("active");
    parentContentPanel.classList.add("active");
  }
  setTimeout(() => {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 100);
}
