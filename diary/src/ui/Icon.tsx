import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, RADIUS } from './theme';

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
  copy: { d: ['M8 8h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z', 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2'] },
  file: { d: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8'] },
  menu: { d: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  back: { d: ['m12 19-7-7 7-7', 'M19 12H5'] },
  right: { d: ['m9 18 6-6-6-6'] },
  calendar: { d: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'] },
  flame: { d: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'] },
  sparkle: { d: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 17v4', 'M17 19h4'] },
  leaf: { d: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'] },
  pen: { d: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'] },
  up: { d: ['m18 15-6-6-6 6'] },
  down: { d: ['m6 9 6 6 6-6'] },
  heart: { d: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'] },
  user: { d: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'], c: [[12, 7, 4]] },
  cart: { d: ['M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.96-1.57l1.65-7.43H5.12'], c: [[8, 21, 1], [19, 21, 1]] },
  coffee: { d: ['M10 2v2', 'M14 2v2', 'M6 2v2', 'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1'] },
  sun: { d: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'], c: [[12, 12, 4]] },
  moon: { d: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'] },
  snack: { d: ['M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z', 'M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z', 'M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12', 'M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 1.67 10 7Z'] },
  sunrise: { d: ['M12 2v8', 'm4.93 10.93 1.41 1.41', 'M2 18h2', 'M20 18h2', 'm19.07 10.93-1.41 1.41', 'M22 22H2', 'm8 6 4-4 4 4', 'M16 18a4 4 0 0 0-8 0'] },
  apple: { d: ['M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z', 'M10 2c1 .5 2 2 2 5'] },
  bowl: { d: ['M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z', 'M7 21h10', 'M19.5 12 22 6', 'M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62', 'M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62', 'M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62'] },
  wheat: { d: ['M2 22 16 8', 'M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z', 'M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z', 'M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z', 'M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z', 'M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z', 'M18.47 13.47 20 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L12 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z'] },
  drop: { d: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'] },
  dumbbell: { d: ['M6 7v10', 'M3 10v4', 'M18 7v10', 'M21 10v4', 'M6 12h12'] },
  users: { d: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'], c: [[9, 7, 4]] },
  globe: { d: ['M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'], c: [[12, 12, 10]] },
  grid: { d: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'] },
  chart: { d: ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'] },
  home: { d: ['m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'] },
  milk: { d: ['M8 2h8', 'M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2', 'M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0'] },
  bean: { d: ['M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z', 'M5.341 10.62a4 4 0 1 0 5.279-5.28'] },
  rules: { d: ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M9 2h6v4H9z', 'm9 14 2 2 4-4'] },
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
  breakfast: 'sunrise',
  midmorning: 'apple',
  lunch: 'today',
  evening: 'coffee',
  dinner: 'moon',
  bedtime: 'milk',
};

/** One icon per store aisle. */
export const AISLE_ICON: Record<string, IconName> = {
  veg: 'leaf',
  fruit: 'apple',
  dairy: 'milk',
  pulse: 'bean',
  staple: 'wheat',
  dry: 'snack',
  oil: 'drop',
  other: 'cart',
};

/** A larger line drawing for welcome and empty screens: a bowl with a few ingredients around it, one ink colour. */
export function LineScene({ size = 200 }: { size?: number }) {
  const small = Math.round(size * 0.22);
  const pos = (style: object) => ({ position: 'absolute' as const, ...style });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.86, height: size * 0.86, borderRadius: size, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="bowl" size={Math.round(size * 0.5)} color={C.text} width={1.1} />
      </View>
      <View style={pos({ left: 0, top: size * 0.12 })}>
        <Icon name="leaf" size={small} color={C.text} width={1.2} />
      </View>
      <View style={pos({ right: 0, top: size * 0.04 })}>
        <Icon name="wheat" size={small} color={C.text} width={1.2} />
      </View>
      <View style={pos({ left: size * 0.06, bottom: size * 0.06 })}>
        <Icon name="apple" size={small * 0.9} color={C.text} width={1.2} />
      </View>
      <View style={pos({ right: size * 0.06, bottom: size * 0.1 })}>
        <Icon name="drop" size={small * 0.8} color={C.text} width={1.2} />
      </View>
    </View>
  );
}

/** A line icon on a soft rounded tile: the one picture style used across the app. */
export function IconTile({ name, size = 44, icon, tint = C.surface, color = C.text, width = 1.6 }: { name: IconName; size?: number; icon?: number; tint?: string; color?: string; width?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size > 60 ? RADIUS.xl : RADIUS.lg, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={icon ?? Math.round(size * 0.52)} color={color} width={width} />
    </View>
  );
}
