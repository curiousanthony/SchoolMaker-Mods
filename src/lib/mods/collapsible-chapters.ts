
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
          /*cursor: pointer;*/
          list-style: none;

          border-bottom: 1px solid #e5e7eb;
        }
        details.collapsible-chapter > summary::-webkit-details-marker {
          display: none;
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
        /*details.collapsible-chapter .details-content {
          padding: 1rem;
        }*/
        .collapsible-chapter-chevron {
          transition: transform 0.2s ease-in-out;
          flex-shrink: 0;
          margin-left: 8px;
        }
        details[open] > summary .collapsible-chapter-chevron {
          transform-origin: center;
          transform: rotate(-180deg);
        }

        [data-target^="product-view.galleryContainer"],
        [data-target^="product-view.listContainer"] {
          gap: 1.25rem !important; /* gap-5 */
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
        
        details.classList.add("!rounded-lg", "md:!rounded-xl", "overflow-hidden", "mb-4", "bg-neutral-50", "border", "border-gray-300", "shadow-sm");
        details.classList.remove("gap-5");

        const firstChild = qs("div.section-separator", chapter);
        if (firstChild) {
          const summary = document.createElement("summary");

          Array.from(firstChild.attributes).forEach((attr) => {
            summary.setAttribute(attr.name, attr.value);
          });
          
          summary.classList.add("flex", "items-center", "justify-between", "overflow-hidden", "py-5", "bg-white", "hover:bg-neutral-50", "!my-0", "px-6", "cursor-pointer");

          const chevronDownIcon = document.createElement("i");
          chevronDownIcon.classList.add("fas", "fa-chevron-down", "text-gray-500", "collapsible-chapter-chevron");
          
          while (firstChild.firstChild) {
            summary.appendChild(firstChild.firstChild);
          }
          summary.appendChild(chevronDownIcon);
          
          details.appendChild(summary);

          const contentWrapper = document.createElement("div");
          contentWrapper.classList.add("details-content", "p-5");
          
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
        log("CollapsibleChapters: Frame not connected. Retrying in 500ms...");
        setTimeout(collapseSetupObserver, 500);
        return;
      }

      const collapseObserver = new MutationObserver(() => {
        const currentFrame = qs('div[data-controller="product-view"] div#product-section-view-frame');
        if (!currentFrame?.isConnected) {
          log("CollapsibleChapters: Frame disconnected. Resetting observer...");
          collapseObserver.disconnect();
          collapseSetupObserver();
          return;
        }

        if (currentFrame.children.length) {
          log("CollapsibleChapters: Frame ready! Running transformation.");
          collapseObserver.disconnect();
          turnChaptersIntoCollapsible();
        }
      });

      collapseObserver.observe(frame, { childList: true, subtree: true });
      log("CollapsibleChapters: Observer started on connected frame.");
    };

    const collapseInit = () => {
      log("CollapsibleChapters: Initializing...");
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
      if (frame?.children.length) {
        log("CollapsibleChapters: Frame already ready. Running immediately.");
        turnChaptersIntoCollapsible();
      } else {
        log("CollapsibleChapters: Frame empty or missing. Setting up observer...");
        collapseSetupObserver();
      }
    };

    document.addEventListener("turbo:load", collapseInit);
    document.addEventListener("turbo:frame-load", (e) => {
      if (
        e.target.id === "product-section-view-frame" &&
        e.target.closest('div[data-controller="product-view"]')
      ) {
        log("CollapsibleChapters: Frame loaded via Turbo. Checking children...");
        if (e.target.children.length) turnChaptersIntoCollapsible();
      }
    });

    const fallbackCheck = setInterval(() => {
      const frame = qs('div[data-controller="product-view"] div#product-section-view-frame');
      if (frame?.children.length) {
        log("CollapsibleChapters: Frame detected via fallback. Running...");
        clearInterval(fallbackCheck);
        turnChaptersIntoCollapsible();
      }
    }, 1000);

    collapseInit();
    log("CollapsibleChapters: Script ready. Actively monitoring program chapters.");
  }`
};
