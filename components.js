// ============================================================
// thesouscote — Composants partagés (nav, footer, ⌘K)
// Un seul fichier à modifier pour toutes les pages.
// ============================================================

(function () {
  'use strict';

  // ─── Logo SVG ───
  const LOGO_SVG = `
    <svg class="logo-svg" width="572" height="572" viewBox="0 0 572 572.004" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="thesouscote">
      <path class="logo-arrow logo-arrow--top" d="M285.999 0L411.949 188.789H319.191V332.495H252.807V188.789H160.05L285.999 0Z" fill="currentColor"/>
      <path class="logo-arrow logo-arrow--left" d="M251.898 428.299L125.949 239.509L0 428.299H92.7567V572.004H159.141V428.299H251.898Z" fill="currentColor"/>
      <path class="logo-arrow logo-arrow--right" d="M446.052 239.509L572.001 428.299H479.245V572.004H412.86V428.299H320.103L446.052 239.509Z" fill="currentColor"/>
    </svg>`;

  // ─── Icônes SVG ───
  const ICON_SUN = `<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
  const ICON_MOON = `<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

  // ─── Liens de navigation ───
  const NAV_LINKS = [
    { href: 'index.html', nav: 'home', i18n: 'nav.home', label: 'Accueil', aria: 'Aller à l\'accueil' },
    { href: 'experience.html', nav: 'experience', i18n: 'nav.experience', label: 'Expérience', aria: 'Voir mon expérience' },
    { href: 'projects.html', nav: 'projects', i18n: 'nav.projects', label: 'Projets', aria: 'Voir mes projets' },
    { href: 'market.html', nav: 'resources', i18n: 'nav.resources', label: 'Market', aria: 'Visiter le market' },
    { href: 'collecte.html', nav: 'collecte', i18n: '', label: 'Collecte', aria: 'Espace de collecte' },
    { href: 'draft.html', nav: 'draft', i18n: 'nav.draft', label: 'Draft', aria: 'Voir les projets en draft' },
    { href: 'contact.html', nav: 'contact', i18n: 'nav.contact', label: 'Contact', aria: 'Me contacter' },
    { href: 'about.html', nav: 'about', i18n: 'nav.about', label: 'À propos', aria: 'En savoir plus sur moi' },
  ];

  // ─── Liens du Command Palette ───
  const CMDK_LINKS = [
    { href: 'index.html', label: 'Accueil' },
    { href: 'experience.html', label: 'Expérience' },
    { href: 'projects.html', label: 'Projets' },
    { href: 'market.html', label: 'Market' },
    { href: 'collecte.html', label: 'Collecte' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'draft.html', label: 'Draft' },
    { href: 'about.html', label: 'À propos' },
  ];

  // ─── 1. Injection de la Navigation ───
  const navEl = document.getElementById('site-nav');
  if (navEl) {
    const linksHTML = NAV_LINKS.map(link => {
      const i18nAttr = link.i18n ? ` data-i18n="${link.i18n}"` : '';
      const ariaAttr = link.aria ? ` aria-label="${link.aria}"` : '';
      return `<li><a href="${link.href}" data-nav="${link.nav}"${i18nAttr}${ariaAttr}>${link.label}</a></li>`;
    }).join('\n        ');

    navEl.className = 'nav';
    navEl.innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="brand">${LOGO_SVG}</a>
      <ul class="nav-links" id="nav-links" role="menubar">
        ${linksHTML}
      </ul>
      <div class="nav-actions">
        <button id="theme-toggle" class="theme-toggle" aria-label="Basculer entre mode clair et sombre" aria-pressed="false">
          ${ICON_SUN}
          ${ICON_MOON}
        </button>
        <button class="menu-toggle" aria-label="Ouvrir le menu de navigation" aria-expanded="false" aria-controls="nav-links">
          ${ICON_MENU}
        </button>
      </div>
    </div>
    <div class="nav-overlay" id="nav-overlay" aria-hidden="true"></div>`;
  }

  // ─── 2. Injection du Footer ───
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.className = 'footer';
    footerEl.innerHTML = `
    <div class="container">
      <p>© <span id="year">${new Date().getFullYear()}</span> thesouscote</p>
    </div>`;
  }

  // ─── 3. Injection des Breadcrumbs (SEO) ───
  const breadcrumbEl = document.getElementById('breadcrumb');
  if (breadcrumbEl) {
    const currentPage = document.body.getAttribute('data-page');
    const breadcrumbItems = [
      { href: 'index.html', label: 'Accueil' }
    ];
    
    if (currentPage === 'about') {
      breadcrumbItems.push({ href: 'about.html', label: 'À propos' });
    } else if (currentPage === 'projects') {
      breadcrumbItems.push({ href: 'projects.html', label: 'Projets' });
    } else if (currentPage === 'resources') {
      breadcrumbItems.push({ href: 'market.html', label: 'Market' });
    } else if (currentPage === 'contact') {
      breadcrumbItems.push({ href: 'contact.html', label: 'Contact' });
    } else if (currentPage === 'experience') {
      breadcrumbItems.push({ href: 'experience.html', label: 'Expérience' });
    } else if (currentPage === 'project-detail') {
      breadcrumbItems.push({ href: 'projects.html', label: 'Projets' });
      breadcrumbItems.push({ href: window.location.href, label: 'Détails' });
    } else if (currentPage === 'resources') {
      breadcrumbItems.push({ href: 'market.html', label: 'Market' });
      breadcrumbItems.push({ href: window.location.href, label: 'Détails' });
    }
    
    const breadcrumbHTML = breadcrumbItems.map((item, index) => {
      const isLast = index === breadcrumbItems.length - 1;
      return isLast 
        ? `<span aria-current="page">${item.label}</span>`
        : `<a href="${item.href}">${item.label}</a><span aria-hidden="true">/</span>`;
    }).join('');
    
    breadcrumbEl.innerHTML = `<nav aria-label="Fil d'arianne">${breadcrumbHTML}</nav>`;
  }

  // ─── 4. Injection du Command Palette (⌘K) ───
  const cmdkEl = document.getElementById('cmdk');
  if (cmdkEl) {
    const cmdkLinksHTML = CMDK_LINKS.map(link =>
      `<li><a href="${link.href}" data-cmdk-item role="option" tabindex="-1">${link.label}</a></li>`
    ).join('\n        ');

    cmdkEl.className = 'cmdk';
    cmdkEl.setAttribute('aria-hidden', 'true');
    cmdkEl.innerHTML = `
    <div class="cmdk-backdrop" data-cmdk-close aria-hidden="true"></div>
    <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Command palette - Navigation rapide">
      <input id="cmdk-input" type="text" class="cmdk-input" placeholder="Aller à…" autocomplete="off" data-i18n-attr="placeholder:cmdk.placeholder" aria-label="Rechercher une page" />
      <ul id="cmdk-list" class="cmdk-list" role="listbox">
        ${cmdkLinksHTML}
      </ul>
      <div class="cmdk-hint" data-i18n="cmdk.hint" aria-live="polite">↵ pour valider · esc pour fermer · ⌘K pour ouvrir</div>
    </div>`;
  }
})();
