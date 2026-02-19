# Project Summary - Woody's Tech Blog

這是一個基於 **Docus** (由 Nuxt Content 驅動的技術文件系統) 建立的個人技術部落格，由 Woody 開發與維護。

## 🏗️ 核心架構
- **框架**: [Nuxt 4](https://nuxt.com/) (使用了最新的 Nuxt 4 配置風格)。
- **主題系統**: [Docus](https://docus.dev/)，專為技術文件設計的 Markdown 渲染系統。
- **配置**:
  - `nuxt.config.ts`: 整合了 AI 輔助設定 (`google/gemini-3-flash`) 與 MCP Server 支援。
  - `package.json`: 依賴包含 Nuxt 核心組件、字體、圖標系統 (`@nuxt/icon`) 以及 `better-sqlite3`。

## 📂 目錄結構說明
- **`/content`**: 所有的 Markdown 內容存放處，也是部落格的核心。
  - `index.md`: 首頁，使用 Docus 的 `::u-page-hero` 和 `::u-page-section` 組件構建。
  - **`/blogs`**: 主要的文章分類：
    - `ai/`: 探討 MCP、LLMs 等人工智慧技術。
    - `web_dev/`: 涵蓋網路開發基礎（DOM, RESTful, JWT, WebSocket, SEO 等）。
    - `nuxt/`: 深入分析 Nuxt 目錄結構、Nitro 引擎、前端建置等。
    - `python/`: 介紹 `uv` 工具、Memory Buffer 等 Python 技術。
  - **`/1.getting-started` & `/2.essentials`**: 繼承自 Docus 的基礎文件範例，提供 Markdown 語法與組件使用教學。
- **`/public`**: 存放靜態資源，如 Favicon 和展示圖片。
- **`/skills`**: 專案內置的 Agent Skills，目前包含 `create-docs`，用於文件系統的自動化管理。

## ✍️ 如何建立新文章
在 Docus 系統中，建立文章非常直觀，主要分為以下步驟：

1. **選擇分類目錄**:
   - 導航至 `content/blogs/` 下的相應分類（如 `ai/`, `web_dev/` 等）。
   - 如果需要新分類，直接建立新資料夾即可。

2. **建立 Markdown 檔案**:
   - 在該目錄下建立 `.md` 檔案（例如：`my-new-post.md`）。
   - 檔案名稱將直接對應到 URL 路徑（例如：`/blogs/ai/my-new-post`）。

3. **設定 Frontmatter**:
   - 在檔案最上方加入 YAML 格式的設定，用於 SEO、分類、標籤及日期：
     ```markdown
     ---
     title: 文章標題
     description: 文章簡短描述，會顯示在搜尋結果中
     category: web_dev
     date: 2026-02-05
     tags: [seo, nuxt, llms-txt, crawler, ai]
     ---
     ```
     - `category`: 文章的主要分類。
     - `date`: 發布日期（建議格式 YYYY-MM-DD）。
     - `tags`: 文章標籤列表，用方括號 `[]` 包裹。

4. **撰寫內容**:
   - 使用標準 Markdown 語法。
   - **程式碼塊**: 使用 \` ```python \` (或其他語言) 來啟用語法高亮。
   - **特殊組件**: 可以使用 Docus 提供的 MDC 組件，例如：
     - `::u-alert{type="info"} 內容 ::` (顯示提示框)
     - `::u-page-hero ... ::` (建立大圖首頁)

5. **排序與導覽**:
   - 若要控制側邊欄的顯示順序，可以在檔名前加上數字（如 `1.introduction.md`, `2.getting-started.md`）。

## 🚀 主要特色
1. **MDC (Markdown Components)**: 大量使用 `::` 語法調用 Vue 組件，使技術文章具備極高的互動性與美觀度。
2. **SEO 優化**: 透過 Frontmatter 直接管理每篇文章的 SEO 標題與描述。
3. **AI 友好**: 專案配置中預留了 AI 模型接口，方便 Agentic 工作流接入。
4. **全方位技術覆蓋**: 從底層協議（HTTP/SSH）到現代框架（Nuxt/AI MCP），展現了全棧開發的視野。

---
*Created by Ray (AI Assistant) on 2026-02-19*
