import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { getProfileIdForUser } from "../lib/get-profile-id";
import { registerSseConnection, removeSseConnection } from "../lib/sse-manager";

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";

const router = Router();

// GET /events?token=<access_token>
// EventSource API does not support custom headers, so the token is passed as a
// query parameter and verified here before upgrading to an SSE stream.
router.get("/events", async (req, res) => {
  const token = (req.query as Record<string, string>).token;
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  // Verify the Supabase JWT
  let supabaseUserId: string;
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    supabaseUserId = data.user.id;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profileId = await getProfileIdForUser(supabaseUserId);
  if (!profileId) {
    // User is authenticated but has no profile yet — send 204 so the client
    // knows not to retry immediately (profile setup is still pending).
    res.status(204).end();
    return;
  }

  // Upgrade to SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable Nginx buffering if present
  res.flushHeaders();

  registerSseConnection(profileId, res);
  req.log.info({ profileId }, "SSE client connected");

  // Send an initial connected event
  res.write(`event: connected\ndata: {"profileId":${profileId}}\n\n`);

  req.on("close", () => {
    removeSseConnection(profileId);
    req.log.info({ profileId }, "SSE client disconnected");
  });
});

export default router;
