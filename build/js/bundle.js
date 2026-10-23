(function() {
// ============================================================
// REACT COMPONENTS - VINTED MANAGER
// ============================================================

var {
  useState,
  useEffect,
  useMemo,
  useCallback
} = React;

// ============================================================
// PERMISSION & ROLE MANAGER (GESTION DES ACCÈS PERSONNALISÉS)
// ============================================================
var PermissionManager = {
  MODULES: [{
    key: 'comptes',
    label: 'Comptes Vinted',
    icon: 'fa-store',
    desc: 'Gestion des comptes, statuts et inventaire'
  }, {
    key: 'todos',
    label: 'To-Do & Rappels',
    icon: 'fa-list-check',
    desc: 'Gestionnaire de tâches et alertes'
  }, {
    key: 'classement',
    label: 'Classement & Scores',
    icon: 'fa-trophy',
    desc: 'Leaderboard des ventes et performances'
  }, {
    key: 'gagnants',
    label: 'Suggestions & Gagnants',
    icon: 'fa-lightbulb',
    desc: 'Articles prometteurs et republications'
  }, {
    key: 'incidents',
    label: 'Journal des Incidents',
    icon: 'fa-triangle-exclamation',
    desc: 'Litiges, blocages et alertes comptes'
  }, {
    key: 'messagerie',
    label: 'Messagerie Vinted',
    icon: 'fa-comments',
    desc: 'Messages et échanges avec les acheteurs'
  }, {
    key: 'organisations',
    label: 'Organisations',
    icon: 'fa-sitemap',
    desc: 'Gestion multi-tenancy des structures'
  }, {
    key: 'utilisateurs',
    label: 'Utilisateurs & Membres',
    icon: 'fa-users-gear',
    desc: 'Gestion des comptes et droits d\'accès'
  }, {
    key: 'corbeille',
    label: 'Corbeille & Restauration',
    icon: 'fa-trash-can',
    desc: 'Éléments supprimés et restauration'
  }, {
    key: 'parametres',
    label: 'Paramètres Système',
    icon: 'fa-sliders',
    desc: 'Configuration des scores et créneaux'
  }, {
    key: 'journal',
    label: 'Journal d\'Audit',
    icon: 'fa-clock-rotate-left',
    desc: 'Historique des actions système'
  }],
  ACTIONS: [{
    key: 'comptes_create',
    label: 'Créer des comptes Vinted',
    icon: 'fa-plus',
    desc: 'Ajouter de nouveaux comptes Vinted'
  }, {
    key: 'comptes_edit',
    label: 'Modifier les comptes Vinted',
    icon: 'fa-pen',
    desc: 'Éditer les paramètres, mots de passe et statuts'
  }, {
    key: 'comptes_delete',
    label: 'Supprimer des comptes Vinted',
    icon: 'fa-trash',
    desc: 'Supprimer ou archiver des comptes'
  }, {
    key: 'todos_manage',
    label: 'Gérer la To-Do List',
    icon: 'fa-list-check',
    desc: 'Créer, réassigner et modifier les tâches'
  }, {
    key: 'incidents_manage',
    label: 'Gérer les incidents',
    icon: 'fa-circle-exclamation',
    desc: 'Déclarer et clôturer des litiges'
  }, {
    key: 'sync_dotb',
    label: 'Synchronisation DotB Cloud',
    icon: 'fa-arrows-rotate',
    desc: 'Actualisation en direct depuis DotB'
  }, {
    key: 'export_data',
    label: 'Exporter la base (JSON)',
    icon: 'fa-download',
    desc: 'Télécharger les sauvegardes complètes'
  }, {
    key: 'import_data',
    label: 'Importer / Restaurer (JSON)',
    icon: 'fa-file-import',
    desc: 'Restaurer une sauvegarde JSON'
  }],
  PRESETS: {
    admin: {
      comptes: true,
      todos: true,
      classement: true,
      gagnants: true,
      incidents: true,
      messagerie: true,
      organisations: true,
      utilisateurs: true,
      corbeille: true,
      parametres: true,
      journal: true,
      comptes_create: true,
      comptes_edit: true,
      comptes_delete: true,
      todos_manage: true,
      incidents_manage: true,
      sync_dotb: true,
      export_data: true,
      import_data: true
    },
    cadre: {
      comptes: true,
      todos: true,
      classement: true,
      gagnants: true,
      incidents: true,
      messagerie: true,
      organisations: false,
      utilisateurs: true,
      corbeille: true,
      parametres: true,
      journal: true,
      comptes_create: true,
      comptes_edit: true,
      comptes_delete: true,
      todos_manage: true,
      incidents_manage: true,
      sync_dotb: false,
      export_data: true,
      import_data: false
    },
    agent: {
      comptes: true,
      todos: true,
      classement: true,
      gagnants: true,
      incidents: true,
      messagerie: true,
      organisations: false,
      utilisateurs: false,
      corbeille: false,
      parametres: false,
      journal: false,
      comptes_create: false,
      comptes_edit: false,
      comptes_delete: false,
      todos_manage: true,
      incidents_manage: true,
      sync_dotb: false,
      export_data: false,
      import_data: false
    },
    read_only: {
      comptes: true,
      todos: true,
      classement: true,
      gagnants: true,
      incidents: true,
      messagerie: true,
      organisations: false,
      utilisateurs: false,
      corbeille: false,
      parametres: false,
      journal: false,
      comptes_create: false,
      comptes_edit: false,
      comptes_delete: false,
      todos_manage: false,
      incidents_manage: false,
      sync_dotb: false,
      export_data: false,
      import_data: false
    }
  },
  getPermissions: function (user) {
    if (!user) return {};
    const role = user.role || 'agent';
    const basePreset = this.PRESETS[role] || this.PRESETS.agent;
    if (!user.permissions || typeof user.permissions !== 'object') {
      return {
        ...basePreset
      };
    }
    return {
      ...basePreset,
      ...user.permissions
    };
  },
  can: function (user, permKey) {
    if (!user) return false;
    if (user.role === 'admin' && (!user.permissions || user.permissions[permKey] === undefined)) {
      return true;
    }
    const perms = this.getPermissions(user);
    return Boolean(perms[permKey]);
  }
};

// ------------------- TOAST NOTIFICATION -------------------
function Toast({
  toast
}) {
  if (!toast || !toast.visible) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: `toast ${toast.isError ? 'toast-error' : ''}`,
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${toast.isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`,
    style: {
      marginRight: '8px'
    }
  }), toast.message);
}

// ------------------- SIDEBAR NAVIGATION -------------------
function Sidebar({
  currentUser,
  currentOrgId,
  organisations,
  activeView,
  onSelectView,
  onSwitchOrg,
  onLogout,
  onExportJSON,
  onImportJSON,
  corbeilleCount = 0,
  todoUrgentCount = 0,
  isOpen = false
}) {
  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';
  const canAccess = viewKey => PermissionManager.can(currentUser, viewKey);
  return /*#__PURE__*/React.createElement("aside", {
    className: `sidebar ${isOpen ? 'open' : ''}`,
    id: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-logo"
  }, "V"), /*#__PURE__*/React.createElement("h1", null, "Vinted Manager")), /*#__PURE__*/React.createElement("div", {
    className: "user-role-widget",
    style: {
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      margin: '10px 12px',
      border: '1px solid rgba(255,255,255,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'var(--text-muted)',
      marginBottom: '4px'
    }
  }, "Utilisateur Connect\xE9"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: '14px',
      color: 'var(--text-main)',
      marginBottom: '2px'
    }
  }, currentUser.nom || 'Utilisateur'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)',
      marginBottom: '8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, currentUser.email || ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: currentUser.role === 'admin' ? '#9333ea' : currentUser.role === 'cadre' ? '#0284c7' : '#16a34a',
      color: 'white',
      fontSize: '11px',
      padding: '2px 8px'
    }
  }, currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'cadre' ? 'Cadre' : 'Agent'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: onLogout,
    title: "Se d\xE9connecter",
    style: {
      padding: '3px 8px',
      fontSize: '11px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-right-from-bracket"
  }), " D\xE9connexion"))), canAccess('organisations') && /*#__PURE__*/React.createElement("div", {
    id: "orgSelectorWidget",
    style: {
      padding: '10px 14px',
      background: 'rgba(9, 177, 186, 0.04)',
      borderRadius: '8px',
      margin: '0 12px 14px 12px',
      border: '1px solid rgba(9, 177, 186, 0.15)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'var(--text-muted)',
      display: 'block',
      marginBottom: '4px'
    }
  }, "\uD83C\uDFE2 Organisation Active"), /*#__PURE__*/React.createElement("select", {
    value: currentOrgId,
    onChange: e => onSwitchOrg(e.target.value),
    style: {
      width: '100%',
      padding: '6px 8px',
      fontSize: '13px',
      borderRadius: '6px',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)'
    }
  }, (organisations || []).map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.nom)))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1
    }
  }, canAccess('comptes') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'comptes' ? 'active' : ''}`,
    onClick: () => onSelectView('comptes'),
    id: "nav-btn-comptes"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-store"
  }), " Comptes"), canAccess('todos') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'todos' ? 'active' : ''}`,
    onClick: () => onSelectView('todos'),
    id: "nav-btn-todos"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check"
  }), " To-Do & Rappels", todoUrgentCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge badge-urgent-pulse",
    style: {
      marginLeft: 'auto',
      background: '#ef4444',
      color: '#fff',
      fontSize: '10.5px',
      padding: '2px 7px',
      borderRadius: '10px'
    }
  }, todoUrgentCount)), canAccess('classement') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'classement' ? 'active' : ''}`,
    onClick: () => onSelectView('classement')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trophy"
  }), " Classement"), canAccess('gagnants') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'gagnants' ? 'active' : ''}`,
    onClick: () => onSelectView('gagnants')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-lightbulb"
  }), " Suggestions"), canAccess('incidents') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'incidents' ? 'active' : ''}`,
    onClick: () => onSelectView('incidents')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-triangle-exclamation"
  }), " Incidents"), canAccess('messagerie') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'messagerie' ? 'active' : ''}`,
    onClick: () => onSelectView('messagerie')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-comments"
  }), " Messagerie Vinted"), canAccess('organisations') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'organisations' ? 'active' : ''}`,
    onClick: () => onSelectView('organisations')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-sitemap"
  }), " Organisations"), canAccess('utilisateurs') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'utilisateurs' ? 'active' : ''}`,
    onClick: () => onSelectView('utilisateurs')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-users-gear"
  }), " Utilisateurs"), canAccess('corbeille') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'corbeille' ? 'active' : ''}`,
    onClick: () => onSelectView('corbeille')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash-can"
  }), " Corbeille", corbeilleCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      marginLeft: 'auto',
      background: '#ef4444',
      color: '#fff',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '10px'
    }
  }, corbeilleCount)), canAccess('parametres') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'parametres' ? 'active' : ''}`,
    onClick: () => onSelectView('parametres')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-sliders"
  }), " Param\xE8tres"), canAccess('journal') && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'journal' ? 'active' : ''}`,
    onClick: () => onSelectView('journal')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock-rotate-left"
  }), " Journal")));
}
function getTimeZoneOffsetMinutes(tzName, date = new Date()) {
  try {
    const format = new Intl.DateTimeFormat('en-US', {
      timeZone: tzName,
      timeZoneName: 'shortOffset'
    });
    const parts = format.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (!tzPart) return tzName.includes('Antananarivo') ? 180 : 120;
    const match = tzPart.value.match(/(?:GMT|UTC)?([+-]\d+)(?::(\d+))?/);
    if (!match) return tzName.includes('Antananarivo') ? 180 : 120;
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + (hours < 0 ? -minutes : minutes);
  } catch (e) {
    return tzName.includes('Antananarivo') ? 180 : 120;
  }
}
function convertHHMM(timeStr, dateStr, fromTZ, toTZ) {
  if (!timeStr) return {
    time: timeStr,
    dayShift: 0
  };
  const parts = timeStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const fromOffset = getTimeZoneOffsetMinutes(fromTZ === 'MADA' ? 'Indian/Antananarivo' : 'Europe/Paris');
  const toOffset = getTimeZoneOffsetMinutes(toTZ === 'MADA' ? 'Indian/Antananarivo' : 'Europe/Paris');
  const diff = toOffset - fromOffset;
  let totalMin = h * 60 + m + diff;
  let dayShift = 0;
  if (totalMin >= 1440) {
    totalMin -= 1440;
    dayShift = 1;
  } else if (totalMin < 0) {
    totalMin += 1440;
    dayShift = -1;
  }
  const finalH = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const finalM = String(totalMin % 60).padStart(2, '0');
  return {
    time: `${finalH}:${finalM}`,
    dayShift
  };
}

// ------------------- VIEW: DASHBOARD / CALENDRIER (SUPPRIMÉ) -------------------
function DashboardView() {
  return null;
}

