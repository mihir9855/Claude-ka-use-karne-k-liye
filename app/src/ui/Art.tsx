import { useRef, type ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Mask, Path, Rect } from 'react-native-svg';
import type { DishArtKey } from '../core/artFor';

/*
 * Flat illustrations, drawn on a 96 x 96 grid: no outlines, three or four colours, rounded shapes,
 * a soft highlight on each. They replace line icons for meals, dishes, store aisles and navigation.
 */

const INK = '#17143C';
const CREAM = '#FFF4DC';
const LEAF = '#2BB673';
const LEAF_D = '#168A55';
const SAFFRON = '#FFB020';
const CHILI = '#FF6A4D';
const GRAPE = '#5B45E0';
const MINT = '#19B58A';
const SKY = '#35C2E0';
const ROTI = '#E9B867';
const ROTI_D = '#CF9548';

let counter = 0;
const useUid = () => {
  const ref = useRef<string | null>(null);
  if (!ref.current) ref.current = `a${++counter}`;
  return ref.current;
};

function Frame({ size, children }: { size: number; children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      {children}
    </Svg>
  );
}

/** A bowl seen slightly from above. `y` is the rim line. */
function Bowl({ color, rim, y = 56 }: { color: string; rim: string; y?: number }) {
  return (
    <G>
      <Ellipse cx="48" cy={y + 36} rx="22" ry="4" fill={INK} opacity={0.12} />
      <Path d={`M12 ${y} H84 C84 ${y + 22} 68 ${y + 33} 48 ${y + 33} C28 ${y + 33} 12 ${y + 22} 12 ${y} Z`} fill={color} />
      <Path d={`M20 ${y + 6} C22 ${y + 18} 30 ${y + 25} 38 ${y + 28}`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.35} fill="none" />
      <Ellipse cx="48" cy={y} rx="36" ry="8" fill={rim} />
    </G>
  );
}

function Steam({ x = 48, y = 22, color = '#fff' }: { x?: number; y?: number; color?: string }) {
  return (
    <G stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.85}>
      <Path d={`M${x - 10} ${y + 10} C${x - 16} ${y + 4} ${x - 4} ${y - 2} ${x - 10} ${y - 10}`} />
      <Path d={`M${x} ${y + 12} C${x - 6} ${y + 4} ${x + 6} ${y - 2} ${x} ${y - 12}`} />
      <Path d={`M${x + 10} ${y + 10} C${x + 4} ${y + 4} ${x + 16} ${y - 2} ${x + 10} ${y - 10}`} />
    </G>
  );
}

// ---------------------------------------------------------------- dishes

function RiceBowl({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#fff" />
      <Path d="M18 56 C20 28 76 28 78 56 Z" fill="#FFFDF6" />
      <Path d="M26 50 C30 36 44 32 52 33" stroke="#EFE8D2" strokeWidth="3" strokeLinecap="round" fill="none" />
      <G fill="#E6DCC0">
        <Ellipse cx="40" cy="44" rx="3" ry="1.6" />
        <Ellipse cx="54" cy="40" rx="3" ry="1.6" />
        <Ellipse cx="62" cy="48" rx="3" ry="1.6" />
        <Ellipse cx="48" cy="50" rx="3" ry="1.6" />
      </G>
      <Path d="M44 33 C40 26 46 22 50 26 C54 22 60 26 54 33 Z" fill={LEAF} />
      <Circle cx="60" cy="36" r="3.4" fill={CHILI} />
    </G>
  );
}

function RotiStack() {
  return (
    <G>
      <Ellipse cx="48" cy="76" rx="32" ry="6" fill={INK} opacity={0.12} />
      <Ellipse cx="48" cy="66" rx="34" ry="12" fill={ROTI_D} />
      <Ellipse cx="48" cy="61" rx="34" ry="12" fill={ROTI} />
      <Ellipse cx="46" cy="50" rx="32" ry="12" fill={ROTI_D} />
      <Ellipse cx="46" cy="45" rx="32" ry="12" fill={ROTI} />
      <Ellipse cx="50" cy="34" rx="28" ry="10" fill={ROTI_D} />
      <Ellipse cx="50" cy="29" rx="28" ry="10" fill="#F4C987" />
      <G fill={ROTI_D} opacity={0.7}>
        <Circle cx="42" cy="27" r="2" />
        <Circle cx="56" cy="31" r="2.2" />
        <Circle cx="64" cy="26" r="1.6" />
        <Circle cx="48" cy="34" r="1.6" />
      </G>
      <Ellipse cx="42" cy="24" rx="9" ry="3" fill="#fff" opacity={0.3} />
    </G>
  );
}

