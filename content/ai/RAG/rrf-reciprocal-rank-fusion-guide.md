---
title: Reciprocal Rank Fusion（RRF）教學：打造更穩定的檢索融合策略
description: 深入理解 RRF（Reciprocal Rank Fusion）如何結合多種檢索結果，提升搜尋與 RAG 系統的準確度與穩定性。
tags: [RRF, information retrieval, rag, search, ranking]
category: RAG
date: 2026-03-17
---

## 為什麼需要「多檢索融合」？

在現代搜尋系統或 RAG（Retrieval-Augmented Generation）架構中，我們很少只依賴單一檢索方法。常見的做法是同時使用：

- Dense Retrieval（語意向量）
- BM25（關鍵字匹配）
- Hybrid Search（混合策略）

這是因為不同檢索方法各自擅長的場景不同。例如，BM25 對關鍵字非常敏感，而 Dense Retrieval 則更擅長理解語意。但問題也隨之出現：

**當多個檢索結果同時存在時，我們該如何公平且有效地合併它們？**

這正是 Reciprocal Rank Fusion（RRF）要解決的核心問題。

---

## RRF 的核心概念

Reciprocal Rank Fusion 是一種非常簡單但效果強大的排名融合方法。它的核心想法是：

> **不要直接比較分數，而是根據排名位置來做融合。**

RRF 的公式如下：

```text
RRF_score(d) = Σ (1 / (k + rank_i(d)))
```

其中：

- `d`：文件（document）
- `rank_i(d)`：文件在第 i 個檢索結果中的排名（從 1 開始）
- `k`：一個平滑參數（通常設為 60）

---

## 用一個直覺的例子理解 RRF

假設我們有兩個檢索系統：

### BM25 排名

```text
1. A
2. B
3. C
```

### Dense Retrieval 排名

```text
1. B
2. C
3. D
```

我們來計算每個文件的 RRF 分數（假設 k = 60）：

- A：`1 / (60 + 1)`
- B：`1 / (60 + 2) + 1 / (60 + 1)`
- C：`1 / (60 + 3) + 1 / (60 + 2)`
- D：`1 / (60 + 3)`

可以發現：

**B 會得到最高分，因為它在兩個系統中都排名很前面。**

這正是 RRF 的核心優勢：

> **重視穩定出現在前段排名的結果，而不是單一系統的極端高分。**

---

## 為什麼 RRF 不用原始分數？

你可能會直覺想到：「那我直接把分數加起來不就好了？」

問題在於，不同檢索系統的分數**完全不可比較**：

- BM25 分數可能是 0~20
- Dense similarity 可能是 0~1
- Cross-encoder 甚至是另一種尺度

如果直接相加，結果會被某個模型主導，導致融合失效。

RRF 則完全避開這個問題：

> **它只看排名，不看分數。**

這讓它在 heterogeneous systems（異質模型）中非常穩定。

---

## RRF 在 RAG 系統中的角色

在實務的 RAG pipeline 中，RRF 通常會出現在這個位置：

```text
Query
├── Dense Retrieval
├── BM25 Retrieval
    ↓
RRF Fusion
    ↓
Reranker（Cross Encoder / LLM）
    ↓
LLM Answer
```

RRF 的角色可以理解為：

> **第一層候選集合整理器。**

它的任務不是找出最終答案，而是：

- 提供一個高 recall + 穩定的候選集合
- 讓後續 reranker 有更好的輸入

---

## RRF 的優點

### 1. 非常穩定

RRF 對 outlier（異常分數）不敏感，因為它不看分數。

### 2. 實作簡單

只需要排名，不需要 normalization。

### 3. 對多模型友善

可以輕鬆融合：

- BM25
- Dense Retrieval
- Metadata filter
- 多語言搜尋

### 4. 在學術與實務中效果良好

RRF 在多個 IR benchmark（如 TREC）中表現穩定，是業界常見方法。

---

## RRF 的限制

雖然 RRF 很強，但也不是萬能的。

### 1. 忽略分數資訊

有時候分數其實包含重要資訊，但 RRF 會完全忽略。

### 2. 無法學習權重

RRF 是 heuristic 方法，無法自動學習不同模型的重要性。

### 3. 對排名品質有依賴

如果某個 retrieval 完全亂排，仍然會影響結果。

---

## RRF + Reranker：最佳實務組合

在現代系統中，RRF 通常不會單獨使用，而是搭配 reranker：

- RRF：負責召回（recall）
- Reranker：負責精排（precision）

例如：

```python
def rrf_fusion(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)
```

接著再將 top-k 文件丟入 reranker（如 cross-encoder 或 LLM）。

這樣的設計可以同時兼顧：

- recall（找得到）
- precision（排得準）

---

## 一個更直覺的比喻

你可以把 RRF 想成投票系統：

- 每個 retrieval model 是一位評審
- 排名越前面，投票權重越高
- 多位評審都推薦的文件，得票最高

因此：

> **RRF 找的是共識，而不是單一最佳。**

---

## 結論

Reciprocal Rank Fusion（RRF）是一種簡單但極其實用的排名融合方法。它透過排名而非分數來整合多個檢索結果，能有效提升系統的穩定性與泛化能力。

在 RAG 系統中，RRF 幾乎是標準配置之一，特別適合用來結合 BM25 與 Dense Retrieval。當它與 reranker 搭配使用時，可以形成一條兼具高召回與高精度的檢索流程。

如果你正在設計搜尋系統或 RAG pipeline，RRF 會是一個**低成本但高回報**的關鍵組件。

---

## 參考資料

1. Cormack, G. V., Clarke, C. L. A., & Buettcher, S. (2009). *Reciprocal Rank Fusion outperforms Condorcet and individual rank learning methods*.
2. Manning, C. D. et al. *Introduction to Information Retrieval*.
3. BEIR Benchmark: <https://github.com/beir-cellar/beir>
