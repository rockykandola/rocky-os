import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

/**
 * Returns the signed-in user's app-level profile row, creating it on first
 * sign-in if it doesn't exist yet (Supabase auth.users and our public.users
 * table are kept in sync lazily rather than via a DB trigger).
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return db.user.upsert({
    where: { id: authUser.id },
    update: { email: authUser.email! },
    create: {
      id: authUser.id,
      email: authUser.email!,
      fullName: (authUser.user_metadata?.full_name as string | undefined) ?? null,
    },
  });
}

/** Same as getCurrentUser but redirects to /login when unauthenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
