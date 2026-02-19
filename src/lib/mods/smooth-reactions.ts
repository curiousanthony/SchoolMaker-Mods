import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'smooth-reactions',
  name: 'Smooth Reactions',
  description: 'Adds a smooth scaling animation to community reactions, mimicking the LinkedIn experience.',
  category: 'Appearance',
  tags: ['community', 'ui', 'animation', 'ux'],
  enabled: false,
  published: true,
  modType: 'css',
  bannerUrl: '/images/mods/smooth-reactions-banner.png',
  cssString: `
/* --- Mod: Smooth Reactions --- */
[id^="stats_forums_topic_"] dialog {
  transform: scale(1.7) !important;
  overflow: visible !important;
  gap: 0.15rem;
}

[id^="stats_forums_topic_"] dialog a {
  padding-inline: .2rem !important;
  padding-block: .1rem !important;
  transition: transform .1s ease-in-out;
  transform-origin: bottom;
  background-color: transparent !important;
  transform: scale(1.4) !important;
}

[id^="stats_forums_topic_"] dialog a[data-highlighted] {
  transform: scale(1.9) !important;
}
  `,
};
