// jgnext-google: login com Google pelo broker do JGNEXT (sem configurar nada no Google)
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const BROKER = process.env.JGNEXT_BROKER_URL || "https://api.jgnext.com/auth/broker/verify";
// contas criadas pelo próprio visitante? Defina JGNEXT_GOOGLE_SIGNUP=off para só permitir quem já tem conta.
const SIGNUP = (process.env.JGNEXT_GOOGLE_SIGNUP ?? "off") !== "off";

export async function verifyBrokerAssertion(assertion: string, host: string) {
  try {
    const r = await fetch(BROKER, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assertion, app: "https://" + host }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.ok && j.email ? { email: String(j.email).toLowerCase(), name: String(j.name || "") } : null;
  } catch {
    return null;
  }
}

export async function userFromGoogle(p: { email: string; name: string }) {
  const db = prisma as any;
  let user = await db.user.findUnique({ where: { email: p.email } });
  if (!user && SIGNUP) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
    user = await db.user.create({ data: { email: p.email, name: p.name || p.email.split("@")[0], passwordHash } });
  }
  if (!user) return null;
  return { id: user.id as string, name: (user.name ?? undefined) as string | undefined, email: user.email as string, role: user.role as string | undefined };
}
