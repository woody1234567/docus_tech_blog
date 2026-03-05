---
title: Confusion Matrix（混淆矩陣）完整解析
description: 從直觀概念到實際應用，深入理解 Confusion Matrix 的結構、評估指標與在詐欺偵測中的重要性。
tags: [machine learning, classification, confusion matrix, evaluation metrics, data science]
category: machine_learning
date: 2026-03-05
---

## 為什麼需要 Confusion Matrix？

在機器學習的分類問題（classification problem）中，我們常常需要評估模型預測的好壞。最直覺的指標通常是 **Accuracy（準確率）**，也就是模型預測正確的比例。然而在許多實際應用中，例如金融詐欺偵測、醫療診斷或垃圾郵件分類，僅僅依賴 Accuracy 其實是遠遠不夠的。

舉例來說，在金融交易資料中，詐欺交易通常只占全部交易的一小部分，例如 1%。如果一個模型把所有交易都預測為「正常」，那麼它仍然可以達到 **99% 的 Accuracy**。乍看之下似乎非常準確，但實際上這個模型完全沒有抓出任何詐欺交易，對於風控系統而言幾乎沒有任何價值。

因此，在分類問題中，我們需要一個更細緻的工具來分析模型的預測結果。**Confusion Matrix（混淆矩陣）**正是最基本且最重要的評估工具之一，它能幫助我們理解模型的預測結果與真實結果之間的關係。

---

## Confusion Matrix 的核心概念

Confusion Matrix 是一個表格，用來統計模型的 **預測結果（Predicted Label）** 與 **真實結果（Actual Label）** 之間的交叉情況。之所以稱為「混淆矩陣」，是因為模型在預測時有可能會「混淆」不同類別。

假設我們正在建立一個 **金融詐欺偵測模型（fraud detection model）**。在這個問題中，交易可以分為兩種狀態：

| 真實情況 | 說明 |
|---|---|
| Fraud | 詐欺交易 |
| Normal | 正常交易 |

模型則會對每一筆交易做出預測：

| 預測結果 | 說明 |
|---|---|
| Fraud | 模型認為是詐欺 |
| Normal | 模型認為是正常交易 |

Confusion Matrix 的目的，就是把 **真實狀態與模型預測結果整理成一個結構化的表格**，讓我們可以清楚看出模型在哪些情況預測正確，在哪些情況出現錯誤。

---

## Confusion Matrix 的基本結構

在最常見的 **二分類問題（binary classification）** 中，Confusion Matrix 通常是以下結構：

| | Predicted Positive | Predicted Negative |
|---|---|---|
| Actual Positive | True Positive (TP) | False Negative (FN) |
| Actual Negative | False Positive (FP) | True Negative (TN) |

這個表格包含四種情況，每一種情況都描述了模型預測與真實結果之間的關係。

### True Positive（TP）

True Positive 代表模型成功預測出正確的 Positive 樣本。也就是說，樣本的真實狀態是 Positive，而模型也正確預測為 Positive。

例如在詐欺偵測中，如果一筆交易真的屬於詐欺，而模型也成功判定它是詐欺，那麼這筆交易就會被計入 TP。

這是一種 **正確的預測結果**。

---

### True Negative（TN）

True Negative 代表模型成功預測出 Negative 樣本。也就是說，樣本真實狀態是 Negative，模型也預測為 Negative。

例如一筆正常交易被模型正確判斷為正常，這就是 TN。

同樣地，這也是 **正確的預測結果**。

---

### False Positive（FP）

False Positive 指的是模型將 Negative 樣本誤判為 Positive。

例如：

- 一筆正常交易
- 被模型誤判為詐欺交易

這種情況在實務上常被稱為 **False Alarm（誤報）**。在金融服務中，這可能會導致使用者的信用卡被暫時鎖定或交易被拒絕，雖然不致命，但會影響使用體驗。

---

### False Negative（FN）

False Negative 則是另一種錯誤情況：模型將 Positive 樣本誤判為 Negative。

例如：

- 一筆詐欺交易
- 模型卻判斷為正常交易

在許多風險控制系統中，這是 **最嚴重的一種錯誤**，因為詐欺交易會直接造成金錢損失。因此在詐欺偵測或醫療診斷等應用中，通常會特別重視 FN 的數量。

---

## 一個簡單的 Confusion Matrix 範例

假設我們有 **100 筆金融交易資料**，其中：

- 20 筆是詐欺交易
- 80 筆是正常交易

模型預測結果如下：

| | Pred Fraud | Pred Normal |
|---|---|---|
| Actual Fraud | 15 | 5 |
| Actual Normal | 10 | 70 |

根據這個表格，我們可以得到：

