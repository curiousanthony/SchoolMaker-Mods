import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'transform-school-name',
  name: 'Transform School Name',
  description: 'Removes the default uppercase styling from the school name in the navigation bar.',
  category: 'Appearance',
  tags: ['ui', 'navigation', 'branding'],
  enabled: true,
  functionString: `(config) => {
      const schoolName = qs('.desktop-navigation-bar a[href="/"]');
      if (schoolName) {
        schoolName.style.textTransform = "none";
        log("School name transformed");
      } else {
        log("School name element not found");
      }
    }`,
  mediaUrl: 'https://placehold.co/1280x720.png',
};
