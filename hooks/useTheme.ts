import { DARK_COLORS, LIGHT_COLORS } from '@/constants/habitColors';
import { useSettings } from '@/contexts/settings-context';

export function useTheme() {
  const { settings } = useSettings();
  return settings.lightMode ? LIGHT_COLORS : DARK_COLORS;
}
