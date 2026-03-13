---
title: PR-AUC 深入解析：不平衡分類問題的重要評估指標
description: 了解 Precision-Recall Curve 與 PR-AUC 的概念、計算方式，以及為什麼在詐欺偵測與醫療診斷等不平衡資料問題中特別重要。
tags: [machine_learning, evaluation, pr_auc, classification, data_science]
category: data-analysis
date: 2026-03-07
---

## 為什麼需要新的模型評估指標？

在機器學習的分類問題中，我們常常需要評估模型預測結果的好壞。最直覺的方式可能是看 **Accuracy（準確率）**，也就是模型預測正確的比例。然而在許多真實世界的問題中，資料往往呈現**極度不平衡（imbalanced data）**的情況，此時 Accuracy 往往會失去參考價值。

例如在金融詐欺偵測中，假設 100 萬筆交易中只有 1000 筆是詐欺交易。如果一個模型直接把所有交易都預測為「正常交易」，那麼 Accuracy 仍然可以達到 99.9%。但這個模型其實完全沒有抓到任何詐欺交易，因此毫無實際價值。

因此，在這類問題中，我們更關注模型是否能 **有效找到少數的重要事件**。這時候，Precision、Recall，以及由兩者組成的 **Precision–Recall Curve** 就成為非常重要的評估工具，而 **PR-AUC** 正是用來衡量這條曲線表現的重要指標。

---

## Precision 與 Recall 的核心概念

PR-AUC 的基礎建立在兩個非常重要的指標上：**Precision（精確率）** 與 **Recall（召回率）**。

### Precision（精確率）

Precision 描述的是：**模型預測為正類時，其中有多少是真的正類**。

其公式為：

$$
Precision = \frac{TP}{TP + FP}
$$

其中：

- **TP（True Positive）**：預測為正類且實際為正類
- **FP（False Positive）**：預測為正類但實際為負類

舉例來說，如果模型預測 100 筆交易為詐欺，其中只有 60 筆真的為詐欺，那麼：

$$
Precision = 0.6
$$

這代表模型的預測中有 40% 是誤報。

### Recall（召回率）

Recall 描述的是：**所有真正的正類樣本中，有多少被模型成功找出來**。

公式為：

$$
Recall = \frac{TP}{TP + FN}
$$

其中：

- **FN（False Negative）**：實際為正類但模型預測為負類

如果資料中有 1000 筆詐欺交易，而模型只成功抓到 400 筆，那麼：

$$
Recall = 0.4
$$

這表示模型只找到了 40% 的詐欺交易。

---

## Precision–Recall Curve 是什麼？

在多數分類模型中，模型輸出的其實不是直接的類別，而是 **一個機率分數（probability score）**。例如模型可能預測某筆交易為詐欺的機率是 0.83。

為了將機率轉換成分類結果，我們需要設定一個 **threshold（閾值）**。例如：

- threshold = 0.5
- probability ≥ 0.5 → 預測為詐欺
- probability < 0.5 → 預測為正常

當我們改變 threshold 時，Precision 和 Recall 也會跟著改變。

例如：

| Threshold | Precision | Recall |
|---|---|---|
| 0.9 | 高 | 低 |
| 0.5 | 中 | 中 |
| 0.2 | 低 | 高 |

原因是：

- **提高 threshold** → 模型更保守 → Precision 上升，但 Recall 下降
- **降低 threshold** → 模型更寬鬆 → Recall 上升，但 Precision 下降

如果我們將不同 threshold 下的 **Recall 當作 X 軸，Precision 當作 Y 軸**，就可以畫出一條 **Precision–Recall Curve**。

---

## PR-AUC 是什麼？

PR-AUC（Precision-Recall Area Under Curve）指的是：

> **Precision–Recall Curve 下方的面積**

這個面積用來衡量模型在不同 threshold 下的整體表現。

PR-AUC 的值介於：

$$
0 \le PR\text{-}AUC \le 1
$$

一般來說：

- **PR-AUC 越接近 1 → 模型越好**
- **PR-AUC 越接近 0 → 模型越差**

PR-AUC 可以理解為：模型在不同 recall 水準下，能維持多高 precision 的整體能力。

---

## 為什麼 PR-AUC 特別適合不平衡資料？

PR-AUC 在 **正負樣本極度不平衡**的情境中特別重要，例如：

- 金融詐欺偵測
- 信用卡盜刷偵測
- 醫療疾病篩檢
- 垃圾郵件偵測

原因是 PR 曲線 **只專注於正類（positive class）的預測品質**。

在 ROC 曲線中，評估指標包含 **True Negative**，但在高度不平衡資料中，負樣本往往非常多，這會讓 ROC-AUC 看起來非常樂觀。

相反地，PR-AUC 更直接衡量：

- 找到多少真正的正類（Recall）
- 找到的正類有多少是準確的（Precision）

因此在詐欺偵測這類問題中，PR-AUC 往往比 ROC-AUC 更具有參考價值。

---

## Python 計算 PR-AUC 的實例

在 Python 中，我們可以透過 `sklearn` 非常方便地計算 PR-AUC。

```python
from sklearn.metrics import precision_recall_curve
from sklearn.metrics import auc
from sklearn.metrics import average_precision_score

y_true = [0, 0, 0, 1, 1, 1]
y_scores = [0.1, 0.4, 0.35, 0.8, 0.65, 0.9]

precision, recall, thresholds = precision_recall_curve(y_true, y_scores)
pr_auc = auc(recall, precision)

print("PR-AUC:", pr_auc)
```

另一種更常見的方式是使用：

```python
average_precision_score(y_true, y_scores)
```

這個指標稱為 **Average Precision (AP)**，在多數情況下與 PR-AUC 非常接近，因此在許多 Kaggle 競賽或研究中常被作為評估標準。

---

## PR-AUC 在實務中的應用

在實際應用中，PR-AUC 常常搭配其他指標一起使用，例如：

- **Precision@K**：在前 K 個預測結果中有多少是真的正類
- **Recall@FPR**：在某個假陽性率下的召回率
- **Confusion Matrix**：分析不同類型錯誤

在金融詐欺偵測系統中，一個常見的策略是：

1. 使用 PR-AUC 評估模型整體能力
2. 再根據實際業務需求設定 threshold
3. 控制誤報率（false positives）與漏報率（false negatives）

這樣才能在「抓到詐欺」與「避免誤報正常客戶」之間取得平衡。

---

## 結論

PR-AUC 是 Precision–Recall Curve 下方的面積，用來衡量模型在不同 threshold 下的整體表現。與 Accuracy 或 ROC-AUC 相比，PR-AUC 更適合用於 **正負樣本高度不平衡的分類問題**。

理解 Precision、Recall 與 PR Curve 的關係，可以幫助我們更深入理解模型在實際應用中的行為，並選擇更符合業務需求的評估方式。在金融詐欺偵測、醫療診斷或風險預測等領域中，PR-AUC 往往是比 Accuracy 更具價值的模型指標。

---

## 參考資料

1. Davis, J., & Goadrich, M. (2006). *The Relationship Between Precision-Recall and ROC Curves*.
2. scikit-learn documentation – Precision-Recall metrics.
3. Saito, T., & Rehmsmeier, M. (2015). *The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets*.
