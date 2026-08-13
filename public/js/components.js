import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
// ============================================================
// REACT COMPONENTS - VINTED MANAGER
// ============================================================

const {
  useState,
  useEffect,
  useMemo
} = React;

// ------------------- TOAST NOTIFICATION -------------------
function Toast({
  toast
}) {
  if (!toast || !toast.visible) return null;
  return /*#__PURE__*/_jsxDEV("div", {
    className: `toast ${toast.isError ? 'toast-error' : ''}`,
    style: {
      display: 'block'
    },
    children: [/*#__PURE__*/_jsxDEV("i", {
      className: `fa-solid ${toast.isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`,
      style: {
        marginRight: '8px'
      }
    }, void 0, false), toast.message]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("aside", {
    className: `sidebar ${isOpen ? 'open' : ''}`,
    id: "sidebar",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "brand-header",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "brand-logo",
        children: "V"
      }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
        children: "Vinted Manager"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "user-role-widget",
      style: {
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        margin: '10px 12px',
        border: '1px solid rgba(255,255,255,0.1)'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          marginBottom: '4px'
        },
        children: "Utilisateur Connecté"
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text-main)',
          marginBottom: '2px'
        },
        children: currentUser.nom || 'Utilisateur'
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        children: currentUser.email || ''
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "badge",
          style: {
            background: currentUser.role === 'admin' ? '#9333ea' : currentUser.role === 'cadre' ? '#0284c7' : '#16a34a',
            color: 'white',
            fontSize: '11px',
            padding: '2px 8px'
          },
          children: currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'cadre' ? 'Admin' : 'Agent'
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-danger btn-sm",
          onClick: onLogout,
          title: "Se déconnecter",
          style: {
            padding: '3px 8px',
            fontSize: '11px'
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-right-from-bracket"
          }, void 0, false), " Déconnexion"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), isAdmin && /*#__PURE__*/_jsxDEV("div", {
      id: "orgSelectorWidget",
      style: {
        padding: '10px 14px',
        background: 'rgba(9, 177, 186, 0.04)',
        borderRadius: '8px',
        margin: '0 12px 14px 12px',
        border: '1px solid rgba(9, 177, 186, 0.15)'
      },
      children: [/*#__PURE__*/_jsxDEV("label", {
        style: {
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          display: 'block',
          marginBottom: '4px'
        },
        children: "🏢 Organisation Active"
      }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
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
        },
        children: (organisations || []).map(o => /*#__PURE__*/_jsxDEV("option", {
          value: o.id,
          children: o.nom
        }, o.id, false))
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("nav", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
      },
      children: [/*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'dashboard' ? 'active' : ''}`,
        onClick: () => onSelectView('dashboard'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-calendar-days"
        }, void 0, false), " Calendrier"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'comptes' ? 'active' : ''}`,
        onClick: () => onSelectView('comptes'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-store"
        }, void 0, false), " Comptes"]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'planning' ? 'active' : ''}`,
        onClick: () => onSelectView('planning'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-wand-magic-sparkles"
        }, void 0, false), " Génération"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'classement' ? 'active' : ''}`,
        onClick: () => onSelectView('classement'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-trophy"
        }, void 0, false), " Classement"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'gagnants' ? 'active' : ''}`,
        onClick: () => onSelectView('gagnants'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-lightbulb"
        }, void 0, false), " Suggestions"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'incidents' ? 'active' : ''}`,
        onClick: () => onSelectView('incidents'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-triangle-exclamation"
        }, void 0, false), " Incidents"]
      }, void 0, true), isAdmin && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'organisations' ? 'active' : ''}`,
        onClick: () => onSelectView('organisations'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-sitemap"
        }, void 0, false), " Organisations"]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'utilisateurs' ? 'active' : ''}`,
        onClick: () => onSelectView('utilisateurs'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-users-gear"
        }, void 0, false), " Utilisateurs"]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'corbeille' ? 'active' : ''}`,
        onClick: () => onSelectView('corbeille'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-trash-can"
        }, void 0, false), " Corbeille", corbeilleCount > 0 && /*#__PURE__*/_jsxDEV("span", {
          className: "badge",
          style: {
            marginLeft: 'auto',
            background: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '10px'
          },
          children: corbeilleCount
        }, void 0, false)]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'parametres' ? 'active' : ''}`,
        onClick: () => onSelectView('parametres'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-sliders"
        }, void 0, false), " Paramètres"]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("button", {
        className: `nav-btn ${activeView === 'journal' ? 'active' : ''}`,
        onClick: () => onSelectView('journal'),
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-clock-rotate-left"
        }, void 0, false), " Journal"]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "header-actions",
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("h2", {
          className: "page-title",
          children: "Tableau de Bord & Calendrier"
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          style: {
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          },
          children: "Suivi temps réel des publications, scores et réinterventions"
        }, void 0, false)]
      }, void 0, true), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '10px'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary",
          onClick: async () => {
            if (window.loadAppState) await window.loadAppState();
            if (window.showToast) window.showToast("Données rafraîchies !");
          },
          title: "Rafraîchir les données",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-rotate-right"
          }, void 0, false), " Rafraîchir"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary",
          onClick: handleCleanEmptySKUs,
          style: {
            color: 'var(--danger)',
            borderColor: '#fca5a5'
          },
          title: "Supprimer toutes les lignes sans SKU",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-broom"
          }, void 0, false), " Nettoyer (sans SKU)"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-primary",
          onClick: onAddRowClick,
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-plus"
          }, void 0, false), " Ajouter une ligne"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "metrics-grid",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "metric-card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "metric-icon teal",
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-calendar-check"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "metric-info",
          children: [/*#__PURE__*/_jsxDEV("h4", {
            children: "PUBLICATIONS FAITES"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "value",
            children: [pubsFaite, " / ", totalPubs]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "metric-card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "metric-icon green",
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-bag-shopping"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "metric-info",
          children: [/*#__PURE__*/_jsxDEV("h4", {
            children: "VENTES TOTALES"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "value",
            children: totalVentes
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "metric-card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "metric-icon blue",
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-star"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "metric-info",
          children: [/*#__PURE__*/_jsxDEV("h4", {
            children: "SCORE MOYEN"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "value",
            children: avgScore
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "metric-card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "metric-icon purple",
          children: /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trophy"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "metric-info",
          children: [/*#__PURE__*/_jsxDEV("h4", {
            children: "PRODUITS GAGNANTS"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "value",
            children: winnersCount
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), isAgent && /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      },
      children: /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
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
            },
            children: /*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-user-check"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("h4", {
              style: {
                margin: 0,
                fontSize: '15px',
                color: '#ffffff',
                fontWeight: 700
              },
              children: ["Vos Comptes Vinted Attribués (", comptes.length, ")"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
              style: {
                fontSize: '12px',
                color: '#94a3b8'
              },
              children: ["Agent connecté : ", /*#__PURE__*/_jsxDEV("b", {
                style: {
                  color: '#38bdf8'
                },
                children: currentUser.nom || myAgentName
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center'
          },
          children: comptes.length > 0 ? comptes.map(c => /*#__PURE__*/_jsxDEV("div", {
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px'
            },
            children: [/*#__PURE__*/_jsxDEV("span", {
              style: {
                color: '#38bdf8',
                fontWeight: 700
              },
              children: ["N°", c.numeroCompte || '?']
            }, void 0, true), /*#__PURE__*/_jsxDEV("b", {
              style: {
                color: '#ffffff'
              },
              children: c.pseudo
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: `badge ${c.statut === 'Actif' ? 'badge-actif' : c.statut === 'Pause' ? 'badge-pause' : c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'}`,
              style: {
                fontSize: '10.5px',
                padding: '2px 7px'
              },
              children: c.statut
            }, void 0, false)]
          }, c.id, true)) : /*#__PURE__*/_jsxDEV("span", {
            style: {
              fontSize: '13px',
              color: '#cbd5e1',
              fontStyle: 'italic'
            },
            children: "Aucun compte actuellement attribué."
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          marginBottom: '16px',
          position: 'relative',
          width: '100%'
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-magnifying-glass",
          style: {
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--primary)',
            fontSize: '15px'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
        }, void 0, false), searchTerm && /*#__PURE__*/_jsxDEV("button", {
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
          },
          children: "✕"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          id: "compte-multiselect-wrapper",
          style: {
            minWidth: '180px',
            flex: 1,
            position: 'relative'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Compte"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
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
            },
            children: [/*#__PURE__*/_jsxDEV("span", {
              children: filterComptes.length === 0 ? `Tous les comptes (${comptes.length})` : filterComptes.length === 1 ? comptes.find(c => c.id === filterComptes[0])?.pseudo || '1 compte' : `${filterComptes.length} comptes sélectionnés`
            }, void 0, false), /*#__PURE__*/_jsxDEV("i", {
              className: `fa-solid fa-chevron-${showCompteDropdown ? 'up' : 'down'}`,
              style: {
                fontSize: '11px',
                marginLeft: '8px'
              }
            }, void 0, false)]
          }, void 0, true), showCompteDropdown && /*#__PURE__*/_jsxDEV("div", {
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
            },
            children: [/*#__PURE__*/_jsxDEV("div", {
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
              onClick: () => setFilterComptes(filterComptes.length === comptes.length ? [] : comptes.map(c => c.id)),
              children: [/*#__PURE__*/_jsxDEV("input", {
                type: "checkbox",
                readOnly: true,
                checked: filterComptes.length === comptes.length,
                style: {
                  width: '14px',
                  height: '14px'
                }
              }, void 0, false), filterComptes.length === comptes.length ? 'Tout désélectionner' : 'Tout sélectionner']
            }, void 0, true), comptes.map(c => /*#__PURE__*/_jsxDEV("div", {
              style: {
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: filterComptes.includes(c.id) ? 'rgba(9,177,186,0.07)' : 'transparent',
                transition: 'background 0.1s'
              },
              onClick: () => setFilterComptes(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]),
              children: [/*#__PURE__*/_jsxDEV("input", {
                type: "checkbox",
                readOnly: true,
                checked: filterComptes.includes(c.id),
                style: {
                  width: '14px',
                  height: '14px',
                  accentColor: 'var(--primary)'
                }
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontWeight: filterComptes.includes(c.id) ? 600 : 400,
                  color: filterComptes.includes(c.id) ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '13px'
                },
                children: c.pseudo
              }, void 0, false), c.numeroCompte && /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginLeft: 'auto'
                },
                children: ["N°", c.numeroCompte]
              }, void 0, true)]
            }, c.id, true)), filterComptes.length > 0 && /*#__PURE__*/_jsxDEV("div", {
              style: {
                padding: '8px 14px',
                borderTop: '1px solid var(--border)'
              },
              children: /*#__PURE__*/_jsxDEV("button", {
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
                },
                children: "✕ Effacer la sélection"
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            minWidth: '140px',
            flex: 1
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Date"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            type: "date",
            className: "input",
            value: filterDate,
            onChange: e => setFilterDate(e.target.value),
            style: {
              border: filterDate ? '1px solid var(--primary)' : '1px solid var(--border)',
              fontWeight: filterDate ? 700 : 400
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            minWidth: '120px',
            flex: 1
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Heure"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            type: "time",
            className: "input",
            value: filterHeure,
            onChange: e => setFilterHeure(e.target.value),
            style: {
              border: filterHeure ? '1px solid var(--primary)' : '1px solid var(--border)',
              fontWeight: filterHeure ? 700 : 400
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            minWidth: '160px',
            flex: 1
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Agent"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterAgent,
            onChange: e => setFilterAgent(e.target.value),
            disabled: currentUser && currentUser.role === 'agent',
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Tous les agents"
            }, void 0, false), agentsUnique.map(a => /*#__PURE__*/_jsxDEV("option", {
              value: a,
              children: a
            }, a, false))]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            minWidth: '130px',
            flex: 1
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Statut"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterStatut,
            onChange: e => setFilterStatut(e.target.value),
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Tous les statuts"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Non fait",
              children: "Non fait"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Fait",
              children: "Fait"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            minWidth: '140px',
            flex: 1
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Classification"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterClassif,
            onChange: e => setFilterClassif(e.target.value),
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Toutes"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Nouveau produit",
              children: "🆕 Nouveau produit"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "À retester",
              children: "🔄 À retester"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Gagnant",
              children: "🏆 Gagnant"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Écarté",
              children: "❌ Écarté"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), duplicateSkuCount > 0 && /*#__PURE__*/_jsxDEV("div", {
          style: {
            marginTop: '20px'
          },
          children: /*#__PURE__*/_jsxDEV("button", {
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
            title: "Cliquer pour afficher uniquement les lignes avec un SKU en doublon",
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-clone",
              style: {
                color: filterOnlyDuplicates ? '#fff' : '#ea580c'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              children: filterOnlyDuplicates ? '✓ Doublons SKU Filtrés' : `⚠️ ${duplicateSkuCount} SKU${duplicateSkuCount > 1 ? 's' : ''} en doublon`
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false), isAnyFilterActive && /*#__PURE__*/_jsxDEV("div", {
          style: {
            marginTop: '20px'
          },
          children: /*#__PURE__*/_jsxDEV("button", {
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
            title: "Réinitialiser tous les filtres actifs",
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-rotate-left"
            }, void 0, false), " Réinitialiser"]
          }, void 0, true)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), selectedIds.length > 0 && /*#__PURE__*/_jsxDEV("div", {
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
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '13.5px'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          style: {
            backgroundColor: '#09b1ba',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#fff'
          },
          children: ["✓ ", selectedIds.length, " sélectionné", selectedIds.length > 1 ? 's' : '']
        }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
          children: "Actions en masse :"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkStatut('Fait'),
          children: "✓ Marquer Fait"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkStatut('Non fait'),
          children: "⌛ Marquer Non fait"
        }, void 0, false), agentsUnique.length > 0 && /*#__PURE__*/_jsxDEV("select", {
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
          },
          children: [/*#__PURE__*/_jsxDEV("option", {
            value: "",
            children: "👤 Affecter Agent..."
          }, void 0, false), agentsUnique.map(a => /*#__PURE__*/_jsxDEV("option", {
            value: a,
            children: a
          }, a, false))]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          },
          title: "Modifier l'heure prévisionnelle en masse",
          children: [/*#__PURE__*/_jsxDEV("span", {
            style: {
              fontSize: '11px',
              color: '#94a3b8'
            },
            children: "🕐 Heure:"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-danger",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: handleBulkDelete,
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trash",
            style: {
              marginRight: '4px'
            }
          }, void 0, false), " Supprimer (", selectedIds.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-secondary",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => setSelectedIds([]),
          children: "Annuler"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        style: {
          overflowX: 'auto'
        },
        children: /*#__PURE__*/_jsxDEV("table", {
          style: {
            minWidth: '1325px',
            width: '100%',
            tableLayout: 'fixed'
          },
          children: [/*#__PURE__*/_jsxDEV("colgroup", {
            children: [/*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '40px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '100px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '150px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '120px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '180px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '130px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '130px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '110px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '80px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '70px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '70px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '70px'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("col", {
              style: {
                width: '75px'
              }
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                style: {
                  width: '40px',
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: isAllSelected,
                  onChange: toggleSelectAll,
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  },
                  title: "Tout sélectionner / Tout désélectionner"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none'
                },
                onClick: () => handleSort('dateTime'),
                title: "Cliquer pour trier par Date & Heure",
                children: ["Date ", sortField === 'dateTime' ? sortAsc ? '▲' : '▼' : sortField === 'date' ? sortAsc ? '▲' : '▼' : '']
              }, void 0, true), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700,
                  color: 'var(--accent)'
                },
                children: "Compte"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700,
                  color: 'var(--accent)'
                },
                children: "Agent"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none'
                },
                onClick: () => handleSort('heure'),
                title: "Cliquer pour trier par Heure",
                children: ["Heure (", selectedTZ === 'MADA' ? 'Mada UTC+3' : 'FR UTC+2', ") ", sortField === 'heure' && (sortAsc ? '▲' : '▼')]
              }, void 0, true), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700
                },
                children: "SKU"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700
                },
                children: "Classif."
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700
                },
                children: "Statut"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  fontWeight: 700,
                  color: 'var(--success)'
                },
                children: "Vente"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Vues"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Favoris"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Score"
              }, void 0, false), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/_jsxDEV("th", {
                children: "Actions"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: filteredLines.length > 0 ? filteredLines.map(l => /*#__PURE__*/_jsxDEV("tr", {
              style: {
                opacity: l.statut === 'Fait' ? 0.85 : 1,
                backgroundColor: selectedIds.includes(l.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
              },
              children: [/*#__PURE__*/_jsxDEV("td", {
                style: {
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: selectedIds.includes(l.id),
                  onChange: () => toggleSelectRow(l.id),
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("input", {
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
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("select", {
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
                  },
                  children: [/*#__PURE__*/_jsxDEV("option", {
                    value: "",
                    children: "(aucun compte)"
                  }, void 0, false), comptesAll.map(c => /*#__PURE__*/_jsxDEV("option", {
                    value: c.id,
                    children: c.pseudo
                  }, c.id, false))]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("select", {
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
                  },
                  children: [/*#__PURE__*/_jsxDEV("option", {
                    value: "",
                    children: "Sélectionner..."
                  }, void 0, false), agentsUnique.map(a => /*#__PURE__*/_jsxDEV("option", {
                    value: a,
                    children: a
                  }, a, false))]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: (() => {
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
                  return /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    },
                    children: [/*#__PURE__*/_jsxDEV("input", {
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
                    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                      style: {
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        backgroundColor: '#f1f5f9',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      },
                      title: `Heure équivalente (${selectedTZ === 'MADA' ? 'France' : 'Madagascar'})`,
                      children: [otherFlag, " ", otherTime, shiftTag && /*#__PURE__*/_jsxDEV("span", {
                        style: {
                          color: '#d97706',
                          fontWeight: 700,
                          marginLeft: '3px'
                        },
                        children: shiftTag
                      }, void 0, false)]
                    }, void 0, true)]
                  }, void 0, true);
                })()
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: (() => {
                  const sKey = (l.sku || '').trim().toLowerCase();
                  const countSku = skuCounts[sKey] || 0;
                  const isDuplicate = countSku > 1 && l.classification !== 'Gagnant';
                  return /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      position: 'relative'
                    },
                    children: [/*#__PURE__*/_jsxDEV("input", {
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
                    }, void 0, false), isDuplicate && /*#__PURE__*/_jsxDEV("span", {
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
                      title: `Cliquer pour isoler les ${countSku} occurrences de ce SKU (${l.sku})`,
                      children: ["⚠️ x", countSku]
                    }, void 0, true), l.sku && /*#__PURE__*/_jsxDEV("button", {
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
                      },
                      children: /*#__PURE__*/_jsxDEV("i", {
                        className: `fa-solid ${copiedSkuId === l.id ? 'fa-check' : 'fa-copy'}`,
                        style: {
                          color: copiedSkuId === l.id ? '#059669' : 'inherit'
                        }
                      }, void 0, false)
                    }, void 0, false)]
                  }, void 0, true);
                })()
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: l.sku && String(l.sku).trim() !== '' ? /*#__PURE__*/_jsxDEV("span", {
                  className: `badge ${l.classification === 'Gagnant' ? 'badge-gagnant' : l.classification === 'Écarté' ? 'badge-ecarte' : l.classification === 'Nouveau produit' ? 'badge-nouveau' : 'badge-retester'}`,
                  children: l.classification || 'Nouveau produit'
                }, void 0, false) : /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  },
                  children: "-"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("button", {
                  className: `btn btn-sm ${l.statut === 'Fait' ? 'btn-success' : 'btn-danger'}`,
                  onClick: () => onUpdateRow(l.id, {
                    statut: l.statut === 'Fait' ? 'Non fait' : 'Fait'
                  }),
                  children: l.statut === 'Fait' ? '✓ Fait' : '⌛ Non fait'
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                style: {
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("button", {
                    className: `btn btn-sm ${l.vente === 1 ? 'btn-success' : 'btn-secondary'}`,
                    onClick: () => onUpdateRow(l.id, {
                      vente: l.vente === 1 ? 0 : 1
                    }),
                    children: l.vente === 1 ? '💰 Oui' : 'Non'
                  }, void 0, false), l.sku && skuVentesMap[l.sku] > 0 && /*#__PURE__*/_jsxDEV("span", {
                    style: {
                      fontSize: '10px',
                      color: skuVentesMap[l.sku] >= 3 ? '#059669' : 'var(--text-muted)',
                      fontWeight: 700,
                      background: skuVentesMap[l.sku] >= 3 ? 'rgba(5,150,105,0.1)' : '#f1f5f9',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      whiteSpace: 'nowrap'
                    },
                    title: `Ce SKU a été vendu ${skuVentesMap[l.sku]}x dans l'organisation`,
                    children: [skuVentesMap[l.sku], "x ce SKU"]
                  }, void 0, true)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "number",
                  className: "input-table",
                  style: {
                    width: '60px'
                  },
                  value: l.vues || 0,
                  onChange: e => onUpdateRow(l.id, {
                    vues: parseInt(e.target.value) || 0
                  })
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "number",
                  className: "input-table",
                  style: {
                    width: '60px'
                  },
                  value: l.favoris || 0,
                  onChange: e => onUpdateRow(l.id, {
                    favoris: parseInt(e.target.value) || 0
                  })
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("b", {
                  children: (l.score || 0).toFixed(1)
                }, void 0, false)
              }, void 0, false), currentUser && currentUser.role !== 'agent' && /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("button", {
                  className: "btn btn-danger btn-sm",
                  title: "Supprimer",
                  onClick: () => onDeleteRow(l.id),
                  children: /*#__PURE__*/_jsxDEV("i", {
                    className: "fa-solid fa-trash"
                  }, void 0, false)
                }, void 0, false)
              }, void 0, false)]
            }, l.id, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "13",
                style: {
                  textAlign: 'center',
                  padding: '30px',
                  color: 'var(--text-muted)'
                },
                children: "Aucune ligne de calendrier trouvée pour ces filtres."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "header-actions",
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("h2", {
          className: "page-title",
          children: "Gestion des Comptes Vinted"
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          style: {
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          },
          children: isCadre ? "Gérez les comptes Vinted (N°, pseudo, tél, email, mot de passe, géré par, statut et date)" : "Consultez les détails et identifiants de vos comptes attribués"
        }, void 0, false)]
      }, void 0, true), isCadre && /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        },
        children: /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary",
          onClick: () => setShowTextModal(true),
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-file-import"
          }, void 0, false), " Importer par Texte"]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true), showTextModal && /*#__PURE__*/_jsxDEV("div", {
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
      },
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "modal-content card",
        style: {
          maxWidth: '650px',
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px'
        },
        children: [/*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          style: {
            marginBottom: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-paste",
            style: {
              color: 'var(--primary)',
              marginRight: '8px'
            }
          }, void 0, false), "Importation Rapide de Comptes en Masse (Format Texte)"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
          style: {
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '16px'
          },
          children: "Collez simplement votre liste de comptes au format brut (N°, Pseudo, Téléphone, Email, Mot de passe, Initiales, Statut & Date). Le système va tout déduire et créer automatiquement les comptes !"
        }, void 0, false), /*#__PURE__*/_jsxDEV("textarea", {
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
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-secondary",
            onClick: () => setShowTextModal(false),
            children: "Annuler"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-primary",
            onClick: handleParseAndImportText,
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-rocket"
            }, void 0, false), " Importer & Enregistrer les Comptes"]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true)
    }, void 0, false), isCadre && /*#__PURE__*/_jsxDEV("div", {
      ref: formRef,
      className: "card",
      style: {
        marginBottom: '24px',
        scrollMarginTop: '20px'
      },
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        },
        children: compteId ? /*#__PURE__*/_jsxDEV(_Fragment, {
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-pen-to-square",
            style: {
              color: 'var(--accent)'
            }
          }, void 0, false), " Modifier le compte ", /*#__PURE__*/_jsxDEV("span", {
            style: {
              color: 'var(--accent)',
              fontWeight: 700
            },
            children: ["#", numeroCompte || compteId]
          }, void 0, true)]
        }, void 0, true) : /*#__PURE__*/_jsxDEV(_Fragment, {
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-plus-circle",
            style: {
              color: 'var(--success)'
            }
          }, void 0, false), " Ajouter un nouveau compte Vinted"]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          style: {
            marginBottom: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "N° Compte (Proxy)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: numeroCompte,
              onChange: e => setNumeroCompte(e.target.value),
              placeholder: "ex: 48"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Pseudo Vinted"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: pseudo,
              onChange: e => setPseudo(e.target.value),
              placeholder: "ex: isis_mlf",
              required: true
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "N° Téléphone"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: telephone,
              onChange: e => setTelephone(e.target.value),
              placeholder: "ex: 06 33 40 86 06"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          style: {
            marginBottom: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Adresse Email"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "email",
              value: email,
              onChange: e => setEmail(e.target.value),
              placeholder: "ex: juyjgj26@gmail.com"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Mot de Passe Vinted"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: motDePasse,
              onChange: e => setMotDePasse(e.target.value),
              placeholder: "ex: Vinted009&*"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Géré par (Initiales)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: gereParInitiales,
              onChange: e => setGereParInitiales(e.target.value),
              placeholder: "ex: TD, EG"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          style: {
            marginBottom: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              },
              children: [/*#__PURE__*/_jsxDEV("label", {
                style: {
                  marginBottom: 0
                },
                children: "Agent Responsable"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-secondary btn-sm",
                onClick: onOpenQuickAgentModal,
                style: {
                  fontSize: '11px',
                  padding: '2px 8px'
                },
                children: [/*#__PURE__*/_jsxDEV("i", {
                  className: "fa-solid fa-user-plus"
                }, void 0, false), " + Créer Agent"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("select", {
              value: agent,
              onChange: e => setAgent(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "",
                children: "À attribuer (Non spécifié)"
              }, void 0, false), agentsList.map(a => /*#__PURE__*/_jsxDEV("option", {
                value: a.agentAssigne || a.nom,
                children: [a.nom, " (", a.agentAssigne || a.role, ")"]
              }, a.id, true))]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Statut du compte"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: statut,
              onChange: e => setStatut(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "Actif",
                children: "Actif"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Pause",
                children: "Pause"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Limité",
                children: "Limité / Restreint"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Banni",
                children: "Banni / Bloqué"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Date du Statut"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: dateStatutCompte,
              onChange: e => setDateStatutCompte(e.target.value),
              placeholder: "ex: 28/07/2026"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-2",
          style: {
            marginBottom: '16px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Organisation"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: isAdmin ? organisationId : userOrgId,
              onChange: e => setOrganisationId(e.target.value),
              disabled: !isAdmin,
              children: organisations.map(o => /*#__PURE__*/_jsxDEV("option", {
                value: o.id,
                children: o.nom
              }, o.id, false))
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Notes & Observations (Adspower, Ventes, etc.)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: notes,
              onChange: e => setNotes(e.target.value),
              placeholder: "ex: connecté à Adspower le 05/08/26, 1 article en vente"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "submit",
            className: "btn btn-primary",
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-floppy-disk"
            }, void 0, false), " Enregistrer le Compte"]
          }, void 0, true), compteId && /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-secondary",
            onClick: handleReset,
            children: "Annuler"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), isCadre && selectedCompteIds.length > 0 && /*#__PURE__*/_jsxDEV("div", {
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
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '13.5px'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          style: {
            backgroundColor: '#09b1ba',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#fff'
          },
          children: ["✓ ", selectedCompteIds.length, " compte", selectedCompteIds.length > 1 ? 's' : '']
        }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
          children: "Actions en masse :"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkCompteStatut('Actif'),
          children: "Statut Actif"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkCompteStatut('Pause'),
          children: "Statut Pause"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkCompteStatut('Limité'),
          children: "Statut Limité"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm",
          style: {
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => handleBulkCompteStatut('Banni'),
          children: "Statut Banni"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-danger",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: handleBulkDeleteComptesAction,
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trash",
            style: {
              marginRight: '4px'
            }
          }, void 0, false), " Supprimer (", selectedCompteIds.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-secondary",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => setSelectedCompteIds([]),
          children: "Annuler"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        },
        children: [/*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          style: {
            margin: 0
          },
          children: ["Liste des Comptes enregistrés (", visibleComptes.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
            width: '100%',
            maxWidth: '750px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            style: {
              position: 'relative',
              flex: 2,
              minWidth: '220px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-magnifying-glass",
              style: {
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary)'
              }
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
            }, void 0, false), searchTermComptes && /*#__PURE__*/_jsxDEV("button", {
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
              },
              children: "✕"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterStatutCompte,
            onChange: e => setFilterStatutCompte(e.target.value),
            style: {
              flex: 1,
              minWidth: '130px',
              height: '38px',
              fontSize: '13px'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Tous statuts"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Actif",
              children: "🟢 Actif"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Pause",
              children: "🟣 Pause"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Limité",
              children: "🟠 Limité"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Banni",
              children: "🔴 Banni"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterAgentCompte,
            onChange: e => setFilterAgentCompte(e.target.value),
            style: {
              flex: 1,
              minWidth: '140px',
              height: '38px',
              fontSize: '13px'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Tous agents"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "À attribuer",
              children: "👤 À attribuer"
            }, void 0, false), agentsList.map(a => /*#__PURE__*/_jsxDEV("option", {
              value: a.agentAssigne || a.nom,
              children: a.nom
            }, a.id, false))]
          }, void 0, true), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: filterGereParCompte,
            onChange: e => setFilterGereParCompte(e.target.value),
            style: {
              flex: 1,
              minWidth: '130px',
              height: '38px',
              fontSize: '13px'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Tous géré par"
            }, void 0, false), gereParList.map(g => /*#__PURE__*/_jsxDEV("option", {
              value: g,
              children: ["🏷️ Géré par : ", g]
            }, g, true))]
          }, void 0, true), (searchTermComptes || filterStatutCompte || filterAgentCompte || filterGereParCompte) && /*#__PURE__*/_jsxDEV("button", {
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
            title: "Réinitialiser les filtres",
            children: "🔄 Effacer"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [isCadre && /*#__PURE__*/_jsxDEV("th", {
                style: {
                  width: '40px',
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: isAllComptesSelected,
                  onChange: toggleSelectAllComptes,
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Statut & Date"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "N° Proxy"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Pseudo"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Géré par"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Agent"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Téléphone"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Email"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Mot de passe"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Notes & Observations"
              }, void 0, false), isCadre && /*#__PURE__*/_jsxDEV("th", {
                children: "Actions"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: visibleComptes.length > 0 ? visibleComptes.map(c => /*#__PURE__*/_jsxDEV("tr", {
              style: {
                backgroundColor: selectedCompteIds.includes(c.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
              },
              children: [isCadre && /*#__PURE__*/_jsxDEV("td", {
                style: {
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: selectedCompteIds.includes(c.id),
                  onChange: () => toggleSelectCompte(c.id),
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: [/*#__PURE__*/_jsxDEV("span", {
                  className: `badge ${c.statut === 'Actif' ? 'badge-actif' : c.statut === 'Pause' ? 'badge-pause' : c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'}`,
                  children: c.statut
                }, void 0, false), c.dateStatutCompte && /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginTop: '2px'
                  },
                  children: c.dateStatutCompte
                }, void 0, false)]
              }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("b", {
                    style: {
                      color: 'var(--primary)'
                    },
                    children: c.numeroCompte || '-'
                  }, void 0, false), c.numeroCompte && /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${copiedField === `${c.id}_num` ? 'fa-check' : 'fa-copy'}`
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("b", {
                    children: c.pseudo
                  }, void 0, false), c.pseudo && /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${copiedField === `${c.id}_pseudo` ? 'fa-check' : 'fa-copy'}`
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: c.gereParInitiales ? /*#__PURE__*/_jsxDEV("span", {
                  className: "badge",
                  style: {
                    backgroundColor: '#475569',
                    color: '#fff'
                  },
                  children: c.gereParInitiales
                }, void 0, false) : '-'
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: c.agent && c.agent !== 'À attribuer' ? /*#__PURE__*/_jsxDEV("span", {
                  className: "badge badge-agent",
                  children: c.agent
                }, void 0, false) : /*#__PURE__*/_jsxDEV("span", {
                  className: "badge",
                  style: {
                    backgroundColor: '#64748b',
                    color: '#fff'
                  },
                  children: "À attribuer"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("span", {
                    children: c.telephone || '-'
                  }, void 0, false), c.telephone && /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${copiedField === `${c.id}_tel` ? 'fa-check' : 'fa-copy'}`
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("span", {
                    style: {
                      fontSize: '12px'
                    },
                    children: c.email || '-'
                  }, void 0, false), c.email && /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${copiedField === `${c.id}_email` ? 'fa-check' : 'fa-copy'}`
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("code", {
                    style: {
                      fontSize: '11px',
                      backgroundColor: '#f1f5f9',
                      padding: '2px 5px',
                      borderRadius: '4px'
                    },
                    children: c.motDePasse || '-'
                  }, void 0, false), c.motDePasse && /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${copiedField === `${c.id}_mp` ? 'fa-check' : 'fa-copy'}`
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                style: {
                  fontSize: '12px',
                  maxWidth: '200px'
                },
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("span", {
                    children: c.notes || '-'
                  }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
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
                    },
                    children: copiedField === `${c.id}_all` ? '✓ Copié !' : '📋 Tout copier'
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), isCadre && /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap'
                  },
                  children: [/*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-primary btn-sm",
                    onClick: () => handleEdit(c),
                    title: "Éditer",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-pen"
                    }, void 0, false)
                  }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-danger btn-sm",
                    onClick: () => onDeleteCompte(c.id),
                    title: "Supprimer",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-trash"
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false)]
            }, c.id, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "11",
                style: {
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                },
                children: "Aucun compte Vinted enregistré."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Générateur Automatique de Planning"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-wand-magic-sparkles",
          style: {
            color: 'var(--primary)',
            marginRight: '8px'
          }
        }, void 0, false), "Génération Anti-Collision Multi-Comptes & Multi-Agents"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
        style: {
          color: 'var(--text-muted)',
          marginBottom: '20px'
        },
        children: ["Le moteur calcule automatiquement la répartition optimale des créneaux horaires pour l'ensemble des ", /*#__PURE__*/_jsxDEV("b", {
          children: [filteredActiveComptes.length, " comptes au statut Actif et attribués à un agent"]
        }, void 0, true), ", en appliquant les règles d'espacement et la marge d'intervalle aléatoire."]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          background: 'rgba(9, 177, 186, 0.04)',
          border: '1px solid rgba(9, 177, 186, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("h4", {
              style: {
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-main)'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-users-gear",
                style: {
                  color: 'var(--primary)'
                }
              }, void 0, false), "Agents Concernés (Gestion Pause / Congé)"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
              style: {
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: 'var(--text-muted)'
              },
              children: ["Décocher un agent le passe en ", /*#__PURE__*/_jsxDEV("b", {
                children: "Pause / Congé"
              }, void 0, false), " pour exclure ses comptes de cette génération de planning. Par défaut, tous les agents sont sélectionnés."]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px'
            },
            children: [/*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: selectAllAgents,
              style: {
                fontSize: '11px',
                padding: '4px 8px'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-check-double",
                style: {
                  marginRight: '4px'
                }
              }, void 0, false), " Tout sélectionner"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: deselectAllAgents,
              style: {
                fontSize: '11px',
                padding: '4px 8px'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-xmark",
                style: {
                  marginRight: '4px'
                }
              }, void 0, false), " Tout décocher"]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          },
          children: availableAgents.length === 0 ? /*#__PURE__*/_jsxDEV("span", {
            style: {
              fontSize: '13px',
              color: 'var(--text-muted)'
            },
            children: "Aucun agent actif trouvé."
          }, void 0, false) : availableAgents.map(agentName => {
            const isSelected = selectedAgents.includes(agentName);
            const agentComptesCount = activeComptes.filter(c => (c.agent || 'À attribuer') === agentName).length;
            return /*#__PURE__*/_jsxDEV("label", {
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
              },
              children: [/*#__PURE__*/_jsxDEV("input", {
                type: "checkbox",
                checked: isSelected,
                onChange: () => toggleAgent(agentName),
                style: {
                  accentColor: 'var(--primary)',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px'
                }
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                children: agentName
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                className: "badge",
                style: {
                  background: isSelected ? 'var(--primary)' : '#94a3b8',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px'
                },
                children: [agentComptesCount, " compte", agentComptesCount > 1 ? 's' : '']
              }, void 0, true), !isSelected && /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontSize: '11px',
                  fontStyle: 'italic',
                  color: '#ef4444',
                  fontWeight: 600
                },
                children: "(Pause / Congé)"
              }, void 0, false)]
            }, agentName, true);
          })
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          background: 'rgba(99, 102, 241, 0.04)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("h4", {
              style: {
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-main)'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-address-book",
                style: {
                  color: '#6366f1'
                }
              }, void 0, false), "Comptes Concernés (", filteredActiveComptes.length, " / ", activeComptes.length, " comptes inclus)"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
              style: {
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: 'var(--text-muted)'
              },
              children: "Cochez ou décochez individuellement les comptes Vinted à inclure ou exclure de la génération du planning."
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px'
            },
            children: [/*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: includeAllAccounts,
              style: {
                fontSize: '11px',
                padding: '4px 8px'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-check-double",
                style: {
                  marginRight: '4px'
                }
              }, void 0, false), " Tout inclure"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: excludeAllAccounts,
              style: {
                fontSize: '11px',
                padding: '4px 8px'
              },
              children: [/*#__PURE__*/_jsxDEV("i", {
                className: "fa-solid fa-xmark",
                style: {
                  marginRight: '4px'
                }
              }, void 0, false), " Tout exclure"]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          },
          children: activeComptes.length === 0 ? /*#__PURE__*/_jsxDEV("span", {
            style: {
              fontSize: '13px',
              color: 'var(--text-muted)'
            },
            children: "Aucun compte actif disponible."
          }, void 0, false) : activeComptes.map(c => {
            const isIncluded = !excludedAccountIds.includes(c.id);
            return /*#__PURE__*/_jsxDEV("label", {
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
              },
              children: [/*#__PURE__*/_jsxDEV("input", {
                type: "checkbox",
                checked: isIncluded,
                onChange: () => toggleAccount(c.id),
                style: {
                  accentColor: '#6366f1',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px'
                }
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                children: [/*#__PURE__*/_jsxDEV("b", {
                  children: ["N°", c.numeroCompte || '?']
                }, void 0, true), " - ", c.pseudo]
              }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
                className: "badge badge-agent",
                style: {
                  fontSize: '10.5px',
                  padding: '1px 6px'
                },
                children: c.agent
              }, void 0, false), !isIncluded && /*#__PURE__*/_jsxDEV("span", {
                style: {
                  fontSize: '11px',
                  fontStyle: 'italic',
                  color: '#ef4444',
                  fontWeight: 600
                },
                children: "(Exclu)"
              }, void 0, false)]
            }, c.id, true);
          })
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "grid-3",
        style: {
          marginBottom: '18px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-calendar-day",
              style: {
                color: 'var(--primary)'
              }
            }, void 0, false), "Date de Début"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
            type: "date",
            value: dateDebut,
            onChange: e => setDateDebut(e.target.value),
            style: {
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px'
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-calendar-check",
              style: {
                color: 'var(--primary)'
              }
            }, void 0, false), "Date de Fin"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
            type: "date",
            value: dateFin,
            min: dateDebut,
            onChange: e => setDateFin(e.target.value),
            style: {
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px'
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-bullhorn",
              style: {
                color: 'var(--primary)'
              }
            }, void 0, false), "Publications / Compte / Jour"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "grid-2",
        style: {
          marginBottom: '18px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-clock",
              style: {
                color: 'var(--primary)'
              }
            }, void 0, false), "Heure de Début des Créneaux"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
            type: "time",
            value: heureDebut,
            onChange: e => setHeureDebut(e.target.value),
            style: {
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px'
            }
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-moon",
              style: {
                color: 'var(--primary)'
              }
            }, void 0, false), "Heure de Fin des Créneaux"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
            type: "time",
            value: heureFin,
            onChange: e => setHeureFin(e.target.value),
            style: {
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px'
            }
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
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
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false), /*#__PURE__*/_jsxDEV("label", {
            htmlFor: "includeWinnerSKUsCheck",
            style: {
              cursor: 'pointer',
              userSelect: 'none',
              margin: 0
            },
            children: [/*#__PURE__*/_jsxDEV("b", {
              style: {
                fontSize: '14px',
                color: includeWinnerSKUs ? '#047857' : 'var(--text-main)',
                display: 'block'
              },
              children: "🏆 Répartir automatiquement les SKU Gagnants (Anti-doublon : 1 SKU par jour max)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              style: {
                fontSize: '12px',
                color: 'var(--text-muted)'
              },
              children: includeWinnerSKUs ? "Activé : Chaque SKU Gagnant est attribué au maximum une fois par jour et sans aucun doublon par compte." : "Désactivé : Le planning sera généré avec des lignes neutres/vierges sans pré-remplissage des SKU Gagnants."
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
          className: `badge ${includeWinnerSKUs ? 'badge-actif' : 'badge-secondary'}`,
          style: {
            padding: '4px 10px',
            fontSize: '12px'
          },
          children: includeWinnerSKUs ? '✓ SKU Gagnants Inclus' : 'Sans SKU Gagnant'
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => setPreset(1),
          children: "Aujourd'hui (1 jour)"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => setPreset(7),
          children: "7 Jours à venir"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => setPreset(14),
          children: "14 Jours à venir"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => setPreset(30),
          children: "30 Jours à venir"
        }, void 0, false)]
      }, void 0, true), totalDays > 0 ? /*#__PURE__*/_jsxDEV("div", {
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
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-calendar-days",
          style: {
            fontSize: '16px'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          children: ["Période : du ", /*#__PURE__*/_jsxDEV("b", {
            children: dateDebut
          }, void 0, false), " au ", /*#__PURE__*/_jsxDEV("b", {
            children: dateFin
          }, void 0, false), " (", totalDays, " jour", totalDays > 1 ? 's' : '', ") —", /*#__PURE__*/_jsxDEV("b", {
            children: [" ", creneauxParJour, " pub", creneauxParJour > 1 ? 's' : '', "/compte/jour"]
          }, void 0, true), " pour ", filteredActiveComptes.length, " compte(s) au statut Actif et attribué(s) à un agent (", selectedAgents.length, " agent(s) sélectionné(s)) (soit ", /*#__PURE__*/_jsxDEV("b", {
            children: [totalEstimatedSlots, " publication", totalEstimatedSlots > 1 ? 's' : '', " au total"]
          }, void 0, true), ")"]
        }, void 0, true)]
      }, void 0, true) : /*#__PURE__*/_jsxDEV("div", {
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: 600
        },
        children: "⚠️ La date de fin doit être égale ou supérieure à la date de début."
      }, void 0, false), filteredActiveComptes.length === 0 && /*#__PURE__*/_jsxDEV("div", {
        style: {
          backgroundColor: '#fffbebf',
          border: '1px solid #fde68a',
          color: '#b45309',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: 600
        },
        children: "⚠️ Aucun compte actif disponible pour la sélection d'agents courante (tous les agents sont décochés ou en pause/congé)."
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-primary",
          onClick: handleGenerate,
          disabled: loading || totalDays <= 0 || filteredActiveComptes.length === 0,
          style: {
            padding: '12px 24px',
            fontSize: '15px'
          },
          children: [loading ? /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-spinner fa-spin",
            style: {
              marginRight: '8px'
            }
          }, void 0, false) : /*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-bolt",
            style: {
              marginRight: '8px'
            }
          }, void 0, false), loading ? 'Génération en cours...' : `Générer le Planning (${totalEstimatedSlots} pub${totalEstimatedSlots > 1 ? 's' : ''})`]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
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
          title: "Supprimer du planning toutes les lignes qui n'ont pas de SKU attribué",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-broom",
            style: {
              marginRight: '6px'
            }
          }, void 0, false), " Nettoyer les lignes sans SKU"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
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
    return c ? c.pseudo : 'Inconnu';
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Gestion des Incidents & Limitations"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      ref: formRef,
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: `fa-solid ${editingIncidentId ? 'fa-pen-to-square' : 'fa-shield-cat'}`,
            style: {
              color: editingIncidentId ? 'var(--primary)' : 'var(--danger)',
              marginRight: '8px'
            }
          }, void 0, false), editingIncidentId ? 'Modifier l\'Incident' : 'Déclarer un Incident Compte']
        }, void 0, true), editingIncidentId && /*#__PURE__*/_jsxDEV("span", {
          className: "badge badge-warning",
          style: {
            fontSize: '12px'
          },
          children: ["Édition Mode : #", editingIncidentId]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Compte Impacté"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: compteId,
              onChange: e => setCompteId(e.target.value),
              required: true,
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "",
                children: "Sélectionner un compte..."
              }, void 0, false), comptes.map(c => /*#__PURE__*/_jsxDEV("option", {
                value: c.id,
                children: [c.pseudo, " (", c.agent, ")"]
              }, c.id, true))]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Type d'Incident"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: type,
              onChange: e => setType(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "Limitation",
                children: "Limitation temporaire"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Ban temporaire",
                children: "Ban temporaire"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Ban définitif",
                children: "Ban définitif"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Annonces masquées",
                children: "Annonces masquées"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Date & Heure du Blocage"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "datetime-local",
              value: dateHeure,
              onChange: e => setDateHeure(e.target.value),
              required: true
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          style: {
            marginTop: '14px'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "Notes & Activités Suspectes (Cause / Actions ayant pu provoquer l'incident)"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            type: "text",
            className: "input",
            value: notesActivites,
            onChange: e => setNotesActivites(e.target.value),
            placeholder: "ex: 5 republications rapides en 10 min, Changement d'IP Proxy Adspower, Message suspect Vinted..."
          }, void 0, false)]
        }, void 0, true), type === 'Annonces masquées' && /*#__PURE__*/_jsxDEV("div", {
          className: "grid-2",
          style: {
            marginTop: '15px',
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px dashed var(--danger)'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Nombre d'Annonces Masquées"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              min: "1",
              value: nbAnnonces,
              onChange: e => setNbAnnonces(e.target.value),
              placeholder: "ex: 5",
              required: true
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "SKU des Annonces Masquées"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: skuAnnonces,
              onChange: e => setSkuAnnonces(e.target.value),
              placeholder: "ex: SKU-101, SKU-102",
              required: true
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            flexWrap: 'wrap'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "submit",
            className: `btn ${editingIncidentId ? 'btn-primary' : 'btn-danger'}`,
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: `fa-solid ${editingIncidentId ? 'fa-floppy-disk' : 'fa-triangle-exclamation'}`,
              style: {
                marginRight: '6px'
              }
            }, void 0, false), editingIncidentId ? 'Mettre à jour l\'incident' : 'Enregistrer l\'incident']
          }, void 0, true), editingIncidentId && /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-secondary",
            onClick: handleResetForm,
            children: "Annuler la modification"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), selectedIncidentIds.length > 0 && /*#__PURE__*/_jsxDEV("div", {
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
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '13.5px'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          style: {
            backgroundColor: '#09b1ba',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#fff'
          },
          children: ["✓ ", selectedIncidentIds.length, " incident", selectedIncidentIds.length > 1 ? 's' : '']
        }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
          children: "Actions en masse :"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-danger",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: handleBulkDeleteIncidentsAction,
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trash",
            style: {
              marginRight: '4px'
            }
          }, void 0, false), " Supprimer (", selectedIncidentIds.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-secondary",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => setSelectedIncidentIds([]),
          children: "Annuler"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: "Historique des Incidents"
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                style: {
                  width: '40px',
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: isAllIncidentsSelected,
                  onChange: toggleSelectAllIncidents,
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Date & Heure"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Compte"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Type"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Pubs 24h Précédentes"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Détail Ventes / Annonces"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Cause Suspectée / Activités"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                style: {
                  width: '110px',
                  textAlign: 'center'
                },
                children: "Actions"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: incidents.length > 0 ? incidents.map(inc => {
              const isAnnoncesMasquees = inc.type === 'Annonces masquées';
              const badgeClass = isAnnoncesMasquees ? 'badge-warning' : inc.type === 'Ban définitif' ? 'badge-banni' : 'badge-limite';
              const detailsCol = isAnnoncesMasquees ? `🙈 ${inc.nbAnnoncesMasquees || 0} annonces (SKU: ${inc.skuAnnoncesMasquees || 'Non renseigné'})` : `${inc.nbVentesConnues || 0} ventes (${(inc.detailVentes || []).join(', ')})`;
              const isCurrentlyEditing = inc.id === editingIncidentId;
              return /*#__PURE__*/_jsxDEV("tr", {
                style: {
                  backgroundColor: isCurrentlyEditing ? 'rgba(99, 102, 241, 0.12)' : selectedIncidentIds.includes(inc.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
                },
                children: [/*#__PURE__*/_jsxDEV("td", {
                  style: {
                    textAlign: 'center'
                  },
                  children: /*#__PURE__*/_jsxDEV("input", {
                    type: "checkbox",
                    checked: selectedIncidentIds.includes(inc.id),
                    onChange: () => toggleSelectIncident(inc.id),
                    style: {
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: [/*#__PURE__*/_jsxDEV("b", {
                    children: inc.dateBlocage
                  }, void 0, false), " ", inc.heureBlocage]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("span", {
                    className: "badge badge-compte",
                    children: getComptePseudo(inc.compteId)
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("span", {
                    className: `badge ${badgeClass}`,
                    children: inc.type
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: [/*#__PURE__*/_jsxDEV("b", {
                    children: inc.nbPubs24h
                  }, void 0, false), " pubs"]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  children: detailsCol
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: inc.notesActivites ? /*#__PURE__*/_jsxDEV("span", {
                    style: {
                      fontSize: '12px',
                      color: '#334155',
                      fontWeight: 500
                    },
                    children: ["📝 ", inc.notesActivites]
                  }, void 0, true) : /*#__PURE__*/_jsxDEV("span", {
                    style: {
                      fontSize: '11px',
                      color: '#94a3b8'
                    },
                    children: "-"
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    textAlign: 'center'
                  },
                  children: /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      display: 'inline-flex',
                      gap: '6px'
                    },
                    children: [/*#__PURE__*/_jsxDEV("button", {
                      type: "button",
                      className: "btn btn-primary btn-sm",
                      style: {
                        padding: '4px 8px',
                        fontSize: '11px'
                      },
                      onClick: () => handleEditIncident(inc),
                      title: "Éditer les détails de cet incident",
                      children: /*#__PURE__*/_jsxDEV("i", {
                        className: "fa-solid fa-pen"
                      }, void 0, false)
                    }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
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
                      title: "Supprimer cet incident",
                      children: /*#__PURE__*/_jsxDEV("i", {
                        className: "fa-solid fa-trash"
                      }, void 0, false)
                    }, void 0, false)]
                  }, void 0, true)
                }, void 0, false)]
              }, inc.id, true);
            }) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "8",
                style: {
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                },
                children: "Aucun incident enregistré."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Paramètres Métier & Algorithmes"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          children: "⚙️ Mode de Planification & Décalage Horaire des Publications"
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          style: {
            marginBottom: '20px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Mode d'Heure de Publication"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: modePlanif,
              onChange: e => setModePlanif(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "intervalle",
                children: "⏱️ Temps Intervallé (Glissant avec décalage)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "aleatoire",
                children: "🎲 Temps Randomisé (Intervalle aléatoire humanisé)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "fixe",
                children: "📌 Temps Fixe (Heures fixes)"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Décalage Min. entre Comptes (min)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: decalage,
              onChange: e => setDecalage(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Variation / Marge Aléatoire (± min)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: margeAleatoire,
              onChange: e => setMargeAleatoire(e.target.value)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          children: "📊 Pondération du Score & Seuils de Classification"
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-2",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Poids : Vues"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              step: "0.1",
              value: poidsVues,
              onChange: e => setPoidsVues(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Poids : Favoris"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              step: "0.1",
              value: poidsFavoris,
              onChange: e => setPoidsFavoris(e.target.value)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-2",
          children: /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Poids : Vente Directe"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              step: "0.1",
              value: poidsVente,
              onChange: e => setPoidsVente(e.target.value)
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          style: {
            marginTop: '16px'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Seuil Écarté (<)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: seuilEcarte,
              onChange: e => setSeuilEcarte(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Seuil Gagnant (>=)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: seuilGagnant,
              onChange: e => setSeuilGagnant(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Créneaux / Jour / Compte"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: creneaux,
              onChange: e => setCreneaux(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Délai Prochain Repost (min)"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: delaiRepost,
              onChange: e => setDelaiRepost(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Jours Planning par Défaut"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "number",
              value: joursDefaut,
              onChange: e => setJoursDefaut(e.target.value)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "submit",
          className: "btn btn-primary",
          style: {
            marginTop: '24px',
            width: '100%',
            padding: '12px'
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-floppy-disk",
            style: {
              marginRight: '8px'
            }
          }, void 0, false), "Sauvegarder les Paramètres & Recalculer les Scores"]
        }, void 0, true)]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("div", {
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
    },
    children: /*#__PURE__*/_jsxDEV("div", {
      style: {
        maxWidth: '440px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        borderTop: '6px solid var(--primary-color)',
        margin: 'auto'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          textAlign: 'center',
          marginBottom: '24px'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
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
          },
          children: "V"
        }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
          style: {
            fontSize: '24px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0'
          },
          children: "Vinted Manager"
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          style: {
            fontSize: '13px',
            color: '#64748b',
            margin: 0
          },
          children: "Connectez-vous pour accéder au tableau de bord"
        }, void 0, false)]
      }, void 0, true), loginError && /*#__PURE__*/_jsxDEV("div", {
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
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-circle-exclamation",
          style: {
            fontSize: '18px',
            color: '#ef4444'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          children: loginError
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          style: {
            marginBottom: '16px'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontWeight: 600,
              color: '#334155',
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px'
            },
            children: "Adresse Email ou Nom d'utilisateur"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          style: {
            marginBottom: '22px'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontWeight: 600,
              color: '#334155',
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px'
            },
            children: "Mot de passe"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
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
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-right-to-bracket",
            style: {
              marginRight: '8px'
            }
          }, void 0, false), " Se connecter"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Gestion des Utilisateurs & Agents"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: userId ? 'Modifier l\'agent' : 'Ajouter un nouveau profil Agent'
      }, void 0, false), !isAdmin && /*#__PURE__*/_jsxDEV("p", {
        style: {
          fontSize: '12px',
          color: 'var(--info)',
          marginBottom: '16px',
          background: '#eff6ff',
          padding: '8px 12px',
          borderRadius: '6px'
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-circle-info"
        }, void 0, false), " En tant qu'", /*#__PURE__*/_jsxDEV("strong", {
          children: "Admin"
        }, void 0, false), ", vous pouvez créer uniquement des profils ", /*#__PURE__*/_jsxDEV("strong", {
          children: "Agent de publication"
        }, void 0, false), " pour votre organisation."]
      }, void 0, true), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Nom complet"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: nom,
              onChange: e => setNom(e.target.value),
              placeholder: "ex: Van Quy Dang",
              required: true
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Adresse Email"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "email",
              value: email,
              onChange: e => setEmail(e.target.value),
              placeholder: "ex: vanquydang905@gmail.com",
              required: true
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Rôle"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: isAdmin ? role : 'agent',
              onChange: e => setRole(e.target.value),
              disabled: !isAdmin,
              children: [isAdmin && /*#__PURE__*/_jsxDEV("option", {
                value: "admin",
                children: "Admin (Global)"
              }, void 0, false), isAdmin && /*#__PURE__*/_jsxDEV("option", {
                value: "cadre",
                children: "Admin (Organisation)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "agent",
                children: "Agent de publication"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Organisation"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: isAdmin ? organisationId : userOrgId,
              onChange: e => setOrganisationId(e.target.value),
              disabled: !isAdmin,
              children: organisations.map(o => /*#__PURE__*/_jsxDEV("option", {
                value: o.id,
                children: o.nom
              }, o.id, false))
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Agent Assigné / Code"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: agentAssigne,
              onChange: e => setAgentAssigne(e.target.value),
              placeholder: "Laissez vide pour utiliser le nom"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Mot de passe"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "password",
              value: motDePasse,
              onChange: e => setMotDePasse(e.target.value),
              placeholder: "••••••••",
              required: true
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid-2",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: "Canal de Contact Direct"
            }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
              value: contactType,
              onChange: e => setContactType(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "WhatsApp",
                children: "WhatsApp Messenger / Business"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Signal",
                children: "Signal Private Messenger"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "Telegram",
                children: "Telegram"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "form-group",
            children: [/*#__PURE__*/_jsxDEV("label", {
              children: ["Numéro ou Pseudo (", contactType, ")"]
            }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              value: contactNumero,
              onChange: e => setContactNumero(e.target.value),
              placeholder: contactType === 'Telegram' ? '@mon_pseudo ou +33612345678' : '+33612345678'
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '10px',
            marginTop: '10px'
          },
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "submit",
            className: "btn btn-primary",
            children: [/*#__PURE__*/_jsxDEV("i", {
              className: "fa-solid fa-user-plus"
            }, void 0, false), " Enregistrer l'agent"]
          }, void 0, true), userId && /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-secondary",
            onClick: handleReset,
            children: "Annuler"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), selectedUserIds.length > 0 && /*#__PURE__*/_jsxDEV("div", {
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
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '13.5px'
        },
        children: [/*#__PURE__*/_jsxDEV("span", {
          style: {
            backgroundColor: '#09b1ba',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#fff'
          },
          children: ["✓ ", selectedUserIds.length, " utilisateur", selectedUserIds.length > 1 ? 's' : '']
        }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
          children: "Actions en masse :"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-danger",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: handleBulkDeleteUsersAction,
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trash",
            style: {
              marginRight: '4px'
            }
          }, void 0, false), " Supprimer (", selectedUserIds.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-sm btn-secondary",
          style: {
            padding: '6px 12px',
            fontSize: '12px'
          },
          onClick: () => setSelectedUserIds([]),
          children: "Annuler"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: ["Liste des Utilisateurs / Agents (", visibleUsers.length, ")"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                style: {
                  width: '40px',
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: isAllUsersSelected,
                  onChange: toggleSelectAllUsers,
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Nom"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Email"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Rôle"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Organisation"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Contact Direct"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Agent Assigné"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Date Création"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Actions"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: visibleUsers.length > 0 ? visibleUsers.map(u => /*#__PURE__*/_jsxDEV("tr", {
              style: {
                backgroundColor: selectedUserIds.includes(u.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent'
              },
              children: [/*#__PURE__*/_jsxDEV("td", {
                style: {
                  textAlign: 'center'
                },
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "checkbox",
                  checked: selectedUserIds.includes(u.id),
                  onChange: () => toggleSelectUser(u.id),
                  style: {
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("b", {
                  children: u.nom
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: u.email
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: "badge",
                  style: {
                    background: u.role === 'admin' ? '#9333ea' : u.role === 'cadre' ? '#0284c7' : '#16a34a',
                    color: 'white'
                  },
                  children: u.role === 'admin' ? 'Admin' : u.role === 'cadre' ? 'Admin' : 'Agent'
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: "badge badge-compte",
                  children: (organisations.find(o => o.id === u.organisationId) || {}).nom || u.organisationId || 'Par défaut'
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: u.contactNumero ? /*#__PURE__*/_jsxDEV("a", {
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
                  title: `Ouvrir dans ${u.contactType || 'WhatsApp'}`,
                  children: [/*#__PURE__*/_jsxDEV("i", {
                    className: u.contactType === 'WhatsApp' ? 'fa-brands fa-whatsapp' : u.contactType === 'Telegram' ? 'fa-brands fa-telegram' : 'fa-solid fa-comment-dots'
                  }, void 0, false), u.contactNumero]
                }, void 0, true) : /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    color: 'var(--text-muted)',
                    fontSize: '12px'
                  },
                  children: "-"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: u.agentAssigne || u.nom
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: u.dateCreation || '-'
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'flex',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-primary btn-sm",
                    onClick: () => handleEdit(u),
                    title: "Éditer",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-pen"
                    }, void 0, false)
                  }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-danger btn-sm",
                    onClick: () => onDeleteUser(u.id),
                    title: "Supprimer",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-trash"
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false)]
            }, u.id, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "7",
                style: {
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                },
                children: "Aucun utilisateur trouvé."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Gestion des Organisations Multi-Tenancy"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: orgId ? 'Modifier l\'organisation' : 'Ajouter une nouvelle organisation'
      }, void 0, false), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        style: {
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          style: {
            flex: 1,
            marginBottom: 0
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            children: "Nom de l'organisation"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
            type: "text",
            value: nom,
            onChange: e => setNom(e.target.value),
            placeholder: "ex: Agence Lyon",
            required: true
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "submit",
          className: "btn btn-primary",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-floppy-disk"
          }, void 0, false), " ", orgId ? 'Enregistrer Modification' : 'Créer Organisation']
        }, void 0, true), orgId && /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "btn btn-secondary",
          onClick: handleReset,
          children: "Annuler"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: ["Organisations Actives (", organisations.length, ")"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "Code ID"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Nom de l'organisation"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Date Création"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Actions"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: organisations.map(o => /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("code", {
                  children: o.id
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("b", {
                  children: o.nom
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: o.dateCreation || '-'
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("div", {
                  style: {
                    display: 'flex',
                    gap: '6px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-primary btn-sm",
                    onClick: () => handleEdit(o),
                    title: "Éditer le nom",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-pen"
                    }, void 0, false)
                  }, void 0, false), o.id !== 'org_default' && /*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-danger btn-sm",
                    onClick: () => onDeleteOrg(o.id),
                    title: "Supprimer",
                    children: /*#__PURE__*/_jsxDEV("i", {
                      className: "fa-solid fa-trash"
                    }, void 0, false)
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false)]
            }, o.id, true))
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Classements & Gestion des SKUs"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        marginBottom: '24px'
      },
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-boxes-packing",
          style: {
            color: 'var(--primary)'
          }
        }, void 0, false), "Enregistrement & Répertoire des SKU avec Classification"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
        style: {
          color: 'var(--text-muted)',
          fontSize: '13.5px',
          marginBottom: '16px'
        },
        children: "Enregistrez vos SKU et définissez directement leur classification (Nouveau produit, Gagnant, À retester, Écarté)."
      }, void 0, false), /*#__PURE__*/_jsxDEV("form", {
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
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          style: {
            flex: 2,
            minWidth: '180px'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Code SKU"
          }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            flex: 2,
            minWidth: '180px'
          },
          children: [/*#__PURE__*/_jsxDEV("label", {
            style: {
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '4px',
              display: 'block'
            },
            children: "Classification"
          }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: newClassifInput,
            onChange: e => setNewClassifInput(e.target.value),
            style: {
              height: '40px',
              fontSize: '13px'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "Nouveau produit",
              children: "✨ Nouveau produit"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Gagnant",
              children: "🏆 Gagnant"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "À retester",
              children: "🔄 À retester"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Écarté",
              children: "🚫 Écarté"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "submit",
          className: "btn btn-primary",
          style: {
            height: '40px',
            padding: '0 20px',
            fontSize: '13px'
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-plus",
            style: {
              marginRight: '6px'
            }
          }, void 0, false), " Enregistrer SKU"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '10px'
        },
        children: [/*#__PURE__*/_jsxDEV("h4", {
          style: {
            margin: 0,
            fontSize: '14px',
            fontWeight: 700
          },
          children: ["Catalogue des SKUs Qualifiés (", filteredSKUList.length, ")"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          style: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap'
          },
          children: [/*#__PURE__*/_jsxDEV("select", {
            className: "input",
            value: skuFilterClassif,
            onChange: e => setSkuFilterClassif(e.target.value),
            style: {
              height: '34px',
              fontSize: '12px',
              width: '190px',
              borderRadius: '6px',
              border: skuFilterClassif ? '1.5px solid var(--primary)' : '1px solid var(--border)'
            },
            children: [/*#__PURE__*/_jsxDEV("option", {
              value: "",
              children: "Toutes les classifications"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Gagnant",
              children: "🏆 Produit Gagnant"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Nouveau produit",
              children: "✨ Nouveau produit"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "À retester",
              children: "🔄 À retester"
            }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
              value: "Écarté",
              children: "🚫 Écarté"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
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
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        style: {
          maxHeight: '300px',
          overflowY: 'auto'
        },
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "Code SKU"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Classification"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Publications"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Ventes"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Score Cumulé"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: filteredSKUList.length > 0 ? filteredSKUList.map(s => /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("b", {
                  style: {
                    color: 'var(--primary)'
                  },
                  children: s.sku
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: `badge ${s.classification === 'Gagnant' ? 'badge-gagnant' : s.classification === 'Écarté' ? 'badge-ecarte' : s.classification === 'Nouveau produit' ? 'badge-nouveau' : 'badge-retester'}`,
                  children: s.classification
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: [s.pubs, " pub", s.pubs > 1 ? 's' : '']
              }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                children: [/*#__PURE__*/_jsxDEV("b", {
                  children: s.ventes
                }, void 0, false), " vente", s.ventes > 1 ? 's' : '']
              }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("b", {
                  children: [s.scoreCumule.toFixed(1), " pts"]
                }, void 0, true)
              }, void 0, false)]
            }, s.sku, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "5",
                style: {
                  textAlign: 'center',
                  padding: '20px',
                  color: 'var(--text-muted)'
                },
                children: "Aucun SKU enregistré dans la base."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "grid-2",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [/*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          children: "🏆 Top 10 SKU par Score Cumulé"
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "table-container",
          children: /*#__PURE__*/_jsxDEV("table", {
            children: [/*#__PURE__*/_jsxDEV("thead", {
              children: /*#__PURE__*/_jsxDEV("tr", {
                children: [/*#__PURE__*/_jsxDEV("th", {
                  children: "#"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "SKU"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Pubs"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Ventes"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Score Cumulé"
                }, void 0, false)]
              }, void 0, true)
            }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
              children: topSKUs.length > 0 ? topSKUs.map((s, idx) => /*#__PURE__*/_jsxDEV("tr", {
                children: [/*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: idx + 1
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("code", {
                    children: s.sku
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: s.pubs
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: s.ventes
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("span", {
                    className: "badge badge-gagnant",
                    children: [s.scoreCumule.toFixed(1), " pts"]
                  }, void 0, true)
                }, void 0, false)]
              }, s.sku, true)) : /*#__PURE__*/_jsxDEV("tr", {
                children: /*#__PURE__*/_jsxDEV("td", {
                  colSpan: "5",
                  style: {
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    padding: '16px'
                  },
                  children: "Données insuffisantes."
                }, void 0, false)
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [/*#__PURE__*/_jsxDEV("h3", {
          className: "card-title",
          children: "⏰ Créneaux Horaires Optimaux"
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "table-container",
          children: /*#__PURE__*/_jsxDEV("table", {
            children: [/*#__PURE__*/_jsxDEV("thead", {
              children: /*#__PURE__*/_jsxDEV("tr", {
                children: [/*#__PURE__*/_jsxDEV("th", {
                  children: "Heure"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Pubs"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Ventes"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  children: "Score Moyen"
                }, void 0, false)]
              }, void 0, true)
            }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
              children: topHours.length > 0 ? topHours.map(h => /*#__PURE__*/_jsxDEV("tr", {
                children: [/*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: h.heure
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: h.pubs
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: h.ventes
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: h.scoreMoyen
                  }, void 0, false)
                }, void 0, false)]
              }, h.heure, true)) : /*#__PURE__*/_jsxDEV("tr", {
                children: /*#__PURE__*/_jsxDEV("td", {
                  colSpan: "4",
                  style: {
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    padding: '16px'
                  },
                  children: "Données insuffisantes."
                }, void 0, false)
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Suggestions SKU Gagnants & Propagation"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "card-title",
        children: "⭐ Moteur de Repost Gagnant 1-Clic"
      }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
        style: {
          color: 'var(--text-muted)',
          marginBottom: '20px'
        },
        children: ["Les produits identifiés comme ", /*#__PURE__*/_jsxDEV("b", {
          children: "Gagnants"
        }, void 0, false), " sur un compte peuvent être automatiquement répliqués sur l'ensemble de la flotte de comptes actifs."]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "SKU Gagnant"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Score"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Comptes Actuellement Publiés"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Action de Propagation"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: winnerSKUs.length > 0 ? winnerSKUs.map(w => /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("code", {
                  children: /*#__PURE__*/_jsxDEV("b", {
                    children: w.sku
                  }, void 0, false)
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: "badge badge-gagnant",
                  children: (w.score || 0).toFixed(1)
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: [/*#__PURE__*/_jsxDEV("b", {
                  children: w.comptesPublies.size
                }, void 0, false), " compte(s)"]
              }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("button", {
                  className: "btn btn-primary btn-sm",
                  onClick: () => onPublishWinner(w.sku),
                  children: [/*#__PURE__*/_jsxDEV("i", {
                    className: "fa-solid fa-share-nodes",
                    style: {
                      marginRight: '6px'
                    }
                  }, void 0, false), "Publier sur les autres comptes actifs"]
                }, void 0, true)
              }, void 0, false)]
            }, w.sku, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "4",
                style: {
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                },
                children: "Aucun produit n'a encore atteint le seuil de score \"Gagnant\"."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
}

// ------------------- VIEW: JOURNAL -------------------
function JournalView({
  appState
}) {
  const journal = appState.journal || [];
  return /*#__PURE__*/_jsxDEV("section", {
    className: "view",
    children: [/*#__PURE__*/_jsxDEV("h2", {
      className: "page-title",
      style: {
        marginBottom: '20px'
      },
      children: "Journal d'Activité & Traçabilité (Audit Logs)"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "table-container",
        children: /*#__PURE__*/_jsxDEV("table", {
          children: [/*#__PURE__*/_jsxDEV("thead", {
            children: /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("th", {
                children: "Horodatage"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Action"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Détails"
              }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                children: "Résultat"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
            children: journal.length > 0 ? journal.map(j => /*#__PURE__*/_jsxDEV("tr", {
              children: [/*#__PURE__*/_jsxDEV("td", {
                children: j.horodatage
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: "badge badge-compte",
                  children: j.action
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: j.detail
              }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: `badge ${j.resultat === 'Succès' ? 'badge-actif' : 'badge-limite'}`,
                  children: j.resultat
                }, void 0, false)
              }, void 0, false)]
            }, j.id, true)) : /*#__PURE__*/_jsxDEV("tr", {
              children: /*#__PURE__*/_jsxDEV("td", {
                colSpan: "4",
                style: {
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-muted)'
                },
                children: "Aucune entrée dans le journal d'activité."
              }, void 0, false)
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
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
  return /*#__PURE__*/_jsxDEV("div", {
    className: "view-container",
    children: [/*#__PURE__*/_jsxDEV("header", {
      className: "page-header",
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("h2", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '24px',
            fontWeight: 700
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-trash-can",
            style: {
              color: '#ef4444'
            }
          }, void 0, false), " Corbeille de Sauvegarde & Chiffrement"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
          className: "subtitle",
          style: {
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          },
          children: "Historique chiffré (AES-256) des éléments modifiés et supprimés. Restauration en un clic."
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '10px'
        },
        children: [/*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-secondary",
          onClick: onRefresh,
          title: "Actualiser la corbeille",
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-arrows-rotate"
          }, void 0, false), " Actualiser"]
        }, void 0, true), corbeille.length > 0 && /*#__PURE__*/_jsxDEV("button", {
          className: "btn btn-danger",
          onClick: onEmptyCorbeille,
          style: {
            background: '#dc2626',
            color: '#fff'
          },
          children: [/*#__PURE__*/_jsxDEV("i", {
            className: "fa-solid fa-broom"
          }, void 0, false), " Vider la corbeille (", corbeille.length, ")"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        alignItems: 'center'
      },
      children: [/*#__PURE__*/_jsxDEV("div", {
        style: {
          flex: 1,
          minWidth: '220px',
          position: 'relative'
        },
        children: [/*#__PURE__*/_jsxDEV("i", {
          className: "fa-solid fa-magnifying-glass",
          style: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
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
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        },
        children: [/*#__PURE__*/_jsxDEV("label", {
          style: {
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)'
          },
          children: "Entité :"
        }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
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
          },
          children: [/*#__PURE__*/_jsxDEV("option", {
            value: "ALL",
            children: "Toutes les entités"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "calendrier",
            children: "Calendrier"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "comptes",
            children: "Comptes"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "utilisateurs",
            children: "Utilisateurs"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "organisations",
            children: "Organisations"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "incidents",
            children: "Incidents"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        style: {
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        },
        children: [/*#__PURE__*/_jsxDEV("label", {
          style: {
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)'
          },
          children: "Action :"
        }, void 0, false), /*#__PURE__*/_jsxDEV("select", {
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
          },
          children: [/*#__PURE__*/_jsxDEV("option", {
            value: "ALL",
            children: "Toutes les actions"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "DELETE",
            children: "Suppression"
          }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
            value: "UPDATE",
            children: "Modification"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), filteredList.length === 0 ? /*#__PURE__*/_jsxDEV("div", {
      className: "card",
      style: {
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-muted)'
      },
      children: [/*#__PURE__*/_jsxDEV("i", {
        className: "fa-solid fa-box-open",
        style: {
          fontSize: '48px',
          marginBottom: '16px',
          opacity: 0.5
        }
      }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
        children: "Aucun élément dans la corbeille"
      }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
        style: {
          marginTop: '6px',
          fontSize: '14px'
        },
        children: "Les éléments modifiés ou supprimés apparaîtront ici avec leurs sauvegardes chiffrées."
      }, void 0, false)]
    }, void 0, true) : /*#__PURE__*/_jsxDEV("div", {
      className: "table-responsive card",
      style: {
        padding: 0
      },
      children: /*#__PURE__*/_jsxDEV("table", {
        className: "data-table",
        style: {
          width: '100%',
          borderCollapse: 'collapse'
        },
        children: [/*#__PURE__*/_jsxDEV("thead", {
          children: /*#__PURE__*/_jsxDEV("tr", {
            style: {
              background: 'rgba(0,0,0,0.03)',
              borderBottom: '2px solid var(--border-color)'
            },
            children: [/*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              },
              children: "Date & Heure"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              },
              children: "Action"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              },
              children: "Type"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              },
              children: "Élément"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px'
              },
              children: "Chiffrement JSON"
            }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
              style: {
                padding: '12px 16px',
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px',
                textAlign: 'right'
              },
              children: "Actions"
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
          children: filteredList.map(item => {
            const isExpanded = expandedId === item.id;
            const dateStr = item.dateAction ? new Date(item.dateAction).toLocaleString('fr-FR') : '-';
            const isDelete = item.action === 'DELETE';
            return /*#__PURE__*/_jsxDEV(React.Fragment, {
              children: [/*#__PURE__*/_jsxDEV("tr", {
                style: {
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s'
                },
                children: [/*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  },
                  children: [/*#__PURE__*/_jsxDEV("i", {
                    className: "fa-regular fa-clock",
                    style: {
                      marginRight: '6px',
                      color: 'var(--text-muted)'
                    }
                  }, void 0, false), dateStr]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px'
                  },
                  children: /*#__PURE__*/_jsxDEV("span", {
                    className: "badge",
                    style: {
                      background: isDelete ? '#ef4444' : '#f59e0b',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    },
                    children: isDelete ? 'Suppression' : 'Modification'
                  }, void 0, false)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px',
                    fontSize: '13px'
                  },
                  children: [/*#__PURE__*/_jsxDEV("i", {
                    className: `fa-solid ${getEntityIcon(item.typeEntite)}`,
                    style: {
                      marginRight: '8px',
                      color: 'var(--primary)'
                    }
                  }, void 0, false), getEntityLabel(item.typeEntite)]
                }, void 0, true), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 600
                  },
                  children: item.nomElement || item.idEntite
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px'
                  },
                  children: /*#__PURE__*/_jsxDEV("button", {
                    className: "btn btn-secondary btn-sm",
                    onClick: () => setExpandedId(isExpanded ? null : item.id),
                    style: {
                      padding: '3px 8px',
                      fontSize: '11px',
                      gap: '6px'
                    },
                    children: [/*#__PURE__*/_jsxDEV("i", {
                      className: `fa-solid ${isExpanded ? 'fa-lock-open' : 'fa-lock'}`,
                      style: {
                        color: isExpanded ? '#22c55e' : '#64748b'
                      }
                    }, void 0, false), isExpanded ? 'Masquer détails' : 'AES-256 (Déchiffrer)']
                  }, void 0, true)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  style: {
                    padding: '12px 16px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap'
                  },
                  children: /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'flex-end'
                    },
                    children: [/*#__PURE__*/_jsxDEV("button", {
                      className: "btn btn-primary btn-sm",
                      onClick: () => onRestoreItem(item.id),
                      title: "Restaurer cet élément vers sa table d'origine",
                      style: {
                        padding: '4px 10px',
                        fontSize: '12px',
                        background: '#0284c7'
                      },
                      children: [/*#__PURE__*/_jsxDEV("i", {
                        className: "fa-solid fa-rotate-left"
                      }, void 0, false), " Restaurer"]
                    }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
                      className: "btn btn-danger btn-sm",
                      onClick: () => onDeleteItem(item.id),
                      title: "Supprimer définitivement de la corbeille",
                      style: {
                        padding: '4px 10px',
                        fontSize: '12px'
                      },
                      children: [/*#__PURE__*/_jsxDEV("i", {
                        className: "fa-solid fa-trash"
                      }, void 0, false), " Purger"]
                    }, void 0, true)]
                  }, void 0, true)
                }, void 0, false)]
              }, void 0, true), isExpanded && /*#__PURE__*/_jsxDEV("tr", {
                style: {
                  background: 'rgba(0,0,0,0.02)'
                },
                children: /*#__PURE__*/_jsxDEV("td", {
                  colSpan: "6",
                  style: {
                    padding: '16px',
                    borderBottom: '1px solid var(--border-color)'
                  },
                  children: /*#__PURE__*/_jsxDEV("div", {
                    style: {
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    },
                    children: [/*#__PURE__*/_jsxDEV("div", {
                      children: [/*#__PURE__*/_jsxDEV("div", {
                        style: {
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          marginBottom: '6px',
                          textTransform: 'uppercase'
                        },
                        children: "🔒 Raw Ciphertext (Payload Chiffré en Base) :"
                      }, void 0, false), /*#__PURE__*/_jsxDEV("pre", {
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
                        },
                        children: item.donneesChiffrees
                      }, void 0, false)]
                    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
                      children: [/*#__PURE__*/_jsxDEV("div", {
                        style: {
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#22c55e',
                          marginBottom: '6px',
                          textTransform: 'uppercase'
                        },
                        children: "🔓 JSON Original Déchiffré :"
                      }, void 0, false), /*#__PURE__*/_jsxDEV("pre", {
                        style: {
                          background: '#0f172a',
                          color: '#4ade80',
                          padding: '12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          overflowX: 'auto',
                          maxHeight: '180px'
                        },
                        children: JSON.stringify(item.donneesOriginales || {}, null, 2)
                      }, void 0, false)]
                    }, void 0, true)]
                  }, void 0, true)
                }, void 0, false)
              }, void 0, false)]
            }, item.id, true);
          })
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
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