import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { matchesTable } from "./matches";
import { profilesTable } from "./profiles";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matchesTable.id),
  senderProfileId: integer("sender_profile_id").notNull().references(() => profilesTable.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messagesTable.$inferSelect;
