import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'community-level-badge',
  name: 'Community Level Badge',
  description: "Displays a custom badge next to a community member's name based on their level.",
  category: 'Appearance',
  tags: ['community', 'badge', 'level', 'gamification', 'ui'],
  enabled: false,
  published: true,
  modType: 'javascript',
  configDescription: 'mod_community-level-badge_config_description',
  configOptions: [
    {
      key: 'levelConfig',
      label: 'Level Configuration',
      type: 'level_config',
      value: JSON.stringify([
        { title: "Creator", icon: "award", color: "primary" },
      ]),
    }
  ],
  functionString: `(config) => {
    const levelConfigs = JSON.parse(config.levelConfig || '[]');
    if (levelConfigs.length === 0) return;

    const getLevelData = (level) => {
      // Levels in SchoolMaker are 1-based, array is 0-based.
      const levelIndex = parseInt(level, 10) - 1;
      if (levelIndex >= 0 && levelIndex < levelConfigs.length) {
        return levelConfigs[levelIndex];
      }
      return null;
    }

    const postsEl = qsa('div[id^="forums_topic_"]');
    if (!postsEl || postsEl.length === 0) return;

    postsEl.forEach(postEl => {
      const authorLevelEl = qs('div[data-popover-url^="/profiles/"] a > span', postEl);
      if (authorLevelEl) {
        const authorLevel = authorLevelEl.innerText.trim();
        const levelData = getLevelData(authorLevel);

        if (levelData && levelData.title) {
          const authorNameContainer = qs('div:has(> h3 > a[href^="/profiles/"])', postEl);
          if (authorNameContainer && !qs("h5#custom-badge", authorNameContainer)) {
            authorNameContainer.classList.add("gap-1");

            const colorClass = levelData.color === 'primary'
              ? 'text-primary'
              : \`text-\${levelData.color}-500\`;

            const badgeEl = document.createElement('h5');
            badgeEl.className = "text-xs text-gray-700 ml-1 bg-white border rounded-md px-2 flex items-center gap-1 py-[3px]";
            badgeEl.id = "custom-badge";
            badgeEl.innerHTML = \`
              <i class="fas fa-\${levelData.icon} \${colorClass}"></i>
              <span class="hidden sm:inline-block leading-3 pt-[1px]">
                \${levelData.title}
              </span>
            \`;
            authorNameContainer.appendChild(badgeEl);
          }
        }
      }
    });
  }`,
};
