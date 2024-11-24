// db/emailSchema.js
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(), // Nuevo campo para el nombre del usuario
  source: varchar('source', { length: 50 }).notNull(), // Campo para el nombre de la aplicación
  createdAt: timestamp('created_at').defaultNow(),
});
