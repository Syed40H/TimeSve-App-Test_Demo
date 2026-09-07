import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '@/lib/theme';

export type Chip<T> = { value: T; label: string };

type Props<T extends string | number> = {
  options: Chip<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * The pill row from the reference design. Selection is marked in ink, not
 * green — green stays reserved for brand and actions, so the two never blur.
 */
export function Chips<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipPressed: { backgroundColor: colors.greenTint },
  label: { ...type.title, color: colors.muted },
  labelSelected: { color: colors.onDark },
});
