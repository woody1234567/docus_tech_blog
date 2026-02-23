---
title: Docus AI 功能完整實作指南
description: 深入了解 Docus 中的 AI 功能：llms.txt 整合、MCP Server、AI Assistant 的原理與實作方式
category: ai
date: 2026-02-23
tags: [docus, mcp, llms-txt, ai-assistant, nuxt, ai]
---

# Docus AI 功能完整實作指南

Docus 是基於 Nuxt 4 的現代文件系統框架，其中最引人注目的特色之一就是原生支援 AI 整合。本文將深入探討 Docus 的三大 AI 功能：**LLMs 整合**、**MCP Server** 和 **AI Assistant**。

## 概觀：Docus AI 架構

Docus 的 AI 功能由三個核心模組組成：

| 功能 | 用途 | 端點 |
|------|------|------|
| **LLMs Integration** | 將文件內容轉換為 LLM 友好的格式 | `/llms.txt`, `/llms-full.txt` |
| **MCP Server** | 讓 AI 工具（如 Cursor、VS Code）直接查詢文件 | `/mcp` |
| **AI Assistant** | 內建的問答聊天機器人 | 內嵌於文件網站 |

---

## 一、LLMs Integration（llms.txt）

### 什麼是 llms.txt？

`llms.txt` 是一種標準化的文件格式，讓 LLM（大型語言模型）能夠快速理解你的文件結構。當 AI 工具存取你的文件網站時，它可以先讀取 `/llms.txt` 來獲得整體概覽。

Docus 透過整合 `nuxt-llms` 模組，自動生成以下檔案：

- **`/llms.txt`**：精簡版，包含頁面標題、路徑與描述
- **`/llms-full.txt`**：完整版，包含所有文件內容（適合大上下文窗口的模型）

### 自動生成原理

Docus 會在建置時掃描 `/content` 目錄中的所有 Markdown 檔案，並提取：
1. Frontmatter 中的 `title` 和 `description`
2. 頁面路徑
3. 內容結構

### 設定方式

在 `nuxt.config.ts` 中自訂 LLMs 輸出：

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  llms: {
    domain: 'https://your-docs.com',
    title: 'My Documentation',
    description: 'Technical documentation for My Product',
    full: {
      title: 'My Documentation - Complete Reference',
      description: 'Full documentation including implementation details',
    },
  },
})
```

### Raw Markdown 端點

除了 `llms.txt`，Docus 還提供原始 Markdown 端點，讓 AI 工具可以直接獲取未渲染的 Markdown 內容：

- **端點格式**：`/raw/<content-path>.md`
- **範例**：`/raw/en/getting-started/installation.md`

這大幅減少了 Token 使用量，因為 AI 不需要解析完整的 HTML。

---

## 二、MCP Server（Model Context Protocol）

### 什麼是 MCP？

**Model Context Protocol (MCP)** 是一個開放協議，用於標準化 AI 應用程式與外部服務之間的連接。每個 Docus 實例都內建一個 MCP Server，讓任何 MCP 客戶端（如 Claude、Cursor、VS Code）都能連接到你的文件。

### 內建工具

Docus MCP Server 提供兩個預設工具：

| 工具 | 功能 | 參數 |
|------|------|------|
| `list-pages` | 列出所有文件頁面 | `locale`（可選） |
| `get-page` | 獲取特定頁面的完整 Markdown 內容 | `path`（必填） |

### 在 AI 工具中設定

#### Cursor

在專案根目錄建立 `.cursor/mcp.json`：

```json [.cursor/mcp.json]
{
  "mcpServers": {
    "my-docs": {
      "type": "http",
      "url": "https://your-docs.com/mcp"
    }
  }
}
```

#### VS Code

建立 `.vscode/mcp.json`：

```json [.vscode/mcp.json]
{
  "servers": {
    "my-docs": {
      "type": "http",
      "url": "https://your-docs.com/mcp"
    }
  }
}
```

#### Claude Code

使用 CLI 指令：

```bash
claude mcp add --transport http my-docs https://your-docs.com/mcp
```

### 停用 MCP Server

若不需要 MCP 功能，可在 `nuxt.config.ts` 中停用：

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  mcp: {
    enabled: false,
  },
})
```

### 自訂 MCP 工具

Docus 使用 `@nuxtjs/mcp-toolkit` 模組，你可以在 `server/mcp/tools/` 目錄下建立自訂工具：

