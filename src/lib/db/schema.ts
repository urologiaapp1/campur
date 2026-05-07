import { pgTable, serial, text, varchar, boolean, integer, timestamp, date, jsonb } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 10 }).notNull().default('🏷️'),
  color: varchar('color', { length: 30 }).notNull().default('#2563eb'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const convenios = pgTable('convenios', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  discountText: varchar('discount_text', { length: 100 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  periods: jsonb('periods').$type<string[]>().default([]),
  physicalAddress: text('physical_address'),
  webUrl: text('web_url'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  views: integer('views').notNull().default(0),
  active: boolean('active').notNull().default(true),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  proposerName: varchar('proposer_name', { length: 100 }),
  proposerEmail: varchar('proposer_email', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const convenioImages = pgTable('convenio_images', {
  id: serial('id').primaryKey(),
  convenioId: integer('convenio_id').notNull().references(() => convenios.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

export type Category = typeof categories.$inferSelect;
export type Convenio = typeof convenios.$inferSelect;
export type ConvenioImage = typeof convenioImages.$inferSelect;
export type Admin = typeof admins.$inferSelect;
