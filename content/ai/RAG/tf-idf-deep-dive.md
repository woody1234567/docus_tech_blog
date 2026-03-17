---
title: TF-IDF（Term Frequency–Inverse Document Frequency）深入解析
description: 從直覺理解到實務應用，完整掌握 TF-IDF 在資訊檢索與自然語言處理中的核心概念與使用方式。
tags: [tf-idf, nlp, information-retrieval, machine-learning, text-mining]
category: RAG
date: 2026-03-17
---

## 為什麼需要 TF-IDF？

在處理文字資料時，我們常會遇到一個問題：**如何判斷一段文字中哪些詞比較重要？**

舉例來說，假設你有一堆文章：

- 「我今天去吃拉麵」
- 「拉麵真的很好吃」
- 「我今天學習自然語言處理」

如果我們只是單純計算詞出現的次數（Term Frequency），那「我」、「今天」、「去」這類常見詞會一直出現，但它們其實**沒有太多語意價值**。

這時候就需要一個機制，幫助我們：

- 提高「有代表性」詞的權重
- 降低「常見但沒意義」詞的影響

這正是 TF-IDF 的核心目的。

---

## TF-IDF 的核心概念

TF-IDF 是由兩個部分組成：

- TF（Term Frequency）：詞在文件中出現的頻率
- IDF（Inverse Document Frequency）：詞在整個語料庫中的稀有程度

這兩者的結合，能夠同時考慮「局部重要性」與「全局稀有性」。

---

## 一、TF（Term Frequency）是什麼？

TF（詞頻）代表某個詞在「單一文件」中出現的頻率。

最簡單的計算方式是：

```text
TF(t) = 詞 t 在文件中出現次數 / 文件總詞數
```

舉例：

文件內容：

```text
拉麵 好吃 拉麵
```

- 拉麵出現 2 次
- 總詞數為 3

所以：

```text
TF(拉麵) = 2 / 3
```

TF 的直覺很簡單：**出現越多次，代表越重要**。

但這裡有個問題：像「的」、「是」、「我」這種詞，也會有很高的 TF，但其實沒什麼意義。這就是為什麼我們需要 IDF。

---

## 二、IDF（Inverse Document Frequency）是什麼？

IDF 用來衡量一個詞在「整個語料庫」中的稀有程度。

計算公式：

```text
IDF(t) = log(總文件數 / 包含詞 t 的文件數)
```

舉例：

假設有 3 篇文件：

1. 拉麵 好吃
2. 拉麵 很棒
3. 今天 天氣 好

- 「拉麵」出現在 2 篇文件
- 「天氣」只出現在 1 篇文件

計算：

```text
IDF(拉麵) = log(3 / 2)
IDF(天氣) = log(3 / 1)
```

可以發現：

- 出現在越少文件的詞，IDF 越高
- 越常見的詞，IDF 越低

這樣就能有效降低「常見詞」的影響。

---

## 三、TF-IDF 如何結合？

TF-IDF 的計算方式非常直觀：

```text
TF-IDF(t) = TF(t) × IDF(t)
```

也就是：

- 在某篇文章中很常出現（高 TF）
- 但在其他文章中很少見（高 IDF）

這個詞就會有很高的權重。

---

## 用一個例子理解 TF-IDF

假設有三篇文件：

```text
Doc1: 我 喜歡 吃 拉麵
Doc2: 拉麵 很 好吃
Doc3: 我 今天 學習 AI
```

我們來看兩個詞：

### 詞一：「拉麵」

- 在 Doc1、Doc2 都出現 → IDF 偏低
- 在 Doc1 中出現一次 → TF 普通

→ TF-IDF：中等

### 詞二：「AI」

- 只出現在 Doc3 → IDF 很高
- 在 Doc3 中出現一次 → TF 普通

→ TF-IDF：高

這代表：

- 「AI」對 Doc3 更具有代表性
- 「拉麵」雖然常出現，但區別性較低

---

## TF-IDF 在實務上的應用

TF-IDF 是資訊檢索與 NLP 的經典方法，廣泛應用在：

### 1. 搜尋引擎排序

當你輸入關鍵字時，系統會：

- 計算查詢詞在文件中的 TF-IDF
- 排序最相關的文件

這也是早期搜尋引擎的重要基礎技術之一。

### 2. 文件相似度計算

每篇文章可以轉成一個向量（TF-IDF vector）：

```text
Doc → [0.2, 0.8, 0.0, 0.5, ...]
```

再透過 cosine similarity 計算相似度：

```text
similarity = cos(θ)
```

這在以下場景非常常見：

- 推薦系統
- 文件分類
- 搜尋結果排序

### 3. 關鍵字抽取

TF-IDF 可以幫助你找出一篇文章的關鍵詞：

- 分數高 → 代表性強
- 分數低 → 常見詞或無意義詞

這在 SEO、自動摘要、文件標籤生成中都很實用。

---

## 使用 Python 實作 TF-IDF

在實務中，我們通常不會手刻公式，而是使用套件，例如 `scikit-learn`：

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "我 喜歡 吃 拉麵",
    "拉麵 很 好吃",
    "我 今天 學習 AI"
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(documents)

print(vectorizer.get_feature_names_out())
print(X.toarray())
```

這段程式碼會：

1. 自動做分詞（英文效果較佳，中文需額外處理）
2. 計算 TF-IDF
3. 輸出每篇文件的向量表示

---

## TF-IDF 的限制

雖然 TF-IDF 很實用，但它也有一些限制：

### 1. 無法理解語意

TF-IDF 只看「詞出現次數」，不理解語意。

- 「好吃」與「美味」被視為不同詞
- 無法處理同義詞

### 2. 忽略詞序

句子：

- 「我喜歡你」
- 「你喜歡我」

TF-IDF 可能視為幾乎一樣。

### 3. 對長文本敏感

長文章可能因為詞數多而影響 TF 計算。

---

## TF-IDF vs 現代 Embedding

在現代 NLP 中，TF-IDF 常與 embedding 方法比較：

| 方法 | 特點 |
|---|---|
| TF-IDF | 快速、可解釋、無需訓練 |
| Word2Vec / BERT | 能理解語意與上下文 |

但在很多場景中：

- TF-IDF 仍然是 baseline 的首選
- 特別是在資源有限或需要高可解釋性的情況

---

## 結論

TF-IDF 是一種簡單但非常強大的文字表示方法，透過結合「詞頻」與「稀有性」，成功解決了文字重要性評估的問題。即使在深度學習盛行的今天，它仍然在搜尋引擎、文件分析與資料科學領域中扮演重要角色。

如果你正在建立 RAG 系統、搜尋功能或文件分析工具，理解 TF-IDF 會是非常關鍵的一步，因為它幫助你從「文字」走向「可計算的向量」，也為更進階的語意模型打下基礎。
