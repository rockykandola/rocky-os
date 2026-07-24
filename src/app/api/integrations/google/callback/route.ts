import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { exchangeCodeForTokens, getGoogleAccountEmail } from "@/lib/google/oauth";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (error) {
    return NextResponse.redirect(`${origin}/integrations?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/integrations?error=invalid_state`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // Happens if this Google account already granted consent without "prompt=consent"
      // sticking — ask the user to remove access at myaccount.google.com and reconnect.
      return NextResponse.redirect(`${origin}/integrations?error=missing_refresh_token`);
    }
    const email = await getGoogleAccountEmail(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await db.googleAccountConnection.upsert({
      where: { userId_email: { userId: user.id, email } },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scopes: tokens.scope.split(" "),
      },
      create: {
        userId: user.id,
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scopes: tokens.scope.split(" "),
      },
    });

    return NextResponse.redirect(`${origin}/integrations?connected=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${origin}/integrations?error=connection_failed`);
  }
}
