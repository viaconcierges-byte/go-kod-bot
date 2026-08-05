import { routeThemes, routeData } from "@/lib/data";
import type { RoutePoint } from "@/lib/data";

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
  return `${title}\n\n${route.description ?? ""}\n\n📍 Точки маршрута:`;
}

export function pointSummaryCaption(point: RoutePoint, index: number): string {
  const parts = [`${index + 1}. ${point.name}`, `📍 ${point.address}`];
  if (point.style || point.year) {
    const meta = [point.style, point.year].filter(Boolean).join(", ");
    if (meta) parts.push(`🏛 ${meta}`);
  }
  parts.push("", point.description);
  return parts.join("\n");
}

export function pointDetailCaption(point: RoutePoint): string {
  const parts = [
    point.name,
    `📍 ${point.address}`,
    "",
    point.description,
    "",
    `📜 История: ${point.history}`,
    `⏰ Лучшее время: ${point.bestTime}`,
  ];
  if (point.logistics) parts.push(`🚶 ${point.logistics}`);
  return parts.join("\n");
}

export function endText(): string {
  return (
    "Маршрут завершён 🎉\n\n" +
    "Хотите увидеть это с гидом? Забронируйте экскурсию на сайте spbkod.ru"
  );
}
