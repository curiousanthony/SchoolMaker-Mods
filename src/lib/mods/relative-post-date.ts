import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'relative-post-date',
  name: 'Relative Post Date',
  description: "Replaces the absolute post date in the community with a relative time (e.g., 'last week') in the user's language.",
  category: 'Functionality',
  tags: ['community', 'ux', 'date', 'time'],
  enabled: false,
  published: true,
  modType: 'javascript',
  mediaBeforeUrl: '/images/mods/relative-post-date-before.png',
  mediaUrl: '/images/mods/relative-post-date-after.png',
  bannerUrl: '/images/mods/relative-post-date-after.png',
  previewEnabled: true,
  functionString: `(config) => {
     const datePattern = /\\d{1,2}\\s\\w+\\s\\d{4}/;

    function extractDateFromH6(fullString) {
      const match = fullString.match(datePattern);
      if (match) {
        return match[0];
      }
      return null;
    }

    function parseFrenchDate(dateString) {
      const months = {
        janvier: 0, 'février': 1, mars: 2, avril: 3, mai: 4, juin: 5,
        juillet: 6, 'août': 7, septembre: 8, octobre: 9, novembre: 10, 'décembre': 11
      };
      const parts = dateString.split(' ');
      if (parts.length !== 3) {
        log("Invalid date format - expected 3 parts, got:", parts.length, "in", dateString);
        return null;
      }

      const day = parseInt(parts[0], 10);
      const monthName = parts[1].toLowerCase();
      const year = parseInt(parts[2], 10);

      const month = months[monthName];

      if (isNaN(day) || month === undefined || isNaN(year)) {
        log("Invalid date values:", {day, month, year});
        return null;
      }
      
      const date = new Date(year, month, day);
      return date;
    }

    function getRelativeTimeString(date) {
      if (!date || isNaN(date.getTime())) {
        return null;
      }

      const now = new Date();
      // Difference in seconds
      const diffInSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

      const lang = document.documentElement.lang || 'fr';
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

      const MINUTE = 60;
      const HOUR = MINUTE * 60;
      const DAY = HOUR * 24;
      const WEEK = DAY * 7;
      const MONTH = DAY * 30.44; 
      const YEAR = DAY * 365.25;

      if (diffInSeconds < MINUTE) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < HOUR) {
        return rtf.format(-Math.floor(diffInSeconds / MINUTE), 'minute');
      } else if (diffInSeconds < DAY) {
        return rtf.format(-Math.floor(diffInSeconds / HOUR), 'hour');
      } else if (diffInSeconds < WEEK * 4) { // Show days for up to ~4 weeks
        return rtf.format(-Math.floor(diffInSeconds / DAY), 'day');
      } else if (diffInSeconds < YEAR) {
        return rtf.format(-Math.floor(diffInSeconds / MONTH), 'month');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / YEAR), 'year');
      }
    }

    const postDateEls = qsa('div[id^="forums_topic_"] h6');
    if (!postDateEls || postDateEls.length === 0) {
      return;
    }

    postDateEls.forEach(postDateEl => {
      if (postDateEl.dataset.dateModified) {
        return;
      }

      const fullString = postDateEl.innerText;
      const dateString = extractDateFromH6(fullString);
      if (!dateString) {
        return;
      }

      const parsedDate = parseFrenchDate(dateString);
      if (!parsedDate) {
        return;
      }

      const relativeTimeString = getRelativeTimeString(parsedDate);
      if (!relativeTimeString) {
        return;
      }

      for (let i = 0; i < postDateEl.childNodes.length; i++) {
        const node = postDateEl.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.includes(dateString)) {
            node.textContent = node.textContent.replace(dateString, relativeTimeString);
            postDateEl.dataset.dateModified = 'true';
            break; 
          }
        }
      }
    });
  }`,
};
