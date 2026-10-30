import { Platform, StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { FONT, SCRIPT, displayFonts } from './theme';

const WEB_FALLBACK = ', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const WEB_SERIF = ', system-ui, "Segoe UI", Roboto, sans-serif';

function family(weight: TextStyle['fontWeight']): string {
  switch (String(weight ?? '400')) {
    case '500':
      return FONT.medium;
    case '600':
      return FONT.semi;
    case '700':
    case 'bold':
      return FONT.bold;
    case '800':
    case '900':
      return FONT.heavy;
    default:
      return FONT.regular;
  }
}

/** Turns fontWeight into the matching font file, and adds a system fallback on the web. */
function resolve(style: TextProps['style']): TextStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const { fontWeight, fontFamily, ...rest } = flat;
  const w = String(fontWeight ?? '400');
  const fam = fontFamily === 'script' ? SCRIPT : fontFamily === 'display' ? (w === '700' || w === '800' || w === 'bold' ? displayFonts().bold : w === '600' || w === '500' ? displayFonts().semi : displayFonts().regular) : family(fontWeight);
  // the script face is thin, so a hairline shadow in its own colour makes it a little bolder
  // the script's tails (g, p, y) hang low and get clipped in a short line box, so the line is never shorter than 1.3 times the size (measured: shorter lines clip); the last letter's swash needs room on the right too
  const roomy = fontFamily === 'script' ? { lineHeight: Math.max(rest.lineHeight ?? 0, Math.round((rest.fontSize ?? 14) * 1.3)), paddingRight: Math.round((rest.fontSize ?? 14) * 0.18) } : null;
  const faux = fontFamily === 'script' && typeof rest.color === 'string' ? { textShadowColor: rest.color, textShadowOffset: { width: 0.9, height: 0.4 }, textShadowRadius: 0.4 } : null;
  return { ...rest, ...roomy, ...faux, fontFamily: Platform.OS === 'web' ? `${fam}${fontFamily === 'display' || fontFamily === 'script' ? WEB_SERIF : WEB_FALLBACK}` : fam };
}

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={resolve(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={resolve(style)} />;
}