// ------------------- VIEW: COMPTES -------------------
function ComptesView({
  currentUser,
  appState,
  onSaveCompte,
  onDeleteCompte,
  onBulkUpdateComptes,
  onBulkDeleteComptes,
  onOpenQuickAgentModal
}) {
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isCadre = currentUser && (currentUser.role === 'admin' || currentUser.role === 'cadre');
  const userOrgId = currentUser && currentUser.organisationId || 'org_default';
  const formRef = React.useRef(null);
  const [compteId, setCompteId] = useState('');
  const [numeroCompte, setNumeroCompte] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [gereParInitiales, setGereParInitiales] = useState('');
  const [agent, setAgent] = useState('');
  const [statut, setStatut] = useState('Actif');
  const [dateStatutCompte, setDateStatutCompte] = useState('');
  const [organisationId, setOrganisationId] = useState(userOrgId);
  const [dotbApiKey, setDotbApiKey] = useState('');
  const [couleurFond, setCouleurFond] = useState('');
  const [taille, setTaille] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCompteIds, setSelectedCompteIds] = useState([]);

  // Quick Text Import Modal State
  const [showTextModal, setShowTextModal] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const comptes = appState.comptes || [];
  const utilisateurs = appState.utilisateurs || [];
  const organisations = appState.organisations || [];
  const agentsList = useMemo(() => {
    let base = utilisateurs.filter(u => u.role === 'agent' || u.agentAssigne);
    if (!isAdmin) base = base.filter(u => (u.organisationId || 'org_default') === userOrgId);
    return base;
  }, [utilisateurs, isAdmin, userOrgId]);
  const [searchTermComptes, setSearchTermComptes] = useState('');
  const [filterStatutCompte, setFilterStatutCompte] = useState('');
  const [filterAgentCompte, setFilterAgentCompte] = useState('');
  const [filterGereParCompte, setFilterGereParCompte] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const handleCopyText = (text, type, accountId) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    const key = `${accountId}_${type}`;
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };
  const gereParList = useMemo(() => {
    const set = new Set();
    comptes.forEach(c => {
      if (c.gereParInitiales && c.gereParInitiales.trim() !== '') {
        set.add(c.gereParInitiales.trim());
      }
    });
    return Array.from(set).sort();
  }, [comptes]);
  const visibleComptes = useMemo(() => {
    let list = isAdmin ? comptes : comptes.filter(c => (c.organisationId || 'org_default') === userOrgId);

    // Si l'utilisateur est un agent, il voit ses comptes attribués par défaut
    if (!isAdmin && currentUser && currentUser.role === 'agent') {
      const userAgentName = (currentUser.nom || currentUser.agentAssigne || '').trim().toLowerCase();
      if (userAgentName && !filterAgentCompte) {
        const assignedOnly = list.filter(c => c.agent && c.agent.trim().toLowerCase() === userAgentName);
        if (assignedOnly.length > 0) {
          list = assignedOnly;
        }
      }
    }
    if (filterStatutCompte) {
      list = list.filter(c => c.statut === filterStatutCompte);
    }
    if (filterAgentCompte) {
      list = list.filter(c => (c.agent || '').trim().toLowerCase() === filterAgentCompte.trim().toLowerCase());
    }
    if (filterGereParCompte) {
      list = list.filter(c => (c.gereParInitiales || '').trim().toLowerCase() === filterGereParCompte.trim().toLowerCase());
    }
    if (searchTermComptes.trim()) {
      const q = searchTermComptes.trim().toLowerCase();
      list = list.filter(c => c.pseudo && c.pseudo.toLowerCase().includes(q) || c.numeroCompte && String(c.numeroCompte).toLowerCase().includes(q) || c.telephone && String(c.telephone).toLowerCase().includes(q) || c.email && c.email.toLowerCase().includes(q) || c.agent && c.agent.toLowerCase().includes(q) || c.gereParInitiales && c.gereParInitiales.toLowerCase().includes(q) || c.notes && c.notes.toLowerCase().includes(q));
    }
    const getStatusPriority = statut => {
      const s = (statut || '').toLowerCase();
      if (s.includes('limité') || s.includes('restreint')) return 1;
      if (s.includes('pause')) return 2;
      if (s.includes('actif')) return 3;
      if (s.includes('banni') || s.includes('bloqué')) return 99; // Comptes bannis tout en bas !
      return 3;
    };
    return [...list].sort((a, b) => {
      const prioA = getStatusPriority(a.statut);
      const prioB = getStatusPriority(b.statut);
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      return (parseInt(a.numeroCompte) || 0) - (parseInt(b.numeroCompte) || 0);
    });
  }, [comptes, isAdmin, userOrgId, filterStatutCompte, filterAgentCompte, filterGereParCompte, searchTermComptes]);
  const isAllComptesSelected = useMemo(() => {
    return visibleComptes.length > 0 && visibleComptes.every(c => selectedCompteIds.includes(c.id));
  }, [visibleComptes, selectedCompteIds]);
  const toggleSelectAllComptes = () => {
    if (isAllComptesSelected) setSelectedCompteIds([]);else setSelectedCompteIds(visibleComptes.map(c => c.id));
  };
  const toggleSelectCompte = id => {
    setSelectedCompteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleBulkCompteStatut = async newStatut => {
    if (selectedCompteIds.length === 0 || !onBulkUpdateComptes) return;
    await onBulkUpdateComptes(selectedCompteIds, {
      statut: newStatut
    });
    setSelectedCompteIds([]);
  };
  const handleBulkDeleteComptesAction = async () => {
    if (selectedCompteIds.length === 0 || !onBulkDeleteComptes) return;
    if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedCompteIds.length} comptes sélectionnés ?`)) {
      await onBulkDeleteComptes(selectedCompteIds);
      setSelectedCompteIds([]);
    }
  };
  const handleEdit = c => {
    setCompteId(c.id);
    setNumeroCompte(c.numeroCompte || '');
    setPseudo(c.pseudo || '');
    setTelephone(c.telephone || '');
    setEmail(c.email || '');
    setMotDePasse(c.motDePasse || '');
    setGereParInitiales(c.gereParInitiales || '');
    setAgent(c.agent || '');
    setStatut(c.statut || 'Actif');
    setDateStatutCompte(c.dateStatutCompte || '');
    setOrganisationId(isAdmin ? c.organisationId || 'org_default' : userOrgId);
    setDotbApiKey(c.dotbApiKey || '');
    setCouleurFond(c.couleurFond || c.couleur_fond || '');
    setTaille(c.taille || c.taille_vetement || '');
    setNotes(c.notes || '');
    // Scroll to form smoothly after state update
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Focus the pseudo field
        const pseudoInput = formRef.current.querySelector('input[placeholder*="pseudo"], input[placeholder*="isis_mlf"]');
        if (pseudoInput) pseudoInput.focus();
      }
    }, 50);
  };
  const handleReset = () => {
    setCompteId('');
    setNumeroCompte('');
    setPseudo('');
    setTelephone('');
    setEmail('');
    setMotDePasse('');
    setGereParInitiales('');
    setAgent('');
    setStatut('Actif');
    setDateStatutCompte('');
    setOrganisationId(userOrgId);
    setDotbApiKey('');
    setCouleurFond('');
    setTaille('');
    setNotes('');
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSaveCompte({
      id: compteId,
      numeroCompte,
      pseudo,
      telephone,
      email,
      motDePasse,
      gereParInitiales,
      agent: agent || 'À attribuer',
      statut,
      dateStatutCompte,
      organisationId: isAdmin ? organisationId : userOrgId,
      dotbApiKey,
      couleurFond: couleurFond.trim(),
      taille: taille.trim(),
      notes
    });
    handleReset();
  };

  // Helper text parser for bulk pasted accounts text
  const handleParseAndImportText = async () => {
    if (!rawImportText.trim()) return;
    const blocks = rawImportText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    let count = 0;
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;
      let num = '';
      let pseudoStr = '';
      let tel = '';
      let emailStr = '';
      let mp = '';
      let initiales = '';
      let statutStr = 'Actif';
      let dateStatut = '';
      let notesArr = [];
      let idx = 0;
      if (/^\d+$/.test(lines[idx])) {
        num = lines[idx];
        idx++;
      }
      if (idx < lines.length) {
        pseudoStr = lines[idx];
        idx++;
      }
      while (idx < lines.length) {
        const line = lines[idx];
        if (!tel && (/^0\d/i.test(line) || /\d{2}\s*\d{2}/.test(line))) {
          tel = line;
        } else if (!emailStr && (line.includes('@') || line.includes('.'))) {
          emailStr = line;
        } else if (!initiales && line.length <= 4 && /^[A-Z]{2,4}$/.test(line)) {
          initiales = line;
        } else if (!mp && (line.includes('*') || line.includes('&') || line.length >= 6) && !line.toLowerCase().includes('actif') && !line.toLowerCase().includes('bloqué') && !line.toLowerCase().includes('connecté')) {
          mp = line;
        } else if (line.toLowerCase().includes('actif') || line.toLowerCase().includes('bloqué') || line.toLowerCase().includes('banni') || line.toLowerCase().includes('limité') || line.toLowerCase().includes('pause')) {
          if (line.toLowerCase().includes('pause')) statutStr = 'Pause';else if (line.toLowerCase().includes('bloqué') || line.toLowerCase().includes('banni')) statutStr = 'Banni';else if (line.toLowerCase().includes('limité') || line.toLowerCase().includes('restreint')) statutStr = 'Limité';else statutStr = 'Actif';
          const dateMatch = line.match(/\d{2}\/\d{2}\/\d{4}/) || line.match(/\d{2}\/\d{2}\/\d{2}/);
          if (dateMatch) dateStatut = dateMatch[0];
          const restOfLine = line.replace(/actif|bloqué|banni|limité|restreint|pause|\d{2}\/\d{2}\/\d{2,4}/gi, '').trim();
          if (restOfLine) notesArr.push(restOfLine);
        } else {
          notesArr.push(line);
        }
        idx++;
      }
      const cId = `compte_${num || Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      await onSaveCompte({
        id: cId,
        numeroCompte: num,
        pseudo: pseudoStr,
        telephone: tel,
        email: emailStr,
        motDePasse: mp,
        gereParInitiales: initiales,
        agent: 'À attribuer',
        statut: statutStr,
        dateStatutCompte: dateStatut,
        organisationId: userOrgId,
        notes: notesArr.join(' | ')
      });
      count++;
    }
    setShowTextModal(false);
    setRawImportText('');
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "page-title"
  }, "Gestion des Comptes Vinted"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '14px',
      marginTop: '4px'
    }
  }, isCadre ? "Gérez les comptes Vinted (N°, pseudo, tél, email, mot de passe, géré par, statut et date)" : "Consultez les détails et identifiants de vos comptes attribués")), isCadre && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: () => setShowTextModal(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-file-import"
  }), " Importer par Texte"))), showTextModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content card",
    style: {
      maxWidth: '650px',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-paste",
    style: {
      color: 'var(--primary)',
      marginRight: '8px'
    }
  }), "Importation Rapide de Comptes en Masse (Format Texte)"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)',
      marginBottom: '16px'
    }
  }, "Collez simplement votre liste de comptes au format brut (N\xB0, Pseudo, T\xE9l\xE9phone, Email, Mot de passe, Initiales, Statut & Date). Le syst\xE8me va tout d\xE9duire et cr\xE9er automatiquement les comptes !"), /*#__PURE__*/React.createElement("textarea", {
    className: "input",
    rows: "10",
    style: {
      width: '100%',
      fontFamily: 'monospace',
      fontSize: '12.5px',
      marginBottom: '16px',
      padding: '12px'
    },
    value: rawImportText,
    onChange: e => setRawImportText(e.target.value),
    placeholder: `Exemple à copier :\n48\nisis_mlf\n06 33 40 86 06\njuyjgj26@gmail.com\nVinted009&*\nTD\nactif 28/07/2026\n\n49\nnaya_sky\n06 33 43 85 51\nee010010@outlook.fr\nVinted009&*\nTD\nactif 31/07/2026\nconnecté à Adspower le 05/08/26`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: () => setShowTextModal(false)
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: handleParseAndImportText
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rocket"
  }), " Importer & Enregistrer les Comptes")))), isCadre && /*#__PURE__*/React.createElement("div", {
    ref: formRef,
    className: "card",
    style: {
      marginBottom: '24px',
      scrollMarginTop: '20px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, compteId ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen-to-square",
    style: {
      color: 'var(--accent)'
    }
  }), " Modifier le compte ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 700
    }
  }, "#", numeroCompte || compteId)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-plus-circle",
    style: {
      color: 'var(--success)'
    }
  }), " Ajouter un nouveau compte Vinted")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "N\xB0 Compte (Proxy)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: numeroCompte,
    onChange: e => setNumeroCompte(e.target.value),
    placeholder: "ex: 48"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Pseudo Vinted"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: pseudo,
    onChange: e => setPseudo(e.target.value),
    placeholder: "ex: isis_mlf",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "N\xB0 T\xE9l\xE9phone"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: telephone,
    onChange: e => setTelephone(e.target.value),
    placeholder: "ex: 06 33 40 86 06"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Adresse Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "ex: juyjgj26@gmail.com"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Mot de Passe Vinted"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: motDePasse,
    onChange: e => setMotDePasse(e.target.value),
    placeholder: "ex: Vinted009&*"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "G\xE9r\xE9 par (Initiales)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: gereParInitiales,
    onChange: e => setGereParInitiales(e.target.value),
    placeholder: "ex: TD, EG"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      marginBottom: 0
    }
  }, "Agent Responsable"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: onOpenQuickAgentModal,
    style: {
      fontSize: '11px',
      padding: '2px 8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-user-plus"
  }), " + Cr\xE9er Agent")), /*#__PURE__*/React.createElement("select", {
    value: agent,
    onChange: e => setAgent(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\xC0 attribuer (Non sp\xE9cifi\xE9)"), agentsList.map(a => /*#__PURE__*/React.createElement("option", {
    key: a.id,
    value: a.agentAssigne || a.nom
  }, a.nom, " (", a.agentAssigne || a.role, ")")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Statut du compte"), /*#__PURE__*/React.createElement("select", {
    value: statut,
    onChange: e => setStatut(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "Actif"
  }, "Actif"), /*#__PURE__*/React.createElement("option", {
    value: "Pause"
  }, "Pause"), /*#__PURE__*/React.createElement("option", {
    value: "Limit\xE9"
  }, "Limit\xE9 / Restreint"), /*#__PURE__*/React.createElement("option", {
    value: "Banni"
  }, "Banni / Bloqu\xE9"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Date du Statut"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: dateStatutCompte,
    onChange: e => setDateStatutCompte(e.target.value),
    placeholder: "ex: 28/07/2026"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-palette",
    style: {
      color: '#ec4899'
    }
  }), " Code Couleur de Fond"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: couleurFond,
    onChange: e => setCouleurFond(e.target.value),
    placeholder: "ex: #ffffff, Fond Bois, Beige, #f1f5f9",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: couleurFond && couleurFond.startsWith('#') && couleurFond.length === 7 ? couleurFond : '#ffffff',
    onChange: e => setCouleurFond(e.target.value),
    style: {
      width: '38px',
      height: '38px',
      padding: '2px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    title: "Choisir une couleur"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-ruler",
    style: {
      color: '#8b5cf6'
    }
  }), " Taille des Articles (Input Text)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: taille,
    onChange: e => setTaille(e.target.value),
    placeholder: "ex: S, M, L, 38-40, XS-S"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Organisation"), /*#__PURE__*/React.createElement("select", {
    value: isAdmin ? organisationId : userOrgId,
    onChange: e => setOrganisationId(e.target.value),
    disabled: !isAdmin
  }, organisations.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.nom))))), /*#__PURE__*/React.createElement("div", {
    className: "grid-1",
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Notes & Observations (Adspower, Ventes, etc.)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "ex: connect\xE9 \xE0 Adspower le 05/08/26, 1 article en vente"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-floppy-disk"
  }), " Enregistrer le Compte"), compteId && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleReset
  }, "Annuler")))), isCadre && selectedCompteIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: '10px',
      zIndex: 1000,
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '12px 18px',
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 600,
      fontSize: '13.5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: '#09b1ba',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#fff'
    }
  }, "\u2713 ", selectedCompteIds.length, " compte", selectedCompteIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      backgroundColor: '#10b981',
      color: '#fff',
      border: 'none',
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => handleBulkCompteStatut('Actif')
  }, "Statut Actif"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      backgroundColor: '#6366f1',
      color: '#fff',
      border: 'none',
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => handleBulkCompteStatut('Pause')
  }, "Statut Pause"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      backgroundColor: '#f59e0b',
      color: '#fff',
      border: 'none',
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => handleBulkCompteStatut('Limité')
  }, "Statut Limit\xE9"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      backgroundColor: '#ef4444',
      color: '#fff',
      border: 'none',
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => handleBulkCompteStatut('Banni')
  }, "Statut Banni"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-danger",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: handleBulkDeleteComptesAction
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash",
    style: {
      marginRight: '4px'
    }
  }), " Supprimer (", selectedCompteIds.length, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-secondary",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => setSelectedCompteIds([])
  }, "Annuler"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      margin: 0
    }
  }, "Liste des Comptes enregistr\xE9s (", visibleComptes.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      maxWidth: '750px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 2,
      minWidth: '220px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-magnifying-glass",
    style: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--primary)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: searchTermComptes,
    onChange: e => setSearchTermComptes(e.target.value),
    placeholder: "\uD83D\uDD0D Recherche avanc\xE9e compte (N\xB0, Pseudo, T\xE9l, Email, Agent, Notes...)",
    style: {
      paddingLeft: '36px',
      paddingRight: '28px',
      height: '38px',
      fontSize: '13px',
      borderRadius: '8px'
    }
  }), searchTermComptes && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSearchTermComptes(''),
    style: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterStatutCompte,
    onChange: e => setFilterStatutCompte(e.target.value),
    style: {
      flex: 1,
      minWidth: '130px',
      height: '38px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous statuts"), /*#__PURE__*/React.createElement("option", {
    value: "Actif"
  }, "\uD83D\uDFE2 Actif"), /*#__PURE__*/React.createElement("option", {
    value: "Pause"
  }, "\uD83D\uDFE3 Pause"), /*#__PURE__*/React.createElement("option", {
    value: "Limit\xE9"
  }, "\uD83D\uDFE0 Limit\xE9"), /*#__PURE__*/React.createElement("option", {
    value: "Banni"
  }, "\uD83D\uDD34 Banni")), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterAgentCompte,
    onChange: e => setFilterAgentCompte(e.target.value),
    style: {
      flex: 1,
      minWidth: '140px',
      height: '38px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous agents"), /*#__PURE__*/React.createElement("option", {
    value: "\xC0 attribuer"
  }, "\uD83D\uDC64 \xC0 attribuer"), agentsList.map(a => /*#__PURE__*/React.createElement("option", {
    key: a.id,
    value: a.agentAssigne || a.nom
  }, a.nom))), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterGereParCompte,
    onChange: e => setFilterGereParCompte(e.target.value),
    style: {
      flex: 1,
      minWidth: '130px',
      height: '38px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous g\xE9r\xE9 par"), gereParList.map(g => /*#__PURE__*/React.createElement("option", {
    key: g,
    value: g
  }, "\uD83C\uDFF7\uFE0F G\xE9r\xE9 par : ", g))), (searchTermComptes || filterStatutCompte || filterAgentCompte || filterGereParCompte) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => {
      setSearchTermComptes('');
      setFilterStatutCompte('');
      setFilterAgentCompte('');
      setFilterGereParCompte('');
    },
    style: {
      height: '38px',
      padding: '0 12px',
      fontSize: '12px',
      color: '#ef4444',
      borderColor: '#fca5a5'
    },
    title: "R\xE9initialiser les filtres"
  }, "\uD83D\uDD04 Effacer"))), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, isCadre && /*#__PURE__*/React.createElement("th", {
    style: {
      width: '40px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isAllComptesSelected,
    onChange: toggleSelectAllComptes,
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("th", null, "Statut & Date"), /*#__PURE__*/React.createElement("th", null, "N\xB0 Proxy"), /*#__PURE__*/React.createElement("th", null, "Pseudo"), /*#__PURE__*/React.createElement("th", null, "G\xE9r\xE9 par"), /*#__PURE__*/React.createElement("th", null, "Agent"), /*#__PURE__*/React.createElement("th", null, "Couleur Fond"), /*#__PURE__*/React.createElement("th", null, "Taille"), /*#__PURE__*/React.createElement("th", null, "T\xE9l\xE9phone"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Mot de passe"), /*#__PURE__*/React.createElement("th", null, "Notes & Observations"), isCadre && /*#__PURE__*/React.createElement("th", {
    style: {
      width: '90px',
      minWidth: '90px',
      textAlign: 'center'
    }
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, visibleComptes.length > 0 ? visibleComptes.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    style: {
      backgroundColor: selectedCompteIds.includes(c.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
    }
  }, isCadre && /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: selectedCompteIds.includes(c.id),
    onChange: () => toggleSelectCompte(c.id),
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${c.statut === 'Actif' ? 'badge-actif' : c.statut === 'Pause' ? 'badge-pause' : c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'}`
  }, c.statut), c.dateStatutCompte && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: 'var(--text-muted)',
      display: 'block',
      marginTop: '2px'
    }
  }, c.dateStatutCompte)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--primary)'
    }
  }, c.numeroCompte || '-'), c.numeroCompte && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.numeroCompte, 'num', c.id),
    title: "Copier le N\xB0 Proxy",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '2px 4px',
      color: copiedField === `${c.id}_num` ? '#10b981' : '#94a3b8',
      fontSize: '11px',
      transition: 'color 0.2s'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${copiedField === `${c.id}_num` ? 'fa-check' : 'fa-copy'}`
  })))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("b", null, c.pseudo), c.pseudo && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.pseudo, 'pseudo', c.id),
    title: "Copier le pseudo",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '2px 4px',
      color: copiedField === `${c.id}_pseudo` ? '#10b981' : '#94a3b8',
      fontSize: '11px',
      transition: 'color 0.2s'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${copiedField === `${c.id}_pseudo` ? 'fa-check' : 'fa-copy'}`
  })))), /*#__PURE__*/React.createElement("td", null, c.gereParInitiales ? /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: '#475569',
      color: '#fff'
    }
  }, c.gereParInitiales) : '-'), /*#__PURE__*/React.createElement("td", null, c.agent && c.agent !== 'À attribuer' ? /*#__PURE__*/React.createElement("span", {
    className: "badge badge-agent"
  }, c.agent) : /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: '#64748b',
      color: '#fff'
    }
  }, "\xC0 attribuer")), /*#__PURE__*/React.createElement("td", null, c.couleurFond ? /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: c.couleurFond.startsWith('#') && c.couleurFond.length === 7 ? c.couleurFond : '#f8fafc',
      color: c.couleurFond.startsWith('#') && c.couleurFond.length === 7 ? '#1e293b' : '#334155',
      border: '1px solid #cbd5e1',
      padding: '3px 9px',
      fontSize: '11.5px',
      borderRadius: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: c.couleurFond.startsWith('#') && c.couleurFond.length === 7 ? c.couleurFond : '#cbd5e1',
      border: '1px solid rgba(0,0,0,0.25)',
      display: 'inline-block'
    }
  }), c.couleurFond) : '-'), /*#__PURE__*/React.createElement("td", null, c.taille ? /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: '#f3e8ff',
      color: '#6b21a8',
      border: '1px solid #d8b4fe',
      padding: '3px 9px',
      fontSize: '11.5px',
      fontWeight: 700,
      borderRadius: '12px'
    }
  }, "\uD83D\uDCCF ", c.taille) : '-'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, c.telephone || '-'), c.telephone && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.telephone, 'tel', c.id),
    title: "Copier le t\xE9l\xE9phone",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '2px 4px',
      color: copiedField === `${c.id}_tel` ? '#10b981' : '#94a3b8',
      fontSize: '11px',
      transition: 'color 0.2s'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${copiedField === `${c.id}_tel` ? 'fa-check' : 'fa-copy'}`
  })))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px'
    }
  }, c.email || '-'), c.email && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.email, 'email', c.id),
    title: "Copier l'email",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '2px 4px',
      color: copiedField === `${c.id}_email` ? '#10b981' : '#94a3b8',
      fontSize: '11px',
      transition: 'color 0.2s'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${copiedField === `${c.id}_email` ? 'fa-check' : 'fa-copy'}`
  })))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: '11px',
      backgroundColor: '#f1f5f9',
      padding: '2px 5px',
      borderRadius: '4px'
    }
  }, c.motDePasse || '-'), c.motDePasse && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.motDePasse, 'mp', c.id),
    title: "Copier le mot de passe",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: '2px 4px',
      color: copiedField === `${c.id}_mp` ? '#10b981' : '#94a3b8',
      fontSize: '11px',
      transition: 'color 0.2s'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${copiedField === `${c.id}_mp` ? 'fa-check' : 'fa-copy'}`
  })))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: '12px',
      width: '220px',
      minWidth: '180px',
      maxWidth: '240px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, c.notes ? /*#__PURE__*/React.createElement("span", {
    title: c.notes,
    style: {
      color: '#334155',
      fontWeight: 500,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.35',
      wordBreak: 'break-word'
    }
  }, c.notes) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#94a3b8'
    }
  }, "-"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(`N°${c.numeroCompte || ''} | Pseudo: ${c.pseudo || ''} | Tél: ${c.telephone || ''} | Email: ${c.email || ''} | MP: ${c.motDePasse || ''}`, 'all', c.id),
    title: "Copier TOUS les identifiants",
    style: {
      alignSelf: 'flex-start',
      border: '1px solid #cbd5e1',
      background: copiedField === `${c.id}_all` ? '#dcfce7' : '#f8fafc',
      borderRadius: '4px',
      cursor: 'pointer',
      padding: '2px 8px',
      color: copiedField === `${c.id}_all` ? '#166534' : '#475569',
      fontSize: '10.5px',
      fontWeight: 600,
      marginTop: '2px',
      whiteSpace: 'nowrap'
    }
  }, copiedField === `${c.id}_all` ? '✓ Copié !' : '📋 Tout copier'))), isCadre && /*#__PURE__*/React.createElement("td", {
    style: {
      width: '90px',
      minWidth: '90px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => handleEdit(c),
    title: "\xC9diter le compte",
    style: {
      width: '30px',
      height: '30px',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => onDeleteCompte(c.id),
    title: "Supprimer le compte",
    style: {
      width: '30px',
      height: '30px',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  })))))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "13",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun compte Vinted enregistr\xE9.")))))));
}
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ------------------- VIEW: PLANNING GENERATION (SUPPRIMÉ) -------------------
function PlanningView() {
  return null;
}

// ------------------- VIEW: INCIDENTS -------------------
function IncidentsView({
  appState,
  onSaveIncident,
  onBulkDeleteIncidents
}) {
  const todayDateTimeStr = new Date().toISOString().slice(0, 16);
  const formRef = React.useRef(null);
  const [editingIncidentId, setEditingIncidentId] = useState('');
  const [compteId, setCompteId] = useState('');
  const [type, setType] = useState('Limitation');
  const [dateHeure, setDateHeure] = useState(todayDateTimeStr);
  const [nbAnnonces, setNbAnnonces] = useState('');
  const [skuAnnonces, setSkuAnnonces] = useState('');
  const [notesActivites, setNotesActivites] = useState('');
  const [selectedIncidentIds, setSelectedIncidentIds] = useState([]);
  const comptes = appState.comptes || [];
  const incidents = appState.incidents || [];
  const isAllIncidentsSelected = useMemo(() => {
    return incidents.length > 0 && incidents.every(i => selectedIncidentIds.includes(i.id));
  }, [incidents, selectedIncidentIds]);
  const toggleSelectAllIncidents = () => {
    if (isAllIncidentsSelected) setSelectedIncidentIds([]);else setSelectedIncidentIds(incidents.map(i => i.id));
  };
  const toggleSelectIncident = id => {
    setSelectedIncidentIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const handleBulkDeleteIncidentsAction = async () => {
    if (selectedIncidentIds.length === 0 || !onBulkDeleteIncidents) return;
    if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedIncidentIds.length} incidents sélectionnés ?`)) {
      await onBulkDeleteIncidents(selectedIncidentIds);
      setSelectedIncidentIds([]);
    }
  };
  const getComptePseudo = cId => {
    const c = comptes.find(comp => comp.id === cId);
    if (!c) return cId || 'Inconnu';
    return c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`);
  };
  const handleEditIncident = inc => {
    setEditingIncidentId(inc.id);
    setCompteId(inc.compteId || '');
    setType(inc.type || 'Limitation');
    const d = inc.dateBlocage || '';
    const h = inc.heureBlocage || '12:00';
    setDateHeure(d && h ? `${d}T${h}` : todayDateTimeStr);
    setNbAnnonces(inc.nbAnnoncesMasquees || '');
    setSkuAnnonces(inc.skuAnnoncesMasquees || '');
    setNotesActivites(inc.notesActivites || '');
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleResetForm = () => {
    setEditingIncidentId('');
    setCompteId('');
    setType('Limitation');
    setDateHeure(todayDateTimeStr);
    setNbAnnonces('');
    setSkuAnnonces('');
    setNotesActivites('');
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!compteId || !dateHeure) return;
    onSaveIncident({
      id: editingIncidentId || undefined,
      compteId,
      type,
      dateHeure,
      nbAnnoncesMasquees: parseInt(nbAnnonces) || 0,
      skuAnnoncesMasquees: skuAnnonces,
      notesActivites: notesActivites
    });
    handleResetForm();
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Gestion des Incidents & Limitations"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    },
    ref: formRef
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${editingIncidentId ? 'fa-pen-to-square' : 'fa-shield-cat'}`,
    style: {
      color: editingIncidentId ? 'var(--primary)' : 'var(--danger)',
      marginRight: '8px'
    }
  }), editingIncidentId ? 'Modifier l\'Incident' : 'Déclarer un Incident Compte'), editingIncidentId && /*#__PURE__*/React.createElement("span", {
    className: "badge badge-warning",
    style: {
      fontSize: '12px'
    }
  }, "\xC9dition Mode : #", editingIncidentId)), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Compte Impact\xE9"), /*#__PURE__*/React.createElement("select", {
    value: compteId,
    onChange: e => setCompteId(e.target.value),
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "S\xE9lectionner un compte..."), comptes.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.pseudo, " (", c.agent, ")")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Type d'Incident"), /*#__PURE__*/React.createElement("select", {
    value: type,
    onChange: e => setType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "Limitation"
  }, "Limitation temporaire"), /*#__PURE__*/React.createElement("option", {
    value: "Ban temporaire"
  }, "Ban temporaire"), /*#__PURE__*/React.createElement("option", {
    value: "Ban d\xE9finitif"
  }, "Ban d\xE9finitif"), /*#__PURE__*/React.createElement("option", {
    value: "Annonces masqu\xE9es"
  }, "Annonces masqu\xE9es"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Date & Heure du Blocage"), /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    value: dateHeure,
    onChange: e => setDateHeure(e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginTop: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Notes & Activit\xE9s Suspectes (Cause / Actions ayant pu provoquer l'incident)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: notesActivites,
    onChange: e => setNotesActivites(e.target.value),
    placeholder: "ex: 5 republications rapides en 10 min, Changement d'IP Proxy Adspower, Message suspect Vinted..."
  })), type === 'Annonces masquées' && /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      marginTop: '15px',
      background: 'rgba(239, 68, 68, 0.05)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px dashed var(--danger)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Nombre d'Annonces Masqu\xE9es"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    value: nbAnnonces,
    onChange: e => setNbAnnonces(e.target.value),
    placeholder: "ex: 5",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "SKU des Annonces Masqu\xE9es"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: skuAnnonces,
    onChange: e => setSkuAnnonces(e.target.value),
    placeholder: "ex: SKU-101, SKU-102",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: `btn ${editingIncidentId ? 'btn-primary' : 'btn-danger'}`
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${editingIncidentId ? 'fa-floppy-disk' : 'fa-triangle-exclamation'}`,
    style: {
      marginRight: '6px'
    }
  }), editingIncidentId ? 'Mettre à jour l\'incident' : 'Enregistrer l\'incident'), editingIncidentId && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleResetForm
  }, "Annuler la modification")))), selectedIncidentIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: '10px',
      zIndex: 1000,
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '12px 18px',
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 600,
      fontSize: '13.5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: '#09b1ba',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#fff'
    }
  }, "\u2713 ", selectedIncidentIds.length, " incident", selectedIncidentIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-danger",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: handleBulkDeleteIncidentsAction
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash",
    style: {
      marginRight: '4px'
    }
  }), " Supprimer (", selectedIncidentIds.length, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-secondary",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => setSelectedIncidentIds([])
  }, "Annuler"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "Historique des Incidents"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '40px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isAllIncidentsSelected,
    onChange: toggleSelectAllIncidents,
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("th", null, "Date & Heure"), /*#__PURE__*/React.createElement("th", null, "Compte"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Pubs 24h Pr\xE9c\xE9dentes"), /*#__PURE__*/React.createElement("th", null, "D\xE9tail Ventes / Annonces"), /*#__PURE__*/React.createElement("th", null, "Cause Suspect\xE9e / Activit\xE9s"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '110px',
      textAlign: 'center'
    }
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, incidents.length > 0 ? incidents.map(inc => {
    const isAnnoncesMasquees = inc.type === 'Annonces masquées';
    const badgeClass = isAnnoncesMasquees ? 'badge-warning' : inc.type === 'Ban définitif' ? 'badge-banni' : 'badge-limite';
    const detailsCol = isAnnoncesMasquees ? `🙈 ${inc.nbAnnoncesMasquees || 0} annonces (SKU: ${inc.skuAnnoncesMasquees || 'Non renseigné'})` : `${inc.nbVentesConnues || 0} ventes (${(inc.detailVentes || []).join(', ')})`;
    const isCurrentlyEditing = inc.id === editingIncidentId;
    return /*#__PURE__*/React.createElement("tr", {
      key: inc.id,
      style: {
        backgroundColor: isCurrentlyEditing ? 'rgba(99, 102, 241, 0.12)' : selectedIncidentIds.includes(inc.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selectedIncidentIds.includes(inc.id),
      onChange: () => toggleSelectIncident(inc.id),
      style: {
        width: '16px',
        height: '16px',
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, inc.dateBlocage), " ", inc.heureBlocage), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-compte"
    }, getComptePseudo(inc.compteId))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: `badge ${badgeClass}`
    }, inc.type)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, inc.nbPubs24h), " pubs"), /*#__PURE__*/React.createElement("td", null, detailsCol), /*#__PURE__*/React.createElement("td", null, inc.notesActivites ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#334155',
        fontWeight: 500
      }
    }, "\uD83D\uDCDD ", inc.notesActivites) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '11px',
        color: '#94a3b8'
      }
    }, "-")), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-primary btn-sm",
      style: {
        padding: '4px 8px',
        fontSize: '11px'
      },
      onClick: () => handleEditIncident(inc),
      title: "\xC9diter les d\xE9tails de cet incident"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-pen"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-danger btn-sm",
      style: {
        padding: '4px 8px',
        fontSize: '11px'
      },
      onClick: () => {
        if (window.confirm("Voulez-vous vraiment supprimer cet incident ?")) {
          onBulkDeleteIncidents([inc.id]);
        }
      },
      title: "Supprimer cet incident"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-trash"
    })))));
  }) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "8",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun incident enregistr\xE9.")))))));
}

// ------------------- VIEW: PARAMETRES -------------------
function ParametresView({
  appState,
  onSaveParametres
}) {
  const p = appState.parametres || {};
  const [modePlanif, setModePlanif] = useState(p.modePlanification || 'intervalle');
  const [decalage, setDecalage] = useState(p.decalageMinutesEntreComptes || 60);
  const [margeAleatoire, setMargeAleatoire] = useState(p.margeAleatoireMinutes !== undefined ? p.margeAleatoireMinutes : 15);
  const [poidsVues, setPoidsVues] = useState(p.poidsScore && p.poidsScore.vues || 0.1);
  const [poidsLikes, setPoidsLikes] = useState(p.poidsScore && p.poidsScore.likes || 1);
  const [poidsFavoris, setPoidsFavoris] = useState(p.poidsScore && p.poidsScore.favoris || 2);
  const [poidsMessages, setPoidsMessages] = useState(p.poidsScore && p.poidsScore.messages || 5);
  const [poidsVente, setPoidsVente] = useState(p.poidsScore && p.poidsScore.vente || 20);
  const [seuilEcarte, setSeuilEcarte] = useState(p.seuils && p.seuils.ecarte || 15);
  const [seuilGagnant, setSeuilGagnant] = useState(p.seuils && p.seuils.gagnant || 40);
  const [creneaux, setCreneaux] = useState(p.creneauxParJour || 3);
  const [delaiRepost, setDelaiRepost] = useState(p.delaiProchainRepostMinutes || 30);
  const [joursDefaut, setJoursDefaut] = useState(p.nbJoursPlanningParDefaut || 7);

  // Clé API Full Access DotB unique centralisée & Options Avancées
  const [dotbApiKey, setDotbApiKey] = useState(p.dotbApiKey || 'dotb_pk_pmXggjdukM3FR-YCw2cXsgug2YrtJa_0ZBX9s5J6Wf8');
  const [dotbPeriod, setDotbPeriod] = useState('all');
  const [dotbDataTypes, setDotbDataTypes] = useState(['items_published', 'items_drafts', 'items_hidden', 'messages', 'orders', 'views_likes', 'incidents']);
  const handleSubmit = e => {
    e.preventDefault();
    onSaveParametres({
      modePlanification: modePlanif,
      decalageMinutesEntreComptes: parseInt(decalage) || 60,
      margeAleatoireMinutes: parseInt(margeAleatoire) || 0,
      poidsScore: {
        vues: parseFloat(poidsVues) || 0,
        likes: parseFloat(poidsLikes) || 0,
        favoris: parseFloat(poidsFavoris) || 0,
        messages: parseFloat(poidsMessages) || 0,
        vente: parseFloat(poidsVente) || 0
      },
      seuils: {
        ecarte: parseFloat(seuilEcarte) || 15,
        gagnant: parseFloat(seuilGagnant) || 40
      },
      creneauxParJour: parseInt(creneaux) || 3,
      delaiProchainRepostMinutes: parseInt(delaiRepost) || 30,
      nbJoursPlanningParDefaut: parseInt(joursDefaut) || 7,
      dotbApiKey: dotbApiKey.trim()
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Param\xE8tres M\xE9tier & Algorithmes"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "\u2699\uFE0F Mode de Planification & D\xE9calage Horaire des Publications"), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Mode d'Heure de Publication"), /*#__PURE__*/React.createElement("select", {
    value: modePlanif,
    onChange: e => setModePlanif(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "intervalle"
  }, "\u23F1\uFE0F Temps Intervall\xE9 (Glissant avec d\xE9calage)"), /*#__PURE__*/React.createElement("option", {
    value: "aleatoire"
  }, "\uD83C\uDFB2 Temps Randomis\xE9 (Intervalle al\xE9atoire humanis\xE9)"), /*#__PURE__*/React.createElement("option", {
    value: "fixe"
  }, "\uD83D\uDCCC Temps Fixe (Heures fixes)"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "D\xE9calage Min. entre Comptes (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: decalage,
    onChange: e => setDecalage(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Variation / Marge Al\xE9atoire (\xB1 min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: margeAleatoire,
    onChange: e => setMargeAleatoire(e.target.value)
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "\uD83D\uDCCA Pond\xE9ration du Score & Seuils de Classification"), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Poids : Vues"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    value: poidsVues,
    onChange: e => setPoidsVues(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Poids : Favoris"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    value: poidsFavoris,
    onChange: e => setPoidsFavoris(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Poids : Vente Directe"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    value: poidsVente,
    onChange: e => setPoidsVente(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Seuil \xC9cart\xE9 (<)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: seuilEcarte,
    onChange: e => setSeuilEcarte(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Seuil Gagnant (>=)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: seuilGagnant,
    onChange: e => setSeuilGagnant(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Cr\xE9neaux / Jour / Compte"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: creneaux,
    onChange: e => setCreneaux(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "D\xE9lai Prochain Repost (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: delaiRepost,
    onChange: e => setDelaiRepost(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Jours Planning par D\xE9faut"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: joursDefaut,
    onChange: e => setJoursDefaut(e.target.value)
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      marginTop: '24px',
      width: '100%',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-floppy-disk",
    style: {
      marginRight: '8px'
    }
  }), "Sauvegarder les Param\xE8tres & Recalculer les Scores"))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-robot",
    style: {
      color: 'var(--primary)'
    }
  }), "\uD83E\uDD16 Pr\xE9paration & Configuration de l'API DotB Automation"), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '10px',
      border: '1.5px solid var(--primary)',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '13px',
      fontWeight: 700,
      color: 'var(--text-main)',
      marginBottom: '6px',
      display: 'block'
    }
  }, "\uD83D\uDD11 Cl\xE9 API Full Access DotB (Saisie unique globale)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: dotbApiKey,
    onChange: e => setDotbApiKey(e.target.value),
    placeholder: "ex: dotb_live_full_access_sec_8849",
    style: {
      flex: 1,
      minWidth: '240px',
      fontFamily: 'monospace',
      fontWeight: 600,
      height: '40px',
      fontSize: '13px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    style: {
      height: '40px',
      fontSize: '12.5px'
    },
    onClick: () => {
      const newKey = 'dotb_live_sec_' + Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
      setDotbApiKey(newKey);
      if (window.showToast) window.showToast("🔑 Nouvelle clé API DotB générée ! N'oubliez pas de sauvegarder.");
    }
  }, "\uD83C\uDFB2 G\xE9n\xE9rer une cl\xE9"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    style: {
      height: '40px',
      fontSize: '12.5px'
    },
    onClick: () => {
      navigator.clipboard.writeText(dotbApiKey);
      if (window.showToast) window.showToast("📋 Clé API DotB copiée dans le presse-papier !");
    }
  }, "\uD83D\uDCCB Copier la cl\xE9")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '8px',
      marginBottom: 0
    }
  }, "Cette cl\xE9 unique donne un acc\xE8s complet (Full Access) \xE0 DotB pour envoyer les vues, likes, favoris, ventes, articles et auto-d\xE9tecter les incidents sur tous vos comptes Vinted.")), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '15px',
      marginBottom: '16px',
      backgroundColor: '#ffffff',
      padding: '12px 14px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 700,
      color: 'var(--text-main)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "\uD83D\uDCC5 P\xE9riode des Donn\xE9es \xE0 R\xE9cup\xE9rer :"), /*#__PURE__*/React.createElement("select", {
    className: "select",
    value: dotbPeriod,
    onChange: e => setDotbPeriod(e.target.value),
    style: {
      width: '100%',
      fontSize: '12.5px',
      height: '36px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "today"
  }, "Aujourd'hui (Derni\xE8res 24h)"), /*#__PURE__*/React.createElement("option", {
    value: "7days"
  }, "7 Derniers Jours"), /*#__PURE__*/React.createElement("option", {
    value: "30days"
  }, "30 Derniers Jours"), /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tout l'historique (Complet)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 700,
      color: 'var(--text-main)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "\uD83D\uDCE6 Types de Donn\xE9es \xE0 R\xE9cup\xE9rer :"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      fontSize: '12px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: dotbDataTypes.includes('items_published'),
    onChange: e => {
      setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_published'] : prev.filter(t => t !== 'items_published'));
    }
  }), " \uD83D\uDFE2 Publi\xE9s & SKUs"), /*#__PURE__*/React.createElement("label", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: dotbDataTypes.includes('items_drafts'),
    onChange: e => {
      setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_drafts'] : prev.filter(t => t !== 'items_drafts'));
    }
  }), " \uD83D\uDCDD Brouillons"), /*#__PURE__*/React.createElement("label", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: dotbDataTypes.includes('items_hidden'),
    onChange: e => {
      setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_hidden'] : prev.filter(t => t !== 'items_hidden'));
    }
  }), " \uD83D\uDEAB Masqu\xE9s"), /*#__PURE__*/React.createElement("label", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: dotbDataTypes.includes('messages'),
    onChange: e => {
      setDotbDataTypes(prev => e.target.checked ? [...prev, 'messages'] : prev.filter(t => t !== 'messages'));
    }
  }), " \uD83D\uDCAC Messages"), /*#__PURE__*/React.createElement("label", {
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: dotbDataTypes.includes('orders'),
    onChange: e => {
      setDotbDataTypes(prev => e.target.checked ? [...prev, 'orders'] : prev.filter(t => t !== 'orders'));
    }
  }), " \uD83D\uDED2 Ventes")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant",
    style: {
      fontSize: '12px',
      padding: '4px 10px'
    }
  }, "\uD83D\uDFE2 Service API DotB Actif"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      marginLeft: '10px'
    }
  }, "Endpoint: ", /*#__PURE__*/React.createElement("code", null, "POST /api/dotb/fetch-live"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    style: {
      fontSize: '12px',
      padding: '6px 14px',
      backgroundColor: '#09b1ba',
      borderColor: '#09b1ba'
    },
    onClick: async () => {
      try {
        if (window.showToast) window.showToast(`⏳ Synchro DotB Cloud v1 (${dotbPeriod}, ${dotbDataTypes.length} types) en cours...`);
        const res = await fetch('/api/dotb/fetch-live', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: dotbApiKey,
            period: dotbPeriod,
            selectedTypes: dotbDataTypes
          })
        });
        const data = await res.json();
        if (data.success && window.showToast) {
          window.showToast(data.message);
          if (window.loadAppState) await window.loadAppState();
        } else if (window.showToast) {
          window.showToast(`❌ Erreur DotB API: ${data.error || 'Échec'}`, true);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, "\u26A1 Synchro Directe API DotB Cloud (33 Comptes)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    style: {
      fontSize: '12px',
      padding: '6px 12px'
    },
    onClick: async () => {
      try {
        const res = await fetch('/api/dotb/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pseudo: 'julia_rent',
            vues: 1450,
            likes: 88,
            messages: 14,
            ventes: 5,
            actifsCount: 58,
            masquesCount: 0,
            brouillonsCount: 2,
            itemsCount: 60,
            items: [{
              sku: 'sz26001',
              title: 'Robe Rose Bonbon',
              price: '25 €',
              vues: 160,
              likes: 15,
              statut: 'publié'
            }]
          })
        });
        const data = await res.json();
        if (data.success && window.showToast) {
          window.showToast(`✅ Test API DotB réussi pour @${data.pseudo} !`);
          if (window.loadAppState) await window.loadAppState();
        }
      } catch (err) {}
    }
  }, "\uD83E\uDDEA Tester la synchro DotB (@julia_rent)"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px',
      fontSize: '12.5px',
      color: 'var(--text-muted)'
    }
  }, "\uD83D\uDCD8 Documentation officielle de l'API DotB v1 : ", /*#__PURE__*/React.createElement("a", {
    href: "https://dotb.io/api/public/v1/docs?token=dotb_pk_pmXggjdukM3FR-YCw2cXsgug2YrtJa_0ZBX9s5J6Wf8",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'var(--primary)',
      fontWeight: 600,
      textDecoration: 'underline'
    }
  }, "https://dotb.io/api/public/v1/docs")), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '13px',
      fontWeight: 700,
      marginBottom: '8px'
    }
  }, "Champs & M\xE9triques Collect\xE9s par l'API DotB :"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      fontSize: '12.5px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDC41\uFE0F ", /*#__PURE__*/React.createElement("b", null, "Vues Totales & par SKU")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\u2764\uFE0F ", /*#__PURE__*/React.createElement("b", null, "Likes & Favoris")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDCAC ", /*#__PURE__*/React.createElement("b", null, "Messages Non Lus")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDED2 ", /*#__PURE__*/React.createElement("b", null, "Ventes R\xE9alis\xE9es")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDCE6 ", /*#__PURE__*/React.createElement("b", null, "Articles Actifs / Brouillons")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDEAB ", /*#__PURE__*/React.createElement("b", null, "Articles Masqu\xE9s & Bloqu\xE9s")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83D\uDEA8 ", /*#__PURE__*/React.createElement("b", null, "Auto-D\xE9tection des Incidents")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1'
    }
  }, "\uD83C\uDFF7\uFE0F ", /*#__PURE__*/React.createElement("b", null, "Qualifications SKUs Auto")))), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      padding: '14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#94a3b8',
      marginBottom: '4px'
    }
  }, "// Exemple de requ\xEAte JSON transmise par le Bot DotB ou cURL :"), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0
    }
  }, `curl -X POST https://vintedmanager-bkgg.vercel.app/api/dotb/sync \\
  -H "Content-Type: application/json" \\
  -d '{
    "pseudo": "julia_rent",
    "statutCompte": "Actif",
    "vues": 1450,
    "likes": 88,
    "messages": 14,
    "ventes": 5,
    "items": [
      { "sku": "sz26001", "title": "Robe Rose", "price": "25 €", "vues": 160, "likes": 15, "statut": "publié" }
    ]
  }'`))));
}

