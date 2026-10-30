/** Shown in Settings and written into every backup. Keep in step with package.json and app.json. */
export const APP_VERSION = '1.0.0';

export const WHAT_IT_DOES: { icon: 'pen' | 'calendar' | 'chart' | 'users' | 'flame' | 'sparkle' | 'heart' | 'file' | 'cart'; title: string; text: string }[] = [
  { icon: 'pen', title: 'Log by typing names', text: 'Write "rice dal in lunch" or "5 roti dinner". It finds the meal and the count from your words.' },
  { icon: 'sparkle', title: 'Learns your habits', text: 'What you eat often, and what you eat together, becomes your usual meals.' },
  { icon: 'calendar', title: 'Plans your menu', text: "Today's menu, what comes next by the clock, and a menu for the whole week. Swap any dish." },
  { icon: 'chart', title: 'Tracks nutrition', text: 'Calories, protein, carbs, fat and fibre against your own daily goal, with a 7-day chart.' },
  { icon: 'users', title: 'Profiles for the family', text: 'Up to six people, each with their own diary, goal and health conditions.' },
  { icon: 'heart', title: 'Health aware', text: 'Menus go easier on heavy dishes for diabetes, cholesterol or BP, and skip dairy or gluten when asked.' },
  { icon: 'cart', title: 'Lists', text: 'Say "add grocery list rice, daal, sugar, oil" in Chat and it lands on your grocery list. Make other lists too, tick items off, share them.' },
  { icon: 'file', title: 'Backup and export', text: 'Copy or share a backup, restore it on another phone, or export your meals as a spreadsheet file.' },
];

export const CHANGELOG: { version: string; items: string[] }[] = [
  {
    version: '1.0.0',
    items: [
      'Welcome and first questions that build your profile',
      'Chat that reads the meal and the count from your message',
      'Five meals a day: breakfast, morning snack, lunch, evening snack, dinner',
      'Home dashboard with today\'s menu and the meals coming up by time',
      'Weekly menu, nutrition screen and family profiles',
      'Lists tab: grocery and other lists, filled straight from Chat',
      'Recipe-book look: serif headings, warm paper and terracotta',
      'Dark and light themes, backup, restore and export',
    ],
  },
];
