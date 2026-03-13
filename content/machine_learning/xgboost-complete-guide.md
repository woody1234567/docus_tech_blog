---
title: XGBoost 原理與實務教學
description: 從 Boosting 概念開始，深入理解 XGBoost 的運作原理，並透過實際案例了解如何使用 XGBoost 建立高效的機器學習模型。
tags: [xgboost, machine learning, boosting, tree model, data science]
category: machine_learning
date: 2026-03-08
---

## 為什麼需要 XGBoost？

在機器學習中，當我們處理 **表格型資料（tabular data）** 時，例如金融交易、信用評分、推薦系統或醫療資料，常常會遇到一個問題：**單一模型的預測能力有限。**

例如，一棵決策樹（Decision Tree）雖然容易理解，但往往會有以下問題：

- 容易過度擬合（overfitting）
- 模型穩定性較差
- 單一樹的預測能力有限

為了解決這個問題，研究者提出了一種方法叫做 **Boosting**。

Boosting 的核心想法是：

> 不斷建立新的模型，專門去修正前一個模型犯的錯誤。

XGBoost（Extreme Gradient Boosting）就是 Boosting 方法中最成功、也最廣泛使用的模型之一。它在許多資料科學競賽（例如 Kaggle）中長期保持極高的表現，因此成為處理 tabular data 的重要工具之一。

---

## Boosting 的核心概念

在理解 XGBoost 之前，我們先理解 **Gradient Boosting 的基本想法**。

假設我們要預測一個目標值 $y$，模型的預測為：

$$
\hat{y} = \sum_{k=1}^{K} f_k(x)
$$

其中：

- $f_k(x)$ 代表第 $k$ 棵樹
- 最終預測是 **所有樹的加總**

也就是說，XGBoost 並不是只建立一棵樹，而是建立 **很多棵小樹（weak learners）**，然後把它們的預測結果加在一起。

訓練流程大致如下：

1. 建立第一棵樹做初步預測
2. 計算模型的錯誤（loss）
3. 建立第二棵樹專門修正第一棵樹的錯誤
4. 持續重複這個過程

最後，模型就會變成一個 **多棵樹的加總模型**。

---

## XGBoost 的核心優勢

XGBoost 是對傳統 Gradient Boosting 的改良版本，主要加入了幾個重要的設計。

### 1) 正則化（Regularization）

XGBoost 在目標函數中加入了模型複雜度的懲罰項：

$$
Objective = Loss + Regularization
$$

Regularization 會懲罰：

- 樹的數量
- 葉節點的權重
- 樹的複雜度

這樣可以有效避免 **模型過度擬合**。

### 2) 二階導數優化（Second-order optimization）

XGBoost 在優化過程中使用：

- 一階導數（gradient）
- 二階導數（hessian）

來近似 loss function。這樣的好處是：

- 收斂速度更快
- 模型更穩定

### 3) 自動處理缺失值

在實務資料中，常常會有缺失值（missing values）。XGBoost 可以自動學習：

> 當 feature 缺失時，應該往左子樹還是右子樹。

因此在很多情況下 **不需要額外做 missing value imputation**。

### 4) 計算效率高

XGBoost 在設計時特別強調效能，例如：

- 平行化計算
- cache-aware 設計
- column block structure

因此在大資料集上仍然可以維持良好的訓練速度。

---

## 一個直觀例子：信用卡詐欺偵測

假設我們要建立一個模型，用來預測交易是否為詐欺。資料可能包含以下特徵：

| Feature | 說明 |
|---|---|
| transaction_amount | 交易金額 |
| account_age | 帳戶建立時間 |
| num_transactions | 近期交易數 |
| device_change | 是否更換裝置 |

目標變數：

```text
Fraud = 1
Normal = 0
```

### 第一步：第一棵樹

模型可能先建立一棵簡單的樹：

```text
transaction_amount > 500 ?
├─ yes → fraud
└─ no  → normal
```

這棵樹會做出一個 **粗略預測**，但一定會有很多錯誤，例如：

- 小額詐欺
- 高額正常交易

### 第二步：建立第二棵樹修正錯誤

第二棵樹會專門去學習：

> 第一棵樹預測錯誤的地方。

例如：

```text
device_change = True ?
├─ yes → fraud
└─ no  → normal
```

### 第三步：建立更多樹

XGBoost 會持續建立新的樹來修正誤差：

```text
Prediction = Tree1 + Tree2 + Tree3 + ... + TreeN
```

這就是 **Boosting 的核心思想**。

---

## Python 實作範例

以下示範如何使用 XGBoost 建立分類模型。

### 安裝套件

```bash
pip install xgboost
```

### 建立模型

```python
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import roc_auc_score

# 載入資料
data = load_breast_cancer()
X = data.data
y = data.target

# 切分資料
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 建立模型
model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8
)

# 訓練模型
model.fit(X_train, y_train)

# 預測
y_pred_prob = model.predict_proba(X_test)[:, 1]

# 評估
auc = roc_auc_score(y_test, y_pred_prob)
print("ROC-AUC:", auc)
```

### 常見重要參數

| 參數 | 說明 |
|---|---|
| n_estimators | 樹的數量 |
| max_depth | 每棵樹的最大深度 |
| learning_rate | 每棵樹的學習率 |
| subsample | 使用多少比例資料 |
| colsample_bytree | 每棵樹使用多少特徵 |

其中 **learning_rate 與 n_estimators 通常需要一起調整**：

- learning_rate 小 → n_estimators 要大
- learning_rate 大 → n_estimators 可以小

---

## XGBoost 在實務中的應用

XGBoost 在許多產業都有非常廣泛的應用，例如：

### 金融風控

- 信用卡詐欺偵測
- 信用風險評估
- 交易異常偵測

### 電商推薦

- 商品推薦
- 使用者行為預測

### 醫療

- 疾病診斷
- 風險預測

特別是在 **金融詐欺偵測（fraud detection）** 中，XGBoost 經常會搭配：

- **Transaction features**
- **Account-level features**
- **Social Network Analysis (SNA) features**

來提升模型的預測能力。

---

## 結論

XGBoost 是目前機器學習中最重要的 tree-based model 之一，其核心思想是透過 **Boosting 方法不斷建立新的決策樹來修正前一個模型的錯誤**。

相比傳統的 Gradient Boosting，XGBoost 透過：

- 正則化控制模型複雜度
- 二階導數優化
- 自動處理缺失值
- 高效能平行運算

大幅提升了模型的 **準確度與訓練效率**。

因此在許多資料科學任務中，特別是 **tabular data 的問題**，XGBoost 常常會成為最強大的基準模型之一。

---

## 參考資料

1. Chen, T., & Guestrin, C. (2016). *XGBoost: A Scalable Tree Boosting System.*
2. Friedman, J. (2001). *Greedy Function Approximation: A Gradient Boosting Machine.*
3. XGBoost 官方文件：<https://xgboost.readthedocs.io/>
