import { MongoAdapter, SessionEntity } from "../src";
import { Collection, MongoClient } from "mongodb";
import { prepareBot } from "./_prepareBot";
import { Telegraf } from "telegraf";
import { fakeUpdate } from "./_fakeUpdate";

describe("MongoAdapter", () => {
  let bot: Telegraf<any>;
  let collection: Collection<SessionEntity>;
  let connection: MongoClient;

  beforeAll(async () => {
    connection = await MongoClient.connect("mongodb://localhost:27018");
    await connection.connect();
    const db = connection.db("telegraf");
    collection = db.collection<SessionEntity>("sessions");
    bot = prepareBot(collection, false);
  });

  afterAll(() => {
    connection.close(true);
  });

  test("has default variables", () => {
    const adapter = new MongoAdapter({
      collection: null,
    });
    expect(!!adapter.get).toBe(true);
    expect(!!adapter.set).toBe(true);
    expect(!!adapter.delete).toBe(true);
  });

  test("can write to database", async () => {
    const updates = Array(1000)
      .fill(0)
      .map((_, ind) => fakeUpdate(ind + 1));
    await Promise.all(updates.map((el) => bot.handleUpdate(el)));
    const docs = await collection.find().toArray();
    const foundErrors = docs.find(
      (el) => el.data.testNumber !== 1 && el.data.testString !== "foo",
    );
    expect(!!foundErrors).toBe(false);
  });
});
