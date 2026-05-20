// ============================================================
// Admin — gestion complète du site
// ============================================================
(function () {
  const PASSWORD = 'Bonjour2026@';

  const gate = document.getElementById('gate');
  const app = document.getElementById('admin-app');
  const gateInput = document.getElementById('gate-input');
  const gateBtn = document.getElementById('gate-btn');
  const gateError = document.getElementById('gate-error');

  // ---------- Helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function newId() { return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('is-visible'), 2600);
  }

  // ---------- Gate ----------
  function unlock() {
    sessionStorage.setItem('admin-ok', '1');
    if (gate) gate.style.display = 'none';
    if (app) app.hidden = false;
    init();
  }
  function tryUnlock() {
    if (gateInput.value === PASSWORD) {
      gateError.textContent = '';
      unlock();
    } else {
      gateError.textContent = 'Mot de passe incorrect.';
      gateInput.value = '';
      gateInput.focus();
    }
  }
  if (sessionStorage.getItem('admin-ok') === '1') {
    unlock();
  } else {
    gateInput?.focus();
    gateBtn?.addEventListener('click', tryUnlock);
    gateInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); tryUnlock(); }
    });
  }

  // ============================================================
  // Init (après login)
  // ============================================================
  function init() {
    initTabs();
    initMobileMenu();
    initLogout();
    initProjects();
    initAbout();
    initExperience();
    initContact();
    initResources();
    initTrash();
    initSettings();
  }

  // ---------- Tabs ----------
  function initTabs() {
    const tabBtns = document.querySelectorAll('.sidebar-link[data-tab]');
    const panels = document.querySelectorAll('.admin-panel[data-panel]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        const panel = document.querySelector(`[data-panel="${btn.dataset.tab}"]`);
        if (panel) panel.classList.add('is-active');
        document.querySelector('.admin-sidebar')?.classList.remove('is-open');
        document.querySelector('.sidebar-overlay')?.classList.remove('is-visible');
      });
    });
  }

  // ---------- Mobile menu ----------
  function initMobileMenu() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'admin-menu-toggle';
    menuToggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    document.body.appendChild(menuToggle);
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    const sidebar = document.querySelector('.admin-sidebar');
    menuToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('is-open');
      overlay.classList.toggle('is-visible');
    });
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    });
  }

  // ---------- Logout ----------
  function initLogout() {
    document.getElementById('admin-logout')?.addEventListener('click', () => {
      sessionStorage.removeItem('admin-ok');
      location.reload();
    });
  }

  // ============================================================
  // PROJETS
  // ============================================================
  function initProjects() {
    const form = document.getElementById('project-form');
    if (!form) return;
    const list = document.getElementById('project-list');
    const count = document.getElementById('count');
    const fId = document.getElementById('f-id');
    const fTitle = document.getElementById('f-title');
    const fTag = document.getElementById('f-tag');
    const fDesc = document.getElementById('f-description');
    const fLink = document.getElementById('f-link');
    const fImage = document.getElementById('f-image');
    const fImageFile = document.getElementById('f-image-file');
    const fGallery1 = document.getElementById('f-gallery-1');
    const fGallery2 = document.getElementById('f-gallery-2');
    const fGallery3 = document.getElementById('f-gallery-3');
    const fGallery4 = document.getElementById('f-gallery-4');
    const fGalleryFile1 = document.getElementById('f-gallery-file-1');
    const fGalleryFile2 = document.getElementById('f-gallery-file-2');
    const fGalleryFile3 = document.getElementById('f-gallery-file-3');
    const fGalleryFile4 = document.getElementById('f-gallery-file-4');
    const fSubmit = document.getElementById('f-submit');
    const fReset = document.getElementById('f-reset');
    const formTitle = document.getElementById('project-form-title');

    const KEY = 'projects';
    let projects = [];

    function save() {
      localStorage.setItem(KEY, JSON.stringify({ projects }));
      render();
    }

    async function load() {
      const local = localStorage.getItem(KEY);
      if (local) {
        try { projects = JSON.parse(local).projects || []; }
        catch { projects = []; }
      } else {
        try {
          const r = await fetch('projects.json');
          const d = await r.json();
          projects = d.projects || [];
        } catch { projects = []; }
      }
      render();
    }

    function render() {
      count.textContent = projects.length;
      if (!projects.length) {
        list.innerHTML = '<li class="admin-empty">Aucun projet.</li>';
        return;
      }
      list.innerHTML = projects.map(p => `
          <li class="admin-item">
            <div class="admin-item-thumb">${p.image ? `<img src="${typeof p.image === 'object' && p.image.url ? esc(p.image.url) : esc(p.image)}" alt="">` : ''}</div>
            <div class="admin-item-body">
              <div class="admin-item-title">${esc(p.title)} ${p.tag ? `<span class="item-tag">${esc(p.tag)}</span>` : ''}</div>
              <div class="admin-item-desc">${esc(p.description)}</div>
            </div>
            <div class="admin-item-actions">
              <button type="button" data-edit="${p.id}" class="btn btn-ghost btn-sm">Modifier</button>
              <button type="button" data-del="${p.id}" class="btn btn-ghost btn-sm btn-del">×</button>
            </div>
          </li>`).join('');
      list.querySelectorAll('[data-edit]').forEach(b =>
        b.addEventListener('click', () => editP(b.dataset.edit)));
      list.querySelectorAll('[data-del]').forEach(b =>
        b.addEventListener('click', () => delP(b.dataset.del)));
    }

    function editP(id) {
      const p = projects.find(x => x.id === id);
      if (!p) return;
      fId.value = p.id;
      fTitle.value = p.title || '';
      fTag.value = p.tag || '';
      fDesc.value = p.description || '';
      fLink.value = p.link || '';
      if (p.image) {
        if (typeof p.image === 'object') {
          fImage.value = p.image.url || '';
          document.getElementById('f-image-downloadable').checked = p.image.downloadable !== false;
        } else {
          fImage.value = p.image;
          document.getElementById('f-image-downloadable').checked = true;
        }
      } else {
        fImage.value = '';
        document.getElementById('f-image-downloadable').checked = true;
      }
      if (fGallery1) {
        const gallery = p.gallery || [];
        const inputs = [
          { urlInput: fGallery1, dlInput: document.getElementById('f-gallery-downloadable-1') },
          { urlInput: fGallery2, dlInput: document.getElementById('f-gallery-downloadable-2') },
          { urlInput: fGallery3, dlInput: document.getElementById('f-gallery-downloadable-3') },
          { urlInput: fGallery4, dlInput: document.getElementById('f-gallery-downloadable-4') }
        ];
        inputs.forEach((pair, idx) => {
          const item = gallery[idx];
          if (item) {
            pair.urlInput.value = item.url || '';
            pair.dlInput.checked = item.downloadable !== false;
          } else {
            pair.urlInput.value = '';
            pair.dlInput.checked = true;
          }
        });
      }
      fSubmit.textContent = 'Mettre à jour';
      formTitle.textContent = 'Modifier le projet';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function delP(id) {
      if (!confirm('Supprimer ce projet ?')) return;
      projects = projects.filter(p => p.id !== id);
      save();
      toast('Projet supprimé');
    }

    function resetForm() {
      form.reset();
      fId.value = '';
      fImage.value = '';
      const imgDl = document.getElementById('f-image-downloadable');
      if (imgDl) imgDl.checked = true;
      if (fGallery1) {
        fGallery1.value = '';
        fGallery2.value = '';
        fGallery3.value = '';
        fGallery4.value = '';
        const dlIds = ['f-gallery-downloadable-1','f-gallery-downloadable-2','f-gallery-downloadable-3','f-gallery-downloadable-4'];
        dlIds.forEach(id => { const cb = document.getElementById(id); if (cb) cb.checked = true; });
      }
      fSubmit.textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter un projet';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const gallery = [];
      if (fGallery1) {
        const galleryInputs = [
          { urlInput: fGallery1, dlInput: document.getElementById('f-gallery-downloadable-1') },
          { urlInput: fGallery2, dlInput: document.getElementById('f-gallery-downloadable-2') },
          { urlInput: fGallery3, dlInput: document.getElementById('f-gallery-downloadable-3') },
          { urlInput: fGallery4, dlInput: document.getElementById('f-gallery-downloadable-4') }
        ];
        galleryInputs.forEach(pair => {
          const url = pair.urlInput.value.trim();
          if (url) {
            const downloadable = pair.dlInput?.checked ?? true;
            gallery.push({ url, downloadable });
          }
        });
      }
      const imageDownloadable = document.getElementById('f-image-downloadable')?.checked ?? true;
      const data = {
        id: fId.value || newId(),
        title: fTitle.value.trim(),
        description: fDesc.value.trim(),
        tag: fTag.value.trim(),
        link: fLink.value.trim() || '#',
        image: fImage.value.trim() ? { url: fImage.value.trim(), downloadable: imageDownloadable } : '',
        gallery: gallery
      };
      const isUpdate = !!fId.value;
      if (isUpdate) {
        const idx = projects.findIndex(p => p.id === fId.value);
        if (idx >= 0) projects[idx] = data;
        toast('Projet mis à jour');
      } else {
        projects.unshift(data);
        toast('Projet ajouté');
      }
      save();
      if (!isUpdate) {
        resetForm();
      }
    });

    fReset.addEventListener('click', resetForm);

    fImageFile?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { fImage.value = reader.result; };
      reader.readAsDataURL(file);
    });

    const bindGalleryFile = (fileInput, textInput) => {
      fileInput?.addEventListener('change', e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { textInput.value = reader.result; };
        reader.readAsDataURL(file);
      });
    };
    bindGalleryFile(fGalleryFile1, fGallery1);
    bindGalleryFile(fGalleryFile2, fGallery2);
    bindGalleryFile(fGalleryFile3, fGallery3);
    bindGalleryFile(fGalleryFile4, fGallery4);

    document.getElementById('export-btn')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ projects }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'projects.json';
      a.click();
      toast('projects.json exporté');
    });

    document.getElementById('import-file')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const d = JSON.parse(reader.result);
          projects = d.projects || [];
          save();
          toast('Import réussi');
        } catch {
          toast('Fichier invalide');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (!confirm('Réinitialiser tous les projets ?')) return;
      localStorage.removeItem(KEY);
      load();
      toast('Projets réinitialisés');
    });

    load();
  }

  // ============================================================
  // À PROPOS
  // ============================================================
  function initAbout() {
    const form = document.getElementById('about-form');
    if (!form) return;
    const KEY = 'admin_about';

    const defaults = {
      bioFr: "Je m'appelle <strong>Moke Patrick Armel</strong>. Passionné par le design minimaliste, j'aime concevoir des produits clairs, accessibles et soignés dans le moindre détail. Mon approche : moins, mais mieux.",
      skills: [
        { fr: 'Design UI/UX', en: 'UI/UX Design' },
        { fr: 'HTML · CSS · JavaScript', en: 'HTML · CSS · JavaScript' },
        { fr: 'Typographie', en: 'Typography' },
        { fr: 'Prototypage', en: 'Prototyping' }
      ],
      cv: 'assets/cv.pdf'
    };

    let data = { ...defaults };
    try {
      const s = localStorage.getItem(KEY);
      if (s) data = { ...defaults, ...JSON.parse(s) };
    } catch {}

    const bioFr = document.getElementById('about-bio-fr');
    const cvInput = document.getElementById('about-cv');
    const skillsList = document.getElementById('skills-list');

    function renderSkills() {
      skillsList.innerHTML = data.skills.map((s, i) => `
        <div class="skill-row" style="display:flex; gap:8px; margin-bottom:8px;">
          <input type="text" value="${esc(s.fr)}" data-idx="${i}" data-lang="fr" placeholder="Compétence" style="flex:1;" />
          <button type="button" class="btn-icon" data-remove="${i}">×</button>
        </div>`).join('');
      skillsList.querySelectorAll('[data-remove]').forEach(b =>
        b.addEventListener('click', () => {
          data.skills.splice(+b.dataset.remove, 1);
          renderSkills();
        }));
      skillsList.querySelectorAll('input').forEach(inp =>
        inp.addEventListener('input', () => {
          data.skills[+inp.dataset.idx][inp.dataset.lang] = inp.value;
        }));
    }

    function populate() {
      bioFr.value = data.bioFr;
      cvInput.value = data.cv;
      renderSkills();
    }

    document.getElementById('add-skill-btn')?.addEventListener('click', () => {
      data.skills.push({ fr: '', en: '' });
      renderSkills();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      data.bioFr = bioFr.value;
      data.cv = cvInput.value;
      localStorage.setItem(KEY, JSON.stringify(data));
      toast('À propos enregistré');
    });

    populate();
  }

  // ============================================================
  // EXPÉRIENCE
  // ============================================================
  function initExperience() {
    const form = document.getElementById('exp-form');
    if (!form) return;
    const KEY = 'admin_experience';

    const defaults = [
      { id:'e1', dateFr:'2024 — Présent', dateEn:'2024 — Present', roleFr:'Designer & développeur indépendant', roleEn:'Independent designer & developer', descFr:'Conception et développement de sites et identités visuelles.', descEn:'Designing and building websites and visual identities.' },
      { id:'e2', dateFr:'2022 — 2024', dateEn:'2022 — 2024', roleFr:'Projet personnel — thesouscote', roleEn:'Personal project — thesouscote', descFr:'Création de contenu, streaming et exploration créative.', descEn:'Content creation, streaming and creative exploration.' },
      { id:'e3', dateFr:'Avant 2022', dateEn:'Before 2022', roleFr:'Apprentissage', roleEn:'Learning', descFr:'Découverte du design, du code et de la typographie.', descEn:'Discovering design, code and typography.' }
    ];

    let items = [];
    try {
      const s = localStorage.getItem(KEY);
      items = s ? JSON.parse(s) : [...defaults];
    } catch { items = [...defaults]; }

    const list = document.getElementById('exp-list');
    const countEl = document.getElementById('exp-count');
    const eId = document.getElementById('exp-id');
    const formTitle = document.getElementById('exp-form-title');

    function save() {
      localStorage.setItem(KEY, JSON.stringify(items));
      render();
    }

    function render() {
      countEl.textContent = items.length;
      if (!items.length) {
        list.innerHTML = '<li class="admin-empty">Aucune expérience.</li>';
        return;
      }
      list.innerHTML = items.map(it => `
        <li class="admin-item admin-item--no-thumb">
          <div class="admin-item-body">
            <div class="admin-item-title">${esc(it.roleFr)}</div>
            <div class="admin-item-desc">${esc(it.dateFr)} — ${esc(it.descFr)}</div>
          </div>
          <div class="admin-item-actions">
            <button type="button" data-eedit="${it.id}" class="btn btn-ghost btn-sm">Modifier</button>
            <button type="button" data-edel="${it.id}" class="btn btn-ghost btn-sm btn-del">×</button>
          </div>
        </li>`).join('');
      list.querySelectorAll('[data-eedit]').forEach(b =>
        b.addEventListener('click', () => editE(b.dataset.eedit)));
      list.querySelectorAll('[data-edel]').forEach(b =>
        b.addEventListener('click', () => {
          if (!confirm('Supprimer ?')) return;
          items = items.filter(x => x.id !== b.dataset.edel);
          save();
          toast('Supprimé');
        }));
    }

    function editE(id) {
      const it = items.find(x => x.id === id);
      if (!it) return;
      eId.value = it.id;
      document.getElementById('exp-date-fr').value = it.dateFr || '';
      document.getElementById('exp-role-fr').value = it.roleFr || '';
      document.getElementById('exp-desc-fr').value = it.descFr || '';
      document.getElementById('exp-submit').textContent = 'Mettre à jour';
      formTitle.textContent = "Modifier l'expérience";
      form.scrollIntoView({ behavior: 'smooth' });
    }

    function resetForm() {
      form.reset();
      eId.value = '';
      document.getElementById('exp-submit').textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter une expérience';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = {
        id: eId.value || newId(),
        dateFr: document.getElementById('exp-date-fr').value.trim(),
        dateEn: '',
        roleFr: document.getElementById('exp-role-fr').value.trim(),
        roleEn: '',
        descFr: document.getElementById('exp-desc-fr').value.trim(),
        descEn: ''
      };
      if (eId.value) {
        const idx = items.findIndex(x => x.id === eId.value);
        if (idx >= 0) items[idx] = d;
        toast('Mis à jour');
      } else {
        items.unshift(d);
        toast('Ajouté');
      }
      save();
      resetForm();
    });

    document.getElementById('exp-reset')?.addEventListener('click', resetForm);
    render();
  }

  // ============================================================
  // CONTACT
  // ============================================================
  function initContact() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const KEY = 'admin_contact';

    const defaults = {
      email: 'thesouscote@gmail.com',
      web3forms: '',
      socials: [
        { name: 'Instagram', url: 'https://instagram.com/' },
        { name: 'GitHub', url: 'https://github.com/' },
        { name: 'Twitch', url: 'https://twitch.tv/' },
        { name: 'YouTube', url: 'https://youtube.com/' }
      ]
    };

    let data = { ...defaults };
    try {
      const s = localStorage.getItem(KEY);
      if (s) data = { ...defaults, ...JSON.parse(s) };
    } catch {}

    const emailInput = document.getElementById('contact-email');
    const web3formsInput = document.getElementById('contact-web3forms');
    const socialsList = document.getElementById('socials-list');

    function renderSocials() {
      socialsList.innerHTML = data.socials.map((s, i) => `
        <div class="social-row">
          <input type="text" value="${esc(s.name)}" data-idx="${i}" data-field="name" placeholder="Nom" />
          <input type="url" value="${esc(s.url)}" data-idx="${i}" data-field="url" placeholder="https://…" />
          <button type="button" class="btn-icon" data-sremove="${i}">×</button>
        </div>`).join('');
      socialsList.querySelectorAll('[data-sremove]').forEach(b =>
        b.addEventListener('click', () => {
          data.socials.splice(+b.dataset.sremove, 1);
          renderSocials();
        }));
      socialsList.querySelectorAll('input').forEach(inp =>
        inp.addEventListener('input', () => {
          data.socials[+inp.dataset.idx][inp.dataset.field] = inp.value;
        }));
    }

    function populate() {
      emailInput.value = data.email;
      if (web3formsInput) web3formsInput.value = data.web3forms || '';
      renderSocials();
    }

    document.getElementById('add-social-btn')?.addEventListener('click', () => {
      data.socials.push({ name: '', url: '' });
      renderSocials();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      data.email = emailInput.value.trim();
      if (web3formsInput) data.web3forms = web3formsInput.value.trim();
      localStorage.setItem(KEY, JSON.stringify(data));
      toast('Contact enregistré');
    });

    populate();
  }

  // ============================================================
  // MARKET
  // ============================================================
  function initResources() {
    const form = document.getElementById('resource-form');
    if (!form) return;
    const list = document.getElementById('resource-list');
    const count = document.getElementById('r-count');
    const rId = document.getElementById('r-id');
    const rTitle = document.getElementById('r-title');
    const rTag = document.getElementById('r-tag');
    const rDesc = document.getElementById('r-description');
    const rCategory = document.getElementById('r-category');
    const rPrice = document.getElementById('r-price');
    const rLink = document.getElementById('r-link');
    const rImage = document.getElementById('r-image');
    const rImageFile = document.getElementById('r-image-file');
    const rSubmit = document.getElementById('r-submit');
    const rReset = document.getElementById('r-reset');
    const formTitle = document.getElementById('resource-form-title');

    const KEY = 'admin_resources';
    let resources = [];

    function save() {
      localStorage.setItem(KEY, JSON.stringify({ resources }));
      render();
    }

    async function load() {
      const local = localStorage.getItem(KEY);
      if (local) {
        try { resources = JSON.parse(local).resources || []; }
        catch { resources = []; }
      } else {
        try {
          const r = await fetch('market.json');
          const d = await r.json();
          resources = d.resources || [];
        } catch { resources = []; }
      }
      render();
    }

    function priceLabel(p) {
      return (!p || p === 0) ? 'Gratuit' : (new Intl.NumberFormat('fr-FR').format(p) + ' FCFA');
    }

    function render() {
      count.textContent = resources.length;
      if (!resources.length) {
        list.innerHTML = '<li class="admin-empty">Aucun élément dans le market.</li>';
        return;
      }
      list.innerHTML = resources.map(r => `
        <li class="admin-item">
          <div class="admin-item-thumb">${r.image ? `<img src="${esc(r.image)}" alt="">` : ''}</div>
          <div class="admin-item-body">
            <div class="admin-item-title">
              ${esc(r.title)}
              ${r.tag ? `<span class="item-tag">${esc(r.tag)}</span>` : ''}
              <span class="item-tag">${esc(r.category)}</span>
              <span class="item-tag">${esc(priceLabel(r.price))}</span>
            </div>
            <div class="admin-item-desc">${esc(r.description)}</div>
          </div>
          <div class="admin-item-actions">
            <button type="button" data-redit="${r.id}" class="btn btn-ghost btn-sm">Modifier</button>
            <button type="button" data-rdel="${r.id}" class="btn btn-ghost btn-sm btn-del">×</button>
          </div>
        </li>`).join('');
      list.querySelectorAll('[data-redit]').forEach(b =>
        b.addEventListener('click', () => editR(b.dataset.redit)));
      list.querySelectorAll('[data-rdel]').forEach(b =>
        b.addEventListener('click', () => delR(b.dataset.rdel)));
    }

    function editR(id) {
      const r = resources.find(x => x.id === id);
      if (!r) return;
      rId.value = r.id;
      rTitle.value = r.title || '';
      rTag.value = r.tag || '';
      rDesc.value = r.description || '';
      rCategory.value = r.category || 'logo';
      rPrice.value = r.price || 0;
      rLink.value = r.link || '';
      rImage.value = r.image || '';
      rSubmit.textContent = 'Mettre à jour';
      formTitle.textContent = 'Modifier l\'élément';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function delR(id) {
      if (!confirm('Supprimer cet élément ?')) return;
      resources = resources.filter(x => x.id !== id);
      save();
      toast('Élément supprimé');
    }

    function resetForm() {
      form.reset();
      rId.value = '';
      rImage.value = '';
      rPrice.value = '';
      rSubmit.textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter au market';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = {
        id: rId.value || newId(),
        title: rTitle.value.trim(),
        description: rDesc.value.trim(),
        tag: rTag.value.trim(),
        category: rCategory.value,
        price: Number(rPrice.value) || 0,
        link: rLink.value.trim() || '#',
        image: rImage.value.trim()
      };
      const isUpdate = !!rId.value;
      if (isUpdate) {
        const idx = resources.findIndex(x => x.id === rId.value);
        if (idx >= 0) resources[idx] = data;
        toast('Élément mis à jour');
      } else {
        resources.unshift(data);
        toast('Élément ajouté');
      }
      save();
      if (!isUpdate) {
        resetForm();
      }
    });

    rReset.addEventListener('click', resetForm);

    rImageFile?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { rImage.value = reader.result; };
      reader.readAsDataURL(file);
    });

    document.getElementById('export-res-btn')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ resources }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'resources.json';
      a.click();
      toast('resources.json exporté');
    });

    document.getElementById('import-res-file')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const d = JSON.parse(reader.result);
          resources = d.resources || [];
          save();
          toast('Import réussi');
        } catch {
          toast('Fichier invalide');
        }
      };
      reader.readAsText(file);
    });

    load();
  }

  // ============================================================
  // POUBELLE
  // ============================================================
  function initTrash() {
    const form = document.getElementById('trash-form');
    if (!form) return;
    const KEY = 'admin_trash';

    const defaults = [
      { id:'t1', name:'Projet Alpha', tag:'v1', noteFr:'abandonnée pour cause de flemme', noteEn:'abandoned out of laziness' },
      { id:'t2', name:'Landing page X', tag:'draft', noteFr:'never shipped', noteEn:'never shipped' },
      { id:'t3', name:'App concept', tag:'idea', noteFr:'à reprendre un jour, peut-être', noteEn:'to revisit some day, maybe' }
    ];

    let items = [];
    try {
      const s = localStorage.getItem(KEY);
      items = s ? JSON.parse(s) : [...defaults];
    } catch { items = [...defaults]; }

    const list = document.getElementById('trash-list');
    const countEl = document.getElementById('trash-count');
    const tId = document.getElementById('trash-id');
    const formTitle = document.getElementById('trash-form-title');

    function save() {
      localStorage.setItem(KEY, JSON.stringify(items));
      render();
    }

    function render() {
      countEl.textContent = items.length;
      if (!items.length) {
        list.innerHTML = '<li class="admin-empty">Poubelle vide.</li>';
        return;
      }
      list.innerHTML = items.map(it => `
        <li class="admin-item admin-item--no-thumb">
          <div class="admin-item-body">
            <div class="admin-item-title">${esc(it.name)} ${it.tag ? `<span class="item-tag">${esc(it.tag)}</span>` : ''}</div>
            <div class="admin-item-desc">${esc(it.noteFr)}</div>
          </div>
          <div class="admin-item-actions">
            <button type="button" data-tedit="${it.id}" class="btn btn-ghost btn-sm">Modifier</button>
            <button type="button" data-tdel="${it.id}" class="btn btn-ghost btn-sm btn-del">×</button>
          </div>
        </li>`).join('');
      list.querySelectorAll('[data-tedit]').forEach(b =>
        b.addEventListener('click', () => editT(b.dataset.tedit)));
      list.querySelectorAll('[data-tdel]').forEach(b =>
        b.addEventListener('click', () => {
          if (!confirm('Supprimer ?')) return;
          items = items.filter(x => x.id !== b.dataset.tdel);
          save();
          toast('Supprimé');
        }));
    }

    function editT(id) {
      const it = items.find(x => x.id === id);
      if (!it) return;
      tId.value = it.id;
      document.getElementById('trash-name').value = it.name || '';
      document.getElementById('trash-tag').value = it.tag || '';
      document.getElementById('trash-note-fr').value = it.noteFr || '';
      document.getElementById('trash-note-en').value = it.noteEn || '';
      document.getElementById('trash-submit').textContent = 'Mettre à jour';
      formTitle.textContent = "Modifier l'élément";
      form.scrollIntoView({ behavior: 'smooth' });
    }

    function resetForm() {
      form.reset();
      tId.value = '';
      document.getElementById('trash-submit').textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter un élément';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = {
        id: tId.value || newId(),
        name: document.getElementById('trash-name').value.trim(),
        tag: document.getElementById('trash-tag').value.trim(),
        noteFr: document.getElementById('trash-note-fr').value.trim(),
        noteEn: document.getElementById('trash-note-en').value.trim()
      };
      if (tId.value) {
        const idx = items.findIndex(x => x.id === tId.value);
        if (idx >= 0) items[idx] = d;
        toast('Mis à jour');
      } else {
        items.unshift(d);
        toast('Ajouté');
      }
      save();
      resetForm();
    });

    document.getElementById('trash-reset')?.addEventListener('click', resetForm);
    render();
  }

  // ============================================================
  // PARAMÈTRES
  // ============================================================
  function initSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    const msg = document.getElementById('settings-msg');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const cur = document.getElementById('settings-pw-current').value;
      const nw = document.getElementById('settings-pw-new').value;
      if (cur !== PASSWORD) {
        msg.textContent = 'Mot de passe actuel incorrect.';
        msg.className = 'admin-status-msg error';
        return;
      }
      if (nw.length < 4) {
        msg.textContent = 'Le nouveau mot de passe est trop court.';
        msg.className = 'admin-status-msg error';
        return;
      }
      msg.textContent = '⚠ Le mot de passe est codé en dur. Modifiez la variable PASSWORD dans admin.js.';
      msg.className = 'admin-status-msg success';
      toast('Consultez admin.js pour changer le mot de passe');
      form.reset();
    });

    // Site meta
    const KEY = 'admin_site_meta';
    let meta = { title: 'thesouscote', desc: "Portfolio minimaliste de thesouscote — design épuré inspiré d'Apple." };
    try {
      const s = localStorage.getItem(KEY);
      if (s) meta = JSON.parse(s);
    } catch {}
    const titleInput = document.getElementById('settings-site-title');
    const descInput = document.getElementById('settings-site-desc');
    if (titleInput) titleInput.value = meta.title;
    if (descInput) descInput.value = meta.desc;

    document.getElementById('save-meta-btn')?.addEventListener('click', () => {
      meta.title = titleInput.value.trim();
      meta.desc = descInput.value.trim();
      localStorage.setItem(KEY, JSON.stringify(meta));
      toast('Métadonnées enregistrées');
    });

    document.getElementById('export-all-btn')?.addEventListener('click', () => {
      const allData = {};
      ['projects','admin_about','admin_experience','admin_contact','admin_resources','admin_trash','admin_site_meta'].forEach(k => {
        const v = localStorage.getItem(k);
        if (v) { try { allData[k] = JSON.parse(v); } catch {} }
      });
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'thesouscote-admin-backup.json';
      a.click();
      toast('Backup exporté');
    });

    document.getElementById('import-all-file')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const d = JSON.parse(reader.result);
          Object.keys(d).forEach(k => localStorage.setItem(k, JSON.stringify(d[k])));
          toast('Import complet réussi — rechargement…');
          setTimeout(() => location.reload(), 1000);
        } catch { toast('Fichier invalide'); }
      };
      reader.readAsText(file);
    });
  }

  // ---------- Paste buttons helper ----------
  document.querySelectorAll('.paste-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          targetInput.value = text.trim();
          toast('Collé !');
        } else {
          toast('Presse-papiers vide');
        }
      } catch (err) {
        toast('Utilisez Ctrl+V (autorisation refusée)');
        console.warn('Clipboard read failed: ', err);
      }
    });
  });
})();