function DalBowl({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#FFFFFF" />
      <Ellipse cx="48" cy="56" rx="31" ry="6.2" fill="#F6B93B" />
      <Path d="M30 56 C38 52 46 59 54 55 C60 52 64 56 68 55" stroke="#E58E1A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <G fill={LEAF}>
        <Circle cx="40" cy="55" r="1.8" />
        <Circle cx="52" cy="57" r="1.8" />
        <Circle cx="62" cy="54" r="1.8" />
      </G>
      <Circle cx="36" cy="57" r="1.5" fill={CHILI} />
      <Steam x={48} y={36} color={tone} />
    </G>
  );
}

function PaneerBowl({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#FFFFFF" />
      <Ellipse cx="48" cy="56" rx="31" ry="6.2" fill="#E8553A" />
      <G>
        <Rect x="30" y="38" width="15" height="15" rx="3.5" fill="#FFF7E6" />
        <Rect x="30" y="38" width="15" height="5" rx="2.5" fill="#fff" />
        <Rect x="49" y="34" width="16" height="16" rx="3.5" fill="#FFF7E6" />
        <Rect x="49" y="34" width="16" height="5" rx="2.5" fill="#fff" />
        <Rect x="40" y="46" width="14" height="14" rx="3.5" fill="#FFF7E6" />
        <Rect x="40" y="46" width="14" height="4.6" rx="2.3" fill="#fff" />
      </G>
      <G fill={LEAF}>
        <Circle cx="66" cy="54" r="2" />
        <Circle cx="28" cy="55" r="2" />
        <Circle cx="58" cy="58" r="1.8" />
      </G>
    </G>
  );
}

function VeggiePan() {
  return (
    <G>
      <Ellipse cx="48" cy="80" rx="30" ry="4.5" fill={INK} opacity={0.12} />
      <Path d="M6 50 H18" stroke="#3A3566" strokeWidth="6" strokeLinecap="round" />
      <Path d="M78 50 H90" stroke="#3A3566" strokeWidth="6" strokeLinecap="round" />
      <Path d="M14 48 H82 C82 68 68 78 48 78 C28 78 14 68 14 48 Z" fill="#2A2563" />
      <Ellipse cx="48" cy="48" rx="34" ry="8" fill="#4A4588" />
      <Ellipse cx="48" cy="48" rx="29" ry="6" fill="#3B3577" />
      <G>
        <Circle cx="34" cy="46" r="5" fill="#FF8A3D" />
        <Circle cx="46" cy="44" r="5" fill={LEAF} />
        <Circle cx="58" cy="46" r="5" fill={CHILI} />
        <Circle cx="66" cy="49" r="3.6" fill={SAFFRON} />
        <Circle cx="40" cy="50" r="3.6" fill={LEAF} />
        <Rect x="50" y="48" width="8" height="5" rx="2" fill="#FF8A3D" />
      </G>
      <Path d="M20 58 C22 68 28 72 36 75" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.22} fill="none" />
      <Steam x={48} y={30} color="#B9B4F0" />
    </G>
  );
}

function FruitBowl({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#fff" />
      <Circle cx="34" cy="48" r="13" fill="#FF5A6A" />
      <Circle cx="30" cy="43" r="4" fill="#fff" opacity={0.35} />
      <Path d="M34 36 C34 31 38 29 41 30 C40 34 38 36 34 36 Z" fill={LEAF} />
      <Circle cx="58" cy="46" r="13" fill="#FFA531" />
      <Circle cx="54" cy="41" r="4" fill="#fff" opacity={0.35} />
      <Path d="M30 54 C42 70 70 66 82 46" stroke="#FFD13D" strokeWidth="9" strokeLinecap="round" fill="none" />
      <Path d="M47 34 C47 27 55 24 58 28" stroke={LEAF_D} strokeWidth="3" strokeLinecap="round" fill="none" />
    </G>
  );
}

function Glass({ tone }: { tone: string }) {
  return (
    <G>
      <Ellipse cx="48" cy="86" rx="20" ry="4" fill={INK} opacity={0.12} />
      <Path d="M28 22 H68 L63 82 C63 85 60 86 58 86 H38 C36 86 33 85 33 82 Z" fill="#fff" opacity={0.9} />
      <Path d="M30 36 H66 L63 82 C63 85 60 86 58 86 H38 C36 86 33 85 33 82 Z" fill="#FFF3E2" />
      <Path d="M30 36 H66 L65.4 43 C58 46 52 40 48 43 C42 46 36 41 30.6 43 Z" fill="#fff" />
      <Path d="M36 50 L38 76" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={0.7} />
      <Path d="M60 8 L54 38" stroke={tone} strokeWidth="5" strokeLinecap="round" />
      <Circle cx="60.5" cy="8.5" r="3" fill={tone} />
    </G>
  );
}

