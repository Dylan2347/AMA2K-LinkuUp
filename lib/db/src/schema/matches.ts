import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  matchedProfileId: integer("matched_profile_id").notNull().references(() => profilesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Match = typeof matchesTable.$inferSelect;