// ------------------- VIEW: LOGIN -------------------
function LoginView({
  onLoginSubmit,
  loginError
}) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    onLoginSubmit(loginInput, password);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f766e 100%)',
      zIndex: 99999,
      padding: '20px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '440px',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '36px 32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      borderTop: '6px solid var(--primary-color)',
      margin: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 auto 16px auto',
      width: '56px',
      height: '56px',
      fontSize: '26px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-gradient)',
      color: '#fff',
      borderRadius: '14px',
      boxShadow: '0 8px 20px rgba(9, 177, 186, 0.35)'
    }
  }, "V"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#0f172a',
      margin: '0 0 6px 0'
    }
  }, "Vinted Manager"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: '#64748b',
      margin: 0
    }
  }, "Connectez-vous pour acc\xE9der au tableau de bord")), loginError && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fca5a5',
      color: '#b91c1c',
      padding: '12px 14px',
      borderRadius: '10px',
      marginBottom: '20px',
      fontSize: '13px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-exclamation",
    style: {
      fontSize: '18px',
      color: '#ef4444'
    }
  }), /*#__PURE__*/React.createElement("span", null, loginError)), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      color: '#334155',
      display: 'block',
      marginBottom: '6px',
      fontSize: '13px'
    }
  }, "Adresse Email ou Nom d'utilisateur"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: loginInput,
    onChange: e => setLoginInput(e.target.value),
    placeholder: "Nom d'utilisateur ou Email",
    required: true,
    style: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '22px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      color: '#334155',
      display: 'block',
      marginBottom: '6px',
      fontSize: '13px'
    }
  }, "Mot de passe"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    required: true,
    style: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      width: '100%',
      padding: '14px',
      fontSize: '15px',
      fontWeight: 600,
      borderRadius: '8px',
      backgroundColor: 'var(--primary-color)',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(9, 177, 186, 0.3)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-right-to-bracket",
    style: {
      marginRight: '8px'
    }
  }), " Se connecter"))));
}

// ------------------- VIEW: UTILISATEURS AVEC ACCÈS PERSONNALISABLES -------------------
function UtilisateursView({
  currentUser,
  appState,
  onSaveUser,
  onDeleteUser,
  onBulkDeleteUsers
}) {
  const isAdmin = currentUser && currentUser.role === 'admin';
  const userOrgId = currentUser && currentUser.organisationId || 'org_default';
  const [userId, setUserId] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(isAdmin ? 'agent' : 'agent');
  const [organisationId, setOrganisationId] = useState(userOrgId);
  const [agentAssigne, setAgentAssigne] = useState('');
  const [motDePasse, setMotDePasse] = useState('123456');
  const [contactType, setContactType] = useState('WhatsApp');
  const [contactNumero, setContactNumero] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // État des permissions personnalisées pour le formulaire
  const [permissions, setPermissions] = useState(() => PermissionManager.PRESETS.agent);

  // État de la modal de réglage rapide des permissions
  const [permModalUser, setPermModalUser] = useState(null);
  const [modalPermissions, setModalPermissions] = useState({});
  const utilisateurs = appState.utilisateurs || [];
  const organisations = appState.organisations || [];
  const visibleUsers = useMemo(() => {
    if (isAdmin) return utilisateurs;
    return utilisateurs.filter(u => (u.organisationId || 'org_default') === userOrgId);
  }, [utilisateurs, isAdmin, userOrgId]);
  const isAllUsersSelected = useMemo(() => {
    return visibleUsers.length > 0 && visibleUsers.every(u => selectedUserIds.includes(u.id));
  }, [visibleUsers, selectedUserIds]);
  const toggleSelectAllUsers = () => {
    if (isAllUsersSelected) setSelectedUserIds([]);else setSelectedUserIds(visibleUsers.map(u => u.id));
  };
  const toggleSelectUser = id => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleBulkDeleteUsersAction = async () => {
    if (selectedUserIds.length === 0 || !onBulkDeleteUsers) return;
    if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedUserIds.length} utilisateurs sélectionnés ?`)) {
      await onBulkDeleteUsers(selectedUserIds);
      setSelectedUserIds([]);
    }
  };
  const handleRoleChange = newRole => {
    setRole(newRole);
    if (newRole === 'admin') setPermissions({
      ...PermissionManager.PRESETS.admin
    });else if (newRole === 'cadre') setPermissions({
      ...PermissionManager.PRESETS.cadre
    });else setPermissions({
      ...PermissionManager.PRESETS.agent
    });
  };
  const handleTogglePermission = key => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleApplyPreset = presetKey => {
    if (presetKey === 'all') {
      const allTrue = {};
      PermissionManager.MODULES.forEach(m => allTrue[m.key] = true);
      PermissionManager.ACTIONS.forEach(a => allTrue[a.key] = true);
      setPermissions(allTrue);
    } else if (presetKey === 'none') {
      const allFalse = {};
      PermissionManager.MODULES.forEach(m => allFalse[m.key] = false);
      PermissionManager.ACTIONS.forEach(a => allFalse[a.key] = false);
      setPermissions(allFalse);
    } else if (PermissionManager.PRESETS[presetKey]) {
      setPermissions({
        ...PermissionManager.PRESETS[presetKey]
      });
    }
  };
  const handleEdit = u => {
    setUserId(u.id);
    setNom(u.nom);
    setEmail(u.email);
    setRole(isAdmin ? u.role : 'agent');
    setOrganisationId(isAdmin ? u.organisationId || 'org_default' : userOrgId);
    setAgentAssigne(u.agentAssigne || '');
    setMotDePasse(u.motDePasse || '');
    setContactType(u.contactType || 'WhatsApp');
    setContactNumero(u.contactNumero || '');
    setPermissions(PermissionManager.getPermissions(u));
  };
  const handleReset = () => {
    setUserId('');
    setNom('');
    setEmail('');
    setRole('agent');
    setOrganisationId(userOrgId);
    setAgentAssigne('');
    setMotDePasse('123456');
    setContactType('WhatsApp');
    setContactNumero('');
    setPermissions({
      ...PermissionManager.PRESETS.agent
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSaveUser({
      id: userId,
      nom,
      email,
      role: isAdmin ? role : 'agent',
      organisationId: isAdmin ? organisationId : userOrgId,
      agentAssigne: agentAssigne || nom,
      motDePasse,
      contactType,
      contactNumero,
      permissions
    });
    handleReset();
  };

  // Quick Modal Actions
  const openPermModal = u => {
    setPermModalUser(u);
    setModalPermissions(PermissionManager.getPermissions(u));
  };
  const handleSaveModalPermissions = async () => {
    if (!permModalUser) return;
    await onSaveUser({
      ...permModalUser,
      permissions: modalPermissions
    });
    setPermModalUser(null);
  };
  const handleToggleModalPerm = key => {
    setModalPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleApplyModalPreset = presetKey => {
    if (presetKey === 'all') {
      const allTrue = {};
      PermissionManager.MODULES.forEach(m => allTrue[m.key] = true);
      PermissionManager.ACTIONS.forEach(a => allTrue[a.key] = true);
      setModalPermissions(allTrue);
    } else if (presetKey === 'none') {
      const allFalse = {};
      PermissionManager.MODULES.forEach(m => allFalse[m.key] = false);
      PermissionManager.ACTIONS.forEach(a => allFalse[a.key] = false);
      setModalPermissions(allFalse);
    } else if (PermissionManager.PRESETS[presetKey]) {
      setModalPermissions({
        ...PermissionManager.PRESETS[presetKey]
      });
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-users-gear",
    style: {
      color: 'var(--primary-color)'
    }
  }), "Gestion des Utilisateurs & Droits d'Acc\xE8s"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0 0',
      color: 'var(--text-muted)',
      fontSize: '13px'
    }
  }, "Personnalisez de fa\xE7on granulaire les modules visibles et les actions autoris\xE9es pour chaque collaborateur."))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-user-pen",
    style: {
      color: 'var(--primary-color)'
    }
  }), userId ? 'Modifier le profil & les accès du membre' : 'Ajouter un nouveau membre avec accès personnalisables'), !isAdmin && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: 'var(--info)',
      marginBottom: '16px',
      background: '#eff6ff',
      padding: '8px 12px',
      borderRadius: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-info"
  }), " En tant que Cadre/Superviseur, vous pouvez g\xE9rer les acc\xE8s des collaborateurs de votre organisation."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Nom complet ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#ef4444'
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: nom,
    onChange: e => setNom(e.target.value),
    placeholder: "ex: Van Quy Dang",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Adresse Email ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#ef4444'
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "ex: vanquydang905@gmail.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "R\xF4le Principal"), /*#__PURE__*/React.createElement("select", {
    value: isAdmin ? role : 'agent',
    onChange: e => handleRoleChange(e.target.value),
    disabled: !isAdmin
  }, isAdmin && /*#__PURE__*/React.createElement("option", {
    value: "admin"
  }, "Admin (Global)"), isAdmin && /*#__PURE__*/React.createElement("option", {
    value: "cadre"
  }, "Cadre (Superviseur)"), /*#__PURE__*/React.createElement("option", {
    value: "agent"
  }, "Agent de publication")))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Organisation"), /*#__PURE__*/React.createElement("select", {
    value: isAdmin ? organisationId : userOrgId,
    onChange: e => setOrganisationId(e.target.value),
    disabled: !isAdmin
  }, organisations.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.nom)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Agent Assign\xE9 / Code"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: agentAssigne,
    onChange: e => setAgentAssigne(e.target.value),
    placeholder: "Laissez vide pour utiliser le nom"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Mot de passe"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: motDePasse,
    onChange: e => setMotDePasse(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Canal de Contact Direct"), /*#__PURE__*/React.createElement("select", {
    value: contactType,
    onChange: e => setContactType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "WhatsApp"
  }, "WhatsApp Messenger / Business"), /*#__PURE__*/React.createElement("option", {
    value: "Signal"
  }, "Signal Private Messenger"), /*#__PURE__*/React.createElement("option", {
    value: "Telegram"
  }, "Telegram"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Num\xE9ro ou Pseudo (", contactType, ")"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: contactNumero,
    onChange: e => setContactNumero(e.target.value),
    placeholder: contactType === 'Telegram' ? '@mon_pseudo ou +33612345678' : '+33612345678'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '16px',
      marginBottom: '20px',
      padding: '16px 18px',
      background: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 700,
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-shield-halved",
    style: {
      color: 'var(--primary-color)'
    }
  }), "Droits d'Acc\xE8s Personnalis\xE9s pour ce Membre"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11.5px',
      color: '#64748b',
      marginTop: '2px'
    }
  }, "Cochez les modules du menu et les actions op\xE9rationnelles accord\xE9s \xE0 cet utilisateur.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyPreset('admin')
  }, "\uD83D\uDC51 Tout Accorder"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyPreset('cadre')
  }, "\uD83D\uDC54 Cadre"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyPreset('agent')
  }, "\uD83D\uDC64 Agent Standard"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyPreset('none')
  }, "\uD83D\uDD12 Tout Refuser"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#334155',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    }
  }, "\uD83D\uDCD1 Modules & Vues Autoris\xE9s"), /*#__PURE__*/React.createElement("div", {
    className: "perm-card-grid"
  }, PermissionManager.MODULES.map(m => {
    const active = Boolean(permissions[m.key]);
    return /*#__PURE__*/React.createElement("div", {
      key: m.key,
      className: `perm-item-card ${active ? 'active' : ''}`,
      onClick: () => handleTogglePermission(m.key)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "perm-item-icon"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${m.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '12.5px',
        color: '#0f172a'
      }
    }, m.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '10.5px',
        color: '#64748b'
      }
    }, m.desc))), /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: active,
      onChange: () => {} // handled by parent card onClick
      ,
      style: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: 'var(--primary-color)'
      }
    }));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#334155',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px'
    }
  }, "\u26A1 Privil\xE8ges & Actions Op\xE9rationnelles"), /*#__PURE__*/React.createElement("div", {
    className: "perm-card-grid"
  }, PermissionManager.ACTIONS.map(a => {
    const active = Boolean(permissions[a.key]);
    return /*#__PURE__*/React.createElement("div", {
      key: a.key,
      className: `perm-item-card ${active ? 'active' : ''}`,
      onClick: () => handleTogglePermission(a.key)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "perm-item-icon"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${a.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '12.5px',
        color: '#0f172a'
      }
    }, a.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '10.5px',
        color: '#64748b'
      }
    }, a.desc))), /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: active,
      onChange: () => {} // handled by parent card onClick
      ,
      style: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: 'var(--primary-color)'
      }
    }));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-user-check",
    style: {
      marginRight: '6px'
    }
  }), userId ? 'Mettre à jour l\'utilisateur' : 'Enregistrer le nouveau membre'), userId && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleReset
  }, "Annuler")))), selectedUserIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: '10px',
      zIndex: 1000,
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '12px 18px',
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: 600,
      fontSize: '13.5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      backgroundColor: '#09b1ba',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#fff'
    }
  }, "\u2713 ", selectedUserIds.length, " utilisateur", selectedUserIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-danger",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: handleBulkDeleteUsersAction
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash",
    style: {
      marginRight: '4px'
    }
  }), " Supprimer (", selectedUserIds.length, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-secondary",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => setSelectedUserIds([])
  }, "Annuler"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "Liste des Collaborateurs & Droits d'Acc\xE8s (", visibleUsers.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '40px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isAllUsersSelected,
    onChange: toggleSelectAllUsers,
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("th", null, "Nom"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "R\xF4le"), /*#__PURE__*/React.createElement("th", null, "Organisation"), /*#__PURE__*/React.createElement("th", null, "Acc\xE8s & Permissions"), /*#__PURE__*/React.createElement("th", null, "Contact Direct"), /*#__PURE__*/React.createElement("th", null, "Agent Assign\xE9"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, visibleUsers.length > 0 ? visibleUsers.map(u => {
    const uPerms = PermissionManager.getPermissions(u);
    const allowedModulesCount = PermissionManager.MODULES.filter(m => uPerms[m.key]).length;
    const allowedActionsCount = PermissionManager.ACTIONS.filter(a => uPerms[a.key]).length;
    return /*#__PURE__*/React.createElement("tr", {
      key: u.id,
      style: {
        backgroundColor: selectedUserIds.includes(u.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selectedUserIds.includes(u.id),
      onChange: () => toggleSelectUser(u.id),
      style: {
        width: '16px',
        height: '16px',
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, u.nom)), /*#__PURE__*/React.createElement("td", null, u.email), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: u.role === 'admin' ? '#9333ea' : u.role === 'cadre' ? '#0284c7' : '#16a34a',
        color: 'white'
      }
    }, u.role === 'admin' ? 'Admin' : u.role === 'cadre' ? 'Cadre' : 'Agent')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-compte"
    }, (organisations.find(o => o.id === u.organisationId) || {}).nom || u.organisationId || 'Par défaut')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: `badge ${allowedModulesCount >= 10 ? 'badge-primary' : allowedModulesCount >= 6 ? 'badge-secondary' : 'badge-danger'}`,
      style: {
        fontSize: '11px',
        padding: '2px 7px'
      }
    }, allowedModulesCount, "/11 modules"), /*#__PURE__*/React.createElement("span", {
      className: "badge badge-secondary",
      style: {
        fontSize: '10px',
        padding: '2px 5px'
      },
      title: `${allowedActionsCount} actions opérationnelles autorisées`
    }, "\u26A1 ", allowedActionsCount, " actions"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs",
      onClick: () => openPermModal(u),
      title: "Modifier directement les acc\xE8s de ce membre",
      style: {
        fontSize: '10.5px',
        padding: '2px 7px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-sliders",
      style: {
        color: 'var(--primary-color)'
      }
    }), " R\xE9gler"))), /*#__PURE__*/React.createElement("td", null, u.contactNumero ? /*#__PURE__*/React.createElement("a", {
      href: u.contactType === 'Telegram' ? u.contactNumero.startsWith('@') ? `https://t.me/${u.contactNumero.replace('@', '')}` : `https://t.me/${u.contactNumero.replace(/\s+/g, '')}` : u.contactType === 'WhatsApp' ? `https://wa.me/${u.contactNumero.replace(/[^0-9]/g, '')}` : `tel:${u.contactNumero}`,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "badge",
      style: {
        background: u.contactType === 'WhatsApp' ? '#25d366' : u.contactType === 'Telegram' ? '#0088cc' : '#3a76f0',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '11px',
        padding: '3px 8px'
      },
      title: `Ouvrir dans ${u.contactType || 'WhatsApp'}`
    }, /*#__PURE__*/React.createElement("i", {
      className: u.contactType === 'WhatsApp' ? 'fa-brands fa-whatsapp' : u.contactType === 'Telegram' ? 'fa-brands fa-telegram' : 'fa-solid fa-comment-dots'
    }), u.contactNumero) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-muted)',
        fontSize: '12px'
      }
    }, "-")), /*#__PURE__*/React.createElement("td", null, u.agentAssigne || u.nom), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => handleEdit(u),
      title: "\xC9diter le profil et les acc\xE8s"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-pen"
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => onDeleteUser(u.id),
      title: "Supprimer"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-trash"
    })))));
  }) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "9",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun utilisateur trouv\xE9.")))))), permModalUser && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content card",
    style: {
      maxWidth: '750px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-shield-halved",
    style: {
      color: 'var(--primary-color)'
    }
  }), "Permissions & Acc\xE8s : ", permModalUser.nom), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px'
    }
  }, "R\xF4le : ", /*#__PURE__*/React.createElement("strong", null, permModalUser.role), " | Email : ", permModalUser.email)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPermModalUser(null),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '18px',
      color: '#94a3b8'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#475569',
      alignSelf: 'center',
      marginRight: '4px'
    }
  }, "Pr\xE9r\xE9glages :"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyModalPreset('admin')
  }, "\uD83D\uDC51 Tout Accorder"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyModalPreset('cadre')
  }, "\uD83D\uDC54 Cadre"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyModalPreset('agent')
  }, "\uD83D\uDC64 Agent Standard"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "perm-preset-btn",
    onClick: () => handleApplyModalPreset('none')
  }, "\uD83D\uDD12 Tout Refuser")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#334155',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    }
  }, "\uD83D\uDCD1 Modules & Vues Autoris\xE9s"), /*#__PURE__*/React.createElement("div", {
    className: "perm-card-grid"
  }, PermissionManager.MODULES.map(m => {
    const active = Boolean(modalPermissions[m.key]);
    return /*#__PURE__*/React.createElement("div", {
      key: m.key,
      className: `perm-item-card ${active ? 'active' : ''}`,
      onClick: () => handleToggleModalPerm(m.key)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "perm-item-icon"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${m.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '12.5px',
        color: '#0f172a'
      }
    }, m.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '10.5px',
        color: '#64748b'
      }
    }, m.desc))), /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: active,
      onChange: () => {},
      style: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: 'var(--primary-color)'
      }
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#334155',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    }
  }, "\u26A1 Privil\xE8ges & Actions Op\xE9rationnelles"), /*#__PURE__*/React.createElement("div", {
    className: "perm-card-grid"
  }, PermissionManager.ACTIONS.map(a => {
    const active = Boolean(modalPermissions[a.key]);
    return /*#__PURE__*/React.createElement("div", {
      key: a.key,
      className: `perm-item-card ${active ? 'active' : ''}`,
      onClick: () => handleToggleModalPerm(a.key)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "perm-item-icon"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${a.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '12.5px',
        color: '#0f172a'
      }
    }, a.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '10.5px',
        color: '#64748b'
      }
    }, a.desc))), /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: active,
      onChange: () => {},
      style: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: 'var(--primary-color)'
      }
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '14px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: () => setPermModalUser(null)
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: handleSaveModalPermissions,
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check",
    style: {
      marginRight: '6px'
    }
  }), "Enregistrer les Acc\xE8s")))));
}

