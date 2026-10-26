import { createContext, useContext } from 'react';

export type Tab = 'planner' | 'grocery' | 'nutrition';
export type Page =
  | { k: 'family' | 'cuisine' | 'rules' | 'menu' | 'customize' | 'saved' | 'pantry' | 'settings' }
  | { k: 'meal'; date: string; i: number };

export interface Nav {
  tab: Tab;
  setTab: (t: Tab) => void;
  go: (p: Page) => void;
  back: () => void;
  /** date shown on the Nutrition tab */
  nutDate: string;
  setNutDate: (d: string) => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const n = useContext(NavContext);
  if (!n) throw new Error('useNav outside NavContext');
  return n;
}
