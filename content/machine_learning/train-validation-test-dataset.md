---
title: 為什麼模型訓練需要 Train / Validation / Test Dataset？
description: 了解機器學習中資料切分的重要性，說明 Train、Validation 與 Test dataset 各自的角色與避免資料洩漏的方法。
tags: [machine_learning, data_science, model_evaluation, dataset_split]
category: machine_learning
date: 2026-03-07
---

## 為什麼機器學習需要將資料切分？

在機器學習的流程中，一個常見且非常重要的步驟，就是將資料切分成 **Train、Validation 與 Test 三種不同的資料集**。

這樣做的目的，是為了確保模型在訓練時不會「過度記住資料」，而是能真正學會資料中的規律，並在未見過的新資料上依然保持良好的表現。

如果所有資料都直接拿來訓練模型，模型可能會產生一個問題：**Overfitting（過度擬合）**。這代表模型只是在記憶訓練資料，而不是學習到可以泛化到新資料的模式。當模型遇到新的資料時，表現就會大幅下降。

因此，在資料科學與機器學習中，通常會將資料切分為三個不同用途的集合：

- Train dataset
- Validation dataset
- Test dataset

這三種資料集各自扮演不同角色，共同確保模型訓練的可靠性。

---

## Train Dataset：模型學習的來源

**Train dataset（訓練資料）** 是用來讓模型真正學習資料模式的資料集。

在訓練過程中，模型會透過這些資料來調整內部參數。例如在一個分類問題中，模型會觀察每一筆資料的特徵（features）與對應的標籤（label），然後透過優化演算法（如 Gradient Descent）不斷更新模型參數，使預測結果越來越接近真實標籤。

例如在 **金融詐欺偵測（Fraud Detection）** 的問題中，Train dataset 可能包含：

| Transaction Amount | Location | Device | Label |
|---|---|---|---|
| 1000 | Taiwan | Mobile | Fraud |
| 50 | Taiwan | Desktop | Normal |

模型會透過大量類似的資料，學習哪些特徵可能代表詐欺交易。

需要注意的是，**Train dataset 的目標是學習模型參數，而不是評估模型好壞**。如果我們只看訓練資料上的表現，模型往往會看起來非常好，但這並不代表它在真實世界中也會表現良好。

---

## Validation Dataset：模型調整與選擇

**Validation dataset（驗證資料）** 的主要用途是用來調整模型與選擇最佳設定。

在模型訓練過程中，我們通常會有許多需要決定的設定，例如：

- Tree model 的最大深度
- Learning rate
- Regularization strength
- 神經網路的層數與節點數

這些設定被稱為 **hyperparameters（超參數）**。

Validation dataset 的作用，就是在不同模型設定之間進行比較，找出表現最好的組合。

例如：

| Model | Max Depth | Validation AUC |
|---|---|---|
| Model A | 3 | 0.81 |
| Model B | 6 | 0.86 |
| Model C | 10 | 0.83 |

透過 validation dataset，我們可以選擇 **Max Depth = 6** 的模型。

需要注意的是，如果我們反覆根據 validation dataset 調整模型，模型其實已經「間接學習到 validation dataset」。因此 validation dataset 並不能作為最終模型表現的評估標準。

---

## Test Dataset：最終的模型評估

**Test dataset（測試資料）** 是用來做模型最終評估的資料。

這一組資料在整個模型開發過程中 **完全不能被使用於訓練或調整模型**。

它的存在目的，是模擬模型在真實世界中遇到「從未見過的資料」時的表現。

當模型訓練完成並且選定最佳設定後，我們才會在 Test dataset 上進行一次評估，例如計算：

- Accuracy
- ROC-AUC
- PR-AUC
- Precision / Recall

例如：

| Dataset | ROC-AUC |
|---|---|
| Train | 0.95 |
| Validation | 0.87 |
| Test | 0.86 |

如果 Test dataset 的表現與 Validation dataset 相近，通常代表模型具有良好的泛化能力。

---

## 如果沒有 Validation 或 Test 會發生什麼事？

如果我們只使用 Train dataset，可能會發生兩個問題。

第一個問題是 **模型選擇偏差（model selection bias）**。

如果沒有 validation dataset，我們就沒有一個客觀標準來比較不同模型設定，容易選到在訓練資料上表現很好，但實際上泛化能力很差的模型。

第二個問題是 **評估過於樂觀（overly optimistic evaluation）**。

如果我們在訓練資料上評估模型，結果通常會高估模型的表現，因為模型已經「看過」這些資料。

因此在實務上，資料通常會按照以下比例切分：

- Train：70% ~ 80%
- Validation：10% ~ 15%
- Test：10% ~ 15%

在資料量較小的情況下，也可能使用 **Cross Validation（交叉驗證）** 來替代固定的 validation dataset。

---

## 一個直觀的比喻

可以用「考試準備」來理解三種資料集的角色。

- **Train dataset**：平時做的練習題，用來學習知識。
- **Validation dataset**：模擬考，用來檢查自己是否準備好，並調整讀書策略。
- **Test dataset**：正式考試，用來評估真正的能力。

如果你在模擬考後知道題目並重新背答案，那模擬考就不再是有效的評估工具。因此，正式考試必須是完全沒有看過的題目。

---

## 結論

在機器學習中，將資料切分為 **Train、Validation 與 Test dataset** 是確保模型可靠性的重要步驟。Train dataset 用來讓模型學習資料中的模式，Validation dataset 用來調整模型與選擇最佳設定，而 Test dataset 則負責提供最客觀的最終評估。

透過這樣的資料切分方式，可以有效避免過度擬合與評估偏差，確保模型在真實世界中的表現更加可信。
