---
title: 大型影片串流平台系統設計解析：從 YouTube、Netflix 到全球級架構設計
description: 深入解析大型影片串流平台的系統設計，從 CAP 定理、Object Storage、CDN、Message Queue 到資料庫分片，理解 YouTube 與 Netflix 如何支撐全球數十億播放請求。
category: system_design
date: 2026-05-14
tags: [system-design, youtube, netflix, cdn, distributed-system, backend, architecture]
---

## 前言：為什麼影片串流平台是系統設計中的經典題目？

當你打開 YouTube、Netflix 或 Spotify 時，大部分人看到的只是「一個可以播放影音的平台」。

但對後端工程師來說，這其實是一個極度複雜的大型分散式系統（Distributed System）。

因為這些平台背後必須同時解決：

* 全球數十億次請求
* 超大型檔案上傳
* 高頻寬影音傳輸
* 多地區低延遲存取
* 海量資料儲存
* 熱門流量暴增（Hotspot Traffic）
* 全球同步與高可用性的取捨

而這些問題，幾乎涵蓋了現代大型系統設計中最核心的議題。

本篇文章將根據 podcast 逐字稿內容，並結合 Netflix、YouTube、Amazon AWS 等公開技術資料，帶你一步一步拆解大型影片串流平台背後的系統架構。

---

## 系統設計的第一步：先理解「規模」

大型系統設計中，最重要的一件事就是：

> 不要先想技術，而是先想規模（Scale）。

假設今天有一個影片平台：

* 每日活躍使用者（DAU）：10 億
* 每人每天平均觀看 5 部影片
* 每天影片播放次數：50 億次
* 假設其中 1% 使用者會上傳影片

那代表：

* 每天會有約 5000 萬部影片上傳

如果平均每部影片是數 GB，甚至高達 256GB，那每天需要處理的資料量會極度驚人。

這也是為什麼大型系統設計中，很多「小型專案可行的架構」，到了全球規模時會直接崩潰。

---

## CAP 定理：大型分散式系統的核心取捨

當系統規模變大後，第一個一定會遇到的問題就是：

> 我們到底要優先選擇「一致性」還是「可用性」？

這就是著名的 CAP Theorem。

CAP 理論指出：

在分散式系統中，當網路發生 Partition（節點斷線）時，你無法同時保證：

* Consistency（一致性）
* Availability（可用性）

大型影片平台通常會選擇：

* 高可用性（Availability）
* 接受最終一致性（Eventual Consistency）

原因很簡單：

如果有人在德國上傳影片，而系統必須等全球所有資料中心同步完成後，才允許其他人觀看，那整個平台會卡死。

因此大型平台會接受：

* 訂閱頁面可能延遲幾分鐘更新
* 但影片一定要能播放

這種設計就是典型的：

> 用資料同步延遲，換取系統永遠可用。

---

## 為什麼不能把影片直接存在資料庫？

很多初學者一開始會直覺認為：

```text
影片檔案 → 存進資料庫
```

但這在大型系統中幾乎不可行。

因為影片屬於：

* 超大型二進位檔案（Binary Blob）
* 非結構化資料（Unstructured Data）

而資料庫擅長處理的是：

* 小型
* 結構化
* 可索引的資料

因此大型平台會做一件非常重要的事情：

## Metadata 與影片檔案完全分離

也就是：

### Metadata（詮釋資料）

存進資料庫：

* 影片標題
* 描述
* 作者
* 觀看數
* 留言
* 標籤

### Video File（原始影片）

存進 Object Storage。

常見 Object Storage 包括：

* Amazon Web Services 的 S3
* Cloudflare R2
* Google Cloud Cloud Storage
* Microsoft Azure Blob Storage
* SeaweedFS
* MinIO

這種架構最大的好處是：

* 計算層（Compute）
* 儲存層（Storage）

完全解耦（Decoupled）。

---

## 為什麼大型影片不能經過 API Server？

很多人會設計：

```text
Client → API Server → Storage
```

但大型影片平台幾乎不會這樣做。

原因是：

* API Server 有 request size limit
* 長連線成本極高
* 大量頻寬會把後端打爆
* 網路中斷時會整個重傳

真正的做法是：

## Pre-signed URL（預簽名 URL）

流程如下：

```text
1. Client 請求上傳
2. Backend 產生 Pre-signed URL
3. Client 直接上傳到 Object Storage
```

這代表：

後端根本不碰影片檔案。

這是大型系統設計中非常重要的一個觀念：

> Application Server 應該管理權限與狀態，而不是搬運大型檔案。

