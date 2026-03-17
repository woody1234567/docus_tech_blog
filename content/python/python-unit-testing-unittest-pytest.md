---
title: Python 單元測試教學：如何為你的程式撰寫 Test
description: 介紹 Python 中常見的單元測試方法，包含 unittest 與 pytest 的基本概念、撰寫方式與實際範例，幫助你建立可靠的程式品質。
tags: [python, testing, unittest, pytest, software_engineering]
category: python
date: 2026-03-14
---

## 為什麼在 Python 專案中需要撰寫測試？

當專案逐漸變大時，程式碼的修改往往會帶來意想不到的錯誤。例如你修改了一個函式，可能會影響到其他依賴該函式的模組。如果每次修改都只能靠人工測試，不但效率低，也很容易遺漏問題。

因此在軟體開發中，**自動化測試（automated testing）** 是非常重要的一環。透過撰寫測試程式，我們可以讓電腦自動檢查程式是否符合預期行為。

在 Python 中，最常見的測試方式是 **單元測試（unit test）**。單元測試的目標是針對「最小功能單位」進行驗證，例如一個函式或一個類別的方法。只要每個單元都能正確運作，整體系統的可靠度也會大幅提升。

---

## 一個最簡單的 Python 函式

在撰寫測試之前，我們先建立一個非常簡單的函式。例如在 `math_utils.py` 中建立一個加法函式：

```python
def add(a, b):
    return a + b
```

這個函式的功能很單純：接收兩個數字並回傳相加結果。

接下來我們的目標，就是寫一個測試程式來確認這個函式是否正常運作。

---

## 使用 Python 內建的 unittest 撰寫測試

Python 標準函式庫提供了一個測試框架 **unittest**，它的概念和許多其他語言的測試框架（例如 Java 的 JUnit）相似。

首先建立一個測試檔案 `test_math_utils.py`：

```python
import unittest
from math_utils import add


class TestMathUtils(unittest.TestCase):
    def test_add(self):
        result = add(2, 3)
        self.assertEqual(result, 5)


if __name__ == "__main__":
    unittest.main()
```

這段程式包含幾個重要概念：

1. `TestMathUtils` 是一個測試類別，必須繼承 `unittest.TestCase`
2. 所有測試函式名稱必須以 `test_` 開頭
3. `assertEqual` 用來檢查結果是否符合預期

當執行這個檔案時，`unittest` 會自動尋找所有 `test_` 開頭的函式並逐一執行。

---

## 如何執行測試

在 terminal 中，你可以使用以下指令執行測試：

```bash
python -m unittest
```

執行後可能會看到類似以下輸出：

```text
.
----------------------------------------------------------------------
Ran 1 test in 0.001s

OK
```

這表示測試成功通過。如果測試失敗，Python 會顯示錯誤訊息，幫助你快速找到問題。

---

## 撰寫更多測試案例

在實務開發中，我們通常會測試不同的輸入情境。例如：

```python
class TestMathUtils(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

    def test_add_zero(self):
        self.assertEqual(add(5, 0), 5)
```

這樣做的目的是確保函式在不同情境下都能正常運作。

良好的測試通常會包含：

- 正常輸入
- 邊界條件（boundary cases）
- 錯誤輸入

這可以讓程式在未來修改時仍保持穩定。

---

## 使用 pytest：更簡潔的 Python 測試框架

除了 `unittest` 之外，Python 社群更常使用 **pytest**。

`pytest` 的優點是語法更簡潔，不需要建立測試類別。

首先安裝 pytest：

```bash
pip install pytest
```

接著建立測試檔案 `test_math_utils.py`：

```python
from math_utils import add


def test_add():
    assert add(2, 3) == 5


def test_add_negative():
    assert add(-1, -2) == -3
```

可以看到語法比 `unittest` 簡單許多，只需要使用 `assert` 即可。

執行測試：

```bash
pytest
```

pytest 會自動搜尋所有 `test_*.py` 檔案並執行測試。

---

## 測試檔案的常見專案結構

在實際專案中，測試通常會放在 `tests` 資料夾中，例如：

```text
project/
│
├─ src/
│  └─ math_utils.py
│
├─ tests/
│  └─ test_math_utils.py
│
└─ requirements.txt
```

這樣可以讓程式碼與測試分開管理，也方便 CI/CD 系統自動執行測試。

---

## 什麼是 Test Driven Development（TDD）？

在某些開發流程中，工程師會先寫測試，再寫實際程式碼。這種方式稱為 **TDD（Test Driven Development）**。

TDD 的基本流程通常是：

1. 先寫測試（測試會失敗）
2. 撰寫程式讓測試通過
3. 重構程式碼
4. 重複這個循環

這種方式可以確保程式設計是由需求驅動，並且每個功能都有測試覆蓋。

---

## 結論

在 Python 專案中撰寫測試，是確保程式品質的重要方法。透過單元測試，我們可以在修改程式時快速確認是否破壞既有功能。Python 提供了內建的 `unittest` 框架，同時社群也廣泛使用語法更簡潔的 `pytest`。

建立良好的測試習慣，不僅能降低 bug 發生的機率，也能讓專案在長期維護與擴展時更加穩定。當專案規模逐漸增加時，自動化測試往往會成為維持程式品質的關鍵工具。
