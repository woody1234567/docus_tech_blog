---
title: Nginx 入門教學：從反向代理到與 Kubernetes 的架構比較
description: 從零開始理解 Nginx 的核心功能，包含反向代理、負載平衡與靜態資源處理，並延伸比較 Kubernetes 在現代架構中的角色差異。
tags: [nginx, web server, reverse proxy, load balancing, kubernetes, devops]
category: web_dev
date: 2026-04-11
---

# Nginx 入門教學：從反向代理到與 Kubernetes 的架構比較

## 為什麼幾乎所有後端工程師都會用 Nginx？

當你開始接觸 Web 開發或系統架構時，很快就會遇到 Nginx 這個名字。無論是部署網站、建 API，甚至是進入雲端與容器化世界，Nginx 幾乎都是最常見的基礎元件之一。

但很多新手一開始會有一個疑問：
「我已經有後端服務了，為什麼還需要 Nginx？」

關鍵在於：**後端程式負責業務邏輯，而 Nginx 負責流量與請求的“入口管理”**。它讓整個系統變得更穩定、更高效，也更容易擴展。

---

## Nginx 是什麼？（直覺理解）

Nginx 本質上是一個「高效能 Web Server + 反向代理伺服器」。

你可以把它想像成一個站在門口的接待員：

```text
Client → Nginx → Backend Server
```

使用者的請求不會直接打到你的應用程式，而是先經過 Nginx，再由它決定要怎麼處理這個請求。

這個設計帶來三個關鍵好處：

1. **隱藏後端服務**（安全性提升）
2. **分散流量**（提升效能）
3. **統一入口**（方便管理）

---

## Nginx 的三大核心功能

### 一、反向代理（Reverse Proxy）

反向代理是 Nginx 最核心的功能。

當使用者發送請求時，Nginx 會幫你把請求「轉發」到真正的後端服務，例如 FastAPI 或 Node.js。

```text
Client → Nginx → API Server
```

這樣做的好處是：

* 使用者永遠只看到 Nginx（隱藏後端）
* 可以同時接多個後端服務（微服務架構）
* 可以統一處理 HTTPS、Header、驗證等邏輯

這也是為什麼你在雲端部署時，幾乎一定會看到 Nginx。

---

### 二、負載平衡（Load Balancing）

當你的服務流量變大，一台伺服器撐不住時，就需要「分流」。

Nginx 可以幫你把流量平均分配到多個後端：

```text
        → Server A
Client → Nginx → Server B
        → Server C
```

常見的分配策略包括：

* **Round Robin**（輪流分配）
* **Least Connections**（最少連線優先）
* **IP Hash**（同一使用者導到同一台）

這讓你的系統可以透過「水平擴展（Scale out）」來提升效能，而不是只靠升級單一機器。

---

### 三、靜態資源伺服（Static File Serving）

Nginx 在處理靜態資源（HTML / CSS / JS / 圖片）時非常高效。

```text
Client → Nginx → 回傳靜態檔案
```

這代表：

* 不需要經過後端程式
* 回應速度更快
* 減少後端負擔

在像 Nuxt.js 或 Next.js 這類前端框架中，Nginx 常被用來 serving build 後的靜態頁面。

---

## Nginx 背後的關鍵：事件驅動（Event-driven）

Nginx 高效的原因，在於它採用「事件驅動 + 非同步（async）」架構。

這與傳統的「一個 request 對應一個 thread」不同：

* **傳統模型**：Thread-based（容易爆記憶體）
* **Nginx**：Event loop（可同時處理大量連線）

這個設計也和 Uvicorn 或 Node.js 類似，都是現代高併發系統的重要基礎。

---

## 那 Kubernetes 在做什麼？（很多人會混淆）

當你學到 Kubernetes（K8s）時，很容易產生一個誤解：

「既然有 K8s，我還需要 Nginx 嗎？」

> [!IMPORTANT]
> 答案是：**需要，而且兩者完全不是同一層的東西。**

---

## Nginx vs Kubernetes：本質差異

我們用一個簡單的分層來看：

```text
[使用者流量層] → Nginx
[應用部署層] → Kubernetes
```

---

### 一、角色定位不同

| 項目 | Nginx | Kubernetes |
| :--- | :--- | :--- |
| **角色** | 流量處理工具 | 容器管理平台 |
| **功能** | 反向代理、負載平衡 | 部署、擴展、調度 |
| **關注點** | Request | Container / Pod |

* **Nginx** 在處理「請求怎麼進來」
* **K8s** 在處理「服務怎麼運行」

---

### 二、解決問題的層級不同

Nginx 解決的是：
* 請求怎麼轉發？
* 流量怎麼分配？
* 如何處理 HTTPS？

Kubernetes 解決的是：
* 容器壞了怎麼重啟？
* 流量變大怎麼自動擴容？
* 服務怎麼部署到多台機器？

---

### 三、實際架構會怎麼搭？

在真實系統中，兩者通常是「一起用」的：

```text
Client
  ↓
Nginx (或 Ingress Controller)
  ↓
Kubernetes Cluster
  ↓
Pods (你的應用程式)
```

在 K8s 裡，甚至會有像 NGINX Ingress Controller 這樣的元件，直接把 Nginx 當成流量入口。

---

## 一個直覺比喻幫你記住

你可以這樣理解：

* **Nginx = 櫃檯 / 門口接待**
* **Kubernetes = 整棟大樓的管理系統**

Nginx 負責接客人、分流；K8s 負責安排房間、維修設備、擴建樓層。兩者缺一不可，但完全不衝突。

---

## 為什麼學會 Nginx 對你很重要？

即使你主要用的是雲端（AWS / GCP）或平台（Vercel / Zeabur），背後仍然大量使用 Nginx 或類似技術。

理解 Nginx 會幫助你：
* 更清楚 request flow（面試超常問）
* 理解 reverse proxy / load balancing 原理
* 看懂 K8s Ingress / API Gateway 架構
* 排查部署問題（例如 502 / timeout）

---

## 結論

Nginx 是現代 Web 架構中最重要的「流量入口工具」，負責處理反向代理、負載平衡與靜態資源服務。而 Kubernetes 則是管理應用部署與運行的核心平台。

兩者的關係不是取代，而是互補：
**Nginx 管入口，K8s 管內部。**

當你把這個分層理解清楚之後，整個 Web 架構會變得非常清晰，也更容易進入雲原生與微服務世界。
