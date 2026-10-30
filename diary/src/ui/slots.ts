import { SLOT_LABEL, type SlotId } from '../core/diary';
import type { IconName } from './Icon';

export const SLOT_ICON_ID: Record<SlotId, IconName> = { b: 'sunrise', l: 'today', s: 'coffee', d: 'moon' };
export const slotLabel = (s: SlotId) => SLOT_LABEL[s];
