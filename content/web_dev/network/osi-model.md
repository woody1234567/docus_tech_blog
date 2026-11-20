---
title: OSI 模型（Open Systems Interconnection Model）完整解析
description: 從概念到實務，深入理解 OSI 七層模型如何運作，並掌握網路系統設計的核心思維。
tags: [network, osi, tcp/ip, backend, system_design]
category: web_dev
date: 2026-04-11
---

# OSI 模型（Open Systems Interconnection Model）完整解析

## 為什麼需要 OSI 模型？

當我們在瀏覽網頁、發送 API request，或是使用 WebSocket 建立即時連線時，背後其實牽涉到一整套複雜的網路通訊機制。但如果沒有一個清楚的分層架構，整個系統將會非常難以設計與維護。

OSI 模型（Open Systems Interconnection Model）就是為了解決這個問題而誕生的。它的核心思想非常簡單：**把複雜的網路通訊流程拆成多個層，每一層只負責一件事情**。這種分層設計讓不同廠商、不同系統之間能夠彼此溝通，同時也讓工程師可以更容易定位問題。

你可以把它想像成一個「分工明確的團隊」，每個人只專注做好自己的事情，但彼此之間有明確的溝通規則。

---

## OSI 七層模型總覽

OSI 模型將網路通訊拆分為七層，每一層都有明確的責任與功能：

```text
7. Application Layer    應用層
6. Presentation Layer   表示層
5. Session Layer        會話層
4. Transport Layer      傳輸層
3. Network Layer        網路層
2. Data Link Layer      資料連結層
1. Physical Layer       實體層
```

> [!NOTE]
> 這七層從上到下，代表資料從「應用程式」一路傳遞到「實際的電訊號」的過程。

---

## 一、Application Layer（應用層）

應用層是最接近使用者的層，所有你平常接觸到的網路服務都在這裡發生。

例如：
- **HTTP**（瀏覽器請求）
- **HTTPS**（加密網頁）
- **FTP**（檔案傳輸）
- **SMTP**（寄信）

當你在瀏覽器輸入一個網址時，實際上就是應用層在發送 request。在現代 Web 開發中，你寫的 FastAPI、Node.js server，其實就是運作在這一層。

---

## 二、Presentation Layer（表示層）

表示層負責處理資料的「格式與轉換」，確保資料在不同系統之間可以被正確理解。

它主要做三件事：
- **資料格式轉換**（例如 JSON ↔ XML）
- **加密與解密**（例如 SSL/TLS）
- **壓縮與解壓縮**

例如 HTTPS 的加密，其實就是在這一層處理的。

---

## 三、Session Layer（會話層）

會話層負責管理「連線的建立、維持與關閉」。

它的工作包括：
- 建立 session（例如登入狀態）
- 控制連線中斷與恢復
- 管理多個 request 的關係

在現代 Web 中，雖然這一層的概念比較不明顯，但像是 cookie、session 機制，其實就是這一層的延伸。

---

## 四、Transport Layer（傳輸層）

傳輸層是整個網路通訊中非常關鍵的一層，它負責「資料是否可靠送達」。

最常見的兩種協議：
- **TCP**（可靠傳輸）
- **UDP**（快速但不保證）

### TCP 的特性
- 保證資料順序
- 會重傳遺失封公
- 有流量控制

### UDP 的特性
- 不保證送達
- 延遲低
- 適合即時應用（如遊戲、影音串流）

當你在設計 API 或 WebSocket 時，其實就是在思考「要不要可靠傳輸」的問題。

---

## 五、Network Layer（網路層）

網路層負責「資料如何從 A 走到 B」，也就是所謂的 routing（路由）。

核心概念包含：
- **IP Address**（IP 位址）
- **Routing**（路徑選擇）

當你發送一個 request 到另一個國家的 server，網路層會決定封包要經過哪些路由器，最終抵達目的地。

---

## 六、Data Link Layer（資料連結層）

資料連結層負責「同一個網路內的資料傳輸」。

它主要處理：
- **MAC Address**
- **封包錯誤檢測（CRC）**
- **Frame（資料幀）**

簡單來說，它確保資料能在「同一個區域網路（LAN）」內正確傳遞。

---

## 七、Physical Layer（實體層）

實體層是最底層，負責將資料轉換成實際的訊號。

例如：
- 電訊號（網路線）
- 光訊號（光纖）
- 無線訊號（Wi-Fi）

這一層不關心資料內容，只關心「0 和 1 如何被傳送」。

---

## 從 Request 的角度理解 OSI

我們可以用一個實際例子來理解整個流程。當你發送一個 HTTP request 時：

1. **Application Layer**：產生 HTTP request  
2. **Presentation Layer**：進行加密（HTTPS）  
3. **Session Layer**：建立連線  
4. **Transport Layer**：切割資料（TCP segment）  
5. **Network Layer**：加上 IP 位址  
6. **Data Link Layer**：轉成 frame（加上 MAC）  
7. **Physical Layer**：轉成訊號送出  

接收端則會反向處理，逐層解開資料。這個過程稱為 **Encapsulation（封裝）與 Decapsulation（解封裝）**。

---

## OSI vs TCP/IP 模型

在實務上，我們更常使用的是 TCP/IP 模型，它是 OSI 的簡化版本：

| OSI 模型 | TCP/IP 模型 |
| :--- | :--- |
| Application | Application |
| Presentation | Application |
| Session | Application |
| Transport | Transport |
| Network | Internet |
| Data Link | Network Access |
| Physical | Network Access |

TCP/IP 更貼近實際網路實作，而 OSI 更偏向「教學與設計思維」。

---

## 為什麼工程師一定要懂 OSI？

理解 OSI 模型的最大價值，不是背七層，而是建立系統化的故障排除與設計思維。

### 1. 問題定位能力
當 API timeout，你可以思考：
- 是 DNS 問題？（Network）
- 還是 TCP 連線失敗？（Transport）
- 還是應用層 error？（Application）

### 2. 系統設計能力
在設計架構時，你會知道：
- Nginx 在 L7（Application）
- Load balancer 可以在 L4 或 L7
- TLS termination 發生在哪一層

### 3. 抽象能力
OSI 是一種「抽象分層思維」，這種能力在 Microservices、Clean Architecture、Kubernetes 架構設計中都非常重要。

---

## 結論

OSI 模型本質上是一個「將複雜系統拆解」的思維工具。透過七層分工，它讓網路通訊變得可理解、可維護，也讓不同系統之間能夠協作。

對工程師來說，真正重要的不是死記每一層，而是理解每一層在「解決什麼問題」。一旦掌握這個觀念，你在學習 Nginx、Kubernetes、甚至是分散式系統時，都會更容易建立清晰的架構理解。

---

## 參考資料

1. [OSI model - Wikipedia](https://en.wikipedia.org/wiki/OSI_model)
2. [What is the OSI Model? - Cloudflare](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
3. [OSI Model - IBM](https://www.ibm.com/topics/osi-model)