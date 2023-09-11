import { Collection, ObjectId } from "mongodb";

export interface SessionData {
  [key: string]: any;
}

export interface SessionEntity {
  _id: ObjectId;
  id: string | number;
  bot: string;
  createDate?: Date;
  data: SessionData;
  [key: string]: any;
}

export interface MongoAdapterOptions {
  collection: Collection<SessionEntity>;
  botId?: string;
  useCache?: boolean;
}
