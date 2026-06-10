import { Router } from "express";
import { db } from "@workspace/db";
import { swipesTable, profilesTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { toProfileResponse } from "./profiles";
import { getProfileIdForUser } from "../lib/get-profile-id";

const router = Router();

// Profiles that swiped "like" on the current user, but who the user hasn't swiped back on yet
router.get("/likes/received", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);

  if (!myId) {
    res.json([]);
    return;
  }

  // Everyone who liked me
  const likers = await db
    .select({ id: swipesTable.swiperProfileId })
    .from(swipesTable)
    .where(and(eq(swipesTable.targetProfileId, myId), eq(swipesTable.direction, "like")));

  if (likers.length === 0) {
    res.json([]);
    return;
  }

  const likerIds = likers.map((l) => l.id);

  // Among those, find which ones I've already swiped back on
  const iSwipedBack = await db
    .select({ id: swipesTable.targetProfileId })
    .from(swipesTable)
    .where(and(eq(swipesTable.swiperProfileId, myId), inArray(swipesTable.targetProfileId, likerIds)));

  const swipedBackIds = new Set(iSwipedBack.map((s) => s.id));
  const pendingLikerIds = likerIds.filter((id) => !swipedBackIds.has(id));

  if (pendingLikerIds.length === 0) {
    res.json([]);
    return;
  }

  const profiles = await db
    .select()
    .from(profilesTable)
    .where(inArray(profilesTable.id, pendingLikerIds));

  res.json(profiles.map(toProfileResponse));
});

export default router;
