import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'centered-desktop-navigation',
  name: 'Centered Desktop Navigation',
  description: 'Centers the navigation links in the desktop navigation bar.',
  category: 'Appearance',
  tags: ['ui', 'navigation', 'layout'],
  enabled: false,
  published: true,
  modType: 'css',
  cssString: `
/* --- Mod: Center Desktop Navigation Links --- */
.desktop-navigation-bar > nav > div > div:first-child > div:first-child {
  flex-grow: 0 !important;
}

.desktop-navigation-bar > nav > div > div:first-child > div:nth-child(3) {
  margin-left: auto !important;
}
  `,
  mediaBeforeUrl: '/images/mods/centered-desktop-navigation-before.png',
  mediaUrl: '/images/mods/centered-desktop-navigation-after.png',
  previewEnabled: true,
  bannerUrl: '/images/mods/centered-desktop-navigation-banner.png'
};
