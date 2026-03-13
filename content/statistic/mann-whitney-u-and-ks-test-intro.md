---
title: Mann–Whitney U 與 Kolmogorov–Smirnov（KS）檢定：非參數統計檢定的入門指南
description: 以直觀方式介紹 Mann–Whitney U 與 Kolmogorov–Smirnov（KS）檢定，理解兩種常見的非參數統計方法，以及在資料科學與機器學習中的實際應用。
tags: [statistics, hypothesis_testing, mann_whitney, ks_test, data_science]
category: statistic
date: 2026-03-08
---

在資料科學與機器學習的分析過程中，我們經常會遇到一個問題：

**兩組資料是否真的來自不同的分布？**

例如：

- 詐欺交易與正常交易的交易金額是否不同？
- A/B test 中，兩個版本的使用者行為是否不同？
- 某個特徵在不同群體之間是否具有區別能力？

在這類問題中，我們通常會使用 **統計檢定（statistical test）** 來判斷差異是否顯著。其中，兩個非常常見且實用的方法是：

- **Mann–Whitney U Test**
- **Kolmogorov–Smirnov Test（KS test）**

這兩種方法都屬於 **非參數檢定（non-parametric test）**，也就是說它們 **不需要假設資料符合常態分布**，因此在真實資料分析中非常常見。

接下來我們會從直觀概念開始，逐步理解這兩種方法。

---

## 為什麼需要「非參數檢定」？

在傳統統計學中，很多檢定方法（例如 t-test）都會假設資料符合某些條件，例如：

- 常態分布
- 變異數相等
- 線性關係

但在實際的資料科學場景中，例如：

- 金融交易
- 使用者行為
- 詐欺偵測
- 網站點擊資料

這些資料往往 **非常偏態（skewed）**，甚至可能包含極端值。

例如交易金額：

```text
10, 20, 30, 50, 70, 1000, 5000
```

這樣的資料顯然 **不符合常態分布**。

因此，我們會使用 **non-parametric tests**，也就是：

> 不需要對資料分布做強假設的統計方法。

而 Mann–Whitney U 與 KS test 就是其中兩個重要工具。

---

## Mann–Whitney U Test 是什麼？

Mann–Whitney U test 用來回答一個問題：

> **兩組樣本的「整體大小分布」是否不同？**

它其實可以被理解為 **非參數版本的 t-test**。

假設我們有兩組資料：

```text
Group A：10, 20, 30
Group B：40, 50, 60
```

直觀上可以看出：

```text
B 整體比 A 大
```

Mann–Whitney U test 的核心概念其實非常直觀：

> **如果隨機抽一個 A 和一個 B，B 大於 A 的機率是否明顯較高？**

如果這個機率顯著偏離 50%，就代表兩組分布不同。

---

## Mann–Whitney U 的直觀理解（排名概念）

Mann–Whitney U 的實際計算方式是：**先把所有數值排序（ranking）**。

例如：

```text
資料： 10(A), 20(A), 30(A), 40(B), 50(B), 60(B)
排名： 1      2      3      4      5      6
```

然後計算：

- A 的排名總和
- B 的排名總和

如果：

- A 的排名大多在前面
- B 的排名大多在後面

那就代表兩組資料存在明顯差異。

這個方法的好處是：

- 不需要假設常態分布
- 對 extreme values 比較不敏感

---

## Mann–Whitney U 的 Python 範例

在 Python 中，可以使用 `scipy` 來進行 Mann–Whitney U test。

```python
from scipy.stats import mannwhitneyu

group_a = [10, 20, 30]
group_b = [40, 50, 60]

stat, p_value = mannwhitneyu(group_a, group_b)

print("U statistic:", stat)
print("p-value:", p_value)
```

如果：

```text
p-value < 0.05
```

通常代表：

> 兩組資料的分布存在顯著差異。

---

## Kolmogorov–Smirnov Test（KS Test）是什麼？

KS test 也是一種常見的非參數檢定，但它回答的問題稍微不同：

> **兩組資料的「整個分布形狀」是否不同？**

Mann–Whitney U 主要關心的是：**整體大小是否不同**。

而 KS test 關心的是：**整個 distribution 是否不同**，包括：

- 平均值
- 分布形狀
- 尾端差異

---

## KS Test 的核心概念

KS test 的核心是比較：**兩個 cumulative distribution function（CDF）**。

KS statistic 定義為：

```text
KS = max | F1(x) - F2(x) |
```

也就是：

> **兩條 CDF 曲線之間最大的距離。**

如果這個距離很大，就代表兩個分布差異很明顯。

---

## KS Test 的直觀示意

假設兩組資料：

- Normal users
- Fraud users

畫出 CDF 之後，兩條曲線之間最大的垂直距離，就是 **KS statistic**。

KS statistic 越大，代表兩個分布越不同。

---

## KS Test 的 Python 範例

```python
from scipy.stats import ks_2samp

group_a = [10, 20, 30, 40]
group_b = [50, 60, 70, 80]

stat, p_value = ks_2samp(group_a, group_b)

print("KS statistic:", stat)
print("p-value:", p_value)
```

如果：

```text
p-value < 0.05
```

代表兩個分布存在顯著差異。

---

## 在資料科學中的應用

這兩種方法在資料科學中其實非常常見。

### Feature selection

在詐欺偵測中，我們可能會問：

```text
transaction_amount
```

在：

```text
Fraud vs Normal
```

之間是否有明顯差異？

這時就可以使用：

- Mann–Whitney U
- KS test

來判斷該 feature 是否具有區別能力。

### Credit Risk / Fraud Detection

在金融風控領域，KS statistic 甚至是一個 **非常重要的模型評估指標**。

例如：

```text
KS = max(TPR - FPR)
```

KS 越高，代表：

> 模型越能區分好客戶與壞客戶。

因此在銀行與金融機構中，KS 常被用來評估 credit model 的效果。

---

## Mann–Whitney U vs KS Test

最後，我們可以簡單整理兩者的差異：

| 方法 | 主要比較 | 核心概念 |
|---|---|---|
| Mann–Whitney U | 中位數 / 整體大小 | 比較 ranking |
| KS Test | 整體分布 | 比較 CDF |

簡單理解可以是：

```text
Mann–Whitney U → 哪一組「整體比較大」
KS test         → 兩個 distribution 是否不同
```

---

## 總結

Mann–Whitney U 與 KS test 都是非常重要的 **非參數統計檢定方法**，特別適合用在真實世界的資料分析場景。

Mann–Whitney U 透過 **排名（ranking）** 來比較兩組資料是否存在整體大小差異，而 KS test 則是透過比較 **累積分布函數（CDF）** 的最大距離，來判斷兩個分布是否不同。

在資料科學與機器學習中，這兩種方法經常被用於 **feature analysis、模型評估與資料探索（EDA）**。理解它們的原理，不僅可以幫助我們更好地解讀資料，也能在實務中建立更可靠的模型分析流程。

---

## 參考資料

1. Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other.
2. Kolmogorov, A. (1933). Sulla determinazione empirica di una legge di distribuzione.
3. SciPy Documentation – Statistical functions.
