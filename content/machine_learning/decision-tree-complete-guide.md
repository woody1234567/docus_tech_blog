---
title: Decision Tree 模型完整教學：從原理到 Python 實作
description: 深入了解 Decision Tree（決策樹）的運作原理，包含模型結構、純度指標、實際案例與 Python 實作，幫助你掌握最經典的機器學習模型之一。
tags: [machine_learning, decision_tree, classification, tree_model]
category: machine_learning
date: 2026-03-08
---

## Decision Tree 是什麼？

Decision Tree（決策樹）是一種常見的 **Tree-based model（樹模型）**，廣泛應用於分類（classification）與回歸（regression）問題中。它的核心概念非常直覺：模型會透過一連串的條件判斷，把資料逐步切分，最後形成一棵樹狀結構。

在模型訓練的過程中，Decision Tree 會不斷進行以下動作：首先選擇一個最適合的特徵（feature）作為分裂條件；接著依照這個條件將資料分成不同群組；然後在每個群組中重複同樣的過程。隨著不斷分裂，最終會形成一棵完整的決策樹。

這棵樹的邏輯其實非常接近我們日常寫程式時使用的 `if-else` 判斷。例如，一個簡單的決策流程可能像這樣：

```text
Age < 30?
├─ Yes → Income < 50k?
│  ├─ Yes → Buy
│  └─ No  → No Buy
└─ No  → Buy
```

這個決策過程可以理解為：

1. 先判斷「年齡是否小於 30」
2. 如果是，再檢查收入
3. 如果不是，則直接做出預測

因此，Decision Tree 本質上就是一組自動學習出來的 **if-else 規則集合**。

---

## Decision Tree 的基本結構

一棵 Decision Tree 通常由三種類型的節點組成：根節點（Root Node）、內部節點（Internal Node）以及葉節點（Leaf Node）。理解這三種節點的角色，可以幫助我們更清楚掌握整個模型的運作方式。

### Root Node（根節點）

根節點是整棵樹的起點，也是模型做出的第一個分裂決策。這個節點會選擇一個最具區分能力的特徵來分割資料。例如：

```text
Age < 30
```

這個條件會把資料分成兩群：符合條件與不符合條件。

### Internal Node（內部節點）

內部節點位於樹的中間，負責進一步細分資料。每個節點都會包含一個判斷條件，例如：

```text
Income < 50000
```

透過這樣的條件判斷，資料會被持續分割成更小、更純的群組。

### Leaf Node（葉節點）

葉節點是樹的終點，也就是模型的最終預測結果。例如在分類問題中，葉節點可能代表：

```text
Fraud
Not Fraud
```

當一筆資料走到某個葉節點時，模型就會輸出該節點所代表的預測結果。

---

## 實際案例：信用卡詐欺偵測

為了更直觀地理解 Decision Tree 的運作方式，我們可以看一個簡化的金融詐欺偵測案例。假設銀行希望判斷每一筆交易是否為詐欺交易，資料可能包含以下欄位：

| Amount | Country | Night Transaction | Fraud |
|---|---|---|---|
| 5000 | US | Yes | Yes |
| 20 | US | No | No |
| 3000 | China | Yes | Yes |
| 15 | US | No | No |
| 2000 | Russia | Yes | Yes |

在訓練過程中，Decision Tree 可能學到以下的決策結構：

```text
Transaction Amount > 1000 ?
├─ Yes → Night transaction?
│  ├─ Yes → Fraud
│  └─ No  → Not Fraud
└─ No  → Not Fraud
```

這棵樹代表的邏輯是：

- 如果交易金額小於 1000，模型通常會判斷為正常交易
- 如果交易金額大於 1000，模型會進一步檢查是否為夜間交易
- 若同時滿足高金額與夜間交易，則該交易很可能是詐欺

透過這樣的層層判斷，Decision Tree 可以逐步將不同類型的交易區分開來。

---

## Decision Tree 如何決定分裂方式？

一個重要問題是：模型如何知道應該先用哪個特徵來分裂資料？例如為什麼先使用交易金額，而不是交易國家？

Decision Tree 的答案是透過 **資料純度（purity）指標** 來決定最佳分裂方式。模型會嘗試不同的切分方法，並選擇能讓資料「最純」的那個。

常見的純度指標包含 **Gini Impurity** 與 **Entropy**。

### Gini Impurity

Gini Impurity 是最常見的決策樹分裂指標，其公式為：

$$
Gini = 1 - \sum p_i^2
$$

其中 $p_i$ 代表某個類別在節點中的比例。如果一個節點中的資料幾乎全部屬於同一個類別，那麼 Gini 值就會非常小，代表節點非常純。

