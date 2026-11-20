---
title: Neon 資料庫分支：Copy-on-Write、不會自動同步，以及怎麼把變更帶回正式環境
description: 用 main、development、feature-auth 與 Alice／Bob／Charlie／David 的時間線，說明 Neon 如何以 Copy-on-Write 即時建立 PostgreSQL 分支、為什麼分支不會自動同步、Reset from parent 和 migration 的差別，以及 Nuxt、Vercel、Coolify 的接法。
category: database
date: 2026-10-27
tags: [neon, postgresql, database_branching, nuxt, vercel]
---

[Neon](https://neon.com) 的 Database Branching 是它和傳統 PostgreSQL 託管最不一樣的地方之一。它讓一個 Postgres 資料庫可以從某個時間點長出獨立的讀寫環境：結構、資料、索引都在，之後的修改卻不會寫回來源。

這件事很像 Git 開分支，但只像到「從一個起點分岔」。分支建立之後不會自動同步，也沒有與 `git merge` 對等的資料合併。這篇用一組固定的例子把這條線走完：正式環境 `main`、開發環境 `development`、功能分支 `feature-auth`，以及 Alice、Bob、Charlie、David 四筆使用者資料。部署情境則是我自己的 Nuxt 全端應用：正式環境在 Vercel，開發環境在 Coolify。

用 CLI 或 API 建立的 Neon 專案，第一條 root 分支名叫 `main`；在 Console 建立的專案，這條 root 預設叫 `production`。下面前半的例子沿用 `main` 當正式庫，後半建議配置改用 `production` 這個名字。兩者都只是「放正式資料的那條分支」，可以改名，也可以另外指定哪一條是專案的 default branch。

## 一、資料庫分支是什麼？

假設一個 Nuxt + PostgreSQL 的全端應用，正式庫長這樣：

```text
Neon Project
+-- main (正式環境)
    +-- users
    |   +-- id: 1, name: Alice
    |   +-- id: 2, name: Bob
    +-- products
    +-- orders
```

新功能要改 `users`，但不想直接在正式庫上試。這時從 `main` 開分支。開出來的每一條都是可以獨立連線的 Postgres 環境：

```text
Neon Project
+-- main (正式環境)
|   +-- users
|   +-- products
|   +-- orders
+-- development (開發環境)
|   +-- users
|   +-- products
|   +-- orders
+-- feature-auth (功能測試)
    +-- users
    +-- products
    +-- orders
```

一般分支（文件裡的 copy-on-write clone）在建立當下，會帶上來源分支當時的 schema、資料表、資料列、索引、role，以及其他 Postgres 物件。一個分支裡可以有多個 database。建立動作不會增加 parent 的負載，也不會改到 parent。

在 `feature-auth` 執行：

```sql
ALTER TABLE users
ADD COLUMN avatar_url TEXT;
```

只有 `feature-auth` 的結構會變。`main` 和 `development` 都還是原來的 `users`。

CLI 可以這樣建（有多個專案時加上 `--project-id`）：

```bash
neon branches create --name feature-auth --parent main
```

來源不一定是「現在」。只要時間點還在專案的 history window 裡，就可以從 parent 的過去某個時間點或某個 [LSN](https://neon.com/docs/reference/glossary) 開分支。LSN（Log Sequence Number）是 WAL 串流裡的位元組偏移，用來標出資料歷史上的一個位置。

有兩種建立時就不要把正式列資料帶出去的方式，都還在 Beta：

- [Schema-only branch](https://neon.com/docs/guides/branching-schema-only)：只複製結構，不複製列資料。它會變成一條沒有 parent 的 root branch，之後寫入的資料獨立計入儲存，也不能對它做 Reset from parent。
- [Anonymized branch](https://neon.com/docs/workflows/data-anonymization)：先帶上來源的結構與資料，再依遮罩規則把敏感欄位做成靜態假資料。Parent 本身不會被改。遮罩是靜態的，重跑只會作用在這條分支已經遮過的資料上；要重新拿到 parent 的新資料，得再開一條 anonymized branch。

Schema-only 的 CLI 寫法，以該頁文件為準：

```bash
neon branch create --schema-only
```

## 二、為什麼可以很快建立：Copy-on-Write

Neon 建立分支用的是 Copy-on-Write（寫入時複製）。這是理解 branching 的核心。

傳統做法如果正式庫有 100 GB，要一份完整測試庫，大致是 dump 再 restore。下面的 100 GB 只是示意，用來對照「整份複製」和「先共用頁面」：

```text
Production Database（示意：100 GB）
        |
        | pg_dump
        v
   100 GB 備份
        |
        | pg_restore
        v
Development Database（再佔約 100 GB）
```

時間隨資料量拉長，儲存也接近再佔一份。

Neon 不會在開分支時把這 100 GB 再抄一份。新分支和 parent 先參照同一批資料頁；某一方寫入時，才為那次寫入另存 delta。官方詞彙是 copy-on-write：資料先標成共用，真正被改到的那一部分才會複製出新版本。

```text
                    Shared storage
                    +---------------+
                    | original      |
                    | data pages    |
                    +-------+-------+
                            |
              +-------------+-------------+
              |                           |
              v                           v
         main branch                 dev branch
              |                           |
           Write A                     Write B
              |                           |
              v                           v
           delta A                     delta B
```

所以子分支在建立當下不另計儲存。之後的新增、修改、刪除都會累積成相對建立點的 delta，計費時取「累積變更」和「這條分支的邏輯資料大小」裡較小的那個。Root 分支則直接依邏輯資料大小計費。細節與費率在 [Neon plans](https://neon.com/docs/introduction/plans)。

| 比較項目 | 傳統複製 | Neon branching |
| --- | --- | --- |
| 建立方式 | `pg_dump` / `pg_restore` 複製資料 | Copy-on-Write，寫入存成 delta |
| 建立速度 | 隨資料量變長 | 即時建立，而且不增加 parent 負載 |
| 初始儲存 | 接近再一份完整資料庫 | 子分支建立當下不另計儲存 |
| 修改資料 | 各自獨立 | 各自獨立 |
| 修改 schema | 各自獨立 | 各自獨立 |
| 建立之後的同步 | 要另外做複寫或還原 | 不會自動同步 |
| CI/CD | 複本要自己準備與回收 | 可用 CLI、API、GitHub Actions 或 Vercel 整合 |

底層是運算與儲存分開。Compute 跑 Postgres，WAL（Write-Ahead Log）把變更送到儲存層；pageserver 再依照 LSN 還原出某個版本的資料頁。開分支，就是讓新分支從歷史裡的一個 LSN 開始讀寫。這套機制的細節留到文末的延伸主題，架構說明見 [Lakebase architecture](https://neon.com/docs/introduction/architecture-overview)。

## 三、分支之間的資料會同步嗎？

不會。這是 branching 最容易被誤會的地方。

上午 10:00 從 `main` 建立 `development`。兩邊都只有 Alice 和 Bob：

```text
10:00  從 main 建立 development

       main                    development
       +-- Alice               +-- Alice
       +-- Bob                 +-- Bob
```

10:30，正式環境新增 Charlie，開發分支新增 David：

```text
10:30  兩邊各自寫入，沒有同步

       main                    development
       +-- Alice               +-- Alice
       +-- Bob                 +-- Bob
       +-- Charlie             +-- David
```

Charlie 不會出現在 `development`，David 也不會出現在 `main`。分岔之後，每一條分支有自己的變更歷史：

```text
                          10:00
                            |
                          main
              +-------------+-------------+
              |                           |
              v                           v
            main                     development
              |                           |
          + Charlie                    + David
              |                           |
              v                           v
     Alice, Bob, Charlie          Alice, Bob, David
```

因此可以在開發分支執行：

```sql
DELETE FROM users;
```

正式環境的使用者不會被刪掉。反過來，正式環境之後新增的列，也不會流進已經開好的開發分支。

## 四、可以像 Git 一樣 merge 嗎？

不能。Git 可以比對文字再合併：

```text
main
+-- feature-auth
         |
         | git merge feature-auth
         v
       main
```

資料庫沒有這樣的通用合併。同一筆列在兩邊各改一次，就沒有自動答案：

```text
main:         users.id = 1, name = "Alice"
development:  users.id = 1, name = "Amy"
```

再加上外鍵、唯一索引、交易紀錄，衝突比文字 diff 更難自動解。Neon 沒有與 `git merge` 對等的操作。[Reset from parent](https://neon.com/docs/guides/reset-from-parent) 的文件也寫明：那是用 parent 的最新狀態完整覆寫子分支，不是 merge，也不是把兩邊的變更揉在一起。

結構變更要回到正式環境，走的是 migration。在 `development` 驗證過這句：

```sql
ALTER TABLE users
ADD COLUMN avatar_url TEXT;
```

確認之後，把同一份結構變更做成 migration，再套到正式庫。正式庫的列資料留在原地，只前進 schema：

```text
development
    |  在分支上測試 schema 變更
    v
migration file
    |  審查後部署
    v
production（保留既有資料，套用同一份結構變更）
```

我這邊的 Nuxt 應用用 Drizzle ORM，所以這份 migration 用 Drizzle Kit 產生與執行。重點不是工具名稱，而是：正式庫只吃進版本化的結構變更，不靠「把開發庫合併回去」。

## 五、讓開發分支跟上正式資料：Reset from parent

開發分支放久了，正式庫已經多了 Charlie，開發庫還留著 David。若開發庫上沒有要保留的結構或測試資料，可以用 Reset from parent，把子分支整份換成 parent 的最新 schema 與資料：

```text
Reset 之前
main:         Alice, Bob, Charlie
development:  Alice, Bob, David

Reset from parent 之後（development 的 parent 是 main）
main:         Alice, Bob, Charlie
development:  Alice, Bob, Charlie
```

David 會消失，`development` 上還沒做成 migration 的 schema 也會消失。這比較接近 `git reset --hard` 到 parent 的現在，而不是指到任意一次 commit。連線字串維持不變，所以 Coolify 上的 `DATABASE_URL` 不用改；進行中的連線會中斷一下，重置完成後重新連上。

```bash
neon branches reset development --parent --project-id <project-id>
```

使用前要對上這幾條限制，否則和「重新整理一下開發庫」的直覺不一樣：

- 只對有 parent 的子分支有效。Root 分支（Console 預設的 `production`、CLI 預設的 `main`，以及 schema-only 分支）沒有 parent，不能 Reset from parent。
- 只會對齊 parent 的最新狀態，不能指定時間戳或 LSN。要回到某個歷史時間點，是另一個功能：[Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)。Instant restore 只支援 root branch，而且會留下一條備份分支；Reset from parent 不會留備份。
- 覆寫的是這條分支上的每一個 database，不是單一一張表。Postgres 資料、schema，以及 Managed Better Auth 的狀態都會被換成 parent 的現況。Object Storage 和 Functions 不在資料庫時間線上，reset 不會改到它們。
- 這條分支如果還有自己的子分支，reset 會被擋住，要先刪掉那些子分支。
- Parent 若剛從 snapshot 還原，接下來最多 24 小時不能對它的子分支做 Reset from parent。
- 分支若設了到期時間，reset 之後會用原來的 TTL 長度重新起算。

開發庫上還有要留的測試資料時，先從 `development` 再開一條分支把現況留住，再 reset。Reset 本身不提供「排除某幾張表」或「保留本機 schema、只更新列資料」。

## 六、和 Nuxt、Vercel、Coolify 怎麼接

我自己的 Nuxt 全端應用把程式碼分支和資料庫分支對起來：GitHub 的 `main` 部署到 Vercel，連 Neon 的正式分支；`develop` 部署到 Coolify，連 Neon 的 `development`。

```text
                        GitHub
              +------------+------------+
              |                         |
              v                         v
            main                     develop
              |                         |
              v                         v
           Vercel                    Coolify
              |                         |
              v                         v
         Neon: main             Neon: development
         (正式資料)                (開發資料)
```

兩個環境各有一條連線字串。分支不同，endpoint 也不同，資料表同名也不會寫到同一份資料。

```bash
# 正式環境（Vercel → Neon 的正式分支）
DATABASE_URL=postgresql://...main...

# 開發環境（Coolify → Neon development）
DATABASE_URL=postgresql://...development...
```

日常流程是：

1. Coolify 上的 Nuxt 開發版連 `development`，在那裡改資料、試 schema。
2. Vercel 上的正式版連正式分支。
3. 測試通過後，程式碼與對應的 migration 一起進正式環境。正式庫的列資料不被開發庫覆蓋。

Coolify 這條線不會因為 Git 開了新分支就自動長出資料庫分支，`DATABASE_URL` 是環境上自己設的。沒有接 Vercel 整合時，Neon 也不會跟著每一個 Git 分支自動建庫，要自己用 [CLI](https://neon.com/docs/manage/branches)、API 或 [GitHub Actions](https://neon.com/docs/guides/neon-github-integration)。

Vercel 則已經有官方整合可以自動建 preview 分支，下一節分開寫。整合寫進 Vercel 的變數主要是 pooled 的 `DATABASE_URL`，以及直連用的 `DATABASE_URL_UNPOOLED`。應用程式多半用前者；需要直連的工具用後者。

## 七、Preview 環境：每個 PR 一條資料庫分支

功能用 Pull Request 開發時，每個 PR 可以有自己的資料庫分支：

```text
GitHub
+-- main
+-- feature-login
+-- feature-payment
+-- feature-dashboard

Neon
+-- main
+-- pr-login
+-- pr-payment
+-- pr-dashboard
```

接上 Vercel Preview Deployment 之後，每個 PR 同時有一個預覽網址和一條獨立資料庫：

```text
Pull Request #101
+-- Vercel Preview URL
+-- Neon branch: preview/feature-login

Pull Request #102
+-- Vercel Preview URL
+-- Neon branch: preview/feature-payment
```

這適合多人同時改 schema、在 CI 裡跑整合測試，也適合讓 coding agent 在會被刪掉的分支上試 SQL。測完就把分支刪掉。

官方整合會自動做這件事，不需要每個 PR 手動呼叫 API：

| 整合 | 費用記在哪 | Preview 分支 |
| --- | --- | --- |
| [Neon-Managed](https://neon.com/docs/guides/neon-managed-vercel-integration) | Neon | 連上之後，每個 preview deployment 自動建一條分支 |
| [Vercel-Managed](https://neon.com/docs/guides/vercel-managed-integration)（Neon Postgres Native Integration） | Vercel | 要在連接時把「Create database branch for deployment」的 Preview 打開。Production 不要勾，否則每次正式部署都會多一條分支 |

兩種整合建立的 preview 分支，名稱都是 `preview/` 接上 Git 分支名稱。清理用的 GitHub Action 以 `github.head_ref` 拼出同一個名字。Neon-Managed 是一對一：一個 Neon 專案只接一個 Vercel 專案，而且不能和 Vercel-Managed 裝在同一個 Vercel 專案。

有兩個容易設錯的地方：

- Preview 的 parent 永遠是專案的 **default** 分支，即使 Vercel Production 指到另一條分支（例如受保護的 `production`，而 default 仍是 `main`）。正式部署用連接時選定的 production 分支；preview 仍從 default 分出去。
- 自動建立的是一般 copy-on-write 分支，會帶上 default 分支當下的列資料，不是 schema-only。Default 上若有不能進預覽環境的個資，整合不會自動拿掉。可以改把不含正式個資的分支設成 default，正式資料另放一條分支給 Production；或在開開發分支時改用 schema-only／anonymized branch。

清理方式也不一樣，見 [Managing Vercel preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup)：

- Neon-Managed：對應的 Git 分支消失後，下次有 preview deployment 時刪掉 Neon 上的 preview 分支。
- Vercel-Managed：等到這條分支最後一個相關的 Vercel deployment 被刪除才刪。若只靠 Vercel 的 deployment retention，可能會留很久。

不要改 Git 分支或 Neon preview 分支的名字，自動清理是靠名稱對應。也不要在 preview 分支底下再開子分支，否則自動刪除會被擋住。

分支到期可以讓短期分支自己消失。[Branch expiration](https://neon.com/docs/guides/branch-expiration) 最長 30 天。在 Console 建立分支時，預設會勾「1 天後刪除」（也可改成 1 小時、7 天，或取消）；用 API 或 CLI 建立時預設不設到期，要自己帶 `--expires-at`。Protected 分支、default 分支，以及已經有子分支的 parent，不能設到期；設了到期的分支也不能再當別人的 parent。到期刪除是永久的。

最後，資料庫分支獨立，不代表外面的世界也隔離。新分支預設沿用 parent 的 Postgres role 與密碼（文件說明，若要一組新密碼，可搭配 branch protection，見 [Manage branches](https://neon.com/docs/manage/branches)）。第三方 API 金鑰、webhook、物件儲存若還是指著正式服務，在分支裡按下去一樣會打到正式環境。

## 八、使用成本

開分支不用先複製整庫，所以儲存不會在建立瞬間變成兩倍。分支仍然會產生費用。撰寫時的額度與計價方式如下，費率會調整，以 [Neon plans](https://neon.com/docs/introduction/plans) 為準。

| 項目 | 怎麼算 |
| --- | --- |
| 儲存 | 子分支建立當下不另計。之後以相對 parent 的寫入 delta 計費（新增、修改、刪除都算），且不超過該分支的邏輯資料大小。Root 分支依邏輯資料大小計費 |
| Compute | 每條分支預設有自己的 read-write compute，依 CU-hours 計。閒置後會 scale to zero，暫停期間不算運算 |
| 變更歷史 | History window 決定能回溯多久。即時還原的歷史儲存只對 root branch 計費 |
| 分支數量 | 算進方案額度。放太久的分支會鎖住自己需要的資料，超過 history window 之後仍可能增加儲存 |
| 其他 | 快照、網路傳輸等另計，見方案頁 |

Scale to zero 是預設行為，不是額外打開才有。[說明](https://neon.com/docs/introduction/scale-to-zero)裡，compute 閒置約 5 分鐘後會暫停，下次查詢再自動喚醒。Free 方案固定 5 分鐘且不能關閉；Launch 同樣預設 5 分鐘，但可以關閉；Scale 可以設定成 1 分鐘到永不休眠。大於 16 CU 的 compute 不會 scale to zero。有 logical replication 的訂閱端連著時，compute 也會保持運作。Compute 暫停不會讓儲存歸零。

History window 的預設，在 [branching 文件](https://neon.com/docs/introduction/branching) 寫的是 Free 6 小時、付費方案 1 天。拉長回復範圍會增加歷史儲存：Launch 最長 7 天，Scale 最長 30 天。

分支額度（每個 project）：

| 方案 | 分支額度 | 再增加 |
| --- | --- | --- |
| Free | 10 | 不能加購，要刪分支或升級 |
| Launch | 10 | 可加購 child branch，撰寫時為每個 branch-month 1.50 美元，專案上限 5,000 |
| Scale | 25 | 同上 |

Schema-only 分支另計 root branch 額度，因為它們是 root：Free 3、Launch 5、Scale 25。專案原本那條 root，以及部分還原產生的備份分支，也算進這個額度。付費方案上，一般分支儲存沒有單分支硬上限，但每條 schema-only 分支有自己的上限（Launch 3 GB、Scale 20 GB）。Free 的 Postgres 儲存則是整個 project 共 1 GB。用完 root 額度就不能再加 schema-only 分支。

預覽與功能分支用完就刪，或加上到期時間。官方也建議正式流量放在 root 分支上，避免 child branch 的 delta 一直累積。

## 九、我採用的分支配置

Nuxt + Drizzle ORM + Neon，正式環境走 Vercel、開發環境走 Coolify 時，我用的結構是：

```text
Neon Project
+-- production      正式資料 (root)
+-- staging         上線前整合測試
+-- development     日常開發
    +-- feature-auth
    +-- feature-payment
    +-- feature-dashboard
```

`production`、`staging`、`development` 不必永遠維持同一套「子分支從正式庫拉資料」的策略。`development` 不一定要一直直接繼承 `production`。

搭配前面的限制，這棵樹要這樣用才不會和 Reset 打架：

- `production` 若是 root，不能 Reset from parent。正式庫的列資料留在這條分支上，schema 只用 migration 推進。這比任何「把正式庫重置來跟上開發庫」都安全，也比較符合 CI/CD。
- `feature-*` 的 parent 若是 `development`，對它們 Reset from parent 只會對齊 `development`，不會直接對齊 `production`。
- `development` 底下還有子分支時，不能對 `development` 做 Reset from parent，也不能替它設到期。要先清掉 `feature-*`。
- 對 `development` 做 Reset from parent，會丟掉它上面的 schema 變更和測試資料。還沒進 migration 的 `avatar_url` 也會消失。
- 短期的 `feature-*` 與 preview 分支適合設到期。長期的 `development` 不要設，否則它不能再當 `feature-*` 的 parent。

[Workflow primer](https://neon.com/docs/get-started/workflow-primer) 另建議開發分支用 `dev/` 前綴，PR 分支用 `preview/pr-<PR 編號>-<Git 分支名>`。上面的名字是環境角色，命名可以再套這組前綴，方便和 Vercel 整合產生的 `preview/...` 分得開。

## 十、三種分支模式

同一套 branching，實務上會收成三種用法：

| 模式 | 適合情境 | 主要特性 |
| --- | --- | --- |
| Branch per Environment | Production / Staging / Development | 環境隔離，連線字串各自獨立 |
| Branch per Pull Request | GitHub PR、Vercel Preview、CI | 開 PR 時建立，合併或關閉後刪除 |
| Branch per User | AI agent 沙盒、每人一份可寫入的實驗環境 | 每個使用者一條隔離的 Postgres |

第三種值得單獨看。若做一個 AI 助教，希望每位使用者都能讓模型改表、插資料、試 SQL，可以給每位使用者一條會過期的分支，讓實驗離開正式庫。文件也把這類 AI workflow 列在適合設 TTL 的情境裡。

它還不是完整的多租戶方案。分支數量有方案上限，root 與 schema-only 另有額度，role 與密碼預設沿用 parent，外部服務也不會跟著隔離。真的要做租戶隔離，還要另外看 project 邊界、權限、網路與資料留存，不能只靠 branching。

## 結論

Neon 的資料庫分支，是從某個 LSN 長出來的獨立 Postgres：用 Copy-on-Write 即時建立，寫入只留下自己的 delta，所以 `feature-auth` 的 `avatar_url`、開發庫的 David、正式庫的 Charlie，都不會互相跑過去。

把開發結果帶回正式環境，靠的是 Drizzle Kit 這類 migration，不是 Git 式的 merge。開發庫想整份換成 parent 的最新資料與 schema，用 Reset from parent，並接受本機變更會消失、連線字串則可以留著。Vercel 的官方整合可以為每個 preview deployment 自動建 `preview/<Git 分支>`；Coolify 上的開發環境則維持一條長期的 `development`，自己接 `DATABASE_URL`。

個資不要直接跟著 preview 複製出去。短期分支設到期、用完就刪，compute 的 scale to zero 只解決閒置運算，不解決分支把資料鎖在 history window 之外的儲存。

## 延伸主題

這篇停在使用模型。下面幾件事值得另寫：

- WAL、LSN 與 pageserver 如何把同一份歷史讀成多條分支
- 用 GitHub Actions 把 Git 分支自動對到資料庫分支，包含建立、跑 migration、關閉 PR 後刪除
- 正式庫持續有新資料時，如何更新開發庫，同時保住開發庫上還沒用 migration 帶回正式庫的 schema 變更
- 用會過期的分支做 AI agent 沙盒，讓模型可以改 Postgres，而不碰到正式庫

## 參考資料

- Neon，[Branching](https://neon.com/docs/introduction/branching)
- Neon，[Glossary](https://neon.com/docs/reference/glossary)（copy-on-write、LSN、WAL）
- Neon，[Lakebase architecture](https://neon.com/docs/introduction/architecture-overview)
- Neon，[Manage branches](https://neon.com/docs/manage/branches)
- Neon，[Reset from parent](https://neon.com/docs/guides/reset-from-parent)
- Neon，[Instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore)
- Neon，[Schema-only branches](https://neon.com/docs/guides/branching-schema-only)（Beta）
- Neon，[Data anonymization](https://neon.com/docs/workflows/data-anonymization)（Beta）
- Neon，[Branch expiration](https://neon.com/docs/guides/branch-expiration)
- Neon，[Scale to Zero](https://neon.com/docs/introduction/scale-to-zero)
- Neon，[Plans](https://neon.com/docs/introduction/plans)
- Neon，[Database branching workflow primer](https://neon.com/docs/get-started/workflow-primer)
- Neon，[Neon-Managed Vercel integration](https://neon.com/docs/guides/neon-managed-vercel-integration)
- Neon，[Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration)
- Neon，[Managing Vercel preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup)
- Neon，[GitHub integration](https://neon.com/docs/guides/neon-github-integration)
