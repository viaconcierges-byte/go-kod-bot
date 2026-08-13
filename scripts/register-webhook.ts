import { telegram, hasBotToken } from "../lib/bot/telegram";

async function main(): Promise<void> {
  if (!hasBotToken()) {
    console.error("TELEGRAM_BOT_TOKEN не задан в переменной окружения.");
    process.exit(1);
  }

  const baseUrl =
    process.env.BOT_WEBHOOK_URL?.trim() || process.env.BOT_PUBLIC_URL?.trim();
  if (!baseUrl) {
    console.error(
      "Не задан BOT_WEBHOOK_URL (или BOT_PUBLIC_URL) — публичный адрес сервера."
    );
    process.exit(1);
  }

  const webhookUrl = `${baseUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  const secretToken = process.env.BOT_SECRET_TOKEN?.trim();

  const me = await telegram.getMe();
  console.log(`Подключаюсь как бот @${me.username}`);

  const ok = await telegram.setWebhook({
    url: webhookUrl,
    secret_token: secretToken,
  });
  if (ok) {
    console.log(`Webhook установлен: ${webhookUrl}`);
  } else {
    console.error("Не удалось установить webhook.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
