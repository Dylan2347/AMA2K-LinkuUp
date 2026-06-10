import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, profilesTable, messagesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { toProfileResponse } from "./profiles";
import { getProfileIdForUser } from "../lib/get-profile-id";

const router = Router();

router.get("/matches", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);

  if (!myId) {
    res.json([]);
    return;
  }

  const myMatches = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.profileId, myId))
    .orderBy(desc(matchesTable.createdAt));

  const result = await Promise.all(
    myMatches.map(async (match) => {
      const [matchedProfile] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, match.matchedProfileId));

      const [lastMsg] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.matchId, match.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      return {
        id: match.id,
        profileId: match.profileId,
        matchedProfileId: match.matchedProfileId,
        profile: matchedProfile ? toProfileResponse(matchedProfile) : null,
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.createdAt?.toISOString() ?? null,
        createdAt: match.createdAt.toISOString(),
      };
    }),
  );

  res.json(result);
});

router.delete("/matches/:id", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);
  const id = parseInt(req.params.id);

  if (!myId || isNaN(id)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [match] = await db
    .select()
    .from(matchesTable)
    .where(and(eq(matchesTable.id, id), eq(matchesTable.profileId, myId)));

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  await db.delete(matchesTable).where(eq(matchesTable.id, id));
  await db.delete(matchesTable).where(
    and(eq(matchesTable.profileId, match.matchedProfileId), eq(matchesTable.matchedProfileId, myId)),
  );

  res.status(204).send();
});

export default router;
