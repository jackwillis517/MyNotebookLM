import {
  pgTable,
  text,
  vector,
  jsonb,
  timestamp,
  uuid,
  customType,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
  toDriver(value: string): string {
    return value;
  },
  fromDriver(value: string): string {
    return value;
  },
});

export const chats = pgTable("chats", {
  thread_id: uuid("thread_id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  thread_id: uuid("thread_id").references(() => chats.thread_id, {
    onDelete: "cascade",
  }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  thread_id: uuid("thread_id").references(() => chats.thread_id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const embeddings = pgTable("embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  file_id: uuid("file_id").references(() => files.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  tsVector: tsvector("ts_vector"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
