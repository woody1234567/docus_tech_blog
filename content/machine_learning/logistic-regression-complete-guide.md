---
title: Logistic Regression（Logit 回歸）完整教學
description: 從直觀概念到數學公式，深入理解 Logistic Regression 的原理，並透過實際案例了解它在分類問題中的應用。
tags: [machine learning, logistic regression, classification, statistics, data science]
category: machine_learning
date: 2026-03-08
---

## 為什麼需要 Logistic Regression？

在機器學習與統計建模中，我們經常需要解決**分類問題（classification problem）**。例如：

- 銀行是否應該核准貸款？
- 一筆交易是否為詐欺？
- 電子郵件是否為垃圾郵件？
- 病人是否患有某種疾病？

在這些問題中，預測結果通常只有兩種，例如 **Yes / No、Fraud / Normal、Spam / Not Spam**。

這類問題被稱為 **Binary Classification（二元分類）**。

一開始很多人會想：既然 Linear Regression 可以預測數值，那能不能直接用線性回歸來預測分類？例如：

$$
y = \beta_0 + \beta_1 x
$$

但這會產生一個問題：**Linear Regression 的輸出範圍是 $(-\infty, +\infty)$，而分類問題通常需要的是 0 到 1 之間的機率**。

例如我們希望得到：

```text
詐欺機率 = 0.87
```

而不是：

```text
詐欺機率 = 2.3
```

為了解決這個問題，就誕生了 **Logistic Regression（Logit Regression）**。

---

## Logistic Regression 的核心概念

Logistic Regression 的核心想法其實非常簡單：

> 先用線性模型計算一個分數，再透過一個函數把它轉換成 0 到 1 的機率。

這個轉換函數就是 **Sigmoid Function（S 型函數）**：

$$
\sigma(z) = \frac{1}{1 + e^{-z}}
$$

其中：

$$
z = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... + \beta_n x_n
$$

因此 Logistic Regression 的完整模型可以寫成：

$$
P(y=1|x) = \frac{1}{1 + e^{-(\beta_0 + \beta_1x_1 + ... + \beta_nx_n)}}
$$

這個函數有一個非常重要的特性：

- 輸出值永遠介於 **0 和 1 之間**
- 可以解釋為 **某事件發生的機率**

---

## 為什麼叫做 Logit Regression？

Logistic Regression 的名稱其實來自 **logit function**。

如果把機率 $p$ 轉換為 **odds（勝算比）**：

$$
odds = \frac{p}{1-p}
$$

再取對數，就會得到 **logit**：

$$
logit(p) = \log\left(\frac{p}{1-p}\right)
$$

Logistic Regression 的本質其實是：

$$
\log\left(\frac{p}{1-p}\right) = \beta_0 + \beta_1x_1 + ... + \beta_nx_n
$$

也就是說：

> **Logistic Regression 是對 odds 的 log 進行線性建模。**

這也是為什麼在統計學中，它常被稱為 **Logit Model**。[1]

---

## Sigmoid Function 的直觀理解

Sigmoid 函數的形狀是一條 **S 型曲線**。

當輸入 $z$ 非常小時：

```text
z → -∞
σ(z) → 0
```

當輸入 $z$ 非常大時：

```text
z → +∞
σ(z) → 1
```

因此無論線性模型的輸出是多少，最終都會被壓縮到 **0 到 1 之間**，這正好符合機率的需求。

---

## 一個金融詐欺偵測的實例

假設我們正在建立一個 **金融詐欺偵測模型**，並且使用以下兩個特徵：

- `transaction_amount`（交易金額）
- `num_transactions_24h`（24 小時交易次數）

模型可能會學到以下公式：

$$
z = -5 + 0.004 \times amount + 0.6 \times transactions
$$

接著透過 Sigmoid 函數轉換為詐欺機率。

假設某筆交易：

```text
amount = 800
transactions = 5
```

先計算：

```text
z = -5 + 0.004 × 800 + 0.6 × 5
z = -5 + 3.2 + 3
z = 1.2
```

接著計算 Sigmoid：

$$
p = \frac{1}{1 + e^{-1.2}} \approx 0.77
$$

得到結果：

```text
詐欺機率 = 77%
```

如果我們設定分類 threshold 為 **0.5**：

```text
p > 0.5  → Fraud
p ≤ 0.5  → Normal
```

那這筆交易就會被模型判定為 **Fraud**。

---

## Python 實作 Logistic Regression

在實務中，我們通常會使用 `scikit-learn` 來建立 Logistic Regression 模型。以下是一個簡單範例：

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 假設 X 為特徵資料
# y 為是否詐欺 (0 / 1)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LogisticRegression()
model.fit(X_train, y_train)

pred = model.predict(X_test)
print(classification_report(y_test, pred))
```

如果想要取得**預測機率**，可以使用：

```python
model.predict_proba(X_test)
```

輸出會是：

```text
[[0.82, 0.18], [0.25, 0.75], ...]
```

其中：

```text
[Normal 機率, Fraud 機率]
```

---

## Logistic Regression 的優點

Logistic Regression 在資料科學與金融領域非常常見，原因包括：

### 1) 可解釋性高

模型係數可以直接解釋：

```text
feature 增加 → odds 增加或減少
```

這對金融風控模型非常重要。

### 2) 訓練速度快

相比於複雜模型（例如 Neural Network），Logistic Regression 訓練成本非常低。

### 3) 不容易過度擬合

在資料量不是很大的情況下，Logistic Regression 通常能維持穩定表現。

---

## Logistic Regression 的限制

雖然 Logistic Regression 非常實用，但仍然存在一些限制：

### 1) 假設線性關係

模型假設：

```text
log odds 與特徵是線性關係
```

如果資料是高度非線性的，效果可能會變差。

### 2) 不擅長複雜特徵互動

與 Tree-based model（如 XGBoost、LightGBM）相比，Logistic Regression 很難捕捉複雜特徵互動。

因此在 **tabular data 任務**中，GBDT 模型常常會有更好的表現。

---

## Logistic Regression 在實務中的角色

即使現在有很多強大的模型，例如：

- Random Forest
- XGBoost
- LightGBM
- Deep Neural Network

Logistic Regression 仍然被廣泛使用，尤其在以下情境：

- **信用評分模型（Credit Scoring）**
- **詐欺偵測（Fraud Detection）**
- **醫療風險預測**
- **A/B Testing 分析**

原因在於：

> **Logistic Regression 的可解釋性與穩定性，在許多產業仍然非常重要。**

---

## 結論

Logistic Regression 是機器學習中最經典的分類模型之一。它的核心概念是先建立一個線性模型，再透過 Sigmoid 函數將輸出轉換為機率。由於其可解釋性高、訓練速度快且數學結構清晰，因此在金融風控、醫療預測與各類分類問題中都被廣泛使用。

理解 Logistic Regression 不僅能幫助我們掌握分類模型的基本原理，也能為後續學習更複雜的模型（如 GBDT 或 Deep Learning）建立扎實的基礎。

---

## 參考資料

1. James, G., Witten, D., Hastie, T., & Tibshirani, R. *An Introduction to Statistical Learning*. Springer.
2. Bishop, C. *Pattern Recognition and Machine Learning*. Springer.
3. Scikit-learn Documentation – Logistic Regression: <https://scikit-learn.org/stable/modules/linear_model.html>
