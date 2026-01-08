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
  mediaUrl: 'https://placehold.co/1280x720.png', // Placeholder
  previewEnabled: false,
  functionString: `(config) => {
    // This mod should only run once to avoid re-wrapping elements.
    if (window.collapsibleChaptersModRun) {
        return;
    }

    /**
     * Section groups (aka Chapters) become collapsible elements
     * by converting them to details/summary
     */
    function turnChaptersIntoCollapsible() {
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');

      // CHECK: If frame doesn't have any descendant with class "section-separator", abort
      if (frame && !qs(".section-separator", frame)) {
        log("turnChaptersIntoCollapsible: section-separator not found, aborting transformation");
        return;
      }

      const chapters = qsa('div[data-controller="product-view"] div#product-section-view-frame > div');
      log("turnChaptersIntoCollapsible function execution, chapters found: ", chapters.length);

      // Add CSS for animations and styling
      const collapseStyle = document.createElement("style");
      collapseStyle.id = "collapsible-chapters-style";
      collapseStyle.textContent = \`
        details.collapsible-chapter summary {
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          border-bottom: 1px solid hsla(0 0% 0% / 0.1);
        }
        
        details.collapsible-chapter summary::-webkit-details-marker {
          display: none;
        }

        details.collapsible-chapter summary::after {
          font-family: "Font Awesome 5 Free";
          font-weight: 900;
          content: '\\\\f078'; /* fa-chevron-down */
          color: black;
          transition: transform 0.2s ease-in-out;
          flex-shrink: 0;
          margin-left: 8px;
        }

        details.collapsible-chapter[open] > summary::after {
          transform: rotate(-180deg);
        }

        details.collapsible-chapter .details-content {
          overflow: hidden;
          transition: height 0.3s ease;
          padding: 1rem;
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
        // Prevent re-processing the same element
        if (chapter.tagName === 'DETAILS') return;

        const details = document.createElement("details");
        details.className = "collapsible-chapter";

        // Set open attribute for default open state
        details.setAttribute("open", "");

        // Copy all attributes from chapter to details
        Array.from(chapter.attributes).forEach((attr) => {
            details.setAttribute(attr.name, attr.value);
        });

        // DETAILS TAILWIND CLASSES (from chapter-style-customizer)
        details.style.backgroundColor = '#F9FAFB';
        details.style.color = '#000000';
        details.style.justifyContent = 'space-between';
        details.style.paddingBlock = '1rem';

        details.addEventListener('mouseover', () => { details.style.backgroundColor = '#FAFAFA' });
        details.addEventListener('mouseout', () => { details.style.backgroundColor = '#F9FAFB' });

        // Get first child to use as summary
        const firstChild = qs("div.section-separator", chapter);

        if (firstChild) {
          const summary = document.createElement("summary");

          // Copy all attributes from first child to summary
          Array.from(firstChild.attributes).forEach((attr) => {
            summary.setAttribute(attr.name, attr.value);
          });
          
          summary.style.margin = '0';
          summary.style.padding = '0 1.5rem';

          // Move first child's content to summary
          while (firstChild.firstChild) {
            summary.appendChild(firstChild.firstChild);
          }

          details.appendChild(summary);

          // Create wrapper for remaining content
          const contentWrapper = document.createElement("div");
          contentWrapper.className = "details-content";

          // Move remaining children
          while (chapter.children.length > 1) {
            contentWrapper.appendChild(chapter.children[1]);
          }

          details.appendChild(contentWrapper);
        } else {
            // This case should ideally not happen if the mod is applied correctly
            const summary = document.createElement("summary");
            summary.textContent = "Details";
            details.appendChild(summary);

            while (chapter.firstChild) {
                details.appendChild(chapter.firstChild);
            }
        }
        chapter.replaceWith(details);
      });
      window.collapsibleChaptersModRun = true;
    }
    
    // --- Observer and Initialization Logic ---

    let observer;

    const collapseSetupObserver = () => {
        const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
        if (!frame || !frame.isConnected) {
            log("CollapsibleChapters: Frame not connected, retrying in 500ms...");
            setTimeout(collapseSetupObserver, 500); // Retry
            return;
        }

        observer = new MutationObserver(() => {
            const currentFrame = qs('div[data-controller="product-view"] div#product-section-view-frame');
            if (!currentFrame?.isConnected) {
                log("CollapsibleChapters: Frame disconnected. Re-initializing observer...");
                if(observer) observer.disconnect();
                collapseSetupObserver(); // Re-launch
                return;
            }

            if (currentFrame.children.length > 0 && qs('.section-separator', currentFrame)) {
                log("CollapsibleChapters: Frame ready, running transformation.");
                if(observer) observer.disconnect();
                turnChaptersIntoCollapsible();
            }
        });

        observer.observe(frame, { childList: true, subtree: true });
        log("CollapsibleChapters: Observer started on connected frame.");
    };

    const collapseInit = () => {
        log("CollapsibleChapters: Initializing...");
        
        // Disconnect any previous observer to prevent duplicates
        if (observer) observer.disconnect();

        const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
        if (frame?.children.length > 0 && qs('.section-separator', frame)) {
            log("CollapsibleChapters: Frame already ready. Executing immediately.");
            turnChaptersIntoCollapsible();
        } else {
            log("CollapsibleChapters: Frame empty or not found. Setting up observer.");
            collapseSetupObserver();
        }
    };
    
    collapseInit();
}`
};
