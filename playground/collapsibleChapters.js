  /**
 * Section groups (aka Chapters) become collapsible elements
 * by converting them to details/summary
 */
function turnChaptersIntoCollapsible() {
  const chapters = document.querySelectorAll('div[data-controller="product-view"] div#product-section-view-frame > div')
  console.log("turnChaptersIntoCollapsible function execution")
  //console.log("chapters: ", chapters)

  // Add CSS for animations
  const collapseStyle = document.createElement('style');
  collapseStyle.textContent = `
  details summary {
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    border-bottom: 1px solid #e5e7eb;
  }
  
  details summary::-webkit-details-marker {
    display: none;
  }
  
  /*details summary::after {
    content: '▼';
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: 8px;
  }*/

  /*details summary::after {
    font-family: "Font Awesome 5 Pro";
    font-weight: 900;
    content: '\f078';  /* fa-chevron-down */
    color: black;
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: 8px;
  }*/
  
  details[open] summary::after {
    transform: rotate(180deg);
  }
  
  details .details-content {
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
    padding: none;
    box-shadow: none;
    font-size: 1.1rem;
  }

  /*[data-target^="product-view.galleryContainer"] {
    margin-top: 1rem;
  }

  [data-target^="product-view.listContainer"] {
    margin-top: 1rem;
  }*/

  details[open] summary .fa-chevron-down {
    transform-origin: center;
    transform: rotate(180deg);
  }
`;
  document.head.appendChild(collapseStyle);

  chapters.forEach(chapter => {
    const details = document.createElement('details');
    
    // Set open attribute for default open state
    details.setAttribute('open', '');
    
    // Copy all attributes from chapter to details
    Array.from(chapter.attributes).forEach(attr => {
      details.setAttribute(attr.name, attr.value);
    });
    
    // DETAILS TAILWIND CLASSES
    details.classList.add(
      "!rounded-lg", 
      "md:!rounded-lg", 
      "overflow-hidden",
      "mb-4",
      "bg-neutral-50",
      "border",
      "border-gray-300",
      "shadow-sm"
      )
    details.classList.remove("gap-5")

    // Get first child to use as summary
    const firstChild = chapter.querySelector('div.section-separator');
    
    if (firstChild) {
      const summary = document.createElement('summary');
      
      // Copy all attributes from first child to summary
      Array.from(firstChild.attributes).forEach(attr => {
        summary.setAttribute(attr.name, attr.value);
      });

      // SUMMARY (chapter title) TAILWIND CLASSES
      summary.classList.add(
        "flex", 
        "items-center", 
        "cursor-pointer", 
        "justify-between", 
        "overflow-hidden", 
        "py-4", 
        "bg-white",
        "hover:bg-neutral-50", 
        "!my-0",
        "pr-6"
        )
      
      const chevronDownIcon = document.createElement("i")
      chevronDownIcon.classList.add(
        "fas", 
        "fa-chevron-down",
        "text-gray-500"
      )
      
    
    // Move first child's content to summary
    while (firstChild.firstChild) {
      summary.appendChild(firstChild.firstChild);
      summary.appendChild(chevronDownIcon)
    }
    
    details.appendChild(summary);
      
      
      // Create wrapper for remaining content
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'details-content';
      
      // Move remaining children
      while (chapter.children.length > 1) {
        contentWrapper.appendChild(chapter.children[1]);
      }
      
      details.appendChild(contentWrapper);
      
      // Set initial height
      //contentWrapper.style.height = contentWrapper.scrollHeight + 'px';
      
      // Handle toggle animation
      /*details.addEventListener('toggle', () => {
        if (details.open) {
          contentWrapper.style.height = '0px';
          requestAnimationFrame(() => {
            contentWrapper.style.height = contentWrapper.scrollHeight + 'px';
          });
        } else {
          contentWrapper.style.height = contentWrapper.scrollHeight + 'px';
          requestAnimationFrame(() => {
            contentWrapper.style.height = '0px';
          });
        }
      });*/
    } else {
      // No children, create empty summary
      const summary = document.createElement('summary');
      summary.textContent = 'Details';
      details.appendChild(summary);
      
      while (chapter.firstChild) {
        details.appendChild(chapter.firstChild);
      }
    }
    
    chapter.replaceWith(details);
  });
}

//const debugCollapse = true;
//const log = (...args) => debugCollapse && console.log(...args);

const collapseSetupObserver = () => {
  const frame = document.querySelector('div[data-controller="product-view"] div#product-section-view-frame');
  if (!frame || !frame.isConnected) {
    log("[DEBUG] Frame non connecté ou introuvable. Réessai dans 500ms...");
    setTimeout(collapseSetupObserver, 500); // Réessaye plus tard
    return;
  }

  const collapseObserver = new MutationObserver(() => {
    const currentFrame = document.querySelector('div[data-controller="product-view"] div#product-section-view-frame');
    if (!currentFrame?.isConnected) {
      log("[DEBUG] Frame déconnecté. Réinitialisation de l'observer...");
      collapseObserver.disconnect();
      collapseSetupObserver(); // Relance l'observer
      return;
    }

    if (currentFrame.children.length) {
      log("[DEBUG] Frame prêt ! Exécution de la fonction.");
      collapseObserver.disconnect();
      turnChaptersIntoCollapsible();
    }
  });

  collapseObserver.observe(frame, { childList: true, subtree: true });
  log("[DEBUG] Observer démarré sur le frame connecté.");
};

// Initialisation
const collapseInit = () => {
  log("[DEBUG] Initialisation...");

  const frame = document.querySelector('div[data-controller="product-view"] div#product-section-view-frame');
  if (frame?.children.length) {
    log("[DEBUG] Frame déjà prêt. Exécution immédiate.");
    turnChaptersIntoCollapsible();
  } else {
    log("[DEBUG] Frame vide ou absent. Configuration de l'observer...");
    collapseSetupObserver();
  }
};

// Écouteurs d'événements
document.addEventListener('turbo:load', collapseInit);
document.addEventListener('turbo:frame-load', (e) => {
  if (e.target.id === 'product-section-view-frame' && e.target.closest('div[data-controller="product-view"]')) {
    log("[DEBUG] Frame chargé via Turbo. Vérification des enfants...");
    if (e.target.children.length) turnChaptersIntoCollapsible();
  }
});

// Fallback si Turbo ne déclenche rien (ex: chargement manuel)
const fallbackCheck = setInterval(() => {
  const frame = document.querySelector('div[data-controller="product-view"] div#product-section-view-frame');
  if (frame?.children.length) {
    log("[DEBUG] Frame détecté via fallback. Exécution...");
    clearInterval(fallbackCheck);
    turnChaptersIntoCollapsible();
  }
}, 1000);

// Démarrage initial
collapseInit();
log("[DEBUG] Script prêt. Surveillance active.");
