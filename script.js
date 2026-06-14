// ============================================================
// thesouscote — portfolio scripts
// ============================================================

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

(function () {
  const root = document.documentElement;

  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val.toDate === 'function') return val.toDate();
    if (val && typeof val === 'object' && typeof val.seconds === 'number') return new Date(val.seconds * 1000);
    return new Date(val);
  };

  // Handler d'erreurs global pour le débogage sur mobile
  window.addEventListener('error', (event) => {
    console.error("Global Error Caught:", event.error);
    const errDiv = document.createElement('div');
    errDiv.style.position = 'fixed';
    errDiv.style.bottom = '20px';
    errDiv.style.left = '20px';
    errDiv.style.right = '20px';
    errDiv.style.background = '#e0245e';
    errDiv.style.color = '#fff';
    errDiv.style.padding = '12px 16px';
    errDiv.style.borderRadius = '8px';
    errDiv.style.fontSize = '12px';
    errDiv.style.fontFamily = 'monospace';
    errDiv.style.zIndex = '99999';
    errDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    errDiv.textContent = `Erreur: ${event.message} (${event.filename}:${event.lineno})`;
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.float = 'right';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.marginLeft = '10px';
    closeBtn.onclick = () => errDiv.remove();
    errDiv.appendChild(closeBtn);
    
    document.body.appendChild(errDiv);
    setTimeout(() => { if(errDiv.parentNode) errDiv.remove(); }, 10000);
  });

  // ---------- Custom Cursor ----------
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let mouseX = cursorX;
    let mouseY = cursorY;
    
    // Smooth follow
    function renderCursor() {
      // Linear interpolation for smoothness
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Hover effects on interactive elements
    const updateInteractiveElements = () => {
      const interactives = document.querySelectorAll('a, button, input, textarea, select, .lightbox img, .market-detail-image');
      interactives.forEach(el => {
        if (!el.hasAttribute('data-cursor-attached')) {
          el.setAttribute('data-cursor-attached', 'true');
          el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        }
      });
    };
    
    // Initial attach and observe DOM changes
    updateInteractiveElements();
    const observer = new MutationObserver(() => updateInteractiveElements());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Variables globales de rendu pour les mises à jour dynamiques
  let renderProjects = null;
  let renderResources = null;
  let allResources = [];

  // ============================================================
  // i18n FR / EN
  // ============================================================
  const I18N = {
    fr: {
      'nav.home': 'Accueil',
      'nav.about': 'À propos',
      'nav.experience': 'Expérience',
      'nav.projects': 'Projets',
      'nav.contact': 'Contact',
      'nav.draft': 'Draft',
      'nav.resources': 'Market',
      'resources.title': 'Market',
      'resources.intro': 'Logos gratuits, créations sur commande, cartes et stickers. Tout ce que je fabrique à côté.',
      'resources.all': 'Tout',
      'resources.logo': 'Logos',
      'resources.carte': 'Cartes graphiques',
      'resources.sticker': 'Stickers',
      'resources.free': 'Gratuit',
      'resources.buy': 'Commander →',
      'resources.download': 'Télécharger →',
      'resources.empty': 'Aucun élément pour cette catégorie.',
      'hero.eyebrow': "Bonjour, c'est",
      'hero.subtitle': 'Designer & développeur. Je crée des expériences simples, élégantes et utiles.',
      'hero.cta1': 'Voir mes projets',
      'hero.cta2': 'Me contacter →',
      'about.title': 'À propos',
      'about.text': "Je m'appelle <strong>Moke Patrick Armel</strong>. Passionné par le design minimaliste, j'aime concevoir des produits clairs, accessibles et soignés dans le moindre détail. Mon approche : moins, mais mieux.",
      'about.skill1': 'Design UI/UX',
      'about.skill2': 'HTML · CSS · JavaScript',
      'about.skill3': 'Typographie',
      'about.skill4': 'Prototypage',
      'about.cv': 'Télécharger mon CV ↓',
      'about.playlist': 'Ce que j\'écoute',
      'experience.title': 'Expérience',
      'experience.date1': '2024 — Présent',
      'experience.role1': 'Designer & développeur indépendant',
      'experience.desc1': 'Conception et développement de sites et identités visuelles.',
      'experience.date2': '2022 — 2024',
      'experience.role2': 'Projet personnel — thesouscote',
      'experience.desc2': 'Création de contenu, streaming et exploration créative.',
      'experience.date3': 'Avant 2022',
      'experience.role3': 'Apprentissage',
      'experience.desc3': 'Découverte du design, du code et de la typographie.',
      'projects.title': 'Projects',
      'projects.desc': 'Une courte description du projet, son objectif et le résultat obtenu.',
      'projects.link': 'En savoir plus →',
      'contact.title': 'Travaillons ensemble',
      'contact.text': "Un projet, une idée, ou simplement envie d'échanger ?",
      'contact.name': 'Nom',
      'contact.subject': 'Sujet',
      'contact.message': 'Message',
      'contact.send': 'Envoyer →',
      'contact.sending': 'Envoi en cours…',
      'contact.success': 'Message envoyé ! Je reviens vers vous rapidement.',
      'contact.error': 'Une erreur est survenue. Veuillez réessayer.',
      'contact.or': '— ou sur WhatsApp direct —',
      'draft.title': 'Draft',
      'draft.text': 'Old projects, drafts and abandoned ideas. Nothing is lost, everything recycles.',
      'draft.item1': 'abandoned out of laziness',
      'draft.item2': 'never shipped',
      'draft.item3': "to revisit some day, maybe",
      '404.title': 'Page introuvable',
      '404.text': "Elle est peut-être dans la Draft ?",
      '404.cta': "Retour à l'accueil",
      'cmdk.placeholder': 'Aller à…',
      'cmdk.hint': '↵ pour valider · esc pour fermer · ⌘K pour ouvrir',
    }
  };

  const getLang = () => 'fr';
  const applyI18n = (lang) => {
    const dict = I18N.fr;
    document.documentElement.lang = 'fr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
      if (dict[key]) el.setAttribute(attr, dict[key]);
    });
  };

  applyI18n('fr');

  // ============================================================
  // Lightbox avec zoom
  // ============================================================
  function openLightbox(src, alt) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lb-controls">
        <button type="button" class="lb-zoom-out" title="Dézoomer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <span class="lb-zoom-level">100%</span>
        <button type="button" class="lb-zoom-in" title="Zoomer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.2); margin: 0 4px;"></div>
        <button type="button" class="lb-close" title="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="lb-img-container">
        <img src="${src}" alt="${alt}" style="max-width: 90vw; max-height: 90vh; object-fit: contain; transform: translate(0px, 0px) scale(1); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); cursor: zoom-in; user-select: none; -webkit-user-drag: none;" />
      </div>
    `;
    document.body.classList.add('no-scroll');
    document.body.appendChild(lb);
    
    const img = lb.querySelector('img');
    const zoomInBtn = lb.querySelector('.lb-zoom-in');
    const zoomOutBtn = lb.querySelector('.lb-zoom-out');
    const zoomLevelText = lb.querySelector('.lb-zoom-level');
    const closeBtn = lb.querySelector('.lb-close');
    const container = lb.querySelector('.lb-img-container');
    
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    const minScale = 1;
    const maxScale = 4;
    const scaleStep = 0.25;
    
    // Track drag state
    let isDragging = false;
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;
    
    const updateZoom = (useTransition = true) => {
      if (useTransition) {
        img.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      } else {
        img.style.transition = 'none';
      }
      
      // Clamp translation offsets when scale is near 1
      if (scale <= 1) {
        scale = 1;
        translateX = 0;
        translateY = 0;
        img.style.cursor = 'zoom-in';
      } else {
        img.style.cursor = 'grab';
        
        // Clamp translations so image doesn't float completely off screen
        const maxOffsetDragX = window.innerWidth * scale / 2;
        const maxOffsetDragY = window.innerHeight * scale / 2;
        translateX = Math.max(-maxOffsetDragX, Math.min(maxOffsetDragX, translateX));
        translateY = Math.max(-maxOffsetDragY, Math.min(maxOffsetDragY, translateY));
      }
      
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      zoomLevelText.textContent = `${Math.round(scale * 100)}%`;
    };
    
    // Zoom control click event handlers
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (scale < maxScale) {
        scale += scaleStep;
        updateZoom(true);
      }
    });
    
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (scale > minScale) {
        scale -= scaleStep;
        if (scale <= 1) {
          scale = 1;
          translateX = 0;
          translateY = 0;
        }
        updateZoom(true);
      }
    });
    
    // Double click to zoom toggle
    img.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (scale > 1) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      } else {
        scale = 2;
      }
      updateZoom(true);
    });
    
    // Drag/Pan Event Listeners (Mouse)
    img.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      e.preventDefault(); // prevent image drag ghosting
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      baseX = translateX;
      baseY = translateY;
      img.style.cursor = 'grabbing';
      updateZoom(false); // disable transition for instant responsiveness
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      translateX = baseX + dx;
      translateY = baseY + dy;
      updateZoom(false);
    });
    
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        updateZoom(true);
      }
    });
    
    // Drag/Pan + Pinch-to-Zoom Event Listeners (Touch for mobile)
    let lastPinchDist = 0;
    let pinchBaseScale = 1;

    function getTouchDist(t1, t2) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    img.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // Pinch start
        isDragging = false;
        lastPinchDist = getTouchDist(e.touches[0], e.touches[1]);
        pinchBaseScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        // Pan start (only when zoomed)
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        baseX = translateX;
        baseY = translateY;
        updateZoom(false);
      }
    }, { passive: false });
    
    img.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // Pinch zoom
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const ratio = dist / lastPinchDist;
        scale = Math.max(minScale, Math.min(maxScale, pinchBaseScale * ratio));
        if (scale <= 1) {
          translateX = 0;
          translateY = 0;
        }
        updateZoom(false);
      } else if (isDragging && e.touches.length === 1) {
        // Pan
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        translateX = baseX + dx;
        translateY = baseY + dy;
        updateZoom(false);
      }
    }, { passive: false });
    
    img.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        lastPinchDist = 0;
      }
      if (e.touches.length === 0) {
        isDragging = false;
        updateZoom(true);
      }
    });

    // Block all default touch on the lightbox backdrop to prevent page movement
    lb.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Wheel zoom
    container.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return; // allow normal browser zoom if ctrl is pressed
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
      if (newScale !== scale) {
        scale = newScale;
        if (scale <= 1) {
          translateX = 0;
          translateY = 0;
        }
        updateZoom(true);
      }
    }, { passive: false });
    
    // Close functions
    const closeLb = () => {
      if (lb.classList.contains('is-closing')) return;
      lb.classList.add('is-closing');
      document.body.classList.remove('no-scroll');
      setTimeout(() => lb.remove(), 300);
    };
    
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLb();
    });
    
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target === container) {
        closeLb();
      }
    });
    
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') {
        closeLb();
        document.removeEventListener('keydown', esc);
      }
    });
  }

  // ============================================================
  // Logo inline + animation au chargement
  // ============================================================
  const LOGO_SVG = `
    <svg class="logo-svg" viewBox="0 0 572 572" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path class="logo-arrow logo-arrow--top" d="M285.999 0L411.949 188.789L319.191 188.789L319.191 332.495L252.807 332.495L252.807 188.789L160.05 188.789L285.999 0Z" fill="currentColor"/>
      <path class="logo-arrow logo-arrow--left" d="M251.898 428.299L125.949 239.509L0 428.299L92.7567 428.299L92.7567 572.004L159.141 572.004L159.141 428.299L251.898 428.299Z" fill="currentColor"/>
      <path class="logo-arrow logo-arrow--right" d="M446.052 239.509L572.001 428.299L479.245 428.299L479.245 572.004L412.86 572.004L412.86 428.299L320.103 428.299L446.052 239.509Z" fill="currentColor"/>
    </svg>`;
  document.querySelectorAll('.brand').forEach((brand) => {
    brand.innerHTML = LOGO_SVG;
  });

  // Rejoue l'animation du logo toutes les minutes
  const replayLogoAnimation = () => {
    document.querySelectorAll('.logo-arrow').forEach((el) => {
      el.style.animation = 'none';
      void el.offsetHeight; // force reflow
      el.style.animation = '';
    });
  };
  setInterval(replayLogoAnimation, 60000);

  // ============================================================
  // Thème
  // ============================================================
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));
  toggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ============================================================
  // Rendu dynamique des projets (depuis projects.json ou localStorage)
  // ============================================================
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    renderProjects = (list) => {
      projectsGrid.innerHTML = list.map((p) => {
        const imgUrl = typeof p.image === 'object' ? (p.image.url || '') : (p.image || '');
        const isNew = p.createdAt && (Date.now() - Date.parse(p.createdAt) < 3600000);
        const isUpdated = p.updatedAt && (Date.now() - Date.parse(p.updatedAt) < 3600000);
        
        let badgeHTML = '';
        if (isNew) {
          const badgeText = (document.documentElement.lang || 'fr') === 'fr' ? 'Nouveau' : 'New';
          badgeHTML = `
            <span class="card-badge" style="background: var(--accent); color: var(--accent-contrast);">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; display:inline-block; vertical-align:-1px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              ${badgeText}
            </span>
          `;
        } else if (isUpdated) {
          const badgeText = (document.documentElement.lang || 'fr') === 'fr' ? 'Mis à jour' : 'Updated';
          badgeHTML = `
            <span class="card-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; display:inline-block; vertical-align:-1px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${badgeText}
            </span>
          `;
        }
        return `
        <a href="project-detail.html#${p.id}" class="card project-card reveal" style="text-decoration: none; color: inherit; display: block;">
          <div class="card-media">
            ${badgeHTML}
            ${imgUrl ? `<img src="${imgUrl}" alt="${p.title}" loading="lazy" />` : ''}
          </div>
          <div class="card-body">
            ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <span class="link" data-i18n="projects.link">En savoir plus →</span>
          </div>
        </a>`;
      }).join('');
      // re-observe les nouvelles cartes
      observeNewReveals(projectsGrid);
      // ré-appliquer i18n sur les liens nouvellement injectés
      applyI18n(getLang());
    };

    // Tentative de rendu instantané depuis le cache local pour éviter tout clignotement
    const cachedProjects = localStorage.getItem('projects');
    if (cachedProjects) {
      try {
        const parsed = JSON.parse(cachedProjects);
        if (parsed && Array.isArray(parsed.projects)) {
          renderProjects(parsed.projects);
        }
      } catch (err) {}
    }

    // Chargement initial depuis Firebase Cloud Firestore
    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('projects').get()
        .then(doc => {
          if (doc.exists && doc.data().value) {
            renderProjects(doc.data().value.projects || []);
          } else if (!cachedProjects) {
            // Fallback JSON uniquement s'il n'y avait rien en cache
            fetch('projects.json')
              .then((r) => r.json())
              .then((data) => renderProjects(data.projects || []))
              .catch(() => { projectsGrid.innerHTML = '<p>Impossible de charger les projets.</p>'; });
          }
        })
        .catch(() => {
          if (!cachedProjects) {
            fetch('projects.json')
              .then((r) => r.json())
              .then((data) => renderProjects(data.projects || []))
              .catch(() => { projectsGrid.innerHTML = '<p>Impossible de charger les projets.</p>'; });
          }
        });
    } else if (!cachedProjects) {
      fetch('projects.json')
        .then((r) => r.json())
        .then((data) => renderProjects(data.projects || []))
        .catch(() => { projectsGrid.innerHTML = '<p>Impossible de charger les projets.</p>'; });
    }
  }

  // ============================================================
  // Rendu dynamique — À propos (depuis Firebase)
  // ============================================================
  const aboutBio = document.getElementById('about-bio');
  if (aboutBio) {
    const cachedAbout = localStorage.getItem('admin_about');
    const renderAbout = (data) => {
      aboutBio.innerHTML = data.bioFr;
      const skillsList = document.getElementById('about-skills');
      if (skillsList && data.skills) {
        skillsList.innerHTML = data.skills.map(s => `<li>${s.fr}</li>`).join('');
      }
      const cvLink = document.getElementById('about-cv-link');
      if (cvLink && data.cv) cvLink.href = data.cv;
    };

    if (cachedAbout) {
      try {
        const parsed = JSON.parse(cachedAbout);
        if (parsed && parsed.bioFr) {
          renderAbout(parsed);
        }
      } catch (err) {}
    }

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_about').get()
        .then(doc => {
          if (doc.exists && doc.data().value) {
            renderAbout(doc.data().value);
          }
        })
        .catch(() => {});
    }
  }

  // ============================================================
  // Rendu dynamique — Expérience (depuis Firebase)
  // ============================================================
  const expTimeline = document.getElementById('experience-timeline');
  if (expTimeline) {
    const cachedExp = localStorage.getItem('admin_experience');
    const renderExp = (items) => {
      expTimeline.innerHTML = items.map(it => {
        let linkHTML = '';
        if (it.projectLink) {
          const isExt = it.projectLink.startsWith('http://') || it.projectLink.startsWith('https://');
          const href = isExt ? it.projectLink : `project-detail.html#${it.projectLink}`;
          const target = isExt ? 'target="_blank" rel="noopener"' : '';
          const text = isExt ? 'Visiter le site associé' : 'Voir le projet associé';
          linkHTML = `
            <a href="${href}" ${target} class="timeline-project-link" style="display:inline-flex; align-items:center; gap:6px; font-size:13px; margin-top:8px; font-weight:600; text-decoration:none; color:var(--primary); transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              ${text}
            </a>`;
        }
        return `
          <li class="timeline-item reveal">
            <div class="timeline-date">${it.dateFr}</div>
            <div class="timeline-body">
              <h3>${it.roleFr}</h3>
              <p>${it.descFr}</p>
              ${linkHTML}
            </div>
          </li>`;
      }).join('');
      // re-observe reveals
      observeNewReveals(expTimeline);
    };

    if (cachedExp) {
      try {
        const parsed = JSON.parse(cachedExp);
        if (Array.isArray(parsed)) {
          renderExp(parsed);
        }
      } catch (err) {}
    }

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_experience').get()
        .then(doc => {
          const items = (doc.exists && doc.data().value) ? doc.data().value : null;
          if (items && items.length) {
            renderExp(items);
          }
        })
        .catch(() => {});
    }
  }

  // ============================================================
  // Rendu dynamique — Contact (depuis Firebase)
  // ============================================================
  const contactEmail = document.getElementById('contact-email-link');
  if (contactEmail) {
    const cachedContact = localStorage.getItem('admin_contact');
    const renderContact = (data) => {
      if (data.email) {
        contactEmail.href = 'mailto:' + data.email;
        contactEmail.textContent = data.email;
      }
      const socialsDiv = document.getElementById('contact-socials');
      if (socialsDiv && data.socials) {
        socialsDiv.innerHTML = data.socials
          .filter(s => s.name && s.url)
          .map((s, i, arr) => {
            let html = `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`;
            if (i < arr.length - 1) html += '<span>·</span>';
            return html;
          }).join('\n          ');
      }
    };

    if (cachedContact) {
      try {
        const parsed = JSON.parse(cachedContact);
        if (parsed && (parsed.email || parsed.socials)) {
          renderContact(parsed);
        }
      } catch (err) {}
    }

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_contact').get()
        .then(doc => {
          const data = (doc.exists && doc.data().value) ? doc.data().value : null;
          if (data) {
            renderContact(data);
          }
        })
        .catch(() => {});
    }
  }

  // ============================================================
  // Rendu dynamique — Draft (depuis Firebase)
  // ============================================================
  const draftList = document.getElementById('draft-list');
  const renderDraft = () => {
    if (!draftList) return;
    const cachedDraft = localStorage.getItem('admin_trash');
    const drawDraft = (items) => {
      draftList.innerHTML = items.map(it => `<li><span>${it.name}</span> — ${it.noteFr}</li>`).join('');
    };

    if (cachedDraft) {
      try {
        const parsed = JSON.parse(cachedDraft);
        if (Array.isArray(parsed)) {
          drawDraft(parsed);
        }
      } catch (err) {}
    }

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_trash').get()
        .then(doc => {
          const items = (doc.exists && doc.data().value) ? doc.data().value : null;
          if (items && items.length) {
            drawDraft(items);
          }
        })
        .catch(() => {});
    }
  };
  renderDraft();

  // ============================================================
  // Rendu dynamique des ressources (market.json + filtres)
  // ============================================================
  const resourcesGrid = document.getElementById('resources-grid');
  if (resourcesGrid) {
    let activeFilter = 'all';

    // Détecte si le visiteur est en zone euro (timezone Europe/* ou langue européenne)
    const isEuroZone = (() => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.startsWith('Europe/')) return true;
      } catch { }
      const navLang = (navigator.language || '').toLowerCase();
      const euroLangs = ['de', 'it', 'es', 'pt', 'nl', 'el', 'fi', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga'];
      if (euroLangs.some(l => navLang.startsWith(l))) return true;
      return false;
    })();
    const XOF_TO_EUR = 1 / 655.957; // taux fixe FCFA → EUR

    // Liens de paiement — remplace par tes vrais liens
    const PAYPAL_LINK = 'https://paypal.me/thesouscote'; // Ton lien PayPal.me

    const getPaymentLink = (title, price, customPaymentLink) => {
      if (customPaymentLink && customPaymentLink.trim() !== '') {
        return customPaymentLink.trim();
      }
      if (isEuroZone) {
        const eur = (price * XOF_TO_EUR).toFixed(2);
        return `${PAYPAL_LINK}/${eur}EUR`;
      }
      return `https://pay.wave.com/m/M_0HDs6VQohDa2/c/ci/`;
    };

    const formatPrice = (price) => {
      const lang = document.documentElement.lang || 'fr';
      if (!price || price === 0) return I18N[lang]?.['resources.free'] || 'Gratuit';
      if (isEuroZone) {
        const eur = (price * XOF_TO_EUR).toFixed(2);
        return eur + ' €';
      }
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    };

    const renderResources = () => {
      const filtered = allResources.filter((r) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'free') return !r.price || r.price === 0;
        return r.category === activeFilter;
      });
      const lang = document.documentElement.lang || 'fr';
      const dict = I18N[lang] || I18N.fr;
      if (!filtered.length) {
        resourcesGrid.innerHTML = `<p class="empty-state">${dict['resources.empty']}</p>`;
        return;
      }
      resourcesGrid.innerHTML = filtered.map((r) => {
        const isFree = !r.price || r.price === 0;
        const cta = dict['projects.link'] || (lang === 'fr' ? 'En savoir plus →' : 'Learn more →');
        const isNew = r.createdAt && (Date.now() - Date.parse(r.createdAt) < 3600000);
        const isUpdated = r.updatedAt && (Date.now() - Date.parse(r.updatedAt) < 3600000);
        
        let badgeHTML = '';
        if (isNew) {
          const badgeText = (document.documentElement.lang || 'fr') === 'fr' ? 'Nouveau' : 'New';
          badgeHTML = `
            <span class="card-badge" style="background: var(--accent); color: var(--accent-contrast);">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; display:inline-block; vertical-align:-1px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              ${badgeText}
            </span>
          `;
        } else if (isUpdated) {
          const badgeText = (document.documentElement.lang || 'fr') === 'fr' ? 'Mis à jour' : 'Updated';
          badgeHTML = `
            <span class="card-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; display:inline-block; vertical-align:-1px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${badgeText}
            </span>
          `;
        }
        return `
          <a href="market-detail.html#${r.id}" class="card resource-card reveal is-visible" style="text-decoration: none; color: inherit; display: block;">
            <div class="card-media">
              ${badgeHTML}
              ${r.image ? `<img src="${r.image}" alt="${r.title}" loading="lazy" />` : ''}
            </div>
            <div class="card-body">
              <div class="resource-meta">
                ${r.tag ? `<span class="card-tag">${r.tag}</span>` : ''}
                <span class="resource-price ${isFree ? 'is-free' : ''}">${formatPrice(r.price)}</span>
              </div>
              <h3>${r.title}</h3>
              <p>${r.description}</p>
              <span class="link">${cta}</span>
            </div>
          </a>`;
      }).join('');
      observeNewReveals(resourcesGrid);
    };

    // Filtres
    document.querySelectorAll('#resources-filters .filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#resources-filters .filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeFilter = btn.dataset.filter;
        renderResources();
      });
    });

    // Source : Firebase en priorité, fallback JSON si vide.
    const fetchResources = () => {
      fetch('market.json')
        .then((r) => r.json())
        .then((data) => { allResources = data.resources || []; renderResources(); })
        .catch(() => { resourcesGrid.innerHTML = '<p class="empty-state">Impossible de charger le market.</p>'; });
    };

    // Rendu instantané depuis le cache local pour éviter le clignotement
    const cachedResources = localStorage.getItem('admin_resources');
    if (cachedResources) {
      try {
        const parsed = JSON.parse(cachedResources);
        if (parsed && Array.isArray(parsed.resources)) {
          allResources = parsed.resources;
          renderResources();
        }
      } catch (err) {}
    }

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_resources').get()
        .then(doc => {
          if (doc.exists && doc.data().value && Array.isArray(doc.data().value.resources) && doc.data().value.resources.length) {
            allResources = doc.data().value.resources;
            renderResources();
          } else if (!cachedResources) {
            fetchResources();
          }
        })
        .catch(() => {
          if (!cachedResources) {
            fetchResources();
          }
        });
    } else if (!cachedResources) {
      fetchResources();
    }
  }

  // ============================================================
  // Année
  // ============================================================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ============================================================
  // Reveal au scroll
  // ============================================================
  const revealEls = document.querySelectorAll('.reveal');
  let ioInstance = null;

  function observeNewReveals(container) {
    if ('IntersectionObserver' in window && ioInstance) {
      container.querySelectorAll('.reveal').forEach((el) => {
        el.classList.remove('is-visible');
        ioInstance.observe(el);
      });
    } else {
      container.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }
  }

  if ('IntersectionObserver' in window) {
    ioInstance = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 6) * 60 + 'ms';
          entry.target.classList.add('is-visible');
          ioInstance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    revealEls.forEach((el) => ioInstance.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ============================================================
  // Onglet actif
  // ============================================================
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll('.nav-links a[data-nav]').forEach((a) => {
      if (a.dataset.nav === currentPage) a.classList.add('is-active');
    });
  }

  // ============================================================
  // Mobile menu toggle
  // ============================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      const isOpen = navLinks.classList.contains('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.innerHTML = isOpen
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
    // Close on link click with a small delay for iOS Safari bug
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        setTimeout(() => {
          navLinks.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
        }, 150);
      });
    });
  }

  // ============================================================
  // Parallax hero
  // ============================================================
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 400);
        heroContent.style.transform = 'translateY(' + y * 0.18 + 'px)';
        heroContent.style.opacity = String(1 - y / 600);
        ticking = false;
      });
    }, { passive: true });
  }

  // ============================================================
  // Palette ⌘K
  // ============================================================
  const cmdk = document.getElementById('cmdk');
  const cmdkInput = document.getElementById('cmdk-input');
  const cmdkItems = Array.from(document.querySelectorAll('[data-cmdk-item]'));
  let activeIdx = 0;
  const visibleItems = () =>
    cmdkItems.filter((a) => !a.parentElement.classList.contains('is-hidden'));
  const setActive = (idx) => {
    const v = visibleItems();
    if (!v.length) return;
    activeIdx = (idx + v.length) % v.length;
    cmdkItems.forEach((a) => a.classList.remove('is-active'));
    v[activeIdx].classList.add('is-active');
    v[activeIdx].scrollIntoView({ block: 'nearest' });
  };
  const openCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.add('is-open');
    cmdk.setAttribute('aria-hidden', 'false');
    cmdkInput.value = '';
    cmdkItems.forEach((a) => a.parentElement.classList.remove('is-hidden'));
    setActive(0);
    setTimeout(() => cmdkInput.focus(), 10);
  };
  const closeCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.remove('is-open');
    cmdk.setAttribute('aria-hidden', 'true');
  };
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk?.classList.contains('is-open') ? closeCmdk() : openCmdk();
      return;
    }
    if (!cmdk?.classList.contains('is-open')) return;
    if (e.key === 'Escape') return closeCmdk();
    if (e.key === 'ArrowDown') { e.preventDefault(); return setActive(activeIdx + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); return setActive(activeIdx - 1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      visibleItems()[activeIdx]?.click();
    }
  });
  cmdkInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    cmdkItems.forEach((a) => {
      const hit = a.textContent.toLowerCase().includes(q);
      a.parentElement.classList.toggle('is-hidden', !hit);
    });
    setActive(0);
  });
  cmdkItems.forEach((a) => a.addEventListener('click', closeCmdk));
  document.querySelectorAll('[data-cmdk-close]').forEach((el) => el.addEventListener('click', closeCmdk));

  // ============================================================
  // Formulaire de contact fonctionnel (Web3Forms)
  // ============================================================
  const contactForm = document.getElementById('contact-form-public');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const status = document.getElementById('cf-status');
      const lang = getLang();
      const dict = I18N[lang] || I18N.fr;

      // Basic validation
      const name = contactForm.querySelector('#cf-name');
      const email = contactForm.querySelector('#cf-email');
      const message = contactForm.querySelector('#cf-message');
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        status.textContent = lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.';
        status.className = 'contact-status is-error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        status.textContent = lang === 'fr' ? 'Adresse email invalide.' : 'Invalid email address.';
        status.className = 'contact-status is-error';
        return;
      }

      btn.disabled = true;
      btn.textContent = dict['contact.sending'] || 'Envoi…';
      status.textContent = '';
      status.className = 'contact-status';

      try {
        const formData = new FormData(contactForm);
        let accessKey = 'YOUR_WEB3FORMS_KEY';
        try {
          const contactData = JSON.parse(localStorage.getItem('admin_contact'));
          if (contactData && contactData.web3forms) {
            accessKey = contactData.web3forms;
          }
        } catch { }
        formData.append('access_key', accessKey);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        if (json.success) {
          status.textContent = dict['contact.success'];
          status.className = 'contact-status is-success';
          contactForm.reset();
        } else {
          throw new Error(json.message || 'Error');
        }
      } catch {
        status.textContent = dict['contact.error'];
        status.className = 'contact-status is-error';
      } finally {
        btn.disabled = false;
        btn.textContent = dict['contact.send'] || 'Envoyer →';
      }
    });
  }

  // ============================================================
  // Rendu dynamique de la page Détails du Projet
  // ============================================================
  const projTitle = document.getElementById('proj-title');
  if (projTitle) {
    const projId = window.location.hash.slice(1) || new URLSearchParams(window.location.search).get('id');

    const renderDetail = (p) => {
      const lang = getLang();
      if (!p) {
        projTitle.textContent = lang === 'fr' ? 'Projet introuvable' : 'Project not found';
        const descEl = document.getElementById('proj-desc');
        if (descEl) {
          descEl.innerHTML = lang === 'fr'
            ? 'Le projet que vous recherchez n\'existe pas ou a été supprimé.<br><br><a href="projects.html" class="btn btn-primary">Retour aux projets</a>'
            : 'The project you are looking for does not exist or has been removed.<br><br><a href="projects.html" class="btn btn-primary">Back to projects</a>';
        }
        const bc = document.querySelector('.breadcrumb');
        if (bc) bc.style.display = 'none';
        const tag = document.getElementById('proj-tag');
        if (tag) tag.style.display = 'none';
        return;
      }
      document.title = `${p.title} — thesouscote`;
      projTitle.textContent = p.title || (lang === 'fr' ? 'Sans titre' : 'Untitled');

      // Breadcrumb
      const breadcrumbCurrent = document.getElementById('breadcrumb-current');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = p.title;

      // Tag
      const tagEl = document.getElementById('proj-tag');
      if (tagEl) {
        if (p.tag) {
          tagEl.textContent = p.tag;
          tagEl.style.display = 'inline-block';
        } else {
          tagEl.style.display = 'none';
        }
      }

      // Description
      const descEl = document.getElementById('proj-desc');
      if (descEl) descEl.textContent = p.description || '';

      // Metadata grid (date, client, stack)
      const metaEl = document.getElementById('proj-meta');
      if (metaEl) {
        let metaHTML = '';
        if (p.date) {
          metaHTML += `<div class="project-meta-item"><span class="project-meta-label">${lang === 'fr' ? 'Date' : 'Date'}</span><span class="project-meta-value">${p.date}</span></div>`;
        }
        if (p.client) {
          metaHTML += `<div class="project-meta-item"><span class="project-meta-label">Client</span><span class="project-meta-value">${p.client}</span></div>`;
        }
        if (p.stack) {
          const stackStr = Array.isArray(p.stack) ? p.stack.join(', ') : p.stack;
          metaHTML += `<div class="project-meta-item"><span class="project-meta-label">Stack</span><span class="project-meta-value">${stackStr}</span></div>`;
        }

        metaEl.innerHTML = metaHTML;
        metaEl.style.display = metaHTML ? '' : 'none';
      }

      // CTA
      const ctaContainer = document.getElementById('proj-cta-container');
      if (ctaContainer) {
        const shareBtnHTML = `<button class="btn btn-ghost" id="share-btn" style="display:inline-flex; align-items:center; gap:8px; padding:8px 16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>${lang === 'fr' ? 'Partager le Projet' : 'Share Project'}</span>
        </button>`;
        if (p.link && p.link !== '#' && p.link.trim() !== '') {
          const primaryBtn = `<a href="${p.link}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-bottom:32px;">${lang === 'fr' ? 'Visiter le projet' : 'Visit project'} ↗</a>`;
          ctaContainer.innerHTML = `${primaryBtn} ${shareBtnHTML}`;
        } else {
          ctaContainer.innerHTML = shareBtnHTML;
        }
        // Attach share handler
        const btn = document.getElementById('share-btn');
        if (btn) {
            const shareProject = async () => {
              const isSecure = location.protocol === 'https:';
              if (isSecure && navigator.share) {
                try {
                  await navigator.share({ title: document.title, url: window.location.href });
                  return;
                } catch (e) {
                }
              }
              if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  alert(`${lang === 'fr' ? "Pourquoi tu n'as plus partagé ?" : 'Why did you stop sharing?'}`);
                } catch (err) {
                  fallbackCopy();
                }
              } else {
                fallbackCopy();
              }
              function fallbackCopy() {
                // Create a temporary textarea to copy the URL (works on HTTP)
                const textarea = document.createElement('textarea');
                textarea.value = window.location.href;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : null;
                textarea.select();
                try {
                  document.execCommand('copy');
                  alert(`${lang === 'fr' ? "Pourquoi tu n'as plus partagé ?" : 'Why did you stop sharing?'}`);
                } catch (e) {
                  // If execCommand fails, fall back to prompt
                  const msg = `${lang === 'fr' ? 'Copiez le lien suivant:' : 'Copy the following link:'}\n${window.location.href}`;
                  prompt(msg);
                }
                document.body.removeChild(textarea);
                if (selected) {
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(selected);
                }
              }
            };
            btn.addEventListener('click', shareProject);
        }
      }

      // Gallery with lightbox
      const galleryEl = document.getElementById('proj-gallery');
      if (galleryEl) {
        const visuals = [];
        if (p.image) {
          if (typeof p.image === 'object' && p.image.url) {
            visuals.push({ url: p.image.url, downloadable: p.image.downloadable !== false });
          } else {
            visuals.push({ url: p.image, downloadable: true });
          }
        }
        if (p.gallery && p.gallery.length) visuals.push(...p.gallery.map(g => typeof g === 'string' ? { url: g, downloadable: true } : g));

        if (visuals.length) {
          galleryEl.innerHTML = visuals.map((item, i) => `
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div class="gallery-item reveal is-visible" style="cursor:zoom-in;">
                <img src="${item.url}" alt="${p.title}" loading="lazy" ${i === 0 ? 'style="view-transition-name: hero-image-transition;"' : ''} />
              </div>
              <button type="button" class="link dl-btn" data-url="${item.url}" data-name="Image-${p.title.replace(/\s+/g, '-')}-${i + 1}" style="align-self:flex-start; display:inline-flex; align-items:center; gap:6px; font-size:14px; background:none; border:none; cursor:pointer; color:inherit; padding:0;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ${lang === 'fr' ? 'Télécharger' : 'Download'}
              </button>
            </div>
          `).join('');

          // Supprime le nom de transition après que l'animation est terminée pour éviter des conflits
          setTimeout(() => {
            const firstImg = galleryEl.querySelector('.gallery-item img');
            if (firstImg) firstImg.style.viewTransitionName = '';
          }, 1500);
          // Lightbox
          galleryEl.querySelectorAll('.gallery-item img').forEach(img => {
            img.addEventListener('click', () => {
              openLightbox(img.src, img.alt);
            });
          });
          // Download buttons
          galleryEl.querySelectorAll('.dl-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              const url = btn.dataset.url;
              const name = btn.dataset.name;
              try {
                const res = await fetch(url);
                const blob = await res.blob();
                const ext = blob.type.split('/')[1] || 'jpg';
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${name}.${ext}`;
                a.click();
                URL.revokeObjectURL(a.href);
              } catch {
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                a.target = '_blank';
                a.click();
              }
            });
          });
        } else {
          galleryEl.innerHTML = `<p class="text-muted">${lang === 'fr' ? 'Aucun visuel disponible pour ce projet.' : 'No visuals available for this project.'}</p>`;
        }
      }
    };

    // Load from Firebase first, fallback to JSON
    const fallbackProjectJSON = () => {
      fetch('projects.json')
        .then((r) => r.json())
        .then((data) => {
          const list = data.projects || [];
          const found = list.find(x => x.id === projId);
          renderDetail(found);
        })
        .catch(() => { projTitle.textContent = "Erreur de chargement"; });
    };

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('projects').get()
        .then(doc => {
          if (doc.exists && doc.data().value) {
            const list = doc.data().value.projects || [];
            const found = list.find(x => x.id === projId);
            if (found) { renderDetail(found); return; }
          }
          fallbackProjectJSON();
        })
        .catch(() => fallbackProjectJSON());
    } else {
      fallbackProjectJSON();
    }
  }

  // ============================================================
  // Rendu dynamique — Page Détail Ressource
  // ============================================================
  const resTitle = document.getElementById('res-title');
  if (resTitle) {
    const resId = window.location.hash.slice(1) || new URLSearchParams(window.location.search).get('id');
    const lang = getLang();

    // Détection zone euro
    const isEuro = (() => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.startsWith('Europe/')) return true;
      } catch { }
      const navLang = (navigator.language || '').toLowerCase();
      const euroLangs = ['de', 'it', 'es', 'pt', 'nl', 'el', 'fi', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga'];
      return euroLangs.some(l => navLang.startsWith(l));
    })();
    const RATE = 1 / 655.957;
    const WAVE_NUM = '+22500000000'; // Ton numéro Wave
    const PAYPAL = 'https://paypal.me/thesouscote'; // Ton lien PayPal

    const renderResourceDetail = (r) => {
      if (!r) {
        resTitle.textContent = lang === 'fr' ? 'Élément introuvable' : 'Item not found';
        const descEl = document.getElementById('res-desc');
        if (descEl) {
          descEl.innerHTML = lang === 'fr'
            ? 'L\'élément que vous recherchez n\'existe pas ou a été supprimé.<br><br><a href="market.html" class="btn btn-primary">Retour au market</a>'
            : 'The resource you are looking for does not exist or has been removed.<br><br><a href="market.html" class="btn btn-primary">Back to resources</a>';
        }
        const bc = document.querySelector('.breadcrumb');
        if (bc) bc.style.display = 'none';
        const info = document.getElementById('res-info');
        if (info) info.style.display = 'none';
        return;
      }
      document.title = `${r.title} — thesouscote`;
      resTitle.textContent = r.title;

      const bc = document.getElementById('breadcrumb-current');
      if (bc) bc.textContent = r.title;

      const descEl = document.getElementById('res-desc');
      if (descEl) descEl.textContent = r.description || '';

      const imgEl = document.getElementById('res-image');
      if (imgEl && r.image) {
        imgEl.src = r.image;
        imgEl.alt = r.title;
        imgEl.style.display = 'block';
        imgEl.style.viewTransitionName = 'hero-image-transition';
        
        setTimeout(() => {
          if (imgEl) imgEl.style.viewTransitionName = '';
        }, 1500);

        imgEl.addEventListener('click', () => {
          openLightbox(imgEl.src, imgEl.alt);
        });
      }

      const priceEl = document.getElementById('res-price');
      if (priceEl) {
        const isFree = !r.price || r.price === 0;
        if (isFree) {
          priceEl.textContent = lang === 'fr' ? 'Gratuit' : 'Free';
          priceEl.classList.add('is-free');
        } else if (isEuro) {
          priceEl.textContent = (r.price * RATE).toFixed(2) + ' \u20ac';
        } else {
          priceEl.textContent = new Intl.NumberFormat('fr-FR').format(r.price) + ' FCFA';
        }
      }

      const tagEl = document.getElementById('res-tag');
      if (tagEl) {
        if (r.tag) { tagEl.textContent = r.tag; }
        else { tagEl.style.display = 'none'; }
      }

      const catEl = document.getElementById('res-category');
      if (catEl) {
        const catNames = { logo: 'Logo', carte: lang === 'fr' ? 'Carte graphique' : 'Graphic card', sticker: 'Sticker' };
        catEl.textContent = catNames[r.category] || r.category || '';
        if (!r.category) catEl.style.display = 'none';
      }

      const ctaEl = document.getElementById('res-cta');
      if (ctaEl) {
        const isFree = !r.price || r.price === 0;
        if (isFree) {
          ctaEl.innerHTML = `
            <button type="button" class="btn btn-primary market-dl-btn" data-url="${r.link || '#'}" data-name="Resource-${r.title.replace(/\s+/g, '-')}" style="width:100%; text-align:center; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              ${lang === 'fr' ? 'Télécharger gratuitement' : 'Download for free'}
            </button>
          `;
          
          const dlBtn = ctaEl.querySelector('.market-dl-btn');
          if (dlBtn) {
            dlBtn.addEventListener('click', async () => {
              const url = dlBtn.dataset.url;
              const name = dlBtn.dataset.name;
              if (!url || url === '#') return;
              try {
                const res = await fetch(url);
                const blob = await res.blob();
                const ext = blob.type.split('/')[1] || url.split('.').pop().split('?')[0] || 'zip';
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${name}.${ext}`;
                a.click();
                URL.revokeObjectURL(a.href);
              } catch {
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                a.target = '_blank';
                a.click();
              }
            });
          }
        } else {
          let payLink = r.paymentLink ? r.paymentLink.trim() : '#';
          const subject = encodeURIComponent(`Paiement — ${r.title}`);
          const bodyEmail = encodeURIComponent(`Bonjour,\n\nJe viens d'effectuer le paiement pour : ${r.title}.\n\nCi-joint ma preuve de paiement.\n\nMerci !`);
          const bodyWA = encodeURIComponent(`Bonjour ! Je viens de payer pour *${r.title}*. Voici ma preuve de paiement 👇`);
          const waLink = `https://wa.me/2250778835909?text=${bodyWA}`;
          const mailLink = `mailto:thesouscote@gmail.com?subject=${subject}&body=${bodyEmail}`;
          ctaEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
              ${payLink !== '#' ? `
              <a href="${payLink}" target="_blank" rel="noopener" class="btn btn-primary" style="text-align:center; justify-content:center; width:100%;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                ${lang === 'fr' ? 'Payer maintenant' : 'Pay now'} →
              </a>` : ''}
              <div style="background: var(--bg-alt); border: 1px solid var(--border); border-radius: 0; padding: 20px 24px; display:flex; flex-direction:column; gap:14px; width:100%;">
                <p style="font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); margin:0;">
                  ${lang === 'fr' ? 'Comment récupérer votre fichier' : 'How to get your file'}
                </p>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="background:var(--text); color:var(--bg); border-radius:0; min-width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">1</span>
                  <p style="margin:0; font-size:14px; color:var(--text-muted); line-height:1.5;">${lang === 'fr' ? 'Effectuez votre paiement en cliquant sur le bouton ci-dessus.' : 'Complete your payment by clicking the button above.'}</p>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="background:var(--text); color:var(--bg); border-radius:0; min-width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">2</span>
                  <p style="margin:0; font-size:14px; color:var(--text-muted); line-height:1.5;">${lang === 'fr' ? 'Envoyez votre capture d\'écran de paiement via WhatsApp ou par email.' : 'Send your payment screenshot via WhatsApp or email.'}</p>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="background:var(--text); color:var(--bg); border-radius:0; min-width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">3</span>
                  <p style="margin:0; font-size:14px; color:var(--text-muted); line-height:1.5;">${lang === 'fr' ? 'Je vous envoie un <strong style="color:var(--text);">code secret</strong> personnel.' : 'I\'ll send you a personal <strong style="color:var(--text);">secret code</strong>.'}</p>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="background:var(--text); color:var(--bg); border-radius:0; min-width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">4</span>
                  <p style="margin:0; font-size:14px; color:var(--text-muted); line-height:1.5;">${lang === 'fr' ? 'Entrez ce code dans la page <a href="collecte.html" style="color:var(--text); font-weight:600; text-decoration:underline;">Collecte</a> pour télécharger votre fichier.' : 'Enter this code on the <a href="collecte.html" style="color:var(--text); font-weight:600; text-decoration:underline;">Collecte</a> page to download your file.'}</p>
                </div>
                <div style="display:flex; gap:10px; margin-top:4px; flex-wrap:wrap;">
                  <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-ghost" style="flex:1; min-width:140px; text-align:center; justify-content:center; display:inline-flex; align-items:center; gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a href="${mailLink}" class="btn btn-ghost" style="flex:1; min-width:140px; text-align:center; justify-content:center; display:inline-flex; align-items:center; gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,12 2,6"></polyline></svg>
                    Email
                  </a>
                </div>
              </div>
            </div>
          `;
        }
      }

      const galleryEl = document.getElementById('res-gallery');
      if (galleryEl) {
        const gallery = r.gallery || [];
        if (gallery.length > 0) {
          galleryEl.innerHTML = gallery.map(imgUrl => `
            <div class="gallery-item" style="overflow: hidden; cursor: zoom-in;">
              <img src="${imgUrl}" style="width: 100%; height: auto; display: block; object-fit: contain;" alt="${(r.title || '').replace(/"/g, '&quot;')} gallery" loading="lazy">
            </div>
          `).join('');
          
          galleryEl.querySelectorAll('.gallery-item img').forEach(img => {
            img.addEventListener('click', () => {
              openLightbox(img.src, img.alt);
            });
          });
        } else {
          galleryEl.innerHTML = '';
        }
      }
    };

    // Load from Firebase first, fallback to JSON
    const fallbackMarketJSON = () => {
      fetch('market.json')
        .then(resp => resp.json())
        .then(data => {
          const found = (data.resources || []).find(x => x.id === resId);
          renderResourceDetail(found);
        })
        .catch(() => { resTitle.textContent = 'Erreur de chargement'; });
    };

    if (typeof db !== 'undefined' && db) {
      db.collection('portfolio_data').doc('admin_resources').get()
        .then(doc => {
          if (doc.exists && doc.data().value && Array.isArray(doc.data().value.resources)) {
            const found = doc.data().value.resources.find(x => x.id === resId);
            if (found) { renderResourceDetail(found); return; }
          }
          fallbackMarketJSON();
        })
        .catch(() => fallbackMarketJSON());
    } else {
      fallbackMarketJSON();
    }
  }

  // ============================================================
  // Logique du Point de Collecte (Espace Clients)
  // ============================================================
  const collecteForm = document.getElementById('collecte-form');
  if (collecteForm) {
    // Liste de démonstration par défaut
    const DEMO_DELIVERIES = {
      'MOKE2026': {
        client: "Moke Patrick Armel",
        date: "20 mai 2026",
        notes: "Merci pour votre confiance ! Voici les fichiers finaux pour la refonte de l'identité visuelle de thesouscote. Tous les formats vectoriels (SVG, PDF) ainsi que les versions PNG pour le web sont inclus dans l'archive ci-dessous.",
        files: [
          { name: "thesouscote_identity_pack.zip", size: "12.4 Mo", url: "assets/deliveries/thesouscote_identity_pack.zip" },
          { name: "thesouscote_guidelines.pdf", size: "3.2 Mo", url: "assets/deliveries/thesouscote_guidelines.pdf" }
        ]
      },
      'LOGO-GOLD': {
        client: "Studio d'Art Paris",
        date: "18 mai 2026",
        notes: "Voici vos variantes de logo validées. Exportées en CMJN pour l'impression haute qualité et en RVB optimisé pour vos profils et bannières de réseaux sociaux.",
        files: [
          { name: "logo_studio_art_final.zip", size: "8.1 Mo", url: "assets/deliveries/logo_studio_art_final.zip" }
        ]
      }
    };

    collecteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('collecte-code');
      const statusEl = document.getElementById('collecte-status');
      const deliveryBox = document.getElementById('delivery-box');
      
      const code = codeInput.value.trim().toUpperCase();
      statusEl.textContent = '';
      deliveryBox.style.display = 'none';

      if (!code) {
        statusEl.textContent = "Veuillez entrer un code de retrait.";
        return;
      }

      // Indique au client que la recherche est en cours (effet premium)
      statusEl.textContent = "Recherche en cours...";
      statusEl.style.color = "var(--text-muted)";

      // 1. Charger DYNAMIQUEMENT depuis Firebase (Cloud) ou localStorage
      let delivery = null;
      let loadedFromCloud = false;

      // --- Tentative 1 : collection 'deliveries' (Firestore direct) ---
      if (typeof db !== 'undefined' && db) {
        try {
          const snapshot = await db.collection('deliveries').where('code', '==', code).get();
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const d = doc.data();
            d.id = doc.id;
            delivery = d;
            loadedFromCloud = true;
            console.log('[Collecte] Code trouvé dans deliveries Firestore');
          } else {
            console.log('[Collecte] Code non trouvé dans deliveries Firestore, tentative portfolio_data...');
          }
        } catch (err) {
          console.error('[Collecte] Erreur deliveries Firestore:', err);
        }
      }

      // --- Tentative 2 : portfolio_data/admin_deliveries (Firestore CMS) ---
      if (!loadedFromCloud && typeof db !== 'undefined' && db) {
        try {
          const doc = await db.collection('portfolio_data').doc('admin_deliveries').get();
          if (doc.exists) {
            const data = doc.data().value;
            const deliveriesArr = (data && data.deliveries) ? data.deliveries : [];
            const found = deliveriesArr.find(d => d.code && d.code.toUpperCase() === code);
            if (found) {
              delivery = found;
              loadedFromCloud = true;
              console.log('[Collecte] Code trouvé dans portfolio_data/admin_deliveries');
            } else {
              console.log('[Collecte] Code non trouvé dans portfolio_data. Codes disponibles:', deliveriesArr.map(d => d.code));
            }
          }
        } catch (err) {
          console.error('[Collecte] Erreur portfolio_data Firestore:', err);
        }
      }

      // --- Tentative 3 : localStorage (même appareil) ---
      if (!loadedFromCloud) {
        console.log('[Collecte] Repli sur localStorage...');
        const localDel = localStorage.getItem('admin_deliveries');
        if (localDel) {
          try {
            const parsed = JSON.parse(localDel).deliveries || [];
            const found = parsed.find(x => x.code && x.code.toUpperCase() === code);
            if (found) {
              delivery = found;
              console.log('[Collecte] Code trouvé dans localStorage');
            } else {
              console.log('[Collecte] Code non trouvé dans localStorage. Codes disponibles:', parsed.map(x => x.code));
            }
          } catch { /* ignore */ }
        }
      }

      // 2. Repli sur les démos si non trouvé
      if (!delivery && DEMO_DELIVERIES[code]) {
        delivery = DEMO_DELIVERIES[code];
        delivery.id = 'demo';
      }

      // Nettoie le message de recherche
      statusEl.textContent = "";
      statusEl.style.color = "#e0245e";

      if (delivery) {
        // Logique de première ouverture (Activation 24H)
        if (!delivery.openedAt && delivery.id !== 'demo') {
          const now = new Date();
          delivery.openedAt = now.toISOString();
          const hoursToWait = delivery.expiryHours || 24;
          const expiryTime = new Date(now.getTime() + hoursToWait * 60 * 60 * 1000);
          delivery.expiry = expiryTime.toISOString();

          // MàJ Firestore
          if (typeof db !== 'undefined' && db && delivery.id) {
            db.collection('deliveries').doc(delivery.id).update({
              openedAt: delivery.openedAt,
              expiry: delivery.expiry
            }).catch(e => console.error("Erreur màj ouverture:", e));
          }
          
          // MàJ LocalStorage (si fallback)
          const localDel = localStorage.getItem('admin_deliveries');
          if (localDel) {
            try {
              const parsed = JSON.parse(localDel);
              const idx = (parsed.deliveries || []).findIndex(d => d.id === delivery.id);
              if (idx >= 0) {
                parsed.deliveries[idx].openedAt = delivery.openedAt;
                parsed.deliveries[idx].expiry = delivery.expiry;
                localStorage.setItem('admin_deliveries', JSON.stringify(parsed));
              }
            } catch(e){}
          }
        }

        // Vérification de l'expiration
        let warningText = "";
        if (delivery.expiry) {
          let expiryDate = parseDate(delivery.expiry);
          const today = new Date();
          
          // Si date courte (YYYY-MM-DD manuelle), on la met à 23:59:59
          if (delivery.expiry && typeof delivery.expiry === 'string' && delivery.expiry.length <= 10) {
            if (expiryDate) expiryDate.setHours(23, 59, 59, 999);
          }
          
          if (expiryDate && today > expiryDate) {
            statusEl.textContent = "Ce code de collecte a expiré.";
            return;
          } else if (delivery.openedAt) {
            // Affichage du temps restant
            const diffHours = Math.max(0, Math.floor((expiryDate - today) / (1000 * 60 * 60)));
            const diffMins = Math.max(0, Math.floor(((expiryDate - today) % (1000 * 60 * 60)) / (1000 * 60)));
            warningText = `<div style="background: rgba(224, 36, 94, 0.1); color: #e0245e; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Attention : ce code expirera dans ${diffHours}h ${diffMins}m. Sauvegardez vos fichiers.
            </div>`;
          }
        }

        document.getElementById('delivery-client').textContent = "Créations : " + delivery.client;
        document.getElementById('delivery-date').textContent = "Livré le " + delivery.date;
        document.getElementById('delivery-notes').textContent = delivery.notes;

        const filesContainer = document.getElementById('delivery-files');
        // Inject warning if any
        let warningHTML = warningText ? `<div style="margin-bottom: 20px;">${warningText}</div>` : '';
        
        filesContainer.innerHTML = warningHTML + (delivery.files || []).map(file => `
          <li class="delivery-file-item" style="flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <div class="delivery-file-name">${file.name}</div>
              <div class="delivery-file-size">${file.size || 'Prêt'}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${file.url}" target="_blank" class="btn btn-ghost" style="padding: 6px 14px; font-size: 13px;">Aperçu</a>
              <a href="${file.url}" download class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">Télécharger</a>
            </div>
          </li>
        `).join('');

        deliveryBox.style.display = 'block';
        codeInput.value = ''; // Reset input
      } else {
        statusEl.textContent = "Code incorrect ou expiré. Veuillez vérifier votre code de livraison.";
      }
    });
  }

  // ============================================================
  // Synchronisation Cloud Firebase en temps réel (CMS Global)
  // ============================================================
  function syncCloudDataAndRefresh() {
    if (typeof db === 'undefined' || !db) return;
    try {
      // On s'abonne aux changements Firebase Firestore en temps réel (.onSnapshot) !
      db.collection('portfolio_data').onSnapshot((snapshot) => {
        let dataVal = {};
        snapshot.forEach(doc => {
          const d = doc.data();
          dataVal[doc.id] = d;
          // Sauvegarde dans le cache de rendu local pour éviter le clignotement
          if (d && d.value !== undefined) {
            try {
              localStorage.setItem(doc.id, JSON.stringify(d.value));
            } catch (err) {}
          }
        });

        if (Object.keys(dataVal).length > 0) {
          console.log("[Firebase Cloud] Données mises à jour, actualisation dynamique de l'affichage...");
          
          // 1. Rafraîchit les Projets si on est sur la grille des projets
          const targetProjectsGrid = document.getElementById('projects-grid');
          if (typeof renderProjects === 'function' && targetProjectsGrid && dataVal.projects) {
            try { renderProjects(dataVal.projects.value.projects || []); } catch {}
          }
          
          // 2. Rafraîchit la Bio et Skills si on est sur la page À propos
          const targetAboutBio = document.getElementById('about-bio');
          if (targetAboutBio && dataVal.admin_about) {
            try {
              const dataA = dataVal.admin_about.value;
              targetAboutBio.innerHTML = dataA.bioFr;
              const skillsList = document.getElementById('about-skills');
              if (skillsList && dataA.skills) {
                skillsList.innerHTML = dataA.skills.map(s => `<li>${s.fr}</li>`).join('');
              }
              const cvLink = document.getElementById('about-cv-link');
              if (cvLink && dataA.cv) cvLink.href = dataA.cv;
            } catch {}
          }
          
          // 3. Rafraîchit la Timeline si on est sur la page Expériences
          const targetExpTimeline = document.getElementById('experience-timeline');
          if (targetExpTimeline && dataVal.admin_experience) {
            try {
              const items = dataVal.admin_experience.value;
              targetExpTimeline.innerHTML = items.map(it => {
                let linkHTML = '';
                if (it.projectLink) {
                  const isExt = it.projectLink.startsWith('http://') || it.projectLink.startsWith('https://');
                  const href = isExt ? it.projectLink : `project-detail.html#${it.projectLink}`;
                  const target = isExt ? 'target="_blank" rel="noopener"' : '';
                  const text = isExt ? 'Visiter le site associé' : 'Voir le projet associé';
                  linkHTML = `
                    <a href="${href}" ${target} class="timeline-project-link" style="display:inline-flex; align-items:center; gap:6px; font-size:13px; margin-top:8px; font-weight:600; text-decoration:none; color:var(--primary); transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      ${text}
                    </a>`;
                }
                return `
                  <li class="timeline-item reveal">
                    <div class="timeline-date">${it.dateFr}</div>
                    <div class="timeline-body">
                      <h3>${it.roleFr}</h3>
                      <p>${it.descFr}</p>
                      ${linkHTML}
                    </div>
                  </li>`;
              }).join('');
              observeNewReveals(targetExpTimeline);
            } catch {}
          }

          // 4. Rafraîchit la page Draft
          const targetDraftList = document.getElementById('draft-list');
          if (typeof renderDraft === 'function' && targetDraftList && dataVal.admin_trash) {
            try {
              const items = dataVal.admin_trash.value;
              targetDraftList.innerHTML = items.map(it =>
                `<li><span>${it.name}</span> — ${it.noteFr}</li>`
              ).join('');
            } catch {}
          }

          // 5. Rafraîchit le Market
          const targetResourcesGrid = document.getElementById('resources-grid');
          if (typeof renderResources === 'function' && targetResourcesGrid && dataVal.admin_resources) {
            try {
              allResources = dataVal.admin_resources.value.resources || [];
              renderResources();
            } catch {}
          }
        }
      }, (error) => {
        console.warn("[Firebase Cloud] Erreur sur l'écouteur temps réel Firestore (onSnapshot) :", error);
      });
    } catch (e) {
      console.error("[Firebase Cloud] Erreur d'actualisation en temps réel :", e);
    }
  }

  // ============================================================
  // Transitions de pages fluides (View Transitions)
  // ============================================================
  function setupPageTransitions() {
    if (!document.startViewTransition) return;

    document.addEventListener('click', (e) => {
      // Trouve si le clic est sur un lien vers project-detail ou market-detail
      const a = e.target.closest('a');
      if (!a) return;

      const href = a.getAttribute('href') || '';
      const isProjectDetail = href.includes('project-detail.html');
      const isMarketDetail = href.includes('market-detail.html');

      if (isProjectDetail || isMarketDetail) {
        e.preventDefault();

        // Ajoute un nom de transition sur l'image pour le morphing
        const img = a.querySelector('.card-media img');
        if (img) {
          img.style.viewTransitionName = 'hero-image-transition';
        }

        // Lance la transition
        document.startViewTransition(async () => {
          // Fetch le HTML de la page de destination
          try {
            const response = await fetch(href);
            const htmlText = await response.text();
            
            // Extrait le main de la page de destination
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
              // Swap le contenu de <main>
              currentMain.innerHTML = newMain.innerHTML;
              
              // Met à jour le hash/search de l'URL sans recharger la page
              history.pushState(null, '', href);
              
              // Ré-exécute les scripts de rendu pour la nouvelle page
              window.scrollTo(0, 0);
              
              // Détecte et lance les rendus
              const projTitleEl = document.getElementById('proj-title');
              if (projTitleEl) {
                // Rendu Projet
                const projId = window.location.hash.slice(1);
                const localProj = localStorage.getItem('projects');
                let found = null;
                if (localProj) {
                  const list = JSON.parse(localProj).projects || [];
                  found = list.find(x => x.id === projId);
                }
                if (found) {
                  renderDetail(found);
                } else {
                  fetch('projects.json')
                    .then(r => r.json())
                    .then(data => {
                      const list = data.projects || [];
                      const f = list.find(x => x.id === projId);
                      renderDetail(f);
                    });
                }
              }

              const resTitleEl = document.getElementById('res-title');
              if (resTitleEl) {
                // Rendu Ressource/Market
                const resId = window.location.hash.slice(1);
                const localRes = localStorage.getItem('admin_resources');
                let found = null;
                if (localRes) {
                  const list = JSON.parse(localRes).resources || [];
                  found = list.find(x => x.id === resId);
                }
                if (found) {
                  renderResourceDetail(found);
                } else {
                  fetch('market.json')
                    .then(r => r.json())
                    .then(data => {
                      const list = data.resources || [];
                      const f = list.find(x => x.id === resId);
                      renderResourceDetail(f);
                    });
                }
              }

              // Met à jour le titre du document
              document.title = doc.title;
              
              // Ré-observe les animations reveal
              const newReveals = document.querySelectorAll('.reveal');
              if (ioInstance) {
                newReveals.forEach(el => {
                  el.classList.remove('is-visible');
                  ioInstance.observe(el);
                });
              }
            }
          } catch (err) {
            // Repli : redirection normale si le fetch échoue
            window.location.href = href;
          }
        });
      }
    });

    // Supporte le bouton précédent/suivant du navigateur
    window.addEventListener('popstate', () => {
      window.location.reload();
    });
  }

  setupPageTransitions();

  // Lance la synchronisation asynchrone non-bloquante
  syncCloudDataAndRefresh();

  // ============================================================
  // Bouton de retour en haut (Back to Top)
  // ============================================================
  const backToTop = document.createElement('button');
  backToTop.id = 'back-to-top';
  backToTop.className = 'btn-back-to-top';
  backToTop.setAttribute('aria-label', 'Remonter en haut');
  backToTop.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ============================================================
  // Gestes Mobile (Swipe Back)
  // ============================================================
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });
  
  function handleSwipeGesture() {
    // Si la lightbox est ouverte, on ignore le geste de swipe (pour éviter les retours involontaires pendant le zoom/déplacement)
    if (document.querySelector('.lightbox')) {
      return;
    }
    // Swipe droite d'au moins 100px pour un effet de retour natif
    if (touchEndX - touchStartX > 100) {
      if (document.body.getAttribute('data-page') !== 'home') {
        window.history.back();
      }
    }
  }

  // ============================================================
  // Statistiques de visites (Firebase)
  // ============================================================
  function trackVisit() {
    if (sessionStorage.getItem('visit_tracked') === 'true') return;
    if (typeof db === 'undefined' || !db) return;
    try {
      db.collection('stats').doc('visits').set({
        count: firebase.firestore.FieldValue.increment(1),
        last_visit: new Date().toISOString()
      }, { merge: true }).then(() => {
        sessionStorage.setItem('visit_tracked', 'true');
      }).catch(err => console.log('Stats ignorées:', err.message));
    } catch(e) {}
  }
  
  // Attendre un peu avant d'enregistrer pour éviter les bots
  setTimeout(trackVisit, 2000);

})();
