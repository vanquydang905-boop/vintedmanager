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
  isOpen = false
}) {
  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';
  const isCadre = currentUser.role === 'cadre' || isAdmin;
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
  }, "Utilisateur Connecté"), /*#__PURE__*/React.createElement("div", {
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
  }, currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'cadre' ? 'Admin' : 'Agent'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: onLogout,
    title: "Se déconnecter",
    style: {
      padding: '3px 8px',
      fontSize: '11px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-right-from-bracket"
  }), " Déconnexion"))), isAdmin && /*#__PURE__*/React.createElement("div", {
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
  }, "🏢 Organisation Active"), /*#__PURE__*/React.createElement("select", {
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
  }, /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'dashboard' ? 'active' : ''}`,
    onClick: () => onSelectView('dashboard')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-days"
  }), " Calendrier"), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'comptes' ? 'active' : ''}`,
    onClick: () => onSelectView('comptes')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-store"
  }), " Comptes"), isCadre && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'planning' ? 'active' : ''}`,
    onClick: () => onSelectView('planning')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-wand-magic-sparkles"
  }), " Génération"), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'classement' ? 'active' : ''}`,
    onClick: () => onSelectView('classement')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trophy"
  }), " Classement"), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'gagnants' ? 'active' : ''}`,
    onClick: () => onSelectView('gagnants')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-lightbulb"
  }), " Suggestions"), /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'incidents' ? 'active' : ''}`,
    onClick: () => onSelectView('incidents')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-triangle-exclamation"
  }), " Incidents"), isAdmin && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'organisations' ? 'active' : ''}`,
    onClick: () => onSelectView('organisations')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-sitemap"
  }), " Organisations"), isCadre && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'utilisateurs' ? 'active' : ''}`,
    onClick: () => onSelectView('utilisateurs')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-users-gear"
  }), " Utilisateurs"), isCadre && /*#__PURE__*/React.createElement("button", {
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
  }, corbeilleCount)), isCadre && /*#__PURE__*/React.createElement("button", {
    className: `nav-btn ${activeView === 'parametres' ? 'active' : ''}`,
    onClick: () => onSelectView('parametres')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-sliders"
  }), " Paramètres"), isCadre && /*#__PURE__*/React.createElement("button", {
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

// ------------------- VIEW: DASHBOARD / CALENDRIER -------------------
function DashboardView({
  appState,
  currentUser,
  onUpdateRow,
  onDeleteRow,
  onAddRowClick,
  onBulkUpdateCalendrier,
  onBulkDeleteCalendrier,
  selectedTZ = 'FR'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterHeure, setFilterHeure] = useState('');
  const [filterComptes, setFilterComptes] = useState([]); // multi-select
  const [showCompteDropdown, setShowCompteDropdown] = useState(false);
  const [filterAgent, setFilterAgent] = useState(currentUser && currentUser.role === 'agent' ? currentUser.agentAssigne || '' : '');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterClassif, setFilterClassif] = useState('');
  const [filterOnlyDuplicates, setFilterOnlyDuplicates] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedSkuId, setCopiedSkuId] = useState(null);
  const isAgent = currentUser && currentUser.role === 'agent';
  const myAgentName = useMemo(() => isAgent ? (currentUser.agentAssigne || currentUser.nom || '').trim() : '', [currentUser, isAgent]);
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterHeure('');
    setFilterComptes([]);
    if (!isAgent) setFilterAgent('');
    setFilterStatut('');
    setFilterClassif('');
    setFilterOnlyDuplicates(false);
  };
  const isAnyFilterActive = useMemo(() => {
    return Boolean(searchTerm || filterDate || filterHeure || filterComptes.length > 0 || !isAgent && filterAgent || filterStatut || filterClassif || filterOnlyDuplicates);
  }, [searchTerm, filterDate, filterHeure, filterComptes, filterAgent, filterStatut, filterClassif, filterOnlyDuplicates, isAgent]);

  // Fermer dropdown Compte si clic en dehors
  React.useEffect(() => {
    const close = e => {
      if (!e.target.closest('#compte-multiselect-wrapper')) setShowCompteDropdown(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const comptesAll = appState.comptes || [];
  const calendrierAll = appState.calendrier || [];
  const agentsUnique = useMemo(() => {
    const set = new Set();
    (appState.utilisateurs || []).forEach(u => {
      if (u.nom) set.add(u.nom.trim());
      if (u.agentAssigne) set.add(u.agentAssigne.trim());
    });
    (appState.comptes || []).forEach(c => {
      if (c.agent) set.add(c.agent.trim());
    });
    (appState.calendrier || []).forEach(l => {
      if (l.agent) set.add(l.agent.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [appState]);

  // Pour un agent, restreindre la liste des comptes uniquement à ses comptes délégués
  const comptes = useMemo(() => {
    if (isAgent && myAgentName) {
      return comptesAll.filter(c => c.agent && c.agent.trim().toLowerCase() === myAgentName.toLowerCase());
    }
    return comptesAll;
  }, [comptesAll, isAgent, myAgentName]);
  const myAccountIdentifiers = useMemo(() => {
    const set = new Set();
    (comptes || []).forEach(c => {
      if (c.id) set.add(String(c.id).toLowerCase());
      if (c.numeroCompte) {
        set.add(String(c.numeroCompte).toLowerCase());
        set.add(`compte_${c.numeroCompte}`.toLowerCase());
      }
      if (c.pseudo) set.add(String(c.pseudo).toLowerCase());
    });
    return set;
  }, [comptes]);

  // Lignes de base : Pour un Agent, afficher ses lignes attribuées OU les lignes de ses comptes attribués
  const baseLines = useMemo(() => {
    if (isAgent && myAgentName) {
      return calendrierAll.filter(l => {
        const lineAgent = (l.agent || '').trim().toLowerCase();
        if (lineAgent && lineAgent === myAgentName.toLowerCase()) return true;
        const lineCompteId = (l.compteId || '').toString().toLowerCase();
        if (lineCompteId && myAccountIdentifiers.has(lineCompteId)) return true;
        return false;
      });
    }
    return calendrierAll;
  }, [calendrierAll, isAgent, myAgentName, myAccountIdentifiers]);
  const [sortField, setSortField] = useState('dateTime');
  const [sortAsc, setSortAsc] = useState(true);
  const handleSort = field => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Détection des doublons SKU sur l'ensemble du calendrier
  const skuCounts = useMemo(() => {
    const counts = {};
    (calendrierAll || []).forEach(l => {
      const s = (l.sku || '').trim().toLowerCase();
      if (s) {
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  }, [calendrierAll]);
  const duplicateSkuCount = useMemo(() => {
    const dupes = new Set();
    Object.entries(skuCounts).forEach(([sku, count]) => {
      if (count > 1) dupes.add(sku);
    });
    return dupes.size;
  }, [skuCounts]);
  const filteredLines = useMemo(() => {
    return baseLines.filter(l => {
      if (filterOnlyDuplicates) {
        const s = (l.sku || '').trim().toLowerCase();
        if (!s || (skuCounts[s] || 0) <= 1) return false;
      }
      if (filterDate && l.date !== filterDate) return false;
      if (filterHeure && l.heurePrevue !== filterHeure) return false;
      if (filterComptes.length > 0) {
        const lineCompteId = (l.compteId || '').toString().toLowerCase();
        const matched = filterComptes.some(fc => {
          const fcStr = (fc || '').toString().toLowerCase();
          return lineCompteId === fcStr || lineCompteId.includes(fcStr) || fcStr.includes(lineCompteId);
        });
        if (!matched) return false;
      }
      if (!isAgent && filterAgent && (l.agent || '').trim().toLowerCase() !== filterAgent.trim().toLowerCase()) return false;
      if (filterStatut && l.statut !== filterStatut) return false;
      if (filterClassif && l.classification !== filterClassif) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const cObj = comptesAll.find(c => c.id === l.compteId || String(c.id).toLowerCase() === String(l.compteId).toLowerCase() || String(c.numeroCompte) === String(l.compteId) || `compte_${c.numeroCompte}` === String(l.compteId));
        const pseudoStr = cObj ? (cObj.pseudo || '').toLowerCase() : '';
        const numProxyStr = cObj && cObj.numeroCompte ? String(cObj.numeroCompte).toLowerCase() : '';
        const emailStr = cObj && cObj.email ? (cObj.email || '').toLowerCase() : '';
        const telStr = cObj && cObj.telephone ? String(cObj.telephone).toLowerCase() : '';
        const skuStr = (l.sku || '').toLowerCase();
        const agentStr = (l.agent || '').toLowerCase();
        const statutStr = (l.statut || '').toLowerCase();
        const classifStr = (l.classification || '').toLowerCase();
        const dateStr = (l.date || '').toLowerCase();
        const heureStr = (l.heurePrevue || '').toLowerCase();
        const jourStr = (l.jour || '').toLowerCase();
        let dateFrStr = '';
        if (l.date && l.date.includes('-')) {
          const parts = l.date.split('-');
          if (parts.length === 3) {
            dateFrStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        const matches = skuStr.includes(q) || pseudoStr.includes(q) || numProxyStr.includes(q) || emailStr.includes(q) || telStr.includes(q) || agentStr.includes(q) || statutStr.includes(q) || classifStr.includes(q) || dateStr.includes(q) || dateFrStr.includes(q) || heureStr.includes(q) || jourStr.includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      const parseDateAndMinutes = (dateStr, timeStr) => {
        const d = dateStr || '1970-01-01';
        let [h, m] = (timeStr || '00:00').split(':').map(n => parseInt(n) || 0);
        const hPad = String(h).padStart(2, '0');
        const mPad = String(m).padStart(2, '0');
        return `${d} ${hPad}:${mPad}`;
      };
      let res = 0;
      if (sortField === 'dateTime') {
        const keyA = parseDateAndMinutes(a.date, a.heurePrevue);
        const keyB = parseDateAndMinutes(b.date, b.heurePrevue);
        res = keyA.localeCompare(keyB);
      } else if (sortField === 'date') {
        res = (a.date || '').localeCompare(b.date || '');
      } else if (sortField === 'heure') {
        res = (a.heurePrevue || '').localeCompare(b.heurePrevue || '');
      } else if (sortField === 'score') {
        res = (a.score || 0) - (b.score || 0);
      } else if (sortField === 'sku') {
        res = (a.sku || '').localeCompare(b.sku || '');
      } else {
        const keyA = parseDateAndMinutes(a.date, a.heurePrevue);
        const keyB = parseDateAndMinutes(b.date, b.heurePrevue);
        res = keyA.localeCompare(keyB);
      }
      return sortAsc ? res : -res;
    });
  }, [baseLines, searchTerm, filterDate, filterHeure, filterComptes, filterAgent, filterStatut, filterClassif, filterOnlyDuplicates, skuCounts, comptesAll, sortField, sortAsc]);
  const isAllSelected = useMemo(() => {
    return filteredLines.length > 0 && filteredLines.every(l => selectedIds.includes(l.id));
  }, [filteredLines, selectedIds]);
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLines.map(l => l.id));
    }
  };
  const toggleSelectRow = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const handleBulkStatut = async newStatut => {
    if (selectedIds.length === 0 || !onBulkUpdateCalendrier) return;
    await onBulkUpdateCalendrier(selectedIds, {
      statut: newStatut
    });
    setSelectedIds([]);
  };
  const handleBulkAgent = async newAgent => {
    if (selectedIds.length === 0 || !newAgent || !onBulkUpdateCalendrier) return;
    await onBulkUpdateCalendrier(selectedIds, {
      agent: newAgent
    });
    setSelectedIds([]);
  };
  const handleBulkHeure = async newHeure => {
    if (selectedIds.length === 0 || !newHeure || !onBulkUpdateCalendrier) return;
    await onBulkUpdateCalendrier(selectedIds, {
      heurePrevue: newHeure
    });
    setSelectedIds([]);
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !onBulkDeleteCalendrier) return;
    if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedIds.length} lignes sélectionnées ?`)) {
      await onBulkDeleteCalendrier(selectedIds);
      setSelectedIds([]);
    }
  };

  // KPI Métriques calculées uniquement sur les données pertinentes de l'Agent (baseLines)
  const totalVentes = useMemo(() => baseLines.reduce((sum, l) => sum + (l.vente || 0), 0), [baseLines]);
  const pubsFaite = useMemo(() => baseLines.filter(l => l.statut === 'Fait').length, [baseLines]);
  const totalPubs = baseLines.length;
  const avgScore = useMemo(() => totalPubs > 0 ? (baseLines.reduce((sum, l) => sum + (l.score || 0), 0) / totalPubs).toFixed(1) : "0.0", [baseLines, totalPubs]);
  const winnersCount = useMemo(() => new Set(baseLines.filter(l => l.classification === 'Gagnant' && l.sku).map(l => l.sku)).size, [baseLines]);

  // Nombre de ventes par SKU sur toute l'organisation
  const skuVentesMap = useMemo(() => {
    const map = {};
    calendrierAll.forEach(l => {
      if (l.sku && l.vente === 1) {
        map[l.sku] = (map[l.sku] || 0) + 1;
      }
    });
    return map;
  }, [calendrierAll]);
  const handleCleanEmptySKUs = async () => {
    if (!confirm("Voulez-vous vraiment supprimer toutes les lignes de planning sans SKU ?")) return;
    try {
      const orgId = currentUser && currentUser.organisationId || 'org_default';
      const res = await fetch('/api/calendrier/clean-empty-skus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organisationId: orgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message);
        if (window.loadAppState) await window.loadAppState();
      } else {
        if (window.showToast) window.showToast(`❌ ${data.error}`, true);
      }
    } catch (err) {
      console.error("Erreur nettoyage SKU:", err);
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "page-title"
  }, "Tableau de Bord & Calendrier"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '14px',
      marginTop: '4px'
    }
  }, "Suivi temps réel des publications, scores et réinterventions")), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: async () => {
      if (window.loadAppState) await window.loadAppState();
      if (window.showToast) window.showToast("Données rafraîchies !");
    },
    title: "Rafraîchir les données"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rotate-right"
  }), " Rafraîchir"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleCleanEmptySKUs,
    style: {
      color: 'var(--danger)',
      borderColor: '#fca5a5'
    },
    title: "Supprimer toutes les lignes sans SKU"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-broom"
  }), " Nettoyer (sans SKU)"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onAddRowClick
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-plus"
  }), " Ajouter une ligne"))), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-icon teal"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "metric-info"
  }, /*#__PURE__*/React.createElement("h4", null, "PUBLICATIONS FAITES"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, pubsFaite, " / ", totalPubs))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-icon green"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-bag-shopping"
  })), /*#__PURE__*/React.createElement("div", {
    className: "metric-info"
  }, /*#__PURE__*/React.createElement("h4", null, "VENTES TOTALES"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, totalVentes))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-icon blue"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-star"
  })), /*#__PURE__*/React.createElement("div", {
    className: "metric-info"
  }, /*#__PURE__*/React.createElement("h4", null, "SCORE MOYEN"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, avgScore))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-icon purple"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trophy"
  })), /*#__PURE__*/React.createElement("div", {
    className: "metric-info"
  }, /*#__PURE__*/React.createElement("h4", null, "PRODUITS GAGNANTS"), /*#__PURE__*/React.createElement("div", {
    className: "value"
  }, winnersCount)))), isAgent && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#09b1ba',
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-user-check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '15px',
      color: '#ffffff',
      fontWeight: 700
    }
  }, "Vos Comptes Vinted Attribués (", comptes.length, ")"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: '#94a3b8'
    }
  }, "Agent connecté : ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#38bdf8'
    }
  }, currentUser.nom || myAgentName)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, comptes.length > 0 ? comptes.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '6px 14px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.18)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#38bdf8',
      fontWeight: 700
    }
  }, "N°", c.numeroCompte || '?'), /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#ffffff'
    }
  }, c.pseudo), /*#__PURE__*/React.createElement("span", {
    className: `badge ${c.statut === 'Actif' ? 'badge-actif' : c.statut === 'Pause' ? 'badge-pause' : c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'}`,
    style: {
      fontSize: '10.5px',
      padding: '2px 7px'
    }
  }, c.statut))) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: '#cbd5e1',
      fontStyle: 'italic'
    }
  }, "Aucun compte actuellement attribué.")))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px',
      position: 'relative',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-magnifying-glass",
    style: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--primary)',
      fontSize: '15px'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: searchTerm,
    onChange: e => setSearchTerm(e.target.value),
    placeholder: "🔍 Recherche avancée instantanée (SKU, Pseudo compte, N° Proxy, Agent, Statut, Date, Heure...)",
    style: {
      paddingLeft: '42px',
      paddingRight: '36px',
      height: '44px',
      fontSize: '14px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      border: searchTerm ? '2px solid var(--primary)' : '1px solid var(--border)'
    }
  }), searchTerm && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSearchTerm(''),
    style: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontSize: '14px'
    }
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    id: "compte-multiselect-wrapper",
    style: {
      minWidth: '180px',
      flex: 1,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Compte"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowCompteDropdown(v => !v),
    style: {
      width: '100%',
      textAlign: 'left',
      padding: '9px 12px',
      border: `1px solid ${filterComptes.length > 0 ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-card)',
      color: filterComptes.length > 0 ? 'var(--primary)' : 'var(--text-main)',
      fontWeight: filterComptes.length > 0 ? 700 : 400,
      cursor: 'pointer',
      fontSize: '13.5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, filterComptes.length === 0 ? `Tous les comptes (${comptes.length})` : filterComptes.length === 1 ? comptes.find(c => c.id === filterComptes[0])?.pseudo || '1 compte' : `${filterComptes.length} comptes sélectionnés`), /*#__PURE__*/React.createElement("i", {
    className: `fa-solid fa-chevron-${showCompteDropdown ? 'up' : 'down'}`,
    style: {
      fontSize: '11px',
      marginLeft: '8px'
    }
  })), showCompteDropdown && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      zIndex: 999,
      maxHeight: '260px',
      overflowY: 'auto',
      padding: '6px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-muted)',
      fontSize: '12px',
      fontWeight: 600
    },
    onClick: () => setFilterComptes(filterComptes.length === comptes.length ? [] : comptes.map(c => c.id))
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    readOnly: true,
    checked: filterComptes.length === comptes.length,
    style: {
      width: '14px',
      height: '14px'
    }
  }), filterComptes.length === comptes.length ? 'Tout désélectionner' : 'Tout sélectionner'), comptes.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      padding: '8px 14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: filterComptes.includes(c.id) ? 'rgba(9,177,186,0.07)' : 'transparent',
      transition: 'background 0.1s'
    },
    onClick: () => setFilterComptes(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    readOnly: true,
    checked: filterComptes.includes(c.id),
    style: {
      width: '14px',
      height: '14px',
      accentColor: 'var(--primary)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: filterComptes.includes(c.id) ? 600 : 400,
      color: filterComptes.includes(c.id) ? 'var(--primary)' : 'var(--text-main)',
      fontSize: '13px'
    }
  }, c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`)), c.numeroCompte && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)',
      marginLeft: 'auto'
    }
  }, "N°", c.numeroCompte))), filterComptes.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px',
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      fontSize: '12px',
      color: 'var(--danger)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600
    },
    onClick: () => {
      setFilterComptes([]);
      setShowCompteDropdown(false);
    }
  }, "✕ Effacer la sélection")))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '140px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "input",
    value: filterDate,
    onChange: e => setFilterDate(e.target.value),
    style: {
      border: filterDate ? '1px solid var(--primary)' : '1px solid var(--border)',
      fontWeight: filterDate ? 700 : 400
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '120px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Heure"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    className: "input",
    value: filterHeure,
    onChange: e => setFilterHeure(e.target.value),
    style: {
      border: filterHeure ? '1px solid var(--primary)' : '1px solid var(--border)',
      fontWeight: filterHeure ? 700 : 400
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '160px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Agent"), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterAgent,
    onChange: e => setFilterAgent(e.target.value),
    disabled: currentUser && currentUser.role === 'agent'
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous les agents"), agentsUnique.map(a => /*#__PURE__*/React.createElement("option", {
    key: a,
    value: a
  }, a)))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '130px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Statut"), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterStatut,
    onChange: e => setFilterStatut(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Tous les statuts"), /*#__PURE__*/React.createElement("option", {
    value: "Non fait"
  }, "Non fait"), /*#__PURE__*/React.createElement("option", {
    value: "Fait"
  }, "Fait"))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: '140px',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Classification"), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: filterClassif,
    onChange: e => setFilterClassif(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Toutes"), /*#__PURE__*/React.createElement("option", {
    value: "Nouveau produit"
  }, "🆕 Nouveau produit"), /*#__PURE__*/React.createElement("option", {
    value: "À retester"
  }, "🔄 À retester"), /*#__PURE__*/React.createElement("option", {
    value: "Gagnant"
  }, "🏆 Gagnant"), /*#__PURE__*/React.createElement("option", {
    value: "Écarté"
  }, "❌ Écarté"))), duplicateSkuCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    onClick: () => setFilterOnlyDuplicates(!filterOnlyDuplicates),
    style: {
      height: '36px',
      padding: '0 12px',
      fontSize: '12px',
      fontWeight: 700,
      borderRadius: '8px',
      border: '1px solid #f97316',
      color: filterOnlyDuplicates ? '#ffffff' : '#c2410c',
      backgroundColor: filterOnlyDuplicates ? '#ea580c' : '#fff7ed',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    title: "Cliquer pour afficher uniquement les lignes avec un SKU en doublon"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clone",
    style: {
      color: filterOnlyDuplicates ? '#fff' : '#ea580c'
    }
  }), /*#__PURE__*/React.createElement("span", null, filterOnlyDuplicates ? '✓ Doublons SKU Filtrés' : `⚠️ ${duplicateSkuCount} SKU${duplicateSkuCount > 1 ? 's' : ''} en doublon`))), isAnyFilterActive && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: resetAllFilters,
    style: {
      color: 'var(--danger)',
      borderColor: '#fca5a5',
      backgroundColor: '#fef2f2',
      fontWeight: 600,
      height: '36px'
    },
    title: "Réinitialiser tous les filtres actifs"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rotate-left"
  }), " Réinitialiser")))), selectedIds.length > 0 && /*#__PURE__*/React.createElement("div", {
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
  }, "✓ ", selectedIds.length, " sélectionné", selectedIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
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
    onClick: () => handleBulkStatut('Fait')
  }, "✓ Marquer Fait"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm",
    style: {
      backgroundColor: '#f59e0b',
      color: '#fff',
      border: 'none',
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => handleBulkStatut('Non fait')
  }, "⌛ Marquer Non fait"), agentsUnique.length > 0 && /*#__PURE__*/React.createElement("select", {
    className: "input-table",
    style: {
      width: 'auto',
      backgroundColor: '#334155',
      color: '#fff',
      border: '1px solid #475569',
      padding: '5px 10px',
      fontSize: '12px'
    },
    onChange: e => {
      if (e.target.value) {
        handleBulkAgent(e.target.value);
        e.target.value = '';
      }
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "👤 Affecter Agent..."), agentsUnique.map(a => /*#__PURE__*/React.createElement("option", {
    key: a,
    value: a
  }, a))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    title: "Modifier l'heure prévisionnelle en masse"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: '#94a3b8'
    }
  }, "🕐 Heure:"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    className: "input-table",
    style: {
      width: 'auto',
      backgroundColor: '#334155',
      color: '#fff',
      border: '1px solid #475569',
      padding: '4px 8px',
      fontSize: '12px'
    },
    onChange: e => {
      if (e.target.value) {
        handleBulkHeure(e.target.value);
        e.target.value = '';
      }
    }
  })), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-danger",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: handleBulkDelete
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash",
    style: {
      marginRight: '4px'
    }
  }), " Supprimer (", selectedIds.length, ")"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-sm btn-secondary",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => setSelectedIds([])
  }, "Annuler"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-container",
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      minWidth: '1325px',
      width: '100%',
      tableLayout: 'fixed'
    }
  }, /*#__PURE__*/React.createElement("colgroup", null, /*#__PURE__*/React.createElement("col", {
    style: {
      width: '40px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '100px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '150px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '120px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '180px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '130px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '130px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '110px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '80px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '70px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '70px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '70px'
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: '75px'
    }
  })), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '40px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isAllSelected,
    onChange: toggleSelectAll,
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    },
    title: "Tout sélectionner / Tout désélectionner"
  })), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700,
      cursor: 'pointer',
      userSelect: 'none'
    },
    onClick: () => handleSort('dateTime'),
    title: "Cliquer pour trier par Date & Heure"
  }, "Date ", sortField === 'dateTime' ? sortAsc ? '▲' : '▼' : sortField === 'date' ? sortAsc ? '▲' : '▼' : ''), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700,
      color: 'var(--accent)'
    }
  }, "Compte"), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700,
      color: 'var(--accent)'
    }
  }, "Agent"), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700,
      cursor: 'pointer',
      userSelect: 'none'
    },
    onClick: () => handleSort('heure'),
    title: "Cliquer pour trier par Heure"
  }, "Heure (", selectedTZ === 'MADA' ? 'Mada UTC+3' : 'FR UTC+2', ") ", sortField === 'heure' && (sortAsc ? '▲' : '▼')), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700
    }
  }, "SKU"), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700
    }
  }, "Classif."), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700
    }
  }, "Statut"), /*#__PURE__*/React.createElement("th", {
    style: {
      fontWeight: 700,
      color: 'var(--success)'
    }
  }, "Vente"), /*#__PURE__*/React.createElement("th", null, "Vues"), /*#__PURE__*/React.createElement("th", null, "Favoris"), /*#__PURE__*/React.createElement("th", null, "Score"), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, filteredLines.length > 0 ? filteredLines.map(l => /*#__PURE__*/React.createElement("tr", {
    key: l.id,
    style: {
      opacity: l.statut === 'Fait' ? 0.85 : 1,
      backgroundColor: selectedIds.includes(l.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: selectedIds.includes(l.id),
    onChange: () => toggleSelectRow(l.id),
    style: {
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "input-table",
    value: l.date || '',
    disabled: currentUser && currentUser.role === 'agent',
    onChange: e => onUpdateRow(l.id, {
      date: e.target.value
    }),
    style: {
      fontWeight: 600,
      color: 'var(--text-primary)',
      fontSize: '12.5px',
      padding: '2px 4px',
      width: '100%'
    },
    title: "Modifier la date de publication"
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("select", {
    className: "input-table",
    style: {
      width: '100%',
      minWidth: '130px',
      fontWeight: 600,
      color: 'var(--text-primary)'
    },
    value: l.compteId || '',
    disabled: currentUser && currentUser.role === 'agent',
    onChange: e => {
      const selCompte = comptesAll.find(c => c.id === e.target.value);
      const targetAgent = selCompte && selCompte.agent && selCompte.agent !== 'À attribuer' ? selCompte.agent : l.agent;
      onUpdateRow(l.id, {
        compteId: e.target.value,
        agent: targetAgent
      });
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "(aucun compte)"), comptesAll.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`))))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("select", {
    className: "input-table",
    style: {
      width: '100%',
      minWidth: '110px',
      fontWeight: 600,
      color: 'var(--accent)'
    },
    value: l.agent || '',
    disabled: currentUser && currentUser.role === 'agent',
    onChange: e => {
      const newAgent = e.target.value;
      const currentCompte = comptes.find(c => c.id === l.compteId);
      if (currentCompte && currentCompte.agent && currentCompte.agent !== 'À attribuer' && currentCompte.agent !== newAgent) {
        if (window.showToast) window.showToast(`Attribution refusée : Le compte "${currentCompte.pseudo}" est officiellement attribué à ${currentCompte.agent}`, true);
        return;
      }
      onUpdateRow(l.id, {
        agent: newAgent
      });
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Sélectionner..."), agentsUnique.map(a => /*#__PURE__*/React.createElement("option", {
    key: a,
    value: a
  }, a)))), /*#__PURE__*/React.createElement("td", null, (() => {
    const convMada = convertHHMM(l.heurePrevue, l.date, 'FR', 'MADA');
    const displayedTime = selectedTZ === 'MADA' ? convMada.time || l.heurePrevue : l.heurePrevue || '';
    const otherFlag = selectedTZ === 'MADA' ? '🇫🇷' : '🇲🇬';
    const otherTime = selectedTZ === 'MADA' ? l.heurePrevue || '' : convMada.time;
    const shiftTag = selectedTZ === 'MADA' ? convMada.dayShift === 1 ? '-1j' : convMada.dayShift === -1 ? '+1j' : '' : convMada.dayShift === 1 ? '+1j' : convMada.dayShift === -1 ? '-1j' : '';
    const handleTimeChange = e => {
      const val = e.target.value;
      if (selectedTZ === 'MADA') {
        const convFR = convertHHMM(val, l.date, 'MADA', 'FR');
        onUpdateRow(l.id, {
          heurePrevue: convFR.time
        });
      } else {
        onUpdateRow(l.id, {
          heurePrevue: val
        });
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "time",
      className: "input-table",
      disabled: currentUser && currentUser.role === 'agent',
      style: {
        fontWeight: 700,
        width: '92px',
        fontSize: '13px',
        padding: '2px 4px'
      },
      value: displayedTime || '',
      onChange: handleTimeChange,
      title: `Modifier l'heure en ${selectedTZ === 'MADA' ? 'Madagascar' : 'France'}`
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        backgroundColor: '#f1f5f9',
        padding: '1px 5px',
        borderRadius: '4px',
        whiteSpace: 'nowrap'
      },
      title: `Heure équivalente (${selectedTZ === 'MADA' ? 'France' : 'Madagascar'})`
    }, otherFlag, " ", otherTime, shiftTag && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#d97706',
        fontWeight: 700,
        marginLeft: '3px'
      }
    }, shiftTag)));
  })()), /*#__PURE__*/React.createElement("td", null, (() => {
    const sKey = (l.sku || '').trim().toLowerCase();
    const countSku = skuCounts[sKey] || 0;
    const isDuplicate = countSku > 1 && l.classification !== 'Gagnant';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "input-table",
      value: l.sku || '',
      placeholder: "SKU",
      disabled: currentUser && currentUser.role === 'agent',
      onChange: e => onUpdateRow(l.id, {
        sku: e.target.value
      }),
      style: {
        flex: 1,
        minWidth: '70px',
        borderColor: isDuplicate ? '#f97316' : '',
        backgroundColor: isDuplicate ? '#fff7ed' : '',
        fontWeight: isDuplicate ? 700 : 400
      },
      title: isDuplicate ? `⚠️ ATTENTION : SKU en doublon présent ${countSku} fois dans le planning !` : 'SKU Produit'
    }), isDuplicate && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '10px',
        fontWeight: 700,
        backgroundColor: '#ea580c',
        color: '#ffffff',
        padding: '2px 5px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        cursor: 'pointer'
      },
      onClick: e => {
        e.stopPropagation();
        setSearchTerm(l.sku);
      },
      title: `Cliquer pour isoler les ${countSku} occurrences de ce SKU (${l.sku})`
    }, "⚠️ x", countSku), l.sku && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-secondary btn-sm",
      style: {
        padding: '3px 7px',
        fontSize: '11px',
        height: '28px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px'
      },
      title: "Copier rapidement le SKU",
      onClick: e => {
        e.stopPropagation();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(l.sku);
        } else {
          const el = document.createElement('textarea');
          el.value = l.sku;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        setCopiedSkuId(l.id);
        setTimeout(() => setCopiedSkuId(null), 1500);
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fa-solid ${copiedSkuId === l.id ? 'fa-check' : 'fa-copy'}`,
      style: {
        color: copiedSkuId === l.id ? '#059669' : 'inherit'
      }
    })));
  })()), /*#__PURE__*/React.createElement("td", null, l.sku && String(l.sku).trim() !== '' ? /*#__PURE__*/React.createElement("span", {
    className: `badge ${l.classification === 'Gagnant' ? 'badge-gagnant' : l.classification === 'Écarté' ? 'badge-ecarte' : l.classification === 'Nouveau produit' ? 'badge-nouveau' : 'badge-retester'}`
  }, l.classification || 'Nouveau produit') : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '12px',
      fontStyle: 'italic'
    }
  }, "-")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: `btn btn-sm ${l.statut === 'Fait' ? 'btn-success' : 'btn-danger'}`,
    onClick: () => onUpdateRow(l.id, {
      statut: l.statut === 'Fait' ? 'Non fait' : 'Fait'
    })
  }, l.statut === 'Fait' ? '✓ Fait' : '⌛ Non fait')), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `btn btn-sm ${l.vente === 1 ? 'btn-success' : 'btn-secondary'}`,
    onClick: () => onUpdateRow(l.id, {
      vente: l.vente === 1 ? 0 : 1
    })
  }, l.vente === 1 ? '💰 Oui' : 'Non'), l.sku && skuVentesMap[l.sku] > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      color: skuVentesMap[l.sku] >= 3 ? '#059669' : 'var(--text-muted)',
      fontWeight: 700,
      background: skuVentesMap[l.sku] >= 3 ? 'rgba(5,150,105,0.1)' : '#f1f5f9',
      borderRadius: '4px',
      padding: '1px 5px',
      whiteSpace: 'nowrap'
    },
    title: `Ce SKU a été vendu ${skuVentesMap[l.sku]}x dans l'organisation`
  }, skuVentesMap[l.sku], "x ce SKU"))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "input-table",
    style: {
      width: '60px'
    },
    value: l.vues || 0,
    onChange: e => onUpdateRow(l.id, {
      vues: parseInt(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "input-table",
    style: {
      width: '60px'
    },
    value: l.favoris || 0,
    onChange: e => onUpdateRow(l.id, {
      favoris: parseInt(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, (l.score || 0).toFixed(1))), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    title: "Supprimer",
    onClick: () => onDeleteRow(l.id)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  }))))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "13",
    style: {
      textAlign: 'center',
      padding: '30px',
      color: 'var(--text-muted)'
    }
  }, "Aucune ligne de calendrier trouvée pour ces filtres.")))))));
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
  }, "Collez simplement votre liste de comptes au format brut (N°, Pseudo, Téléphone, Email, Mot de passe, Initiales, Statut & Date). Le système va tout déduire et créer automatiquement les comptes !"), /*#__PURE__*/React.createElement("textarea", {
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
  }, /*#__PURE__*/React.createElement("label", null, "N° Compte (Proxy)"), /*#__PURE__*/React.createElement("input", {
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
  }, /*#__PURE__*/React.createElement("label", null, "N° Téléphone"), /*#__PURE__*/React.createElement("input", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Géré par (Initiales)"), /*#__PURE__*/React.createElement("input", {
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
  }), " + Créer Agent")), /*#__PURE__*/React.createElement("select", {
    value: agent,
    onChange: e => setAgent(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "À attribuer (Non spécifié)"), agentsList.map(a => /*#__PURE__*/React.createElement("option", {
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
    value: "Limité"
  }, "Limité / Restreint"), /*#__PURE__*/React.createElement("option", {
    value: "Banni"
  }, "Banni / Bloqué"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Date du Statut"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: dateStatutCompte,
    onChange: e => setDateStatutCompte(e.target.value),
    placeholder: "ex: 28/07/2026"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      marginBottom: '16px'
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
  }, /*#__PURE__*/React.createElement("label", null, "Notes & Observations (Adspower, Ventes, etc.)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "ex: connecté à Adspower le 05/08/26, 1 article en vente"
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
  }, "✓ ", selectedCompteIds.length, " compte", selectedCompteIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
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
  }, "Statut Limité"), /*#__PURE__*/React.createElement("button", {
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
  }, "Liste des Comptes enregistrés (", visibleComptes.length, ")"), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "🔍 Recherche avancée compte (N°, Pseudo, Tél, Email, Agent, Notes...)",
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
  }, "✕")), /*#__PURE__*/React.createElement("select", {
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
  }, "🟢 Actif"), /*#__PURE__*/React.createElement("option", {
    value: "Pause"
  }, "🟣 Pause"), /*#__PURE__*/React.createElement("option", {
    value: "Limité"
  }, "🟠 Limité"), /*#__PURE__*/React.createElement("option", {
    value: "Banni"
  }, "🔴 Banni")), /*#__PURE__*/React.createElement("select", {
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
    value: "À attribuer"
  }, "👤 À attribuer"), agentsList.map(a => /*#__PURE__*/React.createElement("option", {
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
  }, "Tous géré par"), gereParList.map(g => /*#__PURE__*/React.createElement("option", {
    key: g,
    value: g
  }, "🏷️ Géré par : ", g))), (searchTermComptes || filterStatutCompte || filterAgentCompte || filterGereParCompte) && /*#__PURE__*/React.createElement("button", {
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
    title: "Réinitialiser les filtres"
  }, "🔄 Effacer"))), /*#__PURE__*/React.createElement("div", {
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
  })), /*#__PURE__*/React.createElement("th", null, "Statut & Date"), /*#__PURE__*/React.createElement("th", null, "N° Proxy"), /*#__PURE__*/React.createElement("th", null, "Pseudo"), /*#__PURE__*/React.createElement("th", null, "Géré par"), /*#__PURE__*/React.createElement("th", null, "Agent"), /*#__PURE__*/React.createElement("th", null, "Téléphone"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Mot de passe"), /*#__PURE__*/React.createElement("th", null, "Notes & Observations"), isCadre && /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, visibleComptes.length > 0 ? visibleComptes.map(c => /*#__PURE__*/React.createElement("tr", {
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
    title: "Copier le N° Proxy",
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
  }, "À attribuer")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, c.telephone || '-'), c.telephone && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(c.telephone, 'tel', c.id),
    title: "Copier le téléphone",
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
      maxWidth: '200px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, c.notes || '-'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => handleCopyText(`N°${c.numeroCompte || ''} | Pseudo: ${c.pseudo || ''} | Tél: ${c.telephone || ''} | Email: ${c.email || ''} | MP: ${c.motDePasse || ''}`, 'all', c.id),
    title: "Copier TOUS les identifiants",
    style: {
      border: '1px solid #cbd5e1',
      background: '#f8fafc',
      borderRadius: '4px',
      cursor: 'pointer',
      padding: '2px 6px',
      color: copiedField === `${c.id}_all` ? '#10b981' : '#64748b',
      fontSize: '10px',
      fontWeight: 600,
      flexShrink: 0
    }
  }, copiedField === `${c.id}_all` ? '✓ Copié !' : '📋 Tout copier'))), isCadre && /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => handleEdit(c),
    title: "Éditer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => onDeleteCompte(c.id),
    title: "Supprimer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  })))))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "11",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun compte Vinted enregistré.")))))));
}
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper pour filtrer exclusivement les comptes au statut Actif ET attribués à un agent réel
function getComptesActifsEtAttribues(comptes = [], selectedAgents = null) {
  return (comptes || []).filter(c => {
    const isActif = c && c.statut === 'Actif';
    const isAttribue = c && c.agent && String(c.agent).trim() !== '' && String(c.agent) !== 'À attribuer';
    if (!isActif || !isAttribue) return false;
    if (Array.isArray(selectedAgents) && selectedAgents.length > 0) {
      return selectedAgents.includes(c.agent);
    }
    return true;
  });
}