在訓練過程中，Decision Tree 會選擇能 **最大程度降低 Gini 值** 的分裂方式。

### Entropy 與 Information Gain

另一種常見方法是 Entropy，其公式為：

$$
Entropy = -\sum p_i \log(p_i)
$$

Entropy 代表資料的不確定性。當資料越混亂時，Entropy 越高；當資料越純時，Entropy 越低。

Decision Tree 會計算分裂前後的 Entropy 差異，這個差異稱為 **Information Gain（資訊增益）**。模型會選擇 Information Gain 最大的分裂方式。

---

## Decision Tree 的訓練流程

Decision Tree 的訓練過程可以簡化為以下步驟：

```text
Step 1: 選擇最佳 feature
Step 2: 用這個 feature 分裂資料
Step 3: 對每個子節點重複
Step 4: 直到滿足停止條件
```

模型會持續分裂資料，直到達到某些停止條件，例如：

- 樹的深度已達上限
- 節點樣本數過少
- 節點中的資料已完全純化

當停止條件成立時，該節點就會成為葉節點。

---

## Python 實際範例

在 Python 中，可以透過 `scikit-learn` 快速建立 Decision Tree 模型。以下示範使用經典的 Iris 資料集。

### 建立模型

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris

data = load_iris()
X = data.data
y = data.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = DecisionTreeClassifier(max_depth=3)
model.fit(X_train, y_train)
pred = model.predict(X_test)
```

在這個例子中，我們建立了一棵最大深度為 3 的決策樹模型，並使用訓練資料進行訓練。

### 視覺化 Decision Tree

`scikit-learn` 也提供了視覺化工具，可以將訓練好的樹結構畫出來。

```python
from sklearn.tree import plot_tree
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plot_tree(model, feature_names=data.feature_names)
plt.show()
```

畫出的決策樹可能會像這樣：

```text
petal length < 2.5 ?
├─ Yes → Setosa
└─ No  → petal width < 1.8 ?
```

透過視覺化，我們可以清楚看到模型的決策流程。

---

## 為什麼 Tree Model 在 Tabular Data 上表現很好？

在許多表格型資料（tabular data）的任務中，Tree-based model 往往能取得非常好的效果。原因包含以下幾點：

- 不需要進行 feature scaling
- 可以自然處理 **非線性關係（non-linear relationships）**
- 能自動學習 **feature interaction**
- 對類別變數相對友善

例如以下規則：

```text
if income > 50000 AND age < 30
```

這樣的條件在真實世界中很常見，但線性模型通常較難直接捕捉。

---

## Decision Tree 的缺點

雖然 Decision Tree 非常直覺且容易理解，但它也有一些限制。

### 1) 容易 overfitting

如果不限制樹的成長，模型可能會不斷分裂資料，甚至記住每一筆訓練資料。例如：

```text
Age < 30
Age < 29
Age < 28
```

這會導致模型在訓練資料上表現很好，但在新資料上表現很差。因此通常會透過以下方法控制模型複雜度：

- `max_depth`
- `min_samples_leaf`
- pruning（剪枝）

### 2) 模型不穩定（high variance）

當訓練資料稍微改變時，整棵樹的結構可能完全不同。

---

## Tree Model 的進化版本

Decision Tree 是許多強大機器學習模型的基礎。為了解決單棵樹的缺點，研究者發展出多種改進方法。

最常見的包括：

- **Random Forest**：透過建立多棵 Decision Tree 並進行投票來提高穩定性
- **Gradient Boosting Decision Tree（GBDT）**：讓每一棵新樹專門修正前一棵樹的錯誤

在實務應用中，GBDT 又進一步發展出多個高效版本，例如 **XGBoost** 與 **LightGBM**，在許多資料科學競賽與任務中都表現非常出色。

---

## 總結

Decision Tree 是一種非常直觀且易於解釋的機器學習模型。它透過不斷選擇最佳特徵來分裂資料，最終形成一棵由多個條件判斷組成的決策樹。每條從根節點到葉節點的路徑，其實都代表了一組清楚的 if-else 規則。

簡單來說，Decision Tree 的核心概念可以用一句話概括：

> Decision Tree 本質上就是一個自動學習規則的系統，它會從資料中找出一連串最有效的 if-else 判斷，並用這些規則來進行預測。

理解 Decision Tree 的運作原理，不僅能幫助我們掌握基礎機器學習模型，也能為後續學習 Random Forest、XGBoost 與 LightGBM 等進階模型打下良好的基礎。

---

## 參考資料

1. Hastie, Tibshirani, Friedman. *The Elements of Statistical Learning*.
2. scikit-learn Documentation – Decision Trees.
3. Bishop, C. *Pattern Recognition and Machine Learning*.
