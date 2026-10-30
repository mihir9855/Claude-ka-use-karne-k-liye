import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

// A hand-made repeat of chalk strokes (uneven angle, length and pressure) so a fill looks rubbed in with chalk.
const STROKES: [number, number, number, number, number, boolean][] = [
  [3, 6, 31, 2, 0.26, true], [8, 14, 40, 10, 0.2, false], [0, 22, 24, 17, 0.3, true], [14, 27, 46, 24, 0.18, true],
  [5, 33, 35, 36, 0.24, false], [20, 4, 52, 8, 0.2, true], [28, 18, 58, 14, 0.28, true], [34, 29, 60, 33, 0.18, false],
  [10, 40, 42, 44, 0.22, true], [44, 38, 63, 41, 0.26, true], [2, 47, 22, 50, 0.2, false], [26, 46, 56, 49, 0.24, true],
];
const DUST: [number, number, number, number][] = [[7, 9, 0.9, 0.35], [19, 21, 0.7, 0.3], [33, 11, 1, 0.4], [47, 25, 0.8, 0.3], [13, 35, 1.1, 0.35], [38, 43, 0.8, 0.3], [55, 6, 0.7, 0.3], [58, 36, 1, 0.35], [24, 52, 0.8, 0.3]];

/** Chalk rubbed over a tile: light strokes, a few dark ones for depth, and dust. Sits behind the tile's content. */
export function ChalkFill({ radius }: { radius: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="chalk" patternUnits="userSpaceOnUse" width="64" height="56">
            {STROKES.map(([x1, y1, x2, y2, o, light], i) => (
              <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={light ? '#FFFFFF' : '#14110E'} strokeOpacity={light ? o : o * 0.45} strokeWidth={light ? 2.2 : 1.6} strokeLinecap="round" />
            ))}
            {DUST.map(([x, y, r, o], i) => (
              <Line key={`d${i}`} x1={x} y1={y} x2={x + r} y2={y + r * 0.4} stroke="#FFFFFF" strokeOpacity={o} strokeWidth={r + 0.6} strokeLinecap="round" />
            ))}
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#chalk)" />
      </Svg>
    </View>
  );
}
