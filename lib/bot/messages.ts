import { routeThemes, routeData } from "@/lib/data";
import type { Route, RoutePoint } from "@/lib/data";
import type { AnalyticsStats } from "@/lib/bot/analytics";

export function greetingText(firstName?: string): string {
  const name = firstName && firstName.length > 0 ? firstName : "друг";
  return (
    `Привет, ${name}! Это Михаил из «Кода Петербурга». Рад, что ты заглянул! ` +
    "Я не просто бот, а твой гид по небанальным маршрутам, которые я сам собрал, " +
    "потому что влюблён в этот город. Готов исследовать? 😉"
  );
}

export const menuTitle = "Куда хотите отправиться?";
export const menuHint =
  "Выберите тему прогулки по Петербургу ниже, и мы отправимся вместе";

export function helpText(): string {
  return (
    "Вот что я умею 🔍\n\n" +
    "/start — начнём знакомство и выберем маршрут\n" +
    "/help — эта памятка\n" +
    "/about — пара слов обо мне\n\n" +
    "А ещё можно просто нажать на тему ниже и получить готовый маршрут по Петербургу."
  );
}

export function aboutText(): string {
  const themes = routeThemes.map((t) => t.title).join(", ");
  return (
    "Меня зовут Михаил, я из «Кода Петербурга» — компании, которая водит " +
    "небанальные экскурсии по любимому городу 🏛\n\n" +
    "Я собрал маршруты по темам: " +
    `${themes}. Выбирай любую, и я проведу тебя по местам с историями, ` +
    "адресами и фото. А если захочешь живого гида — загляни на spbkod.ru."
  );
}

export function unknownText(): string {
  return "Я пока не совсем понял 😅 Вот что я умею:";
}

export function routeHeader(themeId: string): string {
  const route = routeData[themeId];
  if (!route) return "";
  const title = route.name ?? "Маршрут";
  return `${title}\n\n${route.description ?? ""}`;
}

export function pointSummaryCaption(
  point: RoutePoint,
  index: number,
  total: number
): string {
  const parts = [
    `📍 Точка ${index + 1} из ${total}`,
    point.name,
    `Адрес: ${point.address}`,
  ];
  if (point.style || point.year) {
    const meta = [point.style, point.year].filter(Boolean).join(", ");
    if (meta) parts.push(`🏛 ${meta}`);
  }
  parts.push("", point.description);
  return parts.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlWithLinks(text: string): string {
  return text
    .split(/(https?:\/\/[^\s]+)/g)
    .map((part) =>
      /^https?:\/\//.test(part)
        ? `<a href="${escapeHtml(part)}">${escapeHtml(part)}</a>`
        : escapeHtml(part)
    )
    .join("");
}

export function pointDetailCaption(point: RoutePoint): string {
  const parts = [
    escapeHtml(point.name),
    `📍 ${escapeHtml(point.address)}`,
    "",
    escapeHtml(point.description),
    "",
    `📜 История: ${escapeHtml(point.history)}`,
  ];
  if (point.status) parts.push(`🏛 Статус: ${htmlWithLinks(point.status)}`);
  if (point.access) parts.push(`🚪 Доступ: ${htmlWithLinks(point.access)}`);
  if (point.logistics) parts.push(`🚶 ${escapeHtml(point.logistics)}`);
  return parts.join("\n");
}

export function shareQrCaption(route: Route): string {
  const name = route.name ?? "Маршрут";
  return (
    `📲 Поделитесь маршрутом «${name}»\n\n` +
    "Отсканируйте QR-код, чтобы открыть бота и пройти маршрут. " +
    "Сохраните картинку или перешлите её в любой мессенджер и соцсети."
  );
}

export function endText(): string {
  return (
    "Маршрут завершён 🎉\n\n" +
    '🏛 <b>Хотите увидеть это с гидом?</b> 🗺️ <a href="https://spbkod.ru">Забронируйте ' +
    "частную экскурсию на сайте spbkod.ru</a> 🎫 или свяжитесь со мной напрямую " +
    "<b>@mikegorov</b> 📩\n\n" +
    'Подписывайтесь на мой телеграм канал, там много интересного про Петербург <a href="https://t.me/spbcode">@spbcode</a>'
  );
}

export function statsDeniedText(): string {
  return "📊 Статистика доступна только владельцу бота.";
}

export function statsText(stats: AnalyticsStats): string {
  const avgMs =
    stats.sessionCount > 0
      ? Math.round(stats.totalSessionMs / stats.sessionCount)
      : 0;

  const fmt = (ms: number): string => {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m <= 0) return `${s} сек`;
    return `${m} мин ${s} сек`;
  };

  const themeRows = (map: Record<string, number>): string => {
    const lines = routeThemes.map((t) => {
      const title = t.title;
      const value = map[t.id] ?? 0;
      return `  ${title}: ${value}`;
    });
    return lines.join("\n");
  };

  return (
    "📊 Статистика бота\n\n" +
    `👋 Запусков (/start): <b>${stats.totalStarts}</b>\n\n` +
    `🗂 Заходы по темам:\n${themeRows(stats.themeStarts)}\n\n` +
    `🏁 Дошли до последней точки:\n${themeRows(stats.reachedLastPoint)}\n\n` +
    `⏱ Средняя длительность сеанса: <b>${fmt(avgMs)}</b>\n` +
    `⏱ Суммарная длительность: <b>${fmt(stats.totalSessionMs)}</b>\n` +
    `🧾 Завершённых сеансов: <b>${stats.sessionCount}</b>\n\n` +
    `📲 Поделились маршрутом (QR): <b>${stats.shareCount}</b>\n` +
    `🌐 Переходы на сайт/канал: <b>${stats.siteClickCount}</b>`
  );
}
