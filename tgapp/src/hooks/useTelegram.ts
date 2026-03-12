import { useMemo } from 'react';

export function useTelegram() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  const theme = tg?.themeParams;

  const colors = useMemo(() => ({
    bg: theme?.bg_color || '#0f0f0f',
    secondaryBg: theme?.secondary_bg_color || '#1a1a1a',
    text: theme?.text_color || '#ffffff',
    hint: theme?.hint_color || '#6b7280',
    link: theme?.link_color || '#06b6d4',
    button: theme?.button_color || '#3b82f6',
    buttonText: theme?.button_text_color || '#ffffff',
  }), [theme]);

  return { tg, user, colors };
}