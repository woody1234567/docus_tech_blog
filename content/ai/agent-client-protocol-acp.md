---
title: ACP（Agent Client Protocol）是什麼？從 VS Code 到 AI Coding Agent 的核心溝通協定
description: 深入理解 ACP（Agent Client Protocol）的概念、運作方式與在 VS Code 中的角色，並比較 ACP、MCP、LSP 等 AI 協定之間的差異。
category: ai
date: 2026-05-19
tags: [acp, ai-agent, vscode, llm, ai-coding, protocol]
---

# ACP（Agent Client Protocol）是什麼？

最近如果你有在接觸：

- AI IDE
- Claude Code
- Cursor
- Continue
- OpenHands
- Cline
- Codex CLI

很可能會開始看到一個新名詞：

> ACP（Agent Client Protocol）

尤其在 VS Code 生態中，ACP 正逐漸變成「AI Coding Agent」的重要基礎設施。

很多人第一次看到 ACP 時，會以為它只是某種 AI plugin API，但其實它的定位更像：

> 「AI Agent 與編輯器之間的標準化溝通協定」

它的目標，是讓 AI 不只是聊天，而是真的能操作開發環境。([Agent Client Protocol GitHub Repository][1])

---

## 為什麼 AI Coding 需要 ACP？

過去的 AI coding assistant，比較像：

```txt
Copilot → 幫你補幾行 code
```

例如：

- autocomplete
- inline suggestion
- function completion

但現在 AI coding 正在快速往另一個方向發展：

```txt
Autonomous Coding Agent
```

也就是：

- AI 自己掃描專案
- 自己分析 architecture
- 修改多個檔案
- 執行 terminal command
- 跑測試
- 修 bug
- 建立 feature

這時候，AI 已經不是「聊天機器人」。

它開始變成：

```txt
真正能操作 IDE 的 agent
```

而這類能力，需要一套穩定的溝通機制。

ACP 就是在解決這個問題。([Tech With Davis][2])

---

## ACP 的核心概念

ACP 的全名是：

```txt
Agent Client Protocol
```

它主要定義的是：

```txt
Editor / IDE ↔ AI Agent
```

之間如何通訊。

可以把它理解成：

```txt
VS Code
   ↕
ACP Client
   ↕
AI Agent
```

這裡的：

- VS Code 是編輯器
- ACP Client 是協定橋樑
- AI Agent 是真正執行工作的 AI 系統

ACP 負責讓這些元件之間能夠：

- 傳遞任務
- 同步狀態
- 回報執行結果
- 傳送工具呼叫資訊
- 管理檔案修改
- 傳輸 terminal output

---

## ACP 有點像 AI 時代的 LSP

這其實是 ACP 最重要的理解方式。

很多文章都會把 ACP 類比成：

> 「AI Agent 版的 LSP（Language Server Protocol）」([OpenHands][3])

---

## 什麼是 LSP？

LSP（Language Server Protocol）是 VS Code、Neovim、JetBrains 等 IDE 很重要的底層協定。

它讓：

```txt
Editor ↔ Language Server
```

能夠標準化溝通。

例如：

| 功能 | LSP 提供 |
| --- | --- |
| autocomplete | ✅ |
| go to definition | ✅ |
| hover type info | ✅ |
| rename symbol | ✅ |

因此 VS Code 不需要為每個語言重新實作完整支援。

---

## ACP 與 LSP 的差異

ACP 的概念其實很像，但對象不同。

LSP 是：

```txt
Editor ↔ Programming Language Service
```

ACP 則是：

```txt
Editor ↔ AI Coding Agent
```

因此 ACP 處理的事情會更複雜。

例如：

| 能力 | LSP | ACP |
| --- | --- | --- |
| autocomplete | ✅ | ❌ |
| 程式語法分析 | ✅ | ❌ |
| 多檔案修改 | ❌ | ✅ |
| terminal 操作 | ❌ | ✅ |
| 執行 workflow | ❌ | ✅ |
| AI reasoning | ❌ | ✅ |

ACP 的重點已經不是「語法服務」。

而是：

> 「如何讓 AI 真正操作開發環境」

---

## ACP 能做什麼？

假設你在 VS Code 中輸入：

```txt
幫我把 auth middleware 改成 JWT
```

傳統 AI chatbot 可能只會：

- 給你範例 code
- 解釋 JWT 概念

但 ACP-based agent 可能真的會：

```txt
1. 掃描專案
2. 找到 auth middleware
3. 分析 routes
4. 修改 middleware
5. 更新 API
6. 修改 env
7. 執行測試
8. 回報結果
```

這就是 ACP 與一般 AI chat 最大的差異。

它讓 AI 開始具有：

- filesystem access
- terminal control
- task execution
- state synchronization
- tool orchestration

等能力。

---

## ACP 的運作方式

目前 ACP 大多採用：

```txt
JSON-RPC
```

來進行通訊。([Agent Client Protocol Official Docs][4])

這代表 editor 與 AI agent 之間，會透過標準 JSON message 溝通。

例如：

```json
{
  "method": "task/create",
  "params": {
    "prompt": "Refactor auth middleware"
  }
}
```

AI agent 收到後：

- 開始執行任務
- 回傳狀態
- 回報 step
- 傳送修改結果

---

## ACP 中的重要概念

根據 ACP 官方文件與相關 SDK 文件，ACP 中常見幾個核心概念包括：([Tech With Davis][2])

