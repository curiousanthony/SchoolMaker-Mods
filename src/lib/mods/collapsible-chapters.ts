
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
  mediaUrl: '/images/mods/collapsible-chapters-after.webm',
  previewEnabled: true,
  functionString: `(config) => {
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
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          border-bottom: 1px solid #e5e7eb;
        }
        details.collapsible-chapter > summary::-webkit-details-marker {
          display: none;
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
        details.collapsible-chapter .details-content {
          padding: 1rem;
        }
      \`;

      if (!document.getElementById(collapseStyle.id)) {
        document.head.appendChild(collapseStyle);
      }

      chapters.forEach((chapter) => {
        if (chapter.tagName === 'DETAILS' || chapter.dataset.transformed === 'true') return;
        
        const details = document.createElement("details");
        details.setAttribute("open", "");
        
        Array.from(chapter.attributes).forEach((attr) => {
            details.setAttribute(attr.name, attr.value);
        });
        chapter.dataset.transformed = 'true';
        
        details.classList.add("collapsible-chapter", "!rounded-lg", "md:!rounded-lg", "overflow-hidden", "mb-4", "bg-neutral-50", "border", "border-gray-300", "shadow-sm");
        details.classList.remove("gap-5");

        const firstChild = qs("div.section-separator", chapter);
        if (firstChild) {
          const summary = document.createElement("summary");

          Array.from(firstChild.attributes).forEach((attr) => {
            summary.setAttribute(attr.name, attr.value);
          });
          
          summary.classList.add("flex", "items-center", "cursor-pointer", "justify-between", "overflow-hidden", "py-4", "bg-white", "hover:bg-neutral-50", "!my-0", "pr-6");

          while (firstChild.firstChild) {
            summary.appendChild(firstChild.firstChild);
          }
          details.appendChild(summary);

          const contentWrapper = document.createElement("div");
          contentWrapper.className = "details-content";
          
          while (chapter.children.length > 1) {
            contentWrapper.appendChild(chapter.children[1]);
          }
          details.appendChild(contentWrapper);

        } else {
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

    const collapseSetupObserver = () => {
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
      if (!frame || !frame.isConnected) {
        log("[DEBUG] Frame not connected. Retrying in 500ms...");
        setTimeout(collapseSetupObserver, 500);
        return;
      }

      const collapseObserver = new MutationObserver(() => {
        const currentFrame = qs('div[data-controller="product-view"] div#product-section-view-frame');
        if (!currentFrame?.isConnected) {
          log("[DEBUG] Frame disconnected. Resetting observer...");
          collapseObserver.disconnect();
          collapseSetupObserver();
          return;
        }

        if (currentFrame.children.length) {
          log("[DEBUG] Frame ready! Running transformation.");
          collapseObserver.disconnect();
          turnChaptersIntoCollapsible();
        }
      });

      collapseObserver.observe(frame, { childList: true, subtree: true });
      log("[DEBUG] Observer started on connected frame.");
    };

    const collapseInit = () => {
      log("[DEBUG] Initializing...");
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
      if (frame?.children.length) {
        log("[DEBUG] Frame already ready. Running immediately.");
        turnChaptersIntoCollapsible();
      } else {
        log("[DEBUG] Frame empty or missing. Setting up observer...");
        collapseSetupObserver();
      }
    };

    document.addEventListener("turbo:load", collapseInit);
    document.addEventListener("turbo:frame-load", (e) => {
      if (
        e.target.id === "product-section-view-frame" &&
        e.target.closest('div[data-controller="product-view"]')
      ) {
        log("[DEBUG] Frame loaded via Turbo. Checking children...");
        if (e.target.children.length) turnChaptersIntoCollapsible();
      }
    });

    const fallbackCheck = setInterval(() => {
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
      if (frame?.children.length) {
        log("[DEBUG] Frame detected via fallback. Running...");
        clearInterval(fallbackCheck);
        turnChaptersIntoCollapsible();
      }
    }, 1000);

    collapseInit();
    log("[DEBUG] Script ready. Actively monitoring program chapters.");
  }`
};

    