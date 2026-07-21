import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  bigint,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    passwordHash: text('password_hash'),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text('refresh_token').notNull(),
    userAgent: text('user_agent'),
    ip: varchar('ip', { length: 45 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('sessions_user_idx').on(table.userId),
    tokenIdx: uniqueIndex('sessions_token_idx').on(table.refreshToken),
  })
);

export const repositories = pgTable(
  'repositories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    url: text('url'),
    branch: varchar('branch', { length: 255 }).default('main'),
    source: varchar('source', { length: 50 }).notNull().default('url'),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    language: varchar('language', { length: 50 }),
    description: text('description'),
    fileCount: integer('file_count').default(0),
    totalSize: bigint('total_size', { mode: 'number' }).default(0),
    errorMsg: text('error_msg'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('repositories_user_idx').on(table.userId),
  })
);

export const files = pgTable(
  'files',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => repositories.id, { onDelete: 'cascade' }),
    path: text('path').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    extension: varchar('extension', { length: 50 }),
    size: integer('size'),
    contentHash: varchar('content_hash', { length: 64 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    repoIdx: index('files_repo_idx').on(table.repositoryId),
    pathIdx: index('files_path_idx').on(table.path),
  })
);

export const fileMetadata = pgTable('file_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: uuid('file_id')
    .notNull()
    .references(() => files.id, { onDelete: 'cascade' }),
  functions: jsonb('functions').default([]),
  classes: jsonb('classes').default([]),
  imports: jsonb('imports').default([]),
  exports: jsonb('exports').default([]),
  comments: jsonb('comments').default([]),
  routes: jsonb('routes').default([]),
});

export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fileId: uuid('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    tokens: integer('tokens'),
    embeddingId: varchar('embedding_id', { length: 255 }),
    startLine: integer('start_line'),
    endLine: integer('end_line'),
  },
  (table) => ({
    fileIdx: index('chunks_file_idx').on(table.fileId),
  })
);

export const chats = pgTable(
  'chats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    repositoryId: uuid('repository_id').references(() => repositories.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).default('New Chat'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('chats_user_idx').on(table.userId),
  })
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).notNull(),
    content: text('content').notNull(),
    citations: jsonb('citations').default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    chatIdx: index('messages_chat_idx').on(table.chatId),
  })
);