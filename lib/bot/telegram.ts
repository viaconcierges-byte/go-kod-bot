const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

export function getBotToken(): string {
  return BOT_TOKEN;
}

export function hasBotToken(): boolean {
  return BOT_TOKEN.length > 0;
}

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramReplyMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramMessageParams {
  chat_id: number;
  text: string;
  reply_markup?: TelegramReplyMarkup;
  parse_mode?: "HTML";
}

export interface TelegramPhotoParams {
  chat_id: number;
  photo: string;
  caption?: string;
  reply_markup?: TelegramReplyMarkup;
}

export interface TelegramPhotoUploadParams {
  chat_id: number;
  file: Blob;
  filename: string;
  caption?: string;
  reply_markup?: TelegramReplyMarkup;
}

export interface TelegramEditCaptionParams {
  chat_id: number;
  message_id: number;
  caption?: string;
  reply_markup?: TelegramReplyMarkup;
  parse_mode?: "HTML";
}

export interface TelegramDeleteMessageParams {
  chat_id: number;
  message_id: number;
}

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

async function callApi<T>(method: string, params: object): Promise<T> {
  if (!hasBotToken()) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменной окружения");
  }
  const res = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${method} (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { ok: boolean; result: T };
  if (!json.ok) {
    throw new Error(`Telegram API ${method} вернул ok: false`);
  }
  return json.result;
}

async function callApiMultipart<T>(method: string, form: FormData): Promise<T> {
  if (!hasBotToken()) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменной окружения");
  }
  const res = await fetch(apiUrl(method), {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${method} (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { ok: boolean; result: T };
  if (!json.ok) {
    throw new Error(`Telegram API ${method} вернул ok: false`);
  }
  return json.result;
}

export const telegram = {
  async sendMessage(params: TelegramMessageParams) {
    return callApi<{ message_id: number }>("sendMessage", params);
  },
  async sendPhoto(params: TelegramPhotoParams) {
    return callApi<unknown>("sendPhoto", params);
  },
  async sendPhotoUpload(params: TelegramPhotoUploadParams) {
    const form = new FormData();
    form.append("chat_id", String(params.chat_id));
    form.append("photo", params.file, params.filename);
    if (params.caption) form.append("caption", params.caption);
    if (params.reply_markup) {
      form.append("reply_markup", JSON.stringify(params.reply_markup));
    }
    return callApiMultipart<unknown>("sendPhoto", form);
  },
  async editMessageCaption(params: TelegramEditCaptionParams) {
    return callApi<unknown>("editMessageCaption", params);
  },
  async deleteMessage(params: TelegramDeleteMessageParams) {
    return callApi<unknown>("deleteMessage", params);
  },
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string
  ): Promise<void> {
    await callApi<unknown>("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
    });
  },
  async getMe() {
    return callApi<{ id: number; username: string; is_bot: boolean }>(
      "getMe",
      {}
    );
  },
  async setWebhook(params: { url: string; secret_token?: string }) {
    return callApi<boolean>("setWebhook", {
      url: params.url,
      ...(params.secret_token ? { secret_token: params.secret_token } : {}),
    });
  },
};
