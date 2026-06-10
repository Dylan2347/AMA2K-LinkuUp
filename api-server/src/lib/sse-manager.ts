import type { Response } from "express";

interface SseConnection {
  res: Response;
  pingInterval: ReturnType<typeof setInterval>;
}

const connections = new Map<number, SseConnection>();

export function registerSseConnection(profileId: number, res: Response): void {
  // Clean up any stale connection for this profile
  removeSseConnection(profileId);

  // Send a keepalive ping every 25 seconds so proxies don't drop the connection
  const pingInterval = setInterval(() => {
    try {
      res.write(":ping\n\n");
    } catch {
      removeSseConnection(profileId);
    }
  }, 25_000);

  connections.set(profileId, { res, pingInterval });
}

export function removeSseConnection(profileId: number): void {
  const conn = connections.get(profileId);
  if (conn) {
    clearInterval(conn.pingInterval);
    connections.delete(profileId);
  }
}

export function sendSseEvent(profileId: number, event: string, data: unknown): void {
  const conn = connections.get(profileId);
  if (!conn) return;
  try {
    conn.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    removeSseConnection(profileId);
  }
}
