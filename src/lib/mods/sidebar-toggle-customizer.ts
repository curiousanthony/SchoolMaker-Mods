import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'sidebar-toggle-customizer',
  name: 'Sidebar Toggle Customizer',
  description: 'Replaces the default sidebar toggle icons with Google Material Icons and allows color customization.',
  category: 'Appearance',
  tags: ['ui', 'customization', 'sidebar', 'icons'],
  enabled: false,
  published: true,
  modType: 'javascript',
  mediaBeforeUrl: '/images/mods/sidebar-toggle-customizer-before.webm',
  mediaUrl: '/images/mods/sidebar-toggle-customizer-after.webm',
  previewEnabled: true,
  bannerUrl: '/images/mods/sidebar-toggle-customizer-banner.png',
  requiresGoogleIcons: true,
  configOptions: [
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      value: '#F9FAFB',
      placeholder: '#F9FAFB',
    },
    {
      key: 'iconColor',
      label: 'Icon Color',
      type: 'color',
      value: '#1F1F1F',
      placeholder: '#1F1F1F',
    }
  ],
  functionString: `(config) => {
    const applyStyles = (element, iconName) => {
        if (!element) return;

        // Create the icon span
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-symbols-outlined';
        iconSpan.textContent = iconName;

        // Apply styles from config
        if (config.backgroundColor) {
            element.style.backgroundColor = config.backgroundColor;
        }
            element.style.border = '1px solid hsla(0 0% 0% / .1)'
        if (config.iconColor) {
            iconSpan.style.color = config.iconColor;
        }

        // Remove existing SVG
        const existingSvg = element.querySelector('svg');
        if (existingSvg) {
            existingSvg.remove();
        }

        // Remove any old icon before adding the new one
        const existingIcon = element.querySelector('.material-symbols-outlined');
        if(existingIcon) {
            existingIcon.remove();
        }

        element.appendChild(iconSpan);
    };

    // --- Close Button ---
    const closeButton = qs('#lesson-close-sidebar');
    if (closeButton) {
        applyStyles(closeButton, 'left_panel_close');
        log("Sidebar close button customized.");
    } else {
        log("Sidebar close button not found.");
    }

    // --- Open Button ---
    const openButton = qs('#lesson-open-sidebar');
    if (openButton) {
        applyStyles(openButton, 'left_panel_open');
        log("Sidebar open button customized.");
    } else {
        log("Sidebar open button not found.");
    }
}`
};
