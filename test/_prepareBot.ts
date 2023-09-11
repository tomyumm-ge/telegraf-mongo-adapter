import { Telegraf, Context, session } from "telegraf";
import { MongoAdapter, SessionData, SessionEntity } from "../src";
import { Collection } from "mongodb";

interface BotContext extends Context {
  session: SessionData;
}

export const prepareBot = (
  collection: Collection<SessionEntity>,
  useCache: boolean,
) => {
  const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN);

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
    ctx.session.testDate = new Date();
    await next();
  });

  bot.start(async (ctx) => {
    ctx.session.testNumber = 1;
    ctx.session.testString = "foo";
  });

  return bot;
};
