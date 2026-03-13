---
title: Time-based Split：為什麼時間序列資料不能使用 Random Split？
description: 介紹 Time-based Split 的概念、為什麼時間資料不能隨機切分，以及如何避免未來資料洩漏（Future Data Leakage）。
tags: [machine learning, data science, time series, data leakage, model evaluation]
category: data-analysis
date: 2026-03-07
---

## 為什麼資料切分方式很重要？

在機器學習的模型訓練流程中，一個非常基本但關鍵的步驟就是 **資料切分（data splitting）**。

通常我們會將資料分成 **Training set（訓練資料）** 與 **Test set（測試資料）**，藉此評估模型在未見過資料上的表現。

在許多教學或範例中，你可能會看到類似下面的寫法：

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

這種方式稱為 **Random Split（隨機切分）**。

它會隨機抽取資料作為訓練集與測試集，在很多問題中確實是合理的做法。

然而，一旦資料具有 **時間順序（temporal order）**，例如：

* 金融交易紀錄
* 使用者行為資料
* IoT 感測資料
* 網站流量
* 股票價格

此時如果仍然使用 Random Split，模型評估就可能出現嚴重的問題。

這也是為什麼在時間相關的資料問題中，我們通常會使用 **Time-based Split**。

---

## 什麼是 Time-based Split？

**Time-based Split（時間切分）** 指的是依照資料發生的時間順序來切分資料，而不是隨機抽樣。

最基本的概念非常直覺：

> 使用「過去資料」訓練模型，並用「未來資料」進行測試。

例如，假設我們有一份交易資料：

| date | transaction_id | amount | label |
| ------- | -------------- | ------ | ----- |
| 2022-01 | T1 | 100 | 0 |
| 2022-02 | T2 | 200 | 0 |
| 2022-03 | T3 | 500 | 1 |
| 2022-04 | T4 | 150 | 0 |
| 2022-05 | T5 | 900 | 1 |

如果我們使用 **Time-based Split**，資料切分可能會像這樣：

```
Training set: 2022-01 ~ 2022-03
Test set: 2022-04 ~ 2022-05
```

換句話說：

```
過去 → 用來訓練模型
未來 → 用來評估模型
```

這樣的切分方式更符合真實世界中模型的使用情境。

---

## 為什麼不能使用 Random Split？

如果在時間資料中使用 Random Split，會產生一個常見問題：

**Future Data Leakage（未來資料洩漏）**

我們來看一個簡單的例子。

假設你的資料是：

```
2022-01 2022-02 2022-03 2022-04 2022-05
```

如果使用 Random Split，資料可能會變成：

```
Training set: 2022-01 2022-04 2022-05
Test set: 2022-02 2022-03
```

這代表一件非常不合理的事情：

模型在訓練時看到了 **2022-05 的資料**，
卻被要求預測 **2022-02 的資料**。

換句話說：

> 模型在訓練過程中已經看到了「未來」。

這種情況在真實世界中是不可能發生的，因此模型的評估結果會被 **嚴重高估（overly optimistic）**。

在金融詐欺偵測、信用風險評估、需求預測等問題中，這種錯誤可能會讓模型在離線測試時看起來非常準確，但實際部署後卻表現很差。

---

## Time-based Split 的實作方式

在 Python 中，最簡單的方式就是直接依照時間排序後切分資料。

```python
df = df.sort_values("date")

train_size = int(len(df) * 0.8)
train = df.iloc[:train_size]
test = df.iloc[train_size:]
```

這樣就可以確保：

```
train → 較早的資料
test → 較晚的資料
```

如果使用 **scikit-learn**，也可以使用專門為時間資料設計的工具：

```python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)

for train_index, test_index in tscv.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
```

`TimeSeriesSplit` 會模擬「模型隨時間不斷更新」的情境，因此在時間序列問題中非常常見。

---

## Rolling Window 與 Expanding Window

在實務中，Time-based Split 常常會搭配兩種訓練策略。

### Expanding Window

Expanding Window 指的是 **訓練資料會隨時間持續增加**。

例如：

```
Train: 2018
Test : 2019

Train: 2018–2019
Test : 2020

Train: 2018–2020
Test : 2021
```

這種方式模擬的是：

> 模型會不斷累積歷史資料進行重新訓練。

---

### Rolling Window

Rolling Window 則是 **訓練資料維持固定長度**。

例如：

```
Train: 2018–2019
Test : 2020

Train: 2019–2020
Test : 2021
```

這種方式通常用在：

* 市場環境快速變化
* 舊資料不再具有代表性

例如金融市場或使用者行為分析。

---

## Time-based Split 在金融資料中的重要性

在金融資料科學領域，例如：

* 信用卡詐欺偵測
* 反洗錢（AML）
* 信用風險模型
* 客戶流失預測

資料幾乎都具有強烈的 **時間依賴性**。

例如在詐欺偵測中：

* 詐欺模式會不斷改變
* 攻擊者策略會持續演化
* 新型詐欺手法會出現

如果模型在訓練時看到了未來資料，就會造成評估結果過於樂觀，進而導致模型在實際上線後無法有效偵測新的詐欺行為。

因此在金融風控領域中，**Time-based Split 幾乎是標準做法**。

---

## 結論

Time-based Split 是處理具有時間順序資料時最重要的資料切分方法之一。

與 Random Split 不同，它會依照資料的時間順序進行切分，確保模型只使用「過去資料」來預測「未來資料」。

這樣的設計可以有效避免 **Future Data Leakage（未來資料洩漏）**，並讓模型評估結果更接近真實世界的表現。

當你在處理金融交易、使用者行為或任何時間序列資料時，選擇正確的資料切分方式，往往比模型本身的複雜度還要重要。理解並正確使用 Time-based Split，能夠大幅提升機器學習模型評估的可靠性。

---

## 參考資料

1. Aurélien Géron, *Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow*, O’Reilly.
2. scikit-learn documentation – TimeSeriesSplit
3. Kuhn & Johnson, *Feature Engineering and Selection*, CRC Press.
