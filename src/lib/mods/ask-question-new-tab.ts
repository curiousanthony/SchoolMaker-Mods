import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'ask-question-new-tab',
  name: 'Ask Question in New Tab',
  description: "Makes the 'Ask a question' button under lessons open in a new tab.",
  category: 'Functionality',
  tags: ['lessons', 'q&a', 'ux'],
  enabled: false,
  published: false,
  bannerUrl: '/images/mods/placeholder-banner.png',
  modType: 'javascript',
  functionString: `(config) => {
      setTimeout(() => {
        const askQButton = qs('#products_lesson_questions_frame > div > div > div > a');
        log("Checking for 'Ask a question' button:", askQButton);
        if (askQButton) {
          askQButton.setAttribute("target", "_blank");
          log("'Ask a question' button now opens in a new tab.");
        }
      }, 1000);
    }`,
};
