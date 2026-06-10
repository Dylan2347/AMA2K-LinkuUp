import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateProfileBody, UpdateMyProfileBody } from "@workspace/api-zod";
import { getProfileIdForUser } from "../lib/get-profile-id";

const router = Router();

router.get("/profiles", async (req, res) => {
  const profiles = await db.select().from(profilesTable);
  res.json(profiles.map(toProfileResponse));
});

router.post("/profiles", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const parsed = CreateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, age, gender, lookingFor, city, bio, photoUrl, photos, interests } = parsed.data;
  const [profile] = await db
    .insert(profilesTable)
    .values({
      supabaseUserId,
      name, age, gender, lookingFor, city, bio, photoUrl,
      photos: photos ?? [],
      interests: interests ?? [],
    })
    .onConflictDoUpdate({
      target: profilesTable.supabaseUserId,
      set: { name, age, gender, lookingFor, city, bio, photoUrl, photos: photos ?? [], interests: interests ?? [] },
    })
    .returning();
  res.status(201).json(toProfileResponse(profile));
});

router.get("/profiles/me", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.supabaseUserId, supabaseUserId));
  if (!profile) {
    res.status(404).json({ error: "No profile found" });
    return;
  }
  res.json(toProfileResponse(profile));
});

router.patch("/profiles/me", async (req, res) => {
  const supabaseUserId: string = res.locals.supabaseUserId;
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.supabaseUserId, supabaseUserId))
    .returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(toProfileResponse(profile));
});

router.get("/profiles/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, id));
  if (!profile) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toProfileResponse(profile));
});

export function toProfileResponse(p: typeof profilesTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    lookingFor: p.lookingFor,
    city: p.city,
    bio: p.bio,
    photoUrl: p.photoUrl,
    photos: p.photos ?? [],
    interests: p.interests ?? [],
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
