---
title: ROC-AUC 深入解析：理解分類模型的判斷能力
description: 介紹 ROC Curve 與 ROC-AUC 的概念、計算方式與實際應用，幫助理解分類模型在不同閾值下的表現。
tags: [machine learning, roc-auc, model evaluation, classification]
category: data-analysis
date: 2026-03-08
---

## 為什麼需要 ROC-AUC 來評估模型？

在機器學習的分類問題中，我們經常需要評估模型的預測能力。例如在金融詐欺偵測、信用風險評估或醫療診斷等情境中，模型會輸出一個「預測機率」，代表某筆資料屬於正類（positive class）的可能性。

最直覺的做法，是設定一個 **threshold（閾值）**。例如當模型預測詐欺機率大於 0.5 時，就判斷為詐欺交易。接著我們可以透過 **Accuracy、Precision、Recall** 等指標來評估模型的表現。

然而，這些指標都有一個共同限制：**它們都依賴於某一個固定的 threshold**。當 threshold 改變時，模型的 Precision 或 Recall 也會隨之改變，因此單一指標往往無法完整反映模型的整體能力。

ROC Curve 與 ROC-AUC 正是為了解決這個問題而提出的評估方法。它透過觀察 **模型在所有可能 threshold 下的表現**，來衡量模型區分不同類別的能力。這使得 ROC-AUC 成為分類問題中非常常見且重要的評估指標之一。

---

## ROC Curve 是什麼？

ROC 的全名是 **Receiver Operating Characteristic Curve**。這是一條描述模型在不同 threshold 下表現的曲線。

ROC Curve 的兩個座標軸分別是：

- **True Positive Rate (TPR)**
- **False Positive Rate (FPR)**

這兩個指標可以從 Confusion Matrix 推導出來。

### True Positive Rate（TPR）

TPR 也被稱為 **Recall 或 Sensitivity**，表示模型成功找出正類樣本的比例。

$$
TPR = \frac{TP}{TP + FN}
$$

其中：

- **TP (True Positive)**：正確預測為正類
- **FN (False Negative)**：錯誤預測為負類

直觀來說，TPR 代表：

> 所有真正的正類樣本中，有多少被模型成功找出。

### False Positive Rate（FPR）

FPR 則代表模型誤判負類的比例。

$$
FPR = \frac{FP}{FP + TN}
$$

其中：

- **FP (False Positive)**：錯誤預測為正類
- **TN (True Negative)**：正確預測為負類

換句話說，FPR 表示：

> 在所有實際為負類的資料中，有多少被模型錯誤判定為正類。

---

## ROC Curve 如何產生？

ROC Curve 的核心概念是：**改變模型的 threshold**。

假設一個模型輸出詐欺機率：

| Transaction | Fraud Probability |
|---|---|
| A | 0.92 |
| B | 0.81 |
| C | 0.63 |
| D | 0.40 |
| E | 0.22 |

如果 threshold = 0.5，則 A、B、C 會被判定為詐欺。

但如果 threshold = 0.7，則只有 A、B 會被判定為詐欺。

每一個 threshold 都會產生不同的 **TPR 與 FPR**。將這些點畫在平面座標上並連接起來，就形成了 **ROC Curve**。

因此 ROC Curve 的本質就是：

> 在所有可能 threshold 下，TPR 與 FPR 的變化關係。

---

## ROC-AUC 是什麼？

ROC-AUC 的全名是 **Area Under the ROC Curve**，也就是 ROC 曲線下的面積。

它的數值範圍介於：

$$
0 \le AUC \le 1
$$

不同 AUC 值代表的模型能力如下：

| AUC | 意義 |
|---|---|
| 0.5 | 與隨機猜測相同 |
| 0.6 – 0.7 | 表現普通 |
| 0.7 – 0.8 | 尚可 |
| 0.8 – 0.9 | 良好 |
| 0.9+ | 非常優秀 |

當 **AUC = 0.5** 時，ROC Curve 會接近一條對角線，表示模型幾乎沒有任何區分能力。

AUC 越接近 **1**，代表模型越能夠有效區分正類與負類。

---

## ROC-AUC 的直觀理解

ROC-AUC 其實可以用一個非常直覺的方式來理解：

> **AUC 表示模型隨機挑選一個正類樣本與一個負類樣本時，正類樣本被模型給出更高預測分數的機率。**

例如，假設有一筆詐欺交易與一筆正常交易。如果模型大部分時間都給詐欺交易 **更高的預測機率**，那麼 AUC 就會接近 1。

反過來說，如果模型經常把正常交易判定為更高機率的詐欺，那 AUC 就會低於 0.5。

因此 ROC-AUC 的本質，其實是在衡量：

> **模型對不同類別樣本的排序能力（ranking ability）。**

---

## ROC-AUC 的 Python 實作

在 Python 中，我們可以透過 `scikit-learn` 快速計算 ROC-AUC。

```python
from sklearn.metrics import roc_auc_score, roc_curve
import matplotlib.pyplot as plt

y_true = [0, 0, 1, 1]
y_score = [0.1, 0.4, 0.35, 0.8]

auc = roc_auc_score(y_true, y_score)
print("ROC-AUC:", auc)

fpr, tpr, _ = roc_curve(y_true, y_score)
plt.plot(fpr, tpr)
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.show()
```

這段程式碼會計算 ROC-AUC，並繪製出 ROC Curve，讓我們可以視覺化模型在不同 threshold 下的表現。

---

## ROC-AUC 的優點與限制

ROC-AUC 之所以被廣泛使用，是因為它具有幾個明顯優點。

首先，它**不依賴單一 threshold**，可以全面評估模型在不同 decision boundary 下的能力。其次，它能夠衡量模型對樣本的排序能力，而不是只看分類結果。

然而 ROC-AUC 也有一些限制。

在 **高度類別不平衡（imbalanced data）** 的情況下，例如詐欺偵測中，詐欺交易可能只佔全部資料的 0.1%。此時 ROC-AUC 有可能仍然維持在較高數值，但模型在實際偵測詐欺時卻未必有效。

因此在詐欺偵測、醫療診斷等問題中，研究者通常會同時觀察 **PR-AUC（Precision-Recall AUC）**，因為 PR-AUC 對於正類樣本更加敏感。

---

## 結論

ROC-AUC 是分類模型評估中最經典且重要的指標之一。它透過 ROC Curve 描述模型在不同 threshold 下的表現，並使用曲線下面積來衡量模型區分正類與負類的能力。

理解 ROC-AUC 的核心概念，可以幫助我們在建立機器學習模型時，更全面地評估模型表現，而不是只依賴單一 threshold 所得到的指標。在實際應用中，ROC-AUC 通常會與 Precision、Recall、PR-AUC 等指標一起使用，以更完整地了解模型的優缺點。

---

## 參考資料

1. Fawcett, T. (2006). *An introduction to ROC analysis*. Pattern Recognition Letters.
2. Scikit-learn Documentation – ROC metrics.
3. Provost, F., & Fawcett, T. (2013). *Data Science for Business*.
