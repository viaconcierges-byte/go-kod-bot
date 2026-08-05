import { telegram, hasBotToken } from "@/lib/bot/telegram";
import * as kb from "@/lib/bot/keyboards";
import * as msg from "@/lib/bot/messages";
import { routeData } from "@/lib/data";

function publicOrigin(): string | null {
  const direct = process.env.BOT_PUBLIC_URL;
  if (direct && direct.trim()) return direct.trim().replace(/\/+$/, "");
  const webhook = process.env.BOT_WEBHOOK_URL;
  if (webhook && webhook.trim()) {
    try {
      return new URL(webhook).origin;
    } catch {
      return null;
    }
  }
  return null;
}

function photoUrl(photo: string): string | null {
  const origin = publicOrigin();
  if (!origin || !photo) return null;
  return `${origin}${photo}`;
}

async function sendMenu(chatId: number): Promise<void> {
  await telegram.sendMessage({
    chat_id: chatId,
    text: `${msg.menuTitle}\n\n${msg.menuHint}`,
    reply_markup: { inline_keyboard: kb.themeMenuKeyboard() },
  });
}

async function sendGreeting(chatId: number, firstName?: string): Promise<void> {
  await telegram.sendMessage({
    chat_id: chatId,
    text: msg.greetingText(firstName),
  });
  await sendMenu(chatId);
}

async function sendRoute(chatId: number, themeId: string): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;

  await telegram.sendMessage({
    chat_id: chatId,
    text: msg.routeHeader(themeId),
  });

  for (const [index, point] of route.points.entries()) {
    const caption = msg.pointSummaryCaption(point, index);
    const url = photoUrl(point.photo);
    const reply_markup = {
      inline_keyboard: kb.pointKeyboard(themeId, point.id),
    };
    if (url) {
      try {
        await telegram.sendPhoto({
          chat_id: chatId,
          photo: url,
          caption,
          reply_markup,
        });
        continue;
      } catch {
        // если фото недоступно — отправим текстом
      }
    }
    await telegram.sendMessage({
      chat_id: chatId,
      text: caption,
      reply_markup,
    });
  }

  await telegram.sendMessage({
    chat_id: chatId,
    text: msg.endText(),
    reply_markup: { inline_keyboard: kb.endKeyboard() },
  });
}

async function sendPointDetail(
  chatId: number,
  themeId: string,
  pointId: string
): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;
  const point = route.points.find((p) => p.id === pointId);
  if (!point) return;

  const text = msg.pointDetailCaption(point);
  const reply_markup = { inline_keyboard: kb.detailKeyboard(themeId, pointId) };
  const url = photoUrl(point.photo);
  if (url) {
    try {
      await telegram.sendPhoto({
        chat_id: chatId,
        photo: url,
        caption: text,
        reply_markup,
      });
      return;
    } catch {
      // фото недоступно — отправим текстом
    }
  }
  await telegram.sendMessage({ chat_id: chatId, text, reply_markup });
}

async function editBackToRoute(
  chatId: number,
  messageId: number,
  themeId: string,
  pointId: string
): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;
  const index = route.points.findIndex((p) => p.id === pointId);
  if (index === -1) return;
  const point = route.points[index];

  await telegram.editMessageCaption({
    chat_id: chatId,
    message_id: messageId,
    caption: msg.pointSummaryCaption(point, index),
    reply_markup: { inline_keyboard: kb.pointKeyboard(themeId, pointId) },
  });
}

async function handleMessage(payload: Record<string, unknown>): Promise<void> {
  const message = payload.message as
    | { chat: { id: number }; text?: string; from?: { first_name?: string } }
    | undefined;
  if (!message || !message.chat) return;

  const chatId = message.chat.id;
  const text = (message.text ?? "").trim();
  const firstName = message.from?.first_name;

  if (text.startsWith("/start")) {
    await sendGreeting(chatId, firstName);
    return;
  }
  if (text === "/help") {
    await telegram.sendMessage({ chat_id: chatId, text: msg.helpText() });
    return;
  }
  if (text === "/about") {
    await telegram.sendMessage({ chat_id: chatId, text: msg.aboutText() });
    return;
  }
  await telegram.sendMessage({ chat_id: chatId, text: msg.unknownText() });
  await sendMenu(chatId);
}

async function handleCallbackQuery(
  payload: Record<string, unknown>
): Promise<void> {
  const query = payload.callback_query as
    | {
        id: string;
        data?: string;
        message?: { chat: { id: number }; message_id: number };
      }
    | undefined;
  if (!query || !query.message) return;

  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data ?? "";

  try {
    await telegram.answerCallbackQuery(query.id);
  } catch {
    // не критично, если не удалось ответить
  }

  if (data === "menu") {
    await sendMenu(chatId);
    return;
  }
  if (data.startsWith("theme:")) {
    const themeId = data.slice("theme:".length);
    if (kb.isKnownTheme(themeId)) await sendRoute(chatId, themeId);
    return;
  }
  if (data.startsWith("detail:")) {
    const parts = data.slice("detail:".length).split(":");
    if (parts.length >= 2) await sendPointDetail(chatId, parts[0], parts[1]);
    return;
  }
  if (data.startsWith("back:")) {
    const parts = data.slice("back:".length).split(":");
    if (parts.length >= 2) {
      await editBackToRoute(chatId, messageId, parts[0], parts[1]);
    }
    return;
  }
}

export async function processUpdate(update: unknown): Promise<void> {
  if (!hasBotToken()) return;
  if (!update || typeof update !== "object") return;
  const payload = update as Record<string, unknown>;

  if (payload.callback_query) {
    await handleCallbackQuery(payload);
    return;
  }
  if (payload.message) {
    await handleMessage(payload);
    return;
  }
}
