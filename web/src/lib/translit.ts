import Sanscript from '@indic-transliteration/sanscript'

/** Offline phonetic typing: Roman letters become Gujarati or Hindi when a word is finished. */
export type TypeMode = '' | 'gu' | 'hi'

// roman -> [Gujarati, Hindi]. Common temple and business words that plain rules cannot guess.
const WORDS: Record<string, [string, string]> = {
  shri: ['શ્રી', 'श्री'], shree: ['શ્રી', 'श्री'], mandir: ['મંદિર', 'मंदिर'], mata: ['માતા', 'माता'], mataji: ['માતાજી', 'माताजी'],
  khodiyar: ['ખોડિયાર', 'खोड़ियार'], ambe: ['અંબે', 'अंबे'], amba: ['અંબા', 'अंबा'], ambaji: ['અંબાજી', 'अंबाजी'], hanuman: ['હનુમાન', 'हनुमान'],
  ganesh: ['ગણેશ', 'गणेश'], ganpati: ['ગણપતિ', 'गणपति'], shiv: ['શિવ', 'शिव'], shankar: ['શંકર', 'शंकर'], mahadev: ['મહાદેવ', 'महादेव'],
  ram: ['રામ', 'राम'], krishna: ['કૃષ્ણ', 'कृष्ण'], radha: ['રાધા', 'राधा'], sita: ['સીતા', 'सीता'], laxmi: ['લક્ષ્મી', 'लक्ष्मी'], lakshmi: ['લક્ષ્મી', 'लक्ष्मी'],
  saraswati: ['સરસ્વતી', 'सरस्वती'], durga: ['દુર્ગા', 'दुर्गा'], kali: ['કાળી', 'काली'], bhairav: ['ભૈરવ', 'भैरव'], jain: ['જૈન', 'जैन'], swaminarayan: ['સ્વામિનારાયણ', 'स्वामिनारायण'],
  sihasan: ['સિંહાસન', 'सिंहासन'], singhasan: ['સિંહાસન', 'सिंहासन'], parikar: ['પરિકર', 'परिकर'], pratima: ['પ્રતિમા', 'प्रतिमा'], murti: ['મૂર્તિ', 'मूर्ति'],
  pathar: ['પથ્થર', 'पत्थर'], marble: ['માર્બલ', 'मार्बल'], sandstone: ['સેન્ડસ્ટોન', 'सैंडस्टोन'], granite: ['ગ્રેનાઈટ', 'ग्रेनाइट'],
  gam: ['ગામ', 'गांव'], gaam: ['ગામ', 'गांव'], shehar: ['શહેર', 'शहर'], sahar: ['શહેર', 'शहर'], jilla: ['જિલ્લો', 'ज़िला'], trust: ['ટ્રસ્ટ', 'ट्रस्ट'],
  sanstha: ['સંસ્થા', 'संस्था'], rupiya: ['રૂપિયા', 'रुपये'], rupiyaa: ['રૂપિયા', 'रुपये'], lakh: ['લાખ', 'लाख'], hajar: ['હજાર', 'हज़ार'], crore: ['કરોડ', 'करोड़'], karod: ['કરોડ', 'करोड़'],
  gst: ['જીએસટી', 'जीएसटी'], nondh: ['નોંધ', 'नोंध'], tarikh: ['તારીખ', 'तारीख'], ane: ['અને', 'और'], aur: ['અને', 'और'], na: ['ના', 'का'],
  che: ['છે', 'है'], chhe: ['છે', 'है'], hai: ['છે', 'है'], nathi: ['નથી', 'नहीं'], nahi: ['નથી', 'नहीं'], kam: ['કામ', 'काम'], maal: ['માલ', 'माल'],
  majuri: ['મજૂરી', 'मज़दूरी'], pani: ['પાણી', 'पानी'], bijli: ['વીજળી', 'बिजली'], vijli: ['વીજળી', 'बिजली'], rang: ['રંગ', 'रंग'], mandap: ['મંડપ', 'मंडप'],
  shikhar: ['શિખર', 'शिखर'], gumbaj: ['ગુંબજ', 'गुंबद'], pillar: ['પિલર', 'पिलर'], thambh: ['થાંભલો', 'खंभा'], dwar: ['દ્વાર', 'द्वार'], darwaja: ['દરવાજો', 'दरवाज़ा'],
  size: ['સાઇઝ', 'साइज़'], design: ['ડિઝાઇન', 'डिज़ाइन'], delivery: ['ડિલિવરી', 'डिलीवरी'], advance: ['એડવાન્સ', 'एडवांस'], payment: ['પેમેન્ટ', 'पेमेंट'], mahina: ['મહિના', 'महीने'],
  foot: ['ફૂટ', 'फुट'], fut: ['ફૂટ', 'फुट'], sqft: ['સ્ક્વેર ફૂટ', 'वर्ग फुट'], fitting: ['ફીટીંગ', 'फिटिंग'], transport: ['ટ્રાન્સપોર્ટ', 'ट्रांसपोर्ट'],
}

const SCRIPT = { gu: 'gujarati', hi: 'devanagari' } as const
const VIRAMA = { gu: '્', hi: '्' } as const

function plain(w: string, mode: 'gu' | 'hi'): string {
  // Typed Hinglish -> ITRANS: lower-case unless a capital marks a retroflex letter inside the word
  let s = /^[A-Z][a-z]*$/.test(w) ? w.toLowerCase() : w
  s = s.replace(/n(?=[kgjtdpb]|ch|sh)/g, 'M') // n before a consonant -> anusvara
  // a lone a or i at the end of a longer word is almost always the long vowel (punadhara, aapi)
  if (s.length > 3) s = s.replace(/([b-df-hj-np-tv-z])a$/, '$1A').replace(/([b-df-hj-np-tv-z])i$/, '$1I')
  s = s.replace(/chh/g, 'Ch').replace(/gn(?=y|a|\b)/g, 'GY')
  let out = Sanscript.t(s, 'itrans', SCRIPT[mode])
  // a word never ends in a half letter
  out = out.replace(new RegExp(VIRAMA[mode] + '$'), '')
  return out
}

export function convertWord(w: string, mode: TypeMode): string {
  if (!mode) return w
  const k = w.toLowerCase()
  const hit = WORDS[k]
  if (hit) return hit[mode === 'gu' ? 0 : 1]
  const bhai = k.match(/^(.+?)(bhai|ben)$/)
  if (bhai && bhai[1].length > 1) return convertWord(bhai[1], mode) + (bhai[2] === 'bhai' ? (mode === 'gu' ? 'ભાઈ' : 'भाई') : mode === 'gu' ? 'બેન' : 'बेन')
  return plain(w, mode)
}

/** Convert every Roman word in the text. */
export function convertAll(text: string, mode: TypeMode): string {
  if (!mode) return text
  return text.replace(/[A-Za-z]+/g, (w) => convertWord(w, mode))
}

/** While typing: convert finished words but leave the word still being typed alone. */
export function convertTyping(text: string, mode: TypeMode): string {
  if (!mode) return text
  const m = text.match(/^([\s\S]*?)([A-Za-z]+)$/)
  if (!m) return convertAll(text, mode)
  return convertAll(m[1], mode) + m[2]
}
