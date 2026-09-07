export type IntervalMinutes = 20 | 30 | 40 | 50 | 60;
export type DemoIntervalSeconds = 30 | 60 | 120;

/** One notification that fired. */
export type Reminder = {
  id: string;
  at: number;
  minutesActive: number; // elapsed minutes at the moment it fired
};

export type DayRecord = {
  date: string; // "2026-09-07"
  activeMs: number; // total tracked time that day
  reminders: Reminder[];
};

/**
 * An open tracking session. `lastCommitAt` is the watermark: everything before
 * it is already banked into a DayRecord, so committing again cannot double
 * count, and killing the app loses at most the time since the last commit.
 */
export type Session = {
  startedAt: number;
  lastCommitAt: number;
};

export type Settings = {
  trackingEnabled: boolean;
  intervalMinutes: IntervalMinutes;
  /**
   * One flag, not two: iOS ties a notification's vibration to its alert sound,
   * so a reminder either alerts (sound + haptic) or lands as a silent banner.
   */
  soundAndVibration: boolean;
  demoMode: boolean;
  demoIntervalSeconds: DemoIntervalSeconds;
};