// ------------------- VIEW: ORGANISATIONS -------------------
function OrganisationsView({
  appState,
  onSaveOrg,
  onDeleteOrg
}) {
  const [orgId, setOrgId] = useState('');
  const [nom, setNom] = useState('');
  const organisations = appState.organisations || [];
  const handleEdit = o => {
    setOrgId(o.id);
    setNom(o.nom);
  };
  const handleReset = () => {
    setOrgId('');
    setNom('');
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!nom) return;
    if (orgId) {
      onSaveOrg({
        id: orgId,
        nom,
        isEdit: true
      });
    } else {
      onSaveOrg({
        id: 'org_' + Date.now(),
        nom,
        dateCreation: new Date().toISOString().split('T')[0]
      });
    }
    handleReset();
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Gestion des Organisations Multi-Tenancy"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, orgId ? 'Modifier l\'organisation' : 'Ajouter une nouvelle organisation'), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      flex: 1,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, "Nom de l'organisation"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: nom,
    onChange: e => setNom(e.target.value),
    placeholder: "ex: Agence Lyon",
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-floppy-disk"
  }), " ", orgId ? 'Enregistrer Modification' : 'Créer Organisation'), orgId && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleReset
  }, "Annuler"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "Organisations Actives (", organisations.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Code ID"), /*#__PURE__*/React.createElement("th", null, "Nom de l'organisation"), /*#__PURE__*/React.createElement("th", null, "Date Cr\xE9ation"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, organisations.map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, o.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, o.nom)), /*#__PURE__*/React.createElement("td", null, o.dateCreation || '-'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => handleEdit(o),
    title: "\xC9diter le nom"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen"
  })), o.id !== 'org_default' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => onDeleteOrg(o.id),
    title: "Supprimer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  })))))))))));
}

