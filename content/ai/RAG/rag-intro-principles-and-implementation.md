---
title: RAG（Retrieval-Augmented Generation）原理與實作入門
description: 介紹 Retrieval-Augmented Generation（RAG）的核心概念、系統架構與實作流程，理解大型語言模型如何透過外部知識提升回答品質。
tags: [rag, llm, ai, vector-database, machine-learning]
category: RAG
date: 2026-03-13
---

## 為什麼大型語言模型需要 RAG？

近年來大型語言模型（Large Language Models, LLM）在自然語言處理領域取得了非常驚人的成果，例如像是 ChatGPT 或其他生成式 AI，都能夠回答問題、撰寫文章、甚至協助寫程式。

然而，這些模型仍然存在一個重要限制：**它們的知識主要來自於訓練資料，而不是即時資料來源**。

這會帶來幾個常見問題：

- 模型可能不知道最新資訊（例如公司最新政策或產品文件）
- 模型可能產生 **hallucination（幻覺）**，也就是看似合理但實際錯誤的回答
- 企業場景中的內部資料（知識庫、技術文件、客戶資料、研究報告）通常不會拿去重訓模型

因此，一種非常重要的技術就出現了：**Retrieval-Augmented Generation（RAG）**。

RAG 的核心概念是：

> 在生成答案之前，先從外部知識庫「檢索（retrieve）」相關資料，再把資料交給 LLM 生成答案。

換句話說，模型不再只依賴訓練時的知識，而是可以 **即時查詢資料庫並生成回答**。

---

## RAG 的基本概念

Retrieval-Augmented Generation 可以從字面理解為兩個部分：

- **Retrieval（檢索）**
- **Generation（生成）**

整個流程可以簡化為三個步驟：

1. 使用者提出問題
2. 系統先到知識庫搜尋相關文件
3. 將文件與問題一起交給 LLM 生成答案

流程概念如下：

```text
User Question
   │
   ▼
Vector Search（檢索相關文件）
   │
   ▼
Relevant Documents
   │
   ▼
LLM（生成答案）
   │
   ▼
Final Response
```

與傳統 LLM 的差異：

| 方法 | 知識來源 |
|---|---|
| Traditional LLM | 模型訓練資料 |
| RAG | 外部知識庫 + 模型 |

因此 RAG 可以大幅提升：

- 回答的**準確度**
- 回答的**可解釋性**
- 系統的**可更新性**

---

## RAG 系統的核心架構

一個完整的 RAG 系統通常包含以下幾個核心組件。

### 1. 文件資料來源（Documents）

首先需要一個知識來源，例如：

- PDF 文件
- 技術文件
- Wiki
- 企業知識庫
- 資料庫資料

例如：

```text
company_docs/
├── policy.pdf
├── product_manual.pdf
└── engineering_notes.md
```

這些文件就是 RAG 系統的 **知識基礎**。

### 2. 文件切分（Chunking）

LLM 無法一次讀取非常長的文件，因此通常需要先把文件切成較小的片段（chunk）。

```text
Original document
   ↓
Split into chunks
chunk 1
chunk 2
chunk 3
chunk 4
```

常見切分策略：

- 固定長度切分（如 500 tokens）
- 句子或段落切分
- Sliding window

好的 chunking 策略會顯著影響 RAG 效果。

### 3. 向量化（Embedding）

接著把每個文字 chunk 轉換成 **向量（vector）**，這個過程稱為 embedding。

```text
"RAG improves LLM accuracy"
    ↓ embedding model
[0.23, -0.91, 0.44, ...]
```

embedding 的目的，是讓語意相似的文字在向量空間中彼此接近。

常見 embedding 模型：

- OpenAI embedding models
- sentence-transformers
- BGE embeddings

### 4. 向量資料庫（Vector Database）

當文件都轉換成向量後，就可以存進 **向量資料庫（vector database）**。

常見選擇：

- FAISS
- Milvus
- Pinecone
- Weaviate

這些資料庫支援 **semantic search（語意搜尋）**：比對語意，而不只是關鍵字。

### 5. Retrieval（語意搜尋）

使用者提出問題時，系統會：

1. 把問題轉成 embedding
2. 在向量資料庫搜尋最相似文件

```text
User question: "How does RAG work?"
   ↓ embedding
Search similar vectors
   ↓
Top 3 relevant chunks
```

這一步常使用 **cosine similarity** 或 **inner product** 計算相似度。

### 6. Generation（LLM 生成回答）

最後把：

- 使用者問題
- 檢索到的文件

一起放進 prompt，交給 LLM 生成答案。

```text
Context: [retrieved documents]
Question: How does RAG work?
Answer:
```

這也是 RAG 能降低 hallucination 的關鍵：回答會更受檢索內容約束。

---

## RAG 的完整流程

整合起來，一個典型 RAG pipeline 如下：

```text
Documents
   │
   ▼
Chunking
   │
   ▼
Embedding
   │
   ▼
Vector Database
   │
   ▼
User Question
   │
   ▼
Embedding
   │
   ▼
Vector Search
   │
   ▼
Relevant Context
   │
   ▼
LLM Generation
   │
   ▼
Final Answer
```

在實務中，這個 pipeline 通常會被包裝成 API 或聊天系統。

---

## 一個簡單的 RAG Python 範例

```python
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

docs = [
    "RAG combines retrieval and generation",
    "Vector databases enable semantic search",
    "LLMs generate natural language answers"
]

model = SentenceTransformer("all-MiniLM-L6-v2")
doc_embeddings = model.encode(docs)

index = faiss.IndexFlatL2(doc_embeddings.shape[1])
index.add(np.array(doc_embeddings))

query = "What is RAG?"
query_embedding = model.encode([query])
D, I = index.search(np.array(query_embedding), k=2)

retrieved_docs = [docs[i] for i in I[0]]
print(retrieved_docs)
```

這段程式碼示範了 RAG 核心概念：

1. 文件轉 embedding
2. 建立向量索引
3. 搜尋最相關文件

在實際系統中，這些文件會再送入 LLM 生成最終回答。

---

## RAG 在實務中的應用場景

RAG 已成為現代 AI 系統常見架構，應用包括：

### 企業知識庫問答

```text
Q: 公司報銷流程是什麼？
```

系統先搜尋公司政策文件，再生成答案。

### 文件搜尋與摘要

適用於：

- 法律文件
- 研究論文
- 技術文件

可快速定位相關段落並生成摘要。

### AI 客服

可連接 FAQ、產品文件、支援文件，生成更精準回覆。

### 程式碼助理

```text
How to use this API?
```

可先檢索程式文件再生成說明。

---

## RAG 的限制與挑戰

雖然 RAG 很強大，但仍有挑戰：

### Retrieval quality

若檢索結果不相關，LLM 回答仍可能錯誤。

### Chunking strategy

- chunk 太小：上下文不足
- chunk 太大：搜尋精準度下降

### Latency

RAG 涉及 embedding、vector search、LLM generation，延遲通常高於純 LLM。

---

## 結論

Retrieval-Augmented Generation（RAG）是一種把 **資訊檢索（IR）** 與 **大型語言模型（LLM）** 結合的架構。透過先檢索再生成，RAG 能讓模型使用外部知識，提升回答準確性與可信度。

RAG 已廣泛用於企業知識庫、文件搜尋、AI 客服與程式碼助理等場景。隨著向量資料庫與 embedding 技術進步，RAG 也逐漸成為打造 **企業級 AI 系統** 的核心技術之一。
