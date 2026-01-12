import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'section-arrow-reorder',
  name: 'Section Arrow Reorder',
  description: 'Moves the expand/collapse arrow for sections to the right side, for a cleaner layout.',
  category: 'Appearance',
  tags: ['ui', 'program', 'lessons', 'layout'],
  enabled: false,
  published: true,
  modType: 'css',
  previewEnabled: true,
  mediaBeforeUrl: '/images/mods/section-arrow-reorder-before.png',
  mediaUrl: '/images/mods/section-arrow-reorder-after.png',
  bannerUrl: '/images/mods/section-arrow-reorder-banner.png',
  cssString: `
/* Reorder the arrow in section headers to the right */
[data-target^="#products_section_"] > svg {
    order: 1;
    margin-left: auto;
    margin-right: .5rem;
}
  `,
};