function Dosa({ tone }: { tone: string }) {
  return (
    <G>
      <Ellipse cx="48" cy="80" rx="36" ry="5" fill={INK} opacity={0.12} />
      <Path d="M8 62 C8 34 30 20 58 24 C80 28 90 46 88 62 Z" fill="#E8A845" />
      <Path d="M14 60 C14 40 32 28 56 30 C72 32 82 44 82 60 Z" fill="#F4C46A" />
      <Path d="M22 58 C24 44 36 36 52 36" stroke="#E8A845" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M8 62 H88" stroke="#C98A2B" strokeWidth="3" strokeLinecap="round" />
      <Ellipse cx="26" cy="70" rx="14" ry="6" fill={tone} />
      <Ellipse cx="26" cy="68" rx="11" ry="4" fill="#FFF7E6" />
      <Ellipse cx="68" cy="70" rx="14" ry="6" fill={tone} />
      <Ellipse cx="68" cy="68" rx="11" ry="4" fill="#E8553A" />
    </G>
  );
}

function Idli({ tone }: { tone: string }) {
  return (
    <G>
      <Ellipse cx="48" cy="84" rx="38" ry="5" fill={INK} opacity={0.12} />
      <Ellipse cx="48" cy="72" rx="42" ry="12" fill={tone} />
      <Ellipse cx="48" cy="69" rx="38" ry="9.5" fill="#FFF4DC" />
      <G>
        <Path d="M14 68 C14 46 36 46 36 68 Z" fill="#E4DCC2" />
        <Path d="M14 65 C14 45 36 45 36 65 Z" fill="#FFFDF6" />
        <Path d="M37 66 C37 40 61 40 61 66 Z" fill="#E4DCC2" />
        <Path d="M37 63 C37 39 61 39 61 63 Z" fill="#FFFDF6" />
        <Path d="M62 68 C62 46 84 46 84 68 Z" fill="#E4DCC2" />
        <Path d="M62 65 C62 45 84 45 84 65 Z" fill="#FFFDF6" />
      </G>
      <Path d="M20 56 C21 51 25 49 28 50" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M43 52 C44 46 49 44 53 45" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M68 56 C69 51 73 49 76 50" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Circle cx="48" cy="26" r="6" fill={SAFFRON} />
      <Circle cx="46" cy="24" r="2" fill="#fff" opacity={0.5} />
    </G>
  );
}

function Soup({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#fff" />
      <Ellipse cx="48" cy="56" rx="31" ry="6.2" fill="#F26A4B" />
      <Path d="M30 55 C38 52 46 58 54 55 C60 53 64 56 68 55" stroke="#FFB199" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Circle cx="44" cy="56" r="2" fill="#FFF3DC" />
      <Circle cx="58" cy="55" r="1.6" fill={LEAF} />
      <Steam x={48} y={36} color={tone} />
      <Path d="M70 18 L58 54" stroke="#BDB8E6" strokeWidth="4" strokeLinecap="round" />
      <Ellipse cx="72" cy="15" rx="5.5" ry="7" fill="#BDB8E6" transform="rotate(20 72 15)" />
    </G>
  );
}

function SnackTri() {
  return (
    <G>
      <Ellipse cx="46" cy="82" rx="34" ry="5" fill={INK} opacity={0.12} />
      <Path d="M10 74 L38 26 L66 74 Z" fill="#D9892B" />
      <Path d="M14 72 L38 31 L62 72 Z" fill="#F0AA4C" />
      <Path d="M24 68 L38 44" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.35} />
      <Path d="M44 78 L66 40 L88 78 Z" fill="#D9892B" />
      <Path d="M48 76 L66 45 L84 76 Z" fill="#F0AA4C" />
      <Circle cx="78" cy="22" r="9" fill={LEAF} />
      <Circle cx="75" cy="19" r="3" fill="#fff" opacity={0.35} />
    </G>
  );
}

