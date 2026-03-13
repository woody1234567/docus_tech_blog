---
title: Cramér’s V 指標介紹：如何衡量兩個類別變數之間的關聯
description: 介紹 Cramér’s V 的概念、計算方式與實務應用，理解如何衡量兩個類別變數之間的關聯強度。
tags: [statistics, cramers_v, chi_square, feature_analysis, data_science]
category: statistic
date: 2026-03-08
---

## 為什麼需要衡量「類別變數之間的關聯」？

在資料分析與機器學習中，我們常會遇到**類別型資料（categorical data）**，例如：

| customer_gender | payment_method |
|---|---|
| male | credit_card |
| female | paypal |
| male | bank_transfer |

這類資料的特點是：

- 資料不是數值，而是**分類**
- 無法直接用 **相關係數（correlation）** 來衡量關係

例如：

- 性別 vs 付款方式
- 城市 vs 商品類型
- 職業 vs 是否購買保險

這些變數之間可能存在某種關聯，但因為它們不是連續數值，我們不能直接使用 **Pearson correlation** 來測量。

因此，在統計學中，我們通常會使用 **卡方檢定（Chi-square test）** 來判斷兩個類別變數是否相關。

但卡方檢定只能回答一個問題：

> 兩個變數是否存在關係？

卻沒有告訴我們：

> 關係有多強？

這時候就會使用 **Cramér’s V**。

---

## Cramér’s V 是什麼？

**Cramér’s V** 是一種用來衡量 **兩個類別變數之間關聯強度（association strength）** 的統計指標。

它的值介於：

```text
0 ≤ Cramér’s V ≤ 1
```

含義如下：

| Cramér’s V | 解釋 |
|---|---|
| 0 | 完全沒有關聯 |
| 0.1 ~ 0.3 | 弱關聯 |
| 0.3 ~ 0.5 | 中等關聯 |
| > 0.5 | 強關聯 |

換句話說：

- **越接近 0 → 幾乎沒有關係**
- **越接近 1 → 關係越強**

Cramér’s V 可以視為：

> 類別變數版本的相關係數。

---

## Cramér’s V 與卡方檢定的關係

Cramér’s V 的計算其實是建立在 **卡方統計量（Chi-square statistic）** 之上。

公式如下：

$$
V = \sqrt{\frac{\chi^2}{n \times (k-1)}}
$$

其中：

- $\chi^2$：卡方統計量
- $n$：樣本數
- $k$：列或欄中較小的類別數

簡單理解：

1. 先透過 **卡方檢定** 算出變數之間的差異程度
2. 再將結果**標準化到 0~1 之間**

因此 Cramér’s V 本質上就是：

> **卡方檢定結果的標準化版本**

讓我們更容易理解關聯強度。

---

## 用一個簡單例子理解 Cramér’s V

假設我們分析一個 **電商資料集**，想知道：

> 性別與付款方式是否有關聯？

我們整理出以下 **交叉表（contingency table）**：

| Gender | Credit Card | PayPal | Bank Transfer |
|---|---:|---:|---:|
| Male | 120 | 60 | 20 |
| Female | 80 | 140 | 30 |

從表面上看：

- 男性比較常用 **信用卡**
- 女性比較常用 **PayPal**

但這只是直覺觀察。

如果我們進一步計算：

- **Chi-square test**
- **Cramér’s V**

假設結果為：

```text
Cramér’s V = 0.32
```

這代表：

> 性別與付款方式之間存在 **中等程度的關聯**。

---

## Python 實作 Cramér’s V

在 Python 中，我們可以透過 `scipy` 計算 Cramér’s V。

首先建立交叉表：

```python
import numpy as np
from scipy.stats import chi2_contingency

table = np.array([
    [120, 60, 20],
    [80, 140, 30]
])
```

接著計算卡方統計量：

```python
chi2, p, dof, expected = chi2_contingency(table)
```

最後計算 Cramér’s V：

```python
n = table.sum()
k = min(table.shape)
cramers_v = np.sqrt(chi2 / (n * (k - 1)))

print("Cramér's V:", cramers_v)
```

執行後就可以得到兩個變數之間的關聯強度。

---

## Cramér’s V 在機器學習中的用途

在資料科學實務中，Cramér’s V 常用於：

### 1) Feature selection（特徵選擇）

如果你的資料有很多 **categorical feature**：

- country
- job
- device_type
- payment_method

可以透過 **Cramér’s V vs target** 來判斷：

> 哪些類別特徵與目標變數最相關。

例如在 **詐欺偵測模型** 中：

| Feature | Cramér’s V |
|---|---:|
| payment_method | 0.41 |
| device_type | 0.28 |
| country | 0.05 |

這代表：

- payment_method → 重要特徵
- country → 幾乎沒有關聯

因此可以作為 **特徵篩選依據**。

### 2) 檢查類別特徵之間的關係

Cramér’s V 也可以用來檢查：

> 兩個 feature 是否高度相關。

例如：

| Feature A | Feature B | Cramér’s V |
|---|---|---:|
| city | zipcode | 0.92 |

這代表兩者幾乎是同一件事情。

如果同時放入模型，可能會造成：

- 資訊冗餘
- feature leakage

### 3) 建立 categorical correlation matrix

在 EDA（Exploratory Data Analysis）中，我們甚至可以建立：**Categorical correlation matrix**。

例如：

| Feature | Gender | Device | Country |
|---|---:|---:|---:|
| Gender | 1 | 0.12 | 0.08 |
| Device | 0.12 | 1 | 0.35 |
| Country | 0.08 | 0.35 | 1 |

這有點像：

> categorical version 的 correlation matrix。

---

## Cramér’s V 的限制

雖然 Cramér’s V 很實用，但仍然有一些限制：

### 1) 不代表因果關係

就算 Cramér’s V 很高，也只能說：

> 兩個變數相關

但不能說：

> A 導致 B。

### 2) 對樣本數敏感

當樣本數很大時：

- 即使差異很小
- 也可能得到顯著關聯

因此通常會搭配：

- **Chi-square p-value**
- **domain knowledge**

一起判斷。

---

## 結論

Cramér’s V 是一種用來衡量 **兩個類別變數之間關聯強度** 的統計指標，其數值介於 0 到 1 之間。它是建立在卡方檢定之上的標準化指標，因此可以視為「類別資料版本的相關係數」。

在資料科學與機器學習中，Cramér’s V 常被用於特徵選擇、EDA 分析以及檢查類別特徵之間的關聯。透過這個指標，我們可以更清楚地了解資料結構，並幫助模型建立更有效的特徵集合。
