import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable, swipesTable, matchesTable } from "@workspace/db";
import { ne, notInArray, eq, and, gte, count, isNull } from "drizzle-orm";
import { toProfileResponse } from "./profiles";
import { getProfileIdForUser } from "../lib/get-profile-id";

const router = Router();

router.get("/discover", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);
  const limit = parseInt((req.query as Record<string, string>).limit ?? "10") || 10;

  if (!myId) {
    res.json([]);
    return;
  }

  const swiped = await db
    .select({ id: swipesTable.targetProfileId })
    .from(swipesTable)
    .where(eq(swipesTable.swiperProfileId, myId));

  const swipedIds = swiped.map((s) => s.id);
  const excludeIds = [myId, ...swipedIds];

  const profiles = excludeIds.length > 1
    ? await db.select().from(profilesTable).where(notInArray(profilesTable.id, excludeIds)).limit(limit)
    : await db.select().from(profilesTable).where(ne(profilesTable.id, myId)).limit(limit);

  res.json(profiles.map(toProfileResponse));
});

router.get("/discover/stats", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);

  const [totalUsersResult] = await db.select({ count: count() }).from(profilesTable);
  const totalUsers = Number(totalUsersResult?.count ?? 0);

  if (!myId) {
    res.json({ totalUsers, matchesToday: 0, likesReceived: 0, profilesNearby: Math.max(0, totalUsers - 1) });
    return;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [matchesTodayResult] = await db
    .select({ count: count() })
    .from(matchesTable)
    .where(and(eq(matchesTable.profileId, myId), gte(matchesTable.createdAt, todayStart)));
  const matchesToday = Number(matchesTodayResult?.count ?? 0);

  const [likesResult] = await db
    .select({ count: count() })
    .from(swipesTable)
    .where(and(eq(swipesTable.targetProfileId, myId), eq(swipesTable.direction, "like")));
  const likesReceived = Number(likesResult?.count ?? 0);

  res.json({ totalUsers, matchesToday, likesReceived, profilesNearby: Math.max(0, totalUsers - 1) });
});

export default router;
