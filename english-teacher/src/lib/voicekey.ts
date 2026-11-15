// Short, stable id for a sentence, used as the file name of its recorded clip (FNV-1a 32-bit).
export function voiceKey(text: string): string {
  let h = 0x811c9dc5
  for (const ch of text.trim()) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
