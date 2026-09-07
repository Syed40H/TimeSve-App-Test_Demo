import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Switch, Text, Vibration, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { todayKey } from '@/lib/dates';
import { formatClock, formatDuration } from '@/lib/stats';
import {
  commitSession,
  loadDays,
  loadSession,
  loadSettings,
  saveSettings,
  startSession,
  stopSession,
} from '@/lib/storage';
import { colors, radius, space, type } from '@/lib/theme';
import type { IntervalMinutes, Session, Settings } from '@/types';

const INTERVAL_OPTIONS = [
  { value: 20 as IntervalMinutes, label: '20m' },
  { value: 30 as IntervalMinutes, label: '30m' },
  { value: 40 as IntervalMinutes, label: '40m' },
  { value: 50 as IntervalMinutes, label: '50m' },
  { value: 60 as IntervalMinutes, label: '1h' },
];

export default function Today() {
  const [bankedMs, setBankedMs] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [now, setNow] = useState(Date.now());
  const sessionRef = useRef<Session | null>(null);

  sessionRef.current = session;

  const refresh = useCallback(async () => {
    const [days, current, saved] = await Promise.all([
      loadDays(),
      loadSession(),
      loadSettings(),
    ]);
    setBankedMs(days[todayKey()]?.activeMs ?? 0);
    setSession(current);
    setSettings(saved);
    setNow(Date.now());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Ticks the session clock while tracking.
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  // Banks time whenever the app leaves or returns, so force-quitting loses
  // only the seconds since the last commit rather than the whole session.
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (!sessionRef.current) return;
      await commitSession();
      if (state === 'active') await refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const uncommittedMs = session ? Math.max(0, now - session.lastCommitAt) : 0;
  const todayMs = bankedMs + uncommittedMs;
  const sessionMs = session ? Math.max(0, now - session.startedAt) : 0;

  const patch = async (next: Partial<Settings>) => {
    setSettings(await saveSettings(next));
  };

  const onStart = async () => {
    setSession(await startSession());
    await patch({ trackingEnabled: true });
    setNow(Date.now());
  };

  const onStop = async () => {
    await stopSession();
    await patch({ trackingEnabled: false });
    await refresh();
  };

  const onToggleAlert = async (soundAndVibration: boolean) => {
    // Buzz on the way on, so you feel what the reminder will do.
    if (soundAndVibration) Vibration.vibrate();
    await patch({ soundAndVibration });
  };

  if (!settings) return <Screen title="Hey there!">{null}</Screen>;

  return (
    <Screen title="Hey there!">
      <View style={styles.hero}>
        <Mascot size={80} mood={session ? 'tracking' : 'resting'} />
        <Text style={styles.total}>{formatDuration(todayMs)}</Text>
        <Text style={styles.totalLabel}>tracked today</Text>
        {session ? (
          <View style={styles.sessionPill}>
            <Text style={styles.sessionText}>{formatClock(sessionMs)} this session</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.groupLabel}>REMIND ME EVERY</Text>
      <Chips
        options={INTERVAL_OPTIONS}
        value={settings.intervalMinutes}
        onChange={(intervalMinutes) => patch({ intervalMinutes })}
      />

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Sound &amp; vibration</Text>
          <Text style={styles.rowMeta}>
            Off means reminders arrive as a silent banner
          </Text>
        </View>
        <Switch
          value={settings.soundAndVibration}
          onValueChange={onToggleAlert}
          trackColor={{ false: colors.border, true: colors.greenDark }}
          thumbColor={colors.card}
        />
      </View>

      <Button
        label={session ? 'Stop tracking' : 'Start tracking'}
        variant={session ? 'secondary' : 'primary'}
        onPress={session ? onStop : onStart}
        style={styles.action}
      />

      <Text style={styles.footnote}>
        Counts from when you start until you stop — not your phone&apos;s system
        screen time.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.xl,
    alignItems: 'center',
  },
  total: { ...type.display, color: colors.ink, marginTop: space.sm },
  totalLabel: { ...type.small, color: colors.muted, marginTop: space.xs },
  sessionPill: {
    marginTop: space.base,
    backgroundColor: colors.greenTint,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
  },
  sessionText: { ...type.small, color: colors.greenDeep, fontWeight: '700' },
  groupLabel: {
    ...type.label,
    color: colors.muted,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  row: {
    marginTop: space.base,
    backgroundColor: colors.card,
    borderRadius: radius.row,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { flex: 1, paddingRight: space.md },
  rowTitle: { ...type.title, color: colors.ink },
  rowMeta: { ...type.small, color: colors.muted, marginTop: 2 },
  action: { marginTop: space.lg },
  footnote: {
    ...type.small,
    color: colors.muted,
    marginTop: space.md,
    textAlign: 'center',
    lineHeight: 19,
  },
});