```ts [server/mcp/tools/search.ts]
import { z } from 'zod'

export default defineMcpTool({
  description: 'Search documentation by keyword',
  inputSchema: {
    query: z.string().describe('The search query'),
  },
  handler: async ({ query }) => {
    const results = await searchDocs(query)
    return {
      content: [{ type: 'text', text: JSON.stringify(results) }],
    }
  },
})
```

---

## 三、AI Assistant（內建問答助手）

### 功能介紹

AI Assistant 是 Docus 內建的聊天機器人，讓使用者可以用自然語言詢問文件相關問題。它的特色包括：

- **自動搜尋文件**：透過 MCP Server 搜尋相關內容
- **引用來源**：回答時附上參考頁面連結
- **程式碼範例**：自動生成可複製的程式碼片段

### 運作原理

Assistant 使用多代理架構：

1. **主代理（Main Agent）**：接收使用者問題，決定是否需要搜尋文件
2. **搜尋代理（Search Agent）**：使用 MCP Server 工具尋找相關內容
3. **回應生成**：將資訊整合成友善的回答

### 快速啟用

#### 1. 取得 API Key

從 [Vercel AI Gateway](https://vercel.com/~/ai/api-keys) 取得 API Key。

#### 2. 設定環境變數

```bash [.env]
AI_GATEWAY_API_KEY=your-api-key
```

#### 3. 部署

完成！當偵測到 API Key 時，Assistant 會自動啟用。

### 設定選項

在 `app.config.ts` 中自訂 Assistant 行為：

```ts [app.config.ts]
export default defineAppConfig({
  assistant: {
    // 顯示浮動輸入框
    floatingInput: true,

    // 顯示「用 AI 解釋」按鈕
    explainWithAi: true,

    // FAQ 問題（引導使用者）
    faqQuestions: [
      'How do I install Docus?',
      'How do I customize the theme?',
    ],

    // 鍵盤快捷鍵
    shortcuts: {
      focusInput: 'meta_i'  // Cmd+I (Mac) / Ctrl+I (Windows)
    },

    // 自訂圖示
    icons: {
      trigger: 'i-lucide-sparkles',
      explain: 'i-lucide-brain'
    }
  }
})
```

### 進階設定

在 `nuxt.config.ts` 中設定 AI 模型：

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  assistant: {
    // 使用的 AI 模型（支援 AI SDK Gateway 格式）
    model: 'google/gemini-3-flash',

    // MCP Server 路徑
    mcpServer: '/mcp',

    // API 端點路徑
    apiPath: '/__docus__/assistant'
  }
})
```

### 程式化控制

使用 `useAssistant` composable 來控制 Assistant：

```vue
<script setup>
const { isEnabled, isOpen, open, close, toggle, clearMessages } = useAssistant()

function askQuestion() {
  open('How do I configure the theme?', true)
}
</script>

<template>
  <UButton v-if="isEnabled" @click="askQuestion">
    Ask about themes
  </UButton>
</template>
```

---

## 實作範例：完整的 AI 整合設定

以下是一個完整的 Docus 專案 AI 設定範例：

### nuxt.config.ts

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // LLMs 整合
  llms: {
    domain: 'https://docs.myproject.com',
    title: 'MyProject Documentation',
    description: 'Official documentation for MyProject',
  },

  // AI Assistant
  assistant: {
    model: 'google/gemini-3-flash',
    mcpServer: '/mcp',
  },

  // 網站資訊（用於 Assistant 回應）
  site: {
    name: 'MyProject',
  },
})
```

### app.config.ts

```ts [app.config.ts]
export default defineAppConfig({
  assistant: {
    floatingInput: true,
    explainWithAi: true,
    faqQuestions: [
      {
        category: 'Getting Started',
        items: [
          'How do I install MyProject?',
          'What are the system requirements?',
        ]
      },
      {
        category: 'Configuration',
        items: [
          'How do I configure authentication?',
          'How do I customize the theme?',
        ]
      }
    ],
  }
})
```

---

## 總結

Docus 的 AI 功能讓你的文件網站不再只是靜態內容，而是成為一個智慧的知識庫：

| 功能 | 適用場景 |
|------|----------|
| **llms.txt** | 讓任何 LLM 快速理解你的文件結構 |
| **MCP Server** | 整合到 IDE（Cursor、VS Code）中，開發時即時查詢 |
| **AI Assistant** | 為終端使用者提供即時問答功能 |

這三個功能相輔相成，共同打造出現代化的 AI-Ready 文件體驗。

---

*本文基於 Docus v5 官方文件撰寫，更多資訊請參考 [docus.dev](https://docus.dev)*
