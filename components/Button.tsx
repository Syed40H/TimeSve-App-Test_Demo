import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius, space, type } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, FILL[variant], pressed && styles.pressed, style]}
    >
      <Text style={[styles.label, TEXT[variant]]}>{label}</Text>
    </Pressable>
  );
}

const FILL: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.greenDark },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { borderWidth: 1, borderColor: colors.dangerBorder },
};

const TEXT = StyleSheet.create({
  primary: { color: colors.onGreen },
  secondary: { color: colors.ink },
  danger: { color: colors.danger },
});

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  label: { ...type.title },
  pressed: { opacity: 0.75 },
});
