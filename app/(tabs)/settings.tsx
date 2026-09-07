import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { loadSettings, resetAll, saveSettings } from '@/lib/storage';
import { colors, radius, space, type } from '@/lib/theme';
import type { DemoIntervalSeconds, Settings } from '@/types';

const DEMO_OPTIONS = [
  { value: 30 as DemoIntervalSeconds, label: '30s' },
  { value: 60 as DemoIntervalSeconds, label: '60s' },
  { value: 120 as DemoIntervalSeconds, label: '2m' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const refresh = useCallback(() => {
    loadSettings().then(setSettings);
  }, []);

  useFocusEffect(refresh);

  const patch = async (next: Partial<Settings>) => {
    setSettings(await saveSettings(next));
  };

  const confirmReset = () => {
    Alert.alert('Reset all data?', 'This clears every tracked day. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetAll();
          refresh();
        },
      },
    ]);
  };

  if (!settings) return <Screen title="Settings">{null}</Screen>;

  return (
    <Screen title="Settings">
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Reminders not set up yet</Text>
        <Text style={styles.noticeBody}>
          Notifications arrive in the next build. Tracking works now.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Demo mode</Text>
          <Text style={styles.rowMeta}>Speeds the timer up for showing the app</Text>
        </View>
        <Switch
          value={settings.demoMode}
          onValueChange={(demoMode) => patch({ demoMode })}
          trackColor={{ false: colors.border, true: colors.greenDark }}
          thumbColor={colors.card}
        />
      </View>

      {settings.demoMode ? (
        <View style={styles.block}>
          <Text style={styles.groupLabel}>DEMO INTERVAL</Text>
          <Chips
            options={DEMO_OPTIONS}
            value={settings.demoIntervalSeconds}
            onChange={(demoIntervalSeconds) => patch({ demoIntervalSeconds })}
          />
        </View>
      ) : null}

      <Text style={styles.groupLabel}>DEVELOPER</Text>
      <Button label="Reset all data" variant="danger" onPress={confirmReset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.greenTint,
    borderRadius: radius.row,
    padding: space.base,
  },
  noticeTitle: { ...type.title, color: colors.greenDeep },
  noticeBody: { ...type.small, color: colors.greenDeep, marginTop: 2, lineHeight: 19 },
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
  block: { marginTop: space.base },
  groupLabel: {
    ...type.label,
    color: colors.muted,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
});
