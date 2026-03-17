---
title: Dense Retrieval（向量檢索）深入解析
description: 從原理到實務應用，完整理解 Dense Retrieval 在現代搜尋與 RAG 系統中的角色與運作方式。
tags: [dense retrieval, embeddings, rag, vector search, nlp]
category: RAG
date: 2026-03-17
---

## 為什麼我們需要 Dense Retrieval？

在資訊檢索（Information Retrieval）的世界中，最早的做法大多是基於「關鍵字比對」，例如 TF-IDF 或 BM25。這類方法的核心邏輯很直覺：**只要 query 和文件中出現相同的詞，就認為它們相關**。

然而，這種方法存在一個根本問題：它只理解「字面」，卻不理解「語意」。

舉個簡單例子：

```text
Query：如何提升汽車燃油效率？
Document：如何讓你的車更省油？
```

對人類來說，這兩句話幾乎是同一件事，但因為「汽車 ≠ 車」、「燃油效率 ≠ 省油」，傳統 keyword-based 方法可能無法正確匹配。

這時候，Dense Retrieval 就登場了。

---

## Dense Retrieval 的核心概念

Dense Retrieval 的關鍵在於：**把文字轉換成向量（embedding），並用向量之間的距離來衡量語意相似度**。

與傳統方法不同，它不再關注「字有沒有出現」，而是關注「意思像不像」。

整體流程可以簡化成三個步驟：

1. 將文件（documents）轉換成向量
2. 將查詢（query）轉換成向量
3. 計算向量之間的相似度（例如 cosine similarity）

在這個架構下，上面的例子會被 embedding 模型轉成語意相近的向量，因此能成功匹配。

---

## Dense Retrieval 的運作流程

### 1. Embedding：把文字變成向量

Dense Retrieval 的第一步，是透過模型（通常是 Transformer-based 模型）將文字轉成固定長度的向量，例如：

```text
"如何讓車更省油" → [0.12, -0.98, 0.33, ...]
```

這個向量其實是一種「語意壓縮表示」，會保留句子的語意資訊。

常見模型包括：

- BERT-based models
- Sentence Transformers（如 all-MiniLM）
- OpenAI embedding models
- BGE 系列（如 bge-base, bge-large）

### 2. 建立向量資料庫（Vector Database）

當所有文件都被轉成向量後，我們會把它們存進向量資料庫，例如：

- FAISS
- Chroma
- Milvus
- Weaviate

這些資料庫支援 **高效的相似度搜尋（ANN, Approximate Nearest Neighbor）**，可以在大量資料中快速找到最相似的向量。

### 3. Query Retrieval：相似度搜尋

當使用者輸入 query 時：

1. 將 query 轉成向量
2. 與資料庫中的向量做相似度比較
3. 取出 Top-K 最相似的文件

常見的相似度計算方式包括：

- Cosine similarity
- Dot product
- Euclidean distance

---

## 為什麼 Dense Retrieval 在 RAG 中很重要？

在 RAG（Retrieval-Augmented Generation）系統中，Retrieval 的品質會直接影響最終答案。

Dense Retrieval 的優勢在於：

### 1. 能理解語意（Semantic Search）

不像 BM25 只看字詞，Dense Retrieval 能理解語意關聯，因此：

- 可以處理同義詞
- 可以理解句子結構
- 對自然語言 query 更友善

### 2. 適合長文本與自然語言問題

在 RAG 系統中，使用者通常會問完整句子，而不是關鍵字，例如：

```text
公司什麼時候上市？
```

Dense Retrieval 可以更好地理解這類 query，而不是只抓「上市」這個詞。

### 3. 與 LLM 天然相容

因為 LLM 本身也是基於 embedding 的語意空間，Dense Retrieval 可以更自然地與生成模型搭配：

```text
Query → Dense Retrieval → Top-K Documents → LLM
```

這樣可以大幅提升答案的正確性與可解釋性。

---

## Dense Retrieval 的限制

雖然 Dense Retrieval 很強，但它並不是萬能的。

### 1. 計算成本高

- embedding 模型推論成本較高
- 建立向量資料庫需要額外資源

### 2. 對精確匹配不友善

Dense Retrieval 有時會忽略「關鍵字精確匹配」，例如：

- 法條編號
- 型號（iPhone 15 vs iPhone 14）
- 數字

這種情況下，BM25 反而更可靠。

### 3. 需要良好的 chunking 策略

如果文件切得不好（太長或太短），會影響 embedding 的品質，進而影響 retrieval 效果。

---

## Hybrid Retrieval：最佳實務做法

在實務上，很少只用 Dense Retrieval，通常會搭配 BM25，形成 **Hybrid Search**：

```text
Query
├─ BM25（keyword match）
└─ Dense Retrieval（semantic match）
    ↓
Fusion（例如 RRF）
    ↓
Reranker（cross-encoder）
```

這樣可以同時兼顧：

- 關鍵字精準度
- 語意理解能力

是目前 RAG 系統中最主流的設計。

---

## 一個簡單的 Python 範例

以下示範如何使用 `sentence-transformers` 進行簡單的 Dense Retrieval：

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 載入模型
model = SentenceTransformer("all-MiniLM-L6-v2")

documents = [
    "如何讓車更省油",
    "Python 教學入門",
    "如何投資股票"
]

# 建立 document embeddings
doc_embeddings = model.encode(documents)

# Query
query = "如何提升汽車燃油效率"
query_embedding = model.encode([query])

# 計算相似度
scores = cosine_similarity(query_embedding, doc_embeddings)[0]

# 找最相似文件
best_idx = scores.argmax()
print(documents[best_idx])
```

這段程式碼的核心就是：**用語意相似度取代關鍵字比對**。

---

## Dense Retrieval 在現代 AI 系統中的角色

如果用一個更高層的角度來看：

- BM25：負責字面搜尋
- Dense Retrieval：負責語意搜尋
- Reranker：負責精細排序
- LLM：負責生成答案

Dense Retrieval 正好位於「理解問題」與「找到資料」之間，是整個系統的關鍵橋樑。

---

## 結論

Dense Retrieval 是現代搜尋與 RAG 系統的核心技術之一。透過 embedding 與向量相似度，它讓系統能夠理解語意，而不只是比對字詞。

然而，在實務應用中，Dense Retrieval 通常不會單獨使用，而是與 BM25、Reranker 等技術結合，形成一套完整的檢索架構。

當你理解 Dense Retrieval 的運作方式後，你會發現：**搜尋這件事，早就不只是找關鍵字，而是理解語意的問題。**
