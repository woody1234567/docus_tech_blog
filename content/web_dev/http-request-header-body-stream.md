---
title: HTTP Request 中的 Header 與 Body 是如何傳遞的？
description: 深入理解 HTTP Request 的 Header 與 Body 傳輸方式，了解為什麼 Body 常常只能讀取一次，以及 Stream 在 Node.js 與 Fetch API 中扮演的角色。
tags: [http, header, body, stream, nodejs, fetch-api, backend]
category: web_dev
date: 2026-05-15
---

# HTTP Request 中的 Header 與 Body 是如何傳遞的？

當我們在前端呼叫 API 時，常常會寫出這樣的程式：

```js
fetch('/api/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token'
  },
  body: JSON.stringify({
    name: 'Woody'
  })
})
```

很多人一開始會直覺地認為：

```txt
Header 跟 Body 都只是 Request 的一部分。
```

這句話沒有錯，但如果只停在這個理解，很容易在實務上遇到一些看似奇怪的錯誤，例如：

```txt
Body already used
Cannot read stream twice
body stream already read
```

或是：

```txt
為什麼 request.json() 只能呼叫一次？
為什麼 middleware 先讀過 body 後，後面就讀不到了？
為什麼 webhook 驗簽一定要 raw body？
```

這些問題的核心都來自同一件事：**Header 與 Body 在 runtime 中的處理方式不一樣。**

這篇文章會從 HTTP Request 的結構、Stream、Node.js 與 Fetch API 的角度，一步一步理解：

1. HTTP Request 的真實結構
2. Header 與 Body 分別扮演什麼角色
3. 為什麼 Header 可以重複讀取
4. 為什麼 Body 常常只能讀一次
5. Middleware 與 Webhook 中常見的踩坑情境

---

## HTTP Request 的真實結構

HTTP Request 本質上是一段符合協定格式的資料。

以 HTTP/1.1 來說，一個 Request 大概會長這樣：

```http
POST /api/user HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer xxx
Content-Length: 16

{"name":"Woody"}
```

可以拆成三個主要部分：

```txt
1. Request Line
2. Headers
3. Body
```

整理成結構會像這樣：

```txt
POST /api/user HTTP/1.1   ← Request Line

Host: example.com         ← Headers
Content-Type: application/json
Authorization: Bearer xxx

{"name":"Woody"}          ← Body
```

| 區域 | 用途 |
| --- | --- |
| Request Line | 描述 HTTP method、路徑與協定版本 |
| Headers | 傳遞 metadata，例如格式、認證、快取規則 |
| Body | 傳遞真正的資料內容，也就是 payload |

也就是說，Header 與 Body 雖然都在同一個 HTTP Request 裡，但它們的職責完全不同。

---

## Header 是什麼？

Header 本質上是：

```txt
key-value metadata
```

例如：

```http
Content-Type: application/json
Authorization: Bearer xxx
```

這些資訊通常不是主要資料本身，而是用來描述這次請求的附加資訊，例如：

- 資料格式
- 驗證資訊
- Cookie
- Cache 規則
- 壓縮格式
- Body 長度
- Client 可接受的回應格式

例如：

```http
Content-Type: application/json
```

意思是：

```txt
這次 request body 的格式是 JSON。
```

而：

```http
Authorization: Bearer xxx
```

則是在告訴 Server：

```txt
這個 request 的身份憑證是什麼。
```

所以 Header 比較像是「描述資料的資料」，也就是 metadata。

---

## Body 才是真正的資料內容

Body 則是這次請求真正要傳送的 payload。

例如：

```json
{
  "name": "Woody"
}
```

Body 可以是很多種形式：

- JSON
- Form Data
- File Upload
- Binary Data
- Streaming Data
- 圖片、影片、音訊等大型資料

像 `POST`、`PUT`、`PATCH` 這類 method，通常都會帶 body，因為它們常常代表「我要把某些資料送給伺服器處理」。

::u-alert{type="info"}
Header 描述「這份資料是什麼」，Body 才是「真正被傳送的資料」。
::

---

## HTTP 是一次完整送到 Server 嗎？

很多人會想像：

```txt
Client 把一整個 request 打包好，然後一次完整送到 Server。
```

但底層實際上不是這麼單純。

在 TCP 與 HTTP 的傳輸過程中，資料可能會被切成多個片段送出。尤其 Body 很可能非常大，例如：

- 上傳圖片
- 上傳影片
- 上傳大型 JSON
- AI streaming response
- 音訊串流
- Proxy 轉發大型檔案

如果 Server 每次都必須等 Body 全部進到記憶體後才能處理，那麼上傳一個 10GB 影片就可能直接把記憶體吃爆。

因此，現代 runtime 通常會用：

```txt
Stream（串流）
```

來處理 Body。

---

## 什麼是 Stream？

你可以把 Stream 想像成一條正在流動的水管。

資料不是一次全部出現，而是：

```txt
一小段、一小段地流進來。
```

例如：

```txt
Client
  ↓
chunk 1
chunk 2
chunk 3
  ↓
Server
```

每一小段資料通常會被稱為 chunk。

