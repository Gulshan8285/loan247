import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const PASSWORD_FILE = path.join("/tmp", "loan247-admin-password.json");
export const ADMIN_PASSWORD_CHANGE_EMAIL = "Gulshanyadav62000@gmail.com";

export async function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;

  try {
    const raw = await readFile(PASSWORD_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.password === "string" && parsed.password.length >= 8) {
      return parsed.password;
    }
  } catch {
    /* use configured fallback */
  }

  if (process.env.NODE_ENV !== "production") return "loan247-admin";
  return "";
}

export async function setAdminPassword(password: string) {
  await mkdir(path.dirname(PASSWORD_FILE), { recursive: true });
  await writeFile(PASSWORD_FILE, JSON.stringify({ password, updatedAt: new Date().toISOString() }));
}