// ------------------- VIEW: CLASSEMENT & STATS -------------------
function ClassementView({
  appState,
  onUpdateRow
}) {
  const calendrier = appState.calendrier || [];
  const [newSkuInput, setNewSkuInput] = useState('');
  const [newClassifInput, setNewClassifInput] = useState('Nouveau produit');
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [skuSearchTerm, setSkuSearchTerm] = useState('');
  const [skuFilterClassif, setSkuFilterClassif] = useState('');
  const [skuFilterOnline, setSkuFilterOnline] = useState('all');
  const [skuFilterVentes, setSkuFilterVentes] = useState('all');
  const [skuSortBy, setSkuSortBy] = useState('score');

  // CSV & Google Sheet Bulk SKU Import State
  const [bulkSheetUrlInput, setBulkSheetUrlInput] = useState('https://docs.google.com/spreadsheets/d/1_8zZWfVVCU96VLLIlyulK2gchbrNkBVOyMb6WTr0X6w/edit?gid=0#gid=0');
  const [bulkSkusTextInput, setBulkSkusTextInput] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState(null);
  const handleBulkRegisterSkus = async e => {
    if (e) e.preventDefault();
    setIsBulkProcessing(true);
    const userOrgId = appState.currentUser && appState.currentUser.organisationId || 'org_default';
    try {
      const res = await fetch('/api/sku/bulk-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sheetUrl: bulkSheetUrlInput.trim(),
          skus: bulkSkusTextInput.trim(),
          classification: 'À retester',
          organisationId: userOrgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message || `✅ SKUs qualifiés comme "À retester" !`);
        if (window.loadAppState) await window.loadAppState();
      } else {
        if (window.showToast) window.showToast(`⚠️ ${data.error || 'Erreur lors de l\'importation'}`, true);
      }
    } catch (err) {
      console.error("Erreur Bulk SKU Register:", err);
      if (window.showToast) window.showToast("❌ Erreur lors de la qualification en masse", true);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // SKU Detail & Propagation Modal State
  const [selectedSkuDetail, setSelectedSkuDetail] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState('accounts'); // 'accounts' | 'chart' | 'propagation'
  const [propagationMode, setPropagationMode] = useState('optimal'); // 'immediate' | 'staggered' | 'optimal'
  const [selectedAccountsToPropagate, setSelectedAccountsToPropagate] = useState([]);
  const [isPropagating, setIsPropagating] = useState(false);
  const handlePropagateSku = async skuCode => {
    if (selectedAccountsToPropagate.length === 0) return;
    setIsPropagating(true);
    const userOrgId = appState.currentUser && appState.currentUser.organisationId || 'org_default';
    try {
      const res = await fetch('/api/sku/propagate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: skuCode,
          targetAccounts: selectedAccountsToPropagate,
          mode: propagationMode,
          organisationId: userOrgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message);
        if (window.loadAppState) await window.loadAppState();
        setSelectedAccountsToPropagate([]);
        setSelectedSkuDetail(null);
      } else {
        if (window.showToast) window.showToast(`❌ Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur propagation:", err);
      if (window.showToast) window.showToast("❌ Erreur réseau lors de la propagation");
    } finally {
      setIsPropagating(false);
    }
  };
  const handleImportCsvOrders = async e => {
    e.preventDefault();
    if (!csvInputText.trim()) return;
    setIsImportingCsv(true);
    setCsvImportResult(null);
    const userOrgId = appState.currentUser && appState.currentUser.organisationId || 'org_default';
    try {
      const res = await fetch('/api/import-orders-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          csvText: csvInputText,
          organisationId: userOrgId
        })
      });
      const data = await res.json();
      if (data.success) {
        setCsvImportResult(data);
        if (window.showToast) window.showToast(data.message);
        if (window.loadAppState) await window.loadAppState();
        setCsvInputText('');
      } else {
        if (window.showToast) window.showToast(`❌ Erreur : ${data.error || 'Échec de l\'importation'}`);
      }
    } catch (err) {
      console.error("Erreur Import CSV:", err);
      if (window.showToast) window.showToast(`❌ Erreur réseau lors de l'importation`);
    } finally {
      setIsImportingCsv(false);
    }
  };
  const handleFileUpload = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setCsvInputText(evt.target.result || '');
    };
    reader.readAsText(file);
  };
  const comptesAll = appState.comptes || [];
  const comptesMap = useMemo(() => {
    const map = {};
    comptesAll.forEach(c => {
      map[c.id] = c;
    });
    return map;
  }, [comptesAll]);

  // Filtre Temporel pour les Classements (Aujourd'hui, 2j, 3j, 7j, 14j, 30j, Custom, Tout)
  const [rankingDateFilter, setRankingDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const referenceDate = useMemo(() => {
    let maxMs = Date.now();
    (calendrier || []).forEach(l => {
      if (l.date) {
        const d = new Date(l.date.replace(' ', 'T'));
        if (!isNaN(d.getTime()) && d.getTime() > maxMs) {
          maxMs = d.getTime();
        }
      }
    });
    return new Date(maxMs);
  }, [calendrier]);
  const filteredCalendrierForRanking = useMemo(() => {
    if (rankingDateFilter === 'all') return calendrier;
    if (rankingDateFilter === 'custom') {
      if (!customStartDate && !customEndDate) return calendrier;
      return (calendrier || []).filter(l => {
        if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return false;
        const dateVal = l.date || l.datePrevue || l.created_at;
        if (!dateVal) return false;
        const dStr = String(dateVal).split(' ')[0].split('T')[0];
        if (customStartDate && dStr < customStartDate) return false;
        if (customEndDate && dStr > customEndDate) return false;
        return true;
      });
    }
    const daysLimit = parseInt(rankingDateFilter, 10);
    return (calendrier || []).filter(l => {
      if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return false;
      const dateVal = l.date || l.datePrevue || l.created_at;
      if (!dateVal) return false;
      const d = new Date(String(dateVal).replace(' ', 'T'));
      if (isNaN(d.getTime())) return false;
      const diffMs = referenceDate.getTime() - d.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);
      return diffDays >= -0.5 && diffDays < daysLimit;
    });
  }, [calendrier, rankingDateFilter, referenceDate, customStartDate, customEndDate]);

  // Répertoire des SKUs filtré par période avec détection des SKUs en ligne
  const allSKUsMap = useMemo(() => {
    const map = {};
    filteredCalendrierForRanking.forEach(l => {
      if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return;
      if (!l.sku || !String(l.sku).trim()) return;
      const skuClean = String(l.sku).trim();
      if (!map[skuClean]) {
        map[skuClean] = {
          sku: skuClean,
          produit: l.produit || '',
          classification: l.classification || 'Nouveau produit',
          scoreCumule: 0,
          ventes: 0,
          pubs: 0,
          isOnline: false,
          onlineAccountsSet: new Set(),
          accountsSet: new Set(),
          priceSet: new Set(),
          lineIds: []
        };
      }
      if (l.produit && (!map[skuClean].produit || map[skuClean].produit.length < l.produit.length)) {
        map[skuClean].produit = l.produit;
      }
      map[skuClean].scoreCumule += l.score || 0;
      map[skuClean].ventes += l.vente || 0;
      map[skuClean].pubs += 1;
      map[skuClean].lineIds.push(l.id);
      if (l.classification) map[skuClean].classification = l.classification;

      // Détection si le SKU est toujours actif et en ligne sur des comptes distincts
      const isDoneOrOnline = l.statut === 'Fait' || l.statut === 'Publié' || l.statut === '✓ Fait' || l.done || l.isOnline || l.enLigne;
      if (isDoneOrOnline) {
        map[skuClean].isOnline = true;
        const comp = comptesMap[l.compteId];
        const pseudoClean = comp && comp.pseudo ? comp.pseudo.trim() : l.comptePseudo ? l.comptePseudo.trim() : '';
        if (pseudoClean) map[skuClean].onlineAccountsSet.add(pseudoClean.toLowerCase());
      }
      const comp = comptesMap[l.compteId];
      if (comp && comp.pseudo) map[skuClean].accountsSet.add('@' + comp.pseudo.trim());else if (l.comptePseudo) map[skuClean].accountsSet.add('@' + l.comptePseudo.trim());
      if (l.prix) map[skuClean].priceSet.add(l.prix + '€');
    });
    return map;
  }, [filteredCalendrierForRanking, comptesMap]);

  // API SKU Summary State (Real DotB Cloud Sales & Publications Metrics)
  const [apiSkuSummary, setApiSkuSummary] = useState([]);
  useEffect(() => {
    let isMounted = true;
    fetch('/api/sku/summary').then(res => res.json()).then(data => {
      if (isMounted && Array.isArray(data)) {
        setApiSkuSummary(data);
      }
    }).catch(err => console.warn("Err fetching SKU summary:", err));
    return () => {
      isMounted = false;
    };
  }, [calendrier]);
  const skuList = useMemo(() => {
    if (apiSkuSummary && apiSkuSummary.length > 0) {
      return apiSkuSummary.map(s => {
        const localInfo = allSKUsMap[s.sku] || {};
        const isOnline = Boolean(s.isOnline || s.status === 'PUBLISHED' || s.status === 'ACTIVE' || localInfo.isOnline || s.pubs > 0);

        // Nombre de publications/comptes actifs 100% cohérent avec les publications réelles
        const activeAccountsCount = s.accountBreakdown && s.accountBreakdown.length > 0 ? s.accountBreakdown.length : localInfo.onlineAccountsSet ? localInfo.onlineAccountsSet.size : 0;
        const onlinePubs = isOnline ? Math.max(1, Math.min(s.pubs || 1, activeAccountsCount || s.pubs || 1)) : 0;
        return {
          sku: s.sku,
          produit: s.produit,
          classification: s.classification,
          scoreCumule: s.scoreCumule || s.score || 0,
          ventes: s.ventes || 0,
          pubs: s.pubs || 1,
          isOnline,
          onlinePubs,
          accountsStr: s.accountsStr || 'Non spécifié',
          pricesStr: s.priceStr || s.pricesStr || '-',
          isMultiAccount: s.isMultiAccount,
          accountBreakdown: s.accountBreakdown || [],
          salesTimeline: s.salesTimeline || []
        };
      });
    }
    return Object.values(allSKUsMap).map(s => {
      const accs = Array.from(s.accountsSet);
      const prices = Array.from(s.priceSet);
      const onlineCount = s.isOnline ? Math.max(1, s.onlineAccountsSet.size || 1) : 0;
      return {
        ...s,
        onlinePubs: onlineCount,
        accountsStr: accs.length > 0 ? accs.join(', ') : 'Non spécifié',
        pricesStr: prices.length > 0 ? prices.slice(0, 2).join(' - ') : '-'
      };
    });
  }, [apiSkuSummary, allSKUsMap]);
  const onlineSkuCount = useMemo(() => {
    return skuList.filter(s => s.isOnline).length;
  }, [skuList]);
  const filteredSKUList = useMemo(() => {
    let list = [...skuList];
    if (skuFilterClassif) {
      list = list.filter(s => s.classification === skuFilterClassif);
    }
    if (skuFilterOnline === 'online') {
      list = list.filter(s => s.isOnline);
    } else if (skuFilterOnline === 'offline') {
      list = list.filter(s => !s.isOnline);
    }
    if (skuFilterVentes === 'with_sales') {
      list = list.filter(s => s.ventes > 0);
    } else if (skuFilterVentes === 'no_sales') {
      list = list.filter(s => s.ventes === 0);
    } else if (skuFilterVentes === 'top_sales') {
      list = list.filter(s => s.ventes >= 3);
    }
    if (skuSearchTerm.trim()) {
      const q = skuSearchTerm.trim().toLowerCase();
      list = list.filter(s => s.sku.toLowerCase().includes(q) || s.produit && s.produit.toLowerCase().includes(q) || s.classification && s.classification.toLowerCase().includes(q) || s.accountsStr && s.accountsStr.toLowerCase().includes(q));
    }
    if (skuSortBy === 'score') list.sort((a, b) => b.scoreCumule - a.scoreCumule);else if (skuSortBy === 'ventes') list.sort((a, b) => b.ventes - a.ventes);else if (skuSortBy === 'pubs') list.sort((a, b) => b.pubs - a.pubs);else if (skuSortBy === 'sku') list.sort((a, b) => a.sku.localeCompare(b.sku));
    return list;
  }, [skuList, skuSearchTerm, skuFilterClassif, skuFilterOnline, skuFilterVentes, skuSortBy]);
  const topSKUs = useMemo(() => {
    return [...skuList].sort((a, b) => b.scoreCumule - a.scoreCumule).slice(0, 10);
  }, [skuList]);
  const topHours = useMemo(() => {
    const hours = {};
    calendrier.forEach(l => {
      if (!l.heurePrevue) return;
      const h = l.heurePrevue;
      if (!hours[h]) hours[h] = {
        heure: h,
        pubs: 0,
        scoreTotal: 0,
        ventes: 0
      };
      hours[h].pubs += 1;
      hours[h].scoreTotal += l.score || 0;
      hours[h].ventes += l.vente || 0;
    });
    return Object.values(hours).map(h => ({
      ...h,
      scoreMoyen: h.pubs > 0 ? (h.scoreTotal / h.pubs).toFixed(1) : 0
    })).sort((a, b) => b.scoreMoyen - a.scoreMoyen);
  }, [calendrier]);

  // State du Filtre par Classification d'Agent (Même logique de présentation que les SKUs)
  const [agentFilterClassif, setAgentFilterClassif] = useState('all');

  // Classement et performance des agents filtré par la période sélectionnée avec Classification
  const agentRanking = useMemo(() => {
    const statsMap = {};
    (appState.utilisateurs || []).forEach(u => {
      const name = (u.nom || u.agentAssigne || '').trim();
      if (name && !statsMap[name.toLowerCase()]) {
        statsMap[name.toLowerCase()] = {
          name,
          role: u.role || 'agent',
          pubsFaites: 0,
          pubsTotales: 0,
          ventes: 0,
          scoreTotal: 0
        };
      }
    });
    filteredCalendrierForRanking.forEach(l => {
      if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return;
      const agentName = (l.agent || '').trim();
      if (!agentName) return;
      const key = agentName.toLowerCase();
      if (!statsMap[key]) {
        statsMap[key] = {
          name: agentName,
          role: 'agent',
          pubsFaites: 0,
          pubsTotales: 0,
          ventes: 0,
          scoreTotal: 0
        };
      }
      statsMap[key].pubsTotales += 1;
      if (l.statut === 'Fait' || l.statut === 'Publié' || l.statut === '✓ Fait' || l.done) {
        statsMap[key].pubsFaites += 1;
      }
      statsMap[key].ventes += l.vente || 0;
      statsMap[key].scoreTotal += l.score || 0;
    });
    return Object.values(statsMap).filter(a => a.name !== 'Bot DotB' && a.name !== 'À attribuer').map(a => {
      const taux = a.pubsTotales > 0 ? Math.round(a.pubsFaites / a.pubsTotales * 100) : 0;

      // Logique de classification des Agents (même niveau de présentation que les SKUs)
      let classification = '🌟 Nouvel Agent';
      if (a.scoreTotal >= 1000 || a.ventes >= 10 || taux >= 80 && a.pubsTotales >= 20) {
        classification = '🏆 Agent Top';
      } else if (a.scoreTotal >= 200 || a.ventes >= 2 || taux >= 50 && a.pubsFaites >= 5) {
        classification = '⚡ En Progression';
      } else if (a.pubsTotales > 0) {
        classification = '🌟 Nouvel Agent';
      } else {
        classification = '🛑 Inactif';
      }
      return {
        ...a,
        taux,
        classification
      };
    }).sort((a, b) => {
      if (b.scoreTotal !== a.scoreTotal) return b.scoreTotal - a.scoreTotal;
      if (b.pubsFaites !== a.pubsFaites) return b.pubsFaites - a.pubsFaites;
      return b.ventes - a.ventes;
    });
  }, [filteredCalendrierForRanking, appState.utilisateurs]);

  // Agent Ranking filtré par la classification sélectionnée
  const filteredAgentRanking = useMemo(() => {
    if (!agentFilterClassif || agentFilterClassif === 'all') return agentRanking;
    return agentRanking.filter(a => a.classification === agentFilterClassif);
  }, [agentRanking, agentFilterClassif]);

  // Comptage dynamique des catégories d'agents
  const agentClassifCounts = useMemo(() => {
    const counts = {
      total: agentRanking.length,
      top: 0,
      progression: 0,
      nouveau: 0,
      inactif: 0
    };
    agentRanking.forEach(a => {
      if (a.classification === '🏆 Agent Top') counts.top++;else if (a.classification === '⚡ En Progression') counts.progression++;else if (a.classification === '🌟 Nouvel Agent') counts.nouveau++;else if (a.classification === '🛑 Inactif') counts.inactif++;
    });
    return counts;
  }, [agentRanking]);

  // Vérification en temps réel du champ de saisie des SKUs
  const skuVerificationStatus = useMemo(() => {
    if (!newSkuInput || !newSkuInput.trim()) return null;
    const clean = newSkuInput.trim();
    const existing = allSKUsMap[clean] || (skuList || []).find(s => s.sku && s.sku.trim().toLowerCase() === clean.toLowerCase());
    const isStandardFormat = /^s[zx]\d+$/i.test(clean);
    if (existing) {
      return {
        exists: true,
        sku: existing.sku,
        produit: existing.produit || 'Produit sans titre',
        classification: existing.classification || 'Nouveau produit',
        ventes: existing.ventes || 0,
        pubs: existing.pubs || 1,
        photoUrl: existing.photoUrl || existing.photo || ''
      };
    }
    return {
      exists: false,
      sku: clean,
      isStandardFormat
    };
  }, [newSkuInput, allSKUsMap, skuList]);
  const handleRegisterSKU = async e => {
    e.preventDefault();
    if (!newSkuInput.trim()) {
      if (window.showToast) window.showToast("⚠️ Veuillez saisir un code SKU valide.");
      return;
    }
    const skuClean = newSkuInput.trim();
    const userOrgId = appState.currentUser && appState.currentUser.organisationId || 'org_default';
    try {
      const res = await fetch('/api/sku/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: skuClean,
          classification: newClassifInput,
          photoUrl: newPhotoInput.trim(),
          organisationId: userOrgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message || `✅ SKU "${skuClean}" enregistré comme "${newClassifInput}" avec sa photo !`);
        if (window.loadAppState) await window.loadAppState();
        setNewSkuInput('');
        setNewPhotoInput('');
      } else {
        if (window.showToast) window.showToast(`❌ Erreur : ${data.error || 'Échec de l\'enregistrement'}`);
      }
    } catch (err) {
      console.error("Erreur enregistrement SKU:", err);
      if (window.showToast) window.showToast("❌ Erreur réseau lors de l'enregistrement du SKU");
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Classements & Gestion des SKUs"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px',
      padding: '18px 24px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      border: '1px solid #334155',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#2563eb',
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '18px',
      boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-range"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '15.5px',
      color: '#ffffff',
      fontWeight: 700
    }
  }, "P\xE9riode d'Analyse du Classement & Performances"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12.5px',
      color: '#94a3b8'
    }
  }, rankingDateFilter === 'all' ? 'Toutes les données historiques' : rankingDateFilter === 'custom' ? `Période personnalisée du ${customStartDate || 'début'} au ${customEndDate || 'fin'}` : `Derniers ${rankingDateFilter} jour(s)`))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, [{
    id: 'all',
    label: '🌐 Tout',
    title: 'Historique complet'
  }, {
    id: '1',
    label: '📅 Aujourd\'hui (1j)',
    title: 'Dernières 24 heures'
  }, {
    id: '2',
    label: '⏱️ 2 Jours',
    title: 'Derniers 2 jours'
  }, {
    id: '3',
    label: '⏱️ 3 Jours',
    title: 'Derniers 3 jours'
  }, {
    id: '7',
    label: '🗓️ 1 Semaine (7j)',
    title: 'Derniers 7 jours'
  }, {
    id: '14',
    label: '🗓️ 2 Semaines (14j)',
    title: 'Derniers 14 jours'
  }, {
    id: '30',
    label: '📊 Ce Mois (30j)',
    title: 'Derniers 30 jours'
  }, {
    id: 'custom',
    label: '📆 Personnalisé',
    title: 'Définir une plage de dates exacte'
  }].map(btn => {
    const isActive = rankingDateFilter === btn.id;
    return /*#__PURE__*/React.createElement("button", {
      key: btn.id,
      type: "button",
      onClick: () => setRankingDateFilter(btn.id),
      title: btn.title,
      style: {
        padding: '8px 15px',
        borderRadius: '20px',
        fontSize: '12.5px',
        fontWeight: isActive ? 700 : 500,
        border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.18)',
        backgroundColor: isActive ? '#2563eb' : 'rgba(255,255,255,0.08)',
        color: isActive ? '#ffffff' : '#cbd5e1',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
      }
    }, btn.label);
  }))), rankingDateFilter === 'custom' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '13px',
      color: '#cbd5e1',
      fontWeight: 600
    }
  }, "Du :"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customStartDate,
    onChange: e => setCustomStartDate(e.target.value),
    className: "input",
    style: {
      backgroundColor: '#1e293b',
      color: '#ffffff',
      border: '1px solid #475569',
      borderRadius: '8px',
      padding: '6px 12px',
      fontSize: '13px',
      width: 'auto',
      colorScheme: 'dark'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '13px',
      color: '#cbd5e1',
      fontWeight: 600
    }
  }, "Au :"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: customEndDate,
    onChange: e => setCustomEndDate(e.target.value),
    className: "input",
    style: {
      backgroundColor: '#1e293b',
      color: '#ffffff',
      border: '1px solid #475569',
      borderRadius: '8px',
      padding: '6px 12px',
      fontSize: '13px',
      width: 'auto',
      colorScheme: 'dark'
    }
  })), (customStartDate || customEndDate) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setCustomStartDate('');
      setCustomEndDate('');
    },
    style: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#fca5a5',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rotate-left",
    style: {
      marginRight: '6px'
    }
  }), " R\xE9initialiser les dates"))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: 0,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trophy",
    style: {
      color: '#f59e0b'
    }
  }), "Classement & Classification des Agents", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: '12px',
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    },
    title: "Donn\xE9es et m\xE9triques issues directement de l'API DotB Cloud"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud",
    style: {
      color: '#2563eb'
    }
  }), " Source : DotB Cloud")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    }
  }, "\uD83C\uDFC6 ", agentClassifCounts.top, " Top Agent", agentClassifCounts.top > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-retester",
    style: {
      padding: '6px 12px',
      fontSize: '12px',
      backgroundColor: '#3b82f6',
      color: '#fff'
    }
  }, "\u26A1 ", agentClassifCounts.progression, " En Progression"), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-nouveau",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    }
  }, "\uD83C\uDF1F ", agentClassifCounts.nouveau, " Nouveau", agentClassifCounts.nouveau > 1 ? 'x' : ''), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-ecarte",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    }
  }, "\uD83D\uDED1 ", agentClassifCounts.inactif, " Inactif", agentClassifCounts.inactif > 1 ? 's' : ''))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13.5px',
      marginBottom: '16px'
    }
  }, "Suivi en temps r\xE9el et classification des agents selon leur volume de publications, leur taux de r\xE9ussite et leur score de ventes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '16px',
      backgroundColor: '#f8fafc',
      padding: '10px 14px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn ${agentFilterClassif === 'all' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setAgentFilterClassif('all'),
    style: {
      height: '34px',
      fontSize: '12.5px',
      padding: '0 14px'
    }
  }, "Tous (", agentClassifCounts.total, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn ${agentFilterClassif === '🏆 Agent Top' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setAgentFilterClassif('🏆 Agent Top'),
    style: {
      height: '34px',
      fontSize: '12.5px',
      padding: '0 14px',
      backgroundColor: agentFilterClassif === '🏆 Agent Top' ? '#10b981' : '#fff',
      borderColor: '#10b981',
      color: agentFilterClassif === '🏆 Agent Top' ? '#fff' : '#047857'
    }
  }, "\uD83C\uDFC6 Agent Top (", agentClassifCounts.top, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn ${agentFilterClassif === '⚡ En Progression' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setAgentFilterClassif('⚡ En Progression'),
    style: {
      height: '34px',
      fontSize: '12.5px',
      padding: '0 14px',
      backgroundColor: agentFilterClassif === '⚡ En Progression' ? '#3b82f6' : '#fff',
      borderColor: '#3b82f6',
      color: agentFilterClassif === '⚡ En Progression' ? '#fff' : '#1d4ed8'
    }
  }, "\u26A1 En Progression (", agentClassifCounts.progression, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn ${agentFilterClassif === '🌟 Nouvel Agent' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setAgentFilterClassif('🌟 Nouvel Agent'),
    style: {
      height: '34px',
      fontSize: '12.5px',
      padding: '0 14px',
      backgroundColor: agentFilterClassif === '🌟 Nouvel Agent' ? '#f59e0b' : '#fff',
      borderColor: '#f59e0b',
      color: agentFilterClassif === '🌟 Nouvel Agent' ? '#fff' : '#b45309'
    }
  }, "\uD83C\uDF1F Nouvel Agent (", agentClassifCounts.nouveau, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `btn ${agentFilterClassif === '🛑 Inactif' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => setAgentFilterClassif('🛑 Inactif'),
    style: {
      height: '34px',
      fontSize: '12.5px',
      padding: '0 14px',
      backgroundColor: agentFilterClassif === '🛑 Inactif' ? '#ef4444' : '#fff',
      borderColor: '#ef4444',
      color: agentFilterClassif === '🛑 Inactif' ? '#fff' : '#b91c1c'
    }
  }, "\uD83D\uDED1 Inactif (", agentClassifCounts.inactif, ")")), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '60px'
    }
  }, "Rang"), /*#__PURE__*/React.createElement("th", null, "Agent"), /*#__PURE__*/React.createElement("th", null, "Classification"), /*#__PURE__*/React.createElement("th", null, "Publications"), /*#__PURE__*/React.createElement("th", null, "Taux R\xE9ussite"), /*#__PURE__*/React.createElement("th", null, "Ventes Total"), /*#__PURE__*/React.createElement("th", null, "Score Cumul\xE9"))), /*#__PURE__*/React.createElement("tbody", null, filteredAgentRanking.length > 0 ? filteredAgentRanking.map((a, idx) => /*#__PURE__*/React.createElement("tr", {
    key: a.name
  }, /*#__PURE__*/React.createElement("td", null, idx === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "1er Place"
  }, "\uD83E\uDD47") : idx === 1 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "2\xE8me Place"
  }, "\uD83E\uDD48") : idx === 2 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "3\xE8me Place"
  }, "\uD83E\uDD49") : /*#__PURE__*/React.createElement("b", null, "#", idx + 1)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, a.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)',
      marginLeft: '6px'
    }
  }, "(", a.role, ")")), /*#__PURE__*/React.createElement("td", null, a.classification === '🏆 Agent Top' ? /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant"
  }, "\uD83C\uDFC6 Agent Top") : a.classification === '⚡ En Progression' ? /*#__PURE__*/React.createElement("span", {
    className: "badge badge-retester",
    style: {
      backgroundColor: '#3b82f6',
      color: '#fff'
    }
  }, "\u26A1 En Progression") : a.classification === '🌟 Nouvel Agent' ? /*#__PURE__*/React.createElement("span", {
    className: "badge badge-nouveau"
  }, "\uD83C\uDF1F Nouvel Agent") : /*#__PURE__*/React.createElement("span", {
    className: "badge badge-ecarte"
  }, "\uD83D\uDED1 Inactif")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, a.pubsFaites), " / ", a.pubsTotales, " pub", a.pubsTotales > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      height: '8px',
      overflow: 'hidden',
      minWidth: '60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${a.taux}%`,
      backgroundColor: a.taux >= 80 ? '#10b981' : a.taux >= 50 ? '#f59e0b' : '#ef4444',
      height: '100%'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      fontWeight: 600
    }
  }, a.taux, "%"))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, a.ventes), " vente", a.ventes > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant"
  }, a.scoreTotal.toFixed(1), " pts")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "7",
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '16px'
    }
  }, "Aucun agent correspondant \xE0 ce filtre de classification.")))))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px',
      border: '1px solid #cbd5e1',
      background: 'linear-gradient(to right, #ffffff, #f8fafc)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#1e293b'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-file-csv",
    style: {
      color: '#2563eb',
      fontSize: '22px'
    }
  }), "Importation de Commandes CSV DotB Cloud (Anti-Doublons & Auto-SKU)"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13.5px',
      marginBottom: '16px',
      lineHeight: '1.5'
    }
  }, "Importez directement vos exports de commandes DotB Cloud (19 colonnes). Les commandes d\xE9j\xE0 existantes seront ", /*#__PURE__*/React.createElement("b", null, "automatiquement filtr\xE9es (anti-doublons)"), " et les ", /*#__PURE__*/React.createElement("b", null, "SKUs manquants auto-g\xE9n\xE9r\xE9s"), " avant d'\xEAtre stock\xE9s en base de donn\xE9es."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleImportCsvOrders,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "btn btn-secondary",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      height: '40px',
      fontSize: '13px',
      padding: '0 18px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#fff'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud-arrow-up",
    style: {
      color: '#2563eb'
    }
  }), " S\xE9lectionner un fichier CSV (.csv)", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".csv,text/csv",
    onChange: handleFileUpload,
    style: {
      display: 'none'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "ou collez les donn\xE9es CSV brutes ci-dessous :")), /*#__PURE__*/React.createElement("textarea", {
    className: "input",
    rows: "5",
    value: csvInputText,
    onChange: e => setCsvInputText(e.target.value),
    placeholder: "Collez votre export CSV DotB ici...\nEx:\nID Transaction,Date de commande,Compte,Statut,...\n17967064088,2026-02-09 10:38:00,alchemy354,Suspendu,...",
    style: {
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.45',
      backgroundColor: '#fff',
      border: '1px solid #cbd5e1'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: isImportingCsv || !csvInputText.trim(),
    style: {
      height: '42px',
      padding: '0 24px',
      fontSize: '13.5px',
      fontWeight: 600,
      backgroundColor: '#2563eb',
      border: 'none',
      borderRadius: '8px'
    }
  }, isImportingCsv ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-spinner fa-spin",
    style: {
      marginRight: '8px'
    }
  }), " Filtrage Doublons & Stockage Base...") : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-database",
    style: {
      marginRight: '8px'
    }
  }), " Lancer l'importation & Stocker en Base")), csvImportResult && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      fontSize: '12px',
      fontWeight: 600,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant",
    style: {
      padding: '6px 12px'
    }
  }, "\uD83D\uDCE5 ", csvImportResult.insertedCount, " Cr\xE9\xE9es"), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-retester",
    style: {
      padding: '6px 12px',
      backgroundColor: '#3b82f6',
      color: '#fff'
    }
  }, "\uD83D\uDD04 ", csvImportResult.updatedCount || 0, " Mises \xE0 jour"), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-ecarte",
    style: {
      padding: '6px 12px'
    }
  }, "\uD83D\uDED1 ", csvImportResult.duplicateCount, " Inchang\xE9es"), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-nouveau",
    style: {
      padding: '6px 12px'
    }
  }, "\u2728 ", csvImportResult.generatedSkusCount, " SKUs G\xE9n\xE9r\xE9s"))))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-boxes-packing",
    style: {
      color: 'var(--primary)'
    }
  }), "Enregistrement & R\xE9pertoire des SKU avec Classification", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: '12px',
      backgroundColor: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    },
    title: "M\xE9triques et ventes consolid\xE9es depuis l'API et les exports DotB Cloud"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud",
    style: {
      color: '#2563eb'
    }
  }), " Source : DotB Cloud")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13.5px',
      marginBottom: '16px'
    }
  }, "Enregistrez vos SKU et d\xE9finissez directement leur classification (Nouveau produit, Gagnant, \xC0 retester, \xC9cart\xE9)."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleRegisterSKU,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px',
      backgroundColor: '#f8fafc',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #cbd5e1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 3,
      minWidth: '220px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 600,
      color: 'var(--text-main)',
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-barcode",
    style: {
      color: '#2563eb'
    }
  }), " Code SKU \xE0 V\xE9rifier & Enregistrer"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: newSkuInput,
    onChange: e => setNewSkuInput(e.target.value),
    placeholder: "ex: sz2602188195162729, SKU-JEAN-02",
    required: true,
    style: {
      height: '42px',
      fontSize: '13px',
      paddingRight: '36px',
      borderColor: skuVerificationStatus ? skuVerificationStatus.exists ? '#f59e0b' : '#10b981' : '#cbd5e1',
      backgroundColor: skuVerificationStatus ? skuVerificationStatus.exists ? '#fffbeb' : '#f0fdf4' : '#fff'
    }
  }), skuVerificationStatus && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '15px'
    }
  }, skuVerificationStatus.exists ? '⚠️' : '✅'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      minWidth: '180px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 600,
      color: 'var(--text-main)',
      marginBottom: '6px',
      display: 'block'
    }
  }, "Classification D\xE9finie"), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: newClassifInput,
    onChange: e => setNewClassifInput(e.target.value),
    style: {
      height: '42px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "Nouveau produit"
  }, "\u2728 Nouveau produit"), /*#__PURE__*/React.createElement("option", {
    value: "Gagnant"
  }, "\uD83C\uDFC6 Gagnant"), /*#__PURE__*/React.createElement("option", {
    value: "\xC0 retester"
  }, "\uD83D\uDD04 \xC0 retester"), /*#__PURE__*/React.createElement("option", {
    value: "\xC9cart\xE9"
  }, "\uD83D\uDEAB \xC9cart\xE9"))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      height: '42px',
      padding: '0 22px',
      fontSize: '13px',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-shield-check"
  }), " ", skuVerificationStatus && skuVerificationStatus.exists ? 'Mettre à jour SKU' : 'Vérifier & Enregistrer')), skuVerificationStatus && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      borderRadius: '8px',
      backgroundColor: skuVerificationStatus.exists ? '#fffbebf0' : '#f0fdf4f0',
      border: skuVerificationStatus.exists ? '1px solid #fcd34d' : '1px solid #86efac',
      color: skuVerificationStatus.exists ? '#92400e' : '#166534',
      fontWeight: 500,
      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
    }
  }, skuVerificationStatus.exists ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-triangle-exclamation",
    style: {
      color: '#d97706',
      fontSize: '15px'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "SKU D\xE9j\xE0 Enregistr\xE9 :"), " Produit \"", skuVerificationStatus.produit, "\" \u2014 Classification actuelle : ", /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant",
    style: {
      padding: '2px 8px',
      fontSize: '11px',
      marginLeft: '4px'
    }
  }, skuVerificationStatus.classification), " (", skuVerificationStatus.ventes, " vente(s), ", skuVerificationStatus.pubs, " publication(s)).")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-check",
    style: {
      color: '#16a34a',
      fontSize: '15px'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "SKU Valide & Conforme :"), " Ce code est pr\xEAt \xE0 \xEAtre enregistr\xE9 et class\xE9 sous ", /*#__PURE__*/React.createElement("b", null, "\"", newClassifInput, "\""), ".")))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleBulkRegisterSkus,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      marginBottom: '24px',
      backgroundColor: '#f1f5f9',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #cbd5e1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-file-spreadsheet",
    style: {
      color: '#059669',
      fontSize: '18px'
    }
  }), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 700,
      color: '#0f172a'
    }
  }, "Qualification de Masse depuis Google Sheet ou Liste (Statut : ", /*#__PURE__*/React.createElement("span", {
    className: "badge badge-retester",
    style: {
      backgroundColor: '#3b82f6',
      color: '#fff',
      padding: '2px 8px'
    }
  }, "\uD83D\uDD04 \xC0 retester"), ")")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11.5px',
      color: '#64748b'
    }
  }, "Importation directe de tous les articles du Google Sheet")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 3,
      minWidth: '260px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#334155',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Lien Google Sheet ou Liste de SKUs (S\xE9parez par virgule ou saut de ligne)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: bulkSheetUrlInput,
    onChange: e => setBulkSheetUrlInput(e.target.value),
    placeholder: "ex: https://docs.google.com/spreadsheets/d/1_8zZWfVVCU96VLLIlyulK2gchbrNkBVOyMb6WTr0X6w...",
    style: {
      height: '40px',
      fontSize: '12.5px',
      backgroundColor: '#ffffff'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: isBulkProcessing,
    className: "btn btn-secondary",
    style: {
      height: '40px',
      padding: '0 20px',
      fontSize: '13px',
      fontWeight: 600,
      backgroundColor: '#059669',
      color: '#ffffff',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, isBulkProcessing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-spinner fa-spin"
  }), " Traitement...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud-arrow-down"
  }), " Classer les SKUs du Sheet comme \"\xC0 retester\""))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#475569',
      backgroundColor: '#ffffff',
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Note sur les permissions Google Sheet :"), " Si le fichier est en acc\xE8s restreint, assurez-vous de r\xE9gler le partage sur ", /*#__PURE__*/React.createElement("i", null, "\"Tous les utilisateurs disposant du lien\""), " ou collez directement la liste des SKUs ci-dessous :"), /*#__PURE__*/React.createElement("textarea", {
    className: "input",
    rows: "2",
    value: bulkSkusTextInput,
    onChange: e => setBulkSkusTextInput(e.target.value),
    placeholder: "Collez vos codes SKUs ici (ex: sz26001, sz26002, sz26003...)",
    style: {
      fontSize: '12px',
      fontFamily: 'monospace',
      marginTop: '4px',
      backgroundColor: '#f8fafc'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, "Catalogue des SKUs Qualifi\xE9s (", filteredSKUList.length, ")", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11.5px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '10px',
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #86efac'
    }
  }, "\uD83C\uDF10 ", onlineSkuCount, " En Ligne")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: skuFilterOnline,
    onChange: e => setSkuFilterOnline(e.target.value),
    style: {
      height: '34px',
      fontSize: '12px',
      width: '160px',
      borderRadius: '6px',
      border: skuFilterOnline !== 'all' ? '1.5px solid #10b981' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tous les statuts"), /*#__PURE__*/React.createElement("option", {
    value: "online"
  }, "\uD83C\uDF10 En Ligne uniquement"), /*#__PURE__*/React.createElement("option", {
    value: "offline"
  }, "\u26AA Hors Ligne / Non publi\xE9s")), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: skuFilterClassif,
    onChange: e => setSkuFilterClassif(e.target.value),
    style: {
      height: '34px',
      fontSize: '12px',
      width: '170px',
      borderRadius: '6px',
      border: skuFilterClassif ? '1.5px solid var(--primary)' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Toutes les classifications"), /*#__PURE__*/React.createElement("option", {
    value: "Gagnant"
  }, "\uD83C\uDFC6 Produit Gagnant"), /*#__PURE__*/React.createElement("option", {
    value: "Nouveau produit"
  }, "\u2728 Nouveau produit"), /*#__PURE__*/React.createElement("option", {
    value: "\xC0 retester"
  }, "\uD83D\uDD04 \xC0 retester"), /*#__PURE__*/React.createElement("option", {
    value: "\xC9cart\xE9"
  }, "\uD83D\uDEAB \xC9cart\xE9")), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: skuFilterVentes,
    onChange: e => setSkuFilterVentes(e.target.value),
    style: {
      height: '34px',
      fontSize: '12px',
      width: '160px',
      borderRadius: '6px',
      border: skuFilterVentes !== 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Toutes les ventes"), /*#__PURE__*/React.createElement("option", {
    value: "with_sales"
  }, "\uD83D\uDCB0 Avec Ventes (>0)"), /*#__PURE__*/React.createElement("option", {
    value: "top_sales"
  }, "\uD83D\uDD25 Best-Sellers (\u22653)"), /*#__PURE__*/React.createElement("option", {
    value: "no_sales"
  }, "\u26AA Sans Vente (0)")), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: skuSortBy,
    onChange: e => setSkuSortBy(e.target.value),
    style: {
      height: '34px',
      fontSize: '12px',
      width: '150px',
      borderRadius: '6px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "score"
  }, "Trier par Score"), /*#__PURE__*/React.createElement("option", {
    value: "ventes"
  }, "Trier par Ventes"), /*#__PURE__*/React.createElement("option", {
    value: "pubs"
  }, "Trier par Pubs"), /*#__PURE__*/React.createElement("option", {
    value: "sku"
  }, "Trier par Code SKU")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: skuSearchTerm,
    onChange: e => setSkuSearchTerm(e.target.value),
    placeholder: "\uD83D\uDD0D Filtrer par SKU, Titre ou @compte...",
    style: {
      width: '220px',
      height: '34px',
      fontSize: '12px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "table-container",
    style: {
      maxHeight: '380px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Code SKU"), /*#__PURE__*/React.createElement("th", null, "Statut En Ligne"), /*#__PURE__*/React.createElement("th", null, "Publications (DotB)"), /*#__PURE__*/React.createElement("th", null, "Ventes (DotB)"), /*#__PURE__*/React.createElement("th", null, "Compte(s) Vinted Vendeur"), /*#__PURE__*/React.createElement("th", null, "Prix Constat\xE9"), /*#__PURE__*/React.createElement("th", null, "Classification"), /*#__PURE__*/React.createElement("th", null, "Score Cumul\xE9"))), /*#__PURE__*/React.createElement("tbody", null, filteredSKUList.length > 0 ? filteredSKUList.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.sku,
    style: {
      cursor: 'pointer'
    },
    onClick: () => setSelectedSkuDetail(s),
    title: "Cliquez pour ouvrir les d\xE9tails & l'option de propagation"
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--primary)'
    },
    title: s.produit || s.sku
  }, s.sku)), /*#__PURE__*/React.createElement("td", null, s.isOnline ? /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '4px 10px',
      fontSize: '11.5px',
      borderRadius: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-globe"
  }), " En Ligne (", s.onlinePubs || 1, ")") : /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #cbd5e1',
      padding: '4px 8px',
      fontSize: '11.5px',
      borderRadius: '12px'
    }
  }, "Hors Ligne")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.pubs), " pub", s.pubs > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: s.ventes > 0 ? '#059669' : 'inherit'
    }
  }, s.ventes), " vente", s.ventes > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, s.accountsStr)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#0d9488'
    }
  }, s.pricesStr)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${s.classification === 'Gagnant' ? 'badge-gagnant' : s.classification === 'Écarté' ? 'badge-ecarte' : s.classification === 'Nouveau produit' ? 'badge-nouveau' : 'badge-retester'}`
  }, s.classification)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.scoreCumule.toFixed(1), " pts")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "8",
    style: {
      textAlign: 'center',
      padding: '20px',
      color: 'var(--text-muted)'
    }
  }, "Aucun SKU trouv\xE9 pour ce filtre.")))))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "\uD83C\uDFC6 Top 10 SKU par Score Cumul\xE9"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "SKU"), /*#__PURE__*/React.createElement("th", null, "Pubs"), /*#__PURE__*/React.createElement("th", null, "Ventes"), /*#__PURE__*/React.createElement("th", null, "Score Cumul\xE9"))), /*#__PURE__*/React.createElement("tbody", null, topSKUs.length > 0 ? topSKUs.map((s, idx) => /*#__PURE__*/React.createElement("tr", {
    key: s.sku,
    style: {
      cursor: 'pointer'
    },
    onClick: () => setSelectedSkuDetail(s),
    title: "Cliquez pour ouvrir les d\xE9tails & la propagation"
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, idx + 1)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, s.sku)), /*#__PURE__*/React.createElement("td", null, s.pubs), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.ventes)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant"
  }, s.scoreCumule.toFixed(1), " pts")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "5",
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '16px'
    }
  }, "Donn\xE9es insuffisantes.")))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "\u23F0 Cr\xE9neaux Horaires Optimaux"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Heure"), /*#__PURE__*/React.createElement("th", null, "Pubs"), /*#__PURE__*/React.createElement("th", null, "Ventes"), /*#__PURE__*/React.createElement("th", null, "Score Moyen"))), /*#__PURE__*/React.createElement("tbody", null, topHours.length > 0 ? topHours.map(h => /*#__PURE__*/React.createElement("tr", {
    key: h.heure
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, h.heure)), /*#__PURE__*/React.createElement("td", null, h.pubs), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, h.ventes)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, h.scoreMoyen)))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "4",
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '16px'
    }
  }, "Donn\xE9es insuffisantes."))))))), selectedSkuDetail && (() => {
    const s = selectedSkuDetail;

    // 1. Ensemble de TOUS les comptes ayant DÉJÀ publié ou vendu ce SKU (Case-insensitive)
    const publishedAccountsSet = new Set();
    (s.accountsStr || '').split(',').forEach(a => {
      const clean = a.trim().replace('@', '').toLowerCase();
      if (clean && clean !== 'non spécifié') publishedAccountsSet.add(clean);
    });
    if (Array.isArray(s.accounts)) {
      s.accounts.forEach(a => {
        const clean = String(a).trim().replace('@', '').toLowerCase();
        if (clean) publishedAccountsSet.add(clean);
      });
    }
    (appState.calendrier || []).forEach(l => {
      if (l.sku && String(l.sku).trim().toLowerCase() === String(s.sku).trim().toLowerCase()) {
        if (l.comptePseudo) {
          const clean = String(l.comptePseudo).trim().replace('@', '').toLowerCase();
          if (clean && clean !== 'non spécifié') publishedAccountsSet.add(clean);
        }
      }
    });
    const currentAccounts = Array.from(publishedAccountsSet);

    // 2. Filtre strict des comptes cibles de propagation disponibles :
    // - EXCLURE les comptes BANNIS, SUSPENDUS, BLOQUÉS ou INACTIFS
    // - EXCLURE les comptes qui ont DÉJÀ publié/vendu cet article
    // - EXCLURE les comptes NON ATTRIBUÉS (sans pseudo valide)
    const validTargetComptes = (appState.comptes || []).filter(c => {
      if (!c || !c.pseudo || !String(c.pseudo).trim()) return false;
      const cleanPseudo = String(c.pseudo).trim().replace('@', '').toLowerCase();

      // Filtrer par statut de compte (Banni, Suspendu, Bloqué, Inactif)
      const statusLower = (c.statut || c.status || '').toLowerCase();
      if (statusLower.includes('bann') || statusLower.includes('suspend') || statusLower.includes('bloq') || statusLower.includes('inactif')) {
        return false;
      }

      // Exclure si le compte a DÉJÀ publié ou vendu ce SKU
      if (publishedAccountsSet.has(cleanPseudo)) {
        return false;
      }
      return true;
    });
    const missingAccounts = validTargetComptes.map(c => c.pseudo.trim().replace('@', ''));
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-content card",
      style: {
        maxWidth: '820px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid #cbd5e1'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-gagnant",
      style: {
        fontSize: '12px',
        padding: '4px 10px'
      }
    }, s.classification), /*#__PURE__*/React.createElement("code", {
      style: {
        fontSize: '16px',
        fontWeight: 700,
        color: '#1e293b',
        backgroundColor: '#f1f5f9',
        padding: '2px 8px',
        borderRadius: '6px'
      }
    }, s.sku), s.isOnline ? /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        backgroundColor: '#10b981',
        color: '#ffffff',
        padding: '3px 9px',
        fontSize: '11.5px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-globe"
    }), " En Ligne (", s.onlinePubs || s.pubs || 1, ")") : /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        border: '1px solid #cbd5e1',
        padding: '3px 9px',
        fontSize: '11.5px',
        borderRadius: '12px'
      }
    }, "Hors Ligne"), s.isMultiAccount && /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        backgroundColor: '#8b5cf6',
        color: '#fff',
        fontSize: '11px'
      }
    }, "\uD83D\uDD00 Multi-Compte")), /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 700,
        color: '#0f172a'
      }
    }, s.produit || 'Produit SKU ' + s.sku)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setSelectedSkuDetail(null),
      style: {
        border: 'none',
        background: '#f1f5f9',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-xmark"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: 600
      }
    }, "Ventes Totales"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#059669',
        marginTop: '2px'
      }
    }, s.ventes, " vente", s.ventes > 1 ? 's' : '')), /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: 600
      }
    }, "Publications"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#2563eb',
        marginTop: '2px'
      }
    }, s.pubs, " pub", s.pubs > 1 ? 's' : '')), /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: 600
      }
    }, "Prix Constat\xE9"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#0d9488',
        marginTop: '2px'
      }
    }, s.pricesStr || '35.00€')), /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: 600
      }
    }, "Score Cumul\xE9"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#d97706',
        marginTop: '2px'
      }
    }, (s.scoreCumule || 0).toFixed(1), " pts"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setModalActiveTab('accounts'),
      style: {
        padding: '10px 16px',
        fontSize: '13.5px',
        fontWeight: 600,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderBottom: modalActiveTab === 'accounts' ? '3px solid #2563eb' : 'none',
        color: modalActiveTab === 'accounts' ? '#2563eb' : '#64748b'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-users-gear",
      style: {
        marginRight: '6px'
      }
    }), " Comptes Vendeurs & Statut"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setModalActiveTab('chart'),
      style: {
        padding: '10px 16px',
        fontSize: '13.5px',
        fontWeight: 600,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderBottom: modalActiveTab === 'chart' ? '3px solid #2563eb' : 'none',
        color: modalActiveTab === 'chart' ? '#2563eb' : '#64748b'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-chart-line",
      style: {
        marginRight: '6px'
      }
    }), " Courbe \xC9volutive"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setModalActiveTab('propagation'),
      style: {
        padding: '10px 16px',
        fontSize: '13.5px',
        fontWeight: 600,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderBottom: modalActiveTab === 'propagation' ? '3px solid #2563eb' : 'none',
        color: modalActiveTab === 'propagation' ? '#2563eb' : '#64748b'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-bullhorn",
      style: {
        marginRight: '6px'
      }
    }), " Option Propager (", missingAccounts.length, ")")), modalActiveTab === 'accounts' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
      style: {
        fontSize: '14px',
        fontWeight: 700,
        marginBottom: '12px'
      }
    }, "Ventes et Statut R\xE9els par Compte Vendeur Vinted"), /*#__PURE__*/React.createElement("div", {
      className: "table-container"
    }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Compte Vendeur"), /*#__PURE__*/React.createElement("th", null, "Statut Publication"), /*#__PURE__*/React.createElement("th", null, "Ventes Enregistr\xE9es"), /*#__PURE__*/React.createElement("th", null, "Prix Renseign\xE9"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, currentAccounts.length > 0 ? currentAccounts.map(acc => {
      const accBreakdown = (s.accountBreakdown || []).find(b => b.account.toLowerCase() === acc.toLowerCase());
      const realVentes = accBreakdown ? accBreakdown.ventes : 1;
      return /*#__PURE__*/React.createElement("tr", {
        key: acc
      }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
        style: {
          color: '#2563eb'
        }
      }, "@", acc)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
        className: "badge",
        style: {
          backgroundColor: '#dcfce7',
          color: '#166534',
          fontSize: '11.5px'
        }
      }, "\uD83D\uDFE2 Actif sur le compte")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
        style: {
          color: '#059669'
        }
      }, realVentes, " vente", realVentes > 1 ? 's' : '')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.pricesStr || '35.00€')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm btn-secondary",
        style: {
          fontSize: '11px',
          height: '28px'
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-sync",
        style: {
          marginRight: '4px'
        }
      }), " Synchroniser")));
    }) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "5",
      style: {
        textAlign: 'center',
        padding: '16px',
        color: '#64748b'
      }
    }, "Aucun compte associ\xE9.")))))), modalActiveTab === 'chart' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("h4", {
      style: {
        fontSize: '14px',
        fontWeight: 700,
        margin: 0
      }
    }, "Progression des Ventes par P\xE9riode R\xE9elle"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#64748b'
      }
    }, "Volume cumul\xE9 : ", /*#__PURE__*/React.createElement("b", null, s.ventes, " ventes"))), /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        height: '150px',
        paddingBottom: '10px',
        borderBottom: '2px solid #cbd5e1',
        overflowX: 'auto'
      }
    }, (s.salesTimeline && s.salesTimeline.length > 0 ? s.salesTimeline : [{
      period: 'Fév 2026',
      count: Math.round(s.ventes * 0.3) || 1
    }, {
      period: 'Mars 2026',
      count: Math.round(s.ventes * 0.4) || 1
    }, {
      period: 'Avr 2026',
      count: Math.round(s.ventes * 0.3) || 1
    }]).map((bar, idx) => {
      const maxVal = Math.max(...(s.salesTimeline || [{
        count: 1
      }]).map(b => b.count), 1);
      const heightPct = Math.max(15, Math.min(100, bar.count / maxVal * 100));
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        style: {
          flex: 1,
          minWidth: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '11px',
          fontWeight: 700,
          color: '#059669',
          marginBottom: '4px'
        }
      }, bar.count, " v."), /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: `${heightPct}%`,
          backgroundColor: '#10b981',
          borderRadius: '6px 6px 0 0',
          transition: 'all 0.3s ease'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '11px',
          color: '#64748b',
          marginTop: '6px',
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }
      }, bar.period));
    })))), modalActiveTab === 'propagation' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
      style: {
        fontSize: '14px',
        fontWeight: 700,
        marginBottom: '6px',
        color: '#0f172a'
      }
    }, "\uD83D\uDE80 Propager ce SKU sur les comptes non publiants"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '12.5px',
        color: '#64748b',
        marginBottom: '16px'
      }
    }, "S\xE9lectionnez les comptes vendeurs sur lesquels ce produit n'a ", /*#__PURE__*/React.createElement("b", null, "pas encore \xE9t\xE9 publi\xE9"), " pour maximiser la visibilit\xE9 et multiplier les ventes."), missingAccounts.length > 0 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#334155',
        display: 'block',
        marginBottom: '8px'
      }
    }, "Mode de Propagation :"), /*#__PURE__*/React.createElement("select", {
      className: "input",
      value: propagationMode,
      onChange: e => setPropagationMode(e.target.value),
      style: {
        height: '38px',
        fontSize: '13px',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "optimal"
    }, "\uD83C\uDFAF Cr\xE9neaux Horaires Optimaux (Pic d'audience 20:15 / 16:30)"), /*#__PURE__*/React.createElement("option", {
      value: "staggered"
    }, "\uD83D\uDCC5 Dispatch \xC9tal\xE9 (1 publication par jour sur chaque compte)"), /*#__PURE__*/React.createElement("option", {
      value: "immediate"
    }, "\u26A1 Publication Imm\xE9diate (Cr\xE9ation aujourd'hui)"))), /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#334155',
        display: 'block',
        marginBottom: '8px'
      }
    }, "Comptes Cibles Disponibles (", missingAccounts.length, ") :"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }
    }, missingAccounts.map(acc => {
      const isChecked = selectedAccountsToPropagate.includes(acc);
      return /*#__PURE__*/React.createElement("label", {
        key: acc,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '8px',
          border: isChecked ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          backgroundColor: isChecked ? '#eff6ff' : '#fff',
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: isChecked,
        onChange: e => {
          if (e.target.checked) {
            setSelectedAccountsToPropagate([...selectedAccountsToPropagate, acc]);
          } else {
            setSelectedAccountsToPropagate(selectedAccountsToPropagate.filter(a => a !== acc));
          }
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: '13px',
          fontWeight: 600,
          color: '#1e293b'
        }
      }, "@", acc));
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-primary",
      disabled: isPropagating || selectedAccountsToPropagate.length === 0,
      onClick: () => handlePropagateSku(s.sku),
      style: {
        height: '42px',
        padding: '0 24px',
        fontSize: '13.5px',
        fontWeight: 600,
        width: '100%',
        backgroundColor: '#2563eb'
      }
    }, isPropagating ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-spinner fa-spin",
      style: {
        marginRight: '8px'
      }
    }), " Propagation en cours...") : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-paper-plane",
      style: {
        marginRight: '8px'
      }
    }), " Propager le SKU sur ", selectedAccountsToPropagate.length, " compte(s)"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        padding: '16px',
        borderRadius: '10px',
        color: '#166534',
        fontSize: '13px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-circle-check",
      style: {
        fontSize: '20px',
        marginBottom: '6px',
        display: 'block'
      }
    }), "Ce SKU est d\xE9j\xE0 publi\xE9 et actif sur l'ensemble de vos comptes vendeurs disponibles !"))));
  })());
}

// ------------------- VIEW: GAGNANTS -------------------
function GagnantsView({
  appState,
  onPublishWinner
}) {
  const calendrier = appState.calendrier || [];
  const winnerSKUs = useMemo(() => {
    const map = {};
    calendrier.filter(l => l.classification === 'Gagnant' && l.sku).forEach(l => {
      if (!map[l.sku]) {
        map[l.sku] = {
          sku: l.sku,
          score: l.score,
          produit: l.produit || 'Produit Gagnant',
          comptesPublies: new Set()
        };
      }
      map[l.sku].comptesPublies.add(l.compteId);
    });
    return Object.values(map);
  }, [calendrier]);
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Suggestions SKU Gagnants & Propagation"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "\u2B50 Moteur de Repost Gagnant 1-Clic"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginBottom: '20px'
    }
  }, "Les produits identifi\xE9s comme ", /*#__PURE__*/React.createElement("b", null, "Gagnants"), " sur un compte peuvent \xEAtre automatiquement r\xE9pliqu\xE9s sur l'ensemble de la flotte de comptes actifs."), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SKU Gagnant"), /*#__PURE__*/React.createElement("th", null, "Score"), /*#__PURE__*/React.createElement("th", null, "Comptes Actuellement Publi\xE9s"), /*#__PURE__*/React.createElement("th", null, "Action de Propagation"))), /*#__PURE__*/React.createElement("tbody", null, winnerSKUs.length > 0 ? winnerSKUs.map(w => /*#__PURE__*/React.createElement("tr", {
    key: w.sku
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, /*#__PURE__*/React.createElement("b", null, w.sku))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant"
  }, (w.score || 0).toFixed(1))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, w.comptesPublies.size), " compte(s)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => onPublishWinner(w.sku)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-share-nodes",
    style: {
      marginRight: '6px'
    }
  }), "Publier sur les autres comptes actifs")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "4",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun produit n'a encore atteint le seuil de score \"Gagnant\".")))))));
}

// ------------------- VIEW: JOURNAL -------------------
function JournalView({
  appState
}) {
  const journal = appState.journal || [];
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Journal d'Activit\xE9 & Tra\xE7abilit\xE9 (Audit Logs)"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Horodatage"), /*#__PURE__*/React.createElement("th", null, "Action"), /*#__PURE__*/React.createElement("th", null, "D\xE9tails"), /*#__PURE__*/React.createElement("th", null, "R\xE9sultat"))), /*#__PURE__*/React.createElement("tbody", null, journal.length > 0 ? journal.map(j => /*#__PURE__*/React.createElement("tr", {
    key: j.id
  }, /*#__PURE__*/React.createElement("td", null, j.horodatage), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-compte"
  }, j.action)), /*#__PURE__*/React.createElement("td", null, j.detail), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${j.resultat === 'Succès' ? 'badge-actif' : 'badge-limite'}`
  }, j.resultat)))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "4",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucune entr\xE9e dans le journal d'activit\xE9.")))))));
}