| 概念 | 說明 |
| --- | --- |
| Client | VS Code、IDE、Editor |
| Agent | AI coding agent |
| Task | AI 要完成的任務 |
| Step | 任務中的單一步驟 |
| Artifact | AI 產生的檔案或結果 |
| Transport | 通訊方式，例如 stdio、HTTP、WebSocket |

---

## ACP 與 MCP 差在哪？

這是目前最容易混淆的地方。

---

## MCP（Model Context Protocol）

MCP 是由 [Anthropic](https://www.anthropic.com) 提出的協定。

它的核心是：

```txt
LLM ↔ 外部工具 / 資料來源
```

例如：

- GitHub
- Notion
- Slack
- Database
- Local files

MCP 讓 AI 能安全呼叫外部工具。([Virtua.Cloud][5])

---

## ACP（Agent Client Protocol）

ACP 更偏向：

```txt
Editor ↔ AI Agent
```

也就是 IDE integration。

例如：

- VS Code extension
- AI sidebar
- terminal agent
- coding workflow

---

## 一張圖理解 MCP 與 ACP

```txt
          MCP
LLM ↔ External Tools

          ACP
Editor ↔ AI Agent
```

很多 AI coding 工具，其實會同時使用：

- ACP
- MCP

ACP 負責：

```txt
AI 怎麼跟 IDE 溝通
```

MCP 負責：

```txt
AI 怎麼跟工具溝通
```

兩者其實是互補的。([Visual Studio Marketplace][6])

---

## 為什麼 ACP 最近突然變重要？

因為 AI coding 正在從：

```txt
Chat assistant
```

進化成：

```txt
Agentic software engineering
```

以前：

```txt
Copilot → 幫你補 code
```

現在：

```txt
Agent → 幫你完成整個 feature
```

這兩者差異非常大。

當 AI 開始：

- 修改專案
- 執行 shell command
- 控制 workflow
- 管理 state
- 與多工具互動

就需要一個標準協定。

否則每個 AI IDE 都會：

```txt
自己實作一套 integration
```

這會導致：

- 生態 fragmented
- 工具不相容
- agent 無法重用

ACP 的目標，就是像當年的 LSP 一樣：

> 建立 AI Agent 的通用標準。([Marc Nuri][7])

---

## 哪些工具正在使用 ACP？

目前 ACP 生態正在快速成長。

你可能會看到：

- [Cursor](https://www.cursor.com)
- [Continue.dev](https://continue.dev)
- [Cline](https://cline.bot)
- [Claude Code](https://www.anthropic.com/claude-code)
- [OpenAI Codex CLI](https://openai.com/index/introducing-codex/)

此外，VS Code Marketplace 上也已經出現 ACP client extension：([ACP Client][8])

例如：

- ACP Client
- VSCode ACP

這些 extension 可以讓：

```txt
VS Code ↔ ACP-compatible Agent
```

直接連接。

---

## ACP 的未來可能會變成什麼？

目前很多人認為：

ACP 很可能會變成 AI IDE 的基礎協定。

原因是：

AI agent 正在變成：

```txt
可替換（replaceable）
```

未來可能會出現：

```txt
任何 editor
   ↕
任何 ACP agent
```

就像現在：

```txt
任何 editor
   ↕
任何 LSP language server
```

一樣。

這種「解耦（decoupling）」會讓 AI tooling 生態更開放。([Marc Nuri][7])

---

## 結論

ACP（Agent Client Protocol）是一種：

> 「讓 AI Agent 能真正操作 IDE 與開發環境的標準化溝通協定」

它的定位有點像：

```txt
AI Agent 版的 LSP
```

但它處理的不只是 autocomplete。

而是：

- task execution
- terminal control
- filesystem operations
- workflow orchestration
- AI-driven coding

隨著 AI coding 從 chatbot 演進成 autonomous coding agent，ACP 很可能會成為未來 AI 開發工具的重要基礎設施。

---

## 參考資料

1. [Agent Client Protocol GitHub Repository](https://github.com/agentclientprotocol/agent-client-protocol)
2. [Tech With Davis - The Ultimate Guide for AI Agent Developers](https://techwithdavis.com/agent-client-protocol/)
3. [OpenHands - Use AI Agents in Your Favorite Editor through ACP](https://openhands.dev/blog/20251209-use-openhands-in-your-ide-with-acp)
4. [Agent Client Protocol Official Docs](https://agentclientprotocol.com/get-started/introduction)
5. [Virtua.Cloud - AI Agent Protocols Explained: MCP, A2A, and ANP](https://www.virtua.cloud/learn/en/concepts/ai-agent-protocols-explained)
6. [ACP — Agent Client Protocol（VS Code Extension + Web UI）](https://marketplace.visualstudio.com/items?itemName=strato-space.acp-plugin)
7. [Marc Nuri - Agent Client Protocol（ACP）Introduction](https://blog.marcnuri.com/agent-client-protocol-acp-introduction)
8. [ACP Client - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=formulahendry.acp-client)

[1]: https://github.com/agentclientprotocol/agent-client-protocol
[2]: https://techwithdavis.com/agent-client-protocol/
[3]: https://openhands.dev/blog/20251209-use-openhands-in-your-ide-with-acp
[4]: https://agentclientprotocol.com/get-started/introduction
[5]: https://www.virtua.cloud/learn/en/concepts/ai-agent-protocols-explained
[6]: https://marketplace.visualstudio.com/items?itemName=strato-space.acp-plugin
[7]: https://blog.marcnuri.com/agent-client-protocol-acp-introduction
[8]: https://marketplace.visualstudio.com/items?itemName=formulahendry.acp-client
