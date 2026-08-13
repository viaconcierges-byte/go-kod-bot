const KV_REST_API_URL = process.env.KV_REST_API_URL ?? "";
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN ?? "";

export const ANALYTICS_OWNER_ID = 220049710;

export interface BotAnalytics {
  userId: string;
  startCount: number;
  themeStarts: Record<string, number>;
  reachedLastPoint: Record<string, number>;
  routeFinishes: Record<string, number>;
  shareCount: number;
  siteClickCount: number;
  totalSessionMs: number;
  sessionCount: number;
  lastSessionStartAt: number | null;
  lastActivityAt: number;
}

export interface AnalyticsStats {
  totalStarts: number;
  themeStarts: Record<string, number>;
  reachedLastPoint: Record<string, number>;
  routeFinishes: Record<string, number>;
  totalSessionMs: number;
  sessionCount: number;
  shareCount: number;
  siteClickCount: number;
}

interface AnalyticsRow extends AnalyticsStats {
  lastSessionStartAt: number | null;
  lastActivityAt: number;
}

const ANALYTICS_KEY = "bot:analytics:all";

function emptyRow(): AnalyticsRow {
  return {
    totalStarts: 0,
    themeStarts: {},
    reachedLastPoint: {},
    routeFinishes: {},
    totalSessionMs: 0,
    sessionCount: 0,
    shareCount: 0,
    siteClickCount: 0,
    lastSessionStartAt: null,
    lastActivityAt: Date.now(),
  };
}

async function kvCommand<T>(
  command: string,
  args: unknown[]
): Promise<T | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  const res = await fetch(`${KV_REST_API_URL}/${command}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: T };
  return json.result ?? null;
}

async function getAnalyticsRow(): Promise<AnalyticsRow> {
  const raw = await kvCommand<string>("get", [ANALYTICS_KEY]);
  if (raw) {
    try {
      return { ...emptyRow(), ...(JSON.parse(raw) as Partial<AnalyticsRow>) };
    } catch {
      // ignore
    }
  }
  return emptyRow();
}

async function saveAnalyticsRow(row: AnalyticsRow): Promise<void> {
  await kvCommand("set", [ANALYTICS_KEY, JSON.stringify(row)]);
}

function closeSession(row: AnalyticsRow, now: number): void {
  if (row.lastSessionStartAt == null) return;
  row.totalSessionMs += Math.max(0, now - row.lastSessionStartAt);
  row.sessionCount += 1;
  row.lastSessionStartAt = null;
}

export async function recordBotStart(_userId: number): Promise<void> {
  const row = await getAnalyticsRow();
  const now = Date.now();
  closeSession(row, now);
  row.totalStarts += 1;
  row.lastSessionStartAt = now;
  row.lastActivityAt = now;
  await saveAnalyticsRow(row);
}

export async function recordThemeSelected(
  _userId: number,
  themeId: string
): Promise<void> {
  const row = await getAnalyticsRow();
  row.themeStarts[themeId] = (row.themeStarts[themeId] ?? 0) + 1;
  row.lastActivityAt = Date.now();
  await saveAnalyticsRow(row);
}

export async function recordPointViewed(
  _userId: number,
  themeId: string,
  pointIndex: number,
  pointTotal: number
): Promise<void> {
  const row = await getAnalyticsRow();
  if (pointTotal > 0 && pointIndex === pointTotal - 1) {
    row.reachedLastPoint[themeId] = (row.reachedLastPoint[themeId] ?? 0) + 1;
  }
  row.lastActivityAt = Date.now();
  await saveAnalyticsRow(row);
}

export async function recordRouteFinished(
  _userId: number,
  themeId: string
): Promise<void> {
  const row = await getAnalyticsRow();
  const now = Date.now();
  closeSession(row, now);
  row.routeFinishes[themeId] = (row.routeFinishes[themeId] ?? 0) + 1;
  row.lastActivityAt = now;
  await saveAnalyticsRow(row);
}

export async function recordShare(_userId: number): Promise<void> {
  const row = await getAnalyticsRow();
  row.shareCount += 1;
  row.lastActivityAt = Date.now();
  await saveAnalyticsRow(row);
}

export async function recordSiteClick(_userId: number): Promise<void> {
  const row = await getAnalyticsRow();
  row.siteClickCount += 1;
  row.lastActivityAt = Date.now();
  await saveAnalyticsRow(row);
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const raw = await kvCommand<string>("get", [ANALYTICS_KEY]);
  if (!raw) return emptyRow();
  try {
    return { ...emptyRow(), ...(JSON.parse(raw) as Partial<AnalyticsRow>) };
  } catch {
    return emptyRow();
  }
}
