import { Router } from "express";
import { db } from "@workspace/db";
import { swipesTable, matchesTable, profilesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { RecordSwipeBody } from "@workspace/api-zod";
import { toProfileResponse } from "./profiles";
import { getProfileIdForUser } from "../lib/get-profile-id";
import { sendSseEvent } from "../lib/sse-manager";

const router = Router();

router.post("/swipes", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);

  if (!myId) {
    res.status(404).json({ error: "Profile not found. Please complete your profile setup first." });
    return;
  }

  const parsed = RecordSwipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { targetProfileId, direction } = parsed.data;

  await db
    .insert(swipesTable)
    .values({ swiperProfileId: myId, targetProfileId, direction })
    .onConflictDoNothing();

  if (direction === "like") {
    const [theirLike] = await db
      .select()
      .from(swipesTable)
      .where(and(
        eq(swipesTable.swiperProfileId, targetProfileId),
        eq(swipesTable.targetProfileId, myId),
        eq(swipesTable.direction, "like"),
      ));

    if (theirLike) {
      const existing = await db
        .select()
        .from(matchesTable)
        .where(and(eq(matchesTable.profileId, myId), eq(matchesTable.matchedProfileId, targetProfileId)));

      if (existing.length === 0) {
        const [match] = await db
          .insert(matchesTable)
          .values({ profileId: myId, matchedProfileId: targetProfileId })
          .returning();

        await db
          .insert(matchesTable)
          .values({ profileId: targetProfileId, matchedProfileId: myId })
          .onConflictDoNothing();

        const [matchedProfile] = await db.select().from(profilesTable).where(eq(profilesTable.id, targetProfileId));
        const [myProfile] = await db.select().from(profilesTable).where(eq(profilesTable.id, myId));

        // Notify the other person via SSE that they have a new match
        if (myProfile) {
          sendSseEvent(targetProfileId, "new_match", {
            matchId: match.id,
            profile: toProfileResponse(myProfile),
          });
        }

        res.json({
          matched: true,
          match: {
            id: match.id,
            profileId: match.profileId,
            matchedProfileId: match.matchedProfileId,
            profile: matchedProfile ? toProfileResponse(matchedProfile) : null,
            lastMessage: null,
            lastMessageAt: null,
            createdAt: match.createdAt.toISOString(),
          },
        });
        return;
      }
    }
  }

  res.json({ matched: false });
});

export default router;
