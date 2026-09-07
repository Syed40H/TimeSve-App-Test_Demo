// The only module in the app that touches AsyncStorage.
// Every read is defensive: missing, partial and corrupt data all fall back to
// a sane default rather than throwing, because a storage error must never be
// able to white-screen the app.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { dateKey } from '@/lib/dates';
import type { DayRecord, Reminder, Session, Settings } from '@/types';

const KEYS = {
  settings: 'timesve.settings',
  days: 'timesve.days',
  session: 'timesve.session',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  trackingEnabled: false,
  intervalMinutes: 30,
  soundAndVibration: true,
  demoMode: false,
  demoIntervalSeconds: 60,
};

export type DayMap = Record<string, DayRecord>;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed == null || typeof parsed !== 'object') return fallback;
    return parsed as T;
  } catch {
    return fallback; // corrupt JSON, unreadable store — behave as if empty
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A failed write loses one record. It must not crash the caller.
  }
}

/* ------------------------------- settings ------------------------------- */

const INTERVALS = [20, 30, 40, 50, 60];
const DEMO_INTERVALS = [30, 60, 120];

function normalizeSettings(raw: Partial<Settings> | null): Settings {
  const s = raw ?? {};
  return {
    trackingEnabled:
      typeof s.trackingEnabled === 'boolean'
        ? s.trackingEnabled
        : DEFAULT_SETTINGS.trackingEnabled,
    intervalMinutes: INTERVALS.includes(s.intervalMinutes as number)
      ? (s.intervalMinutes as Settings['intervalMinutes'])
      : DEFAULT_SETTINGS.intervalMinutes,
    soundAndVibration:
      typeof s.soundAndVibration === 'boolean'
        ? s.soundAndVibration
        : DEFAULT_SETTINGS.soundAndVibration,
    demoMode: typeof s.demoMode === 'boolean' ? s.demoMode : DEFAULT_SETTINGS.demoMode,
    demoIntervalSeconds: DEMO_INTERVALS.includes(s.demoIntervalSeconds as number)
      ? (s.demoIntervalSeconds as Settings['demoIntervalSeconds'])
      : DEFAULT_SETTINGS.demoIntervalSeconds,
  };
}

export async function loadSettings(): Promise<Settings> {
  return normalizeSettings(await readJson<Partial<Settings> | null>(KEYS.settings, null));
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = normalizeSettings({ ...(await loadSettings()), ...patch });
  await writeJson(KEYS.settings, next);
  return next;
}

/* --------------------------------- days --------------------------------- */

function normalizeReminder(raw: unknown): Reminder | null {
  if (raw == null || typeof raw !== 'object') return null;
  const r = raw as Partial<Reminder>;
  if (typeof r.id !== 'string' || typeof r.at !== 'number') return null;
  return {
    id: r.id,
    at: r.at,
    minutesActive: typeof r.minutesActive === 'number' ? r.minutesActive : 0,
  };
}

function normalizeDays(raw: DayMap): DayMap {
  const out: DayMap = {};
  for (const [date, day] of Object.entries(raw ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const reminders = Array.isArray(day?.reminders)
      ? day.reminders.map(normalizeReminder).filter((r): r is Reminder => r !== null)
      : [];
    const activeMs =
      typeof day?.activeMs === 'number' && day.activeMs >= 0 ? day.activeMs : 0;
    out[date] = {
      date,
      activeMs,
      reminders: reminders.sort((a, b) => a.at - b.at),
    };
  }
  return out;
}

export async function loadDays(): Promise<DayMap> {
  return normalizeDays(await readJson<DayMap>(KEYS.days, {}));
}

function blankDay(date: string): DayRecord {
  return { date, activeMs: 0, reminders: [] };
}

/** Adds tracked time to whichever day `at` falls on. */
export async function addActiveMs(ms: number, at = Date.now()): Promise<void> {
  if (ms <= 0) return;
  const days = await loadDays();
  const date = dateKey(at);
  const day = days[date] ?? blankDay(date);
  days[date] = { ...day, activeMs: day.activeMs + ms };
  await writeJson(KEYS.days, days);
}

/**
 * Records that a reminder fired.
 * Returns false if this id is already recorded — the dedupe guard that stops
 * one notification writing twice.
 */
export async function addReminder(reminder: Reminder): Promise<boolean> {
  const days = await loadDays();
  const date = dateKey(reminder.at);
  const day = days[date] ?? blankDay(date);
  if (day.reminders.some((r) => r.id === reminder.id)) return false;
  days[date] = {
    ...day,
    reminders: [...day.reminders, reminder].sort((a, b) => a.at - b.at),
  };
  await writeJson(KEYS.days, days);
  return true;
}

/* -------------------------------- session ------------------------------- */

export async function loadSession(): Promise<Session | null> {
  const raw = await readJson<Partial<Session> | null>(KEYS.session, null);
  if (!raw || typeof raw.startedAt !== 'number') return null;
  return {
    startedAt: raw.startedAt,
    lastCommitAt:
      typeof raw.lastCommitAt === 'number' ? raw.lastCommitAt : raw.startedAt,
  };
}

export async function startSession(now = Date.now()): Promise<Session> {
  const session: Session = { startedAt: now, lastCommitAt: now };
  await writeJson(KEYS.session, session);
  return session;
}

/**
 * Banks the time since the last commit and moves the watermark forward.
 * Safe to call as often as you like — it can never double count.
 */
export async function commitSession(now = Date.now()): Promise<Session | null> {
  const session = await loadSession();
  if (!session) return null;
  const elapsed = now - session.lastCommitAt;
  if (elapsed > 0) await addActiveMs(elapsed, now);
  const next: Session = { ...session, lastCommitAt: now };
  await writeJson(KEYS.session, next);
  return next;
}

export async function stopSession(now = Date.now()): Promise<void> {
  await commitSession(now);
  try {
    await AsyncStorage.removeItem(KEYS.session);
  } catch {
    // ignore
  }
}

/* --------------------------------- reset -------------------------------- */

export async function resetAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch {
    // ignore
  }
}
