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
}

export interface TelegramPhotoParams {
  chat_id: number;
  photo: string;
  caption?: string;
  reply_markup?: TelegramReplyMarkup;
}

export interface TelegramEditCaptionParams {
  chat_id: number;
  message_id: number;
  caption?: string;
  reply_markup?: TelegramReplyMarkup;
}

async function callApi<T>(method: string, params: object): Promise<T> {
  if (!hasBotToken()) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменной окружения");
  }
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
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
    return callApi<unknown>("sendMessage", params);
  },
  async sendPhoto(params: TelegramPhotoParams) {
    return callApi<unknown>("sendPhoto", params);
  },
  async editMessageCaption(params: TelegramEditCaptionParams) {
    return callApi<unknown>("editMessageCaption", params);
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
