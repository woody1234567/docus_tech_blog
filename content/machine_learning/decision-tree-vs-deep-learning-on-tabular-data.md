---
title: 為什麼 Decision Tree 在 Tabular Data 上常常勝過 Deep Learning？
description: 深入理解 Decision Tree 與 GBDT 在表格資料上的優勢，解析為何在多數資料科學實務中，tree-based model 往往比深度學習模型表現更好。
tags: [machine learning, decision tree, gbdt, tabular data, xgboost, lightgbm]
category: machine_learning
date: 2026-03-08
---

## 從一個常見問題開始

在資料科學或機器學習的學習過程中，很多人都會有一個直覺：**Deep Learning 應該比其他模型更強**。畢竟在影像辨識、自然語言處理以及語音辨識等領域，深度學習幾乎已經成為主流方法。

然而在實務上，如果資料型態是 **tabular data（表格資料）**，情況往往正好相反。在許多資料科學專案與 Kaggle 競賽中，像是 **Decision Tree、XGBoost、LightGBM、CatBoost** 這類 **tree-based model**，常常比深度學習模型表現更好。

要理解這件事情，就需要先了解 **tabular data 的特性**，以及 **Decision Tree 的運作方式**。

---

## Tabular Data 的結構特性

所謂 tabular data，通常指的是以表格形式儲存的資料，每一列是一筆樣本，每一欄是一個特徵（feature）。例如：

| feature | type |
|---|---|
| age | numerical |
| income | numerical |
| job | categorical |
| country | categorical |
| balance | numerical |

這些特徵之間通常沒有明顯的空間結構或時間結構。與影像、文字或語音資料不同，tabular data 中的欄位彼此往往只是**描述同一筆資料的不同屬性**。

例如在一個簡單的分類問題中，模型可能需要判斷以下條件：

```text
income > 50000 AND age < 30
```

這樣的規則其實就是 **條件判斷（rule-based interaction）**，而這正是 Decision Tree 非常擅長表達的形式。

Decision Tree 的決策過程本質上就是一連串的條件判斷，例如：

```python
if income > 50000:
    if age < 30:
        predict = class_A
```

這種結構讓 Decision Tree 在處理 tabular data 時，能夠非常自然地表達資料中的邏輯關係。

---

## Decision Tree 如何表示決策規則

Decision Tree 透過 **節點（node）與分裂條件（split）** 來逐步將資料切分。每一個節點會選擇一個特徵以及一個閾值（threshold），把資料分成不同的子群。

例如一棵簡單的決策樹可能長這樣：

```text
income > 50000?
├─ Yes → age < 30?
│  ├─ Yes → Class A
│  └─ No  → Class B
└─ No  → Class C
```

這棵樹的決策流程可以解讀為：

1. 先判斷收入是否大於 50000
2. 如果是，進一步判斷年齡是否小於 30
3. 根據不同條件，輸出不同的預測結果

因此 **Decision Tree 本質上就是一組 if-else 規則的集合**。對於 tabular data 中常見的條件型關係，這樣的模型結構非常合適。

---

## Tree Model 非常擅長 Feature Interaction

在許多實際問題中，資料的訊號往往來自 **多個特徵之間的交互作用（feature interaction）**。

例如在金融詐欺偵測問題中，一筆交易可能只有在同時滿足以下條件時才會被判斷為高風險：

```text
amount > 5000 AND country != home_country AND device_new = True
```

這是一種 **非線性且具有條件關係的規則**。

Decision Tree 可以透過多層分裂自然地表達這樣的邏輯，例如：

```text
split1: amount > 5000
split2: country != home_country
split3: device_new
```

而深度神經網路雖然理論上也能學到這些關係，但通常需要更多資料與更複雜的訓練過程才能學出相同的規則。

---

## Tabular Data 的資料量通常有限

另一個重要原因是 **資料規模**。

深度學習模型通常在資料量極大的情況下才會發揮真正的優勢。例如：

| dataset | samples |
|---|---|
| ImageNet | 約 1400 萬張圖片 |
| 大型語言模型語料 | 數兆 tokens |

相比之下，常見的 tabular dataset 規模通常是：

| dataset | samples |
|---|---|
| Kaggle 競賽 | 10k – 1M |
| 銀行資料 | 約 100k |
| 詐欺偵測資料 | 約 200k |

對深度神經網路來說，這樣的資料量其實並不算大，容易出現 **overfitting** 的問題。反之，Decision Tree 與 GBDT 類模型在中小型資料集上通常更穩定。

---

## Decision Tree 對 Feature Scaling 不敏感

在使用深度學習模型時，資料通常需要先進行一些預處理，例如：

- normalization
- standardization
- embedding

例如：

```text
income  → 0 ~ 1
age     → z-score
balance → -1 ~ 1
```

但 Decision Tree 在分裂資料時只會關心**閾值比較**：

```text
age > 30
balance < 1000
```

因此：

- 不需要做 scaling
- 對 outlier 不太敏感
- 對 feature distribution 的要求較低

這讓 tree-based model 在實務上更容易應用於各種「不完美」的資料。

---

## Tree Model 對 Categorical Feature 的處理

Tabular data 中很常包含 **類別型特徵（categorical feature）**，例如：

```text
country = {US, TW, JP, CN}
```

在神經網路中，這類資料通常需要轉換為：

- one-hot encoding
- embedding

而 Decision Tree 則可以直接利用類別特徵進行分裂。例如：

```text
country in {US, JP}
```

此外，像 **CatBoost** 這類模型甚至是專門為 categorical feature 設計，能更有效地處理這類資料。

---

## Decision Tree 具有天然的 Feature Selection

在神經網路中，通常所有特徵都會參與模型計算。

但在 Decision Tree 中，模型只會選擇 **對預測最有幫助的特徵** 進行分裂。例如：

```text
split1: income
split2: balance
split3: device_type
```

如果某個特徵沒有提供有用資訊，它可能根本不會出現在樹的任何節點中。這種特性讓 Decision Tree 在面對 **高維度或 noisy data** 時仍然能保持良好的表現。

---

## GBDT：多棵樹的集成模型

在實務中，人們通常不只使用一棵 Decision Tree，而是使用 **多棵樹的集成模型（ensemble model）**。

像是 **XGBoost** 或 **LightGBM**，其核心概念是：

```text
prediction = tree_1 + tree_2 + tree_3 + ... + tree_n
```

這種方法稱為：**Gradient Boosting Decision Trees（GBDT）**。

GBDT 的優點包括：

- 可以學習高度非線性的關係
- 能捕捉 feature interaction
- 具備良好的正則化能力
- 自動進行 feature selection

因此在 tabular data 的問題上，GBDT 常常能達到非常強的預測效果。

---

## Kaggle 競賽中的實戰經驗

在許多 Kaggle 的 tabular data 競賽中，常見的最佳解法通常是：

```text
LightGBM + XGBoost + CatBoost ensemble
```

深度學習模型通常只有在以下情況下才會具有優勢：

- 資料量極大
- 特徵結構非常複雜
- 需要進行 representation learning

在大多數傳統表格資料問題中，tree-based model 仍然是最常見且有效的選擇。

---

## 結語

簡單來說：

- **Deep Learning 擅長學習資料的 representation**
- **Decision Tree 擅長學習 decision rules**

而 tabular data 中的訊號往往就是各種條件規則與特徵交互作用。因此，在許多實際的資料科學問題中，Decision Tree 與 GBDT 類模型往往會比深度學習模型表現更好。

理解這些模型與資料結構之間的關係，能幫助我們在不同問題中選擇更合適的機器學習方法。
