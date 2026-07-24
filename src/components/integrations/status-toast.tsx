"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google integration isn't configured yet — set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.",
  invalid_state: "That connection attempt expired or was tampered with. Try again.",
  missing_refresh_token: "Google didn't return a refresh token. Remove Rocky OS access at myaccount.google.com/permissions, then reconnect.",
  connection_failed: "Couldn't connect that account. Try again.",
};

export function StatusToast({ connected, error }: { connected?: string; error?: string }) {
  useEffect(() => {
    if (connected) toast.success(`Connected ${connected}.`);
    if (error) toast.error(ERROR_MESSAGES[error] ?? "Something went wrong connecting Google.");
  }, [connected, error]);

  return null;
}
