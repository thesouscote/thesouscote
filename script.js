// ============================================================
// thesouscote — portfolio scripts
// ============================================================
(function () {
  const root = document.documentElement;

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
      'projects.title': 'Projets sélectionnés',
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
      'contact.or': '— ou par email direct —',
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
    },
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.experience': 'Experience',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.draft': 'Draft',
      'nav.resources': 'Resources',
      'resources.title': 'Resources',
      'resources.intro': 'Free logos, custom work, cards and stickers. Things I make on the side.',
      'resources.all': 'All',
      'resources.logo': 'Logos',
      'resources.carte': 'Graphic cards',
      'resources.sticker': 'Stickers',
      'resources.free': 'Free',
      'resources.buy': 'Order →',
      'resources.download': 'Download →',
      'resources.empty': 'No resources in this category.',
      'hero.eyebrow': "Hi, I'm",
      'hero.subtitle': 'Designer & developer. I craft simple, elegant and useful experiences.',
      'hero.cta1': 'See my work',
      'hero.cta2': 'Get in touch →',
      'about.title': 'About',
      'about.text': "I'm <strong>Moke Patrick Armel</strong>. Passionate about minimal design, I love crafting clear, accessible products with attention to every detail. My approach: less, but better.",
      'about.skill1': 'UI/UX Design',
      'about.skill2': 'HTML · CSS · JavaScript',
      'about.skill3': 'Typography',
      'about.skill4': 'Prototyping',
      'about.cv': 'Download my CV ↓',
      'about.playlist': 'What I listen to',
      'experience.title': 'Experience',
      'experience.date1': '2024 — Present',
      'experience.role1': 'Independent designer & developer',
      'experience.desc1': 'Designing and building websites and visual identities.',
      'experience.date2': '2022 — 2024',
      'experience.role2': 'Personal project — thesouscote',
      'experience.desc2': 'Content creation, streaming and creative exploration.',
      'experience.date3': 'Before 2022',
      'experience.role3': 'Learning',
      'experience.desc3': 'Discovering design, code and typography.',
      'projects.title': 'Selected work',
      'projects.desc': 'A short description of the project, its goal and outcome.',
      'projects.link': 'Learn more →',
      'contact.title': "Let's work together",
      'contact.text': 'A project, an idea, or just want to chat?',
      'contact.name': 'Name',
      'contact.subject': 'Subject',
      'contact.message': 'Message',
      'contact.send': 'Send →',
      'contact.sending': 'Sending…',
      'contact.success': 'Message sent! I\'ll get back to you soon.',
      'contact.error': 'Something went wrong. Please try again.',
      'contact.or': '— or by email —',
      'draft.title': 'Draft',
      'draft.text': 'Old projects, drafts and abandoned ideas. Nothing is lost, everything recycles.',
      'draft.item1': 'abandoned out of laziness',
      'draft.item3': "to revisit some day, maybe",
      '404.title': 'Page not found',
      '404.text': 'Maybe it\'s in the Draft?',
      '404.cta': 'Back home',
      'cmdk.placeholder': 'Go to…',
      'cmdk.hint': '↵ to confirm · esc to close · ⌘K to open',
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
        return `
        <a href="project-detail.html#${p.id}" class="card project-card reveal" style="text-decoration: none; color: inherit; display: block;">
          <div class="card-media">${imgUrl ? `<img src="${imgUrl}" alt="${p.title}" loading="lazy" />` : ''}</div>
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

    // Source : localStorage (admin) sinon fetch JSON
    const localData = localStorage.getItem('projects');
    if (localData) {
      try { renderProjects(JSON.parse(localData).projects || []); }
      catch { /* ignore */ }
    } else {
      fetch('projects.json')
        .then((r) => r.json())
        .then((data) => renderProjects(data.projects || []))
        .catch(() => { projectsGrid.innerHTML = '<p>Impossible de charger les projets.</p>'; });
    }
  }

  // ============================================================
  // Rendu dynamique — À propos (depuis admin localStorage)
  // ============================================================
  const aboutBio = document.getElementById('about-bio');
  if (aboutBio) {
    try {
      const data = JSON.parse(localStorage.getItem('admin_about'));
      if (data) {
        const lang = getLang();
        // Bio
        aboutBio.innerHTML = lang === 'en' ? data.bioEn : data.bioFr;
        // Skills
        const skillsList = document.getElementById('about-skills');
        if (skillsList && data.skills) {
          skillsList.innerHTML = data.skills.map(s =>
            `<li>${lang === 'en' ? s.en : s.fr}</li>`
          ).join('');
        }
        // CV link
        const cvLink = document.getElementById('about-cv-link');
        if (cvLink && data.cv) cvLink.href = data.cv;
      }
    } catch { /* ignore */ }
  }

  // ============================================================
  // Rendu dynamique — Expérience (depuis admin localStorage)
  // ============================================================
  const expTimeline = document.getElementById('experience-timeline');
  if (expTimeline) {
    try {
      const items = JSON.parse(localStorage.getItem('admin_experience'));
      if (items && items.length) {
        const lang = getLang();
        expTimeline.innerHTML = items.map(it => `
          <li class="timeline-item reveal">
            <div class="timeline-date">${lang === 'en' ? it.dateEn : it.dateFr}</div>
            <div class="timeline-body">
              <h3>${lang === 'en' ? it.roleEn : it.roleFr}</h3>
              <p>${lang === 'en' ? it.descEn : it.descFr}</p>
            </div>
          </li>
        `).join('');
        // re-observe reveals
        observeNewReveals(expTimeline);
      }
    } catch { /* ignore */ }
  }

  // ============================================================
  // Rendu dynamique — Contact (depuis admin localStorage)
  // ============================================================
  const contactEmail = document.getElementById('contact-email-link');
  if (contactEmail) {
    try {
      const data = JSON.parse(localStorage.getItem('admin_contact'));
      if (data) {
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
      }
    } catch { /* ignore */ }
  }

  // ============================================================
  // Rendu dynamique — Draft (depuis admin localStorage)
  // ============================================================
  const draftList = document.getElementById('draft-list');
  const renderDraft = () => {
    if (!draftList) return;
    try {
      const items = JSON.parse(localStorage.getItem('admin_trash'));
      if (items && items.length) {
        const lang = getLang();
        draftList.innerHTML = items.map(it =>
          `<li><span>${it.name}</span> — ${lang === 'en' ? it.noteEn : it.noteFr}</li>`
        ).join('');
      }
    } catch { /* ignore */ }
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
    const WAVE_NUMBER = '+22500000000'; // Ton numéro Wave
    const PAYPAL_LINK = 'https://paypal.me/thesouscote'; // Ton lien PayPal.me

    const getPaymentLink = (title, price) => {
      if (isEuroZone) {
        const eur = (price * XOF_TO_EUR).toFixed(2);
        return `${PAYPAL_LINK}/${eur}EUR`;
      }
      return `https://pay.wave.com/m/${WAVE_NUMBER}?amount=${price}&currency=XOF`;
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
    t filtered = allResources.filter((r) => {
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
        return `
          <a href="market-detail.html#${r.id}" class="card resource-card reveal is-visible" style="text-decoration: none; color: inherit; display: block;">
            <div class="card-media">${r.image ? `<img src="${r.image}" alt="${r.title}" loading="lazy" />` : ''}</div>
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

    // Source : localStorage en priorité, sinon fetch JSON. Fallback fetch si vide.
    const fetchResources = () => {
      fetch('market.json')
        .then((r) => r.json())
        .then((data) => { allResources = data.resources || []; renderResources(); })
        .catch(() => { resourcesGrid.innerHTML = '<p class="empty-state">Impossible de charger le market.</p>'; });
    };
    const localData = localStorage.getItem('admin_resources');
    let usedLocal = false;
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed && Array.isArray(parsed.resources) && parsed.resources.length) {
          allResources = parsed.resources;
          renderResources();
          usedLocal = true;
        }
      } catch { /* ignore */ }
    }
    if (!usedLocal) fetchResources();
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
              const lb = document.createElement('div');
              lb.className = 'lightbox';
              lb.innerHTML = `<img src="${img.src}" alt="${img.alt}" />`;
              const closeLb = () => {
                if (lb.classList.contains('is-closing')) return;
                lb.classList.add('is-closing');
                setTimeout(() => lb.remove(), 300);
              };
              lb.addEventListener('click', closeLb);
              document.addEventListener('keydown', function esc(e) {
                if (e.key === 'Escape') { closeLb(); document.removeEventListener('keydown', esc); }
              });
              document.body.appendChild(lb);
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

    // Load from local storage or json
    const localData = localStorage.getItem('projects');
    let projLoaded = false;
    if (localData) {
      try {
        const list = JSON.parse(localData).projects || [];
        const found = list.find(x => x.id === projId);
        if (found) {
          renderDetail(found);
          projLoaded = true;
        }
      } catch { /* ignore */ }
    }
    if (!projLoaded) {
      fetch('projects.json')
        .then((r) => r.json())
        .then((data) => {
          const list = data.projects || [];
          const found = list.find(x => x.id === projId);
          renderDetail(found);
        })
        .catch(() => { projTitle.textContent = "Erreur de chargement"; });
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
          const lb = document.createElement('div');
          lb.className = 'lightbox';
          lb.innerHTML = `<img src="${imgEl.src}" alt="${imgEl.alt}" />`;
          const closeLb = () => {
            if (lb.classList.contains('is-closing')) return;
            lb.classList.add('is-closing');
            setTimeout(() => lb.remove(), 300);
          };
          lb.addEventListener('click', closeLb);
          document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { closeLb(); document.removeEventListener('keydown', esc); }
          });
          document.body.appendChild(lb);
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
          ctaEl.innerHTML = `<a href="${r.link || '#'}" class="btn btn-primary">${lang === 'fr' ? 'T\u00e9l\u00e9charger gratuitement' : 'Download for free'} \u2193</a>`;
        } else {
          let payLink;
          if (isEuro) {
            const eur = (r.price * RATE).toFixed(2);
            payLink = `${PAYPAL}/${eur}EUR`;
          } else {
            payLink = `https://pay.wave.com/m/${WAVE_NUM}?amount=${r.price}&currency=XOF`;
          }
          ctaEl.innerHTML = `
            <a href="${payLink}" target="_blank" rel="noopener" class="btn btn-primary">${lang === 'fr' ? 'Acheter maintenant' : 'Buy now'} \u2192</a>
            <a href="contact.html?subject=${encodeURIComponent(r.title)}" class="btn btn-ghost">${lang === 'fr' ? 'Poser une question' : 'Ask a question'}</a>
          `;
        }
      }
    };

    const localRes = localStorage.getItem('admin_resources');
    let resLoaded = false;
    if (localRes) {
      try {
        const parsed = JSON.parse(localRes);
        if (parsed && Array.isArray(parsed.resources) && parsed.resources.length) {
          const found = parsed.resources.find(x => x.id === resId);
          if (found) {
            renderResourceDetail(found);
            resLoaded = true;
          }
        }
      } catch { /* ignore */ }
    }
    if (!resLoaded) {
      fetch('market.json')
        .then(resp => resp.json())
        .then(data => {
          const found = (data.resources || []).find(x => x.id === resId);
          renderResourceDetail(found);
        })
        .catch(() => { resTitle.textContent = 'Erreur de chargement'; });
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

      // 1. Charger DYNAMIQUEMENT depuis Supabase (Cloud) ou localStorage
      let DELIVERIES = {};
      let loadedFromCloud = false;

      if (supabase) {
        try {
          const { data, error } = await supabase.from('deliveries').select('*');
          if (!error && data) {
            data.forEach(d => {
              DELIVERIES[d.code.toUpperCase()] = d;
            });
            loadedFromCloud = true;
          }
        } catch (err) {
          console.error("Erreur de recherche Supabase, repli sur LocalStorage...", err);
        }
      }

      // Repli sur le stockage local si Supabase non connecté ou en erreur
      if (!loadedFromCloud) {
        const localDel = localStorage.getItem('admin_deliveries');
        if (localDel) {
          try {
            const parsed = JSON.parse(localDel).deliveries || [];
            parsed.forEach(d => {
              DELIVERIES[d.code.toUpperCase()] = d;
            });
          } catch { /* ignore */ }
        }
      }

      // 2. Si le stockage complet est vide, utiliser les démos
      if (Object.keys(DELIVERIES).length === 0) {
        DELIVERIES = DEMO_DELIVERIES;
      }

      // Nettoie le message de recherche
      statusEl.textContent = "";
      statusEl.style.color = "#e0245e";

      console.log("Recherche du code :", code, "parmi les codes chargés :", Object.keys(DELIVERIES));

      const delivery = DELIVERIES[code];
      if (delivery) {
        document.getElementById('delivery-client').textContent = "Créations : " + delivery.client;
        document.getElementById('delivery-date').textContent = "Livré le " + delivery.date;
        document.getElementById('delivery-notes').textContent = delivery.notes;

        const filesContainer = document.getElementById('delivery-files');
        filesContainer.innerHTML = (delivery.files || []).map(file => `
          <li class="delivery-file-item">
            <div>
              <div class="delivery-file-name">${file.name}</div>
              <div class="delivery-file-size">${file.size || 'Prêt'}</div>
            </div>
            <a href="${file.url}" download class="btn btn-primary" style="padding: 6px 14px; font-size: 13px;">Télécharger</a>
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
  // Synchronisation Cloud Supabase en arrière-plan (CMS Global)
  // ============================================================
  async function syncCloudDataAndRefresh() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('portfolio_data').select('*');
      if (!error && data) {
        let hasChanges = false;
        data.forEach(row => {
          const localVal = localStorage.getItem(row.key);
          const newValString = JSON.stringify(row.value);
          if (localVal !== newValString) {
            localStorage.setItem(row.key, newValString);
            hasChanges = true;
          }
        });
        
        // Si des changements sont détectés, on met à jour l'affichage en direct sans recharger !
        if (hasChanges) {
          console.log("[Supabase Cloud] Données mises à jour, rafraîchissement dynamique...");
          
          // Rafraîchit les Projets si on est sur la grille des projets
          const targetProjectsGrid = document.getElementById('projects-grid');
          if (typeof renderProjects === 'function' && targetProjectsGrid) {
            const localProj = localStorage.getItem('projects');
            if (localProj) {
              try { renderProjects(JSON.parse(localProj).projects || []); } catch {}
            }
          }
          
          // Rafraîchit la Bio et Skills si on est sur la page À propos
          const targetAboutBio = document.getElementById('about-bio');
          if (targetAboutBio) {
            const localAbout = localStorage.getItem('admin_about');
            if (localAbout) {
              try {
                const dataA = JSON.parse(localAbout);
                const lang = getLang();
                targetAboutBio.innerHTML = lang === 'en' ? dataA.bioEn : dataA.bioFr;
                const skillsList = document.getElementById('about-skills');
                if (skillsList && dataA.skills) {
                  skillsList.innerHTML = dataA.skills.map(s => `<li>${lang === 'en' ? s.en : s.fr}</li>`).join('');
                }
              } catch {}
            }
          }
          
          // Rafraîchit la Timeline si on est sur la page Expériences
          const targetExpTimeline = document.getElementById('experience-timeline');
          if (targetExpTimeline) {
            const localExp = localStorage.getItem('admin_experience');
            if (localExp) {
              try {
                const items = JSON.parse(localExp);
                const lang = getLang();
                targetExpTimeline.innerHTML = items.map(it => `
                  <li class="timeline-item reveal">
                    <div class="timeline-date">${lang === 'en' ? it.dateEn : it.dateFr}</div>
                    <div class="timeline-body">
                      <h3>${lang === 'en' ? it.roleEn : it.roleFr}</h3>
                      <p>${lang === 'en' ? it.descEn : it.descFr}</p>
                    </div>
                  </li>
                `).join('');
                observeNewReveals(targetExpTimeline);
              } catch {}
            }
          }

          // Rafraîchit la page Draft
          const targetDraftList = document.getElementById('draft-list');
          if (typeof renderDraft === 'function' && targetDraftList) {
            renderDraft();
          }

          // Rafraîchit le Market
          const targetResourcesGrid = document.getElementById('resources-grid');
          if (typeof renderResources === 'function' && targetResourcesGrid) {
            const localRes = localStorage.getItem('admin_resources');
            if (localRes) {
              try {
                allResources = JSON.parse(localRes).resources || [];
                renderResources();
              } catch {}
            }
          }
        }
      }
    } catch (e) {
      console.error("[Supabase Cloud] Erreur d'actualisation en arrière-plan :", e);
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
})();
