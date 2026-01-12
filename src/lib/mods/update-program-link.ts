import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'update-program-link',
  name: 'Update Program Link',
  description: "Updates the main 'Programs' navigation link to point to a specific program ID.",
  category: 'Functionality',
  tags: ['navigation', 'program'],
  enabled: true,
  published: true,
  bannerUrl: '/images/mods/placeholder-banner.png',
  modType: 'javascript',
  configOptions: [
    {
      key: 'programId',
      label: 'Program ID',
      type: 'text',
      placeholder: 'e.g. db61dab4-edde-48af-9c38-b344f6cc8a6d',
      value: '',
      required: true,
    },
  ],
  functionString: `(config) => {
      const programId = config.programId;
      if (!programId) {
        log("Update Program Link mod is enabled, but no Program ID is configured.");
        return;
      }
      const programsLinkElements = qsa('.desktop-navigation-bar:has(.programs-page-title) a[href="/products"]');
      if (programsLinkElements.length > 0) {
        programsLinkElements.forEach(el => {
          el.setAttribute("href", "/products/" + programId);
        });
        log("Programs link updated to program ID: " + programId, programsLinkElements);
      } else {
        log("No matching elements found for updateProgramsLink");
      }
    }`,
  mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  previewEnabled: false,
};
