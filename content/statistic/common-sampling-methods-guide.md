---
title: 常見抽樣方法（Sampling Methods）教學：Stratified、Quota、Convenience、Systematic、Simple Random
description: 介紹統計學中常見的五種抽樣方法，包括分層抽樣、配額抽樣、便利抽樣、系統抽樣與簡單隨機抽樣，並說明其原理與適用情境。
tags: [statistics, sampling, data_science, probability]
category: statistic
date: 2026-03-14
---

在統計學與資料科學中，我們很少能直接研究整個母體（population）。

例如：研究全國學生的身高、所有顧客的滿意度、或整個城市的交通習慣，若逐一調查每個人往往需要非常高的成本與時間。

因此，統計學會透過 **抽樣（sampling）** 的方式，從母體中選取一部分樣本（sample）來進行研究，並利用樣本推估整體母體的特性。

然而，不同的抽樣方式會影響樣本是否具有 **代表性（representativeness）**。如果抽樣方式不當，研究結果就可能產生偏誤（bias）。

在統計學與研究方法中，常見的抽樣方式包括：

- Simple Random Sampling（簡單隨機抽樣）
- Systematic Sampling（系統抽樣）
- Stratified Sampling（分層抽樣）
- Quota Sampling（配額抽樣）
- Convenience Sampling（便利抽樣）

接下來我們將逐一介紹這些抽樣方式的概念與差異。

---

## Simple Random Sampling（簡單隨機抽樣）

**簡單隨機抽樣（Simple Random Sampling）** 是最基本且最理想的抽樣方式。

在這種方法中，母體中的每一個個體都 **有相同的機率被抽中**。

例如：

假設某學校有 1000 名學生，你想抽取 100 名學生進行問卷調查。若使用簡單隨機抽樣，可以：

- 使用亂數產生器
- 從名單中隨機選取學生
- 或使用抽籤方式

例如抽樣流程可能是：

```text
學生名單 → 隨機亂數 → 抽取 100 人
```

這種方法的優點是：

- 抽樣機率公平
- 統計推論理論最完整

但缺點是：

- 需要完整的母體名單
- 在大型母體中實務上較難操作

---

## Systematic Sampling（系統抽樣）

**系統抽樣（Systematic Sampling）** 是從母體名單中 **按照固定間隔進行抽樣**。

抽樣流程通常如下：

1. 先決定抽樣間距（sampling interval）
2. 隨機選擇第一個樣本
3. 之後每隔固定數量抽取一個樣本

例如：

假設有 1000 名學生，要抽取 100 人。抽樣間距：

```text
1000 ÷ 100 = 10
```

流程可能是：

```text
隨機選擇第 7 位學生
之後抽取：7, 17, 27, 37, 47 ...
```

這種方法的優點是：

- 抽樣流程簡單
- 操作效率高

但如果母體名單中存在某種 **週期性（periodicity）**，就可能導致樣本偏差。

---

## Stratified Sampling（分層抽樣）

**分層抽樣（Stratified Sampling）** 是先將母體依某些特徵 **分成不同層（strata）**，再從每一層中抽樣。

例如研究全校學生的平均身高時，可以依年級分層：

```text
母體
├── 高一
├── 高二
└── 高三
```

接著在每一層中再進行隨機抽樣。

例如：

| 年級 | 人數 | 抽樣數 |
|---|---:|---:|
| 高一 | 400 | 40 |
| 高二 | 350 | 35 |
| 高三 | 250 | 25 |

分層抽樣的優點是：

- 確保各類群體都被代表
- 可以降低抽樣誤差

因此在社會調查與民調中非常常見。

---

## Quota Sampling（配額抽樣）

**配額抽樣（Quota Sampling）** 與分層抽樣看起來相似，但本質不同。

在配額抽樣中，研究者會先設定 **每個群體需要的樣本數量**，但 **抽樣過程不一定是隨機的**。

例如一項街頭調查：

研究者可能設定：

| 性別 | 需要樣本 |
|---|---:|
| 男性 | 50 |
| 女性 | 50 |

調查員只需要在街上 **找到符合條件的人**，直到配額滿足。

因此抽樣流程可能是：

```text
看到路人 → 判斷性別 → 邀請填問卷
```

這種方法的優點是：

- 成本低
- 執行快速

但缺點是：

- 不具真正的隨機性
- 可能產生抽樣偏差

---

## Convenience Sampling（便利抽樣）

**便利抽樣（Convenience Sampling）** 是最容易執行的一種抽樣方式。

研究者只選擇 **最容易取得的樣本**。

例如：

- 在自己的班級發問卷
- 在學校門口訪問學生
- 在網路社群發問卷

抽樣方式可能是：

```text
研究者身邊的人 → 直接收集資料
```

優點：

- 成本最低
- 收集資料速度快

缺點：

- 樣本代表性很低
- 很容易產生偏誤

因此通常只用於 **探索性研究（exploratory research）**。

---

## 五種抽樣方法比較

| 抽樣方式 | 是否隨機 | 特點 |
|---|---|---|
| Simple Random | 是 | 每個個體機率相同 |
| Systematic | 部分 | 固定間隔抽樣 |
| Stratified | 是 | 先分層再抽樣 |
| Quota | 否 | 按比例收集樣本 |
| Convenience | 否 | 最容易取得樣本 |

簡單理解：

```text
最嚴謹
  ↓
Stratified
Simple Random
Systematic
Quota
Convenience
  ↑
最容易偏誤
```

---

## 如何判斷題目使用哪種抽樣方法？

在統計題目中，常會要求判斷抽樣方法，例如：

> State which two of the sampling methods listed below best describe the method used.

常見判斷關鍵：

| 題目描述 | 抽樣方式 |
|---|---|
| 每個人機率相同 | Simple Random |
| 每隔 k 個抽一個 | Systematic |
| 先分群再抽 | Stratified |
| 先設定比例再找人 | Quota |
| 只找方便的人 | Convenience |

因此在解題時，關鍵是找出 **抽樣是否隨機、是否分層、是否有固定間距、是否只是方便取得樣本**。

---

## 結論

抽樣方法是統計研究中非常重要的概念，不同的抽樣策略會直接影響研究結果是否具有代表性。

在理論上，**隨機抽樣（random sampling）** 能夠提供較可靠的統計推論，而 **非隨機抽樣（non-random sampling）** 則通常較容易產生偏誤，但在實務研究中往往更容易執行。

理解各種抽樣方法的原理與差異，不僅能幫助我們在統計題目中正確判斷抽樣方式，也能在實際研究與資料分析中設計更合理的研究方法。

---

## 參考資料

1. Montgomery, D. C., & Runger, G. C. *Applied Statistics and Probability for Engineers*.
2. OpenIntro Statistics. *Sampling Methods*.
3. Cochran, W. G. *Sampling Techniques*.