function Salad({ tone }: { tone: string }) {
  return (
    <G>
      <Bowl color={tone} rim="#fff" />
      <Path d="M16 56 C16 36 32 30 40 38 C44 28 62 28 62 40 C74 34 82 44 80 56 Z" fill={LEAF} />
      <Path d="M26 54 C28 44 34 40 40 42" stroke={LEAF_D} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M56 54 C58 46 64 42 70 44" stroke={LEAF_D} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Circle cx="48" cy="46" r="9" fill={CHILI} />
      <Circle cx="48" cy="46" r="5.5" fill="#FF8E78" />
      <Circle cx="30" cy="46" r="5" fill={SAFFRON} />
      <Circle cx="68" cy="48" r="4.4" fill="#FFE08A" />
    </G>
  );
}

function Ladoo({ tone }: { tone: string }) {
  return (
    <G>
      <Ellipse cx="48" cy="82" rx="36" ry="5" fill={INK} opacity={0.12} />
      <Ellipse cx="48" cy="74" rx="38" ry="9" fill={tone} />
      <Circle cx="32" cy="58" r="15" fill="#E98A2C" />
      <Circle cx="64" cy="58" r="15" fill="#E98A2C" />
      <Circle cx="48" cy="40" r="16" fill="#F4A340" />
      <Circle cx="43" cy="35" r="5" fill="#fff" opacity={0.3} />
      <Circle cx="27" cy="54" r="3.6" fill="#fff" opacity={0.28} />
      <Circle cx="59" cy="54" r="3.6" fill="#fff" opacity={0.28} />
      <G fill="#FFE9B8">
        <Circle cx="42" cy="44" r="1.5" />
        <Circle cx="54" cy="42" r="1.5" />
        <Circle cx="36" cy="64" r="1.5" />
        <Circle cx="68" cy="62" r="1.5" />
        <Circle cx="30" cy="62" r="1.5" />
        <Circle cx="60" cy="66" r="1.5" />
      </G>
    </G>
  );
}

// ---------------------------------------------------------------- times of day

function Sunrise() {
  return (
    <G>
      <G stroke={SAFFRON} strokeWidth="5" strokeLinecap="round">
        <Line x1="48" y1="6" x2="48" y2="14" />
        <Line x1="20" y1="18" x2="26" y2="24" />
        <Line x1="76" y1="18" x2="70" y2="24" />
        <Line x1="8" y1="40" x2="16" y2="40" />
        <Line x1="88" y1="40" x2="80" y2="40" />
      </G>
      <Circle cx="48" cy="44" r="20" fill={SAFFRON} />
      <Circle cx="42" cy="38" r="6" fill="#fff" opacity={0.35} />
      <Bowl color={CHILI} rim="#FFE3DC" y={54} />
      <Ellipse cx="48" cy="54" rx="29" ry="6" fill="#FFF4DC" />
      <Circle cx="38" cy="54" r="2" fill={SAFFRON} />
      <Circle cx="50" cy="55" r="2" fill={LEAF} />
      <Circle cx="60" cy="53" r="2" fill={CHILI} />
    </G>
  );
}

function PlateArt() {
  return (
    <G>
      <Ellipse cx="48" cy="82" rx="30" ry="5" fill={INK} opacity={0.12} />
      <Circle cx="48" cy="48" r="38" fill="#fff" />
      <Circle cx="48" cy="48" r="32" fill="none" stroke="#E6E1FF" strokeWidth="3" />
      <Circle cx="34" cy="38" r="11" fill={SAFFRON} />
      <Circle cx="34" cy="38" r="6.5" fill="#FFD071" />
      <Circle cx="62" cy="38" r="11" fill={MINT} />
      <Circle cx="62" cy="38" r="6.5" fill="#63D9B5" />
      <Circle cx="48" cy="62" r="11" fill={CHILI} />
      <Circle cx="48" cy="62" r="6.5" fill="#FF9C86" />
    </G>
  );
}

function ChaiArt() {
  const id = useUid();
  return (
    <G>
      <Defs>
        <Mask id={`${id}m`}>
          <Rect width="96" height="96" fill="#fff" />
        </Mask>
      </Defs>
      <Ellipse cx="46" cy="84" rx="34" ry="5" fill={INK} opacity={0.12} />
      <Ellipse cx="46" cy="80" rx="36" ry="7" fill="#fff" />
      <Path d="M14 40 H74 C74 66 64 78 44 78 C24 78 14 66 14 40 Z" fill={MINT} />
      <Path d="M20 46 C21 58 26 66 32 70" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity={0.4} fill="none" />
      <Path d="M74 46 H80 C88 46 88 64 76 64" stroke={MINT} strokeWidth="6" strokeLinecap="round" fill="none" />
      <Ellipse cx="44" cy="40" rx="30" ry="6" fill="#E8B27A" />
      <Ellipse cx="44" cy="40" rx="30" ry="6" fill="none" stroke="#fff" strokeWidth="2.5" />
      <Steam x={44} y={22} color="#8E86D8" />
    </G>
  );
}

