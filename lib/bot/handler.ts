import { readFileSync } from "node:fs";
import path from "node:path";
import {
  telegram,
  hasBotToken,
  type TelegramReplyMarkup,
} from "@/lib/bot/telegram";
import * as kb from "@/lib/bot/keyboards";
import * as msg from "@/lib/bot/messages";
import { routeData, type Route } from "@/lib/data";
import { routeQrPng } from "@/lib/bot/qr";
import {
  ANALYTICS_OWNER_ID,
  getAnalyticsStats,
  recordBotStart,
  recordPointViewed,
  recordRouteFinished,
  recordShare,
  recordThemeSelected,
} from "@/lib/bot/analytics";

function loadLocalPhoto(
  photo: string
): { file: Blob; filename: string } | null {
  if (!photo) return null;
  try {
    const filePath = path.join(process.cwd(), "public", photo);
    const buffer = readFileSync(filePath);
    return { file: new Blob([buffer]), filename: path.basename(photo) };
  } catch {
    return null;
  }
}

async function sendPointPhoto(
  chatId: number,
  photo: string,
  caption: string,
  reply_markup: TelegramReplyMarkup
): Promise<boolean> {
  const local = loadLocalPhoto(photo);
  if (!local) return false;
  try {
    await telegram.sendPhotoUpload({
      chat_id: chatId,
      file: local.file,
      filename: local.filename,
      caption,
      reply_markup,
    });
    return true;
  } catch {
    return false;
  }
}

async function sendMenu(chatId: number): Promise<void> {
  await telegram.sendMessage({
    chat_id: chatId,
    text: `${msg.menuTitle}\n\n${msg.menuHint}`,
    reply_markup: { inline_keyboard: kb.themeMenuKeyboard() },
  });
}

async function sendGreeting(chatId: number, firstName?: string): Promise<void> {
  const logo = loadLocalPhoto("assets/logo.png");
  if (logo) {
    try {
      await telegram.sendPhotoUpload({
        chat_id: chatId,
        file: logo.file,
        filename: logo.filename,
      });
    } catch {
      // не критично, если не удалось отправить логотип
    }
  }
  await telegram.sendMessage({
    chat_id: chatId,
    text: msg.greetingText(firstName),
  });
  await sendMenu(chatId);
}

function pointIndex(route: Route, pointId: string): number {
  return route.points.findIndex((p) => p.id === pointId);
}

const POINT_DETAIL_LIMIT = 1024;

const detailMessageIds = new Map<number, number>();

async function deleteDetailMessage(chatId: number): Promise<void> {
  const messageId = detailMessageIds.get(chatId);
  if (messageId == null) return;
  detailMessageIds.delete(chatId);
  await telegram
    .deleteMessage({ chat_id: chatId, message_id: messageId })
    .catch(() => {});
}

async function sendRoute(chatId: number, themeId: string): Promise<void> {
  const route = routeData[themeId];
  if (!route || route.points.length === 0) return;

  await recordPointViewed(chatId, themeId, 0, route.points.length);

  await telegram.sendMessage({
    chat_id: chatId,
    text: msg.routeHeader(themeId),
  });

  await editPointSummary(chatId, null, themeId, 0);
}

async function editPointSummary(
  chatId: number,
  messageId: number | null,
  themeId: string,
  index: number
): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;
  const point = route.points[index];
  if (!point) return;

  const caption = msg.pointSummaryCaption(point, index, route.points.length);
  const reply_markup = {
    inline_keyboard: kb.pointKeyboard(
      themeId,
      point.id,
      index,
      route.points.length
    ),
  };

  const sent = await sendPointPhoto(chatId, point.photo, caption, reply_markup);
  if (messageId !== null) {
    await telegram
      .deleteMessage({ chat_id: chatId, message_id: messageId })
      .catch(() => {});
  }
  if (sent) return;

  await telegram.sendMessage({
    chat_id: chatId,
    text: caption,
    reply_markup,
  });
}

async function restorePointSummary(
  chatId: number,
  messageId: number,
  themeId: string,
  index: number
): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;
  const point = route.points[index];
  if (!point) return;

  const caption = msg.pointSummaryCaption(point, index, route.points.length);
  const reply_markup = {
    inline_keyboard: kb.pointKeyboard(
      themeId,
      point.id,
      index,
      route.points.length
    ),
  };

  await telegram.editMessageCaption({
    chat_id: chatId,
    message_id: messageId,
    caption,
    reply_markup,
  });
}

async function editPointDetail(
  chatId: number,
  messageId: number,
  themeId: string,
  pointId: string
): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;
  const point = route.points.find((p) => p.id === pointId);
  if (!point) return;

  const detail = msg.pointDetailCaption(point);
  const reply_markup = { inline_keyboard: kb.detailKeyboard(themeId, pointId) };

  if (detail.length > POINT_DETAIL_LIMIT) {
    const sent = await telegram.sendMessage({
      chat_id: chatId,
      text: detail,
      parse_mode: "HTML",
      reply_markup,
    });
    detailMessageIds.set(chatId, sent.message_id);
    return;
  }

  await telegram.editMessageCaption({
    chat_id: chatId,
    message_id: messageId,
    caption: detail,
    parse_mode: "HTML",
    reply_markup,
  });
}

