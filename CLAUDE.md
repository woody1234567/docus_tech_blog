# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev      # Start dev server at http://localhost:3000
pnpm run build    # Build for production (outputs to .output/)
```

No test suite or linter is configured.

## Architecture

This is a personal tech blog built on **Docus** — a Nuxt 4 layer that turns Markdown files into a documentation-style site. The project uses `nuxt dev --extends docus`, meaning the Docus theme is inherited as a Nuxt layer rather than installed as a traditional module.

### Key files

- `nuxt.config.ts` — Enables KaTeX (math rendering via `remark-math` + `rehype-katex`), sets syntax highlight theme to `github-dark`, and configures the AI assistant model (`google/gemini-3-flash`) with an MCP server at `/mcp`.
- `app.config.ts` — Blog title, footer credits, and GitHub link.
- `content/` — All blog content as Markdown files. File paths map directly to URL routes.

### Content structure

```
content/
├── index.md           # Homepage (uses MDC hero/section components)
├── ai/                # AI topics: MCP, LLMs, RAG (BM25, dense retrieval, RRF, TF-IDF)
│   └── RAG/
├── web_dev/           # Sub-dirs: browser, network, security, seo, infrastructure, graphics
├── nuxt/              # Nuxt/Nitro internals
├── python/            # Python tooling
├── machine_learning/  # ML algorithms (decision trees, XGBoost, LightGBM, etc.)
├── data-analysis/     # EDA, ROC/AUC, SHAP, etc.
├── statistic/         # Statistical tests
└── network/           # DNS, networking concepts
```

### Adding a new article

1. Create a `.md` file in the appropriate `content/` subdirectory. The file path becomes the URL (e.g. `content/ai/my-post.md` → `/ai/my-post`).
2. Add frontmatter at the top:

```yaml
---
title: Article Title
description: Short description for SEO
category: ai
date: 2026-03-24
tags: [tag1, tag2]
---
```

3. Write content in standard Markdown. Math blocks are supported via KaTeX (`$inline$` and `$$block$$`). Syntax highlighting supports: `python`, `ts`, `js`, `vue`, `bash`, `yaml`, `md`.

### MDC components

Docus uses MDC (Markdown Components) syntax with the `u-` prefix for Nuxt UI components:

```md
::u-page-hero        ← hero banner
::u-page-section     ← content section with features grid
:::u-page-feature    ← individual feature card (nested inside section)
:::u-button          ← button with props
```

**Critical**: All Nuxt UI components must use the `u-` prefix (e.g. `::u-page-hero`, not `::page-hero`). Without it, Vue cannot resolve the components.

Category `index.md` files typically use these components to create a landing page for that section. Article files use plain Markdown.

### Skills

`skills/create-docs/SKILL.md` (also mirrored in `.agent/`, `.agents/`, `.claude/`) contains an agent skill for scaffolding new Docus documentation sites. It is used by AI agents — not part of the blog content itself.