---

## Multipart Upload：大型檔案如何避免重傳？

如果影片高達 50GB。

一旦網路中斷：

```text
重新上傳 50GB
```

使用者一定直接離開。

因此大型平台會使用：

## Multipart Upload（分段上傳）

概念是：

```text
50GB → 切成很多小塊
```

例如：

```text
5MB x 10000 個 chunk
```

這樣：

* 可以平行上傳
* 中斷時只需重傳失敗 chunk
* 大幅提高穩定性

這也是 Amazon S3 multipart upload 的核心概念。

---

## 為什麼影片上傳完不能直接播放？

原始影片通常：

* 編碼格式不同
* 解析度不同
* Bitrate 不同

因此需要：

## Transcoding（轉碼）

例如：

```text
原始影片
↓
1080P
720P
480P
240P
```

同時還需要：

* H.264
* H.265
* AV1

等不同編碼格式。

---

## 為什麼轉碼一定要非同步？

如果同步轉碼：

```text
使用者上傳
↓
等待 1 分鐘
↓
影片完成
```

那系統很快就會崩潰。

因此大型平台一定會：

## 使用 Message Queue

常見技術：

* Apache Software Foundation Kafka
* Amazon Web Services SQS
* RabbitMQ

架構：

```text
Upload Service
    ↓
Message Queue
    ↓
Transcoding Workers
```

這種設計叫做：

## 非同步解耦（Async Decoupling）

核心優勢：

* 上傳與轉碼拆開
* 系統不會因尖峰流量崩潰
* Worker 可以水平擴展（Horizontal Scaling）

---

## Little’s Law：如何估算需要多少 Worker？

大型系統設計面試中很常出現：

> 你需要多少台 Worker？

這時候會用：

## Little’s Law

`L = λW`

其中：

* `L`：系統內工作數量
* `λ`：到達速率
* `W`：平均處理時間

例如：

* 每秒 500 部影片上傳
* 每部轉碼需 60 秒

那：

```text
500 × 60 = 30000
```

代表：

系統同時需要約 30000 個 transcoding worker。

這就是大型系統中的容量規劃（Capacity Planning）。

---

## 為什麼影片可以「秒播」？

真正讓 YouTube 與 Netflix 厲害的地方其實是：

> 串流（Streaming）。

而不是下載。

---

## Adaptive Bitrate Streaming（自適應串流）

系統不會直接傳整部影片。

而是：

```text
影片 → 切成很多 2 秒片段
```

播放器會：

* 根據網速
* 動態選擇畫質

例如：

```text
網速快 → 1080P
網速差 → 240P
```

這就是：

## HLS / MPEG-DASH

背後的核心原理。

---

## CDN：為什麼影片不用從美國下載？

如果全世界都從同一個資料中心抓影片。

那頻寬費用會直接爆炸。

因此大型平台一定會使用：

## CDN（Content Delivery Network）

例如：

* Cloudflare
* Akamai Technologies
* Fastly

CDN 的概念：

```text
主資料中心
↓
全球邊緣節點（Edge）
↓
使用者從最近節點取資料
```

因此：

台灣使用者不需要從美國下載影片。

而是直接從台灣 CDN Edge Server 取得。

這也是為什麼影片可以在幾百毫秒內開始播放。

---

## 資料庫為什麼會成為瓶頸？

當使用者成長後：

```text
JOIN
JOIN
JOIN
```

會讓關聯式資料庫壓力極大。

YouTube 早期就曾經遇過：

* MySQL CPU 滿載
* Read Replica 不夠
* 單機無法容納資料

因此後來開始：

## Database Sharding（資料庫分片）

概念：

```text
A-M → DB1
N-Z → DB2
```

但這會讓應用層邏輯變得非常複雜。

---

## Vitess：YouTube 如何擴展 MySQL？

後來 YouTube 開發了 **Vitess**。

Vitess 本質上是：

## Database Proxy Layer

架構：

```text
Application
    ↓
Vitess
    ↓
Sharded MySQL
```

應用程式只需：

```sql
SELECT * FROM videos
```

Vitess 會自動：

* 找到正確分片
* 路由查詢
* 聚合結果

這種：

> 在舊系統前面加抽象層

其實是大型系統設計中非常經典的思維。

---

## 熱分片（Hot Shard）問題

假設：

所有某位明星的影片都存在同一台 DB。

當新 MV 發布：

```text
1000 萬請求 → 同一台 DB
```

那台機器會直接被打爆。

因此大型平台通常會：

