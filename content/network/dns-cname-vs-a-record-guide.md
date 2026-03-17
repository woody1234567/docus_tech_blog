---
title: DNS 設定入門：CNAME vs A Record 完整解析
description: 從基礎概念到實務應用，深入理解 DNS 中 A Record 與 CNAME 的差異與使用情境。
tags: [dns, cname, a-record, networking, web_dev]
category: network
date: 2026-03-17
---

## 為什麼你一定會碰到 DNS？

當你開始架設網站（例如使用 Vercel、Zeabur 或自架伺服器），第一個一定會遇到的問題就是：「我的網域要怎麼指到我的服務？」這個問題的核心，其實就是 DNS（Domain Name System）。

DNS 的角色可以理解為網路世界的「翻譯系統」。使用者輸入的是人類可讀的網域名稱，例如 `example.com`，但實際上網路通訊依賴的是 IP 位址，例如 `192.168.1.1`。DNS 的工作，就是在這兩者之間建立對應關係，讓瀏覽器能夠找到正確的伺服器。

---

## DNS 的基本運作流程

當使用者在瀏覽器輸入一個網址時，背後其實發生了一連串解析流程。首先，瀏覽器會向 DNS Server 查詢該網域對應的 IP 位址。DNS Server 回傳結果後，瀏覽器才會發起真正的 HTTP / HTTPS 請求。

這個過程看似簡單，但其實是整個網際網路能運作的基礎。若 DNS 設定錯誤，即使你的網站已經部署完成，使用者仍然無法正確連線。

---

## A Record 是什麼？

A Record（Address Record）是 DNS 中最基本、也是最直接的一種記錄類型。它的功能是將一個網域名稱直接對應到一個 IP 位址。

例如：

```txt
example.com → 192.168.1.1
```

這代表當使用者訪問 `example.com` 時，DNS 會直接回傳該 IP 位址，瀏覽器便會與這台伺服器建立連線。

A Record 的特性在於「直接性」，它沒有中間轉換層，因此解析速度通常較快，且結構單純。但相對地，當伺服器 IP 發生變動時，就必須手動更新 DNS 設定，維護成本較高。

---

## CNAME 是什麼？

CNAME（Canonical Name Record）則提供了一種更具彈性的做法。它並不是直接對應 IP，而是將一個網域指向另一個網域名稱。

例如：

```txt
www.example.com → myapp.vercel.app
```

在這個情境中，當使用者訪問 `www.example.com` 時，DNS 會告訴瀏覽器「請改查詢 `myapp.vercel.app`」，接著再解析該網域對應的 IP。

也就是說，CNAME 本質上是一種「別名機制」，它允許你把多個網域統一指向同一個服務來源，而不需要關心底層 IP 的變化。

---

## A Record vs CNAME 的核心差異

A Record 與 CNAME 的最大差異，在於「是否直接指向 IP」。

A Record 是一條直接連線，從網域名稱到 IP 位址只需要一次解析，因此在結構上最簡單，也最穩定。相對地，CNAME 則需要多一次解析過程，因為它會先指向另一個網域，再由該網域解析出 IP。

此外，CNAME 提供更高的彈性，特別適合用於現代雲端服務。像是 Vercel、Netlify 或 Zeabur 這類平台，其底層 IP 可能會隨著負載或架構調整而變動，使用 CNAME 可以避免頻繁修改 DNS 設定。

---

## 為什麼 root domain 通常不能用 CNAME？

在實務上，你會發現 `example.com`（裸網域）通常無法設定為 CNAME。這是因為 DNS 規範要求 root domain 必須同時存在 SOA（Start of Authority）與 NS（Name Server）記錄，而 CNAME 會覆蓋整個節點，導致這些必要記錄無法共存。

因此，一般會採用以下策略：

```txt
example.com → A Record
www.example.com → CNAME
```

這種配置同時兼顧了 DNS 規範與彈性需求。

---

## 實務應用場景解析

在現代 Web 開發中，A Record 與 CNAME 往往會搭配使用。

當你使用雲端平台（例如 Vercel）部署前端網站時，通常會將子網域（如 `www` 或 `blog`）設定為 CNAME，指向平台提供的網域，例如 `cname.vercel-dns.com`。這樣做的好處是，即使平台底層 IP 發生變化，你的 DNS 設定仍然不需要修改。

另一方面，當你使用 VPS 或 Zeabur 部署後端服務，並且擁有固定 IP 時，就會使用 A Record 將主網域直接指向該 IP。

這種「root 用 A、子網域用 CNAME」的混合策略，是目前最常見且穩定的做法。

---

## 常見錯誤與注意事項

在設定 DNS 時，有幾個常見錯誤需要特別注意。

首先，CNAME 只能指向「網域名稱」，不能直接指向 IP。如果將 CNAME 指向 IP，DNS 將無法正確解析。

其次，同一個網域名稱不能同時存在 A Record 與 CNAME，這會造成衝突並導致解析失敗。

最後，DNS 設定變更後不會立即生效，通常需要數分鐘到數小時不等，這個過程稱為 propagation。在測試設定時，應耐心等待或使用工具確認是否已更新。

---

## 用一個直覺方式理解

如果把 DNS 想像成查地址的過程：

- A Record 就像是直接告訴你「這個地方的實際地址」
- CNAME 則像是告訴你「去問另一個人，他會給你地址」

這個差異，正好反映了兩者在設計上的核心理念：一個追求直接性，一個追求彈性。

---

## 結論

A Record 與 CNAME 是 DNS 中最核心的兩種記錄類型。前者提供直接且穩定的 IP 對應方式，後者則提供靈活且可維護的網域映射機制。

在現代 Web 架構中，理解這兩者的差異與適用場景，是正確設定網域與部署服務的關鍵。只要掌握「A Record 指向 IP、CNAME 指向網域」這個核心原則，就能避免大部分常見錯誤，並建立穩定可靠的網站架構。

---

## 參考資料

1. <https://www.cloudflare.com/learning/dns/dns-records/>
2. <https://vercel.com/docs/projects/domains>
3. <https://www.rfc-editor.org/rfc/rfc1034>
4. <https://www.rfc-editor.org/rfc/rfc1035>
