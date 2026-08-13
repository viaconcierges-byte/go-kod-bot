import QRCode from "qrcode";

const BOT_USERNAME = process.env.BOT_USERNAME?.trim() || "GoKodBot";

export function botUrl(themeId: string): string {
  return `https://t.me/${BOT_USERNAME}?start=route_${themeId}`;
}

export async function routeQrPng(themeId: string): Promise<Buffer> {
  return QRCode.toBuffer(botUrl(themeId), {
    type: "png",
    width: 1024,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}
