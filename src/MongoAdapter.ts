import { MongoAdapterOptions, SessionData, SessionEntity } from "./interfaces";
import { AsyncSessionStore } from "telegraf/typings/session";
import { Collection } from "mongodb";
import debug from "debug";

/**
 * MongoAdapter
 * @class MongoAdapter
 * @classdesc The MongoAdapter class is used to store the session data in a MongoDB database.
 * @implements {AsyncSessionStore}
 * @template T
 * @param {MongoAdapterOptions} options - The options for the MongoAdapter
 * @param {Collection<SessionEntity>} options.collection - The MongoDB collection
 * @param {string} [options.botId] - The bot ID
 * @param {boolean} [options.useCache] - Whether to use the cache
 * @example
 * import { MongoAdapter } from "telegraf-session-mongodb";
 * import { SessionsCollection } from "./index";
 *
 * const adapter = new MongoAdapter({
 *  collection: SessionsCollection,
 *  botId: "test",
 *  useCache: true,
 * });
 */
class MongoAdapter<T extends SessionData> implements AsyncSessionStore<T> {
  private readonly store = new Map<string, T>();
  private readonly collection: Collection<SessionEntity>;
  private readonly bot: string;
  private readonly useCache: boolean;

  constructor(options: MongoAdapterOptions) {
    const defaultOptions = {
      botId: "bot",
      useCache: false,
    };
    options = Object.assign(defaultOptions, options);
    this.collection = options.collection;
    this.useCache = !!options.useCache;
    if (options.botId) {
      this.bot = options.botId;
    }
  }

  async get(key: string): Promise<T | undefined> {
    debug(`MongoAdapter.get ${key}`);
    let id: string | number;
    if (!isNaN(parseInt(key))) {
      id = parseInt(key);
    } else {
      id = key;
    }
    const entry = this.store.get(key);
    if (entry && this.useCache) {
      return entry as T;
    } else {
      const doc = await this.collection.findOne({ id, bot: this.bot });
      debug(`MongoAdapter.get got doc with _id ${doc?._id.toString()}`);
      if (doc) {
        return doc.data as T;
      }
      return {} as T;
    }
  }

  async set(key: string, value: T): Promise<void> {
    debug(`MongoAdapter.set ${key}: ${value}`);
    let id: string | number;
    if (!isNaN(parseInt(key))) {
      id = parseInt(key);
    } else {
      id = key;
    }
    if (this.useCache) {
      this.store.set(key, value);
    }
    await this.collection.updateOne(
      { id, bot: this.bot },
      {
        $set: { data: value },
      },
      { upsert: true },
    );
  }

  async delete(key: string): Promise<void> {
    debug(`MongoAdapter.delete ${key}`);
    if (this.useCache) {
      this.store.delete(key);
    }
  }
}

export default MongoAdapter;
