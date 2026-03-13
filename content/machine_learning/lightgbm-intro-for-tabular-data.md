---
title: LightGBM 模型入門：理解高效能的 Gradient Boosting 演算法
description: 介紹 LightGBM 的核心概念、運作方式與實際應用，幫助初學者理解為什麼它在表格資料（tabular data）上表現如此優秀。
tags: [machine learning, lightgbm, gradient boosting, tabular data]
category: machine_learning
date: 2026-03-08
---

## 為什麼需要 LightGBM？

在機器學習中，我們常常會遇到這樣的問題：如何從一堆資料中建立一個模型，去預測某件事情會不會發生？

例如：

| user_id | age | income | transactions | fraud |
|---:|---:|---:|---:|---:|
| 1 | 25 | 45000 | 12 | 0 |
| 2 | 42 | 98000 | 3 | 0 |
| 3 | 31 | 52000 | 1 | 1 |

如果我們的目標是預測 **fraud（是否為詐欺交易）**，那麼模型就需要根據 `age`、`income`、`transactions` 等特徵來做判斷。

在這類 **tabular data（表格資料）** 的問題中，**tree-based model（樹模型）** 通常表現非常好，而 LightGBM 正是目前最常使用的模型之一。

LightGBM 是 **Microsoft 在 2017 年開源的 Gradient Boosting 框架**，設計目標是讓模型在 **大型資料集上訓練得更快、佔用更少記憶體，同時保持很高的預測準確度**。

---

## LightGBM 的核心概念：Boosting

LightGBM 的核心思想其實來自 **Gradient Boosting**。

Boosting 的概念可以用一個簡單的比喻理解：假設你有一群判斷能力普通的人，每個人只能做出 **還不錯但不完美的判斷**。如果讓這些人 **依序修正前一個人的錯誤**，最後就可以得到一個非常準確的決策。

在機器學習中，這些「人」其實就是 **decision tree（決策樹）**。

模型的訓練流程大致如下：

1. 建立第一棵樹，做出初步預測
2. 計算預測錯誤（residual）
3. 建立新的樹來修正這些錯誤
4. 重複這個過程很多次
5. 最後把所有樹的結果加總

簡單來說：

> LightGBM 其實不是一棵樹，而是 **很多棵樹的組合**。

---

## LightGBM 的模型結構

LightGBM 最終的模型看起來像這樣：

```text
Prediction = Tree1 + Tree2 + Tree3 + ... + TreeN
```

每一棵樹都負責 **修正前一輪的錯誤**。

例如：

| Tree | 功能 |
|---|---|
| Tree1 | 建立基礎預測 |
| Tree2 | 修正第一棵樹的錯誤 |
| Tree3 | 再修正剩下的誤差 |

隨著樹越來越多，模型的預測能力也會越來越強。

---

## LightGBM 與一般 Decision Tree 的差別

如果只使用 **單一 Decision Tree**，模型很容易出現兩個問題：

1. **過度簡化（underfitting）**
2. **過度擬合（overfitting）**

Boosting 的做法是：

> 用很多棵「簡單的樹」組合成一個「強大的模型」。

這也是為什麼像 **LightGBM、XGBoost、CatBoost** 這類模型常常在 Kaggle 競賽或實務專案中表現很好。

---

## LightGBM 為什麼這麼快？

LightGBM 相比於其他 Gradient Boosting 模型，有幾個非常重要的設計。

### Histogram-based learning

一般決策樹在切分資料時，需要嘗試很多可能的切分點。如果資料很多，這個過程會非常耗時。

LightGBM 的做法是先把數值 **離散化成 histogram（直方圖）**。

例如：

```text
age: 18, 19, 20, 21, 22
```

可能會被分成：

```text
bin1: 18–20
bin2: 21–23
```

這樣在尋找最佳切分點時，只需要比較 **bin**，速度就會快很多。

### Leaf-wise Tree Growth

另一個重要的設計是 **leaf-wise growth（葉節點成長）**。

傳統 decision tree 通常是 **level-wise**，每一層同時擴展；但 LightGBM 每次都選擇 **最能降低誤差的葉節點繼續分裂**。

這樣的優點是：

- 能更快降低 loss
- 通常得到更好的模型

但缺點是如果不控制，可能會 **過度擬合**，因此通常會設定 `max_depth` 或 `num_leaves`。

---

## 一個簡單的 Python 範例

下面是一個使用 LightGBM 進行分類的簡單例子。

```python
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import pandas as pd

# 假設有一個資料集
df = pd.read_csv("data.csv")
X = df.drop(columns=["fraud"])
y = df["fraud"]

X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=6
)

model.fit(X_train, y_train)
pred = model.predict_proba(X_valid)[:, 1]
print("ROC-AUC:", roc_auc_score(y_valid, pred))
```

這段程式碼的流程是：

1. 載入資料
2. 切分 train / validation
3. 建立 LightGBM 模型
4. 訓練模型
5. 使用 ROC-AUC 評估結果

---

## LightGBM 常見的應用場景

LightGBM 特別適合 **tabular data** 的問題，例如：

- 信用風險評估
- 詐欺偵測
- 廣告點擊率預測
- 推薦系統
- 金融交易分析

在很多實務專案中，LightGBM 往往會成為 **baseline model**，因為它具有：

- 訓練速度快
- 效能強
- 容易調參

這也是為什麼在資料科學競賽（例如 Kaggle）中，LightGBM 的使用率非常高。

---

## 總結

LightGBM 是一種基於 **Gradient Boosting Decision Tree（GBDT）** 的機器學習模型，透過多棵決策樹逐步修正錯誤，建立出強大的預測能力。相比傳統的 boosting 方法，LightGBM 透過 **Histogram-based learning** 和 **Leaf-wise tree growth** 等設計，大幅提升了訓練速度與模型效率。

在處理 **tabular data** 的問題時，LightGBM 往往能提供非常優秀的效果，因此也成為現代資料科學與機器學習專案中最常見的模型之一。

---

## 參考資料

1. Ke, G. et al. (2017). *LightGBM: A Highly Efficient Gradient Boosting Decision Tree.*
2. LightGBM Official Documentation: <https://lightgbm.readthedocs.io>
3. Chen, T. & Guestrin, C. (2016). *XGBoost: A Scalable Tree Boosting System.*
