import { routeThemes, routeData } from "@/lib/data";
import type { TelegramInlineKeyboardButton } from "@/lib/bot/telegram";

export function themeMenuKeyboard(): TelegramInlineKeyboardButton[][] {
  return routeThemes.map((theme) => [
    { text: theme.title, callback_data: `theme:${theme.id}` },
  ]);
}

export function pointKeyboard(
  themeId: string,
  pointId: string
): TelegramInlineKeyboardButton[][] {
  return [
    [{ text: "Подробнее", callback_data: `detail:${themeId}:${pointId}` }],
  ];
}

export function detailKeyboard(
  themeId: string,
  pointId: string
): TelegramInlineKeyboardButton[][] {
  return [
    [
      {
        text: "Вернуться к маршруту",
        callback_data: `back:${themeId}:${pointId}`,
      },
    ],
  ];
}

export function endKeyboard(): TelegramInlineKeyboardButton[][] {
  return [[{ text: "Выбрать другую тему", callback_data: "menu" }]];
}

export function isKnownTheme(themeId: string): boolean {
  return Boolean(routeData[themeId]);
}