async function editRouteEnd(
  chatId: number,
  messageId: number,
  themeId: string
): Promise<void> {
  await telegram.editMessageCaption({
    chat_id: chatId,
    message_id: messageId,
    caption: msg.endText(),
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kb.endKeyboard(themeId, chatId) },
  });
}

async function sendShareQr(chatId: number, themeId: string): Promise<void> {
  const route = routeData[themeId];
  if (!route) return;

  const qr = await routeQrPng(themeId);
  await telegram.sendPhotoUpload({
    chat_id: chatId,
    file: new Blob([new Uint8Array(qr)], { type: "image/png" }),
    filename: `qr-${themeId}.png`,
    caption: msg.shareQrCaption(route),
    reply_markup: { inline_keyboard: kb.shareResultKeyboard(chatId) },
  });
}

async function handleStats(chatId: number): Promise<void> {
  if (chatId !== ANALYTICS_OWNER_ID) {
    await telegram.sendMessage({
      chat_id: chatId,
      text: msg.statsDeniedText(),
    });
    return;
  }
  try {
    const stats = await getAnalyticsStats();
    await telegram.sendMessage({
      chat_id: chatId,
      text: msg.statsText(stats),
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("Failed to load stats:", err);
  }
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
    await recordBotStart(chatId);
    const deepLink = text.slice("/start".length).trim();
    if (deepLink.startsWith("route_")) {
      const themeId = deepLink.slice("route_".length);
      if (routeData[themeId]) await recordThemeSelected(chatId, themeId);
    }
    await sendGreeting(chatId, firstName);
    return;
  }
  if (text === "/stats") {
    await handleStats(chatId);
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
    await deleteDetailMessage(chatId);
    await sendMenu(chatId);
    return;
  }
  if (data.startsWith("theme:")) {
    const themeId = data.slice("theme:".length);
    if (kb.isKnownTheme(themeId)) {
      await recordThemeSelected(chatId, themeId);
      await sendRoute(chatId, themeId);
    }
    return;
  }
  if (data.startsWith("detail:")) {
    const parts = data.slice("detail:".length).split(":");
    if (parts.length >= 2) {
      await editPointDetail(chatId, messageId, parts[0], parts[1]);
    }
    return;
  }
  if (data.startsWith("back:")) {
    const parts = data.slice("back:".length).split(":");
    if (parts.length >= 2) {
      const themeId = parts[0];
      const pointId = parts[1];
      const route = routeData[themeId];
      const index = route ? pointIndex(route, pointId) : -1;

      const hadDetailMessage = detailMessageIds.has(chatId);
      await deleteDetailMessage(chatId);

      if (!hadDetailMessage && route && index >= 0) {
        await restorePointSummary(chatId, messageId, themeId, index);
      }
    }
    return;
  }
  if (data.startsWith("nav:")) {
    const parts = data.slice("nav:".length).split(":");
    if (parts.length >= 2) {
      const route = routeData[parts[0]];
      const index = route ? pointIndex(route, parts[1]) : -1;
      if (route && index >= 0 && index + 1 < route.points.length) {
        await recordPointViewed(
          chatId,
          parts[0],
          index + 1,
          route.points.length
        );
        await deleteDetailMessage(chatId);
        await editPointSummary(chatId, messageId, parts[0], index + 1);
      }
    }
    return;
  }
  if (data.startsWith("prev:")) {
    const parts = data.slice("prev:".length).split(":");
    if (parts.length >= 2) {
      const route = routeData[parts[0]];
      const index = route ? pointIndex(route, parts[1]) : -1;
      if (route && index > 0) {
        await recordPointViewed(
          chatId,
          parts[0],
          index - 1,
          route.points.length
        );
        await deleteDetailMessage(chatId);
        await editPointSummary(chatId, messageId, parts[0], index - 1);
      }
    }
    return;
  }
  if (data.startsWith("finish:")) {
    const themeId = data.slice("finish:".length);
    if (routeData[themeId]) {
      await recordRouteFinished(chatId, themeId);
      await deleteDetailMessage(chatId);
      await editRouteEnd(chatId, messageId, themeId);
    }
    return;
  }
  if (data.startsWith("share:")) {
    const themeId = data.slice("share:".length);
    if (routeData[themeId]) {
      await recordShare(chatId);
      await sendShareQr(chatId, themeId);
    }
    return;
  }
  if (data === "excursion") {
    await telegram.sendMessage({
      chat_id: chatId,
      text: msg.endText(),
      parse_mode: "HTML",
    });
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