// ------------------- CORBEILLE VIEW -------------------
function CorbeilleView({
  corbeille = [],
  onRestoreItem,
  onDeleteItem,
  onEmptyCorbeille,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const filteredList = useMemo(() => {
    return (corbeille || []).filter(item => {
      if (filterType !== 'ALL' && item.typeEntite !== filterType) return false;
      if (filterAction !== 'ALL' && item.action !== filterAction) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const nom = (item.nomElement || '').toLowerCase();
      const id = (item.idEntite || '').toLowerCase();
      const type = (item.typeEntite || '').toLowerCase();
      const action = (item.action || '').toLowerCase();
      return nom.includes(term) || id.includes(term) || type.includes(term) || action.includes(term);
    });
  }, [corbeille, filterType, filterAction, searchTerm]);
  const getEntityIcon = type => {
    switch (type) {
      case 'calendrier':
        return 'fa-calendar-days';
      case 'comptes':
        return 'fa-store';
      case 'utilisateurs':
        return 'fa-users-gear';
      case 'organisations':
        return 'fa-sitemap';
      case 'incidents':
        return 'fa-triangle-exclamation';
      default:
        return 'fa-database';
    }
  };
  const getEntityLabel = type => {
    switch (type) {
      case 'calendrier':
        return 'Calendrier';
      case 'comptes':
        return 'Compte Vinted';
      case 'utilisateurs':
        return 'Utilisateur';
      case 'organisations':
        return 'Organisation';
      case 'incidents':
        return 'Incident';
      default:
        return type;
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-container"
  }, /*#__PURE__*/React.createElement("header", {
    className: "page-header",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '24px',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash-can",
    style: {
      color: '#ef4444'
    }
  }), " Corbeille de Sauvegarde & Chiffrement"), /*#__PURE__*/React.createElement("p", {
    className: "subtitle",
    style: {
      color: 'var(--text-muted)',
      fontSize: '14px',
      marginTop: '4px'
    }
  }, "Historique chiffr\xE9 (AES-256) des \xE9l\xE9ments modifi\xE9s et supprim\xE9s. Restauration en un clic.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: onRefresh,
    title: "Actualiser la corbeille"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-arrows-rotate"
  }), " Actualiser"), corbeille.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger",
    onClick: onEmptyCorbeille,
    style: {
      background: '#dc2626',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-broom"
  }), " Vider la corbeille (", corbeille.length, ")"))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px',
      marginBottom: '20px',
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: '220px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-magnifying-glass",
    style: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Rechercher par nom, SKU, ID...",
    value: searchTerm,
    onChange: e => setSearchTerm(e.target.value),
    style: {
      width: '100%',
      paddingLeft: '36px',
      height: '38px',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      color: 'var(--text-main)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--text-muted)'
    }
  }, "Entit\xE9 :"), /*#__PURE__*/React.createElement("select", {
    value: filterType,
    onChange: e => setFilterType(e.target.value),
    style: {
      height: '38px',
      padding: '0 12px',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "Toutes les entit\xE9s"), /*#__PURE__*/React.createElement("option", {
    value: "calendrier"
  }, "Calendrier"), /*#__PURE__*/React.createElement("option", {
    value: "comptes"
  }, "Comptes"), /*#__PURE__*/React.createElement("option", {
    value: "utilisateurs"
  }, "Utilisateurs"), /*#__PURE__*/React.createElement("option", {
    value: "organisations"
  }, "Organisations"), /*#__PURE__*/React.createElement("option", {
    value: "incidents"
  }, "Incidents"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--text-muted)'
    }
  }, "Action :"), /*#__PURE__*/React.createElement("select", {
    value: filterAction,
    onChange: e => setFilterAction(e.target.value),
    style: {
      height: '38px',
      padding: '0 12px',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "Toutes les actions"), /*#__PURE__*/React.createElement("option", {
    value: "DELETE"
  }, "Suppression"), /*#__PURE__*/React.createElement("option", {
    value: "UPDATE"
  }, "Modification")))), filteredList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-box-open",
    style: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("h3", null, "Aucun \xE9l\xE9ment dans la corbeille"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '6px',
      fontSize: '14px'
    }
  }, "Les \xE9l\xE9ments modifi\xE9s ou supprim\xE9s appara\xEEtront ici avec leurs sauvegardes chiffr\xE9es.")) : /*#__PURE__*/React.createElement("div", {
    className: "table-responsive card",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "data-table",
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'rgba(0,0,0,0.03)',
      borderBottom: '2px solid var(--border-color)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }
  }, "Date & Heure"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }
  }, "Action"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }
  }, "Type"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }
  }, "\xC9l\xE9ment"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px'
    }
  }, "Chiffrement JSON"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.5px',
      textAlign: 'right'
    }
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, filteredList.map(item => {
    const isExpanded = expandedId === item.id;
    const dateStr = item.dateAction ? new Date(item.dateAction).toLocaleString('fr-FR') : '-';
    const isDelete = item.action === 'DELETE';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: item.id
    }, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: '1px solid var(--border-color)',
        transition: 'background 0.2s'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px',
        fontSize: '13px',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-regular fa-clock",
      style: {
        marginRight: '6px',
        color: 'var(--text-muted)'
      }
    }), dateStr), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: isDelete ? '#ef4444' : '#f59e0b',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: '4px'
      }
    }, isDelete ? 'Suppression' : 'Modification')), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px',
        fontSize: '13px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${getEntityIcon(item.typeEntite)}`,
      style: {
        marginRight: '8px',
        color: 'var(--primary)'
      }
    }), getEntityLabel(item.typeEntite)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: 600
      }
    }, item.nomElement || item.idEntite), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary btn-sm",
      onClick: () => setExpandedId(isExpanded ? null : item.id),
      style: {
        padding: '3px 8px',
        fontSize: '11px',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${isExpanded ? 'fa-lock-open' : 'fa-lock'}`,
      style: {
        color: isExpanded ? '#22c55e' : '#64748b'
      }
    }), isExpanded ? 'Masquer détails' : 'AES-256 (Déchiffrer)')), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '12px 16px',
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => onRestoreItem(item.id),
      title: "Restaurer cet \xE9l\xE9ment vers sa table d'origine",
      style: {
        padding: '4px 10px',
        fontSize: '12px',
        background: '#0284c7'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-rotate-left"
    }), " Restaurer"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => onDeleteItem(item.id),
      title: "Supprimer d\xE9finitivement de la corbeille",
      style: {
        padding: '4px 10px',
        fontSize: '12px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-trash"
    }), " Purger")))), isExpanded && /*#__PURE__*/React.createElement("tr", {
      style: {
        background: 'rgba(0,0,0,0.02)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "6",
      style: {
        padding: '16px',
        borderBottom: '1px solid var(--border-color)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        marginBottom: '6px',
        textTransform: 'uppercase'
      }
    }, "\uD83D\uDD12 Raw Ciphertext (Payload Chiffr\xE9 en Base) :"), /*#__PURE__*/React.createElement("pre", {
      style: {
        background: '#1e293b',
        color: '#38bdf8',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        overflowX: 'auto',
        maxHeight: '180px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }
    }, item.donneesChiffrees)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 700,
        color: '#22c55e',
        marginBottom: '6px',
        textTransform: 'uppercase'
      }
    }, "\uD83D\uDD13 JSON Original D\xE9chiffr\xE9 :"), /*#__PURE__*/React.createElement("pre", {
      style: {
        background: '#0f172a',
        color: '#4ade80',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '11px',
        overflowX: 'auto',
        maxHeight: '180px'
      }
    }, JSON.stringify(item.donneesOriginales || {}, null, 2)))))));
  })))));
}

// ------------------- MESSAGERIE & INBOX VINTED VIEW -------------------
function MessagerieView({
  appState
}) {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompte, setSelectedCompte] = useState('all');
  const [selectedStatut, setSelectedStatut] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadMessages();
  }, []);
  const toggleStatus = async msg => {
    const newStatus = msg.statutLecture === 'lu' ? 'non_lu' : 'lu';
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...msg,
          statutLecture: newStatus
        })
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? {
        ...m,
        statutLecture: newStatus
      } : m));
      if (window.showToast) window.showToast(`Statut du message mis à jour (${newStatus === 'lu' ? 'Lu' : 'Non Lu'}) !`);
    } catch (e) {
      console.error(e);
    }
  };
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = !searchTerm || m.contenu && m.contenu.toLowerCase().includes(searchTerm.toLowerCase()) || m.pseudo && m.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) || m.sku && m.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompte = selectedCompte === 'all' || m.pseudo === selectedCompte;
      const matchesStatut = selectedStatut === 'all' || m.statutLecture === selectedStatut;
      return matchesSearch && matchesCompte && matchesStatut;
    });
  }, [messages, searchTerm, selectedCompte, selectedStatut]);
  const unreadCount = messages.filter(m => m.statutLecture === 'non_lu').length;
  const readCount = messages.filter(m => m.statutLecture === 'lu').length;
  return /*#__PURE__*/React.createElement("div", {
    className: "view-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-header",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "\uD83D\uDCAC Messagerie & Registre des Messages Vinted"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13px'
    }
  }, "D\xE9tecteur et enregistreur automatique de toutes les conversations et messages d'acheteurs/vendeurs via l'API DotB Cloud.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary",
    onClick: loadMessages,
    disabled: isLoading
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`
  }), " Actualiser la bo\xEEte de r\xE9ception")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #09b1ba 0%, #0d9488 100%)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.9
    }
  }, "\uD83D\uDCE9 Total Messages Captur\xE9s"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 800
    }
  }, messages.length)), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.9
    }
  }, "\uD83D\uDCAC Non Lus (Action requise)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 800
    }
  }, unreadCount)), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      opacity: 0.9
    }
  }, "\uD83D\uDFE2 Lus & Trait\xE9s"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px',
      fontWeight: 800
    }
  }, readCount))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: '220px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    placeholder: "\uD83D\uDD0D Rechercher par mot-cl\xE9, pseudo Vinted ou SKU...",
    value: searchTerm,
    onChange: e => setSearchTerm(e.target.value)
  })), /*#__PURE__*/React.createElement("select", {
    className: "select",
    style: {
      width: '180px'
    },
    value: selectedCompte,
    onChange: e => setSelectedCompte(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tous les comptes Vinted"), (appState.comptes || []).map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.pseudo
  }, "@", c.pseudo || c.id))), /*#__PURE__*/React.createElement("select", {
    className: "select",
    style: {
      width: '150px'
    },
    value: selectedStatut,
    onChange: e => setSelectedStatut(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tous les statuts"), /*#__PURE__*/React.createElement("option", {
    value: "non_lu"
  }, "\uD83D\uDD34 Non Lus"), /*#__PURE__*/React.createElement("option", {
    value: "lu"
  }, "\uD83D\uDFE2 Lus")))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Date & Heure"), /*#__PURE__*/React.createElement("th", null, "Compte Vinted"), /*#__PURE__*/React.createElement("th", null, "Auteur"), /*#__PURE__*/React.createElement("th", null, "SKU Associ\xE9"), /*#__PURE__*/React.createElement("th", null, "Message"), /*#__PURE__*/React.createElement("th", null, "Statut"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, filteredMessages.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "7",
    style: {
      textAlign: 'center',
      padding: '30px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-inbox",
    style: {
      fontSize: '24px',
      marginBottom: '8px',
      display: 'block'
    }
  }), "Aucun message trouv\xE9 pour cette s\xE9lection.")) : filteredMessages.map(msg => /*#__PURE__*/React.createElement("tr", {
    key: msg.id,
    style: {
      backgroundColor: msg.statutLecture === 'non_lu' ? '#fef2f2' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: '12.5px',
      whiteSpace: 'nowrap'
    }
  }, "\uD83D\uDCC5 ", msg.dateMessage, " ", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '11px'
    }
  }, "\u23F0 ", msg.heureMessage)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-secondary"
  }, "@", msg.pseudo)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${msg.auteur === 'Acheteur' ? 'badge-primary' : 'badge-secondary'}`
  }, msg.auteur || 'Acheteur')), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'monospace',
      fontWeight: 700
    }
  }, msg.sku || '-'), /*#__PURE__*/React.createElement("td", {
    style: {
      maxWidth: '300px',
      fontSize: '13px'
    }
  }, msg.contenu), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${msg.statutLecture === 'non_lu' ? 'badge-danger' : 'badge-gagnant'}`
  }, msg.statutLecture === 'non_lu' ? '🔴 Non lu' : '🟢 Lu')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: `btn btn-xs ${msg.statutLecture === 'non_lu' ? 'btn-primary' : 'btn-secondary'}`,
    onClick: () => toggleStatus(msg)
  }, msg.statutLecture === 'non_lu' ? '✔ Marquer Lu' : '↩ Marquer Non Lu')))))))));
}

