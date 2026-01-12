import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'unread-notification-title-indicator',
  name: 'Unread Notification Title Indicator',
  description: 'Adds a symbol prefix like "(!)" to the page title to indicate when there are unread notifications.',
  category: 'Functionality',
  tags: ['ux', 'notifications', 'ui'],
  enabled: false,
  published: true,
  modType: 'javascript',
  mediaUrl: '/images/mods/unread-notification-title-indicator-after.png',
  previewEnabled: true,
  bannerUrl: '/images/mods/unread-notification-title-indicator-banner.png',
  configOptions: [
    {
      key: 'notificationSymbol',
      label: 'Notification Symbol',
      type: 'select',
      value: '!',
      options: ['!', '🔔', '❕'],
    },
  ],
  functionString: `(config) => {
    const notifIndicator = qs(".notifications > button > span:not(.sr-only)");
    
    if (!notifIndicator) {
      log("Notification indicator element not found. Mod will not run.");
      return;
    }

    try {
      const hasUnreadNotif = !notifIndicator.classList.contains("hidden");
      log("Has unread notifications:", hasUnreadNotif);

      const symbol = config.notificationSymbol || '!';
      const prefix = \`(\${symbol}) \`;
      
      let currentTitle = document.title;
      const alreadyHasPrefix = currentTitle.startsWith(\`(\${symbol}) \`) || currentTitle.startsWith('(🔔) ') || currentTitle.startsWith('(❕) ') || currentTitle.startsWith('(!) ');
      
      // Clean up any existing indicators before adding a new one
      if (currentTitle.startsWith('(🔔) ') || currentTitle.startsWith('(❕) ') || currentTitle.startsWith('(!) ')) {
         currentTitle = currentTitle.substring(4);
      }

      if (hasUnreadNotif) {
        if (!alreadyHasPrefix) {
          document.title = prefix + currentTitle;
          log("Set document title to:", document.title);
        }
      } else {
        // If there are no unread notifications, ensure the title does NOT have the prefix
        if (alreadyHasPrefix) {
           document.title = currentTitle;
           log("Removed notification indicator from title.");
        }
      }
    } catch (err) {
      log("Error processing notification indicator:", err.message);
    }
  }`,
};
