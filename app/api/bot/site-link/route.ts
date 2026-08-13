import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { recordSiteClick } from "@/lib/bot/analytics";

const SITE_URL = "https://spbkod.ru";

export async function GET(request: NextRequest): Promise<Response> {
  const chatId = Number(new URL(request.url).searchParams.get("chatId"));
  if (!Number.isNaN(chatId)) {
    await recordSiteClick(chatId);
  }
  return NextResponse.redirect(SITE_URL, 302);
}