## Consistent Hashing（一致性 Hash）

`hash(key) mod N`

目的：

* 平均分散流量
* 避免單點過熱
* 增減機器時降低資料搬移

這是大型分散式系統非常重要的概念。

---

## Compute 與 Storage 必須解耦

當平台累積數 EB（Exabyte）資料後。

你不可能：

```text
Application Server 同時存資料
```

因為：

* 機器壞掉會遺失資料
* Storage 成本極高
* 擴展困難

因此現代架構幾乎都會：

## Stateless Compute + Distributed Storage

也就是：

```text
App Server 無狀態
Storage 獨立存在
```

這也是 Kubernetes 與 Cloud Native 架構的核心思想之一。

---

## 系統設計真正重要的其實是「Trade-off」

很多初學者以為：

> 系統設計是在找「最佳解」。

但實際上：

## 系統設計是在做 Trade-off（取捨）

例如：

| 問題           | 取捨              |
| ------------ | --------------- |
| 強一致性 vs 高可用性 | 選擇 Availability |
| 同步 vs 非同步    | 選擇 Async Queue  |
| SQL vs NoSQL | 結構 vs 擴展性       |
| CDN 成本       | 換低延遲            |
| 多副本          | 換高儲存成本          |

沒有完美架構。

只有：

> 哪種取捨最符合商業需求。

---

## 結論：大型系統其實是一種「徹底解耦」

回頭看整個架構，你會發現：

大型影片平台真正厲害的地方，不是某個單一技術。

而是：

## 徹底的解耦（Decoupling）

包括：

* Compute 與 Storage 解耦
* Upload 與 Processing 解耦
* Metadata 與 Binary Data 解耦
* Client 與 Backend 解耦
* Database 與 Application 解耦

這也是現代大型系統設計的核心精神。

你看到的「秒播影片」。

背後其實是：

* CDN
* Chunk Streaming
* Async Pipeline
* Distributed Storage
* Message Queue
* Database Sharding
* Adaptive Bitrate

這些技術共同組成的一場巨大協作。

而這些架構，也早已不只存在於 YouTube 或 Netflix。

今天的：

* AI 系統
* RAG 平台
* SaaS
* 即時通訊
* 雲端服務

背後其實都在使用非常類似的系統設計思維。

---

## 參考資料

1. AI 懶人報 Podcast 逐字稿 
2. [Netflix Open Connect 官方介紹](https://openconnect.netflix.com/en/)
3. [Netflix Open Connect Overview PDF](https://openconnect.netflix.com/Open-Connect-Overview.pdf) ([Open Connect][1])
4. [AWS S3 Multipart Upload Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html) ([AWS Documentation][2])
5. [AWS Multipart Upload Large Object Blog](https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/) ([Amazon Web Services, Inc.][3])
6. [Vitess Official Documentation](https://vitess.io/docs/) ([Vitess][4])
7. [What is Vitess?](https://vitess.io/docs/24.0/overview/whatisvitess/) ([Vitess][5])
8. [Vitess GitHub Repository](https://github.com/vitessio/vitess) ([GitHub][6])
9. [PlanetScale - Vitess Introduction](https://planetscale.com/vitess) ([PlanetScale][7])
10. [Netflix Tech Blog - Open Connect CDN](https://netflixtechblog.com/content-popularity-for-open-connect-b86d56f613b) ([Netflix Tech Blog][8])
11. [Netflix CDN Architecture Analysis](https://blog.apnic.net/2018/06/20/netflix-content-distribution-through-open-connect/) ([APNIC Blog][9])
12. [Designing Data-Intensive Applications (Book)](https://dataintensive.net/)
13. [System Design Interview by Alex Xu](https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF)

[1]: https://openconnect.netflix.com/Open-Connect-Overview.pdf "Open Connect Overview"
[2]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html "Uploading and copying objects using multipart upload in ..."
[3]: https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/ "Uploading large objects to Amazon S3 using multipart ..."
[4]: https://vitess.io/docs/ "Documentation"
[5]: https://vitess.io/docs/24.0/overview/whatisvitess/ "The Vitess Docs | What Is Vitess"
[6]: https://github.com/vitessio/vitess "Vitess is a database clustering system ..."
[7]: https://planetscale.com/vitess "Vitess"
[8]: https://netflixtechblog.com/content-popularity-for-open-connect-b86d56f613b "Content Popularity for Open Connect"
[9]: https://blog.apnic.net/2018/06/20/netflix-content-distribution-through-open-connect/ "Netflix content distribution through Open Connect"
