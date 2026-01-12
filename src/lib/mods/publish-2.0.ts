
import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'publish-2.0',
  name: 'Publish 2.0',
  description: "Revamps the UI for publishing a community post. It hides the full editor until the user clicks the title field, which features an engaging, dynamic placeholder to encourage posting.",
  category: 'Appearance',
  tags: ['community', 'ux', 'ui', 'form'],
  enabled: false,
  published: true,
  modType: 'javascript',
  previewEnabled: true,
  bannerUrl: '/images/mods/publish-2.0-banner.png',
  mediaBeforeUrl: '/images/mods/publish-2.0-before.png',
  mediaUrl: '/images/mods/publish-2.0-after.webm',
  configOptions: [
    {
      key: 'titlePlaceholder',
      label: 'Title Placeholder Greeting (before time of day and first name)',
      type: 'text',
      value: '👋 Que veux-tu partager',
      placeholder: '👋 Que veux-tu partager',
      required: true,
    },
    {
      key: 'contentPlaceholder',
      label: 'Content Placeholder',
      type: 'text',
      value: 'Développe ce que tu veux partager..',
      placeholder: 'Développe ce que tu veux partager...',
      required: true,
    },
  ],
  functionString: `async (config) => {
    // --- START: Style Injection ---
    const styles = \`
      #new_topic_form > div[data-controller="form-poll"] {
        display: flex;
        flex-direction: column;
        gap: .9rem;
        border-radius: .4rem;
      }

      #new_topic_form > div[data-controller="form-poll"] > input#forums_topic_title {
        outline: 1px solid hsla(0 0% 0% / .2) !important;
        padding-block: .7rem !important;
        padding-inline: .8rem !important;
        border-radius: .5rem !important;
        margin-top: 0 !important;
      }

      #new_topic_form > div[data-controller="form-poll"] > input#forums_topic_title:focus {
        outline: 2px solid var(--color-primary-500) !important;
      }

      #new_topic_form > div[data-controller="form-poll"] > input#forums_topic_title::placeholder {
        color: rgba(0, 0, 0, 0.521) !important;
      }

      #new_topic_form > div[data-controller="form-poll"] > div:first-child {
        margin-top: .5rem;
      }

      #new_topic_form > div[data-controller="form-poll"] > #poll-form {
        display: none;
        position: relative;
        outline: 1px solid hsla(0 0% 0% / .2) !important;
        border-radius: .4rem;
      }
      
      #new_topic_form > div[data-controller="form-poll"] [data-target="form-poll.link"] {
        justify-content: end;
      }

      #new_topic_form > div[data-controller="form-poll"] button[type="submit"] {
        padding-block: .4rem !important;
        padding-inline: .9rem !important;
        margin-bottom: 1rem !important;
        margin-right: 1rem !important;
        border-radius: .4rem !important;
        flex: unset !important;
      }
      
      #new_topic_form > div[data-controller="form-poll"] button[type="submit"] > span {
        font-size: .9rem !important;
      }

      #new_topic_form .new_topic_post_body_container {
        margin-top: 0 !important;
      }

      #new_topic_form .new_topic_post_body_container trix-editor {
        padding-block: .7rem !important;
        font-size: 1rem !important;
        padding-inline: 1rem !important;
      }

      #new_topic_form trix-toolbar {
        margin-left: .05rem !important;
        order: calc(infinity);
        padding-block: .6rem !important;
        padding-inline: .3rem !important;
        background-color: hsl(0, 0%, 97%);
        position: sticky;
        top: 0;
      }
      
      #new_topic_form trix-toolbar .trix-button-group {
        gap: .2rem !important;
      }

      #new_topic_form trix-toolbar .trix-button--icon {
        font-size: 1.1em !important;
      }

      #new_topic_form trix-toolbar .trix-button--icon.trix-active {
        background-color: var(--color-primary-100) !important;
      }
    \`;

    const styleSheet = document.createElement("style");
    styleSheet.id = 'publish-2.0-styles';
    styleSheet.innerText = styles;
    if (!document.getElementById(styleSheet.id)) {
      document.head.appendChild(styleSheet);
    }
    // --- END: Style Injection ---

    const formEl = qs('#new_topic_form > div[data-controller="form-poll"]');
    if (!formEl || formEl.dataset.publish20_initialized) return;
    formEl.dataset.publish20_initialized = 'true';

    // --- START: Helper Functions ---
    async function getUserFirstName() {
      if (!window.ModData) { window.ModData = {}; }
      if (window.ModData?.firstName) return window.ModData.firstName;
      
      const profilePictureEl = qs('[data-popover-url$="/popover?type=Member"]');
      if (!profilePictureEl) return "";

      const profileUrl = profilePictureEl.getAttribute("data-popover-url");
      try {
        const response = await fetch(profileUrl);
        if (!response.ok) {
          throw new Error(\`Response status: \${response.status}\`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const nameEl = doc.querySelector("div.text-center > p:first-child");
        if (!nameEl) {
           log("Publish 2.0 Mod Error: Name element not found after fetching user profile!");
           return "";
        }
        
        const firstName = nameEl.textContent.trim().split(" ")[0];
        window.ModData.firstName = firstName;
        return firstName;
      } catch (error) {
        log('Publish 2.0 Mod Error:', error.message);
        return "";
      }
    }

    function getMomentOfDayString() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return "ce matin";
      if (hour >= 11 && hour < 17) return "cet après-midi";
      if (hour >= 17 && hour < 22) return "ce soir";
      return "aujourd'hui";
    }
    // --- END: Helper Functions ---
    
    const titleInputEl = qs("input#forums_topic_title", formEl);
    if (!titleInputEl) return;
    
    const contentAreaEl = qs("#poll-form", formEl);
    //const spacePickerRowEl = qs("div:first-child", formEl);
    if (!contentAreaEl) {
      log('Publish 2.0 Mod Warning: Required DOM elements for form not found');
      return;
    }
    
    // Hide elements initially
    contentAreaEl.style.display = "none";
    //spacePickerRowEl.style.display = "none";

    const userFirstName = await getUserFirstName();
    const momentOfDayString = getMomentOfDayString();
    
    const titleGreeting = config.titlePlaceholder || '👋 What do you want to share';
    const finalTitlePlaceholder = \`\${titleGreeting} \${momentOfDayString}\${userFirstName ? ", " + userFirstName : ""} ?\`;
    titleInputEl.setAttribute("placeholder", finalTitlePlaceholder);

    let restOfFormVisible = false;

    titleInputEl.addEventListener("click", () => {
    // Do nothing if uncollapsed at least once
      if (restOfFormVisible) return;

      // Disable publish button if the 2 fields are empty initially
      const submitBtn = formEl.querySelector("button[type='submit']");
      if (!submitBtn) return;
      const contentEditorEl = formEl.querySelector("trix-editor")

      if(!contentEditorEl) log('Publish 2.0 Mod Error: Content editor element not found!')

      // Initial state: disable the button
      submitBtn.disabled = true

      contentAreaEl.style.display = "block";
      //spacePickerRowEl.style.display = 'flex';

      const contentInputEl = qs("trix-editor", contentAreaEl);
      if(contentInputEl) {
        const contentPlaceholder = config.contentPlaceholder || 'Develop what you want to share...';
        contentInputEl.setAttribute("placeholder", contentPlaceholder);
      }
      
      restOfFormVisible = true;
    });
  }`
};
