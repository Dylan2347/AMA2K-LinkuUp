import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getProfileIdForUser(supabaseUserId: string): Promise<number | null> {
  const [profile] = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(eq(profilesTable.supabaseUserId, supabaseUserId));
  return profile?.id ?? null;
}
