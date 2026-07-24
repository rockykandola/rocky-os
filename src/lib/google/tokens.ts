import "server-only";
import { db } from "@/lib/db";
import { refreshAccessToken } from "./oauth";
import type { GoogleAccountConnection } from "@/generated/prisma/client";

const EXPIRY_BUFFER_MS = 60_000;

/** Returns a valid access token for this connection, refreshing and persisting it if needed. */
export async function getValidAccessToken(connection: GoogleAccountConnection): Promise<string> {
  if (connection.expiresAt.getTime() - EXPIRY_BUFFER_MS > Date.now()) {
    return connection.accessToken;
  }

  const refreshed = await refreshAccessToken(connection.refreshToken);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await db.googleAccountConnection.update({
    where: { id: connection.id },
    data: { accessToken: refreshed.access_token, expiresAt },
  });

  return refreshed.access_token;
}