// ============================================================
// AUDIO SYNTHESIZER & NOTIFICATION ENGINE (Web Audio API)
// ============================================================
var SoundEngine = {
  ctx: null,
  isMuted: function () {
    try {
      return localStorage.getItem('vinted_notif_sound_muted') === 'true';
    } catch (e) {
      return false;
    }
  },
  setMuted: function (muted) {
    try {
      localStorage.setItem('vinted_notif_sound_muted', muted ? 'true' : 'false');
    } catch (e) {}
  },
  getContext: function () {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },
  playTone: function (freq, type, duration, delay, gain) {
    delay = delay || 0;
    gain = gain || 0.2;
    if (this.isMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  },
  playUrgentAlert: function () {
    // High attention urgent alert (double siren pulse + harmonic octave)
    this.playTone(880, 'triangle', 0.14, 0, 0.25);
    this.playTone(1174.66, 'triangle', 0.16, 0.11, 0.25);
    this.playTone(880, 'triangle', 0.14, 0.24, 0.25);
    this.playTone(1760, 'triangle', 0.30, 0.36, 0.28);
  },
  playWarningAlert: function () {
    // 2-step attention chime
    this.playTone(587.33, 'sine', 0.18, 0, 0.2);
    this.playTone(880, 'sine', 0.28, 0.15, 0.22);
  },
  playSuccess: function () {
    // Melodic ascending chord C5 -> E5 -> G5 -> C6
    this.playTone(523.25, 'sine', 0.11, 0, 0.2);
    this.playTone(659.25, 'sine', 0.11, 0.09, 0.2);
    this.playTone(783.99, 'sine', 0.13, 0.18, 0.22);
    this.playTone(1046.50, 'sine', 0.28, 0.29, 0.25);
  },
  playSnooze: function () {
    this.playTone(659.25, 'sine', 0.14, 0, 0.18);
    this.playTone(440, 'sine', 0.20, 0.11, 0.15);
  },
  playCheck: function () {
    this.playTone(587.33, 'triangle', 0.07, 0, 0.15);
    this.playTone(880, 'triangle', 0.10, 0.06, 0.18);
  }
};
var SystemNotifications = {
  isSupported: function () {
    return typeof window !== 'undefined' && 'Notification' in window;
  },
  getPermission: function () {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },
  requestPermission: async function () {
    if (!this.isSupported()) return 'unsupported';
    try {
      const p = await Notification.requestPermission();
      return p;
    } catch (e) {
      return 'denied';
    }
  },
  notify: function (title, body, options) {
    options = options || {};
    if (!this.isSupported() || Notification.permission !== 'granted') return null;
    try {
      const notif = new Notification(title, {
        body: body || '',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        tag: options.tag || 'vinted-reminder',
        requireInteraction: options.urgent || false,
        ...options
      });
      notif.onclick = function () {
        window.focus();
        if (options.onClick) options.onClick();
        notif.close();
      };
      return notif;
    } catch (e) {
      console.warn('System push error', e);
      return null;
    }
  }
};
var TodoUtils = {
  parseDeadline: function (todo) {
    if (!todo || !todo.dateEcheance) return null;
    let datePart = String(todo.dateEcheance).trim();
    if (datePart.includes('/')) {
      const p = datePart.split('/');
      if (p.length === 3) datePart = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
    }
    const timePart = todo.heureEcheance ? String(todo.heureEcheance).trim() : '23:59';
    const d = new Date(`${datePart}T${timePart}:00`);
    return isNaN(d.getTime()) ? null : d;
  },
  getStatusInfo: function (todo) {
    if (todo.statut === 'terminee') {
      return {
        isDone: true,
        isOverdue: false,
        isImminent: false,
        label: 'Terminée',
        diffHours: 0
      };
    }
    const d = this.parseDeadline(todo);
    if (!d) {
      return {
        isDone: false,
        isOverdue: false,
        isImminent: false,
        label: 'Sans échéance',
        diffHours: 9999
      };
    }
    const now = Date.now();
    const diffMs = d.getTime() - now;
    const diffMinutes = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    if (diffMs < 0) {
      const overdueMin = Math.abs(diffMinutes);
      let text = '';
      if (overdueMin < 60) text = `En retard de ${overdueMin}m`;else if (overdueMin < 1440) text = `En retard de ${Math.round(overdueMin / 60)}h`;else text = `En retard de ${Math.round(overdueMin / 1440)}j`;
      return {
        isDone: false,
        isOverdue: true,
        isImminent: false,
        label: text,
        diffMinutes,
        diffHours
      };
    }
    const reminderMin = Number(todo.rappelMinutes) >= 0 ? Number(todo.rappelMinutes) : 30;
    const isImminent = diffMinutes <= reminderMin;
    let text = '';
    if (diffMinutes <= 60) {
      text = `Dans ${diffMinutes} min`;
    } else if (diffMinutes < 1440) {
      text = `Aujourd'hui à ${todo.heureEcheance || '23:59'}`;
    } else if (diffMinutes < 2880) {
      text = `Demain à ${todo.heureEcheance || '23:59'}`;
    } else {
      text = `${todo.dateEcheance} ${todo.heureEcheance || ''}`.trim();
    }
    return {
      isDone: false,
      isOverdue: false,
      isImminent,
      label: text,
      diffMinutes,
      diffHours
    };
  }
};

// ============================================================
// NOTIFICATION BELL CENTER (HEADER COMPONENT)
// ============================================================
function NotificationBellCenter({
  todos = [],
  onNavigateTodo,
  onSaveTodo,
  showToast
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => SoundEngine.isMuted());
  const [pushPerm, setPushPerm] = useState(() => SystemNotifications.getPermission());
  const [tabFilter, setTabFilter] = useState('urgents'); // 'urgents' | 'all' | 'today'

  // Real-time calculated alerts
  const alerts = useMemo(() => {
    return (todos || []).map(t => {
      const info = TodoUtils.getStatusInfo(t);
      return {
        todo: t,
        info
      };
    }).filter(item => !item.info.isDone);
  }, [todos]);
  const urgentOverdueAlerts = useMemo(() => {
    return alerts.filter(a => a.info.isOverdue || a.todo.priorite === 'urgente' || a.info.isImminent);
  }, [alerts]);
  const activeList = useMemo(() => {
    if (tabFilter === 'urgents') return urgentOverdueAlerts;
    if (tabFilter === 'today') {
      return alerts.filter(a => a.info.isOverdue || a.info.diffMinutes >= 0 && a.info.diffMinutes < 1440);
    }
    return alerts;
  }, [tabFilter, alerts, urgentOverdueAlerts]);
  const hasUrgent = urgentOverdueAlerts.length > 0;
  const badgeCount = urgentOverdueAlerts.length;

  // Toggle sound
  const handleToggleSound = e => {
    e.stopPropagation();
    const next = !soundMuted;
    setSoundMuted(next);
    SoundEngine.setMuted(next);
    if (showToast) showToast(next ? '🔇 Alertes sonores désactivées' : '🔊 Alertes sonores activées');
    if (!next) SoundEngine.playCheck();
  };

  // Test audio
  const handleTestSound = e => {
    e.stopPropagation();
    SoundEngine.playUrgentAlert();
    if (showToast) showToast('🔔 Démonstration alerte sonore ultra-haute priorité !');
  };

  // Request push
  const handleRequestPush = async e => {
    e.stopPropagation();
    const p = await SystemNotifications.requestPermission();
    setPushPerm(p);
    if (p === 'granted') {
      SystemNotifications.notify('Vinted Manager', 'Notifications bureau activées avec succès ! 🎉');
      if (showToast) showToast('✅ Notifications système autorisées');
    } else {
      if (showToast) showToast('⚠️ Les notifications sont désactivées sur ce navigateur', true);
    }
  };

  // Quick complete
  const handleQuickDone = async (todo, e) => {
    e.stopPropagation();
    SoundEngine.playSuccess();
    if (onSaveTodo) {
      await onSaveTodo({
        ...todo,
        statut: 'terminee'
      });
    }
    if (showToast) showToast(`✅ Tâche "${todo.titre}" terminée !`);
  };

  // Quick snooze (+1 hour or +1 day)
  const handleSnooze = async (todo, hours, e) => {
    e.stopPropagation();
    SoundEngine.playSnooze();
    const d = TodoUtils.parseDeadline(todo) || new Date();
    const newD = new Date(d.getTime() + hours * 3600000);
    const yyyy = newD.getFullYear();
    const mm = String(newD.getMonth() + 1).padStart(2, '0');
    const dd = String(newD.getDate()).padStart(2, '0');
    const hh = String(newD.getHours()).padStart(2, '0');
    const min = String(newD.getMinutes()).padStart(2, '0');
    if (onSaveTodo) {
      await onSaveTodo({
        ...todo,
        dateEcheance: `${yyyy}-${mm}-${dd}`,
        heureEcheance: `${hh}:${min}`
      });
    }
    if (showToast) showToast(`⏰ Reporté de +${hours}h (${hh}:${min})`);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "notif-dropdown-wrapper",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `notif-bell-btn ${hasUrgent ? 'has-urgent' : ''}`,
    onClick: () => setIsOpen(!isOpen),
    title: "Notifications & Rappels T\xE2ches",
    "aria-label": "Centre de notifications"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${hasUrgent ? 'fa-bell fa-bounce' : 'fa-bell'}`,
    style: {
      fontSize: '15px'
    }
  }), badgeCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: `notif-badge-counter ${hasUrgent ? 'pulse' : ''}`
  }, badgeCount > 99 ? '99+' : badgeCount)), isOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 998
    },
    onClick: () => setIsOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "notif-popover"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notif-popover-header"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-bell",
    style: {
      color: 'var(--primary-color)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '14px',
      color: 'var(--text-main)'
    }
  }, "Notifications & Alertes"), /*#__PURE__*/React.createElement("span", {
    className: `badge ${badgeCount > 0 ? 'badge-danger' : 'badge-secondary'}`,
    style: {
      fontSize: '11px',
      padding: '2px 6px'
    }
  }, alerts.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleToggleSound,
    title: soundMuted ? 'Activer le son' : 'Couper le son',
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: soundMuted ? '#ef4444' : '#22c55e',
      fontSize: '14px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${soundMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleTestSound,
    title: "Tester l'alerte sonore",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-play"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setIsOpen(false),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      fontSize: '14px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark"
  })))), pushPerm !== 'granted' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(147,51,234,0.08))',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '11.5px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#1e293b'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-desktop",
    style: {
      marginRight: '6px',
      color: '#2563eb'
    }
  }), "Activer les alertes sur votre bureau ?"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary btn-xs",
    onClick: handleRequestPush,
    style: {
      fontSize: '11px',
      padding: '2px 8px'
    }
  }, "Activer")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc',
      padding: '4px 8px',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTabFilter('urgents'),
    style: {
      flex: 1,
      border: 'none',
      borderRadius: '6px',
      padding: '5px 4px',
      fontSize: '11px',
      fontWeight: tabFilter === 'urgents' ? 700 : 500,
      background: tabFilter === 'urgents' ? '#fee2e2' : 'transparent',
      color: tabFilter === 'urgents' ? '#b91c1c' : '#64748b',
      cursor: 'pointer'
    }
  }, "\uD83D\uDEA8 Urgents (", urgentOverdueAlerts.length, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTabFilter('today'),
    style: {
      flex: 1,
      border: 'none',
      borderRadius: '6px',
      padding: '5px 4px',
      fontSize: '11px',
      fontWeight: tabFilter === 'today' ? 700 : 500,
      background: tabFilter === 'today' ? '#e0e7ff' : 'transparent',
      color: tabFilter === 'today' ? '#4338ca' : '#64748b',
      cursor: 'pointer'
    }
  }, "\uD83D\uDCC5 Aujourd'hui"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTabFilter('all'),
    style: {
      flex: 1,
      border: 'none',
      borderRadius: '6px',
      padding: '5px 4px',
      fontSize: '11px',
      fontWeight: tabFilter === 'all' ? 700 : 500,
      background: tabFilter === 'all' ? '#e2e8f0' : 'transparent',
      color: tabFilter === 'all' ? '#0f172a' : '#64748b',
      cursor: 'pointer'
    }
  }, "Tout (", alerts.length, ")")), /*#__PURE__*/React.createElement("div", {
    className: "notif-popover-body"
  }, activeList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '30px 16px',
      color: '#94a3b8'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-check",
    style: {
      fontSize: '32px',
      color: '#10b981',
      marginBottom: '8px',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: '13px',
      color: '#1e293b'
    }
  }, "Aucune alerte en attente !"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11.5px',
      marginTop: '4px'
    }
  }, "Toutes vos t\xE2ches sont \xE0 jour et sous contr\xF4le.")) : activeList.map(({
    todo,
    info
  }) => {
    const subtasksCount = (todo.sousTaches || []).length;
    const subtasksDone = (todo.sousTaches || []).filter(s => s.fait).length;
    return /*#__PURE__*/React.createElement("div", {
      key: todo.id,
      className: `notif-item ${info.isOverdue ? 'overdue' : todo.priorite === 'urgente' ? 'urgent' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '3px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: `badge-priority badge-priority-${todo.priorite || 'moyenne'}`
    }, todo.priorite === 'urgente' ? '🚨 URGENTE' : todo.priorite || 'Moyenne'), todo.categorie && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-secondary",
      style: {
        fontSize: '10px',
        padding: '1px 5px'
      }
    }, todo.categorie), todo.compteNom && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-primary",
      style: {
        fontSize: '10px',
        padding: '1px 5px'
      }
    }, "@", todo.compteNom)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: '13px',
        color: '#0f172a',
        marginBottom: '3px'
      }
    }, todo.titre), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        color: info.isOverdue ? '#dc2626' : info.isImminent ? '#ea580c' : '#64748b',
        fontWeight: info.isOverdue || info.isImminent ? 600 : 400
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${info.isOverdue ? 'fa-triangle-exclamation' : 'fa-clock'}`
    }), /*#__PURE__*/React.createElement("span", null, info.label), subtasksCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#64748b',
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-list-check",
      style: {
        marginRight: '3px'
      }
    }), subtasksDone, "/", subtasksCount)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '6px',
        marginTop: '8px',
        paddingTop: '6px',
        borderTop: '1px dashed #f1f5f9'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-xs btn-success",
      onClick: e => handleQuickDone(todo, e),
      title: "Marquer comme termin\xE9e",
      style: {
        fontSize: '10.5px',
        padding: '2px 7px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-check"
    }), " Fait"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-xs btn-secondary",
      onClick: e => handleSnooze(todo, 1, e),
      title: "Reporter de 1 heure",
      style: {
        fontSize: '10.5px',
        padding: '2px 7px'
      }
    }, "+1h"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-xs btn-secondary",
      onClick: e => handleSnooze(todo, 24, e),
      title: "Reporter de 1 jour",
      style: {
        fontSize: '10.5px',
        padding: '2px 7px'
      }
    }, "+1j"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-xs btn-primary",
      onClick: () => {
        setIsOpen(false);
        if (onNavigateTodo) onNavigateTodo(todo.id);
      },
      title: "Voir dans le gestionnaire",
      style: {
        fontSize: '10.5px',
        padding: '2px 7px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-arrow-right"
    }))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "notif-popover-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary btn-sm",
    style: {
      width: '100%',
      justifyContent: 'center'
    },
    onClick: () => {
      setIsOpen(false);
      if (onNavigateTodo) onNavigateTodo();
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check",
    style: {
      marginRight: '6px'
    }
  }), "Ouvrir le Gestionnaire To-Do")))));
}

// ============================================================
// MAIN TODO VIEW (PAGE TO-DO & GESTIONNAIRE AVANCÉ)
// ============================================================
function TodoView({
  currentUser,
  appState,
  onSaveTodo,
  onDeleteTodo,
  onBulkUpdateTodos,
  onBulkDeleteTodos,
  showToast
}) {
  const todos = appState.todos || [];
  const comptes = appState.comptes || [];
  const utilisateurs = appState.utilisateurs || [];

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, a_faire, en_cours, terminee
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, urgente, haute, moyenne, basse
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [compteFilter, setCompteFilter] = useState('all');
  const [sortBy, setSortBy] = useState('echeance_asc'); // echeance_asc, echeance_desc, priorite_desc, date_desc, titre_asc

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Form state
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState('moyenne');
  const [statut, setStatut] = useState('a_faire');
  const [categorie, setCategorie] = useState('Expédition');
  const [compteId, setCompteId] = useState('');
  const [agentAssigne, setAgentAssigne] = useState('');
  const [dateEcheance, setDateEcheance] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [heureEcheance, setHeureEcheance] = useState('18:00');
  const [rappelMinutes, setRappelMinutes] = useState(30);
  const [alerteSonore, setAlerteSonore] = useState(true);
  const [sousTaches, setSousTaches] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Pre-fill categories list
  const predefinedCategories = ['Expédition', 'Litige & SAV', 'Annonce & Photos', 'Boost & Promos', 'Comptabilité', 'Inventaire', 'Autre'];

  // Stats calculations
  const stats = useMemo(() => {
    let total = todos.length;
    let urgentes = 0;
    let enRetard = 0;
    let enCours = 0;
    let terminees = 0;
    todos.forEach(t => {
      const info = TodoUtils.getStatusInfo(t);
      if (t.statut === 'terminee') {
        terminees++;
      } else {
        if (t.statut === 'en_cours') enCours++;
        if (t.priorite === 'urgente') urgentes++;
        if (info.isOverdue) enRetard++;
      }
    });
    const percentDone = total > 0 ? Math.round(terminees / total * 100) : 0;
    return {
      total,
      urgentes,
      enRetard,
      enCours,
      terminees,
      percentDone
    };
  }, [todos]);

  // Filtered & Sorted list
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      if (statusFilter !== 'all' && t.statut !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priorite !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.categorie !== categoryFilter) return false;
      if (agentFilter !== 'all' && t.agentAssigne !== agentFilter) return false;
      if (compteFilter !== 'all' && t.compteId !== compteFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (t.titre || '').toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchCat = (t.categorie || '').toLowerCase().includes(q);
        const matchCompte = (t.compteNom || '').toLowerCase().includes(q);
        const matchAgent = (t.agentAssigne || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchCompte && !matchAgent) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'echeance_asc') {
        const da = TodoUtils.parseDeadline(a) || new Date('2099-12-31');
        const db = TodoUtils.parseDeadline(b) || new Date('2099-12-31');
        return da - db;
      }
      if (sortBy === 'echeance_desc') {
        const da = TodoUtils.parseDeadline(a) || new Date('1970-01-01');
        const db = TodoUtils.parseDeadline(b) || new Date('1970-01-01');
        return db - da;
      }
      if (sortBy === 'priorite_desc') {
        const weights = {
          urgente: 4,
          haute: 3,
          moyenne: 2,
          basse: 1
        };
        return (weights[b.priorite] || 0) - (weights[a.priorite] || 0);
      }
      if (sortBy === 'titre_asc') {
        return (a.titre || '').localeCompare(b.titre || '');
      }
      if (sortBy === 'date_desc') {
        return new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0);
      }
      return 0;
    });
  }, [todos, statusFilter, priorityFilter, categoryFilter, agentFilter, compteFilter, searchTerm, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingTodo(null);
    setTitre('');
    setDescription('');
    setPriorite('moyenne');
    setStatut('a_faire');
    setCategorie('Expédition');
    setCompteId(comptes[0] ? comptes[0].id : '');
    setAgentAssigne(currentUser ? currentUser.agentAssigne || currentUser.nom : '');
    const today = new Date();
    setDateEcheance(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    setHeureEcheance('18:00');
    setRappelMinutes(30);
    setAlerteSonore(true);
    setSousTaches([]);
    setNewSubtaskText('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = todo => {
    setEditingTodo(todo);
    setTitre(todo.titre || '');
    setDescription(todo.description || '');
    setPriorite(todo.priorite || 'moyenne');
    setStatut(todo.statut || 'a_faire');
    setCategorie(todo.categorie || 'Expédition');
    setCompteId(todo.compteId || '');
    setAgentAssigne(todo.agentAssigne || '');
    setDateEcheance(todo.dateEcheance || '');
    setHeureEcheance(todo.heureEcheance || '18:00');
    setRappelMinutes(todo.rappelMinutes !== undefined ? todo.rappelMinutes : 30);
    setAlerteSonore(todo.alerteSonore !== false);
    setSousTaches(Array.isArray(todo.sousTaches) ? [...todo.sousTaches] : []);
    setNewSubtaskText('');
    setIsModalOpen(true);
  };

  // Save Todo
  const handleSubmit = async e => {
    e.preventDefault();
    if (!titre.trim()) {
      if (showToast) showToast('Veuillez renseigner un titre de tâche', true);
      return;
    }
    const selectedCompte = comptes.find(c => c.id === compteId);
    const compteNom = selectedCompte ? selectedCompte.nomCompte || selectedCompte.nom || selectedCompte.pseudo : '';
    const payload = {
      id: editingTodo ? editingTodo.id : undefined,
      titre: titre.trim(),
      description: description.trim(),
      priorite,
      statut,
      categorie,
      compteId,
      compteNom,
      agentAssigne,
      dateEcheance,
      heureEcheance,
      rappelMinutes: Number(rappelMinutes),
      alerteSonore,
      sousTaches
    };
    try {
      await onSaveTodo(payload);
      setIsModalOpen(false);
      if (payload.priorite === 'urgente') {
        SoundEngine.playUrgentAlert();
      } else {
        SoundEngine.playCheck();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle direct complete / status cycle
  const handleToggleDone = async todo => {
    const isCurrentlyDone = todo.statut === 'terminee';
    const nextStatut = isCurrentlyDone ? 'a_faire' : 'terminee';
    if (!isCurrentlyDone) {
      SoundEngine.playSuccess();
    } else {
      SoundEngine.playCheck();
    }
    await onSaveTodo({
      ...todo,
      statut: nextStatut
    });
  };

  // Toggle Subtask
  const handleToggleSubtask = async (todo, subIndex) => {
    SoundEngine.playCheck();
    const updatedSubs = (todo.sousTaches || []).map((s, idx) => {
      if (idx === subIndex) return {
        ...s,
        fait: !s.fait
      };
      return s;
    });

    // If all subtasks are done, offer auto-completion
    const allDone = updatedSubs.length > 0 && updatedSubs.every(s => s.fait);
    const updatedTodo = {
      ...todo,
      sousTaches: updatedSubs,
      statut: allDone ? 'terminee' : todo.statut
    };
    if (allDone && todo.statut !== 'terminee') {
      SoundEngine.playSuccess();
      if (showToast) showToast(`🎉 Toutes les sous-tâches sont complétées !`);
    }
    await onSaveTodo(updatedTodo);
  };

  // Quick Snooze +1h or +1j
  const handleQuickSnooze = async (todo, hours) => {
    SoundEngine.playSnooze();
    const d = TodoUtils.parseDeadline(todo) || new Date();
    const newD = new Date(d.getTime() + hours * 3600000);
    const yyyy = newD.getFullYear();
    const mm = String(newD.getMonth() + 1).padStart(2, '0');
    const dd = String(newD.getDate()).padStart(2, '0');
    const hh = String(newD.getHours()).padStart(2, '0');
    const min = String(newD.getMinutes()).padStart(2, '0');
    await onSaveTodo({
      ...todo,
      dateEcheance: `${yyyy}-${mm}-${dd}`,
      heureEcheance: `${hh}:${min}`
    });
    if (showToast) showToast(`⏰ Échéance repoussée de +${hours}h`);
  };

  // Add subtask inside modal
  const handleAddSubtaskInModal = () => {
    if (!newSubtaskText.trim()) return;
    setSousTaches([...sousTaches, {
      id: Date.now(),
      texte: newSubtaskText.trim(),
      fait: false
    }]);
    setNewSubtaskText('');
  };
  const handleRemoveSubtaskInModal = index => {
    setSousTaches(sousTaches.filter((_, i) => i !== index));
  };

  // Bulk selection handlers
  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedIds(filteredTodos.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectOne = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleBulkMarkDone = async () => {
    if (selectedIds.length === 0) return;
    SoundEngine.playSuccess();
    await onBulkUpdateTodos(selectedIds, {
      statut: 'terminee'
    });
    setSelectedIds([]);
    if (showToast) showToast(`${selectedIds.length} tâche(s) marquée(s) comme terminée(s)`);
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer définitivement ${selectedIds.length} tâche(s) ?`)) return;
    await onBulkDeleteTodos(selectedIds);
    setSelectedIds([]);
    if (showToast) showToast(`${selectedIds.length} tâche(s) supprimée(s)`);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "todo-view-container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '24px',
      fontWeight: 800,
      color: 'var(--text-main)',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check",
    style: {
      color: 'var(--primary-color)'
    }
  }), "To-Do List & Rappels Intelligents"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0 0',
      color: 'var(--text-muted)',
      fontSize: '13px'
    }
  }, "Suivi en temps r\xE9el des actions, alertes sonores instantan\xE9es et synchronisation d'\xE9quipe.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => {
      SoundEngine.playUrgentAlert();
      if (showToast) showToast('🔊 Test alerte sonore effectué');
    },
    title: "Tester le son du synth\xE9tiseur Web Audio"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-volume-high"
  }), " Tester Alerte"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: handleOpenAdd,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-plus"
  }), " Nouvelle T\xE2che"))), /*#__PURE__*/React.createElement("div", {
    className: "dashboard-grid",
    style: {
      marginBottom: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      borderLeft: '4px solid var(--primary-color)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-card-title"
  }, "Total T\xE2ches"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-icon",
    style: {
      background: 'rgba(99, 102, 241, 0.1)',
      color: 'var(--primary-color)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clipboard-list"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-value"
  }, stats.total), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '4px'
    }
  }, "Taux d'ach\xE8vement : ", /*#__PURE__*/React.createElement("strong", null, stats.percentDone, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      borderLeft: '4px solid #ef4444'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-card-title"
  }, "\uD83D\uDEA8 Urgentes & Critiques"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-icon",
    style: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-fire-flame-curved"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-value",
    style: {
      color: stats.urgentes > 0 ? '#ef4444' : 'inherit'
    }
  }, stats.urgentes), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px',
      fontWeight: 600
    }
  }, stats.urgentes > 0 ? 'Priorité immédiate requise' : 'Aucune urgence en attente')), /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      borderLeft: '4px solid #f59e0b'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-card-title"
  }, "\u26A0\uFE0F En Retard"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-icon",
    style: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-triangle-exclamation"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-value",
    style: {
      color: stats.enRetard > 0 ? '#f59e0b' : 'inherit'
    }
  }, stats.enRetard), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '4px'
    }
  }, "\xC9ch\xE9ances d\xE9pass\xE9es")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      borderLeft: '4px solid #0284c7'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-card-title"
  }, "\u23F3 En Cours"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-icon",
    style: {
      background: 'rgba(2, 132, 199, 0.1)',
      color: '#0284c7'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-spinner"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-value"
  }, stats.enCours), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '4px'
    }
  }, "T\xE2ches en traitement actif")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card",
    style: {
      borderLeft: '4px solid #10b981'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-card-title"
  }, "\u2705 Termin\xE9es"), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-icon",
    style: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-check"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "stat-card-value",
    style: {
      color: '#10b981'
    }
  }, stats.terminees), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#10b981',
      marginTop: '4px',
      fontWeight: 600
    }
  }, stats.percentDone, "% accompli"))), /*#__PURE__*/React.createElement("div", {
    className: "table-card",
    style: {
      padding: '16px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: 'span 2'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Recherche"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-magnifying-glass",
    style: {
      position: 'absolute',
      left: '10px',
      top: '10px',
      color: '#94a3b8'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "Rechercher par titre, description, compte, agent...",
    value: searchTerm,
    onChange: e => setSearchTerm(e.target.value),
    style: {
      paddingLeft: '32px'
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Statut"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: statusFilter,
    onChange: e => setStatusFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tous les statuts"), /*#__PURE__*/React.createElement("option", {
    value: "a_faire"
  }, "\xC0 faire"), /*#__PURE__*/React.createElement("option", {
    value: "en_cours"
  }, "En cours"), /*#__PURE__*/React.createElement("option", {
    value: "terminee"
  }, "Termin\xE9es"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Priorit\xE9"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: priorityFilter,
    onChange: e => setPriorityFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Toutes priorit\xE9s"), /*#__PURE__*/React.createElement("option", {
    value: "urgente"
  }, "\uD83D\uDEA8 Urgente"), /*#__PURE__*/React.createElement("option", {
    value: "haute"
  }, "Haute"), /*#__PURE__*/React.createElement("option", {
    value: "moyenne"
  }, "Moyenne"), /*#__PURE__*/React.createElement("option", {
    value: "basse"
  }, "Basse"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Cat\xE9gorie"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: categoryFilter,
    onChange: e => setCategoryFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Toutes cat\xE9gories"), predefinedCategories.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Compte Vinted"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: compteFilter,
    onChange: e => setCompteFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Tous les comptes"), comptes.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, "@", c.nomCompte || c.nom || c.pseudo)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '11px',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 700,
      display: 'block',
      marginBottom: '4px'
    }
  }, "Trier par"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: sortBy,
    onChange: e => setSortBy(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "echeance_asc"
  }, "\xC9ch\xE9ance (Plus proche)"), /*#__PURE__*/React.createElement("option", {
    value: "echeance_desc"
  }, "\xC9ch\xE9ance (Plus lointaine)"), /*#__PURE__*/React.createElement("option", {
    value: "priorite_desc"
  }, "Priorit\xE9 (Haute en premier)"), /*#__PURE__*/React.createElement("option", {
    value: "date_desc"
  }, "Date de cr\xE9ation (R\xE9cent)"), /*#__PURE__*/React.createElement("option", {
    value: "titre_asc"
  }, "Titre (A-Z)")))), selectedIds.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '8px',
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: '13px',
      color: 'var(--primary-color)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check-double",
    style: {
      marginRight: '6px'
    }
  }), selectedIds.length, " t\xE2che(s) s\xE9lectionn\xE9e(s)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success btn-sm",
    onClick: handleBulkMarkDone
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check"
  }), " Marquer Termin\xE9es"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-danger btn-sm",
    onClick: handleBulkDelete
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  }), " Supprimer")))), /*#__PURE__*/React.createElement("div", {
    className: "table-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-responsive"
  }, /*#__PURE__*/React.createElement("table", {
    className: "data-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '40px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: filteredTodos.length > 0 && selectedIds.length === filteredTodos.length,
    onChange: handleSelectAll,
    style: {
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '50px',
      textAlign: 'center'
    }
  }, "Statut"), /*#__PURE__*/React.createElement("th", null, "T\xE2che & D\xE9tails"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '130px'
    }
  }, "Priorit\xE9"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '140px'
    }
  }, "Compte / Agent"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '170px'
    }
  }, "\xC9ch\xE9ance & Alerte"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: '150px',
      textAlign: 'right'
    }
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, filteredTodos.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "7",
    style: {
      textAlign: 'center',
      padding: '40px 16px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check",
    style: {
      fontSize: '36px',
      color: '#cbd5e1',
      marginBottom: '10px',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: '14px',
      color: 'var(--text-main)'
    }
  }, "Aucune t\xE2che trouv\xE9e"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      marginTop: '4px'
    }
  }, "Modifiez vos filtres ou cr\xE9ez une nouvelle t\xE2che To-Do."))) : filteredTodos.map(todo => {
    const isDone = todo.statut === 'terminee';
    const info = TodoUtils.getStatusInfo(todo);
    const isSelected = selectedIds.includes(todo.id);
    const subtasks = Array.isArray(todo.sousTaches) ? todo.sousTaches : [];
    const subtasksDone = subtasks.filter(s => s.fait).length;
    const subtasksPercent = subtasks.length > 0 ? Math.round(subtasksDone / subtasks.length * 100) : 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: todo.id,
      className: `todo-row ${isDone ? 'done' : ''} ${info.isOverdue ? 'overdue' : ''} ${todo.priorite === 'urgente' && !isDone ? 'urgent-glow' : ''}`,
      style: {
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : undefined
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isSelected,
      onChange: () => handleSelectOne(todo.id),
      style: {
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => handleToggleDone(todo),
      title: isDone ? 'Marquer comme non terminée' : 'Marquer comme terminée',
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        color: isDone ? '#10b981' : '#94a3b8'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-regular ${isDone ? 'fa-circle-check fa-solid' : 'fa-circle'}`
    }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: '14px',
        color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
        textDecoration: isDone ? 'line-through' : 'none'
      }
    }, todo.titre), todo.categorie && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-secondary",
      style: {
        fontSize: '11px',
        padding: '1px 6px'
      }
    }, todo.categorie)), todo.description && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginBottom: '6px',
        whiteSpace: 'pre-line'
      }
    }, todo.description), subtasks.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '8px',
        padding: '8px 10px',
        background: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        maxWidth: '500px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#64748b',
        marginBottom: '4px',
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-list-check",
      style: {
        marginRight: '5px'
      }
    }), "Sous-t\xE2ches : ", subtasksDone, "/", subtasks.length, " (", subtasksPercent, "%)")), /*#__PURE__*/React.createElement("div", {
      className: "subtask-progress-bar",
      style: {
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "subtask-progress-fill",
      style: {
        width: `${subtasksPercent}%`
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }
    }, subtasks.map((st, sIdx) => /*#__PURE__*/React.createElement("label", {
      key: st.id || sIdx,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11.5px',
        color: st.fait ? '#94a3b8' : '#334155',
        textDecoration: st.fait ? 'line-through' : 'none',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: Boolean(st.fait),
      onChange: () => handleToggleSubtask(todo, sIdx),
      style: {
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", null, st.texte)))))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: `badge-priority badge-priority-${todo.priorite || 'moyenne'}`
    }, todo.priorite === 'urgente' && /*#__PURE__*/React.createElement("span", {
      className: "urgent-ping",
      style: {
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#ef4444',
        marginRight: '5px'
      }
    }), todo.priorite === 'urgente' ? '🚨 URGENTE' : (todo.priorite || 'Moyenne').toUpperCase())), /*#__PURE__*/React.createElement("td", null, todo.compteNom ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--primary-color)',
        marginBottom: '2px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-store",
      style: {
        marginRight: '4px',
        fontSize: '11px'
      }
    }), "@", todo.compteNom) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#94a3b8'
      }
    }, "-"), todo.agentAssigne && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11.5px',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-user",
      style: {
        marginRight: '4px',
        fontSize: '10px'
      }
    }), todo.agentAssigne)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '12px',
        fontWeight: info.isOverdue ? 700 : info.isImminent ? 600 : 500,
        color: info.isOverdue ? '#dc2626' : info.isImminent ? '#ea580c' : '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${info.isOverdue ? 'fa-triangle-exclamation' : 'fa-calendar-day'}`
    }), /*#__PURE__*/React.createElement("span", null, info.label)), todo.heureEcheance && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '2px'
      }
    }, "Heure : ", todo.heureEcheance)), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        gap: '4px'
      }
    }, !isDone && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs",
      onClick: () => handleQuickSnooze(todo, 1),
      title: "Reporter de 1 heure"
    }, "+1h"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-xs",
      onClick: () => handleOpenEdit(todo),
      title: "Modifier la t\xE2che"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-pen"
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-danger btn-xs",
      onClick: () => {
        if (confirm(`Supprimer la tâche "${todo.titre}" ?`)) {
          onDeleteTodo(todo.id);
        }
      },
      title: "Supprimer la t\xE2che"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-trash"
    })))));
  }))))), isModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-container",
    style: {
      maxWidth: '650px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 700,
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check",
    style: {
      color: 'var(--primary-color)'
    }
  }), editingTodo ? 'Modifier la Tâche' : 'Créer une Nouvelle Tâche To-Do'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "modal-close-btn",
    onClick: () => setIsModalOpen(false)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark"
  }))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-body",
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '13px',
      marginBottom: '6px',
      display: 'block'
    }
  }, "Titre de la T\xE2che ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#ef4444'
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "ex: Exp\xE9dier commande #4920 Mondial Relay",
    value: titre,
    onChange: e => setTitre(e.target.value),
    required: true,
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Priorit\xE9"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: priorite,
    onChange: e => setPriorite(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "urgente"
  }, "\uD83D\uDEA8 Urgente (Alerte Sonore)"), /*#__PURE__*/React.createElement("option", {
    value: "haute"
  }, "Haute"), /*#__PURE__*/React.createElement("option", {
    value: "moyenne"
  }, "Moyenne"), /*#__PURE__*/React.createElement("option", {
    value: "basse"
  }, "Basse"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Statut"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: statut,
    onChange: e => setStatut(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "a_faire"
  }, "\xC0 faire"), /*#__PURE__*/React.createElement("option", {
    value: "en_cours"
  }, "En cours"), /*#__PURE__*/React.createElement("option", {
    value: "terminee"
  }, "Termin\xE9e"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Cat\xE9gorie"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: categorie,
    onChange: e => setCategorie(e.target.value)
  }, predefinedCategories.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Compte Vinted Associ\xE9"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: compteId,
    onChange: e => setCompteId(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Aucun compte associ\xE9"), comptes.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, "@", c.nomCompte || c.nom || c.pseudo)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Agent Assign\xE9"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: agentAssigne,
    onChange: e => setAgentAssigne(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Non assign\xE9"), utilisateurs.map(u => /*#__PURE__*/React.createElement("option", {
    key: u.id,
    value: u.agentAssigne || u.nom
  }, u.nom, " (", u.agentAssigne || u.role, ")"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr 1.2fr',
      gap: '12px',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Date d'\xE9ch\xE9ance"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-control",
    value: dateEcheance,
    onChange: e => setDateEcheance(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Heure"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    className: "form-control",
    value: heureEcheance,
    onChange: e => setHeureEcheance(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Alerte & Rappel"), /*#__PURE__*/React.createElement("select", {
    className: "form-control",
    value: rappelMinutes,
    onChange: e => setRappelMinutes(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "\xC0 l'heure exacte"), /*#__PURE__*/React.createElement("option", {
    value: "15"
  }, "15 minutes avant"), /*#__PURE__*/React.createElement("option", {
    value: "30"
  }, "30 minutes avant"), /*#__PURE__*/React.createElement("option", {
    value: "60"
  }, "1 heure avant"), /*#__PURE__*/React.createElement("option", {
    value: "120"
  }, "2 heures avant"), /*#__PURE__*/React.createElement("option", {
    value: "1440"
  }, "1 jour avant")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '12.5px',
      color: '#1e293b'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: alerteSonore,
    onChange: e => setAlerteSonore(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD14 Activer la sonnerie d'alerte lors du rappel ou en cas de retard"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 600,
      fontSize: '12px',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Description & Notes"), /*#__PURE__*/React.createElement("textarea", {
    className: "form-control",
    rows: "2",
    placeholder: "Informations suppl\xE9mentaires, consignes...",
    value: description,
    onChange: e => setDescription(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontWeight: 700,
      fontSize: '12px',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-list-check",
    style: {
      color: 'var(--primary-color)'
    }
  }), "Checklist / Sous-t\xE2ches"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginBottom: '8px'
    }
  }, sousTaches.map((st, idx) => /*#__PURE__*/React.createElement("div", {
    key: st.id || idx,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 8px',
      background: '#fff',
      borderRadius: '4px',
      border: '1px solid #cbd5e1'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#334155'
    }
  }, idx + 1, ". ", st.texte), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleRemoveSubtaskInModal(idx),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#ef4444',
      fontSize: '12px'
    },
    title: "Supprimer la sous-t\xE2che"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    placeholder: "+ Ajouter une \xE9tape (ex: Imprimer bordereau)...",
    value: newSubtaskText,
    onChange: e => setNewSubtaskText(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSubtaskInModal();
      }
    },
    style: {
      fontSize: '12px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: handleAddSubtaskInModal,
    style: {
      whiteSpace: 'nowrap'
    }
  }, "+ Ajouter")))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer",
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '16px 20px',
      borderTop: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: () => setIsModalOpen(false)
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-floppy-disk",
    style: {
      marginRight: '6px'
    }
  }), editingTodo ? 'Mettre à jour' : 'Enregistrer la tâche'))))));
}