function FruitArt() {
  return (
    <G>
      <Ellipse cx="48" cy="86" rx="26" ry="4" fill={INK} opacity={0.12} />
      <Circle cx="48" cy="56" r="28" fill="#FF5A6A" />
      <Path d="M30 60 C30 74 40 82 50 82" stroke="#E0394D" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.6} />
      <Circle cx="36" cy="46" r="7" fill="#fff" opacity={0.3} />
      <Path d="M48 30 C48 20 54 14 62 14" stroke="#7A4B2A" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M52 26 C52 14 66 10 74 16 C72 26 62 30 52 26 Z" fill={LEAF} />
    </G>
  );
}

function MoonArt() {
  const id = useUid();
  return (
    <G>
      <Defs>
        <Mask id={`${id}c`}>
          <Rect width="96" height="96" fill="#fff" />
          <Circle cx="70" cy="22" r="14" fill="#000" />
        </Mask>
      </Defs>
      <Circle cx="62" cy="26" r="18" fill="#FFD76A" mask={`url(#${id}c)`} />
      <G fill="#FFD76A">
        <Circle cx="28" cy="16" r="2.6" />
        <Circle cx="82" cy="46" r="2.2" />
        <Circle cx="14" cy="34" r="1.8" />
      </G>
      <Bowl color={GRAPE} rim="#E5E0FF" y={58} />
      <Ellipse cx="48" cy="58" rx="29" ry="6" fill="#FFF4DC" />
      <Circle cx="40" cy="58" r="2" fill={CHILI} />
      <Circle cx="52" cy="59" r="2" fill={LEAF} />
      <Steam x={48} y={40} color="#B9B4F0" />
    </G>
  );
}

function MilkArt() {
  return (
    <G>
      <Ellipse cx="48" cy="86" rx="22" ry="4" fill={INK} opacity={0.12} />
      <Path d="M28 26 H68 L64 82 C64 85 61 86 59 86 H37 C35 86 32 85 32 82 Z" fill="#fff" opacity={0.9} />
      <Path d="M30 40 H66 L64 82 C64 85 61 86 59 86 H37 C35 86 32 85 32 82 Z" fill="#F2F0FF" />
      <Path d="M37 52 L39 76" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <Path d="M76 18 L79 26 L87 27 L81 33 L83 41 L76 37 L69 41 L71 33 L65 27 L73 26 Z" fill="#FFD76A" />
    </G>
  );
}

// ---------------------------------------------------------------- store aisles

function AisleVeg() {
  return (
    <G>
      <Path d="M20 22 L66 70 C70 74 68 82 62 82 C58 82 52 78 48 74 L22 40 C18 34 18 28 20 22 Z" fill="#FF8A3D" transform="rotate(-8 48 48)" />
      <Path d="M30 30 L40 24 M38 40 L48 34 M46 52 L56 46" stroke="#E2701F" strokeWidth="3" strokeLinecap="round" />
      <Path d="M18 20 C10 10 20 4 24 12 C26 6 36 8 32 16 C40 14 40 24 30 24 Z" fill={LEAF} />
      <Path d="M74 30 C84 34 84 56 72 62 C64 56 64 38 74 30 Z" fill={LEAF_D} opacity={0.0} />
    </G>
  );
}

function AisleFruit() {
  return <FruitArt />;
}

function AisleDairy() {
  return <MilkArt />;
}

function AislePulse() {
  return (
    <G>
      <Bowl color="#E58E1A" rim="#FFE3A8" y={50} />
      <Ellipse cx="48" cy="50" rx="30" ry="6" fill="#F6B93B" />
      <G fill="#FFD76A">
        <Circle cx="30" cy="48" r="3" />
        <Circle cx="40" cy="52" r="3" />
        <Circle cx="50" cy="48" r="3" />
        <Circle cx="60" cy="52" r="3" />
        <Circle cx="68" cy="48" r="3" />
        <Circle cx="45" cy="44" r="2.6" />
        <Circle cx="56" cy="43" r="2.6" />
      </G>
    </G>
  );
}

