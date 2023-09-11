# MongoDB Session Store Adapter

Session store for default [Telegraf 4.13+](https://github.com/telegraf/telegraf) middleware driven by MongoDB with full async and TypeScript support

## Requirements

- Bot token
- NodeJS >= 14

## Installation

```js
npm install --save telegraf-mongo-adapter
```

## Using

```ts
import {MongoAdapter, SessionData} from 'telegraf-mongo-adapter'
import {Telegraf} from 'telegraf'
import {MongoClient} from "mongodb";
import {SessionEntity} from "./interfaces";
import {prepareBot} from "./_prepareBot";

const setupBot = async (): Telegraf => {
  const client = MongoClient('mongodb://localhost:27017')
  await client.connect()

  const db = client.db('telegraf')
  const collection = db.collection<SessionEntity>('sessions')

  const bot = new Telegraf('INSERT TOKEN HERE')
  // ... or use env instead
  // const bot = new Telegraf(process.env.BOT_TOKEN)

  bot.use(
    session({
      property: "session",
      store: new MongoAdapter<SessionData>({
        collection,
        botId: "test",
        useCache,
      }),
    }),
  );

  bot.use(async (ctx, next) => {
    ctx.session.testDate = new Date() // <-- this will be stored in collection
  })

  bot.start(async (ctx) => {
    ctx.session.testNumber = 123 // <-- and this
    ctx.session.testString = 'foo' // <-- and even this

    // ... some your logic
  })

  return bot
}

// somewhere we can launch this

const main = async () => {
  const bot = await prepareBot()
  await bot.launch()
}

main()
  .catch(console.error)
```

`SessionData` is TS interface with keys and type of values

`collection` is mongodb powered collection provided by your connection

## Debugging

Add `DEBUG=telegraf:*` to your env variables

To debug only mongo adapter you should set `DEBUG=telegraf:mongo-adapter`

## Testing

You should have Docker to be installed for starting mongo instance

```js
npm run test
```
