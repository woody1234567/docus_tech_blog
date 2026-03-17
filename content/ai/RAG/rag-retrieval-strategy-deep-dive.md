---
title: RAG Retrieval Strategy 深入解析
description: 從 BM25、Dense Retrieval 到 Hybrid 與 Reranker，完整理解 RAG 系統中的檢索策略與其對模型品質的影響。
tags: [rag, retrieval, bm25, vector-search, llm, ai]
category: RAG
date: 2026-03-13
---

## 為什麼 Retrieval 是 RAG 系統的核心

在 **Retrieval-Augmented Generation（RAG）** 架構中，整個系統的表現往往取決於「檢索階段（Retrieval）」的品質。雖然生成模型（LLM）負責最後的回答，但如果提供給模型的 context 文件品質不佳，即使是再強大的語言模型也無法生成正確答案。

這也是為什麼在許多實務系統中，工程師會花大量時間優化 **retrieval strategy**。從最早的 **BM25 keyword search**，逐漸演進到 **Dense Retrieval**，再到目前主流的 **Hybrid Retrieval + Reranker 架構**。這些技術的核心目的都是相同的：盡可能找到最相關的文件，讓 LLM 能基於正確的資訊進行回答。

換句話說，在 RAG 系統中可以把流程簡化為一句話：

> **Garbage in, garbage out** —— 如果檢索到的內容品質差，生成結果幾乎不可能正確。

---

## RAG Retrieval 的整體架構

在多數 production 等級的 RAG 系統中，retrieval pipeline 通常會包含多個階段，而不是單一搜尋方法。典型架構如下：

```text
User Query
   │
   ▼
Query Embedding
   │
   ▼
Retrieval Layer
├─ Sparse Retrieval (BM25)
├─ Dense Retrieval
└─ Hybrid Retrieval
   │
   ▼
Reranker (Cross Encoder / LLM)
   │
   ▼
Top-K Relevant Documents
   │
   ▼
LLM Generation
   │
   ▼
Final Answer
```

在這個架構中，每一層都有不同的角色：

- **Sparse retrieval**：負責精確關鍵字搜尋
- **Dense retrieval**：負責語意搜尋
- **Hybrid retrieval**：整合兩者結果
- **Reranker**：進一步提升排序品質

透過這樣的分層設計，可以在 **速度、召回率（recall）與精確度（precision）之間取得平衡**。

---

## Sparse Retrieval：BM25 與關鍵字搜尋

最早期、也是最經典的資訊檢索方法，是 **Sparse Retrieval**。這類方法主要依賴「關鍵字匹配」，而不是語意理解。常見的演算法包括 **TF-IDF** 與 **BM25**。

在 BM25 的搜尋流程中，系統會先將所有文件建立 **倒排索引（inverted index）**。當使用者輸入查詢時，系統會根據 query 中的關鍵字，快速找到包含這些詞彙的文件，並依照 BM25 scoring 進行排序。

例如，假設使用者輸入查詢：

```text
credit card fraud detection
```

BM25 會優先找出包含這些關鍵詞的文件，例如：

```text
credit card fraud detection model
```

這種方法的優點在於 **速度極快**，因為倒排索引可以在極短時間內完成搜尋。此外，BM25 對於 **精確關鍵字查詢** 特別有效，例如：

```text
API endpoint error code 403
```

這類技術文件搜尋通常會有非常好的效果。

然而，Sparse Retrieval 最大的限制是 **缺乏語意理解能力**。如果 query 和文件使用不同的詞彙，即使語意相同，也可能無法被匹配。例如：

Query：

```text
信用卡盜刷
```

Document：

```text
fraud transaction detection
```

由於關鍵字不同，BM25 很可能無法成功找到相關文件。

---

## Dense Retrieval：向量搜尋

為了解決語意搜尋的問題，研究者提出了 **Dense Retrieval**。這種方法不再依賴關鍵字，而是透過 **embedding 向量** 來表示文本的語意。

Dense Retrieval 的流程通常如下：

```text
Query
  ↓
Embedding
  ↓
Vector Search
  ↓
Similar Documents
```

在這個過程中，query 與文件都會被轉換成高維向量，系統會透過 **向量相似度（例如 cosine similarity）** 找到最接近的文件。

Dense Retrieval 的最大優勢在於 **語意理解能力**。例如：

```text
fraud detection ≈ transaction anomaly detection
```

即使文字不同，向量空間仍然能夠捕捉語意上的相似性。此外，Dense Retrieval 對於 **長文本與跨語言搜尋** 也通常表現更好。

目前常見的向量資料庫包括：

- Chroma
- Pinecone
- Weaviate
- FAISS
- Milvus

這些系統通常會結合 **ANN（Approximate Nearest Neighbor）演算法**，讓向量搜尋在大規模資料下仍能保持高效率。

然而，Dense Retrieval 也有一些限制。例如在 **精確 keyword 查詢** 上，它的表現往往不如 BM25。例如：

```text
error code 0x80070005
```

這類查詢需要非常精確的字串匹配，而向量模型未必能理解這些技術代碼的意義。

---

