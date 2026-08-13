import { routeThemes, routeData } from "@/lib/data";
import type { TelegramInlineKeyboardButton } from "@/lib/bot/telegram";

export function siteLinkUrl(chatId: number): string {
  const base = process.env.BOT_PUBLIC_URL?.trim();
  if (base) return `${base}/api/bot/site-link?chatId=${chatId}`;
  return "https://spbkod.ru";
}

export function themeMenuKeyboard(): TelegramInlineKeyboardButton[][] {
  return routeThemes.map((theme) => [
    {
      text: `${theme.emoji} ${theme.title}`,
      callback_data: `theme:${theme.id}`,
    },
  ]);
}

export function pointKeyboard(
  themeId: string,
  pointId: string,
  index: number,
  total: number
): TelegramInlineKeyboardButton[][] {
  const isLast = index === total - 1;
  const nav: TelegramInlineKeyboardButton[] = [];
  if (index > 0) {
    nav.push({ text: "Назад", callback_data: `prev:${themeId}:${pointId}` });
  }
  if (!isLast) {
    nav.push({
      text: "Следующая",
      callback_data: `nav:${themeId}:${pointId}`,
    });
  }

  if (!isLast) {
    return [
      nav,
      [
        {
          text: "Подробнее",
          callback_data: `detail:${themeId}:${pointId}`,
        },
      ],
      [{ text: "Выбрать другую тему", callback_data: "menu" }],
    ];
  }

  return [
    [
      ...nav,
      { text: "Подробнее", callback_data: `detail:${themeId}:${pointId}` },
    ],
    [{ text: "Хочу экскурсию", callback_data: `finish:${themeId}` }],
    [
      {
        text: "Поделиться маршрутом",
        callback_data: `share:${themeId}`,
      },
    ],
    [{ text: "Выбрать другую тему", callback_data: "menu" }],
  ];
}

export function detailKeyboard(
  themeId: string,
  pointId: string
): TelegramInlineKeyboardButton[][] {
  return [
    [
      {
        text: "Свернуть описание",
        callback_data: `back:${themeId}:${pointId}`,
      },
    ],
    [{ text: "Выбрать другую тему", callback_data: "menu" }],
  ];
}

export function endKeyboard(
  themeId: string,
  chatId: number
): TelegramInlineKeyboardButton[][] {
  return [
    [{ text: "Поделиться маршрутом", callback_data: `share:${themeId}` }],
    [{ text: "Назад к выбору маршрута", callback_data: "menu" }],
    [{ text: "🌐 Сайт spbkod.ru", url: siteLinkUrl(chatId) }],
  ];
}

export function shareResultKeyboard(
  chatId: number
): TelegramInlineKeyboardButton[][] {
  return [
    [
      { text: "В начало", callback_data: "menu" },
      { text: "Хочу экскурсию", callback_data: "excursion" },
    ],
    [{ text: "🌐 Сайт spbkod.ru", url: siteLinkUrl(chatId) }],
  ];
}

export function isKnownTheme(themeId: string): boolean {
  return Boolean(routeData[themeId]);
}