function AisleStaple() {
  return (
    <G>
      <Path d="M26 84 L26 40 C26 36 30 34 34 34 H62 C66 34 70 36 70 40 V84 Z" fill="#E9D3A0" />
      <Path d="M26 84 L26 40 C26 36 30 34 34 34 H44 L40 84 Z" fill="#F4E4BC" opacity={0.6} />
      <Rect x="34" y="52" width="28" height="18" rx="5" fill={SAFFRON} />
      <Path d="M48 10 C42 18 42 28 48 34 C54 28 54 18 48 10 Z" fill="#D9A93A" />
      <Path d="M36 16 C32 22 34 30 40 34 C42 28 40 20 36 16 Z" fill="#E8BE5A" />
      <Path d="M60 16 C64 22 62 30 56 34 C54 28 56 20 60 16 Z" fill="#E8BE5A" />
    </G>
  );
}

function AisleDry() {
  return (
    <G>
      <Path d="M30 16 C54 16 74 40 70 70 C68 82 52 86 40 78 C24 66 18 34 30 16 Z" fill="#C98A4B" />
      <Path d="M34 24 C48 28 58 44 58 66" stroke="#E5B27A" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Circle cx="70" cy="30" r="10" fill={SAFFRON} />
      <Circle cx="67" cy="27" r="3" fill="#fff" opacity={0.4} />
      <Circle cx="80" cy="58" r="8" fill={CHILI} />
    </G>
  );
}

function AisleOil() {
  return (
    <G>
      <Rect x="38" y="8" width="20" height="16" rx="4" fill={INK} />
      <Path d="M36 24 H60 C70 30 72 40 72 50 V80 C72 84 68 86 64 86 H32 C28 86 24 84 24 80 V50 C24 40 26 30 36 24 Z" fill="#F6C945" />
      <Path d="M30 52 V78" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={0.5} />
      <Circle cx="50" cy="56" r="10" fill="#fff" opacity={0.85} />
      <Path d="M50 49 C46 55 46 60 50 62 C54 60 54 55 50 49 Z" fill="#F6C945" />
    </G>
  );
}

function AisleOther() {
  return (
    <G>
      <Path d="M14 40 H82 L74 80 C73 84 70 86 66 86 H30 C26 86 23 84 22 80 Z" fill={GRAPE} />
      <Path d="M30 40 L38 16 M66 40 L58 16" stroke={GRAPE} strokeWidth="5" strokeLinecap="round" />
      <Path d="M30 52 L34 76" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={0.3} />
      <Rect x="44" y="52" width="8" height="24" rx="4" fill="#fff" opacity={0.3} />
    </G>
  );
}

// ---------------------------------------------------------------- menu badges

function BadgeFamily() {
  return (
    <G>
      <Circle cx="34" cy="30" r="12" fill={CHILI} />
      <Path d="M12 78 C12 60 22 52 34 52 C46 52 56 60 56 78 Z" fill={CHILI} />
      <Circle cx="64" cy="38" r="9" fill={SAFFRON} />
      <Path d="M46 82 C46 66 54 58 64 58 C74 58 84 66 84 82 Z" fill={SAFFRON} />
    </G>
  );
}

function BadgeCuisine() {
  return (
    <G>
      <Bowl color={GRAPE} rim="#E5E0FF" y={52} />
      <Ellipse cx="48" cy="52" rx="30" ry="6" fill={CHILI} />
      <Path d="M30 20 C26 10 38 6 40 16" stroke={LEAF} strokeWidth="5" strokeLinecap="round" fill="none" />
      <Circle cx="56" cy="22" r="8" fill={SAFFRON} />
      <Circle cx="70" cy="30" r="5" fill={LEAF} />
    </G>
  );
}

function BadgeRules() {
  return (
    <G>
      <Rect x="18" y="12" width="60" height="72" rx="10" fill="#fff" />
      <Rect x="18" y="12" width="60" height="16" rx="8" fill={MINT} />
      <G stroke={MINT} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M28 44 L33 50 L42 38" />
        <Path d="M28 64 L33 70 L42 58" />
      </G>
      <G stroke="#C9C5EA" strokeWidth="5" strokeLinecap="round">
        <Line x1="50" y1="46" x2="68" y2="46" />
        <Line x1="50" y1="66" x2="68" y2="66" />
      </G>
    </G>
  );
}

function BadgeMenu() {
  return (
    <G>
      <Rect x="14" y="14" width="68" height="68" rx="14" fill="#fff" />
      <Circle cx="34" cy="36" r="9" fill={SAFFRON} />
      <Circle cx="62" cy="36" r="9" fill={MINT} />
      <Circle cx="34" cy="62" r="9" fill={CHILI} />
      <Circle cx="62" cy="62" r="9" fill={GRAPE} />
    </G>
  );
}

