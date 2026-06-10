import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, matchesTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";
import { getProfileIdForUser } from "../lib/get-profile-id";
import { sendSseEvent } from "../lib/sse-manager";

const router = Router();

router.get("/messages/:matchId", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);
  const matchId = parseInt(req.params.matchId);

  if (!myId || isNaN(matchId)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [match] = await db
    .select()
    .from(matchesTable)
    .where(and(eq(matchesTable.id, matchId), eq(matchesTable.profileId, myId)));

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.matchId, matchId))
    .orderBy(asc(messagesTable.createdAt));

  res.json(msgs.map((m) => ({
    id: m.id,
    matchId: m.matchId,
    senderProfileId: m.senderProfileId,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/messages/:matchId", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const myId = await getProfileIdForUser(supabaseUserId);
  const matchId = parseInt(req.params.matchId);

  if (!myId || isNaN(matchId)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify ownership of this match
  const [myMatch] = await db
    .select()
    .from(matchesTable)
    .where(and(eq(matchesTable.id, matchId), eq(matchesTable.profileId, myId)));

  if (!myMatch) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({ matchId, senderProfileId: myId, content: parsed.data.content })
    .returning();

  // Find the recipient's match record ID so we can tell them which
  // conversation to refresh (their match ID differs from the sender's).
  const [theirMatch] = await db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(and(
      eq(matchesTable.profileId, myMatch.matchedProfileId),
      eq(matchesTable.matchedProfileId, myId),
    ));

  // Notify the recipient via SSE
  sendSseEvent(myMatch.matchedProfileId, "new_message", {
    theirMatchId: theirMatch?.id ?? null,
    senderProfileId: myId,
  });

  res.status(201).json({
    id: msg.id,
    matchId: msg.matchId,
    senderProfileId: msg.senderProfileId,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  });
});

export default router;
