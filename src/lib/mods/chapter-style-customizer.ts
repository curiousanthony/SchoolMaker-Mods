import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'chapter-style-customizer',
  name: 'Chapter Style Customizer',
  description: 'Customizes the appearance of a program\'s section groups (chapters) for better visual consistency.',
  category: 'Appearance',
  tags: ['ui', 'program', 'customization', 'chapters'],
  enabled: false,
  published: true,
  modType: 'css',
  previewEnabled: true,
  mediaBeforeUrl: '/images/mods/chapter-style-customizer-before.png',
  mediaUrl: '/images/mods/chapter-style-customizer-after.png',
  bannerUrl: '/images/mods/chapter-style-customizer-banner.png',
  configOptions: [
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      value: '#F9FAFB',
      placeholder: '#F9FAFB',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      value: '#000000',
      placeholder: '#000000',
    },
    {
      key: 'backgroundColorHover',
      label: 'Background Color (Hover)',
      type: 'color',
      value: '#FAFAFA',
      placeholder: '#FAFAFA',
    },
    {
      key: 'textColorHover',
      label: 'Text Color (Hover)',
      type: 'color',
      value: '#000000',
      placeholder: '#000000',
    },
    {
      key: 'fontSize',
      label: 'Font Size',
      type: 'select',
      value: '14px',
      options: ['12px', '14px', '16px', '18px', '20px'],
    },
    {
      key: 'fontWeight',
      label: 'Font Weight',
      type: 'select',
      value: '700',
      options: ['300', '400', '500', '600', '700', '800'],
    }
  ],
  cssString: `
/* Style for Program Section Groups (Chapters) */
[data-target^="#products_section_group_"] {
  justify-content: space-between !important;
  padding-block: 1rem;
  background-color: {{backgroundColor}} !important;
  color: {{textColor}} !important;
  font-size: {{fontSize}} !important;
  font-weight: {{fontWeight}} !important;
  border-bottom: 1px solid hsla(0 0% 0% / 0.1);
  transition: background-color 0.2s, color 0.2s;
}

[data-target^="#products_section_group_"]:hover {
  background-color: {{backgroundColorHover}} !important;
  color: {{textColorHover}} !important;
}

[data-target^="#products_section_group_"] svg {
  margin-right: .5rem;
  color: rgb(107 114 128 / 1) !important;
}
  `,
};
