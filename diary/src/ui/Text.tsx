import { Platform, StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { FONT } from './theme';

const WEB_FALLBACK = ', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

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
  const { fontWeight, ...rest } = flat;
  const fam = family(fontWeight);
  return { ...rest, fontFamily: Platform.OS === 'web' ? `${fam}${WEB_FALLBACK}` : fam };
}

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={resolve(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={resolve(style)} />;
}
