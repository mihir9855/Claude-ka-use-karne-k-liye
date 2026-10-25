import Svg, { Circle, Path } from 'react-native-svg';
import { C } from './theme';

// 24x24 outline icons (Lucide-style geometry), stroke only.
type Def = { d?: string[]; c?: [number, number, number][] };

const ICONS = {
  today: { d: ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'] },
  pantry: { d: ['m15 11-1 9', 'm19 11-4-7', 'M2 11h20', 'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4', 'M4.5 15.5h15', 'm5 11 4-7', 'm9 11 1 9'] },
  dishes: { d: ['M12 7v14', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'] },
  settings: { d: ['M21 4H14', 'M10 4H3', 'M21 12H12', 'M8 12H3', 'M21 20H16', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'] },
  refresh: { d: ['M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8', 'M21 3v5h-5'] },
  check: { d: ['M20 6 9 17l-5-5'] },
  plus: { d: ['M5 12h14', 'M12 5v14'] },
  trash: { d: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6'] },
  undo: { d: ['M3 7v6h6', 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13'] },
  camera: { d: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'], c: [[12, 13, 3]] },
  barcode: { d: ['M3 5v14', 'M8 5v14', 'M12 5v14', 'M17 5v14', 'M21 5v14'] },
  image: { d: ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'm21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21'], c: [[9, 9, 2]] },
  close: { d: ['M18 6 6 18', 'm6 6 12 12'] },
  share: { d: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'm16 6-4-4-4 4', 'M12 2v13'] },
  up: { d: ['m18 15-6-6-6 6'] },
  down: { d: ['m6 9 6 6 6-6'] },
  heart: { d: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'] },
  user: { d: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'], c: [[12, 7, 4]] },
  cart: { d: ['M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.96-1.57l1.65-7.43H5.12'], c: [[8, 21, 1], [19, 21, 1]] },
  coffee: { d: ['M10 2v2', 'M14 2v2', 'M6 2v2', 'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1'] },
  sun: { d: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'], c: [[12, 12, 4]] },
  moon: { d: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'] },
  snack: { d: ['M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z', 'M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z', 'M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12', 'M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 1.67 10 7Z'] },
} satisfies Record<string, Def>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = C.text, width = 2 }: { name: IconName; size?: number; color?: string; width?: number }) {
  const def: Def = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {def.d?.map((d, i) => <Path key={i} d={d} />)}
      {def.c?.map(([cx, cy, r], i) => <Circle key={`c${i}`} cx={cx} cy={cy} r={r} />)}
    </Svg>
  );
}

export const SLOT_ICON: Record<string, IconName> = {
  breakfast: 'coffee',
  midmorning: 'snack',
  lunch: 'sun',
  evening: 'snack',
  dinner: 'moon',
  bedtime: 'moon',
};
