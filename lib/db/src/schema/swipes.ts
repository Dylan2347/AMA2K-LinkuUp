import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const swipesTable = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperProfileId: integer("swiper_profile_id").notNull().references(() => profilesTable.id),
  targetProfileId: integer("target_profile_id").notNull().references(() => profilesTable.id),
  direction: text("direction").notNull(), // 'like' | 'pass'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSwipe: unique().on(table.swiperProfileId, table.targetProfileId),
}));

export type Swipe = typeof swipesTable.$inferSelect;
