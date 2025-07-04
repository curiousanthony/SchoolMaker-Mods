import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'programs-singular',
  name: 'Singular Program Title',
  description: "Changes the plural 'Programmes' title to singular 'Programme' in the navigation.",
  category: 'Appearance',
  tags: ['ui', 'navigation', 'localization'],
  enabled: true,
  functionString: `(config) => {
      const programsTitleElements = qsa(".programs-page-title > span");
      if (programsTitleElements.length > 0) {
        programsTitleElements.forEach(el => {
          el.innerText = "Programme";
        });
        log("Programs nav edited");
      } else {
        log("Programs nav element not found");
      }
    }`,
  //mediaUrl: 'https://placehold.co/1280x720.png',
};
