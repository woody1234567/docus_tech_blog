---
title: SHAP（SHapley Additive exPlanations）模型解釋方法深入解析
description: 介紹 SHAP 指標的原理、 Shapley value 的概念，以及如何在機器學習模型中解釋特徵對預測結果的影響。
tags: [machine learning, explainable ai, shap, model interpretation]
category: data-analysis
date: 2026-03-08
---

## 為什麼機器學習模型需要解釋？

在許多機器學習應用中，我們通常不只關心「模型預測是否準確」，還希望知道 **模型是如何做出決策的**。

例如在金融詐欺偵測、信用評分或醫療診斷等場景中，模型的預測結果往往會影響重要決策，因此必須能夠解釋。

舉例來說，如果一個模型判定某筆交易是「高風險詐欺交易」，我們通常會希望知道：

- 是因為 **交易金額太高**
- 還是因為 **交易頻率異常**
- 或者是 **帳戶之間的交易關係可疑**

傳統模型（例如 Linear Regression）通常比較容易解釋，因為每個變數都有明確的係數。但在像 **Random Forest、XGBoost、LightGBM** 這類複雜模型中，預測過程往往包含大量非線性關係，因此很難直接理解每個特徵的影響。

為了解決這個問題，研究者提出了 **SHAP（SHapley Additive exPlanations）**，用來解釋模型預測結果中各個特徵的貢獻。

---

## SHAP 的核心概念：Shapley Value

SHAP 的理論基礎來自 **賽局理論（Game Theory）** 中的 **Shapley Value** 概念。

Shapley Value 最早用於計算多人合作遊戲中，每個玩家對最終收益的「公平貢獻」。

假設有三個玩家共同合作完成任務，獲得 100 元報酬。問題是：**這 100 元應該如何公平分配給三個人？**

Shapley Value 的做法是：

1. 列舉所有玩家加入合作的順序
2. 計算每個玩家加入後所帶來的「邊際貢獻」
3. 對所有可能情況取平均

最後得到每個玩家的公平貢獻值。

在機器學習中，這個概念被轉換為：

| Game theory | Machine learning |
|---|---|
| 玩家 | 特徵（feature） |
| 總收益 | 模型預測值 |
| 玩家貢獻 | 特徵對預測的影響 |

換句話說，**SHAP value 就是衡量每個 feature 對模型預測結果的貢獻程度**。

---

## SHAP 如何解釋模型預測？

在 SHAP 框架中，一個模型預測可以被拆解為：

$$
Prediction = Base\ Value + \sum SHAP\ Value_i
$$

其中：

- **Base Value**：模型在整體資料上的平均預測
- **SHAP Value**：每個特徵對該筆預測的貢獻

舉例來說，假設一個詐欺偵測模型預測某筆交易的詐欺機率為 **0.72**。

模型的平均預測（Base Value）為 **0.10**，而各個特徵的 SHAP value 如下：

| Feature | SHAP value |
|---|---|
| transaction_amount | +0.35 |
| account_age | -0.08 |
| transaction_frequency | +0.20 |
| device_risk | +0.15 |

因此：

```text
Prediction = 0.10 + 0.35 - 0.08 + 0.20 + 0.15 = 0.72
```

這代表：

- **高交易金額** 大幅提高詐欺風險
- **帳戶年齡較長** 降低詐欺風險
- **交易頻率異常** 提高詐欺風險

透過 SHAP，我們就能清楚知道模型為何做出這個預測。

---

## SHAP 的三種常見視覺化

在實務上，SHAP 通常搭配視覺化圖表來幫助理解模型。

### 1. SHAP Summary Plot

Summary plot 可以同時呈現：

- 每個 feature 的重要性
- feature 值大小與預測影響方向

常見的圖形會像這樣：

- 每一列代表一個 feature
- 顏色表示 feature 值大小
- 橫軸表示 SHAP value

如果一個 feature 的 SHAP value 分布很廣，代表它對模型影響很大。

### 2. SHAP Dependence Plot

Dependence plot 用來觀察：

> **某個 feature 的數值如何影響預測結果**

例如：

```text
x 軸：transaction amount
y 軸：SHAP value
```

這樣可以觀察：

- 金額越高，SHAP value 是否越大
- 是否存在非線性關係

這對於理解模型行為非常有幫助。

### 3. SHAP Force Plot

Force plot 可以用來解釋 **單一預測結果**。

圖形通常會呈現：

- 紅色：增加預測值的特徵
- 藍色：降低預測值的特徵

例如：

```text
Base value → feature contributions → final prediction
```

這樣可以快速了解：**是哪些 feature 把預測推高或拉低。**

---

## Python 實作：使用 SHAP 解釋模型

以下是一個簡單的 Python 範例，示範如何使用 SHAP 解釋模型。

首先安裝套件：

```bash
pip install shap
```

接著訓練一個模型：

```python
import shap
import xgboost
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

model = xgboost.XGBClassifier()
model.fit(X_train, y_train)
```

接著計算 SHAP value：

```python
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
```

最後可以畫出 summary plot：

```python
shap.summary_plot(shap_values, X_test)
```

這張圖會顯示：

- 哪些 feature 對模型最重要
- feature 值如何影響預測結果

---

## SHAP 的優點

SHAP 之所以在資料科學與機器學習領域廣泛使用，主要有幾個原因。

首先，SHAP 具有 **理論基礎**。它建立在 Shapley Value 上，因此每個特徵的貢獻計算具有數學上的公平性。

其次，SHAP 可以同時提供 **global interpretation 與 local interpretation**：

- Global：整體模型的重要特徵
- Local：單一樣本的預測原因

最後，SHAP 與許多模型都可以搭配使用，包括：

- Tree models（XGBoost、LightGBM）
- Linear models
- Deep learning models

---

## SHAP 的限制

雖然 SHAP 非常強大，但仍然有一些限制。

首先，**計算成本較高**。

Shapley value 需要計算大量特徵組合，因此在特徵數量很多時，計算成本會變得很高。

其次，在 **高度相關的特徵（correlated features）** 情況下，SHAP 可能難以準確分配貢獻度。

此外，SHAP 解釋的是 **模型行為（model explanation）**，而不是 **真實因果關係（causality）**。

換句話說，SHAP 告訴我們模型是如何做出決策，但不代表特徵真的造成了這個結果。

---

## 結論

SHAP 是目前機器學習中最重要的模型解釋方法之一。它利用賽局理論中的 Shapley Value，將模型預測拆解為各個特徵的貢獻，使我們能夠理解複雜模型的決策過程。

透過 SHAP，我們不只可以知道模型是否準確，還可以理解 **哪些特徵在影響模型決策、影響方向是什麼、以及單一預測是如何形成的**。在金融風險管理、詐欺偵測、醫療 AI 等需要高度可解釋性的應用中，SHAP 已經成為非常重要的工具。

---

## 參考資料

1. Lundberg, Scott M., and Su-In Lee. "A Unified Approach to Interpreting Model Predictions." NeurIPS 2017.
2. SHAP 官方文件：<https://shap.readthedocs.io>
3. Molnar, Christoph. *Interpretable Machine Learning*.