## Hybrid Retrieval：結合 Sparse 與 Dense

由於 Sparse Retrieval 與 Dense Retrieval 各有優缺點，現代 RAG 系統通常會採用 **Hybrid Retrieval**，同時結合兩種搜尋方式。

Hybrid Retrieval 的基本架構如下：

```text
Query
 │
 ├── BM25
 │
 └── Dense Retrieval
      │
      ▼
 Merge Ranking
```

在實作上，系統會同時執行 BM25 搜尋與向量搜尋，然後將兩組結果合併並重新排序。常見的方法包括：

- **Score Fusion**
- **Reciprocal Rank Fusion（RRF）**

Hybrid Retrieval 的優勢在於可以同時取得：

| 能力 | 來源 |
|---|---|
| Keyword precision | BM25 |
| Semantic search | Dense Retrieval |

例如 query：

```text
credit card fraud detection model
```

BM25 可能會找到：

```text
fraud detection model
```

而 Dense Retrieval 可能會找到：

```text
transaction anomaly detection
```

Hybrid 方法能夠同時捕捉這兩種類型的文件，因此通常能大幅提升 **retrieval recall**。

---

## Reranker：提升檢索品質的關鍵

即使使用 Hybrid Retrieval，初步檢索的結果仍然可能包含許多「語意相似但不完全相關」的文件。因此許多系統會在 retrieval 之後加入 **Reranker（第二階排序）**。

典型流程如下：

```text
Query
  ↓
Retrieve Top 50 documents
  ↓
Reranker
  ↓
Top 5 documents
```

Reranker 的核心概念是使用更精確但較慢的模型，重新評估 query 與每個文件之間的相關性。

最常見的技術是 **Cross-Encoder**。與 embedding 模型不同，Cross-Encoder 會直接把 query 與 document 一起輸入模型：

```text
[Query] + [Document]
```

模型會輸出一個 **relevance score**，用來判斷該文件是否真正相關。

常見的 reranker 模型包括：

- BGE Reranker
- monoT5
- Cohere Rerank
- OpenAI Rerank

Reranker 的重要性在於：向量相似度並不一定等於真正的「相關性」。例如 query：

```text
credit card fraud detection
```

Dense Retrieval 可能找到：

```text
bank transaction analysis
```

雖然語意相近，但未必是最相關的文件。Reranker 可以透過更精細的語意理解重新排序，從而顯著提升最終 Top-K 文件的品質。

---

## Production 等級 RAG 架構

在企業實務中，許多 RAG 系統會採用以下架構：

```text
User Query
   │
   ▼
Query Processing
   │
   ▼
Hybrid Retrieval (BM25 + Dense)
   │
   ▼
Top 50 Documents
   │
   ▼
Reranker (Cross Encoder)
   │
   ▼
Top 5 Context
   │
   ▼
LLM (GPT / Claude / Llama)
   │
   ▼
Answer
```

這種設計能在 **召回率（recall）與精確度（precision）之間取得良好平衡**，同時控制推理成本。

---

## 不同 Retrieval 方法的比較

不同 retrieval strategy 在語意理解、速度與效果上各有差異：

| 方法 | 語意理解 | Keyword 精確度 | 速度 | 效果 |
|---|---|---|---|---|
| BM25 | 低 | 高 | 非常快 | 中 |
| Dense Retrieval | 高 | 中 | 中 | 中 |
| Hybrid Retrieval | 高 | 高 | 中 | 高 |
| Hybrid + Reranker | 非常高 | 高 | 較慢 | 非常高 |

因此，在實務系統中，**Hybrid + Reranker** 已逐漸成為最主流的 RAG retrieval strategy。

---

## Retrieval 品質對 RAG 表現的影響

如果 RAG 系統的 accuracy 非常低，常見原因通常並不是 LLM 本身，而是 retrieval 階段的品質不足。例如：

- 只使用 Dense Retrieval
- 文件 chunking 設計不佳
- Top-K 設定過小
- embedding model 表現不佳
- 缺乏 reranker

這些因素都會導致系統無法找到真正相關的文件，進而讓 LLM 在缺乏正確 context 的情況下生成答案。

---

## 結論

在 RAG 系統中，retrieval strategy 是影響模型品質最重要的因素之一。從早期的 BM25 keyword search，到後來的 Dense Retrieval，再到現今主流的 Hybrid Retrieval 與 Reranker，整個技術演進的核心目標都是提升 **檢索品質與文件相關性排序能力**。

透過多層次的 retrieval pipeline，系統能同時兼顧 **關鍵字匹配、語意搜尋與精細排序**，從而提供 LLM 更高品質的 context。當 retrieval 能夠穩定找到最相關的文件時，RAG 系統的整體回答品質也會隨之顯著提升。

---

## 參考資料

1. Lewis, Patrick et al. *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.*
2. Robertson, Stephen & Zaragoza, Hugo. *The Probabilistic Relevance Framework: BM25.*
3. Reimers, Nils & Gurevych, Iryna. *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks.*
4. Gao, Luyu et al. *Reranking for Information Retrieval with Cross-Encoders.*
