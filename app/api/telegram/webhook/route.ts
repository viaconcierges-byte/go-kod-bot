import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { processUpdate } from "@/lib/bot/handler";
import { hasBotToken, getBotToken } from "@/lib/bot/telegram";

export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.BOT_SECRET_TOKEN;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const update = await request.json().catch(() => null);
  if (update && typeof update === "object") {
    await processUpdate(update).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

export async function GET(): Promise<Response> {
  const configured = hasBotToken();
  const tokenUsername = configured
    ? (getBotToken().split(":")[0] ?? "set")
    : undefined;
  return NextResponse.json({
    ok: true,
    bot: configured ? "configured" : "missing_token",
    bot_id: tokenUsername,
    path: "/api/telegram/webhook",
  });
}