// ------------------- VIEW: PLANNING GENERATION -------------------
function PlanningView({
  appState,
  onGeneratePlanning
}) {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const defaultEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return getLocalDateString(d);
  }, []);
  const [dateDebut, setDateDebut] = useState(todayStr);
  const [dateFin, setDateFin] = useState(defaultEndStr);
  const [creneauxParJour, setCreneauxParJour] = useState(appState.parametres && appState.parametres.creneauxParJour || 6);
  const [heureDebut, setHeureDebut] = useState("07:00");
  const [heureFin, setHeureFin] = useState("22:00");
  const [includeWinnerSKUs, setIncludeWinnerSKUs] = useState(true);
  const [loading, setLoading] = useState(false);
  const comptes = appState.comptes || [];
  // Exclusivité stricte : Seuls les comptes au statut Actif ET attribués à un agent réel
  const activeComptes = useMemo(() => getComptesActifsEtAttribues(comptes), [comptes]);

  // Liste unique des agents attribués ayant au moins un compte actif
  const availableAgents = useMemo(() => {
    const set = new Set();
    activeComptes.forEach(c => {
      if (c.agent && String(c.agent).trim() !== '' && String(c.agent) !== 'À attribuer') {
        set.add(c.agent);
      }
    });
    return Array.from(set);
  }, [activeComptes]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [initializedAgents, setInitializedAgents] = useState(false);

  // Par défaut : Tous les agents sont sélectionnés
  useEffect(() => {
    if (availableAgents.length > 0 && (!initializedAgents || selectedAgents.length === 0)) {
      setSelectedAgents(availableAgents);
      setInitializedAgents(true);
    }
  }, [availableAgents, initializedAgents]);
  const toggleAgent = agentName => {
    setSelectedAgents(prev => {
      if (prev.includes(agentName)) {
        return prev.filter(a => a !== agentName);
      } else {
        return [...prev, agentName];
      }
    });
  };
  const selectAllAgents = () => setSelectedAgents([...availableAgents]);
  const deselectAllAgents = () => setSelectedAgents([]);
  const [excludedAccountIds, setExcludedAccountIds] = useState([]);
  const toggleAccount = id => {
    setExcludedAccountIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const includeAllAccounts = () => setExcludedAccountIds([]);
  const excludeAllAccounts = () => {
    const base = getComptesActifsEtAttribues(comptes, selectedAgents);
    setExcludedAccountIds(base.map(c => c.id));
  };

  // Comptes actifs filtrés par la sélection d'agents ET la sélection individuelle de comptes
  const filteredActiveComptes = useMemo(() => {
    const base = getComptesActifsEtAttribues(comptes, selectedAgents);
    return base.filter(c => !excludedAccountIds.includes(c.id));
  }, [comptes, selectedAgents, excludedAccountIds]);
  const totalDays = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [dateDebut, dateFin]);
  const totalEstimatedSlots = useMemo(() => {
    return totalDays * filteredActiveComptes.length * creneauxParJour;
  }, [totalDays, filteredActiveComptes.length, creneauxParJour]);
  const setPreset = days => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + (days - 1));
    setDateDebut(getLocalDateString(start));
    setDateFin(getLocalDateString(end));
  };
  const handleGenerate = async () => {
    if (filteredActiveComptes.length === 0) return;
    if (!dateDebut || !dateFin || totalDays <= 0) return;
    setLoading(true);
    try {
      const selectedAccountIds = filteredActiveComptes.map(c => c.id);
      await onGeneratePlanning(dateDebut, dateFin, creneauxParJour, heureDebut, heureFin, selectedAgents, includeWinnerSKUs, selectedAccountIds);
    } finally {
      setLoading(false);
    }
  };
  const handleCleanEmptySKUs = async () => {
    if (!confirm("Voulez-vous vraiment supprimer toutes les lignes de planning sans SKU ?")) return;
    setLoading(true);
    try {
      const orgId = appState.currentUser && appState.currentUser.organisationId || 'org_default';
      const res = await fetch('/api/calendrier/clean-empty-skus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organisationId: orgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message);
        if (window.loadAppState) await window.loadAppState();
      } else {
        if (window.showToast) window.showToast(`❌ ${data.error}`, true);
      }
    } catch (err) {
      console.error("Erreur nettoyage SKU:", err);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Générateur Automatique de Planning"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-wand-magic-sparkles",
    style: {
      color: 'var(--primary)',
      marginRight: '8px'
    }
  }), "Génération Anti-Collision Multi-Comptes & Multi-Agents"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginBottom: '20px'
    }
  }, "Le moteur calcule automatiquement la répartition optimale des créneaux horaires pour l'ensemble des ", /*#__PURE__*/React.createElement("b", null, filteredActiveComptes.length, " comptes au statut Actif et attribués à un agent"), ", en appliquant les règles d'espacement et la marge d'intervalle aléatoire."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(9, 177, 186, 0.04)',
      border: '1px solid rgba(9, 177, 186, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '15px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'var(--text-main)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-users-gear",
    style: {
      color: 'var(--primary)'
    }
  }), "Agents Concernés (Gestion Pause / Congé)"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0 0',
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Décocher un agent le passe en ", /*#__PURE__*/React.createElement("b", null, "Pause / Congé"), " pour exclure ses comptes de cette génération de planning. Par défaut, tous les agents sont sélectionnés.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: selectAllAgents,
    style: {
      fontSize: '11px',
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check-double",
    style: {
      marginRight: '4px'
    }
  }), " Tout sélectionner"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: deselectAllAgents,
    style: {
      fontSize: '11px',
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark",
    style: {
      marginRight: '4px'
    }
  }), " Tout décocher"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, availableAgents.length === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, "Aucun agent actif trouvé.") : availableAgents.map(agentName => {
    const isSelected = selectedAgents.includes(agentName);
    const agentComptesCount = activeComptes.filter(c => (c.agent || 'À attribuer') === agentName).length;
    return /*#__PURE__*/React.createElement("label", {
      key: agentName,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '20px',
        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
        background: isSelected ? 'rgba(9, 177, 186, 0.1)' : 'var(--bg-card)',
        color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)',
        fontWeight: isSelected ? 600 : 400,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isSelected,
      onChange: () => toggleAgent(agentName),
      style: {
        accentColor: 'var(--primary)',
        cursor: 'pointer',
        width: '16px',
        height: '16px'
      }
    }), /*#__PURE__*/React.createElement("span", null, agentName), /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: isSelected ? 'var(--primary)' : '#94a3b8',
        color: '#fff',
        fontSize: '11px',
        padding: '1px 6px',
        borderRadius: '10px'
      }
    }, agentComptesCount, " compte", agentComptesCount > 1 ? 's' : ''), !isSelected && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '11px',
        fontStyle: 'italic',
        color: '#ef4444',
        fontWeight: 600
      }
    }, "(Pause / Congé)"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(99, 102, 241, 0.04)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '15px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'var(--text-main)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-address-book",
    style: {
      color: '#6366f1'
    }
  }), "Comptes Concernés (", filteredActiveComptes.length, " / ", activeComptes.length, " comptes inclus)"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0 0',
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Cochez ou décochez individuellement les comptes Vinted à inclure ou exclure de la génération du planning.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: includeAllAccounts,
    style: {
      fontSize: '11px',
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check-double",
    style: {
      marginRight: '4px'
    }
  }), " Tout inclure"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: excludeAllAccounts,
    style: {
      fontSize: '11px',
      padding: '4px 8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark",
    style: {
      marginRight: '4px'
    }
  }), " Tout exclure"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, activeComptes.length === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, "Aucun compte actif disponible.") : activeComptes.map(c => {
    const isIncluded = !excludedAccountIds.includes(c.id);
    return /*#__PURE__*/React.createElement("label", {
      key: c.id,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '20px',
        border: `1.5px solid ${isIncluded ? '#6366f1' : 'var(--border-color)'}`,
        background: isIncluded ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
        color: isIncluded ? '#4338ca' : 'var(--text-muted)',
        fontWeight: isIncluded ? 600 : 400,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: isIncluded,
      onChange: () => toggleAccount(c.id),
      style: {
        accentColor: '#6366f1',
        cursor: 'pointer',
        width: '16px',
        height: '16px'
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "N°", c.numeroCompte || '?'), " - ", c.pseudo), /*#__PURE__*/React.createElement("span", {
      className: "badge badge-agent",
      style: {
        fontSize: '10.5px',
        padding: '1px 6px'
      }
    }, c.agent), !isIncluded && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '11px',
        fontStyle: 'italic',
        color: '#ef4444',
        fontWeight: 600
      }
    }, "(Exclu)"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: '18px'
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
    className: "fa-solid fa-calendar-day",
    style: {
      color: 'var(--primary)'
    }
  }), "Date de Début"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dateDebut,
    onChange: e => setDateDebut(e.target.value),
    style: {
      padding: '12px',
      fontSize: '14px',
      borderRadius: '8px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-check",
    style: {
      color: 'var(--primary)'
    }
  }), "Date de Fin"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dateFin,
    min: dateDebut,
    onChange: e => setDateFin(e.target.value),
    style: {
      padding: '12px',
      fontSize: '14px',
      borderRadius: '8px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-bullhorn",
    style: {
      color: 'var(--primary)'
    }
  }), "Publications / Compte / Jour"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "30",
    value: creneauxParJour,
    onChange: e => setCreneauxParJour(parseInt(e.target.value) || 1),
    style: {
      padding: '12px',
      fontSize: '14px',
      borderRadius: '8px'
    },
    placeholder: "ex: 6"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      marginBottom: '18px'
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
    className: "fa-solid fa-clock",
    style: {
      color: 'var(--primary)'
    }
  }), "Heure de Début des Créneaux"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: heureDebut,
    onChange: e => setHeureDebut(e.target.value),
    style: {
      padding: '12px',
      fontSize: '14px',
      borderRadius: '8px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-moon",
    style: {
      color: 'var(--primary)'
    }
  }), "Heure de Fin des Créneaux"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: heureFin,
    onChange: e => setHeureFin(e.target.value),
    style: {
      padding: '12px',
      fontSize: '14px',
      borderRadius: '8px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: includeWinnerSKUs ? 'rgba(16, 185, 129, 0.05)' : '#f8fafc',
      border: `1px solid ${includeWinnerSKUs ? '#a7f3d0' : '#cbd5e1'}`,
      borderRadius: '12px',
      padding: '14px 18px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: "includeWinnerSKUsCheck",
    checked: includeWinnerSKUs,
    onChange: e => setIncludeWinnerSKUs(e.target.checked),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      accentColor: '#10b981'
    }
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "includeWinnerSKUsCheck",
    style: {
      cursor: 'pointer',
      userSelect: 'none',
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: '14px',
      color: includeWinnerSKUs ? '#047857' : 'var(--text-main)',
      display: 'block'
    }
  }, "🏆 Répartir automatiquement les SKU Gagnants (Anti-doublon : 1 SKU par jour max)"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, includeWinnerSKUs ? "Activé : Chaque SKU Gagnant est attribué au maximum une fois par jour et sans aucun doublon par compte." : "Désactivé : Le planning sera généré avec des lignes neutres/vierges sans pré-remplissage des SKU Gagnants."))), /*#__PURE__*/React.createElement("span", {
    className: `badge ${includeWinnerSKUs ? 'badge-actif' : 'badge-secondary'}`,
    style: {
      padding: '4px 10px',
      fontSize: '12px'
    }
  }, includeWinnerSKUs ? '✓ SKU Gagnants Inclus' : 'Sans SKU Gagnant')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => setPreset(1)
  }, "Aujourd'hui (1 jour)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => setPreset(7)
  }, "7 Jours à venir"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => setPreset(14)
  }, "14 Jours à venir"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary btn-sm",
    onClick: () => setPreset(30)
  }, "30 Jours à venir")), totalDays > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      color: '#15803d',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '13px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-calendar-days",
    style: {
      fontSize: '16px'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Période : du ", /*#__PURE__*/React.createElement("b", null, dateDebut), " au ", /*#__PURE__*/React.createElement("b", null, dateFin), " (", totalDays, " jour", totalDays > 1 ? 's' : '', ") —", /*#__PURE__*/React.createElement("b", null, " ", creneauxParJour, " pub", creneauxParJour > 1 ? 's' : '', "/compte/jour"), " pour ", filteredActiveComptes.length, " compte(s) au statut Actif et attribué(s) à un agent (", selectedAgents.length, " agent(s) sélectionné(s)) (soit ", /*#__PURE__*/React.createElement("b", null, totalEstimatedSlots, " publication", totalEstimatedSlots > 1 ? 's' : '', " au total"), ")")) : /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fca5a5',
      color: '#b91c1c',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '13px',
      fontWeight: 600
    }
  }, "⚠️ La date de fin doit être égale ou supérieure à la date de début."), filteredActiveComptes.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#fffbebf',
      border: '1px solid #fde68a',
      color: '#b45309',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '13px',
      fontWeight: 600
    }
  }, "⚠️ Aucun compte actif disponible pour la sélection d'agents courante (tous les agents sont décochés ou en pause/congé)."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleGenerate,
    disabled: loading || totalDays <= 0 || filteredActiveComptes.length === 0,
    style: {
      padding: '12px 24px',
      fontSize: '15px'
    }
  }, loading ? /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-spinner fa-spin",
    style: {
      marginRight: '8px'
    }
  }) : /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-bolt",
    style: {
      marginRight: '8px'
    }
  }), loading ? 'Génération en cours...' : `Générer le Planning (${totalEstimatedSlots} pub${totalEstimatedSlots > 1 ? 's' : ''})`), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    onClick: handleCleanEmptySKUs,
    disabled: loading,
    style: {
      padding: '12px 18px',
      fontSize: '14px',
      color: 'var(--danger)',
      borderColor: '#fca5a5',
      backgroundColor: '#fef2f2',
      fontWeight: 600
    },
    title: "Supprimer du planning toutes les lignes qui n'ont pas de SKU attribué"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-broom",
    style: {
      marginRight: '6px'
    }
  }), " Nettoyer les lignes sans SKU"))));
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
  }, "Édition Mode : #", editingIncidentId)), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Compte Impacté"), /*#__PURE__*/React.createElement("select", {
    value: compteId,
    onChange: e => setCompteId(e.target.value),
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Sélectionner un compte..."), comptes.map(c => /*#__PURE__*/React.createElement("option", {
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
    value: "Ban définitif"
  }, "Ban définitif"), /*#__PURE__*/React.createElement("option", {
    value: "Annonces masquées"
  }, "Annonces masquées"))), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Notes & Activités Suspectes (Cause / Actions ayant pu provoquer l'incident)"), /*#__PURE__*/React.createElement("input", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Nombre d'Annonces Masquées"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    value: nbAnnonces,
    onChange: e => setNbAnnonces(e.target.value),
    placeholder: "ex: 5",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "SKU des Annonces Masquées"), /*#__PURE__*/React.createElement("input", {
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
  }, "✓ ", selectedIncidentIds.length, " incident", selectedIncidentIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
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
  })), /*#__PURE__*/React.createElement("th", null, "Date & Heure"), /*#__PURE__*/React.createElement("th", null, "Compte"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Pubs 24h Précédentes"), /*#__PURE__*/React.createElement("th", null, "Détail Ventes / Annonces"), /*#__PURE__*/React.createElement("th", null, "Cause Suspectée / Activités"), /*#__PURE__*/React.createElement("th", {
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
    }, "📝 ", inc.notesActivites) : /*#__PURE__*/React.createElement("span", {
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
      title: "Éditer les détails de cet incident"
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
  }, "Aucun incident enregistré.")))))));
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
      nbJoursPlanningParDefaut: parseInt(joursDefaut) || 7
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Paramètres Métier & Algorithmes"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "⚙️ Mode de Planification & Décalage Horaire des Publications"), /*#__PURE__*/React.createElement("div", {
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
  }, "⏱️ Temps Intervallé (Glissant avec décalage)"), /*#__PURE__*/React.createElement("option", {
    value: "aleatoire"
  }, "🎲 Temps Randomisé (Intervalle aléatoire humanisé)"), /*#__PURE__*/React.createElement("option", {
    value: "fixe"
  }, "📌 Temps Fixe (Heures fixes)"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Décalage Min. entre Comptes (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: decalage,
    onChange: e => setDecalage(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Variation / Marge Aléatoire (± min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: margeAleatoire,
    onChange: e => setMargeAleatoire(e.target.value)
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "📊 Pondération du Score & Seuils de Classification"), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Seuil Écarté (<)"), /*#__PURE__*/React.createElement("input", {
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
  }, /*#__PURE__*/React.createElement("label", null, "Créneaux / Jour / Compte"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: creneaux,
    onChange: e => setCreneaux(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Délai Prochain Repost (min)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: delaiRepost,
    onChange: e => setDelaiRepost(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Jours Planning par Défaut"), /*#__PURE__*/React.createElement("input", {
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
  }), "Sauvegarder les Paramètres & Recalculer les Scores"))));
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
  }, "Connectez-vous pour accéder au tableau de bord")), loginError && /*#__PURE__*/React.createElement("div", {
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
    placeholder: "••••••••",
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

// ------------------- VIEW: UTILISATEURS -------------------
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
      contactNumero
    });
    handleReset();
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "view"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title",
    style: {
      marginBottom: '20px'
    }
  }, "Gestion des Utilisateurs & Agents"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, userId ? 'Modifier l\'agent' : 'Ajouter un nouveau profil Agent'), !isAdmin && /*#__PURE__*/React.createElement("p", {
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
  }), " En tant qu'", /*#__PURE__*/React.createElement("strong", null, "Admin"), ", vous pouvez créer uniquement des profils ", /*#__PURE__*/React.createElement("strong", null, "Agent de publication"), " pour votre organisation."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Nom complet"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: nom,
    onChange: e => setNom(e.target.value),
    placeholder: "ex: Van Quy Dang",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Adresse Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "ex: vanquydang905@gmail.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Rôle"), /*#__PURE__*/React.createElement("select", {
    value: isAdmin ? role : 'agent',
    onChange: e => setRole(e.target.value),
    disabled: !isAdmin
  }, isAdmin && /*#__PURE__*/React.createElement("option", {
    value: "admin"
  }, "Admin (Global)"), isAdmin && /*#__PURE__*/React.createElement("option", {
    value: "cadre"
  }, "Admin (Organisation)"), /*#__PURE__*/React.createElement("option", {
    value: "agent"
  }, "Agent de publication")))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
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
  }, /*#__PURE__*/React.createElement("label", null, "Agent Assigné / Code"), /*#__PURE__*/React.createElement("input", {
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
    placeholder: "••••••••",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
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
  }, /*#__PURE__*/React.createElement("label", null, "Numéro ou Pseudo (", contactType, ")"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: contactNumero,
    onChange: e => setContactNumero(e.target.value),
    placeholder: contactType === 'Telegram' ? '@mon_pseudo ou +33612345678' : '+33612345678'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-user-plus"
  }), " Enregistrer l'agent"), userId && /*#__PURE__*/React.createElement("button", {
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
  }, "✓ ", selectedUserIds.length, " utilisateur", selectedUserIds.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", null, "Actions en masse :")), /*#__PURE__*/React.createElement("div", {
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
  }, "Liste des Utilisateurs / Agents (", visibleUsers.length, ")"), /*#__PURE__*/React.createElement("div", {
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
  })), /*#__PURE__*/React.createElement("th", null, "Nom"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "Rôle"), /*#__PURE__*/React.createElement("th", null, "Organisation"), /*#__PURE__*/React.createElement("th", null, "Contact Direct"), /*#__PURE__*/React.createElement("th", null, "Agent Assigné"), /*#__PURE__*/React.createElement("th", null, "Date Création"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, visibleUsers.length > 0 ? visibleUsers.map(u => /*#__PURE__*/React.createElement("tr", {
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
  }, u.role === 'admin' ? 'Admin' : u.role === 'cadre' ? 'Admin' : 'Agent')), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-compte"
  }, (organisations.find(o => o.id === u.organisationId) || {}).nom || u.organisationId || 'Par défaut')), /*#__PURE__*/React.createElement("td", null, u.contactNumero ? /*#__PURE__*/React.createElement("a", {
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
  }, "-")), /*#__PURE__*/React.createElement("td", null, u.agentAssigne || u.nom), /*#__PURE__*/React.createElement("td", null, u.dateCreation || '-'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => handleEdit(u),
    title: "Éditer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen"
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => onDeleteUser(u.id),
    title: "Supprimer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-trash"
  })))))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "7",
    style: {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--text-muted)'
    }
  }, "Aucun utilisateur trouvé.")))))));
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
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Code ID"), /*#__PURE__*/React.createElement("th", null, "Nom de l'organisation"), /*#__PURE__*/React.createElement("th", null, "Date Création"), /*#__PURE__*/React.createElement("th", null, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, organisations.map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, o.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, o.nom)), /*#__PURE__*/React.createElement("td", null, o.dateCreation || '-'), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => handleEdit(o),
    title: "Éditer le nom"
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
  const [skuSearchTerm, setSkuSearchTerm] = useState('');
  const [skuFilterClassif, setSkuFilterClassif] = useState('');

  // Répertoire de tous les SKUs enregistrés avec leur classification et statistiques
  const allSKUsMap = useMemo(() => {
    const map = {};
    calendrier.forEach(l => {
      if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return;
      if (!l.sku || !String(l.sku).trim()) return;
      const skuClean = String(l.sku).trim();
      if (!map[skuClean]) {
        map[skuClean] = {
          sku: skuClean,
          classification: l.classification || 'Nouveau produit',
          scoreCumule: 0,
          ventes: 0,
          pubs: 0,
          lineIds: []
        };
      }
      map[skuClean].scoreCumule += l.score || 0;
      map[skuClean].ventes += l.vente || 0;
      map[skuClean].pubs += 1;
      map[skuClean].lineIds.push(l.id);
      if (l.classification) map[skuClean].classification = l.classification;
    });
    return map;
  }, [calendrier]);
  const skuList = useMemo(() => Object.values(allSKUsMap), [allSKUsMap]);
  const filteredSKUList = useMemo(() => {
    let list = skuList;
    if (skuFilterClassif) {
      list = list.filter(s => s.classification === skuFilterClassif);
    }
    if (skuSearchTerm.trim()) {
      const q = skuSearchTerm.trim().toLowerCase();
      list = list.filter(s => s.sku.toLowerCase().includes(q) || s.classification.toLowerCase().includes(q));
    }
    return list;
  }, [skuList, skuSearchTerm, skuFilterClassif]);
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

  // Classement et performance des agents par score et publications
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
    calendrier.forEach(l => {
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
      if (l.statut === 'Publié' || l.statut === '✓ Fait' || l.done) {
        statsMap[key].pubsFaites += 1;
      }
      statsMap[key].ventes += l.vente || 0;
      statsMap[key].scoreTotal += l.score || 0;
    });
    return Object.values(statsMap).map(a => ({
      ...a,
      taux: a.pubsTotales > 0 ? Math.round(a.pubsFaites / a.pubsTotales * 100) : 0
    })).sort((a, b) => {
      if (b.scoreTotal !== a.scoreTotal) return b.scoreTotal - a.scoreTotal;
      if (b.pubsFaites !== a.pubsFaites) return b.pubsFaites - a.pubsFaites;
      return b.ventes - a.ventes;
    });
  }, [calendrier, appState.utilisateurs]);
  const handleRegisterSKU = async e => {
    e.preventDefault();
    if (!newSkuInput.trim()) return;
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
          organisationId: userOrgId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(data.message || `✅ SKU "${skuClean}" enregistré comme "${newClassifInput}" !`);
        if (window.loadAppState) await window.loadAppState();
      } else {
        if (window.showToast) window.showToast(`❌ Erreur : ${data.error || 'Échec de l\'enregistrement'}`);
      }
    } catch (err) {
      console.error("Erreur enregistrement SKU:", err);
    }
    setNewSkuInput('');
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
    className: "fa-solid fa-trophy",
    style: {
      color: '#f59e0b'
    }
  }), "Classement & Performance des Agents"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13.5px',
      marginBottom: '16px'
    }
  }, "Suivi en temps réel du volume de publications réalisées, des ventes enregistrées et du score de performance par agent."), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: '60px'
    }
  }, "Rang"), /*#__PURE__*/React.createElement("th", null, "Agent"), /*#__PURE__*/React.createElement("th", null, "Publications"), /*#__PURE__*/React.createElement("th", null, "Taux Réussite"), /*#__PURE__*/React.createElement("th", null, "Ventes Total"), /*#__PURE__*/React.createElement("th", null, "Score Cumulé"))), /*#__PURE__*/React.createElement("tbody", null, agentRanking.length > 0 ? agentRanking.map((a, idx) => /*#__PURE__*/React.createElement("tr", {
    key: a.name
  }, /*#__PURE__*/React.createElement("td", null, idx === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "1er Place"
  }, "🥇") : idx === 1 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "2ème Place"
  }, "🥈") : idx === 2 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px'
    },
    title: "3ème Place"
  }, "🥉") : /*#__PURE__*/React.createElement("b", null, "#", idx + 1)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, a.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)',
      marginLeft: '6px'
    }
  }, "(", a.role, ")")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, a.pubsFaites), " / ", a.pubsTotales, " pub", a.pubsTotales > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
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
    colSpan: "6",
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '16px'
    }
  }, "Aucun agent ou activité enregistrée.")))))), /*#__PURE__*/React.createElement("div", {
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
    className: "fa-solid fa-boxes-packing",
    style: {
      color: 'var(--primary)'
    }
  }), "Enregistrement & Répertoire des SKU avec Classification"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13.5px',
      marginBottom: '16px'
    }
  }, "Enregistrez vos SKU et définissez directement leur classification (Nouveau produit, Gagnant, À retester, Écarté)."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleRegisterSKU,
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      marginBottom: '20px',
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      minWidth: '180px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 600,
      color: 'var(--text-main)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Code SKU"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: newSkuInput,
    onChange: e => setNewSkuInput(e.target.value),
    placeholder: "ex: sz26001, SKU-JEAN-02",
    required: true,
    style: {
      height: '40px',
      fontSize: '13px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 2,
      minWidth: '180px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12.5px',
      fontWeight: 600,
      color: 'var(--text-main)',
      marginBottom: '4px',
      display: 'block'
    }
  }, "Classification"), /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: newClassifInput,
    onChange: e => setNewClassifInput(e.target.value),
    style: {
      height: '40px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "Nouveau produit"
  }, "✨ Nouveau produit"), /*#__PURE__*/React.createElement("option", {
    value: "Gagnant"
  }, "🏆 Gagnant"), /*#__PURE__*/React.createElement("option", {
    value: "À retester"
  }, "🔄 À retester"), /*#__PURE__*/React.createElement("option", {
    value: "Écarté"
  }, "🚫 Écarté"))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    style: {
      height: '40px',
      padding: '0 20px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-plus",
    style: {
      marginRight: '6px'
    }
  }), " Enregistrer SKU")), /*#__PURE__*/React.createElement("div", {
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
      fontWeight: 700
    }
  }, "Catalogue des SKUs Qualifiés (", filteredSKUList.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "input",
    value: skuFilterClassif,
    onChange: e => setSkuFilterClassif(e.target.value),
    style: {
      height: '34px',
      fontSize: '12px',
      width: '190px',
      borderRadius: '6px',
      border: skuFilterClassif ? '1.5px solid var(--primary)' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Toutes les classifications"), /*#__PURE__*/React.createElement("option", {
    value: "Gagnant"
  }, "🏆 Produit Gagnant"), /*#__PURE__*/React.createElement("option", {
    value: "Nouveau produit"
  }, "✨ Nouveau produit"), /*#__PURE__*/React.createElement("option", {
    value: "À retester"
  }, "🔄 À retester"), /*#__PURE__*/React.createElement("option", {
    value: "Écarté"
  }, "🚫 Écarté")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "input",
    value: skuSearchTerm,
    onChange: e => setSkuSearchTerm(e.target.value),
    placeholder: "🔍 Filtrer les SKUs...",
    style: {
      width: '200px',
      height: '34px',
      fontSize: '12px'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "table-container",
    style: {
      maxHeight: '300px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Code SKU"), /*#__PURE__*/React.createElement("th", null, "Classification"), /*#__PURE__*/React.createElement("th", null, "Publications"), /*#__PURE__*/React.createElement("th", null, "Ventes"), /*#__PURE__*/React.createElement("th", null, "Score Cumulé"))), /*#__PURE__*/React.createElement("tbody", null, filteredSKUList.length > 0 ? filteredSKUList.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.sku
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--primary)'
    }
  }, s.sku)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `badge ${s.classification === 'Gagnant' ? 'badge-gagnant' : s.classification === 'Écarté' ? 'badge-ecarte' : s.classification === 'Nouveau produit' ? 'badge-nouveau' : 'badge-retester'}`
  }, s.classification)), /*#__PURE__*/React.createElement("td", null, s.pubs, " pub", s.pubs > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.ventes), " vente", s.ventes > 1 ? 's' : ''), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.scoreCumule.toFixed(1), " pts")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "5",
    style: {
      textAlign: 'center',
      padding: '20px',
      color: 'var(--text-muted)'
    }
  }, "Aucun SKU enregistré dans la base.")))))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "🏆 Top 10 SKU par Score Cumulé"), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "#"), /*#__PURE__*/React.createElement("th", null, "SKU"), /*#__PURE__*/React.createElement("th", null, "Pubs"), /*#__PURE__*/React.createElement("th", null, "Ventes"), /*#__PURE__*/React.createElement("th", null, "Score Cumulé"))), /*#__PURE__*/React.createElement("tbody", null, topSKUs.length > 0 ? topSKUs.map((s, idx) => /*#__PURE__*/React.createElement("tr", {
    key: s.sku
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, idx + 1)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, s.sku)), /*#__PURE__*/React.createElement("td", null, s.pubs), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, s.ventes)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gagnant"
  }, s.scoreCumule.toFixed(1), " pts")))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "5",
    style: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '16px'
    }
  }, "Données insuffisantes.")))))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title"
  }, "⏰ Créneaux Horaires Optimaux"), /*#__PURE__*/React.createElement("div", {
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
  }, "Données insuffisantes."))))))));
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
  }, "⭐ Moteur de Repost Gagnant 1-Clic"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginBottom: '20px'
    }
  }, "Les produits identifiés comme ", /*#__PURE__*/React.createElement("b", null, "Gagnants"), " sur un compte peuvent être automatiquement répliqués sur l'ensemble de la flotte de comptes actifs."), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SKU Gagnant"), /*#__PURE__*/React.createElement("th", null, "Score"), /*#__PURE__*/React.createElement("th", null, "Comptes Actuellement Publiés"), /*#__PURE__*/React.createElement("th", null, "Action de Propagation"))), /*#__PURE__*/React.createElement("tbody", null, winnerSKUs.length > 0 ? winnerSKUs.map(w => /*#__PURE__*/React.createElement("tr", {
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
  }, "Journal d'Activité & Traçabilité (Audit Logs)"), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Horodatage"), /*#__PURE__*/React.createElement("th", null, "Action"), /*#__PURE__*/React.createElement("th", null, "Détails"), /*#__PURE__*/React.createElement("th", null, "Résultat"))), /*#__PURE__*/React.createElement("tbody", null, journal.length > 0 ? journal.map(j => /*#__PURE__*/React.createElement("tr", {
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
  }, "Aucune entrée dans le journal d'activité.")))))));
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
  }, "Historique chiffré (AES-256) des éléments modifiés et supprimés. Restauration en un clic.")), /*#__PURE__*/React.createElement("div", {
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
  }, "Entité :"), /*#__PURE__*/React.createElement("select", {
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
  }, "Toutes les entités"), /*#__PURE__*/React.createElement("option", {
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
  }), /*#__PURE__*/React.createElement("h3", null, "Aucun élément dans la corbeille"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '6px',
      fontSize: '14px'
    }
  }, "Les éléments modifiés ou supprimés apparaîtront ici avec leurs sauvegardes chiffrées.")) : /*#__PURE__*/React.createElement("div", {
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
  }, "Élément"), /*#__PURE__*/React.createElement("th", {
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
      title: "Restaurer cet élément vers sa table d'origine",
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
      title: "Supprimer définitivement de la corbeille",
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
    }, "🔒 Raw Ciphertext (Payload Chiffré en Base) :"), /*#__PURE__*/React.createElement("pre", {
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
    }, "🔓 JSON Original Déchiffré :"), /*#__PURE__*/React.createElement("pre", {
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

// Export global React components
window.ReactComponents = {
  Toast,
  Sidebar,
  DashboardView,
  ComptesView,
  PlanningView,
  IncidentsView,
  ParametresView,
  UtilisateursView,
  OrganisationsView,
  ClassementView,
  GagnantsView,
  JournalView,
  CorbeilleView,
  LoginView
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
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('vinted_timezone') || 'FR');
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    isError: false
  });
  const [loginError, setLoginError] = useState('');
  const handleSwitchTZ = tz => {
    setTimeZone(tz);
    localStorage.setItem('vinted_timezone', tz);
  };
  const [appState, setAppState] = useState({
    organisations: [],
    parametres: {},
    utilisateurs: [],
    comptes: [],
    calendrier: [],
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
  const handleUpdateRow = async (id, fields) => {
    try {
      // Chercher la ligne avant mise à jour pour détecter le passage à vente=1
      const existingRow = appState.calendrier.find(l => l.id === id);
      await API.updateCalendrierRow(id, fields);

      // Si on vient de marquer une VENTE (passage de 0 → 1), créer un créneau de republication
      if (fields.vente === 1 && existingRow && existingRow.vente !== 1) {
        try {
          // Date de repub = même jour que la vente
          const repubDate = existingRow.date || new Date().toISOString().split('T')[0];

          // Heure de repub = heure originale + 20 à 30 min aléatoire
          let repubHeure = '12:00';
          try {
            const [h, m] = (existingRow.heurePrevue || '12:00').split(':').map(Number);
            const delayMin = 20 + Math.floor(Math.random() * 11); // 20..30 min
            const totalMin = h * 60 + m + delayMin;
            const newH = Math.floor(totalMin / 60) % 24;
            const newM = totalMin % 60;
            repubHeure = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
          } catch (e) {
            repubHeure = '12:30';
          }
          const newRepubRow = {
            date: repubDate,
            compteId: existingRow.compteId || '',
            agent: existingRow.agent || '',
            heurePrevue: repubHeure,
            sku: existingRow.sku || '',
            statut: 'Non fait',
            vente: 0,
            vues: 0,
            favoris: 0,
            score: 0,
            notes: `Repub auto après vente du ${existingRow.date || '?'}`,
            organisationId: currentOrgId
          };
          await API.createCalendrierRow(newRepubRow);
          showToast(`💰 Vente enregistrée ! Créneau de repub ajouté pour le ${repubDate} à ${repubHeure}`);
        } catch (repErr) {
          showToast('Vente enregistrée (erreur création repub automatique)', true);
        }
      }
      await loadData();
    } catch (err) {
      showToast("Erreur de mise à jour de la ligne", true);
    }
  };
  const handleDeleteRow = async id => {
    if (!confirm("Voulez-vous vraiment supprimer cette ligne ?")) return;
    try {
      await API.deleteCalendrierRow(id);
      showToast("Ligne supprimée du calendrier");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression", true);
    }
  };
  const handleAddRow = async () => {
    const activeCompte = appState.comptes.find(c => c.statut === 'Actif');
    if (!activeCompte) {
      showToast("Aucun compte actif trouvé pour créer une ligne", true);
      return;
    }
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await API.createCalendrierRow({
        date: todayStr,
        jour: 'Aujourd\'hui',
        compteId: activeCompte.id,
        agent: activeCompte.agent,
        heurePrevue: '12:00',
        organisationId: currentOrgId
      });
      showToast("Nouvelle ligne ajoutée au calendrier");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'ajout de ligne", true);
    }
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
  const handleGeneratePlanning = async (dateDebut, dateFin, creneauxParJour, heureDebut, heureFin, selectedAgents) => {
    try {
      const res = await API.generatePlanning(dateDebut, dateFin, creneauxParJour, heureDebut, heureFin, selectedAgents, currentOrgId);
      showToast(res.message || "Planning généré avec succès");
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la génération du planning: " + err.message, true);
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
  const handleBulkUpdateCalendrier = async (ids, fields) => {
    try {
      await API.bulkUpdateCalendrier(ids, fields);
      showToast(`${ids.length} ligne(s) mise(s) à jour en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la mise à jour en masse", true);
    }
  };
  const handleBulkDeleteCalendrier = async ids => {
    try {
      await API.bulkDeleteCalendrier(ids);
      showToast(`${ids.length} ligne(s) supprimée(s) en masse !`);
      await loadData();
    } catch (err) {
      showToast("Erreur lors de la suppression en masse", true);
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
  const handleSaveUser = async userData => {
    try {
      const finalData = {
        ...userData
      };
      // Restriction Cadre : Cadres can ONLY create agent profiles for their own organisation
      if (currentUser && currentUser.role !== 'admin') {
        finalData.role = 'agent';
        finalData.organisationId = currentUser.organisationId || 'org_default';
      }
      if (finalData.id) {
        await API.updateUtilisateur(finalData.id, finalData);
        showToast("Profil utilisateur mis à jour");
      } else {
        await API.createUtilisateur({
          ...finalData,
          organisationId: finalData.organisationId || currentOrgId
        });
        showToast("Profil agent créé avec succès");
      }
      await loadData();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement utilisateur", true);
    }
  };
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
  }, /*#__PURE__*/React.createElement("div", {
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
  }, "🇫🇷 FR (UTC+2)"), /*#__PURE__*/React.createElement("button", {
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
  }, "🇲🇬 MADA (UTC+3)")), currentUser && currentUser.role === 'admin' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm",
    onClick: handleExportJSON,
    title: "Exporter la base de données en JSON"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-download"
  }), " Exporter JSON"), /*#__PURE__*/React.createElement("label", {
    className: "btn btn-secondary btn-sm",
    style: {
      cursor: 'pointer',
      margin: 0
    },
    title: "Importer la base de données depuis un fichier JSON"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-file-import"
  }), " Importer JSON", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: handleImportJSON,
    style: {
      display: 'none'
    }
  })))), activeView === 'dashboard' && /*#__PURE__*/React.createElement(DashboardView, {
    appState: appState,
    currentUser: currentUser,
    selectedTZ: timeZone,
    onUpdateRow: handleUpdateRow,
    onDeleteRow: handleDeleteRow,
    onAddRowClick: handleAddRow,
    onBulkUpdateCalendrier: handleBulkUpdateCalendrier,
    onBulkDeleteCalendrier: handleBulkDeleteCalendrier
  }), activeView === 'comptes' && /*#__PURE__*/React.createElement(ComptesView, {
    currentUser: currentUser,
    appState: appState,
    onSaveCompte: handleSaveCompte,
    onDeleteCompte: handleDeleteCompte,
    onBulkUpdateComptes: handleBulkUpdateComptes,
    onBulkDeleteComptes: handleBulkDeleteComptes,
    onOpenQuickAgentModal: () => setActiveView('utilisateurs')
  }), activeView === 'planning' && /*#__PURE__*/React.createElement(PlanningView, {
    appState: appState,
    onGeneratePlanning: handleGeneratePlanning
  }), activeView === 'incidents' && /*#__PURE__*/React.createElement(IncidentsView, {
    appState: appState,
    onSaveIncident: handleSaveIncident,
    onBulkDeleteIncidents: handleBulkDeleteIncidents
  }), activeView === 'parametres' && /*#__PURE__*/React.createElement(ParametresView, {
    appState: appState,
    onSaveParametres: handleSaveParametres
  }), activeView === 'utilisateurs' && /*#__PURE__*/React.createElement(UtilisateursView, {
    currentUser: currentUser,
    appState: appState,
    onSaveUser: handleSaveUser,
    onDeleteUser: handleDeleteUser,
    onBulkDeleteUsers: handleBulkDeleteUsers
  }), activeView === 'organisations' && /*#__PURE__*/React.createElement(OrganisationsView, {
    appState: appState,
    onSaveOrg: handleSaveOrg,
    onDeleteOrg: handleDeleteOrg
  }), activeView === 'classement' && /*#__PURE__*/React.createElement(ClassementView, {
    appState: appState
  }), activeView === 'gagnants' && /*#__PURE__*/React.createElement(GagnantsView, {
    appState: appState,
    onPublishWinner: handlePublishWinner
  }), activeView === 'journal' && /*#__PURE__*/React.createElement(JournalView, {
    appState: appState
  }), activeView === 'corbeille' && /*#__PURE__*/React.createElement(CorbeilleView, {
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