這種設計的好處是：Server 不需要一次把所有資料放進記憶體，而是可以邊接收、邊處理、邊轉送。

例如：

```txt
上傳 10GB 影片時，不需要先把 10GB 全部讀進 RAM。
```

這就是為什麼 Node.js、Fetch API、Bun、Deno、Uvicorn、FastAPI 等 runtime 或框架都大量使用 Stream 的原因。

---

## 為什麼 Body 常常只能讀一次？

因為：

```txt
讀取 body = 消耗 stream
```

例如在 Fetch API 或許多 Web Runtime 中，我們會寫：

```js
const data = await request.json()
```

這行程式背後其實做了幾件事：

1. 從 body stream 讀取資料
2. 把一段段 chunk 收集起來
3. 將收集到的文字解析成 JSON
4. stream 被 consume 掉

所以如果你這樣寫：

```js
await request.json()
await request.json()
```

第二次通常就會出錯，因為 body stream 已經在第一次被讀完了。

在 Fetch API 中，也可以透過 `bodyUsed` 判斷 body 是否已經被讀取過：

```js
console.log(request.bodyUsed)

const data = await request.json()

console.log(request.bodyUsed)
```

概念上會像這樣：

```txt
第一次讀取：水管裡還有資料，可以讀。
第二次讀取：水管已經流完了，沒有原始 stream 可以再讀。
```

::u-alert{type="warning"}
Body 只能讀一次通常不是 HTTP 協定本身強制規定，而是現代 runtime 使用 stream 處理 body 時產生的行為。
::

---

## Fetch API 中的 Body

在 Fetch API 中，`Request.body` 本身就是一個 `ReadableStream`。

也就是說：

```js
request.body
```

可以理解成：

```txt
一條可讀取的資料流
```

而這些方法：

```js
await request.text()
await request.json()
await request.formData()
await request.arrayBuffer()
```

本質上都會去讀取同一份 body stream。

所以如果你先呼叫：

```js
const text = await request.text()
```

再呼叫：

```js
const json = await request.json()
```

就很可能得到類似錯誤：

```txt
TypeError: body stream already read
```

因為 `text()` 已經把 body stream 消耗掉了，`json()` 沒有第二份原始資料可以再讀。

---

## Header 為什麼可以一直讀？

Header 通常不是以 Stream 的方式提供給應用層使用。

Server 在接收到 request 時，會先解析 Request Line 與 Headers，並把 Headers 整理成類似 key-value 的資料結構。

概念上像這樣：

```js
{
  'content-type': 'application/json',
  authorization: 'Bearer xxx'
}
```

因此你可以反覆讀取：

```js
request.headers.get('authorization')
request.headers.get('authorization')
request.headers.get('authorization')
```

這不會出問題，因為你只是從記憶體中的 metadata object 取值，而不是重新讀取底層資料流。

可以用一句話整理：

```txt
Header 是已解析好的 metadata；Body 是可能仍在流動的資料流。
```

這就是為什麼 Header 通常可以一直讀，而 Body 常常只能讀一次。

---

## Node.js 原生 HTTP 更能看出差異

Node.js 原生 HTTP API 很接近底層，因此更容易看出 Header 與 Body 的差異。

例如：

```js
import http from 'node:http'

http.createServer((req, res) => {
  console.log(req.headers.authorization)

  let body = ''

  req.on('data', chunk => {
    body += chunk
  })

  req.on('end', () => {
    console.log(body)
    res.end('OK')
  })
})
```

在這段程式中：

```js
req.headers
```

是已經解析好的 Header object，可以直接讀取。

但 Body 則是透過：

```js
req.on('data', chunk => {})
req.on('end', () => {})
```

一段一段接收。

Node.js 的 `http.IncomingMessage` 本身繼承自 `stream.Readable`，所以它可以被當成 readable stream 來讀取。這也是為什麼你會看到 `data` 與 `end` 事件。

---

## 為什麼框架中好像可以一直讀 Body？

以 Express 為例，很多人會這樣寫：

```js
app.use(express.json())

app.post('/api/user', (req, res) => {
  console.log(req.body)
  console.log(req.body)
  res.send('OK')
})
```

看起來 `req.body` 好像可以一直讀。

但其實不是原始 body stream 可以一直讀，而是 Express 的 JSON middleware 幫你做了這些事：

```txt
1. 先讀完整個 body stream
2. 將 body parse 成 JSON
3. 把結果存到 req.body
4. 後續讀取 req.body 時，其實是在讀記憶體中的物件
```

所以你以為 Body 可以重複讀，但真正的 stream 早就已經被 consume 掉了。

這也是很多 middleware 問題的根源。

---

## Middleware 很容易踩坑

實務上很常發生這種情境：

```txt
Middleware A 先讀 body
Middleware B 再讀 body
```

結果 Middleware B 爆炸，因為 Body stream 已經被 Middleware A 消耗掉了。

常見踩坑場景包含：

- Logging middleware 想記錄 request body
- Proxy server 想轉發原始 body
- Webhook 驗簽需要 raw body
- AI streaming 需要邊讀邊處理
- Request replay 想把同一個 request 重送

