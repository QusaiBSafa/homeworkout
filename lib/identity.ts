import "server-only";
import { cookies } from "next/headers";

const COOKIE = "hw_uid";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Anonymous, cookie-based identity. No sign-up needed; progress follows the browser. */
export async function getUserId(create: boolean): Promise<string | null> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing && UUID.test(existing)) return existing;
  if (!create) return null;
  const id = crypto.randomUUID();
  store.set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 400, path: "/" });
  return id;
}
