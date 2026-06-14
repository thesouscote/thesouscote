// ============================================================
// Admin — gestion complète du site
// ============================================================
(function () {
  const parseDate = (val) => {
    if (!val) return null;
    if (typeof val.toDate === 'function') return val.toDate();
    if (val && typeof val === 'object' && typeof val.seconds === 'number') return new Date(val.seconds * 1000);
    return new Date(val);
  };

  // Handler d'erreurs global pour le débogage de l'admin
  window.addEventListener('error', (event) => {
    console.error("Admin Error Caught:", event.error);
    const errDiv = document.createElement('div');
    errDiv.style.position = 'fixed';
    errDiv.style.bottom = '80px'; // décalé pour ne pas chevaucher d'autres toasts
    errDiv.style.left = '20px';
    errDiv.style.right = '20px';
    errDiv.style.background = '#e0245e';
    errDiv.style.color = '#fff';
    errDiv.style.padding = '12px 16px';
    errDiv.style.borderRadius = '8px';
    errDiv.style.fontSize = '12px';
    errDiv.style.fontFamily = 'monospace';
    errDiv.style.zIndex = '999999';
    errDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    errDiv.textContent = `Erreur Admin: ${event.message} (${event.filename}:${event.lineno})`;
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.float = 'right';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.marginLeft = '10px';
    closeBtn.onclick = () => errDiv.remove();
    errDiv.appendChild(closeBtn);
    
    document.body.appendChild(errDiv);
    setTimeout(() => { if(errDiv.parentNode) errDiv.remove(); }, 12000);
  });

  const gate = document.getElementById('gate');
  const app = document.getElementById('admin-app');
  const gateEmail = document.getElementById('gate-email');
  const gatePassword = document.getElementById('gate-password');
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

  // ---------- Sauvegarde Firebase CMS (explicite, compatible mobile) ----------
  window.saveToAdminDB = function (key, valueStr) {
    try {
      localStorage.setItem(key, valueStr);
    } catch (e) {
      console.warn('localStorage error:', e);
    }

    const CMS_KEYS = [
      'projects',
      'admin_about',
      'admin_experience',
      'admin_contact',
      'admin_resources',
      'admin_trash',
      'admin_site_meta',
      'admin_deliveries',
      'admin_categories'
    ];

    if (typeof db !== 'undefined' && db && CMS_KEYS.includes(key) && typeof valueStr === 'string' && valueStr.length > 0) {
      try {
        const parsed = JSON.parse(valueStr);
        db.collection('portfolio_data').doc(key).set({ value: parsed })
          .then(() => {
            console.log('[Firebase Cloud] Synchronisation réussie pour [' + key + ']');
            toast('☁️ Sauvegardé dans le Cloud !');
          })
          .catch((error) => {
            console.error('Erreur Cloud pour [' + key + '] :', error);
            toast('⚠️ Erreur Cloud : enregistré en local.');
          });
      } catch (e) {
        console.warn('[Cloud] Valeur non-JSON ignorée pour [' + key + ']');
      }
    }
  };

  async function loadAllCloudData() {
    if (typeof db === 'undefined' || !db) return;
    try {
      const snapshot = await db.collection('portfolio_data').get();
      
      const CMS_KEYS = [
        'projects',
        'admin_about',
        'admin_experience',
        'admin_contact',
        'admin_resources',
        'admin_trash',
        'admin_site_meta',
        'admin_deliveries',
        'admin_categories'
      ];

      if (snapshot.empty) {
        console.log("[Firebase Cloud] Base de données Firestore vide. Initialisation automatique...");
        CMS_KEYS.forEach(key => {
          const localVal = localStorage.getItem(key);
          if (localVal) {
            try {
              const parsed = JSON.parse(localVal);
              db.collection('portfolio_data').doc(key).set({ value: parsed });
            } catch {}
          }
        });
      } else {
        snapshot.forEach(doc => {
          const key = doc.id;
          const value = doc.data().value;
          if (value !== undefined) {
            // Écrit directement dans localStorage (pas via saveToAdminDB pour ne pas re-push vers Firebase)
            localStorage.setItem(key, JSON.stringify(value));
          }
        });
        console.log("[Firebase Cloud] Toutes les données du portfolio ont été synchronisées localement !");
      }
    } catch (e) {
      console.error("Erreur de chargement initial Firebase Cloud :", e);
    }
  }

  // ---------- Gate ----------
  async function unlock() {
    sessionStorage.setItem('admin-ok', '1');
    if (gate) gate.style.display = 'none';
    
    // 1. On attend le téléchargement complet du Cloud Firebase
    await loadAllCloudData();
    
    // 2. On affiche l'application d'administration
    if (app) app.hidden = false;
    
    // 3. On initialise les données fraîches
    init();
  }

  function tryUnlock() {
    const email = gateEmail.value.trim();
    const password = gatePassword.value.trim();

    if (!email || !password) {
      gateError.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    gateError.textContent = "";
    gateBtn.disabled = true;
    gateBtn.textContent = "Connexion...";

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        // Le onAuthStateChanged se chargera du reste
        gateBtn.disabled = false;
        gateBtn.textContent = "Se connecter";
      })
      .catch((error) => {
        gateBtn.disabled = false;
        gateBtn.textContent = "Se connecter";
        console.error("Erreur de connexion Firebase Auth:", error);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          gateError.textContent = "Email ou mot de passe incorrect.";
        } else if (error.code === 'auth/invalid-email') {
          gateError.textContent = "Adresse e-mail invalide.";
        } else {
          gateError.textContent = "Erreur : " + error.message;
        }
      });
  }

  // Écouteur de session en temps réel Firebase Auth
  if (typeof firebase !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        unlock();
      } else {
        sessionStorage.removeItem('admin-ok');
        if (app) app.hidden = true;
        if (gate) gate.style.display = 'flex';
        gateEmail?.focus();
      }
    });
  }

  // Écouteurs d'événements du clavier et clics pour la connexion
  gateBtn?.addEventListener('click', tryUnlock);
  gateEmail?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); gatePassword?.focus(); }
  });
  gatePassword?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); tryUnlock(); }
  });

  // Connexion Google
  const googleBtn = document.getElementById('gate-google-btn');
  googleBtn?.addEventListener('click', () => {
    if (typeof firebase === 'undefined') return;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .catch((error) => {
        console.error("Erreur de connexion Google Auth:", error);
        gateError.textContent = "Erreur Google : " + error.message;
      });
  });

  // Connexion Apple
  const appleBtn = document.getElementById('gate-apple-btn');
  appleBtn?.addEventListener('click', () => {
    if (typeof firebase === 'undefined') return;
    const provider = new firebase.auth.OAuthProvider('apple.com');
    firebase.auth().signInWithPopup(provider)
      .catch((error) => {
        console.error("Erreur de connexion Apple Auth:", error);
        gateError.textContent = "Erreur Apple : " + error.message;
      });
  });

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
    initDeliveries();
    initSettings();
    fetchStats();
  }

  function fetchStats() {
    if (typeof db === 'undefined' || !db) return;
    try {
      db.collection('stats').doc('visits').get().then(doc => {
        if (doc.exists) {
          const count = doc.data().count || 0;
          const el = document.getElementById('admin-visits-count');
          if (el) el.textContent = count;
        }
      });
    } catch(e) {}
  }

  // ---------- Tabs ----------
  function initTabs() {
    const tabBtns = document.querySelectorAll('.sidebar-link[data-tab]');
    const panels = document.querySelectorAll('.admin-panel[data-panel]');

    function activateTab(tabName) {
      tabBtns.forEach(b => b.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));
      const btn = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
      const panel = document.querySelector(`[data-panel="${tabName}"]`);
      if (btn) btn.classList.add('is-active');
      if (panel) panel.classList.add('is-active');
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activateTab(btn.dataset.tab);
        sessionStorage.setItem('admin-tab', btn.dataset.tab);
        document.querySelector('.admin-sidebar')?.classList.remove('is-open');
        document.querySelector('.sidebar-overlay')?.classList.remove('is-visible');
      });
    });

    const savedTab = sessionStorage.getItem('admin-tab');
    if (savedTab && document.querySelector(`[data-panel="${savedTab}"]`)) {
      activateTab(savedTab);
    }
  }

  // ---------- Mobile menu ----------
  function initMobileMenu() {
    let menuToggle = document.getElementById('admin-menu-toggle');
    if (!menuToggle) return;
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Éviter les doublons d'écouteurs si init() est appelé plusieurs fois
    const newToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newToggle, menuToggle);
    menuToggle = newToggle;
    
    menuToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('is-open');
      overlay.classList.toggle('is-visible');
    });
    
    const newOverlay = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(newOverlay, overlay);
    overlay = newOverlay;
    
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    });
  }

  // ---------- Logout ----------
  function initLogout() {
    document.getElementById('admin-logout')?.addEventListener('click', () => {
      if (typeof firebase !== 'undefined') {
        firebase.auth().signOut()
          .then(() => {
            sessionStorage.removeItem('admin-ok');
            location.reload();
          })
          .catch((error) => {
            console.error("Erreur de déconnexion Firebase Auth:", error);
          });
      } else {
        sessionStorage.removeItem('admin-ok');
        location.reload();
      }
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
    const fDate = document.getElementById('f-date');
    const fClient = document.getElementById('f-client');
    const fStack = document.getElementById('f-stack');
    const fLink = document.getElementById('f-link');
    const fImage = document.getElementById('f-image');
    const fImageFile = document.getElementById('f-image-file');
    const galleryRows = document.getElementById('gallery-rows');
    const addGalleryRowBtn = document.getElementById('add-gallery-row');

    const UPLOAD_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

    function addGalleryRow(url = '', downloadable = true) {
      const row = document.createElement('div');
      row.className = 'gallery-dyn-row';
      row.style.cssText = 'display:flex;gap:8px;align-items:center;';
      const uid = 'gr-' + Date.now() + Math.random().toString(36).slice(2);
      row.innerHTML = `
        <input type="url" class="gallery-url" placeholder="https://…" value="${url}" style="flex:1;padding:10px 14px;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);font:inherit;font-size:14px;outline:none;" />
        <button type="button" class="btn btn-ghost gallery-paste" style="padding:0 12px;height:36px;">Coller</button>
        <label class="file-upload-label" style="margin:0;min-width:auto;padding:0 12px;display:flex;align-items:center;justify-content:center;height:36px;">
          ${UPLOAD_SVG}
          <input type="file" accept="image/*" hidden />
        </label>
        <button type="button" class="btn btn-ghost btn-sm btn-del gallery-remove" style="padding:0 10px;height:36px;">×</button>
      `;
      row.querySelector('.gallery-remove').addEventListener('click', () => row.remove());
      row.querySelector('.gallery-paste').addEventListener('click', async () => {
        try { const t = await navigator.clipboard.readText(); row.querySelector('.gallery-url').value = t.trim(); } catch {}
      });
      row.querySelector('input[type="file"]').addEventListener('change', e => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { row.querySelector('.gallery-url').value = reader.result; };
        reader.readAsDataURL(file);
      });
      galleryRows.appendChild(row);
      return row;
    }

    addGalleryRowBtn?.addEventListener('click', () => addGalleryRow());
    const fSubmit = document.getElementById('f-submit');
    const fReset = document.getElementById('f-reset');
    const formTitle = document.getElementById('project-form-title');

    const KEY = 'projects';
    let projects = [];

    function save() {
      window.saveToAdminDB(KEY, JSON.stringify({ projects }));
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
        save(); return;
      }
      render();
    }

    function render() {
      count.textContent = projects.length;
      if (!projects.length) {
        list.innerHTML = '<li class="admin-empty">Aucun projet.</li>';
        return;
      }
      list.innerHTML = projects.map((p, i) => `
          <li class="admin-item" draggable="true" data-index="${i}" style="cursor: grab;">
            <div class="admin-item-thumb">${p.image ? `<img src="${typeof p.image === 'object' && p.image.url ? esc(p.image.url) : esc(p.image)}" alt="">` : ''}</div>
            <div class="admin-item-body">
              <div class="admin-item-title">${esc(p.title)} ${p.tag ? `<span class="item-tag">${esc(p.tag)}</span>` : ''}</div>
              <div class="admin-item-desc">${esc(p.description)}</div>
            </div>
            <div class="admin-item-actions">
              <button type="button" data-pmoveup="${i}" class="btn btn-ghost btn-sm" ${i === 0 ? 'disabled' : ''} title="Monter">↑</button>
              <button type="button" data-pmovedown="${i}" class="btn btn-ghost btn-sm" ${i === projects.length - 1 ? 'disabled' : ''} title="Descendre">↓</button>
              <button type="button" data-edit="${p.id}" class="btn btn-ghost btn-sm">Modifier</button>
              <button type="button" data-del="${p.id}" class="btn btn-ghost btn-sm btn-del">×</button>
            </div>
          </li>`).join('');
          
      // Gestionnaire de Drag & Drop
      let draggedIndex = null;
      list.querySelectorAll('.admin-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedIndex = parseInt(item.dataset.index);
          e.dataTransfer.effectAllowed = 'move';
          item.style.opacity = '0.5';
        });
        item.addEventListener('dragover', (e) => {
          e.preventDefault(); // Nécessaire pour autoriser le drop
          e.dataTransfer.dropEffect = 'move';
          item.style.borderTop = '2px solid var(--accent)';
        });
        item.addEventListener('dragleave', () => {
          item.style.borderTop = '';
        });
        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.style.borderTop = '';
          const targetIndex = parseInt(item.dataset.index);
          if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const draggedProject = projects[draggedIndex];
            projects.splice(draggedIndex, 1);
            projects.splice(targetIndex, 0, draggedProject);
            save();
          }
        });
        item.addEventListener('dragend', () => {
          item.style.opacity = '1';
        });
      });

      list.querySelectorAll('[data-pmoveup]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.pmoveup);
          if (i > 0) { [projects[i - 1], projects[i]] = [projects[i], projects[i - 1]]; save(); }
        }));
      list.querySelectorAll('[data-pmovedown]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.pmovedown);
          if (i < projects.length - 1) { [projects[i], projects[i + 1]] = [projects[i + 1], projects[i]]; save(); }
        }));
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
      fDate.value = p.date || '';
      fClient.value = p.client || '';
      fStack.value = Array.isArray(p.stack) ? p.stack.join(', ') : (p.stack || '');
      fLink.value = p.link || '';
      fImage.value = (typeof p.image === 'object') ? (p.image.url || '') : (p.image || '');
      galleryRows.innerHTML = '';
      const gallery = p.gallery || [];
      if (gallery.length) {
        gallery.forEach(item => addGalleryRow(typeof item === 'object' ? item.url : item));
      } else {
        addGalleryRow();
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
      fDate.value = '';
      fClient.value = '';
      fStack.value = '';
      galleryRows.innerHTML = '';
      addGalleryRow();
      fSubmit.textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter un projet';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const gallery = [];
      galleryRows.querySelectorAll('.gallery-dyn-row').forEach(row => {
        const url = row.querySelector('.gallery-url').value.trim();
        if (url) gallery.push(url);
      });
      const data = {
        id: fId.value || newId(),
        title: fTitle.value.trim(),
        description: fDesc.value.trim(),
        tag: fTag.value.trim(),
        date: fDate.value.trim(),
        client: fClient.value.trim(),
        stack: fStack.value.trim() ? fStack.value.trim().split(',').map(s => s.trim()) : [],
        link: fLink.value.trim() || '#',
        image: fImage.value.trim(),
        gallery: gallery,
        updatedAt: new Date().toISOString()
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
        <div class="skill-row" style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
          <input type="text" value="${esc(s.fr)}" data-idx="${i}" data-lang="fr" placeholder="Compétence" style="flex:1;" />
          <button type="button" class="btn btn-ghost btn-sm" data-smoveup="${i}" ${i === 0 ? 'disabled' : ''} title="Monter">↑</button>
          <button type="button" class="btn btn-ghost btn-sm" data-smovedown="${i}" ${i === data.skills.length - 1 ? 'disabled' : ''} title="Descendre">↓</button>
          <button type="button" class="btn-icon" data-remove="${i}">×</button>
        </div>`).join('');
      skillsList.querySelectorAll('[data-smoveup]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.smoveup);
          if (i > 0) { [data.skills[i - 1], data.skills[i]] = [data.skills[i], data.skills[i - 1]]; renderSkills(); }
        }));
      skillsList.querySelectorAll('[data-smovedown]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.smovedown);
          if (i < data.skills.length - 1) { [data.skills[i], data.skills[i + 1]] = [data.skills[i + 1], data.skills[i]]; renderSkills(); }
        }));
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
      data.skills.push({ fr: '' });
      renderSkills();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      data.bioFr = bioFr.value;
      data.cv = cvInput.value;
      window.saveToAdminDB(KEY, JSON.stringify(data));
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
      { id:'e1', dateFr:'2024 — Présent', roleFr:'Designer & développeur indépendant', descFr:'Conception et développement de sites et identités visuelles.', projectLink:'' },
      { id:'e2', dateFr:'2022 — 2024', roleFr:'Projet personnel — thesouscote', descFr:'Création de contenu, streaming et exploration créative.', projectLink:'' },
      { id:'e3', dateFr:'Avant 2022', roleFr:'Apprentissage', descFr:'Découverte du design, du code et de la typographie.', projectLink:'' }
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
    const selectLink = document.getElementById('exp-project-link');
    const extLinkInput = document.getElementById('exp-external-link');

    function populateProjectSelect() {
      if (!selectLink) return;
      selectLink.innerHTML = '<option value="">Aucun projet lié</option>';
      try {
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          const parsed = JSON.parse(storedProjects);
          const projectsList = parsed.projects || [];
          projectsList.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.title;
            selectLink.appendChild(opt);
          });
        }
      } catch (err) {
        console.warn("Impossible de peupler la liste des projets pour l'expérience :", err);
      }
    }

    function save() {
      window.saveToAdminDB(KEY, JSON.stringify(items));
      render();
    }

    function render() {
      countEl.textContent = items.length;
      if (!items.length) {
        list.innerHTML = '<li class="admin-empty">Aucune expérience.</li>';
        return;
      }

      let projectsMap = {};
      try {
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          const parsed = JSON.parse(storedProjects);
          (parsed.projects || []).forEach(p => { projectsMap[p.id] = p.title; });
        }
      } catch {}

      list.innerHTML = items.map((it, i) => {
        let linkedTitle = null;
        if (it.projectLink) {
          if (it.projectLink.startsWith('http://') || it.projectLink.startsWith('https://')) {
            linkedTitle = `Lien externe (${it.projectLink})`;
          } else {
            linkedTitle = projectsMap[it.projectLink] || 'Projet inconnu';
          }
        }
        return `
        <li class="admin-item admin-item--no-thumb">
          <div class="admin-item-body">
            <div class="admin-item-title">${esc(it.roleFr)}</div>
            <div class="admin-item-desc">
              ${esc(it.dateFr)} — ${esc(it.descFr)}
              ${linkedTitle ? `<br><small style="color:var(--primary); font-weight:500;">🔗 Projet lié : ${esc(linkedTitle)}</small>` : ''}
            </div>
          </div>
          <div class="admin-item-actions">
            <button type="button" data-emoveup="${i}" class="btn btn-ghost btn-sm" ${i === 0 ? 'disabled' : ''} title="Monter">↑</button>
            <button type="button" data-emovedown="${i}" class="btn btn-ghost btn-sm" ${i === items.length - 1 ? 'disabled' : ''} title="Descendre">↓</button>
            <button type="button" data-eedit="${it.id}" class="btn btn-ghost btn-sm">Modifier</button>
            <button type="button" data-edel="${it.id}" class="btn btn-ghost btn-sm btn-del">×</button>
          </div>
        </li>`;
      }).join('');
      list.querySelectorAll('[data-emoveup]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.emoveup);
          if (i > 0) { [items[i - 1], items[i]] = [items[i], items[i - 1]]; save(); }
        }));
      list.querySelectorAll('[data-emovedown]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.emovedown);
          if (i < items.length - 1) { [items[i], items[i + 1]] = [items[i + 1], items[i]]; save(); }
        }));
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
      populateProjectSelect();
      eId.value = it.id;
      document.getElementById('exp-date-fr').value = it.dateFr || '';
      document.getElementById('exp-role-fr').value = it.roleFr || '';
      document.getElementById('exp-desc-fr').value = it.descFr || '';
      
      if (it.projectLink && (it.projectLink.startsWith('http://') || it.projectLink.startsWith('https://'))) {
        if (extLinkInput) extLinkInput.value = it.projectLink;
        if (selectLink) selectLink.value = '';
      } else {
        if (extLinkInput) extLinkInput.value = '';
        if (selectLink) selectLink.value = it.projectLink || '';
      }
      
      document.getElementById('exp-submit').textContent = 'Mettre à jour';
      formTitle.textContent = "Modifier l'expérience";
      form.scrollIntoView({ behavior: 'smooth' });
    }

    function resetForm() {
      form.reset();
      eId.value = '';
      if (selectLink) selectLink.value = '';
      if (extLinkInput) extLinkInput.value = '';
      document.getElementById('exp-submit').textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter une expérience';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const extVal = extLinkInput ? extLinkInput.value.trim() : '';
      const d = {
        id: eId.value || newId(),
        dateFr: document.getElementById('exp-date-fr').value.trim(),
        roleFr: document.getElementById('exp-role-fr').value.trim(),
        descFr: document.getElementById('exp-desc-fr').value.trim(),
        projectLink: extVal || (selectLink ? selectLink.value : '')
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

    populateProjectSelect();
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
      window.saveToAdminDB(KEY, JSON.stringify(data));
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
    const rPaymentLink = document.getElementById('r-payment-link');
    const rLink = document.getElementById('r-link');
    const rImage = document.getElementById('r-image');
    const rImageFile = document.getElementById('r-image-file');
    const rGalleryRows = document.getElementById('r-gallery-rows');
    const addRGalleryRowBtn = document.getElementById('add-r-gallery-row');
    const rSubmit = document.getElementById('r-submit');
    const rReset = document.getElementById('r-reset');
    const formTitle = document.getElementById('resource-form-title');

    const UPLOAD_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

    function addRGalleryRow(url = '') {
      const row = document.createElement('div');
      row.className = 'gallery-dyn-row';
      row.style.cssText = 'display:flex;gap:8px;align-items:center;';
      const uid = 'rgr-' + Date.now() + Math.random().toString(36).slice(2);
      row.innerHTML = `
        <input type="url" class="gallery-url" placeholder="https://…" value="${url}" style="flex:1;padding:10px 14px;background:var(--bg-alt);border:1px solid var(--border);color:var(--text);font:inherit;font-size:14px;outline:none;" />
        <button type="button" class="btn btn-ghost gallery-paste" style="padding:0 12px;height:36px;">Coller</button>
        <label class="file-upload-label" style="margin:0;min-width:auto;padding:0 12px;display:flex;align-items:center;justify-content:center;height:36px;">
          ${UPLOAD_SVG}
          <input type="file" accept="image/*" hidden />
        </label>
        <button type="button" class="btn btn-ghost btn-sm btn-del gallery-remove" style="padding:0 10px;height:36px;">×</button>
      `;
      row.querySelector('.gallery-remove').addEventListener('click', () => row.remove());
      row.querySelector('.gallery-paste').addEventListener('click', async () => {
        try { const t = await navigator.clipboard.readText(); row.querySelector('.gallery-url').value = t.trim(); } catch {}
      });
      row.querySelector('input[type="file"]').addEventListener('change', e => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { row.querySelector('.gallery-url').value = reader.result; };
        reader.readAsDataURL(file);
      });
      rGalleryRows.appendChild(row);
      return row;
    }

    if (addRGalleryRowBtn) addRGalleryRowBtn.addEventListener('click', () => addRGalleryRow());

    const KEY = 'admin_resources';
    const CAT_KEY = 'admin_categories';
    const DEFAULT_CATS = ['logo', 'carte', 'sticker'];
    let resources = [];

    // --- Catégories dynamiques ---
    function loadCats() {
      try { return JSON.parse(localStorage.getItem(CAT_KEY)) || [...DEFAULT_CATS]; }
      catch { return [...DEFAULT_CATS]; }
    }
    function saveCats(cats) { window.saveToAdminDB(CAT_KEY, JSON.stringify(cats)); }
    function renderCats() {
      const cats = loadCats();
      const saved = rCategory.value;
      rCategory.innerHTML = cats.map(c => `<option value="${esc(c)}">${esc(c.charAt(0).toUpperCase() + c.slice(1))}</option>`).join('');
      if (saved && cats.includes(saved)) rCategory.value = saved;
      const tagsEl = document.getElementById('cat-tags');
      if (tagsEl) {
        tagsEl.innerHTML = cats.map(c => `
          <span class="cat-pill">${esc(c.charAt(0).toUpperCase() + c.slice(1))}
            <button type="button" data-delcat="${esc(c)}" title="Supprimer">×</button>
          </span>`).join('');
        tagsEl.querySelectorAll('[data-delcat]').forEach(b => b.addEventListener('click', () => {
          const updated = loadCats().filter(x => x !== b.dataset.delcat);
          if (updated.length === 0) return;
          saveCats(updated);
          renderCats();
        }));
      }
    }
    const addCatBtn = document.getElementById('add-cat-btn');
    const newCatInput = document.getElementById('new-cat-input');
    if (addCatBtn && newCatInput) {
      addCatBtn.addEventListener('click', () => {
        const val = newCatInput.value.trim().toLowerCase();
        if (!val) return;
        const cats = loadCats();
        if (!cats.includes(val)) { cats.push(val); saveCats(cats); }
        newCatInput.value = '';
        renderCats();
        rCategory.value = val;
      });
      newCatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCatBtn.click(); } });
    }
    renderCats();

    function save() {
      window.saveToAdminDB(KEY, JSON.stringify({ resources }));
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
        save(); return;
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
      list.innerHTML = resources.map((r, i) => `
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
            <button type="button" data-rmoveup="${i}" class="btn btn-ghost btn-sm" ${i === 0 ? 'disabled' : ''} title="Monter">↑</button>
            <button type="button" data-rmovedown="${i}" class="btn btn-ghost btn-sm" ${i === resources.length - 1 ? 'disabled' : ''} title="Descendre">↓</button>
            <button type="button" data-redit="${r.id}" class="btn btn-ghost btn-sm">Modifier</button>
            <button type="button" data-rdel="${r.id}" class="btn btn-ghost btn-sm btn-del">×</button>
          </div>
        </li>`).join('');
      list.querySelectorAll('[data-rmoveup]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.rmoveup);
          if (i > 0) { [resources[i - 1], resources[i]] = [resources[i], resources[i - 1]]; save(); }
        }));
      list.querySelectorAll('[data-rmovedown]').forEach(b =>
        b.addEventListener('click', () => {
          const i = parseInt(b.dataset.rmovedown);
          if (i < resources.length - 1) { [resources[i], resources[i + 1]] = [resources[i + 1], resources[i]]; save(); }
        }));
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
      if (rPaymentLink) rPaymentLink.value = r.paymentLink || '';
      rLink.value = r.link || '';
      rImage.value = r.image || '';
      
      if (rGalleryRows) {
        rGalleryRows.innerHTML = '';
        const gallery = r.gallery || [];
        if (gallery.length) {
          gallery.forEach(item => addRGalleryRow(typeof item === 'object' ? item.url : item));
        } else {
          addRGalleryRow();
        }
      }

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
      if (rPaymentLink) rPaymentLink.value = '';
      
      if (rGalleryRows) {
        rGalleryRows.innerHTML = '';
        addRGalleryRow();
      }

      rSubmit.textContent = 'Ajouter';
      formTitle.textContent = 'Ajouter au market';
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const gallery = [];
      if (rGalleryRows) {
        rGalleryRows.querySelectorAll('.gallery-dyn-row').forEach(row => {
          const url = row.querySelector('.gallery-url').value.trim();
          if (url) gallery.push(url);
        });
      }

      const data = {
        id: rId.value || newId(),
        title: rTitle.value.trim(),
        description: rDesc.value.trim(),
        tag: rTag.value.trim(),
        category: rCategory.value,
        price: Number(rPrice.value) || 0,
        paymentLink: rPaymentLink ? rPaymentLink.value.trim() : '',
        link: rLink.value.trim() || '#',
        image: rImage.value.trim(),
        gallery: gallery,
        updatedAt: new Date().toISOString()
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
      window.saveToAdminDB(KEY, JSON.stringify(items));
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
        noteEn: ''
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
      window.saveToAdminDB(KEY, JSON.stringify(meta));
      toast('Métadonnées enregistrées');
    });

    document.getElementById('export-all-btn')?.addEventListener('click', () => {
      const allData = {};
      ['projects','admin_about','admin_experience','admin_contact','admin_resources','admin_trash','admin_site_meta','admin_deliveries'].forEach(k => {
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
          Object.keys(d).forEach(k => window.saveToAdminDB(k, JSON.stringify(d[k])));
          toast('Import complet réussi — rechargement…');
          setTimeout(() => location.reload(), 1000);
        } catch { toast('Fichier invalide'); }
      };
      reader.readAsText(file);
    });
  }

  // ============================================================
  // COLLECTES (LIVRAISONS CLIENTS)
  // ============================================================
  function initDeliveries() {
    const form = document.getElementById('delivery-form');
    if (!form) return;
    const list = document.getElementById('delivery-list');
    const count = document.getElementById('delivery-count');
    const fId = document.getElementById('del-id');
    const fCode = document.getElementById('del-code');
    const fClient = document.getElementById('del-client');
    const fDate = document.getElementById('del-date');
    const fNotes = document.getElementById('del-notes');
    const fExpiryHours = document.getElementById('del-expiry-hours');
    const fF1Name = document.getElementById('del-f1-name');
    const fF1Url = document.getElementById('del-f1-url');
    const fF2Name = document.getElementById('del-f2-name');
    const fF2Url = document.getElementById('del-f2-url');
    const fSubmit = document.getElementById('delivery-submit');
    const fReset = document.getElementById('delivery-reset');
    const formTitle = document.getElementById('delivery-form-title');
    const btnGen = document.getElementById('btn-generate-code');
    const btnCopy = document.getElementById('btn-copy-code');

    const KEY = 'admin_deliveries';
    let deliveries = [];

    if (btnGen) {
      btnGen.addEventListener('click', () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const genPart = (len) => {
          let r = '';
          for (let i = 0; i < len; i++) {
            r += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return r;
        };
        const key = `${genPart(4)}-${genPart(4)}-${genPart(4)}`;
        fCode.value = key;
        toast('Clé de licence générée !');
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const val = fCode.value.trim();
        if (!val) {
          toast('Aucun code à copier !');
          return;
        }
        navigator.clipboard.writeText(val)
          .then(() => toast('Code copié dans le presse-papiers !'))
          .catch(() => {
            const el = document.createElement('textarea');
            el.value = val;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            try {
              document.execCommand('copy');
              toast('Code copié !');
            } catch (err) {
              toast('Erreur de copie');
            }
            document.body.removeChild(el);
          });
      });
    }

    function getTodayFormatted() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString('fr-FR', options);
    }

    async function syncWithFirebase(item, action) {
      if (typeof db === 'undefined' || !db) return;
      try {
        if (action === 'delete') {
          await db.collection('deliveries').doc(item.id).delete();
        } else if (action === 'upsert') {
          await db.collection('deliveries').doc(item.id).set({
            id: item.id,
            code: item.code,
            client: item.client,
            date: item.date,
            expiryHours: item.expiryHours || 24,
            expiry: item.expiry || null,
            openedAt: item.openedAt || null,
            savedAt: item.savedAt || null,
            notes: item.notes,
            files: item.files
          });
        }
      } catch (err) {
        console.error("Erreur de synchronisation Firebase :", err);
      }
    }

    function saveLocalStorageOnly() {
      window.saveToAdminDB(KEY, JSON.stringify({ deliveries }));
      render();
    }

    async function load() {
      // 1. Charge d'abord le stockage local (immédiat)
      const local = localStorage.getItem(KEY);
      if (local) {
        try { deliveries = JSON.parse(local).deliveries || []; }
        catch { deliveries = []; }
      } else {
        // Fallback par défaut avec notre exemple
        deliveries = [
          {
            id: 'd1',
            code: 'MOKE2026',
            client: "Moke Patrick Armel",
            date: "20 mai 2026",
            notes: "Merci pour votre confiance ! Voici les fichiers finaux pour la refonte de l'identité visuelle de thesouscote.",
            files: [
              { name: "thesouscote_identity_pack.zip", size: "12.4 Mo", url: "assets/deliveries/thesouscote_identity_pack.zip" },
              { name: "thesouscote_guidelines.pdf", size: "3.2 Mo", url: "assets/deliveries/thesouscote_guidelines.pdf" }
            ]
          }
        ];
        saveLocalStorageOnly();
      }
      resetForm(); // Applique la pré-saisie de la date du jour au chargement
      render();

      // 2. Synchronise avec Firebase (Cloud) si disponible
      if (typeof db !== 'undefined' && db) {
        try {
          const snapshot = await db.collection('deliveries').get();
          if (!snapshot.empty) {
            const cloudDeliveries = [];
            snapshot.forEach(doc => {
              const d = doc.data();
              d.id = doc.id;
              cloudDeliveries.push(d);
            });
            deliveries = cloudDeliveries;
            saveLocalStorageOnly();
          }
        } catch (err) {
          console.error("Erreur de récupération Firebase deliveries :", err);
        }
      }
    }

    function formatTimeRemaining(d) {
      // Utilise openedAt si disponible, sinon savedAt comme point de départ
      const startPoint = d.openedAt || d.savedAt;
      if (!startPoint) return null;

      let expiryDate = null;

      // Cas 1 : calcul depuis le point de départ + expiryHours
      if (startPoint && d.expiryHours) {
        const opened = parseDate(startPoint);
        if (opened) {
          expiryDate = new Date(opened.getTime() + (Number(d.expiryHours) * 60 * 60 * 1000));
        }
      }

      // Cas 2 : date d'expiration explicite (fallback)
      if (!expiryDate && d.expiry) {
        expiryDate = parseDate(d.expiry);
        if (expiryDate && typeof d.expiry === 'string' && d.expiry.length <= 10) {
          expiryDate.setHours(23, 59, 59, 999);
        }
      }

      if (!expiryDate) return null;

      const now = new Date();
      const diff = expiryDate - now;

      if (diff <= 0) return { expired: true };

      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      let label = '';
      if (days > 0) label += `${days}j `;
      if (hours > 0 || days > 0) label += `${hours}h `;
      label += `${minutes}min`;

      return { expired: false, label: label.trim(), notOpened: !d.openedAt };
    }

    function render() {
      count.textContent = deliveries.length;
      if (!deliveries.length) {
        list.innerHTML = '<li class="admin-empty">Aucune livraison enregistrée.</li>';
        return;
      }
      list.innerHTML = deliveries.map(d => {
        let statusBadge = `<span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: rgba(0,255,0,0.1); color: #28a745; margin-left: 8px;">Nouveau</span>`;
        let timeRemainingHtml = '';

        if (d.openedAt) {
          const expiryDate = parseDate(d.expiry);
          const today = new Date();
          if (d.expiry && typeof d.expiry === 'string' && d.expiry.length <= 10) {
            if (expiryDate) expiryDate.setHours(23, 59, 59, 999);
          }
          
          if (expiryDate && today > expiryDate) {
            statusBadge = `<span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: rgba(255,0,0,0.1); color: #dc3545; margin-left: 8px;">Expiré</span>`;
          } else {
            statusBadge = `<span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: rgba(255,165,0,0.1); color: #fd7e14; margin-left: 8px;">Ouvert - ${d.expiryHours || 24}H</span>`;
          }

          const tr = formatTimeRemaining(d);
          if (tr) {
            if (tr.expired) {
              timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; font-weight:600; color:#dc3545;">⏱ Collecte expirée</div>`;
            } else if (tr.notOpened) {
              timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; font-weight:600; color:#fd7e14;">⏱ Expire dans : ${tr.label} (pas encore consulté)</div>`;
            } else {
              timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; font-weight:600; color:#fd7e14;">⏱ Expire dans : ${tr.label}</div>`;
            }
          }
        } else {
          // Pas encore ouvert : utilise savedAt pour le countdown si disponible
          const tr = formatTimeRemaining(d);
          if (tr) {
            if (tr.expired) {
              statusBadge = `<span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; background: rgba(255,0,0,0.1); color: #dc3545; margin-left: 8px;">Expiré</span>`;
              timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; font-weight:600; color:#dc3545;">⏱ Collecte expirée</div>`;
            } else {
              timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; font-weight:600; color:#fd7e14;">⏱ Expire dans : ${tr.label} (pas encore consulté)</div>`;
            }
          } else {
            timeRemainingHtml = `<div style="margin-top:6px; font-size:11px; color:var(--text-muted);">⏱ Expire ${d.expiryHours || 24}h après ouverture</div>`;
          }
        }

        return `
        <li class="admin-item">
          <div class="admin-item-body">
            <div class="admin-item-title" style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">
              ${esc(d.client)}
            </div>
            <div style="margin-bottom: 12px; display: flex; align-items: center;">
              <span class="sidebar-badge" style="background:var(--accent); color:var(--accent-contrast); font-size:11px; padding: 4px 8px; display: inline-block; letter-spacing: 0.05em; font-weight: 600;">
                CODE: ${esc(d.code)}
              </span>
              ${statusBadge}
            </div>
            <div class="admin-item-desc" style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
              Livré le : ${esc(d.date)}<br>
              ${d.files ? d.files.length : 0} fichier(s) prêt(s)
              ${timeRemainingHtml}
            </div>
          </div>
          <div class="admin-item-actions">
            <button class="btn btn-ghost btn-xs edit-del" data-id="${d.id}">Modifier</button>
            <button class="btn btn-ghost btn-xs danger del-del" data-id="${d.id}">Supprimer</button>
          </div>
        </li>`;
      }).join('');

      list.querySelectorAll('.edit-del').forEach(b => {
        b.addEventListener('click', () => editD(b.dataset.id));
      });
      list.querySelectorAll('.del-del').forEach(b => {
        b.addEventListener('click', () => delD(b.dataset.id));
      });
    }

    function editD(id) {
      const d = deliveries.find(x => x.id === id);
      if (!d) return;
      fId.value = d.id;
      fCode.value = d.code || '';
      fClient.value = d.client || '';
      fDate.value = d.date || '';
      fExpiryHours.value = d.expiryHours || '24';
      fNotes.value = d.notes || '';
      
      // Load file 1
      fF1Name.value = d.files?.[0]?.name || '';
      fF1Url.value = d.files?.[0]?.url || '';
      // Load file 2
      fF2Name.value = d.files?.[1]?.name || '';
      fF2Url.value = d.files?.[1]?.url || '';

      formTitle.textContent = 'Modifier la livraison';
      fSubmit.textContent = 'Mettre à jour';
    }

    function delD(id) {
      if (!confirm('Supprimer cette livraison ?')) return;
      const target = deliveries.find(x => x.id === id);
      deliveries = deliveries.filter(x => x.id !== id);
      saveLocalStorageOnly();
      if (target) syncWithFirebase(target, 'delete');
      toast('Livraison supprimée');
    }

    function resetForm() {
      form.reset();
      fId.value = '';
      fExpiryHours.value = '24';
      fDate.value = getTodayFormatted(); // Remplit automatiquement la date du jour
      formTitle.textContent = 'Créer un espace client';
      fSubmit.textContent = 'Enregistrer la livraison';
    }

    fReset.addEventListener('click', resetForm);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const codeValue = fCode.value.trim().toUpperCase();
        
        // Validation doublon de code
        const duplicate = deliveries.find(x => x.code === codeValue && x.id !== fId.value);
        if (duplicate) {
          alert("Ce code secret est déjà attribué à un autre client ! Veuillez en choisir un autre.");
          return;
        }

        const files = [];
        if (fF1Name.value.trim() || fF1Url.value.trim()) {
          files.push({ name: fF1Name.value.trim() || "Fichier principal", size: "Prêt", url: fF1Url.value.trim() || "#" });
        }
        if (fF2Name.value.trim() || fF2Url.value.trim()) {
          files.push({ name: fF2Name.value.trim() || "Fichier secondaire", size: "Prêt", url: fF2Url.value.trim() || "#" });
        }

        // Retrieve existing expiry if update, else null
        const isUpdate = !!fId.value;
        let currentExpiry = null;
        let currentOpenedAt = null;
        if (isUpdate) {
          const exist = deliveries.find(x => x.id === fId.value);
          if (exist) {
            currentExpiry = exist.expiry || null;
            currentOpenedAt = exist.openedAt || null;
          }
        }

        const data = {
          id: fId.value || 'del_' + Date.now(),
          code: codeValue,
          client: fClient.value.trim(),
          date: fDate.value.trim(),
          expiryHours: parseInt(fExpiryHours.value) || 24,
          expiry: currentExpiry,
          openedAt: currentOpenedAt,
          // Preserve existing savedAt on update, set on creation
          savedAt: isUpdate ? (deliveries.find(x => x.id === fId.value)?.savedAt || new Date().toISOString()) : new Date().toISOString(),
          notes: fNotes.value.trim() || "Merci pour votre confiance ! Voici vos fichiers finaux prêts à être téléchargés.",
          files: files
        };

        if (isUpdate) {
          const idx = deliveries.findIndex(x => x.id === fId.value);
          if (idx >= 0) deliveries[idx] = data;
          toast('Livraison mise à jour');
        } else {
          deliveries.unshift(data);
          toast('Livraison ajoutée');
        }
        saveLocalStorageOnly();
        syncWithFirebase(data, 'upsert');
        resetForm();
      } catch (err) {
        console.error("Error saving delivery:", err);
        alert("Erreur lors de l'enregistrement : " + err.message);
      }
    });

    load();
  }

  // ---------- Drive Link Formatter ----------
  function formatDriveLink(url) {
    if (!url) return url;
    let match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    match = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  }

  // ---------- Paste buttons helper ----------
  document.querySelectorAll('.paste-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;
      try {
        let text = await navigator.clipboard.readText();
        if (text) {
          text = text.trim();
          // Auto-format Google Drive links for URLs
          if (targetInput.type === 'url' || targetId.includes('url') || targetId.includes('link')) {
            const formatted = formatDriveLink(text);
            if (formatted !== text) toast('Lien Drive formaté !');
            else toast('Collé !');
            text = formatted;
          } else {
            toast('Collé !');
          }
          targetInput.value = text;
        } else {
          toast('Presse-papiers vide');
        }
      } catch (err) {
        toast('Utilisez Ctrl+V (autorisation refusée)');
        console.warn('Clipboard read failed: ', err);
      }
    });
  });

  // Auto-format on blur for manually pasted links
  document.querySelectorAll('input[type="url"], input[id*="url"], input[id*="link"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value) {
        const formatted = formatDriveLink(input.value.trim());
        if (formatted !== input.value.trim()) {
          input.value = formatted;
          toast('Lien Drive converti !');
        }
      }
    });
  });

})();