- **TP = 15**（成功抓到的詐欺）
- **FN = 5**（漏掉的詐欺）
- **FP = 10**（誤判為詐欺的正常交易）
- **TN = 70**（正確判斷的正常交易）

透過 Confusion Matrix，我們不僅能知道模型整體表現，也能看出錯誤類型的分布。

---

## 為什麼 Confusion Matrix 非常重要？

Confusion Matrix 的重要性在於，它能揭露 **Accuracy 無法看出的問題**。

在許多實際場景中，例如詐欺偵測，資料通常高度不平衡（imbalanced data）。例如：

- 99% 是正常交易
- 1% 是詐欺交易

如果模型永遠預測「正常」，那麼：

```text
Accuracy = 99%
```

這看起來非常好，但實際上模型完全沒有偵測到任何詐欺。透過 Confusion Matrix，我們可以清楚看到：

- TP = 0
- FN = 所有詐欺交易

也就是說模型完全失敗。

因此，在資料不平衡的問題中，Confusion Matrix 是理解模型行為的核心工具。

---

## 從 Confusion Matrix 延伸的重要指標

許多常見的分類模型評估指標，其實都是從 **TP、FP、TN、FN** 這四個數字計算出來的。

### Accuracy

Accuracy 代表整體預測正確的比例：

$$
Accuracy = \frac{TP + TN}{TP + TN + FP + FN}
$$

它反映的是 **整體模型表現**，但在資料不平衡問題中通常不夠可靠。

---

### Precision

Precision 定義為：

$$
Precision = \frac{TP}{TP + FP}
$$

這個指標的意思是：

> 在所有被模型預測為 Positive 的樣本中，有多少是真正的 Positive。

在詐欺偵測問題中，Precision 可以理解為：

> 模型抓到的詐欺交易中，有多少是真的詐欺。

---

### Recall（Sensitivity）

Recall 定義為：

$$
Recall = \frac{TP}{TP + FN}
$$

Recall 描述的是：

> 在所有真正的 Positive 中，有多少被模型成功抓到。

在詐欺偵測中，Recall 可以理解為：

> 所有詐欺交易中，有多少被成功偵測出來。

---

### F1 Score

F1 Score 是 Precision 與 Recall 的調和平均：

$$
F1 = 2 \cdot \frac{Precision \cdot Recall}{Precision + Recall}
$$

F1 Score 的目的在於同時考慮 Precision 與 Recall，並在兩者之間取得平衡。

---

## 在金融詐欺偵測中的實務理解

不同應用場景，對於錯誤類型的容忍度不同。

例如在金融交易中：

| 錯誤類型 | 影響 |
|---|---|
| False Positive | 正常交易被誤判為詐欺 |
| False Negative | 詐欺交易沒有被偵測 |

在大多數金融風控系統中，**False Negative 的成本通常更高**，因為這代表詐欺交易成功通過系統。

因此在詐欺偵測或醫療診斷中，通常會更重視 **Recall**。相對地，在垃圾郵件分類等問題中，系統可能更重視 **Precision**，以避免正常郵件被錯誤分類為垃圾郵件。

---

## Python 中的 Confusion Matrix 範例

在 Python 中，可以使用 `sklearn` 快速計算 Confusion Matrix：

```python
from sklearn.metrics import confusion_matrix

y_true = [1,0,1,1,0,0,1]
y_pred = [1,0,1,0,0,1,1]

cm = confusion_matrix(y_true, y_pred)
print(cm)
```

輸出結果可能為：

```text
[[2 1]
 [1 3]]
```

這個矩陣的排列方式為：

```text
[[TN FP]
 [FN TP]]
```

因此可以解讀為：

- TN = 2
- FP = 1
- FN = 1
- TP = 3

---

## 如何快速記住 Confusion Matrix

一個簡單的記憶方式是：

| | Predicted Positive | Predicted Negative |
|---|---|---|
| Actual Positive | TP | FN |
| Actual Negative | FP | TN |

可以理解為：

- **橫軸：模型預測**
- **縱軸：真實標籤**

只要記住這個結構，就能快速理解各種分類評估指標的來源。

---

## 結論

Confusion Matrix 是所有分類模型評估方法的基礎。透過這個簡單的 2×2 表格，我們可以清楚分析模型的預測行為，並進一步計算出各種重要指標，例如 Precision、Recall、F1 Score、ROC 與 PR-AUC 等。

理解 Confusion Matrix 不只是機器學習入門的重要概念，也是在金融風控、醫療診斷與推薦系統等實務場景中，評估模型表現的核心工具。只要掌握 TP、FP、TN、FN 四個數字的意義，許多看似複雜的模型評估指標其實都只是它們的延伸計算。
