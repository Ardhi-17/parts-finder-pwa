import { User } from "@supabase/supabase-js";

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

export function getUserEmail(user: User | null): string {
  return String(user?.email || "").trim().toLowerCase();
}

export function isAdminUser(user: User | null): boolean {
  const email = getUserEmail(user);

  if (!email) {
    return false;
  }

  if (!adminEmails.length) {
    return false;
  }

  return adminEmails.includes(email);
}