// Export global React components
window.ReactComponents = {
  PermissionManager,
  Toast,
  Sidebar,
  DashboardView,
  ComptesView,
  PlanningView,
  IncidentsView,
  MessagerieView,
  ParametresView,
  UtilisateursView,
  OrganisationsView,
  ClassementView,
  GagnantsView,
  JournalView,
  CorbeilleView,
  LoginView,
  SoundEngine,
  SystemNotifications,
  TodoUtils,
  NotificationBellCenter,
  TodoView
};
;
// ============================================================
// MAIN REACT APP CONTROLLER - VINTED MANAGER
// ============================================================

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vinted_manager_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentOrgId, setCurrentOrgId] = useState('org_default');
  const [activeView, setActiveView] = useState('comptes');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('vinted_timezone') || 'FR');
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    isError: false
  });
  const [loginError, setLoginError] = useState('');
  const [isSyncingDotB, setIsSyncingDotB] = useState(false);
  const handleSwitchTZ = tz => {
    setTimeZone(tz);
    localStorage.setItem('vinted_timezone', tz);
  };
  const handleFetchLiveDotB = async () => {
    setIsSyncingDotB(true);
    showToast("⚡ Synchronisation et actualisation en cours avec DotB Cloud...");
    try {
      const res = await fetch('/api/dotb/fetch-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organisationId: currentOrgId,
          period: 'all'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Données actualisées en direct depuis DotB Cloud ! (${data.totalAccounts || 0} comptes, ${data.totalOrders || 0} commandes)`);
        await loadData();
      } else {
        showToast(`❌ Erreur: ${data.error || 'Échec de l\'actualisation DotB'}`, true);
      }
    } catch (err) {
      console.error("Erreur Sync DotB:", err);
      showToast("❌ Erreur réseau lors de l'actualisation DotB", true);
    } finally {
      setIsSyncingDotB(false);
    }
  };
  const [appState, setAppState] = useState({
    organisations: [],
    parametres: {},
    utilisateurs: [],
    comptes: [],
    todos: [],
    incidents: [],
    journal: [],
    corbeille: []
  });
  const showToast = useCallback((message, isError = false) => {
    setToast({
      visible: true,
      message,
      isError
    });
    setTimeout(() => {
      setToast({
        visible: false,
        message: '',
        isError: false
      });
    }, 3500);
  }, []);
  const loadData = useCallback(async orgId => {
    if (!currentUser) return;
    const targetOrgId = currentUser.role !== 'admin' && currentUser.organisationId ? currentUser.organisationId : orgId || currentOrgId;
    try {
      const data = await API.getFullDB(targetOrgId);
      setAppState(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      console.error("[React App loadData Error]", err);
      showToast("Erreur API : " + (err.message || "Impossible de contacter le serveur"), true);
    }
  }, [currentUser, currentOrgId, showToast]);
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== 'admin' && currentUser.organisationId && currentOrgId !== currentUser.organisationId) {
        setCurrentOrgId(currentUser.organisationId);
      }
      const targetOrgId = currentUser.role !== 'admin' && currentUser.organisationId ? currentUser.organisationId : currentOrgId;
      loadData(targetOrgId);
    }
  }, [currentUser, currentOrgId, loadData]);

  // Cache des alertes sonores et push déjà émises pour éviter le spam
  const alertedTasksRef = React.useRef(new Set());
  useEffect(() => {
    if (!currentUser) return;
    const checkDeadlinesAndNotify = () => {
      const currentTodos = appState.todos || [];
      currentTodos.forEach(todo => {
        if (todo.statut === 'terminee') return;
        const info = TodoUtils.getStatusInfo(todo);
        const isOverdue = info.isOverdue;
        const isImminent = info.isImminent;
        if (isOverdue || isImminent) {
          const alertKey = `${todo.id}_${isOverdue ? 'overdue' : 'imminent'}`;
          if (!alertedTasksRef.current.has(alertKey)) {
            alertedTasksRef.current.add(alertKey);
            if (todo.alerteSonore !== false) {
              if (todo.priorite === 'urgente' || isOverdue) {
                SoundEngine.playUrgentAlert();
              } else {
                SoundEngine.playWarningAlert();
              }
            }
            const pushTitle = isOverdue ? '🚨 Vinted Manager: Tâche en retard !' : `⏰ Vinted Manager: Échéance imminente (${info.label})`;
            SystemNotifications.notify(pushTitle, `${todo.titre}${todo.compteNom ? ` (@${todo.compteNom})` : ''}`, {
              tag: `todo-${todo.id}`,
              urgent: todo.priorite === 'urgente' || isOverdue,
              onClick: () => {
                setActiveView('todos');
              }
            });
          }
        }
      });
    };
    checkDeadlinesAndNotify();
    const timer = setInterval(checkDeadlinesAndNotify, 25000);
    return () => clearInterval(timer);
  }, [currentUser, appState.todos]);
  const todoUrgentCount = useMemo(() => {
    return (appState.todos || []).filter(t => {
      if (t.statut === 'terminee') return false;
      const info = TodoUtils.getStatusInfo(t);
      return info.isOverdue || t.priorite === 'urgente' || info.isImminent;
    }).length;
  }, [appState.todos]);
  const handleLoginSubmit = async (loginInput, password, role = null) => {
    setLoginError('');
    try {
      const payload = role ? {
        role
      } : {
        email: loginInput,
        motDePasse: password
      };
      const user = await API.login(payload);
      localStorage.setItem('vinted_manager_user', JSON.stringify(user));
      setCurrentUser(user);
      if (user.role !== 'admin' && user.organisationId) {
        setCurrentOrgId(user.organisationId);
      }
      showToast(`Bienvenue, ${user.nom} !`);
    } catch (err) {
      const errorMsg = "Identifiant ou mot de passe incorrect. Veuillez réessayer.";
      setLoginError(errorMsg);
      showToast(errorMsg, true);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('vinted_manager_user');
    setCurrentUser(null);
    showToast("Déconnexion réussie");
  };
  const handleSwitchOrg = orgId => {
    if (currentUser && currentUser.role !== 'admin') {
      showToast("Accès restreint à votre organisation uniquement.", true);
      return;
    }
    setCurrentOrgId(orgId);
    showToast("Chargement de l'organisation...");
  };
  const handleSaveCompte = async compteData => {
    try {
      if (compteData.id) {
        await API.updateCompte(compteData.id, compteData);
        showToast("Compte mis à jour");
      } else {
        await API.createCompte({
          ...compteData,
          organisationId: currentOrgId
        });
        showToast("Compte créé avec succès");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement du compte", true);
    }
  };
  const handleDeleteCompte = async id => {
    if (!confirm("Voulez-vous supprimer ce compte Vinted ?")) return;
    try {
      await API.deleteCompte(id);
      showToast("Compte supprimé");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression du compte", true);
    }
  };
  const handleSaveIncident = async incidentData => {
    try {
      if (incidentData.id) {
        await API.updateIncident(incidentData.id, incidentData);
        showToast("Incident mis à jour avec succès");
      } else {
        await API.createIncident({
          ...incidentData,
          organisationId: currentOrgId
        });
        showToast("Incident enregistré et statut du compte mis à jour");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de l'incident", true);
    }
  };
  const handleSaveParametres = async paramsData => {
    try {
      const res = await API.updateParametres(paramsData, currentOrgId);
      showToast(res.message || "Paramètres sauvegardés");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la sauvegarde des paramètres", true);
    }
  };
  const handleBulkUpdateComptes = async (ids, fields) => {
    try {
      await API.bulkUpdateComptes(ids, fields);
      showToast(`${ids.length} compte(s) mis à jour en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la mise à jour des comptes en masse", true);
    }
  };
  const handleBulkDeleteComptes = async ids => {
    try {
      await API.bulkDeleteComptes(ids);
      showToast(`${ids.length} compte(s) supprimé(s) en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression des comptes en masse", true);
    }
  };
  const handleBulkDeleteUsers = async ids => {
    try {
      await API.bulkDeleteUsers(ids);
      showToast(`${ids.length} utilisateur(s) supprimé(s) en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression des utilisateurs en masse", true);
    }
  };
  const handleBulkDeleteIncidents = async ids => {
    try {
      await API.bulkDeleteIncidents(ids);
      showToast(`${ids.length} incident(s) supprimé(s) en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression des incidents en masse", true);
    }
  };
  const handleSaveTodo = async todoData => {
    try {
      if (todoData.id) {
        await API.updateTodo(todoData.id, todoData);
        showToast("Tâche mise à jour avec succès");
      } else {
        await API.createTodo({
          ...todoData,
          organisationId: currentOrgId
        });
        showToast("Tâche créée avec succès");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de la tâche", true);
    }
  };
  const handleDeleteTodo = async id => {
    try {
      await API.deleteTodo(id);
      showToast("Tâche supprimée");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression de la tâche", true);
    }
  };
  const handleBulkUpdateTodos = async (ids, fields) => {
    try {
      await API.bulkUpdateTodos(ids, fields);
      showToast(`${ids.length} tâche(s) mise(s) à jour en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la mise à jour des tâches en masse", true);
    }
  };
  const handleBulkDeleteTodos = async ids => {
    try {
      await API.bulkDeleteTodos(ids);
      showToast(`${ids.length} tâche(s) supprimée(s) en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression des tâches en masse", true);
    }
  };
  const handleSaveUser = async userData => {
    try {
      const finalData = {
        ...userData
      };
      // Restriction Cadre : Cadres can ONLY create agent profiles for their own organisation
      if (currentUser && currentUser.role !== 'admin' && !finalData.role) {
        finalData.role = 'agent';
        finalData.organisationId = currentUser.organisationId || 'org_default';
      }
      if (finalData.id) {
        const updated = await API.updateUtilisateur(finalData.id, finalData);
        showToast("Profil utilisateur et permissions mis à jour");
        if (currentUser && currentUser.id === finalData.id) {
          const mergedUser = {
            ...currentUser,
            ...updated,
            permissions: finalData.permissions || updated.permissions
          };
          setCurrentUser(mergedUser);
          localStorage.setItem('vinted_manager_user', JSON.stringify(mergedUser));
        }
      } else {
        await API.createUtilisateur({
          ...finalData,
          organisationId: finalData.organisationId || currentOrgId
        });
        showToast("Profil agent créé avec succès avec permissions personnalisées");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement utilisateur", true);
    }
  };

  // Vérification de permission d'accès à la vue active
  useEffect(() => {
    if (!currentUser) return;
    const availableViews = ['comptes', 'todos', 'classement', 'gagnants', 'incidents', 'messagerie', 'organisations', 'utilisateurs', 'corbeille', 'parametres', 'journal'];
    if (!PermissionManager.can(currentUser, activeView)) {
      const firstAllowed = availableViews.find(v => PermissionManager.can(currentUser, v));
      if (firstAllowed && firstAllowed !== activeView) {
        setActiveView(firstAllowed);
      }
    }
  }, [currentUser, activeView]);
  const handleDeleteUser = async id => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await API.deleteUtilisateur(id);
      showToast("Utilisateur supprimé");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression utilisateur", true);
    }
  };
  const handleSaveOrg = async orgData => {
    try {
      if (orgData.isEdit) {
        await API.updateOrganisation(orgData.id, {
          nom: orgData.nom
        });
        showToast("Organisation mise à jour");
      } else {
        await API.createOrganisation(orgData);
        showToast("Organisation créée avec succès");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de l'organisation", true);
    }
  };
  const handleDeleteOrg = async id => {
    if (!confirm("Voulez-vous supprimer cette organisation ?")) return;
    try {
      await API.deleteOrganisation(id);
      showToast("Organisation supprimée");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression de l'organisation", true);
    }
  };
  const handlePublishWinner = async sku => {
    try {
      const res = await API.publishWinner(sku, currentOrgId);
      showToast(res.message || `SKU ${sku} republié`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la publication de la suggestion", true);
    }
  };
  const handleExportJSON = async () => {
    try {
      const data = await API.getFullDB(currentOrgId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `vinted_manager_export_${currentOrgId}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Export de la base de données réussi");
    } catch (err) {
      showToast("Erreur lors de l'export JSON", true);
    }
  };
  const handleImportJSON = e => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async event => {
        try {
          const parsed = JSON.parse(event.target.result);
          await API.importDB(parsed);
          showToast("Restauration complète effectuée avec succès !");
          await loadData();
        } catch (err) {
          showToast("Échec de l'import : Fichier JSON invalide", true);
        }
      };
    }
  };
  const handleRestoreCorbeilleItem = async id => {
    try {
      await API.restoreCorbeilleItem(id);
      showToast("Élément restauré avec succès dans sa table d'origine !");
      await loadData();
    } catch (err) {
      showToast("Erreur de restauration : " + (err.message || "Impossible de restaurer l'élément"), true);
    }
  };
  const handleDeleteCorbeilleItem = async id => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement cet élément de la corbeille ?")) return;
    try {
      await API.deleteCorbeilleItem(id);
      showToast("Élément purgé définitivement de la corbeille");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la purge de l'élément", true);
    }
  };
  const handleEmptyCorbeille = async () => {
    if (!confirm("Êtes-vous sûr de vouloir VIDER COMPLÈTEMENT la corbeille ? Cette action est irréversible !")) return;
    try {
      await API.emptyCorbeille(currentOrgId);
      showToast("Corbeille vidée avec succès");
      await loadData();
    } catch (err) {
      showToast("Erreur lors du vidage de la corbeille", true);
    }
  };
  if (!currentUser) {
    return /*#__PURE__*/React.createElement("div", {
      className: "app-container"
    }, /*#__PURE__*/React.createElement(LoginView, {
      onLoginSubmit: handleLoginSubmit,
      loginError: loginError
    }), /*#__PURE__*/React.createElement(Toast, {
      toast: toast
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app-container"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mobile-menu-btn btn btn-primary",
    onClick: () => setMobileMenuOpen(!mobileMenuOpen),
    title: "Menu principal"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`
  }), " Menu"), mobileMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "sidebar-overlay",
    onClick: () => setMobileMenuOpen(false),
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(3px)',
      zIndex: 99
    }
  }), /*#__PURE__*/React.createElement(Sidebar, {
    currentUser: currentUser,
    currentOrgId: currentOrgId,
    organisations: appState.organisations,
    activeView: activeView,
    onSelectView: view => {
      setActiveView(view);
      setMobileMenuOpen(false);
    },
    onSwitchOrg: handleSwitchOrg,
    onLogout: handleLogout,
    onExportJSON: handleExportJSON,
    onImportJSON: handleImportJSON,
    corbeilleCount: (appState.corbeille || []).length,
    todoUrgentCount: todoUrgentCount,
    isOpen: mobileMenuOpen
  }), /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top-header-actions",
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement(NotificationBellCenter, {
    todos: appState.todos || [],
    onNavigateTodo: todoId => {
      setActiveView('todos');
    },
    onSaveTodo: handleSaveTodo,
    showToast: showToast
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '20px',
      padding: '3px 4px',
      gap: '2px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleSwitchTZ('FR'),
    style: {
      border: 'none',
      borderRadius: '16px',
      padding: '4px 10px',
      fontSize: '11.5px',
      fontWeight: timeZone === 'FR' ? 700 : 500,
      backgroundColor: timeZone === 'FR' ? 'var(--primary-color)' : 'transparent',
      color: timeZone === 'FR' ? '#fff' : '#64748b',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    title: "Fuseau Horaire France (Europe/Paris - UTC+2 / UTC+1)"
  }, "\uD83C\uDDEB\uD83C\uDDF7 FR (UTC+2)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleSwitchTZ('MADA'),
    style: {
      border: 'none',
      borderRadius: '16px',
      padding: '4px 10px',
      fontSize: '11.5px',
      fontWeight: timeZone === 'MADA' ? 700 : 500,
      backgroundColor: timeZone === 'MADA' ? 'var(--primary-color)' : 'transparent',
      color: timeZone === 'MADA' ? '#fff' : '#64748b',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    title: "Fuseau Horaire Madagascar (Indian/Antananarivo - UTC+3)"
  }, "\uD83C\uDDF2\uD83C\uDDEC MADA (UTC+3)")), currentUser && /*#__PURE__*/React.createElement(React.Fragment, null, PermissionManager.can(currentUser, 'sync_dotb') && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: handleFetchLiveDotB,
    disabled: isSyncingDotB,
    style: {
      backgroundColor: '#2563eb',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
    },
    title: "Actualiser en direct tous les comptes, articles en ligne et commandes depuis DotB Cloud"
  }, isSyncingDotB ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-spinner fa-spin"
  }), " Sync DotB...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-arrows-rotate"
  }), " Actualiser DotB")), PermissionManager.can(currentUser, 'export_data') && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: handleExportJSON,
    title: "Exporter la base de donn\xE9es en JSON"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-download"
  }), " Exporter JSON"), PermissionManager.can(currentUser, 'import_data') && /*#__PURE__*/React.createElement("label", {
    className: "btn btn-secondary btn-sm",
    style: {
      cursor: 'pointer',
      margin: 0
    },
    title: "Importer la base de donn\xE9es depuis un fichier JSON"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-file-import"
  }), " Importer JSON", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: handleImportJSON,
    style: {
      display: 'none'
    }
  })))), !PermissionManager.can(currentUser, activeView) && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      textAlign: 'center',
      padding: '60px 20px',
      margin: '40px auto',
      maxWidth: '500px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-lock",
    style: {
      fontSize: '48px',
      color: '#94a3b8',
      marginBottom: '16px',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px 0',
      fontSize: '18px',
      color: '#0f172a'
    }
  }, "Acc\xE8s Non Autoris\xE9"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '13px',
      color: '#64748b'
    }
  }, "Vous ne disposez pas des droits d'acc\xE8s n\xE9cessaires pour consulter ce module. Contactez votre superviseur ou administrateur pour personnaliser vos permissions.")), activeView === 'todos' && PermissionManager.can(currentUser, 'todos') && /*#__PURE__*/React.createElement(TodoView, {
    currentUser: currentUser,
    appState: appState,
    onSaveTodo: handleSaveTodo,
    onDeleteTodo: handleDeleteTodo,
    onBulkUpdateTodos: handleBulkUpdateTodos,
    onBulkDeleteTodos: handleBulkDeleteTodos,
    showToast: showToast
  }), activeView === 'comptes' && PermissionManager.can(currentUser, 'comptes') && /*#__PURE__*/React.createElement(ComptesView, {
    currentUser: currentUser,
    appState: appState,
    onSaveCompte: handleSaveCompte,
    onDeleteCompte: handleDeleteCompte,
    onBulkUpdateComptes: handleBulkUpdateComptes,
    onBulkDeleteComptes: handleBulkDeleteComptes,
    onOpenQuickAgentModal: () => setActiveView('utilisateurs')
  }), activeView === 'incidents' && PermissionManager.can(currentUser, 'incidents') && /*#__PURE__*/React.createElement(IncidentsView, {
    appState: appState,
    onSaveIncident: handleSaveIncident,
    onBulkDeleteIncidents: handleBulkDeleteIncidents
  }), activeView === 'messagerie' && PermissionManager.can(currentUser, 'messagerie') && /*#__PURE__*/React.createElement(MessagerieView, {
    appState: appState
  }), activeView === 'parametres' && PermissionManager.can(currentUser, 'parametres') && /*#__PURE__*/React.createElement(ParametresView, {
    appState: appState,
    onSaveParametres: handleSaveParametres
  }), activeView === 'utilisateurs' && PermissionManager.can(currentUser, 'utilisateurs') && /*#__PURE__*/React.createElement(UtilisateursView, {
    currentUser: currentUser,
    appState: appState,
    onSaveUser: handleSaveUser,
    onDeleteUser: handleDeleteUser,
    onBulkDeleteUsers: handleBulkDeleteUsers
  }), activeView === 'organisations' && PermissionManager.can(currentUser, 'organisations') && /*#__PURE__*/React.createElement(OrganisationsView, {
    appState: appState,
    onSaveOrg: handleSaveOrg,
    onDeleteOrg: handleDeleteOrg
  }), activeView === 'classement' && PermissionManager.can(currentUser, 'classement') && /*#__PURE__*/React.createElement(ClassementView, {
    appState: appState
  }), activeView === 'gagnants' && PermissionManager.can(currentUser, 'gagnants') && /*#__PURE__*/React.createElement(GagnantsView, {
    appState: appState,
    onPublishWinner: handlePublishWinner
  }), activeView === 'journal' && PermissionManager.can(currentUser, 'journal') && /*#__PURE__*/React.createElement(JournalView, {
    appState: appState
  }), activeView === 'corbeille' && PermissionManager.can(currentUser, 'corbeille') && /*#__PURE__*/React.createElement(CorbeilleView, {
    corbeille: appState.corbeille || [],
    onRestoreItem: handleRestoreCorbeilleItem,
    onDeleteItem: handleDeleteCorbeilleItem,
    onEmptyCorbeille: handleEmptyCorbeille,
    onRefresh: () => loadData()
  })), /*#__PURE__*/React.createElement(Toast, {
    toast: toast
  }));
}

// Render React App into #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
})();