例如：

```js
app.use(async (req, res, next) => {
  // 假設這裡先把 body 讀完
  // 後面的 middleware 就不一定還能讀原始 stream
  next()
})
```

因此在設計 middleware 順序時，要特別注意：

```txt
誰會讀 body？
讀完後有沒有保存？
後面是否還需要 raw body？
```

---

## Stripe Webhook 為什麼常出問題？

Stripe Webhook 是最典型的例子。

Stripe 驗簽需要的是：

```txt
raw body
```

也就是尚未被 JSON parser 改動過的原始 bytes。

原因是 signature 是根據原始 payload 計算出來的。如果你先經過：

```js
express.json()
```

Body 可能已經被 parse 成 JavaScript object。之後就算你再把它 `JSON.stringify()` 回去，也不一定會跟原始 bytes 完全相同。

可能不同的地方包含：

- whitespace
- key 順序
- encoding
- escape 方式
- 換行符號

只要 raw body 不一樣，signature 就可能驗證失敗。

因此 Stripe Webhook 常見做法是：

```txt
在 webhook route 使用 raw body，不要先經過一般 JSON parser。
```

概念上像這樣：

```js
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const rawBody = req.body

  // 用 rawBody 驗證 Stripe signature
  res.sendStatus(200)
})
```

---

## Stream 設計帶來什麼好處？

Body 使用 Stream 設計，最主要是為了：

```txt
效能與記憶體管理
```

假設今天使用者上傳一個 10GB 的影片，如果 Server 必須一次把整個檔案讀進 RAM，成本會非常高，也很容易造成服務不穩定。

Stream 的好處是：

```txt
邊接收
邊處理
邊轉送
```

例如：

- 上傳檔案時邊收邊寫入磁碟
- Proxy server 邊收到資料邊轉發到上游服務
- AI response 邊生成邊送回前端
- 音訊或影片邊下載邊播放

這就是 Stream 在現代 Web 開發中非常重要的原因。

---

## 用一個比喻統整

你可以把 HTTP Request 想成一個貨運包裹。

| Request 部分 | 比喻 | 說明 |
| --- | --- | --- |
| Header | 包裹上的標籤 | 描述包裹資訊，例如格式、身份、長度 |
| Body | 包裹裡的貨物 | 真正被運送的內容 |

Header 像物流標籤，上面寫著：

- 收件資訊
- 包裹類型
- 重量
- 是否需要特殊處理

這些資訊會先被整理好，所以可以一直查看。

Body 則像輸送帶上的貨物。貨物一箱一箱通過，當你拿走之後，輸送帶上就沒有同一箱貨可以再拿一次。

所以：

```txt
Header 可以重複讀，因為它是已解析的 metadata。
Body 常常只能讀一次，因為它是會被 consume 的 stream。
```

---

## 實務開發時應該記住的原則

最後整理幾個實務上很重要的原則：

1. **不要假設 body 可以重複讀取**
   - 如果後面還需要 body，請先保存解析結果或 raw body。

2. **Middleware 順序很重要**
   - 先讀 body 的 middleware 可能會影響後面的 middleware。

3. **Webhook 驗簽通常需要 raw body**
   - 不要在驗簽前先經過 JSON parser。

4. **大型資料應該用 stream 處理**
   - 不要把大型檔案一次全部讀進記憶體。

5. **Header 與 Body 的心智模型要分開**
   - Header 是 metadata object；Body 是 payload stream。

---

## 結論

HTTP Request 中的 Header 與 Body 雖然同屬於 request 的一部分，但它們在 runtime 中的處理方式差很多。

Header：

- 通常會先被解析
- 屬於 metadata
- 可以反覆讀取
- 常以 key-value object 的形式存在

Body：

- 通常代表真正的 payload
- 在現代 runtime 中常以 stream 處理
- 讀取時會 consume stream
- 很多情況下只能讀一次

因此，`body 只能讀一次` 並不是單純因為 HTTP 協定規定，而是現代 runtime 為了效能、記憶體管理與串流處理所採用的設計結果。

理解這件事後，你會更容易看懂：

- Node.js stream
- Fetch API 的 `Request.body`
- Middleware 的執行順序
- Webhook signature verification
- AI streaming response
- Proxy server 的 request forwarding
- FastAPI / Uvicorn / Deno / Bun 等 runtime 的 request lifecycle

當你能把 Header 視為 metadata，把 Body 視為 stream，很多 Web Framework 的底層行為就會變得直覺很多。

---

## 參考資料

- [MDN Web Docs：HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages)
- [MDN Web Docs：Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- [MDN Web Docs：Request.body](https://developer.mozilla.org/en-US/docs/Web/API/Request/body)
- [MDN Web Docs：Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [MDN Web Docs：Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams)
- [Node.js Documentation：Stream](https://nodejs.org/api/stream.html)
- [Node.js Documentation：HTTP](https://nodejs.org/api/http.html)
- [Stripe Docs：Webhook signatures](https://docs.stripe.com/webhooks/signature)
