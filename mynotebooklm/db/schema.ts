import {
  pgTable,
  text,
  vector,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
  thread_id: uuid("thread_id").primaryKey().defaultRandom(),
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
  embedding: vector("embedding", { dimensions: 1536 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
