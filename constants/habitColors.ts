export const DARK_COLORS = {
  bg:     '#0D1117',
  card:   '#161B27',
  border: '#21293D',
  accent: '#5B8AF0',
  green:  '#3DD68C',
  gold:   '#F5A623',
  text:   '#E8EEFF',
  sub:    '#6B7A99',
  muted:  '#2D3A52',
  white:  '#FFFFFF',
} as const;

export const LIGHT_COLORS = {
  bg:     '#F5F5F5',
  card:   '#FFFFFF',
  border: '#E0E0E0',
  accent: '#5B8AF0',
  green:  '#3DD68C',
  gold:   '#F5A623',
  text:   '#111111',
  sub:    '#777777',
  muted:  '#CCCCCC',
  white:  '#FFFFFF',
} as const;

// Static dark-mode alias kept for components not yet theme-aware
export const C = DARK_COLORS;

export const HABIT_EMOJIS = [
  '💧','🏃','📚','🧘','🍎','💊','🛏️','🎯','✍️','🎵',
  '🌿','💪','🧠','☕','🌅','🚴','🥗','🤸','🌸','⭐',
  '🧹','🐾','🎨','💻','🌙','🦷','🏋️','🧗','🪴','🎻',
];

export const HABIT_COLORS = [
  '#5B8AF0','#3DD68C','#F5A623','#E05C7A','#A78BFA',
  '#38BDF8','#FB923C','#34D399','#F472B6','#FBBF24',
];
