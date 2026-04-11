---
name: import-blog-article
description: Convert user-provided content into a technical blog post compatible with the Docus/Nuxt Content architecture of the `docus_tech_blog` project. Use this skill when the user provides raw article data, notes, or drafts and wants to add them to the blog. Make sure to use this skill whenever the user mentions adding content, importing articles, or converting notes to blog posts.
---

# Import Blog Article

This skill automates the process of transforming raw information into high-quality technical blog posts for Woody's Tech Blog.

## Workflow

### 1. Identify Category and Directory
Analyze the input content to determine which category it belongs to. Map the content to one of the following directories in `content/`:

- `ai/`: Artificial Intelligence, LLMs, MCP, etc.
- `data-analysis/`: Data science, analytics, PR-AUC, etc.
- `machine_learning/`: ML models, evaluation, training, etc.
- `network/`: Networking protocols, OSI model, infrastructure (top-level).
- `nuxt/`: Nuxt.js, Docus, frameworks.
- `python/`: Python tools, libraries, best practices.
- `statistic/`: Statistics, probability, mathematical concepts.
- `web_dev/`: Web development (general). Check subdirectories for more specific placement:
    - `web_dev/browser/`
    - `web_dev/graphics/`
    - `web_dev/infrastructure/` (e.g., Nginx, Server config)
    - `web_dev/network/`
    - `web_dev/security/`
    - `web_dev/seo/`

**Note:** If multiple categories apply, choose the most specific one.

### 2. Generate Metadata (Frontmatter)
Each article MUST have a YAML frontmatter at the top:

```yaml
---
title: [Compelling Technical Title]
description: [Concise summary for SEO and search results]
category: [mapped-category]
date: [YYYY-MM-DD]
tags: [tag1, tag2, tag3]
---
```

- `title`: Should be clear and professional. Use Traditional Chinese if the original content is in Chinese, or English if requested.
- `description`: 1-2 sentences summarizing the value.
- `category`: Matches the primary folder name (e.g., `web_dev` or `ai`).
- `date`: Today's date (YYYY-MM-DD).
- `tags`: Use lowercase, words separated by underscores (e.g., `machine_learning`).

### 3. Format Content
- **Language**: Preserve the language of the input (default is Traditional Chinese), but ensure technical terms are accurate.
- **Header Structure**: Use `##` for main sections, `###` for sub-sections.
- **Intro**: Start with a hook or a "Why it matters" section.
- **MDC Components**: Use Docus-specific components to enhance the post:
    - `::u-alert{type="info"} [Content] ::` for highlights.
    - `::u-alert{type="warning"} [Content] ::` for cautions.
- **Code Blocks**: Always specify the language (e.g., `python`, `typescript`, `bash`).
- **Filenames**: Use lowercase, hyphen-separated slugs (e.g., `my-new-post.md`).

### 4. File Creation
Create the file in `content/<category>/<filename>.md` or `content/<category>/<subcategory>/<filename>.md`.

---

## Examples

**Example 1: Nginx Configuration**
Input: "我今天學了如何用 Nginx 設定反向代理。首先要安裝 nginx，然後修改 /etc/nginx/nginx.conf..."
Output:
File: `content/web_dev/infrastructure/nginx-reverse-proxy.md`
Content:
```markdown
---
title: Nginx 反向代理設定教學
description: 學習如何配置 Nginx 作為反向代理伺務器，優化後端服務的流量管理與安全性。
category: web_dev
date: 2026-04-11
tags: [nginx, web_server, reverse_proxy, infrastructure]
---

## 為什麼需要 Nginx 反向代理？
...
```

**Example 2: AI Tech Note**
Input: "Explain PR-AUC for imbalanced data. It's better than Accuracy because..."
Output:
File: `content/data-analysis/understanding-pr-auc.md`
Content:
```markdown
---
title: 深入解讀 PR-AUC：不平衡資料的最佳評估指標
description: 探討為什麼 PR-AUC 比 Accuracy 更適合評估不平衡資料集的分類模型。
category: data-analysis
date: 2026-04-11
tags: [data_analysis, machine_learning, metrics, pr_auc]
---
...
```
