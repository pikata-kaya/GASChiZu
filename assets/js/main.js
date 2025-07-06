document.addEventListener("DOMContentLoaded", () => {
  /**
   * 共通コンポーネント（ヘッダー、フッター）を読み込む
   */
  const loadComponent = (componentPath, targetId) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      fetch(componentPath)
        .then((response) =>
          response.ok
            ? response.text()
            : Promise.reject("コンポーネントの読み込みに失敗")
        )
        .then((data) => {
          targetElement.innerHTML = data;
          // ヘッダー読み込み後にハンバーガーメニューのイベントリスナーをセット
          if (targetId === "header-placeholder") {
            setupHamburgerMenu();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  // ヘッダーとフッターを読み込む
  loadComponent("/components/header.html", "header-placeholder");
  loadComponent("/components/footer.html", "footer-placeholder");
});

/**
 * ハンバーガーメニューの制御
 */
function setupHamburgerMenu() {
  const hamburgerButton = document.getElementById("hamburger-button");
  // header.htmlにnavが含まれるため、nav-placeholderではなく、読み込まれた後のnav-menuを探す
  const navMenu = document.getElementById("nav-menu");

  if (hamburgerButton && navMenu) {
    hamburgerButton.addEventListener("click", () => {
      navMenu.classList.toggle("is-active");
      hamburgerButton.classList.toggle("is-active");
    });
  }
}

/**
 * コードスニペットの「コピー」ボタン機能
 */
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("copy-button")) {
    const button = event.target;
    const pre = button
      .closest(".cheatsheet-body")
      .querySelector(".code-snippet code");
    if (!pre) return;

    const codeText = pre.innerText;
    const lines = codeText.split("\n");
    const executableCode = lines
      .filter((line) => !line.trim().startsWith("//") && line.trim() !== "")
      .join("\n");

    navigator.clipboard
      .writeText(executableCode)
      .then(() => {
        button.textContent = "コピー完了！";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = "コピー";
          button.disabled = false;
        }, 2000);
      })
      .catch((err) => {
        console.error("コピーに失敗しました", err);
        button.textContent = "失敗";
      });
  }
});
