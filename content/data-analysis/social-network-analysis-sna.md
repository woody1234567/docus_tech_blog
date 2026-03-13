---
title: Social Network Analysis（SNA）深入解析
description: 介紹社會網路分析（Social Network Analysis, SNA）的基本概念、常見指標與應用場景，理解如何透過網路結構分析人際關係、資訊傳播與交易網路。
tags: [social network analysis, graph, data science, network analysis]
category: data-analysis
date: 2026-03-07
---

## 什麼是 Social Network Analysis？

在許多真實世界的系統中，資料往往不是孤立存在的，而是透過各種關係彼此連結。例如社群媒體中的朋友關係、金融交易中的資金流動、學術論文的引用關係，甚至是網站之間的連結。**Social Network Analysis（SNA，社會網路分析）**正是一種用來研究「關係結構」的分析方法。

與傳統資料分析不同，SNA 的重點不只是在個體本身的屬性，而是關注**個體之間的連結（relationships）**以及整體網路結構如何影響系統的行為。透過分析這些關係，我們可以理解資訊如何傳播、哪些節點具有影響力，以及整個網路是否存在群體結構。

因此，SNA 在許多領域都有重要應用，例如社群媒體分析、金融詐欺偵測、推薦系統、知識傳播研究，以及疫情傳播模型等。它通常建立在 **Graph Theory（圖論）** 的基礎上，將系統中的實體與關係轉換成可以計算與分析的網路結構 [1]。

---

## SNA 的基本結構：Nodes 與 Edges

在社會網路分析中，任何網路都可以用兩個基本元素來描述：

* **Node（節點）**
* **Edge（邊）**

節點代表網路中的個體，例如人、帳戶、公司或網站；而邊則代表節點之間的關係，例如朋友關係、交易行為或訊息傳遞。

舉例來說，在一個金融交易網路中：

* 每個銀行帳戶可以視為一個 **node**
* 每一筆資金轉帳則是一條 **edge**

用圖形方式表示時，網路通常會呈現如下結構：

```
A ---- B
|      |
|      |
C ---- D
```

在這個例子中，A、B、C、D 是節點，而連接它們的線條就是邊。透過這種方式，我們可以將複雜的關係資料轉換成圖形結構，進一步利用數學與演算法來分析整體網路特性 [2]。

---

## Directed Network 與 Undirected Network

根據關係是否具有方向性，網路通常可以分為兩種類型：

**Undirected Network（無向網路）**

在無向網路中，關係是雙向的。例如 Facebook 的好友關係，如果 A 是 B 的朋友，通常 B 也是 A 的朋友，因此這種連結沒有方向。

```
A ---- B
```

**Directed Network（有向網路）**

在有向網路中，關係具有方向。例如 Twitter 的追蹤關係，A 可以追蹤 B，但 B 不一定追蹤 A，因此邊會具有方向。

```
A ---> B
```

在金融交易或資訊傳播的研究中，通常會使用 **directed network**，因為資金流動與訊息傳播本身就具有方向性 [3]。

---

## 常見的網路指標（Network Metrics）

當資料被轉換為網路結構後，我們就可以利用各種指標來描述節點在網路中的角色與重要性。以下是幾個最常見的網路指標。

### Degree Centrality

**Degree Centrality（度中心性）**是最直觀的網路指標之一，它代表一個節點與多少其他節點相連。

在社群網路中，degree 可以理解為一個人擁有多少朋友；在交易網路中，則可能代表一個帳戶與多少帳戶發生過交易。

如果在有向網路中，degree 會進一步分成：

* **In-degree**：收到多少連結
* **Out-degree**：發出多少連結

例如在 Twitter 中：

* In-degree = 有多少人追蹤你
* Out-degree = 你追蹤了多少人

Degree Centrality 常用來找出網路中最活躍或最具影響力的節點 [1]。

---

### Betweenness Centrality

**Betweenness Centrality（中介中心性）**用來衡量一個節點在網路中扮演「橋樑」的程度。

如果許多節點之間的最短路徑都需要經過某一個節點，代表這個節點在資訊傳播或資源流動上具有關鍵地位。這種節點通常可以控制資訊的流動，因此在社群網路或金融網路中具有重要意義。

例如在企業組織中，一些跨部門的協調者往往具有較高的 betweenness centrality，因為許多資訊需要透過他們在不同團隊之間流動 [2]。

---

### Closeness Centrality

**Closeness Centrality（接近中心性）**衡量一個節點與網路中所有其他節點的距離。

如果一個節點到其他節點的平均距離較短，代表它可以更快接觸到整個網路中的資訊。這種節點通常在資訊傳播過程中具有優勢，例如在病毒傳播或消息擴散研究中，closeness centrality 經常被用來找出最可能快速擴散訊息的節點 [3]。

---

## 社群結構（Community Detection）

在大型網路中，節點通常會形成不同的群體結構，這些群體內部連結密集，但與其他群體之間的連結較少。這種現象稱為 **community structure**。

透過 **Community Detection（社群偵測）** 演算法，我們可以將整個網路分割成多個子群體。例如：

* 社群媒體中的興趣社群
* 金融交易中的洗錢集團
* 學術論文中的研究領域群集

常見的社群偵測方法包括：

* Louvain Algorithm
* Girvan–Newman Algorithm
* Label Propagation

這些方法通常會透過最大化 **modularity（模組度）** 來找出最合理的社群分割方式 [2]。

---

## SNA 的實際應用

社會網路分析在許多領域都有廣泛應用。

在 **社群媒體分析** 中，SNA 可以用來找出具有影響力的用戶，分析資訊如何在網路中傳播，並了解社群結構。

在 **金融詐欺偵測** 中，銀行常會建立交易網路，透過分析帳戶之間的資金流動來找出可疑的交易模式。例如某些帳戶可能扮演資金中轉的角色，具有異常高的 betweenness centrality，這可能是洗錢活動的指標。

在 **推薦系統** 中，SNA 也可以用來分析使用者之間的關係，透過網路結構來預測可能感興趣的商品或內容。

此外，在 **疫情傳播研究** 中，SNA 可以模擬病毒在社會網路中的傳播方式，並找出最有效的防疫策略，例如優先接種疫苗的群體 [3]。

---

## 結論

Social Network Analysis 是一種專門研究「關係結構」的資料分析方法。透過將資料轉換為節點與邊所構成的網路，我們可以分析節點的重要性、資訊傳播路徑以及群體結構。這些分析不僅能幫助我們理解複雜系統的運作方式，也在社群媒體、金融風控、推薦系統與公共衛生等領域中發揮重要作用。

隨著資料規模持續成長，以及圖資料庫與分散式計算技術的發展，Social Network Analysis 也逐漸成為資料科學與人工智慧領域中的重要研究方向。

---

## 參考資料

1. Wasserman, S., & Faust, K. (1994). *Social Network Analysis: Methods and Applications*. Cambridge University Press.
2. Newman, M. (2010). *Networks: An Introduction*. Oxford University Press.
3. Easley, D., & Kleinberg, J. (2010). *Networks, Crowds, and Markets: Reasoning About a Highly Connected World*. Cambridge University Press.