function BadgeCustomize() {
  return (
    <G>
      <Path d="M62 12 L84 34 L36 82 L12 86 L16 62 Z" fill={SAFFRON} />
      <Path d="M62 12 L84 34 L74 44 L52 22 Z" fill={CHILI} />
      <Path d="M16 62 L36 82 L12 86 Z" fill="#FFE3B0" />
      <Path d="M20 70 L28 78 L16 80 Z" fill={INK} />
    </G>
  );
}

function BadgeSaved() {
  return (
    <G>
      <Path d="M48 84 C20 64 8 48 8 32 C8 20 17 12 28 12 C37 12 44 17 48 24 C52 17 59 12 68 12 C79 12 88 20 88 32 C88 48 76 64 48 84 Z" fill={CHILI} />
      <Path d="M20 30 C20 24 24 21 29 21" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity={0.45} />
    </G>
  );
}

function BadgePantry() {
  return (
    <G>
      <Rect x="26" y="8" width="44" height="14" rx="5" fill={INK} />
      <Rect x="20" y="22" width="56" height="64" rx="14" fill="#fff" />
      <Rect x="20" y="40" width="56" height="30" fill={MINT} />
      <Path d="M30 30 V76" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity={0.6} />
      <Circle cx="48" cy="55" r="8" fill="#fff" opacity={0.5} />
    </G>
  );
}

function BadgeSettings() {
  return (
    <G>
      <G stroke="#C9C5EA" strokeWidth="6" strokeLinecap="round">
        <Line x1="14" y1="26" x2="82" y2="26" />
        <Line x1="14" y1="48" x2="82" y2="48" />
        <Line x1="14" y1="70" x2="82" y2="70" />
      </G>
      <Circle cx="34" cy="26" r="10" fill={GRAPE} />
      <Circle cx="62" cy="48" r="10" fill={CHILI} />
      <Circle cx="40" cy="70" r="10" fill={MINT} />
    </G>
  );
}

// ---------------------------------------------------------------- navigation

function NavPlan({ on }: { on: boolean }) {
  const a = on ? SAFFRON : '#9C98C9';
  const b = on ? '#fff' : '#CFCCEA';
  return (
    <G>
      <Rect x="10" y="16" width="76" height="68" rx="16" fill={b} />
      <Path d="M10 36 H86 V32 C86 23 79 16 70 16 H26 C17 16 10 23 10 32 Z" fill={a} />
      <Rect x="28" y="6" width="9" height="20" rx="4.5" fill={on ? CHILI : '#7F7AB0'} />
      <Rect x="59" y="6" width="9" height="20" rx="4.5" fill={on ? CHILI : '#7F7AB0'} />
      <Circle cx="30" cy="52" r="5" fill={a} />
      <Circle cx="48" cy="52" r="5" fill={on ? MINT : '#B0ACD6'} />
      <Circle cx="66" cy="52" r="5" fill={a} />
      <Circle cx="30" cy="70" r="5" fill={on ? GRAPE : '#B0ACD6'} />
      <Circle cx="48" cy="70" r="5" fill={a} />
    </G>
  );
}

function NavShop({ on }: { on: boolean }) {
  const a = on ? MINT : '#9C98C9';
  return (
    <G>
      <Path d="M24 40 L34 14 M72 40 L62 14" stroke={on ? SAFFRON : '#7F7AB0'} strokeWidth="7" strokeLinecap="round" />
      <Path d="M8 38 H88 L78 80 C77 84 74 86 70 86 H26 C22 86 19 84 18 80 Z" fill={a} />
      <Rect x="26" y="50" width="9" height="24" rx="4.5" fill="#fff" opacity={0.55} />
      <Rect x="43.5" y="50" width="9" height="24" rx="4.5" fill="#fff" opacity={0.55} />
      <Rect x="61" y="50" width="9" height="24" rx="4.5" fill="#fff" opacity={0.55} />
    </G>
  );
}

function NavStats({ on }: { on: boolean }) {
  const a = on ? CHILI : '#9C98C9';
  return (
    <G>
      <Circle cx="48" cy="50" r="36" fill="none" stroke={on ? '#fff' : '#CFCCEA'} strokeWidth="14" />
      <Path d="M48 14 A36 36 0 1 1 14.6 62" stroke={a} strokeWidth="14" strokeLinecap="round" fill="none" />
      <Path d="M48 14 A36 36 0 0 1 82 38" stroke={on ? SAFFRON : '#7F7AB0'} strokeWidth="14" strokeLinecap="round" fill="none" />
      <Circle cx="48" cy="50" r="9" fill={on ? MINT : '#B0ACD6'} />
    </G>
  );
}

// ---------------------------------------------------------------- public components

