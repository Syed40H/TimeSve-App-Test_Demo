import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/lib/theme';

type Props = {
  size?: number;
  /** Resting is a calm smile; tracking opens the eyes and lifts the mouth. */
  mood?: 'resting' | 'tracking';
};

/**
 * A pentagon with a face. Drawn as vectors rather than an image file so it
 * stays sharp at any size and adds nothing to the bundle.
 */
export function Mascot({ size = 92, mood = 'resting' }: Props) {
  const tracking = mood === 'tracking';
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 60 54">
      <Path d="M30 3 56 22 46 51 14 51 4 22Z" fill={colors.green} />
      <Circle cx="22" cy="26" r={tracking ? 3.4 : 3} fill={colors.ink} />
      <Circle cx="38" cy="26" r={tracking ? 3.4 : 3} fill={colors.ink} />
      <Path
        d={tracking ? 'M21 34c5 7 13 7 18 0' : 'M22 35c4 5 12 5 16 0'}
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
