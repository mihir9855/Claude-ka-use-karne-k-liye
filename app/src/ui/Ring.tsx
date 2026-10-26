import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';
import type { ReactNode } from 'react';

/** Donut chart: `parts` fill the ring in order against `target`; the rest of the ring stays empty. */
export function Ring({
  parts,
  target,
  size = 150,
  stroke = 16,
  track = '#ECEAF8',
  children,
}: {
  parts: { v: number; color: string }[];
  target: number;
  size?: number;
  stroke?: number;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = parts.reduce((a, p) => a + p.v, 0);
  // an overshoot fills the whole ring; the centre text says by how much
  const scale = Math.max(total, target) || 1;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {parts.map((p, i) => {
          const len = Math.max(0, (p.v / scale) * c - (parts.length > 1 ? 3 : 0));
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={p.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += (p.v / scale) * c;
          return el;
        })}
      </Svg>
      {children}
    </View>
  );
}
