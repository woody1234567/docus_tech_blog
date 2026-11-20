---
title: 速度之王：Python 套件管理工具 uv 快速入門
description: 介紹由 Astral 開發的超高速 Python 套件管理器 uv，以及如何使用它取代傳統的 pip 與 venv。
category: python
date: 2026-04-11
tags: [python, uv, pip, package_management]
---

## 為什麼需要 uv？

如果你覺得 `pip` 的安裝速度太慢，或是管理 `venv` 很麻煩，那麼 `uv` 絕對是你的救星。它是用 Rust 編寫的，性能大幅超越以往的工具。

::u-alert{type="info"}
`uv` 號稱比 `pip` 快 10-100 倍，且能自動管理 Python 版本。
::

## 安裝方式

你可以直接使用官方的安裝腳本：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 建立專案

使用 `uv init` 快速初始化一個專案：

```bash
uv init my-project
uv add requests
uv run main.py
```

## 結論

`uv` 正在改變 Python 的開發體驗，如果你追求速度與穩定性，現在就是切換的好時機。
