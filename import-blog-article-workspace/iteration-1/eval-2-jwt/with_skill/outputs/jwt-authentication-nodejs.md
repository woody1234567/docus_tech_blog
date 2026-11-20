---
title: Node.js 中的 JWT 身份驗證實作指南
description: 學習如何使用 JSON Web Token (JWT) 為 Node.js 應用程式建立安全的身份驗證系統，並探討其與 Session 的差異。
category: web_dev
date: 2026-04-11
tags: [nodejs, jwt, authentication, security, web_dev]
---

## 為什麼選用 JWT 而非 Session？

在傳統的 Web 應用中，我們通常使用 Session 來管理用戶狀態。然而，在現代的分布式架構或移動端開發中，JWT 提供了更好的擴展性。

::u-alert{type="info"}
JWT 是無狀態的（Stateless），伺服器不需要存儲 Session 數據，這使得負載均衡變得更加簡單。
::

## 實作步驟

### 1. 安裝套件
首先，你需要安裝 `jsonwebtoken`：

```bash
pnpm add jsonwebtoken
```

### 2. 生成 Token
當用戶登錄成功後，生成一個 Token：

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 123 }, 'your-secret-key', { expiresIn: '1h' });
console.log(token);
```

### 3. 驗證 Token
在需要受保護的路由中進行驗證：

```javascript
const decoded = jwt.verify(token, 'your-secret-key');
console.log(decoded.userId);
```

## 總結

JWT 是現代 Web 開發中的標準身份驗證方式，特別適用於 RESTful API 與微服務架構。
