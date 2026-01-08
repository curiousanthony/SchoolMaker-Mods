
import type { Mod } from '@/types';

export const mod: Mod = {
  id: 'collapsible-chapters',
  name: 'Collapsible Chapters',
  description: "Transforms program's section groups (chapters) into collapsible elements for a cleaner and more organized user experience.",
  category: 'Functionality',
  tags: ['program', 'chapters', 'ux', 'layout'],
  enabled: false,
  published: true,
  modType: 'javascript',
  requiresFontAwesome: true,
  mediaUrl: '/images/mods/collapsible-chapters-after.webm',
  previewEnabled: true,
  functionString: `(config) => {
    /**
     * Section groups (aka Chapters) become collapsible elements
     * by converting them to details/summary
     */
    function turnChaptersIntoCollapsible() {
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');

      if (frame && !qs(".section-separator", frame)) {
        log("CollapsibleChapters: section-separator not found, aborting transformation.");
        return;
      }

      const chapters = qsa('div[data-controller="product-view"] div#product-section-view-frame > div');
      log("CollapsibleChapters: Found " + chapters.length + " chapter elements.");

      const collapseStyle = document.createElement("style");
      collapseStyle.id = "collapsible-chapters-style";
      collapseStyle.textContent = \`
        details.collapsible-chapter > summary {
          cursor: pointer;
          list-style: none; /* Hide default marker */
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          border-bottom: 1px solid #e5e7eb;
        }
        details.collapsible-chapter > summary::-webkit-details-marker {
          display: none; /* Hide default marker in Safari */
        }
        details.collapsible-chapter > summary::after {
          font-family: "Font Awesome 5 Free";
          font-weight: 900;
          content: '\\\\f078'; /* fa-chevron-down */
          transition: transform 0.2s ease-in-out;
          flex-shrink: 0;
          margin-left: 8px;
        }
        details.collapsible-chapter[open] > summary::after {
          transform: rotate(-180deg);
        }
        .section-separator .section-separator-dashed-border {
          display: none;
        }
        .section-separator .section-separator-title {
          background: none;
          border: none;
          border-radius: none;
          color: inherit;
          font-weight: bold;
          padding: 0;
          box-shadow: none;
          font-size: 1.1rem;
        }
      \`;

      if (!document.getElementById(collapseStyle.id)) {
        document.head.appendChild(collapseStyle);
      }

      chapters.forEach((chapter) => {
        // Prevent re-processing an element that has already been transformed
        if (chapter.tagName === 'DETAILS' || chapter.dataset.transformed === 'true') return;

        const details = document.createElement("details");
        details.className = "collapsible-chapter";
        
        // Copy original attributes from chapter to details
        Array.from(chapter.attributes).forEach((attr) => {
            details.setAttribute(attr.name, attr.value);
        });
        
        details.setAttribute("open", ""); // Default to open
        chapter.dataset.transformed = 'true';
        
        details.classList.add("!rounded-lg", "md:!rounded-lg", "overflow-hidden", "mb-4", "bg-neutral-50", "border", "border-gray-300", "shadow-sm");
        details.classList.remove("gap-5");

        const firstChild = qs("div.section-separator", chapter);
        if (firstChild) {
          const summary = document.createElement("summary");

          // Copy original attributes from firstChild to summary
          Array.from(firstChild.attributes).forEach((attr) => {
            summary.setAttribute(attr.name, attr.value);
          });
          
          summary.classList.add("flex", "items-center", "cursor-pointer", "justify-between", "overflow-hidden", "py-4", "bg-white", "hover:bg-neutral-50", "!my-0", "pr-6");

          // Move first child's content to summary
          while (firstChild.firstChild) {
            summary.appendChild(firstChild.firstChild);
          }
          details.appendChild(summary);

          // Wrap remaining content
          const contentWrapper = document.createElement("div");
          contentWrapper.className = "p-4";
          
          while (chapter.children.length > 1) {
            contentWrapper.appendChild(chapter.children[1]);
          }
          details.appendChild(contentWrapper);

        } else {
          // Fallback if structure is unexpected
          const summary = document.createElement("summary");
          summary.textContent = "Details";
          details.appendChild(summary);
          while (chapter.firstChild) {
            details.appendChild(chapter.firstChild);
          }
        }
        chapter.replaceWith(details);
      });
    }

    // --- Observer and Initialization Logic ---
    let observer;

    function setupObserver() {
        const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
        if (!frame || !frame.isConnected) {
            log("CollapsibleChapters: Frame not connected, retrying...");
            setTimeout(setupObserver, 500);
            return;
        }

        if (observer) observer.disconnect(); // Disconnect previous observer

        observer = new MutationObserver((mutations) => {
            log("CollapsibleChapters: DOM changed, re-running transformation.");
            turnChaptersIntoCollapsible();
        });

        observer.observe(frame, { childList: true, subtree: true });
        log("CollapsibleChapters: Observer started.");
        
        // Initial run
        turnChaptersIntoCollapsible();
    }

    function init() {
      log("CollapsibleChapters: Initializing...");
      setupObserver();
    }
    
    init();
}`
};

    