export type MealArtKey = 'breakfast' | 'midmorning' | 'lunch' | 'evening' | 'dinner' | 'bedtime';
export type AisleArtKey = 'veg' | 'fruit' | 'dairy' | 'pulse' | 'staple' | 'dry' | 'oil' | 'other';
export type BadgeArtKey = 'family' | 'cuisine' | 'rules' | 'menu' | 'customize' | 'saved' | 'pantry' | 'settings';
export type NavArtKey = 'plan' | 'shop' | 'stats';

export function MealArt({ slot, size = 56 }: { slot: MealArtKey; size?: number }) {
  return (
    <Frame size={size}>
      {slot === 'breakfast' && <Sunrise />}
      {slot === 'lunch' && <PlateArt />}
      {slot === 'midmorning' && <FruitArt />}
      {slot === 'evening' && <ChaiArt />}
      {slot === 'dinner' && <MoonArt />}
      {slot === 'bedtime' && <MilkArt />}
    </Frame>
  );
}

/** Bowl colours for each cuisine, so a week of dishes is not one colour. */
export const CUISINE_TONE: Record<string, string> = {
  north: '#5B45E0',
  west: '#FF6A4D',
  south: '#19B58A',
  east: '#E8559A',
  northeast: '#35A0E0',
  continental: '#F2A81D',
  indochinese: '#D1364A',
};

export function DishArt({ kind, tone = GRAPE, size = 56 }: { kind: DishArtKey; tone?: string; size?: number }) {
  return (
    <Frame size={size}>
      {kind === 'riceBowl' && <RiceBowl tone={tone} />}
      {kind === 'rotiStack' && <RotiStack />}
      {kind === 'dalBowl' && <DalBowl tone={tone} />}
      {kind === 'paneerBowl' && <PaneerBowl tone={tone} />}
      {kind === 'veggiePan' && <VeggiePan />}
      {kind === 'fruitBowl' && <FruitBowl tone={tone} />}
      {kind === 'glass' && <Glass tone={tone} />}
      {kind === 'dosa' && <Dosa tone={tone} />}
      {kind === 'idli' && <Idli tone={tone} />}
      {kind === 'soup' && <Soup tone={tone} />}
      {kind === 'snackTri' && <SnackTri />}
      {kind === 'salad' && <Salad tone={tone} />}
      {kind === 'ladoo' && <Ladoo tone={tone} />}
    </Frame>
  );
}

export function AisleArt({ aisle, size = 40 }: { aisle: AisleArtKey; size?: number }) {
  return (
    <Frame size={size}>
      {aisle === 'veg' && <AisleVeg />}
      {aisle === 'fruit' && <AisleFruit />}
      {aisle === 'dairy' && <AisleDairy />}
      {aisle === 'pulse' && <AislePulse />}
      {aisle === 'staple' && <AisleStaple />}
      {aisle === 'dry' && <AisleDry />}
      {aisle === 'oil' && <AisleOil />}
      {aisle === 'other' && <AisleOther />}
    </Frame>
  );
}

export function BadgeArt({ name, size = 36 }: { name: BadgeArtKey; size?: number }) {
  return (
    <Frame size={size}>
      {name === 'family' && <BadgeFamily />}
      {name === 'cuisine' && <BadgeCuisine />}
      {name === 'rules' && <BadgeRules />}
      {name === 'menu' && <BadgeMenu />}
      {name === 'customize' && <BadgeCustomize />}
      {name === 'saved' && <BadgeSaved />}
      {name === 'pantry' && <BadgePantry />}
      {name === 'settings' && <BadgeSettings />}
    </Frame>
  );
}

export function NavArt({ name, on, size = 28 }: { name: NavArtKey; on: boolean; size?: number }) {
  return (
    <Frame size={size}>
      {name === 'plan' && <NavPlan on={on} />}
      {name === 'shop' && <NavShop on={on} />}
      {name === 'stats' && <NavStats on={on} />}
    </Frame>
  );
}

/** Soft background shapes for the top of a screen. */
export function Backdrop({ width = 390, height = 220, tone = '#5B45E0' }: { width?: number; height?: number; tone?: string }) {
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMin slice" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <Rect width={width} height={height} fill={tone} />
      <Circle cx={width * 0.88} cy={height * 0.2} r={height * 0.55} fill="#fff" opacity={0.07} />
      <Circle cx={width * 0.1} cy={height * 0.95} r={height * 0.5} fill="#fff" opacity={0.06} />
      <Circle cx={width * 0.62} cy={height * 0.9} r={height * 0.22} fill="#FFB020" opacity={0.25} />
    </Svg>
  );
}
