// ============================================================
// REACT COMPONENTS - VINTED MANAGER
// ============================================================

var { useState, useEffect, useMemo, useCallback } = React;

// ------------------- TOAST NOTIFICATION -------------------
function Toast({ toast }) {
    if (!toast || !toast.visible) return null;
    return (
        <div className={`toast ${toast.isError ? 'toast-error' : ''}`} style={{ display: 'block' }}>
            <i className={`fa-solid ${toast.isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`} style={{ marginRight: '8px' }}></i>
            {toast.message}
        </div>
    );
}

// ------------------- SIDEBAR NAVIGATION -------------------
function Sidebar({ currentUser, currentOrgId, organisations, activeView, onSelectView, onSwitchOrg, onLogout, onExportJSON, onImportJSON, corbeilleCount = 0, isOpen = false }) {
    if (!currentUser) return null;

    const isAdmin = currentUser.role === 'admin';
    const isCadre = currentUser.role === 'cadre' || isAdmin;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
            <div className="brand-header">
                <div className="brand-logo">V</div>
                <h1>Vinted Manager</h1>
            </div>

            {/* Utilisateur Connecté Widget */}
            <div className="user-role-widget" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', margin: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>Utilisateur Connecté</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '2px' }}>{currentUser.nom || 'Utilisateur'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email || ''}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span className="badge" style={{
                        background: currentUser.role === 'admin' ? '#9333ea' : (currentUser.role === 'cadre' ? '#0284c7' : '#16a34a'),
                        color: 'white', fontSize: '11px', padding: '2px 8px'
                    }}>
                        {currentUser.role === 'admin' ? 'Admin' : (currentUser.role === 'cadre' ? 'Admin' : 'Agent')}
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={onLogout} title="Se déconnecter" style={{ padding: '3px 8px', fontSize: '11px' }}>
                        <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
                    </button>
                </div>
            </div>

            {/* Selector Organisation (Seulement pour Admin) */}
            {isAdmin && (
                <div id="orgSelectorWidget" style={{ padding: '10px 14px', background: 'rgba(9, 177, 186, 0.04)', borderRadius: '8px', margin: '0 12px 14px 12px', border: '1px solid rgba(9, 177, 186, 0.15)' }}>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>🏢 Organisation Active</label>
                    <select
                        value={currentOrgId}
                        onChange={(e) => onSwitchOrg(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                        {(organisations || []).map(o => (
                            <option key={o.id} value={o.id}>{o.nom}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Menu Nav Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <button className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectView('dashboard')}>
                    <i className="fa-solid fa-calendar-days"></i> Calendrier
                </button>

                <button className={`nav-btn ${activeView === 'comptes' ? 'active' : ''}`} onClick={() => onSelectView('comptes')}>
                    <i className="fa-solid fa-store"></i> Comptes
                </button>

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'planning' ? 'active' : ''}`} onClick={() => onSelectView('planning')}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Génération
                    </button>
                )}

                <button className={`nav-btn ${activeView === 'classement' ? 'active' : ''}`} onClick={() => onSelectView('classement')}>
                    <i className="fa-solid fa-trophy"></i> Classement
                </button>

                <button className={`nav-btn ${activeView === 'gagnants' ? 'active' : ''}`} onClick={() => onSelectView('gagnants')}>
                    <i className="fa-solid fa-lightbulb"></i> Suggestions
                </button>

                <button className={`nav-btn ${activeView === 'incidents' ? 'active' : ''}`} onClick={() => onSelectView('incidents')}>
                    <i className="fa-solid fa-triangle-exclamation"></i> Incidents
                </button>

                <button className={`nav-btn ${activeView === 'messagerie' ? 'active' : ''}`} onClick={() => onSelectView('messagerie')}>
                    <i className="fa-solid fa-comments"></i> Messagerie Vinted
                </button>

                {isAdmin && (
                    <button className={`nav-btn ${activeView === 'organisations' ? 'active' : ''}`} onClick={() => onSelectView('organisations')}>
                        <i className="fa-solid fa-sitemap"></i> Organisations
                    </button>
                )}

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'utilisateurs' ? 'active' : ''}`} onClick={() => onSelectView('utilisateurs')}>
                        <i className="fa-solid fa-users-gear"></i> Utilisateurs
                    </button>
                )}

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'corbeille' ? 'active' : ''}`} onClick={() => onSelectView('corbeille')}>
                        <i className="fa-solid fa-trash-can"></i> Corbeille
                        {corbeilleCount > 0 && (
                            <span className="badge" style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                                {corbeilleCount}
                            </span>
                        )}
                    </button>
                )}

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'parametres' ? 'active' : ''}`} onClick={() => onSelectView('parametres')}>
                        <i className="fa-solid fa-sliders"></i> Paramètres
                    </button>
                )}

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'journal' ? 'active' : ''}`} onClick={() => onSelectView('journal')}>
                        <i className="fa-solid fa-clock-rotate-left"></i> Journal
                    </button>
                )}
            </nav>
        </aside>
    );
}

function getTimeZoneOffsetMinutes(tzName, date = new Date()) {
    try {
        const format = new Intl.DateTimeFormat('en-US', { timeZone: tzName, timeZoneName: 'shortOffset' });
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
    if (!timeStr) return { time: timeStr, dayShift: 0 };
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
    return { time: `${finalH}:${finalM}`, dayShift };
}

// ------------------- VIEW: DASHBOARD / CALENDRIER -------------------
function DashboardView({ appState, currentUser, onUpdateRow, onDeleteRow, onAddRowClick, onBulkUpdateCalendrier, onBulkDeleteCalendrier, selectedTZ = 'FR' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterHeure, setFilterHeure] = useState('');
    const [filterComptes, setFilterComptes] = useState([]); // multi-select
    const [showCompteDropdown, setShowCompteDropdown] = useState(false);
    const [filterAgent, setFilterAgent] = useState((currentUser && currentUser.role === 'agent') ? (currentUser.agentAssigne || '') : '');
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
        return Boolean(searchTerm || filterDate || filterHeure || filterComptes.length > 0 || (!isAgent && filterAgent) || filterStatut || filterClassif || filterOnlyDuplicates);
    }, [searchTerm, filterDate, filterHeure, filterComptes, filterAgent, filterStatut, filterClassif, filterOnlyDuplicates, isAgent]);

    // Fermer dropdown Compte si clic en dehors
    React.useEffect(() => {
        const close = (e) => {
            if (!e.target.closest('#compte-multiselect-wrapper')) setShowCompteDropdown(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    // Auto-sync arrière-plan toutes les 2 minutes pour rafraîchir automatiquement les vues, likes, ventes, statut 'Fait' et heures DotB
    useEffect(() => {
        const autoSyncInterval = setInterval(async () => {
            try {
                const params = appState.parametres || {};
                if (params.dotbApiKey) {
                    await fetch('/api/dotb/fetch-live', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: params.dotbApiKey,
                            period: '30days',
                            selectedTypes: ['items_published', 'orders', 'views_likes']
                        })
                    });
                    if (window.loadAppState) await window.loadAppState();
                }
            } catch (e) {
                console.warn('[Auto-Sync DotB]', e.message);
            }
        }, 120000); // 2 minutes
        return () => clearInterval(autoSyncInterval);
    }, [appState.parametres]);

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

    const handleSort = (field) => {
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
            if (filterStatut && l.statut !== filterStatut) return false;
            if (filterClassif) {
                const isGagnantFilter = filterClassif.includes('Gagnant');
                const lineClassif = l.classification || (l.sku && winnerSkusSet.has(String(l.sku).trim().toLowerCase()) ? 'Gagnant' : '');
                const isMatch = lineClassif.includes(filterClassif) ||
                                (isGagnantFilter && l.sku && winnerSkusSet.has(String(l.sku).trim().toLowerCase())) ||
                                (isGagnantFilter && (l.vente > 0 || l.transactionId || l.source === 'Import CSV DotB'));
                if (!isMatch) return false;
            }

            if (searchTerm.trim()) {
                const q = searchTerm.trim().toLowerCase();
                const cObj = comptesAll.find(c => 
                    c.id === l.compteId || 
                    String(c.id).toLowerCase() === String(l.compteId).toLowerCase() ||
                    String(c.numeroCompte) === String(l.compteId) ||
                    `compte_${c.numeroCompte}` === String(l.compteId)
                );
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

                const matches = (
                    skuStr.includes(q) ||
                    pseudoStr.includes(q) ||
                    numProxyStr.includes(q) ||
                    emailStr.includes(q) ||
                    telStr.includes(q) ||
                    agentStr.includes(q) ||
                    statutStr.includes(q) ||
                    classifStr.includes(q) ||
                    dateStr.includes(q) ||
                    dateFrStr.includes(q) ||
                    heureStr.includes(q) ||
                    jourStr.includes(q)
                );

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

    const toggleSelectRow = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkStatut = async (newStatut) => {
        if (selectedIds.length === 0 || !onBulkUpdateCalendrier) return;
        await onBulkUpdateCalendrier(selectedIds, { statut: newStatut });
        setSelectedIds([]);
    };

    const handleBulkAgent = async (newAgent) => {
        if (selectedIds.length === 0 || !newAgent || !onBulkUpdateCalendrier) return;
        await onBulkUpdateCalendrier(selectedIds, { agent: newAgent });
        setSelectedIds([]);
    };

    const handleBulkHeure = async (newHeure) => {
        if (selectedIds.length === 0 || !newHeure || !onBulkUpdateCalendrier) return;
        await onBulkUpdateCalendrier(selectedIds, { heurePrevue: newHeure });
        setSelectedIds([]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || !onBulkDeleteCalendrier) return;
        if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedIds.length} lignes sélectionnées ?`)) {
            await onBulkDeleteCalendrier(selectedIds);
            setSelectedIds([]);
        }
    };

    // Fetch consolidated SKU summary to identify all Winning SKUs (Produits Gagnants)
    const [apiSkuSummary, setApiSkuSummary] = useState([]);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/sku/summary')
            .then(res => res.json())
            .then(data => {
                if (isMounted && Array.isArray(data)) {
                    setApiSkuSummary(data);
                }
            })
            .catch(err => console.warn("Err fetching SKU summary in Calendrier:", err));
        return () => { isMounted = false; };
    }, [calendrierAll]);

    // Set of all SKUs classified as Gagnants across the organization & DotB Cloud
    const winnerSkusSet = useMemo(() => {
        const set = new Set();
        (apiSkuSummary || []).forEach(s => {
            if (s.sku && s.classification && s.classification.includes('Gagnant')) {
                set.add(String(s.sku).trim().toLowerCase());
            }
        });
        (calendrierAll || []).forEach(l => {
            if (l.sku && (l.classification === 'Gagnant' || l.vente > 0 || l.transactionId || l.source === 'Import CSV DotB')) {
                set.add(String(l.sku).trim().toLowerCase());
            }
        });
        return set;
    }, [apiSkuSummary, calendrierAll]);

    // KPI Métriques calculées
    const totalVentes = useMemo(() => baseLines.reduce((sum, l) => sum + (l.vente || 0), 0), [baseLines]);
    const pubsFaite = useMemo(() => baseLines.filter(l => l.statut === 'Fait').length, [baseLines]);
    const totalPubs = baseLines.length;
    const avgScore = useMemo(() => totalPubs > 0 ? (baseLines.reduce((sum, l) => sum + (l.score || 0), 0) / totalPubs).toFixed(1) : "0.0", [baseLines, totalPubs]);
    
    // Total Produits Gagnants dans toute l'organisation & DotB Cloud
    const winnersCount = useMemo(() => {
        if (apiSkuSummary && apiSkuSummary.length > 0) {
            return apiSkuSummary.filter(s => (s.classification || '').includes('Gagnant')).length;
        }
        return winnerSkusSet.size;
    }, [apiSkuSummary, winnerSkusSet]);


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
            const orgId = (currentUser && currentUser.organisationId) || 'org_default';
            const res = await fetch('/api/calendrier/clean-empty-skus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organisationId: orgId })
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

    const handleFillMissingSKUs = async () => {
        try {
            const orgId = (currentUser && currentUser.organisationId) || 'org_default';
            const res = await fetch('/api/calendrier/fill-missing-skus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organisationId: orgId })
            });
            const data = await res.json();
            if (data.success) {
                if (window.showToast) window.showToast(data.message);
                if (window.loadAppState) await window.loadAppState();
            } else {
                if (window.showToast) window.showToast(`❌ ${data.error}`, true);
            }
        } catch (err) {
            console.error("Erreur remplissage SKU:", err);
        }
    };

    return (
        <section className="view">
            <div className="header-actions">
                <div>
                    <h2 className="page-title">Tableau de Bord & Calendrier</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Suivi temps réel des publications, scores et réinterventions</p>
                </div>
                {(currentUser && currentUser.role !== 'agent') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={async () => { if (window.loadAppState) await window.loadAppState(); if (window.showToast) window.showToast("Données rafraîchies !"); }} title="Rafraîchir les données">
                            <i className="fa-solid fa-rotate-right"></i> Rafraîchir
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleFillMissingSKUs} style={{ color: '#059669', borderColor: '#a7f3d0' }} title="Ré-attribuer automatiquement des SKUs du catalogue sur les lignes sans SKU">
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Auto-Remplir SKUs
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleCleanEmptySKUs} style={{ color: 'var(--danger)', borderColor: '#fca5a5' }} title="Supprimer toutes les lignes sans SKU">
                            <i className="fa-solid fa-broom"></i> Nettoyer (sans SKU)
                        </button>
                        <button className="btn btn-primary" onClick={onAddRowClick}>
                            <i className="fa-solid fa-plus"></i> Ajouter une ligne
                        </button>
                    </div>
                )}
            </div>


            {/* FILTRES & KPI METRIQUES */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon teal"><i className="fa-solid fa-calendar-check"></i></div>
                    <div className="metric-info">
                        <h4>PUBLICATIONS FAITES</h4>
                        <div className="value">{pubsFaite} / {totalPubs}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon green"><i className="fa-solid fa-bag-shopping"></i></div>
                    <div className="metric-info">
                        <h4>VENTES TOTALES</h4>
                        <div className="value">{totalVentes}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon blue"><i className="fa-solid fa-star"></i></div>
                    <div className="metric-info">
                        <h4>SCORE MOYEN</h4>
                        <div className="value">{avgScore}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon purple"><i className="fa-solid fa-trophy"></i></div>
                    <div className="metric-info">
                        <h4>PRODUITS GAGNANTS</h4>
                        <div className="value">{winnersCount}</div>
                    </div>
                </div>
            </div>

            {/* BANNIÈRE VOS COMPTES VINTED ATTRIBUÉS (POUR LES AGENTS) */}
            {isAgent && (
                <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ backgroundColor: '#09b1ba', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>
                                <i className="fa-solid fa-user-check"></i>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>Vos Comptes Vinted Attribués ({comptes.length})</h4>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Agent connecté : <b style={{ color: '#38bdf8' }}>{currentUser.nom || myAgentName}</b></span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {comptes.length > 0 ? (
                                comptes.map(c => (
                                    <div key={c.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>N°{c.numeroCompte || '?'}</span>
                                        <b style={{ color: '#ffffff' }}>{c.pseudo}</b>
                                        <span className={`badge ${c.statut === 'Actif' ? 'badge-actif' : (c.statut === 'Pause' ? 'badge-pause' : (c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'))}`} style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                            {c.statut}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>Aucun compte actuellement attribué.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FILTRES */}
            <div className="card" style={{ marginBottom: '24px' }}>
                {/* BARRE DE RECHERCHE GLOBALE INSTANTANÉE */}
                <div style={{ marginBottom: '16px', position: 'relative', width: '100%' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontSize: '15px' }}></i>
                    <input
                        type="text"
                        className="input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="🔍 Recherche avancée instantanée (SKU, Pseudo compte, N° Proxy, Agent, Statut, Date, Heure...)"
                        style={{ paddingLeft: '42px', paddingRight: '36px', height: '44px', fontSize: '14px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: searchTerm ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                    />
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }}>
                            ✕
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* FILTRE COMPTE — MULTI-SELECT CHECKBOXES */}
                    <div id="compte-multiselect-wrapper" style={{ minWidth: '180px', flex: 1, position: 'relative' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Compte</label>
                        <button
                            type="button"
                            onClick={() => setShowCompteDropdown(v => !v)}
                            style={{
                                width: '100%', textAlign: 'left', padding: '9px 12px',
                                border: `1px solid ${filterComptes.length > 0 ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)',
                                color: filterComptes.length > 0 ? 'var(--primary)' : 'var(--text-main)',
                                fontWeight: filterComptes.length > 0 ? 700 : 400,
                                cursor: 'pointer', fontSize: '13.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                        >
                            <span>
                                {filterComptes.length === 0
                                    ? `Tous les comptes (${comptes.length})`
                                    : filterComptes.length === 1
                                        ? comptes.find(c => c.id === filterComptes[0])?.pseudo || '1 compte'
                                        : `${filterComptes.length} comptes sélectionnés`
                                }
                            </span>
                            <i className={`fa-solid fa-chevron-${showCompteDropdown ? 'up' : 'down'}`} style={{ fontSize: '11px', marginLeft: '8px' }}></i>
                        </button>

                        {showCompteDropdown && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                zIndex: 999, maxHeight: '260px', overflowY: 'auto', padding: '6px 0'
                            }}>
                                {/* Tout sélectionner / Tout désélectionner */}
                                <div
                                    style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}
                                    onClick={() => setFilterComptes(filterComptes.length === comptes.length ? [] : comptes.map(c => c.id))}
                                >
                                    <input type="checkbox" readOnly checked={filterComptes.length === comptes.length} style={{ width: '14px', height: '14px' }} />
                                    {filterComptes.length === comptes.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </div>
                                {comptes.map(c => (
                                    <div
                                        key={c.id}
                                        style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: filterComptes.includes(c.id) ? 'rgba(9,177,186,0.07)' : 'transparent', transition: 'background 0.1s' }}
                                        onClick={() => setFilterComptes(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                                    >
                                        <input type="checkbox" readOnly checked={filterComptes.includes(c.id)} style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }} />
                                        <span style={{ fontWeight: filterComptes.includes(c.id) ? 600 : 400, color: filterComptes.includes(c.id) ? 'var(--primary)' : 'var(--text-main)', fontSize: '13px' }}>
                                            {c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`)}
                                        </span>
                                        {c.numeroCompte && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>N°{c.numeroCompte}</span>}
                                    </div>
                                ))}
                                {filterComptes.length > 0 && (
                                    <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)' }}>
                                        <button type="button" style={{ fontSize: '12px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                            onClick={() => { setFilterComptes([]); setShowCompteDropdown(false); }}>
                                            ✕ Effacer la sélection
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* FILTRE DATE */}
                    <div style={{ minWidth: '140px', flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Date</label>
                        <input
                            type="date"
                            className="input"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ border: filterDate ? '1px solid var(--primary)' : '1px solid var(--border)', fontWeight: filterDate ? 700 : 400 }}
                        />
                    </div>

                    {/* FILTRE HEURE */}
                    <div style={{ minWidth: '120px', flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Heure</label>
                        <input
                            type="time"
                            className="input"
                            value={filterHeure}
                            onChange={(e) => setFilterHeure(e.target.value)}
                            style={{ border: filterHeure ? '1px solid var(--primary)' : '1px solid var(--border)', fontWeight: filterHeure ? 700 : 400 }}
                        />
                    </div>

                    <div style={{ minWidth: '160px', flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Agent</label>
                        <select className="input" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} disabled={currentUser && currentUser.role === 'agent'}>
                            <option value="">Tous les agents</option>
                            {agentsUnique.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ minWidth: '130px', flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Statut</label>
                        <select className="input" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                            <option value="">Tous les statuts</option>
                            <option value="Non fait">Non fait</option>
                            <option value="Fait">Fait</option>
                        </select>
                    </div>
                    <div style={{ minWidth: '140px', flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Classification</label>
                        <select className="input" value={filterClassif} onChange={(e) => setFilterClassif(e.target.value)}>
                            <option value="">Toutes</option>
                            <option value="Nouveau produit">🆕 Nouveau produit</option>
                            <option value="À retester">🔄 À retester</option>
                            <option value="Gagnant">🏆 Gagnant</option>
                            <option value="Écarté">❌ Écarté</option>
                        </select>
                    </div>

                    {duplicateSkuCount > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => setFilterOnlyDuplicates(!filterOnlyDuplicates)}
                                style={{
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
                                }}
                                title="Cliquer pour afficher uniquement les lignes avec un SKU en doublon"
                            >
                                <i className="fa-solid fa-clone" style={{ color: filterOnlyDuplicates ? '#fff' : '#ea580c' }}></i>
                                <span>{filterOnlyDuplicates ? '✓ Doublons SKU Filtrés' : `⚠️ ${duplicateSkuCount} SKU${duplicateSkuCount > 1 ? 's' : ''} en doublon`}</span>
                            </button>
                        </div>
                    )}

                    {isAnyFilterActive && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={resetAllFilters}
                                style={{ color: 'var(--danger)', borderColor: '#fca5a5', backgroundColor: '#fef2f2', fontWeight: 600, height: '36px' }}
                                title="Réinitialiser tous les filtres actifs"
                            >
                                <i className="fa-solid fa-rotate-left"></i> Réinitialiser
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* FLOATING BULK ACTIONS BAR */}
            {selectedIds.length > 0 && (
                <div style={{
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
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '13.5px' }}>
                        <span style={{ backgroundColor: '#09b1ba', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', color: '#fff' }}>
                            ✓ {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
                        </span>
                        <span>Actions en masse :</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkStatut('Fait')}>
                            ✓ Marquer Fait
                        </button>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkStatut('Non fait')}>
                            ⌛ Marquer Non fait
                        </button>

                        {agentsUnique.length > 0 && (
                            <select
                                className="input-table"
                                style={{ width: 'auto', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '5px 10px', fontSize: '12px' }}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleBulkAgent(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            >
                                <option value="">👤 Affecter Agent...</option>
                                {agentsUnique.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Modifier l'heure prévisionnelle en masse">
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>🕐 Heure:</span>
                            <input
                                type="time"
                                className="input-table"
                                style={{ width: 'auto', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', padding: '4px 8px', fontSize: '12px' }}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleBulkHeure(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>

                        {(currentUser && currentUser.role !== 'agent') && (
                            <button type="button" className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkDelete}>
                                <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Supprimer ({selectedIds.length})
                            </button>
                        )}

                        <button type="button" className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedIds([])}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* TABLEAU CALENDRIER */}
            <div className="card">
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: '1325px', width: '100%', tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '40px' }} />
                            <col style={{ width: '100px' }} />
                            <col style={{ width: '150px' }} />
                            <col style={{ width: '120px' }} />
                            <col style={{ width: '180px' }} />
                            <col style={{ width: '130px' }} />
                            <col style={{ width: '130px' }} />
                            <col style={{ width: '110px' }} />
                            <col style={{ width: '80px' }} />
                            <col style={{ width: '70px' }} />
                            <col style={{ width: '70px' }} />
                            <col style={{ width: '70px' }} />
                            <col style={{ width: '75px' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} style={{ width: '16px', height: '16px', cursor: 'pointer' }} title="Tout sélectionner / Tout désélectionner" />
                                </th>
                                <th style={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('dateTime')} title="Cliquer pour trier par Date & Heure">
                                     Date {sortField === 'dateTime' ? (sortAsc ? '▲' : '▼') : (sortField === 'date' ? (sortAsc ? '▲' : '▼') : '')}
                                </th>
                                <th style={{ fontWeight: 700, color: 'var(--accent)' }}>Compte</th>
                                <th style={{ fontWeight: 700, color: 'var(--accent)' }}>Agent</th>
                                <th style={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('heure')} title="Cliquer pour trier par Heure">
                                     Heure ({selectedTZ === 'MADA' ? 'Mada UTC+3' : 'FR UTC+2'}) {sortField === 'heure' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th style={{ fontWeight: 700 }}>SKU</th>
                                <th style={{ fontWeight: 700 }}>Classif.</th>
                                <th style={{ fontWeight: 700 }}>Statut</th>
                                <th style={{ fontWeight: 700, color: 'var(--success)' }}>Vente</th>
                                <th>Score</th>
                                {(currentUser && currentUser.role !== 'agent') && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLines.length > 0 ? (
                                filteredLines.map(l => (
                                    <tr key={l.id} style={{ opacity: l.statut === 'Fait' ? 0.85 : 1, backgroundColor: selectedIds.includes(l.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelectRow(l.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                className="input-table"
                                                value={l.date || ''}
                                                disabled={currentUser && currentUser.role === 'agent'}
                                                onChange={(e) => onUpdateRow(l.id, { date: e.target.value })}
                                                style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12.5px', padding: '2px 4px', width: '100%' }}
                                                title="Modifier la date de publication"
                                            />
                                        </td>
                                        <td>
                                            <select className="input-table" style={{ width: '100%', minWidth: '130px', fontWeight: 600, color: 'var(--text-primary)' }} value={l.compteId || ''} disabled={currentUser && currentUser.role === 'agent'} onChange={(e) => {
                                                const selCompte = comptesAll.find(c => c.id === e.target.value);
                                                const targetAgent = selCompte && selCompte.agent && selCompte.agent !== 'À attribuer' ? selCompte.agent : l.agent;
                                                onUpdateRow(l.id, { compteId: e.target.value, agent: targetAgent });
                                            }}>
                                                <option value="">(aucun compte)</option>
                                                {comptesAll.map(c => (
                                                    <option key={c.id} value={c.id}>{c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select className="input-table" style={{ width: '100%', minWidth: '110px', fontWeight: 600, color: 'var(--accent)' }} value={l.agent || ''} disabled={currentUser && currentUser.role === 'agent'} onChange={(e) => {
                                                const newAgent = e.target.value;
                                                const currentCompte = comptes.find(c => c.id === l.compteId);
                                                if (currentCompte && currentCompte.agent && currentCompte.agent !== 'À attribuer' && currentCompte.agent !== newAgent) {
                                                    if (window.showToast) window.showToast(`Attribution refusée : Le compte "${currentCompte.pseudo}" est officiellement attribué à ${currentCompte.agent}`, true);
                                                    return;
                                                }
                                                onUpdateRow(l.id, { agent: newAgent });
                                            }}>
                                                <option value="">Sélectionner...</option>
                                                {agentsUnique.map(a => (
                                                    <option key={a} value={a}>{a}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            {(() => {
                                                const convMada = convertHHMM(l.heurePrevue, l.date, 'FR', 'MADA');
                                                const displayedTime = selectedTZ === 'MADA' ? (convMada.time || l.heurePrevue) : (l.heurePrevue || '');
                                                const otherFlag = selectedTZ === 'MADA' ? '🇫🇷' : '🇲🇬';
                                                const otherTime = selectedTZ === 'MADA' ? (l.heurePrevue || '') : convMada.time;
                                                const shiftTag = selectedTZ === 'MADA' 
                                                    ? (convMada.dayShift === 1 ? '-1j' : (convMada.dayShift === -1 ? '+1j' : ''))
                                                    : (convMada.dayShift === 1 ? '+1j' : (convMada.dayShift === -1 ? '-1j' : ''));

                                                const handleTimeChange = (e) => {
                                                    const val = e.target.value;
                                                    if (selectedTZ === 'MADA') {
                                                        const convFR = convertHHMM(val, l.date, 'MADA', 'FR');
                                                        onUpdateRow(l.id, { heurePrevue: convFR.time });
                                                    } else {
                                                        onUpdateRow(l.id, { heurePrevue: val });
                                                    }
                                                };

                                                return (
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <input
                                                            type="time"
                                                            className="input-table"
                                                            disabled={currentUser && currentUser.role === 'agent'}
                                                            style={{ fontWeight: 700, width: '92px', fontSize: '13px', padding: '2px 4px' }}
                                                            value={displayedTime || ''}
                                                            onChange={handleTimeChange}
                                                            title={`Modifier l'heure en ${selectedTZ === 'MADA' ? 'Madagascar' : 'France'}`}
                                                        />
                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }} title={`Heure équivalente (${selectedTZ === 'MADA' ? 'France' : 'Madagascar'})`}>
                                                            {otherFlag} {otherTime}
                                                            {shiftTag && <span style={{ color: '#d97706', fontWeight: 700, marginLeft: '3px' }}>{shiftTag}</span>}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            {(() => {
                                                const sKey = (l.sku || '').trim().toLowerCase();
                                                const countSku = skuCounts[sKey] || 0;
                                                const isDuplicate = countSku > 1 && l.classification !== 'Gagnant';

                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            className="input-table"
                                                            value={l.sku || ''}
                                                            placeholder="SKU"
                                                            disabled={currentUser && currentUser.role === 'agent'}
                                                            onChange={(e) => onUpdateRow(l.id, { sku: e.target.value })}
                                                            style={{
                                                                flex: 1,
                                                                minWidth: '70px',
                                                                borderColor: isDuplicate ? '#f97316' : '',
                                                                backgroundColor: isDuplicate ? '#fff7ed' : '',
                                                                fontWeight: isDuplicate ? 700 : 400
                                                            }}
                                                            title={isDuplicate ? `⚠️ ATTENTION : SKU en doublon présent ${countSku} fois dans le planning !` : 'SKU Produit'}
                                                        />
                                                        {isDuplicate && (
                                                            <span
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    backgroundColor: '#ea580c',
                                                                    color: '#ffffff',
                                                                    padding: '2px 5px',
                                                                    borderRadius: '4px',
                                                                    whiteSpace: 'nowrap',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSearchTerm(l.sku);
                                                                }}
                                                                title={`Cliquer pour isoler les ${countSku} occurrences de ce SKU (${l.sku})`}
                                                            >
                                                                ⚠️ x{countSku}
                                                            </span>
                                                        )}
                                                        {l.sku && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ padding: '3px 7px', fontSize: '11px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                                                                title="Copier rapidement le SKU"
                                                                onClick={(e) => {
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
                                                                }}>
                                                                <i className={`fa-solid ${copiedSkuId === l.id ? 'fa-check' : 'fa-copy'}`} style={{ color: copiedSkuId === l.id ? '#059669' : 'inherit' }}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            {l.sku && String(l.sku).trim() !== '' ? (() => {
                                                const isWinner = winnerSkusSet.has(String(l.sku).trim().toLowerCase()) || l.vente > 0 || l.transactionId;
                                                const classif = isWinner ? 'Gagnant' : (l.classification || 'Nouveau produit');
                                                return (
                                                    <span className={`badge ${
                                                        classif === 'Gagnant' || classif.includes('Gagnant') ? 'badge-gagnant' :
                                                        classif === 'Écarté' ? 'badge-ecarte' :
                                                        classif === 'Nouveau produit' ? 'badge-nouveau' :
                                                        'badge-retester'
                                                    }`}>
                                                        {classif === 'Gagnant' || classif.includes('Gagnant') ? '🏆 Gagnant' : classif}
                                                    </span>
                                                );
                                            })() : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>-</span>
                                            )}
                                        </td>

                                        <td>
                                            <button className={`btn btn-sm ${l.statut === 'Fait' ? 'btn-success' : 'btn-danger'}`}
                                                onClick={() => onUpdateRow(l.id, { statut: l.statut === 'Fait' ? 'Non fait' : 'Fait' })}>
                                                {l.statut === 'Fait' ? '✓ Fait' : '⌛ Non fait'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                                <button className={`btn btn-sm ${l.vente === 1 ? 'btn-success' : 'btn-secondary'}`}
                                                    onClick={() => onUpdateRow(l.id, { vente: l.vente === 1 ? 0 : 1 })}>
                                                    {l.vente === 1 ? '💰 Oui' : 'Non'}
                                                </button>
                                                {l.sku && skuVentesMap[l.sku] > 0 && (
                                                    <span style={{ fontSize: '10px', color: skuVentesMap[l.sku] >= 3 ? '#059669' : 'var(--text-muted)', fontWeight: 700, background: skuVentesMap[l.sku] >= 3 ? 'rgba(5,150,105,0.1)' : '#f1f5f9', borderRadius: '4px', padding: '1px 5px', whiteSpace: 'nowrap' }}
                                                        title={`Ce SKU a été vendu ${skuVentesMap[l.sku]}x dans l'organisation`}>
                                                        {skuVentesMap[l.sku]}x ce SKU
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td><b>{(!l.sku || !String(l.sku).trim() || String(l.sku).trim() === '-') ? '0.0' : (l.score || 0).toFixed(1)}</b></td>
                                        {(currentUser && currentUser.role !== 'agent') && (
                                            <td>
                                                <button className="btn btn-danger btn-sm" title="Supprimer" onClick={() => onDeleteRow(l.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        Aucune ligne de calendrier trouvée pour ces filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: COMPTES -------------------
function ComptesView({ currentUser, appState, onSaveCompte, onDeleteCompte, onBulkUpdateComptes, onBulkDeleteComptes, onOpenQuickAgentModal }) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isCadre = currentUser && (currentUser.role === 'admin' || currentUser.role === 'cadre');
    const userOrgId = (currentUser && currentUser.organisationId) || 'org_default';
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
            list = list.filter(c => 
                (c.pseudo && c.pseudo.toLowerCase().includes(q)) ||
                (c.numeroCompte && String(c.numeroCompte).toLowerCase().includes(q)) ||
                (c.telephone && String(c.telephone).toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.agent && c.agent.toLowerCase().includes(q)) ||
                (c.gereParInitiales && c.gereParInitiales.toLowerCase().includes(q)) ||
                (c.notes && c.notes.toLowerCase().includes(q))
            );
        }

        const getStatusPriority = (statut) => {
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
        if (isAllComptesSelected) setSelectedCompteIds([]);
        else setSelectedCompteIds(visibleComptes.map(c => c.id));
    };

    const toggleSelectCompte = (id) => {
        setSelectedCompteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkCompteStatut = async (newStatut) => {
        if (selectedCompteIds.length === 0 || !onBulkUpdateComptes) return;
        await onBulkUpdateComptes(selectedCompteIds, { statut: newStatut });
        setSelectedCompteIds([]);
    };

    const handleBulkDeleteComptesAction = async () => {
        if (selectedCompteIds.length === 0 || !onBulkDeleteComptes) return;
        if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedCompteIds.length} comptes sélectionnés ?`)) {
            await onBulkDeleteComptes(selectedCompteIds);
            setSelectedCompteIds([]);
        }
    };

    const handleEdit = (c) => {
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
        setOrganisationId(isAdmin ? (c.organisationId || 'org_default') : userOrgId);
        setDotbApiKey(c.dotbApiKey || '');
        setNotes(c.notes || '');
        // Scroll to form smoothly after state update
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        setNotes('');
    };

    const handleSubmit = (e) => {
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
                } else if (!initiales && (line.length <= 4 && /^[A-Z]{2,4}$/.test(line))) {
                    initiales = line;
                } else if (!mp && (line.includes('*') || line.includes('&') || line.length >= 6) && !line.toLowerCase().includes('actif') && !line.toLowerCase().includes('bloqué') && !line.toLowerCase().includes('connecté')) {
                    mp = line;
                } else if (line.toLowerCase().includes('actif') || line.toLowerCase().includes('bloqué') || line.toLowerCase().includes('banni') || line.toLowerCase().includes('limité') || line.toLowerCase().includes('pause')) {
                    if (line.toLowerCase().includes('pause')) statutStr = 'Pause';
                    else if (line.toLowerCase().includes('bloqué') || line.toLowerCase().includes('banni')) statutStr = 'Banni';
                    else if (line.toLowerCase().includes('limité') || line.toLowerCase().includes('restreint')) statutStr = 'Limité';
                    else statutStr = 'Actif';

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

    return (
        <section className="view">
            <div className="header-actions">
                <div>
                    <h2 className="page-title">Gestion des Comptes Vinted</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        {isCadre ? "Gérez les comptes Vinted (N°, pseudo, tél, email, mot de passe, géré par, statut et date)" : "Consultez les détails et identifiants de vos comptes attribués"}
                    </p>
                </div>
                {isCadre && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowTextModal(true)}>
                            <i className="fa-solid fa-file-import"></i> Importer par Texte
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL COPIER/COLLER TEXTE */}
            {showTextModal && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content card" style={{ maxWidth: '650px', width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px' }}>
                        <h3 className="card-title" style={{ marginBottom: '12px' }}>
                            <i className="fa-solid fa-paste" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                            Importation Rapide de Comptes en Masse (Format Texte)
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Collez simplement votre liste de comptes au format brut (N°, Pseudo, Téléphone, Email, Mot de passe, Initiales, Statut & Date). Le système va tout déduire et créer automatiquement les comptes !
                        </p>
                        <textarea
                            className="input"
                            rows="10"
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12.5px', marginBottom: '16px', padding: '12px' }}
                            value={rawImportText}
                            onChange={(e) => setRawImportText(e.target.value)}
                            placeholder={`Exemple à copier :\n48\nisis_mlf\n06 33 40 86 06\njuyjgj26@gmail.com\nVinted009&*\nTD\nactif 28/07/2026\n\n49\nnaya_sky\n06 33 43 85 51\nee010010@outlook.fr\nVinted009&*\nTD\nactif 31/07/2026\nconnecté à Adspower le 05/08/26`}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowTextModal(false)}>Annuler</button>
                            <button type="button" className="btn btn-primary" onClick={handleParseAndImportText}>
                                <i className="fa-solid fa-rocket"></i> Importer & Enregistrer les Comptes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORMULAIRE COMPTE (ACCESSIBLE UNIQUEMENT AUX ADMINS / CADRES) */}
            {isCadre && (
                <div ref={formRef} className="card" style={{ marginBottom: '24px', scrollMarginTop: '20px' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {compteId ? (
                            <><i className="fa-solid fa-pen-to-square" style={{ color: 'var(--accent)' }}></i> Modifier le compte <span style={{ color: 'var(--accent)', fontWeight: 700 }}>#{numeroCompte || compteId}</span></>
                        ) : (
                            <><i className="fa-solid fa-plus-circle" style={{ color: 'var(--success)' }}></i> Ajouter un nouveau compte Vinted</>
                        )}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-3" style={{ marginBottom: '12px' }}>
                            <div className="form-group">
                                <label>N° Compte (Proxy)</label>
                                <input type="text" value={numeroCompte} onChange={(e) => setNumeroCompte(e.target.value)} placeholder="ex: 48" />
                            </div>
                            <div className="form-group">
                                <label>Pseudo Vinted</label>
                                <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="ex: isis_mlf" required />
                            </div>
                            <div className="form-group">
                                <label>N° Téléphone</label>
                                <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="ex: 06 33 40 86 06" />
                            </div>
                        </div>

                        <div className="grid-3" style={{ marginBottom: '12px' }}>
                            <div className="form-group">
                                <label>Adresse Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: juyjgj26@gmail.com" />
                            </div>
                            <div className="form-group">
                                <label>Mot de Passe Vinted</label>
                                <input type="text" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="ex: Vinted009&*" />
                            </div>
                            <div className="form-group">
                                <label>Géré par (Initiales)</label>
                                <input type="text" value={gereParInitiales} onChange={(e) => setGereParInitiales(e.target.value)} placeholder="ex: TD, EG" />
                            </div>
                        </div>

                        <div className="grid-3" style={{ marginBottom: '12px' }}>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ marginBottom: 0 }}>Agent Responsable</label>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenQuickAgentModal} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                        <i className="fa-solid fa-user-plus"></i> + Créer Agent
                                    </button>
                                </div>
                                <select value={agent} onChange={(e) => setAgent(e.target.value)}>
                                    <option value="">À attribuer (Non spécifié)</option>
                                    {agentsList.map(a => (
                                        <option key={a.id} value={a.agentAssigne || a.nom}>{a.nom} ({a.agentAssigne || a.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Statut du compte</label>
                                <select value={statut} onChange={(e) => setStatut(e.target.value)}>
                                    <option value="Actif">Actif</option>
                                    <option value="Pause">Pause</option>
                                    <option value="Limité">Limité / Restreint</option>
                                    <option value="Banni">Banni / Bloqué</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date du Statut</label>
                                <input type="text" value={dateStatutCompte} onChange={(e) => setDateStatutCompte(e.target.value)} placeholder="ex: 28/07/2026" />
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>Organisation</label>
                                <select value={isAdmin ? organisationId : userOrgId} onChange={(e) => setOrganisationId(e.target.value)} disabled={!isAdmin}>
                                    {organisations.map(o => (
                                        <option key={o.id} value={o.id}>{o.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Notes & Observations (Adspower, Ventes, etc.)</label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ex: connecté à Adspower le 05/08/26, 1 article en vente" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary">
                                <i className="fa-solid fa-floppy-disk"></i> Enregistrer le Compte
                            </button>
                            {compteId && (
                                <button type="button" className="btn btn-secondary" onClick={handleReset}>Annuler</button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* BULK ACTIONS FOR COMPTES (CADRES/ADMINS UNIQUEMENT) */}
            {isCadre && selectedCompteIds.length > 0 && (
                <div style={{
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
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '13.5px' }}>
                        <span style={{ backgroundColor: '#09b1ba', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', color: '#fff' }}>
                            ✓ {selectedCompteIds.length} compte{selectedCompteIds.length > 1 ? 's' : ''}
                        </span>
                        <span>Actions en masse :</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkCompteStatut('Actif')}>
                            Statut Actif
                        </button>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkCompteStatut('Pause')}>
                            Statut Pause
                        </button>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkCompteStatut('Limité')}>
                            Statut Limité
                        </button>
                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleBulkCompteStatut('Banni')}>
                            Statut Banni
                        </button>

                        <button type="button" className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkDeleteComptesAction}>
                            <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Supprimer ({selectedCompteIds.length})
                        </button>

                        <button type="button" className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedCompteIds([])}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* LISTE COMPTES */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Liste des Comptes enregistrés ({visibleComptes.length})</h3>

                    {/* FILTRES AVANCÉS COMPTES */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '750px' }}>
                        <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}></i>
                            <input
                                type="text"
                                className="input"
                                value={searchTermComptes}
                                onChange={(e) => setSearchTermComptes(e.target.value)}
                                placeholder="🔍 Recherche avancée compte (N°, Pseudo, Tél, Email, Agent, Notes...)"
                                style={{ paddingLeft: '36px', paddingRight: '28px', height: '38px', fontSize: '13px', borderRadius: '8px' }}
                            />
                            {searchTermComptes && (
                                <button type="button" onClick={() => setSearchTermComptes('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    ✕
                                </button>
                            )}
                        </div>

                        <select className="input" value={filterStatutCompte} onChange={(e) => setFilterStatutCompte(e.target.value)} style={{ flex: 1, minWidth: '130px', height: '38px', fontSize: '13px' }}>
                            <option value="">Tous statuts</option>
                            <option value="Actif">🟢 Actif</option>
                            <option value="Pause">🟣 Pause</option>
                            <option value="Limité">🟠 Limité</option>
                            <option value="Banni">🔴 Banni</option>
                        </select>

                        <select className="input" value={filterAgentCompte} onChange={(e) => setFilterAgentCompte(e.target.value)} style={{ flex: 1, minWidth: '140px', height: '38px', fontSize: '13px' }}>
                            <option value="">Tous agents</option>
                            <option value="À attribuer">👤 À attribuer</option>
                            {agentsList.map(a => (
                                <option key={a.id} value={a.agentAssigne || a.nom}>{a.nom}</option>
                            ))}
                        </select>

                        <select className="input" value={filterGereParCompte} onChange={(e) => setFilterGereParCompte(e.target.value)} style={{ flex: 1, minWidth: '130px', height: '38px', fontSize: '13px' }}>
                            <option value="">Tous géré par</option>
                            {gereParList.map(g => (
                                <option key={g} value={g}>🏷️ Géré par : {g}</option>
                            ))}
                        </select>

                        {(searchTermComptes || filterStatutCompte || filterAgentCompte || filterGereParCompte) && (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearchTermComptes(''); setFilterStatutCompte(''); setFilterAgentCompte(''); setFilterGereParCompte(''); }} style={{ height: '38px', padding: '0 12px', fontSize: '12px', color: '#ef4444', borderColor: '#fca5a5' }} title="Réinitialiser les filtres">
                                🔄 Effacer
                            </button>
                        )}
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                {isCadre && (
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" checked={isAllComptesSelected} onChange={toggleSelectAllComptes} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                    </th>
                                )}
                                <th>Statut & Date</th>
                                <th>N° Proxy</th>
                                <th>Pseudo</th>
                                <th>Géré par</th>
                                <th>Agent</th>
                                <th>Téléphone</th>
                                <th>Email</th>
                                <th>Mot de passe</th>
                                <th>Notes & Observations</th>
                                {isCadre && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleComptes.length > 0 ? (
                                visibleComptes.map(c => (
                                    <tr key={c.id} style={{ backgroundColor: selectedCompteIds.includes(c.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent' }}>
                                        {isCadre && (
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={selectedCompteIds.includes(c.id)} onChange={() => toggleSelectCompte(c.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                            </td>
                                        )}
                                        <td>
                                            <span className={`badge ${c.statut === 'Actif' ? 'badge-actif' : (c.statut === 'Pause' ? 'badge-pause' : (c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'))}`}>
                                                {c.statut}
                                            </span>
                                            {c.dateStatutCompte && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{c.dateStatutCompte}</span>}
                                        </td>
                                        <td>
                                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                 <b style={{ color: 'var(--primary)' }}>{c.numeroCompte || '-'}</b>
                                                 {c.numeroCompte && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleCopyText(c.numeroCompte, 'num', c.id)}
                                                         title="Copier le N° Proxy"
                                                         style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedField === `${c.id}_num` ? '#10b981' : '#94a3b8', fontSize: '11px', transition: 'color 0.2s' }}
                                                     >
                                                         <i className={`fa-solid ${copiedField === `${c.id}_num` ? 'fa-check' : 'fa-copy'}`}></i>
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                         <td>
                                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                 <b>{c.pseudo}</b>
                                                 {c.pseudo && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleCopyText(c.pseudo, 'pseudo', c.id)}
                                                         title="Copier le pseudo"
                                                         style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedField === `${c.id}_pseudo` ? '#10b981' : '#94a3b8', fontSize: '11px', transition: 'color 0.2s' }}
                                                     >
                                                         <i className={`fa-solid ${copiedField === `${c.id}_pseudo` ? 'fa-check' : 'fa-copy'}`}></i>
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                        <td>{c.gereParInitiales ? <span className="badge" style={{ backgroundColor: '#475569', color: '#fff' }}>{c.gereParInitiales}</span> : '-'}</td>
                                        <td>{c.agent && c.agent !== 'À attribuer' ? <span className="badge badge-agent">{c.agent}</span> : <span className="badge" style={{ backgroundColor: '#64748b', color: '#fff' }}>À attribuer</span>}</td>
                                        <td>
                                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                 <span>{c.telephone || '-'}</span>
                                                 {c.telephone && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleCopyText(c.telephone, 'tel', c.id)}
                                                         title="Copier le téléphone"
                                                         style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedField === `${c.id}_tel` ? '#10b981' : '#94a3b8', fontSize: '11px', transition: 'color 0.2s' }}
                                                     >
                                                         <i className={`fa-solid ${copiedField === `${c.id}_tel` ? 'fa-check' : 'fa-copy'}`}></i>
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                         <td>
                                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                 <span style={{ fontSize: '12px' }}>{c.email || '-'}</span>
                                                 {c.email && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleCopyText(c.email, 'email', c.id)}
                                                         title="Copier l'email"
                                                         style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedField === `${c.id}_email` ? '#10b981' : '#94a3b8', fontSize: '11px', transition: 'color 0.2s' }}
                                                     >
                                                         <i className={`fa-solid ${copiedField === `${c.id}_email` ? 'fa-check' : 'fa-copy'}`}></i>
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                         <td>
                                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                 <code style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>{c.motDePasse || '-'}</code>
                                                 {c.motDePasse && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleCopyText(c.motDePasse, 'mp', c.id)}
                                                         title="Copier le mot de passe"
                                                         style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedField === `${c.id}_mp` ? '#10b981' : '#94a3b8', fontSize: '11px', transition: 'color 0.2s' }}
                                                     >
                                                         <i className={`fa-solid ${copiedField === `${c.id}_mp` ? 'fa-check' : 'fa-copy'}`}></i>
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                         <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                                 <span>{c.notes || '-'}</span>
                                                 <button
                                                     type="button"
                                                     onClick={() => handleCopyText(`N°${c.numeroCompte || ''} | Pseudo: ${c.pseudo || ''} | Tél: ${c.telephone || ''} | Email: ${c.email || ''} | MP: ${c.motDePasse || ''}`, 'all', c.id)}
                                                     title="Copier TOUS les identifiants"
                                                     style={{ border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', color: copiedField === `${c.id}_all` ? '#10b981' : '#64748b', fontSize: '10px', fontWeight: 600, flexShrink: 0 }}
                                                 >
                                                     {copiedField === `${c.id}_all` ? '✓ Copié !' : '📋 Tout copier'}
                                                 </button>
                                             </div>
                                         </td>
                                        {isCadre && (
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c)} title="Éditer">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteCompte(c.id)} title="Supprimer">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucun compte Vinted enregistré.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
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
function PlanningView({ appState, onGeneratePlanning }) {
    const todayStr = useMemo(() => getLocalDateString(), []);
    const defaultEndStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return getLocalDateString(d);
    }, []);

    const [dateDebut, setDateDebut] = useState(todayStr);
    const [dateFin, setDateFin] = useState(defaultEndStr);
    const [creneauxParJour, setCreneauxParJour] = useState((appState.parametres && appState.parametres.creneauxParJour) || 6);
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

    const toggleAgent = (agentName) => {
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

    const toggleAccount = (id) => {
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

    const setPreset = (days) => {
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
            const orgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';
            const res = await fetch('/api/calendrier/clean-empty-skus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organisationId: orgId })
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

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Générateur Automatique de Planning</h2>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                    Génération Anti-Collision Multi-Comptes & Multi-Agents
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Le moteur calcule automatiquement la répartition optimale des créneaux horaires pour l'ensemble des <b>{filteredActiveComptes.length} comptes au statut Actif et attribués à un agent</b>, en appliquant les règles d'espacement et la marge d'intervalle aléatoire.
                </p>

                {/* SÉLECTION DES AGENTS CONCERNÉS (PAUSE / CONGÉ) */}
                <div style={{
                    background: 'rgba(9, 177, 186, 0.04)',
                    border: '1px solid rgba(9, 177, 186, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                <i className="fa-solid fa-users-gear" style={{ color: 'var(--primary)' }}></i>
                                Agents Concernés (Gestion Pause / Congé)
                            </h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Décocher un agent le passe en <b>Pause / Congé</b> pour exclure ses comptes de cette génération de planning. Par défaut, tous les agents sont sélectionnés.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllAgents} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                <i className="fa-solid fa-check-double" style={{ marginRight: '4px' }}></i> Tout sélectionner
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={deselectAllAgents} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                <i className="fa-solid fa-xmark" style={{ marginRight: '4px' }}></i> Tout décocher
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {availableAgents.length === 0 ? (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucun agent actif trouvé.</span>
                        ) : availableAgents.map(agentName => {
                            const isSelected = selectedAgents.includes(agentName);
                            const agentComptesCount = activeComptes.filter(c => (c.agent || 'À attribuer') === agentName).length;
                            return (
                                <label
                                    key={agentName}
                                    style={{
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
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleAgent(agentName)}
                                        style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                    <span>{agentName}</span>
                                    <span className="badge" style={{
                                        background: isSelected ? 'var(--primary)' : '#94a3b8',
                                        color: '#fff',
                                        fontSize: '11px',
                                        padding: '1px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        {agentComptesCount} compte{agentComptesCount > 1 ? 's' : ''}
                                    </span>
                                    {!isSelected && (
                                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#ef4444', fontWeight: 600 }}>
                                            (Pause / Congé)
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* SÉLECTION / EXCLUSION DES COMPTES CONCERNÉS */}
                <div style={{
                    background: 'rgba(99, 102, 241, 0.04)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                <i className="fa-solid fa-address-book" style={{ color: '#6366f1' }}></i>
                                Comptes Concernés ({filteredActiveComptes.length} / {activeComptes.length} comptes inclus)
                            </h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Cochez ou décochez individuellement les comptes Vinted à inclure ou exclure de la génération du planning.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={includeAllAccounts} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                <i className="fa-solid fa-check-double" style={{ marginRight: '4px' }}></i> Tout inclure
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={excludeAllAccounts} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                <i className="fa-solid fa-xmark" style={{ marginRight: '4px' }}></i> Tout exclure
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {activeComptes.length === 0 ? (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucun compte actif disponible.</span>
                        ) : activeComptes.map(c => {
                            const isIncluded = !excludedAccountIds.includes(c.id);
                            return (
                                <label
                                    key={c.id}
                                    style={{
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
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={isIncluded}
                                        onChange={() => toggleAccount(c.id)}
                                        style={{ accentColor: '#6366f1', cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                    <span><b>N°{c.numeroCompte || '?'}</b> - {c.pseudo}</span>
                                    <span className="badge badge-agent" style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                                        {c.agent}
                                    </span>
                                    {!isIncluded && (
                                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#ef4444', fontWeight: 600 }}>
                                            (Exclu)
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '18px' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-calendar-day" style={{ color: 'var(--primary)' }}></i>
                            Date de Début
                        </label>
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            style={{ padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }}></i>
                            Date de Fin
                        </label>
                        <input
                            type="date"
                            value={dateFin}
                            min={dateDebut}
                            onChange={(e) => setDateFin(e.target.value)}
                            style={{ padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-bullhorn" style={{ color: 'var(--primary)' }}></i>
                            Publications / Compte / Jour
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={creneauxParJour}
                            onChange={(e) => setCreneauxParJour(parseInt(e.target.value) || 1)}
                            style={{ padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                            placeholder="ex: 6"
                        />
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '18px' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-clock" style={{ color: 'var(--primary)' }}></i>
                            Heure de Début des Créneaux
                        </label>
                        <input
                            type="time"
                            value={heureDebut}
                            onChange={(e) => setHeureDebut(e.target.value)}
                            style={{ padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-moon" style={{ color: 'var(--primary)' }}></i>
                            Heure de Fin des Créneaux
                        </label>
                        <input
                            type="time"
                            value={heureFin}
                            onChange={(e) => setHeureFin(e.target.value)}
                            style={{ padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                {/* OPTION ATTRIBUTION AUTOMATIQUE SKU GAGNANTS */}
                <div style={{
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
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            id="includeWinnerSKUsCheck"
                            checked={includeWinnerSKUs}
                            onChange={(e) => setIncludeWinnerSKUs(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <label htmlFor="includeWinnerSKUsCheck" style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>
                            <b style={{ fontSize: '14px', color: includeWinnerSKUs ? '#047857' : 'var(--text-main)', display: 'block' }}>
                                🏆 Répartir automatiquement les SKU Gagnants (Anti-doublon : 1 SKU par jour max)
                            </b>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {includeWinnerSKUs 
                                    ? "Activé : Chaque SKU Gagnant est attribué au maximum une fois par jour et sans aucun doublon par compte."
                                    : "Désactivé : Le planning sera généré avec des lignes neutres/vierges sans pré-remplissage des SKU Gagnants."
                                }
                            </span>
                        </label>
                    </div>
                    <span className={`badge ${includeWinnerSKUs ? 'badge-actif' : 'badge-secondary'}`} style={{ padding: '4px 10px', fontSize: '12px' }}>
                        {includeWinnerSKUs ? '✓ SKU Gagnants Inclus' : 'Sans SKU Gagnant'}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreset(1)}>Aujourd'hui (1 jour)</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreset(7)}>7 Jours à venir</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreset(14)}>14 Jours à venir</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreset(30)}>30 Jours à venir</button>
                </div>

                {totalDays > 0 ? (
                    <div style={{
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
                    }}>
                        <i className="fa-solid fa-calendar-days" style={{ fontSize: '16px' }}></i>
                        <span>
                            Période : du <b>{dateDebut}</b> au <b>{dateFin}</b> ({totalDays} jour{totalDays > 1 ? 's' : ''}) — 
                            <b> {creneauxParJour} pub{creneauxParJour > 1 ? 's' : ''}/compte/jour</b> pour {filteredActiveComptes.length} compte(s) au statut Actif et attribué(s) à un agent ({selectedAgents.length} agent(s) sélectionné(s)) 
                            (soit <b>{totalEstimatedSlots} publication{totalEstimatedSlots > 1 ? 's' : ''} au total</b>)
                        </span>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        ⚠️ La date de fin doit être égale ou supérieure à la date de début.
                    </div>
                )}

                {filteredActiveComptes.length === 0 && (
                    <div style={{
                        backgroundColor: '#fffbebf',
                        border: '1px solid #fde68a',
                        color: '#b45309',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        ⚠️ Aucun compte actif disponible pour la sélection d'agents courante (tous les agents sont décochés ou en pause/congé).
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={loading || totalDays <= 0 || filteredActiveComptes.length === 0}
                        style={{ padding: '12px 24px', fontSize: '15px' }}
                    >
                        {loading ? <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> : <i className="fa-solid fa-bolt" style={{ marginRight: '8px' }}></i>}
                        {loading ? 'Génération en cours...' : `Générer le Planning (${totalEstimatedSlots} pub${totalEstimatedSlots > 1 ? 's' : ''})`}
                    </button>
                    
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCleanEmptySKUs}
                        disabled={loading}
                        style={{ padding: '12px 18px', fontSize: '14px', color: 'var(--danger)', borderColor: '#fca5a5', backgroundColor: '#fef2f2', fontWeight: 600 }}
                        title="Supprimer du planning toutes les lignes qui n'ont pas de SKU attribué"
                    >
                        <i className="fa-solid fa-broom" style={{ marginRight: '6px' }}></i> Nettoyer les lignes sans SKU
                    </button>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: INCIDENTS -------------------
function IncidentsView({ appState, onSaveIncident, onBulkDeleteIncidents }) {
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
        if (isAllIncidentsSelected) setSelectedIncidentIds([]);
        else setSelectedIncidentIds(incidents.map(i => i.id));
    };

    const toggleSelectIncident = (id) => {
        setSelectedIncidentIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkDeleteIncidentsAction = async () => {
        if (selectedIncidentIds.length === 0 || !onBulkDeleteIncidents) return;
        if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedIncidentIds.length} incidents sélectionnés ?`)) {
            await onBulkDeleteIncidents(selectedIncidentIds);
            setSelectedIncidentIds([]);
        }
    };

    const getComptePseudo = (cId) => {
        const c = comptes.find(comp => comp.id === cId);
        if (!c) return cId || 'Inconnu';
        return c.pseudo || (c.numeroCompte ? `Compte #${c.numeroCompte}` : `Compte (${c.id})`);
    };

    const handleEditIncident = (inc) => {
        setEditingIncidentId(inc.id);
        setCompteId(inc.compteId || '');
        setType(inc.type || 'Limitation');
        const d = inc.dateBlocage || '';
        const h = inc.heureBlocage || '12:00';
        setDateHeure((d && h) ? `${d}T${h}` : todayDateTimeStr);
        setNbAnnonces(inc.nbAnnoncesMasquees || '');
        setSkuAnnonces(inc.skuAnnoncesMasquees || '');
        setNotesActivites(inc.notesActivites || '');
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
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

    const handleSubmit = (e) => {
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

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Gestion des Incidents & Limitations</h2>

            {/* FORMULAIRE INCIDENT */}
            <div className="card" style={{ marginBottom: '24px' }} ref={formRef}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                        <i className={`fa-solid ${editingIncidentId ? 'fa-pen-to-square' : 'fa-shield-cat'}`} style={{ color: editingIncidentId ? 'var(--primary)' : 'var(--danger)', marginRight: '8px' }}></i>
                        {editingIncidentId ? 'Modifier l\'Incident' : 'Déclarer un Incident Compte'}
                    </span>
                    {editingIncidentId && (
                        <span className="badge badge-warning" style={{ fontSize: '12px' }}>
                            Édition Mode : #{editingIncidentId}
                        </span>
                    )}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid-3">
                        <div className="form-group">
                            <label>Compte Impacté</label>
                            <select value={compteId} onChange={(e) => setCompteId(e.target.value)} required>
                                <option value="">Sélectionner un compte...</option>
                                {comptes.map(c => (
                                    <option key={c.id} value={c.id}>{c.pseudo} ({c.agent})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Type d'Incident</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Limitation">Limitation temporaire</option>
                                <option value="Ban temporaire">Ban temporaire</option>
                                <option value="Ban définitif">Ban définitif</option>
                                <option value="Annonces masquées">Annonces masquées</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date & Heure du Blocage</label>
                            <input type="datetime-local" value={dateHeure} onChange={(e) => setDateHeure(e.target.value)} required />
                        </div>
                    </div>

                    {/* SECTION ACTIVITÉ ET NOTES PROVOQUANT L'INCIDENT */}
                    <div className="form-group" style={{ marginTop: '14px' }}>
                        <label>Notes & Activités Suspectes (Cause / Actions ayant pu provoquer l'incident)</label>
                        <input
                            type="text"
                            className="input"
                            value={notesActivites}
                            onChange={(e) => setNotesActivites(e.target.value)}
                            placeholder="ex: 5 republications rapides en 10 min, Changement d'IP Proxy Adspower, Message suspect Vinted..."
                        />
                    </div>

                    {/* SECTION CONDITIONNELLE ANNONCES MASQUÉES */}
                    {type === 'Annonces masquées' && (
                        <div className="grid-2" style={{ marginTop: '15px', background: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--danger)' }}>
                            <div className="form-group">
                                <label>Nombre d'Annonces Masquées</label>
                                <input type="number" min="1" value={nbAnnonces} onChange={(e) => setNbAnnonces(e.target.value)} placeholder="ex: 5" required />
                            </div>
                            <div className="form-group">
                                <label>SKU des Annonces Masquées</label>
                                <input type="text" value={skuAnnonces} onChange={(e) => setSkuAnnonces(e.target.value)} placeholder="ex: SKU-101, SKU-102" required />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <button type="submit" className={`btn ${editingIncidentId ? 'btn-primary' : 'btn-danger'}`}>
                            <i className={`fa-solid ${editingIncidentId ? 'fa-floppy-disk' : 'fa-triangle-exclamation'}`} style={{ marginRight: '6px' }}></i>
                            {editingIncidentId ? 'Mettre à jour l\'incident' : 'Enregistrer l\'incident'}
                        </button>
                        {editingIncidentId && (
                            <button type="button" className="btn btn-secondary" onClick={handleResetForm}>
                                Annuler la modification
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BULK ACTIONS FOR INCIDENTS */}
            {selectedIncidentIds.length > 0 && (
                <div style={{
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
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '13.5px' }}>
                        <span style={{ backgroundColor: '#09b1ba', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', color: '#fff' }}>
                            ✓ {selectedIncidentIds.length} incident{selectedIncidentIds.length > 1 ? 's' : ''}
                        </span>
                        <span>Actions en masse :</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkDeleteIncidentsAction}>
                            <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Supprimer ({selectedIncidentIds.length})
                        </button>

                        <button type="button" className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedIncidentIds([])}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* HISTORIQUE INCIDENTS */}
            <div className="card">
                <h3 className="card-title">Historique des Incidents</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={isAllIncidentsSelected} onChange={toggleSelectAllIncidents} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                </th>
                                <th>Date & Heure</th>
                                <th>Compte</th>
                                <th>Type</th>
                                <th>Pubs 24h Précédentes</th>
                                <th>Détail Ventes / Annonces</th>
                                <th>Cause Suspectée / Activités</th>
                                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.length > 0 ? (
                                incidents.map(inc => {
                                    const isAnnoncesMasquees = (inc.type === 'Annonces masquées');
                                    const badgeClass = isAnnoncesMasquees ? 'badge-warning' : (inc.type === 'Ban définitif' ? 'badge-banni' : 'badge-limite');
                                    const detailsCol = isAnnoncesMasquees
                                        ? `🙈 ${inc.nbAnnoncesMasquees || 0} annonces (SKU: ${inc.skuAnnoncesMasquees || 'Non renseigné'})`
                                        : `${inc.nbVentesConnues || 0} ventes (${(inc.detailVentes || []).join(', ')})`;

                                    const isCurrentlyEditing = (inc.id === editingIncidentId);

                                    return (
                                        <tr key={inc.id} style={{ backgroundColor: isCurrentlyEditing ? 'rgba(99, 102, 241, 0.12)' : (selectedIncidentIds.includes(inc.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent') }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={selectedIncidentIds.includes(inc.id)} onChange={() => toggleSelectIncident(inc.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                            </td>
                                            <td><b>{inc.dateBlocage}</b> {inc.heureBlocage}</td>
                                            <td><span className="badge badge-compte">{getComptePseudo(inc.compteId)}</span></td>
                                            <td><span className={`badge ${badgeClass}`}>{inc.type}</span></td>
                                            <td><b>{inc.nbPubs24h}</b> pubs</td>
                                            <td>{detailsCol}</td>
                                            <td>
                                                {inc.notesActivites ? (
                                                    <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                                                        📝 {inc.notesActivites}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                                        onClick={() => handleEditIncident(inc)}
                                                        title="Éditer les détails de cet incident"
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                                        onClick={() => {
                                                            if (window.confirm("Voulez-vous vraiment supprimer cet incident ?")) {
                                                                onBulkDeleteIncidents([inc.id]);
                                                            }
                                                        }}
                                                        title="Supprimer cet incident"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                 <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucun incident enregistré.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: PARAMETRES -------------------
function ParametresView({ appState, onSaveParametres }) {
    const p = appState.parametres || {};

    const [modePlanif, setModePlanif] = useState(p.modePlanification || 'intervalle');
    const [decalage, setDecalage] = useState(p.decalageMinutesEntreComptes || 60);
    const [margeAleatoire, setMargeAleatoire] = useState(p.margeAleatoireMinutes !== undefined ? p.margeAleatoireMinutes : 15);

    const [poidsVues, setPoidsVues] = useState((p.poidsScore && p.poidsScore.vues) || 0.1);
    const [poidsLikes, setPoidsLikes] = useState((p.poidsScore && p.poidsScore.likes) || 1);
    const [poidsFavoris, setPoidsFavoris] = useState((p.poidsScore && p.poidsScore.favoris) || 2);
    const [poidsMessages, setPoidsMessages] = useState((p.poidsScore && p.poidsScore.messages) || 5);
    const [poidsVente, setPoidsVente] = useState((p.poidsScore && p.poidsScore.vente) || 20);

    const [seuilEcarte, setSeuilEcarte] = useState((p.seuils && p.seuils.ecarte) || 15);
    const [seuilGagnant, setSeuilGagnant] = useState((p.seuils && p.seuils.gagnant) || 40);
    const [creneaux, setCreneaux] = useState(p.creneauxParJour || 3);
    const [delaiRepost, setDelaiRepost] = useState(p.delaiProchainRepostMinutes || 30);
    const [joursDefaut, setJoursDefaut] = useState(p.nbJoursPlanningParDefaut || 7);

    // Clé API Full Access DotB unique centralisée & Options Avancées
    const [dotbApiKey, setDotbApiKey] = useState(p.dotbApiKey || 'dotb_pk_pmXggjdukM3FR-YCw2cXsgug2YrtJa_0ZBX9s5J6Wf8');
    const [dotbPeriod, setDotbPeriod] = useState('all');
    const [dotbDataTypes, setDotbDataTypes] = useState(['items_published', 'items_drafts', 'items_hidden', 'messages', 'orders', 'views_likes', 'incidents']);

    const handleSubmit = (e) => {
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
                vente: parseFloat(poidsVente) || 0,
            },
            seuils: {
                ecarte: parseFloat(seuilEcarte) || 15,
                gagnant: parseFloat(seuilGagnant) || 40,
            },
            creneauxParJour: parseInt(creneaux) || 3,
            delaiProchainRepostMinutes: parseInt(delaiRepost) || 30,
            nbJoursPlanningParDefaut: parseInt(joursDefaut) || 7,
            dotbApiKey: dotbApiKey.trim()
        });
    };

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Paramètres Métier & Algorithmes</h2>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <h3 className="card-title">⚙️ Mode de Planification & Décalage Horaire des Publications</h3>
                    <div className="grid-3" style={{ marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>Mode d'Heure de Publication</label>
                            <select value={modePlanif} onChange={(e) => setModePlanif(e.target.value)}>
                                <option value="intervalle">⏱️ Temps Intervallé (Glissant avec décalage)</option>
                                <option value="aleatoire">🎲 Temps Randomisé (Intervalle aléatoire humanisé)</option>
                                <option value="fixe">📌 Temps Fixe (Heures fixes)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Décalage Min. entre Comptes (min)</label>
                            <input type="number" value={decalage} onChange={(e) => setDecalage(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Variation / Marge Aléatoire (± min)</label>
                            <input type="number" value={margeAleatoire} onChange={(e) => setMargeAleatoire(e.target.value)} />
                        </div>
                    </div>

                    <h3 className="card-title">📊 Pondération du Score & Seuils de Classification</h3>
                    <div className="grid-2">
                        <div className="form-group"><label>Poids : Vues</label><input type="number" step="0.1" value={poidsVues} onChange={(e) => setPoidsVues(e.target.value)} /></div>
                        <div className="form-group"><label>Poids : Favoris</label><input type="number" step="0.1" value={poidsFavoris} onChange={(e) => setPoidsFavoris(e.target.value)} /></div>
                    </div>
                    <div className="grid-2">
                        {/* <div className="form-group"><label>Poids : Messages</label><input type="number" step="0.1" value={poidsMessages} onChange={(e) => setPoidsMessages(e.target.value)} /></div> */}
                        <div className="form-group"><label>Poids : Vente Directe</label><input type="number" step="0.1" value={poidsVente} onChange={(e) => setPoidsVente(e.target.value)} /></div>
                    </div>

                    <div className="grid-3" style={{ marginTop: '16px' }}>
                        <div className="form-group"><label>Seuil Écarté (&lt;)</label><input type="number" value={seuilEcarte} onChange={(e) => setSeuilEcarte(e.target.value)} /></div>
                        <div className="form-group"><label>Seuil Gagnant (&gt;=)</label><input type="number" value={seuilGagnant} onChange={(e) => setSeuilGagnant(e.target.value)} /></div>
                        <div className="form-group"><label>Créneaux / Jour / Compte</label><input type="number" value={creneaux} onChange={(e) => setCreneaux(e.target.value)} /></div>
                        <div className="form-group"><label>Délai Prochain Repost (min)</label><input type="number" value={delaiRepost} onChange={(e) => setDelaiRepost(e.target.value)} /></div>
                        <div className="form-group"><label>Jours Planning par Défaut</label><input type="number" value={joursDefaut} onChange={(e) => setJoursDefaut(e.target.value)} /></div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', width: '100%', padding: '12px' }}>
                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                        Sauvegarder les Paramètres & Recalculer les Scores
                    </button>
                </form>
            </div>

            {/* INTÉGRATION API DOTB & BOT AUTOMATION */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-robot" style={{ color: 'var(--primary)' }}></i>
                    🤖 Préparation & Configuration de l'API DotB Automation
                </h3>
                {/* CHAMP CLÉ API UNIQUE ET SÉCURISÉE */}
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1.5px solid var(--primary)', marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>
                        🔑 Clé API Full Access DotB (Saisie unique globale)
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="input"
                            value={dotbApiKey}
                            onChange={(e) => setDotbApiKey(e.target.value)}
                            placeholder="ex: dotb_live_full_access_sec_8849"
                            style={{ flex: 1, minWidth: '240px', fontFamily: 'monospace', fontWeight: 600, height: '40px', fontSize: '13px' }}
                        />
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ height: '40px', fontSize: '12.5px' }}
                            onClick={() => {
                                const newKey = 'dotb_live_sec_' + Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
                                setDotbApiKey(newKey);
                                if (window.showToast) window.showToast("🔑 Nouvelle clé API DotB générée ! N'oubliez pas de sauvegarder.");
                            }}
                        >
                            🎲 Générer une clé
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ height: '40px', fontSize: '12.5px' }}
                            onClick={() => {
                                navigator.clipboard.writeText(dotbApiKey);
                                if (window.showToast) window.showToast("📋 Clé API DotB copiée dans le presse-papier !");
                            }}
                        >
                            📋 Copier la clé
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                        Cette clé unique donne un accès complet (Full Access) à DotB pour envoyer les vues, likes, favoris, ventes, articles et auto-détecter les incidents sur tous vos comptes Vinted.
                    </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    {/* OPTIONS AVANCÉES DE SYNCHRO : PÉRIODE ET TYPES DE DONNÉES */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '16px', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div>
                            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'block' }}>
                                📅 Période des Données à Récupérer :
                            </label>
                            <select
                                className="select"
                                value={dotbPeriod}
                                onChange={(e) => setDotbPeriod(e.target.value)}
                                style={{ width: '100%', fontSize: '12.5px', height: '36px' }}
                            >
                                <option value="today">Aujourd'hui (Dernières 24h)</option>
                                <option value="7days">7 Derniers Jours</option>
                                <option value="30days">30 Derniers Jours</option>
                                <option value="all">Tout l'historique (Complet)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'block' }}>
                                📦 Types de Données à Récupérer :
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={dotbDataTypes.includes('items_published')} onChange={(e) => {
                                        setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_published'] : prev.filter(t => t !== 'items_published'));
                                    }} /> 🟢 Publiés & SKUs
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={dotbDataTypes.includes('items_drafts')} onChange={(e) => {
                                        setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_drafts'] : prev.filter(t => t !== 'items_drafts'));
                                    }} /> 📝 Brouillons
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={dotbDataTypes.includes('items_hidden')} onChange={(e) => {
                                        setDotbDataTypes(prev => e.target.checked ? [...prev, 'items_hidden'] : prev.filter(t => t !== 'items_hidden'));
                                    }} /> 🚫 Masqués
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={dotbDataTypes.includes('messages')} onChange={(e) => {
                                        setDotbDataTypes(prev => e.target.checked ? [...prev, 'messages'] : prev.filter(t => t !== 'messages'));
                                    }} /> 💬 Messages
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="checkbox" checked={dotbDataTypes.includes('orders')} onChange={(e) => {
                                        setDotbDataTypes(prev => e.target.checked ? [...prev, 'orders'] : prev.filter(t => t !== 'orders'));
                                    }} /> 🛒 Ventes
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <span className="badge badge-gagnant" style={{ fontSize: '12px', padding: '4px 10px' }}>
                                🟢 Service API DotB Actif
                            </span>
                            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                Endpoint: <code>POST /api/dotb/fetch-live</code>
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ fontSize: '12px', padding: '6px 14px', backgroundColor: '#09b1ba', borderColor: '#09b1ba' }}
                                onClick={async () => {
                                    try {
                                        if (window.showToast) window.showToast(`⏳ Synchro DotB Cloud v1 (${dotbPeriod}, ${dotbDataTypes.length} types) en cours...`);
                                        const res = await fetch('/api/dotb/fetch-live', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
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
                                }}
                            >
                                ⚡ Synchro Directe API DotB Cloud (33 Comptes)
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                                onClick={async () => {
                                try {
                                    const res = await fetch('/api/dotb/sync', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
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
                                            items: [
                                                { sku: 'sz26001', title: 'Robe Rose Bonbon', price: '25 €', vues: 160, likes: 15, statut: 'publié' }
                                            ]
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.success && window.showToast) {
                                        window.showToast(`✅ Test API DotB réussi pour @${data.pseudo} !`);
                                        if (window.loadAppState) await window.loadAppState();
                                    }
                                } catch (err) {
                                }
                            }}
                        >
                            🧪 Tester la synchro DotB (@julia_rent)
                        </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        📘 Documentation officielle de l'API DotB v1 : <a href="https://dotb.io/api/public/v1/docs?token=dotb_pk_pmXggjdukM3FR-YCw2cXsgug2YrtJa_0ZBX9s5J6Wf8" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>https://dotb.io/api/public/v1/docs</a>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Champs & Métriques Collectés par l'API DotB :</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>👁️ <b>Vues Totales & par SKU</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>❤️ <b>Likes & Favoris</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>💬 <b>Messages Non Lus</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>🛒 <b>Ventes Réalisées</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>📦 <b>Articles Actifs / Brouillons</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>🚫 <b>Articles Masqués & Bloqués</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>🚨 <b>Auto-Détection des Incidents</b></div>
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>🏷️ <b>Qualifications SKUs Auto</b></div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>// Exemple de requête JSON transmise par le Bot DotB ou cURL :</div>
                    <pre style={{ margin: 0 }}>{`curl -X POST https://vintedmanager-bkgg.vercel.app/api/dotb/sync \\
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
  }'`}</pre>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: LOGIN -------------------
function LoginView({ onLoginSubmit, loginError }) {
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLoginSubmit(loginInput, password);
    };

    return (
        <div style={{
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
        }}>
            <div style={{
                maxWidth: '440px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '36px 32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                borderTop: '6px solid var(--primary-color)',
                margin: 'auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
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
                    }}>V</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Vinted Manager</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Connectez-vous pour accéder au tableau de bord</p>
                </div>

                {loginError && (
                    <div style={{
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
                    }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '18px', color: '#ef4444' }}></i>
                        <span>{loginError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px', fontSize: '13px' }}>Adresse Email ou Nom d'utilisateur</label>
                        <input type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} placeholder="Nom d'utilisateur ou Email" required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '22px' }}>
                        <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px', fontSize: '13px' }}>Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 600, borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(9, 177, 186, 0.3)' }}>
                        <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '8px' }}></i> Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}

// ------------------- VIEW: UTILISATEURS -------------------
function UtilisateursView({ currentUser, appState, onSaveUser, onDeleteUser, onBulkDeleteUsers }) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const userOrgId = (currentUser && currentUser.organisationId) || 'org_default';

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
        if (isAllUsersSelected) setSelectedUserIds([]);
        else setSelectedUserIds(visibleUsers.map(u => u.id));
    };

    const toggleSelectUser = (id) => {
        setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDeleteUsersAction = async () => {
        if (selectedUserIds.length === 0 || !onBulkDeleteUsers) return;
        if (window.confirm(`Voulez-vous vraiment supprimer ces ${selectedUserIds.length} utilisateurs sélectionnés ?`)) {
            await onBulkDeleteUsers(selectedUserIds);
            setSelectedUserIds([]);
        }
    };

    const handleEdit = (u) => {
        setUserId(u.id);
        setNom(u.nom);
        setEmail(u.email);
        setRole(isAdmin ? u.role : 'agent');
        setOrganisationId(isAdmin ? (u.organisationId || 'org_default') : userOrgId);
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

    const handleSubmit = (e) => {
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

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Gestion des Utilisateurs & Agents</h2>

            {/* FORMULAIRE UTILISATEUR */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">{userId ? 'Modifier l\'agent' : 'Ajouter un nouveau profil Agent'}</h3>
                {!isAdmin && (
                    <p style={{ fontSize: '12px', color: 'var(--info)', marginBottom: '16px', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px' }}>
                        <i className="fa-solid fa-circle-info"></i> En tant qu'<strong>Admin</strong>, vous pouvez créer uniquement des profils <strong>Agent de publication</strong> pour votre organisation.
                    </p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid-3">
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Van Quy Dang" required />
                        </div>
                        <div className="form-group">
                            <label>Adresse Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: vanquydang905@gmail.com" required />
                        </div>
                        <div className="form-group">
                            <label>Rôle</label>
                            <select value={isAdmin ? role : 'agent'} onChange={(e) => setRole(e.target.value)} disabled={!isAdmin}>
                                {isAdmin && <option value="admin">Admin (Global)</option>}
                                {isAdmin && <option value="cadre">Admin (Organisation)</option>}
                                <option value="agent">Agent de publication</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="form-group">
                            <label>Organisation</label>
                            <select value={isAdmin ? organisationId : userOrgId} onChange={(e) => setOrganisationId(e.target.value)} disabled={!isAdmin}>
                                {organisations.map(o => (
                                    <option key={o.id} value={o.id}>{o.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Agent Assigné / Code</label>
                            <input type="text" value={agentAssigne} onChange={(e) => setAgentAssigne(e.target.value)} placeholder="Laissez vide pour utiliser le nom" />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" required />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Canal de Contact Direct</label>
                            <select value={contactType} onChange={(e) => setContactType(e.target.value)}>
                                <option value="WhatsApp">WhatsApp Messenger / Business</option>
                                <option value="Signal">Signal Private Messenger</option>
                                <option value="Telegram">Telegram</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Numéro ou Pseudo ({contactType})</label>
                            <input type="text" value={contactNumero} onChange={(e) => setContactNumero(e.target.value)} placeholder={contactType === 'Telegram' ? '@mon_pseudo ou +33612345678' : '+33612345678'} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary">
                            <i className="fa-solid fa-user-plus"></i> Enregistrer l'agent
                        </button>
                        {userId && (
                            <button type="button" className="btn btn-secondary" onClick={handleReset}>Annuler</button>
                        )}
                    </div>
                </form>
            </div>

            {/* BULK ACTIONS FOR USERS */}
            {selectedUserIds.length > 0 && (
                <div style={{
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
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '13.5px' }}>
                        <span style={{ backgroundColor: '#09b1ba', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', color: '#fff' }}>
                            ✓ {selectedUserIds.length} utilisateur{selectedUserIds.length > 1 ? 's' : ''}
                        </span>
                        <span>Actions en masse :</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkDeleteUsersAction}>
                            <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Supprimer ({selectedUserIds.length})
                        </button>

                        <button type="button" className="btn btn-sm btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedUserIds([])}>
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* TABLEAU DES UTILISATEURS */}
            <div className="card">
                <h3 className="card-title">Liste des Utilisateurs / Agents ({visibleUsers.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={isAllUsersSelected} onChange={toggleSelectAllUsers} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                </th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Organisation</th>
                                <th>Contact Direct</th>
                                <th>Agent Assigné</th>
                                <th>Date Création</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.length > 0 ? (
                                visibleUsers.map(u => (
                                    <tr key={u.id} style={{ backgroundColor: selectedUserIds.includes(u.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelectUser(u.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                        </td>
                                        <td><b>{u.nom}</b></td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className="badge" style={{
                                                background: u.role === 'admin' ? '#9333ea' : (u.role === 'cadre' ? '#0284c7' : '#16a34a'),
                                                color: 'white'
                                            }}>
                                                {u.role === 'admin' ? 'Admin' : (u.role === 'cadre' ? 'Admin' : 'Agent')}
                                            </span>
                                        </td>
                                        <td><span className="badge badge-compte">{((organisations.find(o => o.id === u.organisationId) || {}).nom) || u.organisationId || 'Par défaut'}</span></td>
                                        <td>
                                            {u.contactNumero ? (
                                                <a
                                                    href={
                                                        u.contactType === 'Telegram'
                                                            ? (u.contactNumero.startsWith('@') ? `https://t.me/${u.contactNumero.replace('@', '')}` : `https://t.me/${u.contactNumero.replace(/\s+/g, '')}`)
                                                            : (u.contactType === 'WhatsApp' ? `https://wa.me/${u.contactNumero.replace(/[^0-9]/g, '')}` : `tel:${u.contactNumero}`)
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="badge"
                                                    style={{
                                                        background: u.contactType === 'WhatsApp' ? '#25d366' : (u.contactType === 'Telegram' ? '#0088cc' : '#3a76f0'),
                                                        color: 'white',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        textDecoration: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '11px',
                                                        padding: '3px 8px'
                                                    }}
                                                    title={`Ouvrir dans ${u.contactType || 'WhatsApp'}`}
                                                >
                                                    <i className={
                                                        u.contactType === 'WhatsApp' ? 'fa-brands fa-whatsapp' : (u.contactType === 'Telegram' ? 'fa-brands fa-telegram' : 'fa-solid fa-comment-dots')
                                                    }></i>
                                                    {u.contactNumero}
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                                            )}
                                        </td>
                                        <td>{u.agentAssigne || u.nom}</td>
                                        <td>{u.dateCreation || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleEdit(u)} title="Éditer">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => onDeleteUser(u.id)} title="Supprimer">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: ORGANISATIONS -------------------
function OrganisationsView({ appState, onSaveOrg, onDeleteOrg }) {
    const [orgId, setOrgId] = useState('');
    const [nom, setNom] = useState('');
    const organisations = appState.organisations || [];

    const handleEdit = (o) => {
        setOrgId(o.id);
        setNom(o.nom);
    };

    const handleReset = () => {
        setOrgId('');
        setNom('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nom) return;
        if (orgId) {
            onSaveOrg({ id: orgId, nom, isEdit: true });
        } else {
            onSaveOrg({ id: 'org_' + Date.now(), nom, dateCreation: new Date().toISOString().split('T')[0] });
        }
        handleReset();
    };

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Gestion des Organisations Multi-Tenancy</h2>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">{orgId ? 'Modifier l\'organisation' : 'Ajouter une nouvelle organisation'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Nom de l'organisation</label>
                        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Agence Lyon" required />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <i className="fa-solid fa-floppy-disk"></i> {orgId ? 'Enregistrer Modification' : 'Créer Organisation'}
                    </button>
                    {orgId && (
                        <button type="button" className="btn btn-secondary" onClick={handleReset}>Annuler</button>
                    )}
                </form>
            </div>

            <div className="card">
                <h3 className="card-title">Organisations Actives ({organisations.length})</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Code ID</th>
                                <th>Nom de l'organisation</th>
                                <th>Date Création</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organisations.map(o => (
                                <tr key={o.id}>
                                    <td><code>{o.id}</code></td>
                                    <td><b>{o.nom}</b></td>
                                    <td>{o.dateCreation || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(o)} title="Éditer le nom">
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            {o.id !== 'org_default' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => onDeleteOrg(o.id)} title="Supprimer">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: CLASSEMENT & STATS -------------------
function ClassementView({ appState, onUpdateRow }) {
    const calendrier = appState.calendrier || [];
    const [newSkuInput, setNewSkuInput] = useState('');
    const [newClassifInput, setNewClassifInput] = useState('Nouveau produit');
    const [skuSearchTerm, setSkuSearchTerm] = useState('');
    const [skuFilterClassif, setSkuFilterClassif] = useState('');
    const [skuFilterVentes, setSkuFilterVentes] = useState('all');
    const [skuSortBy, setSkuSortBy] = useState('score');

    // CSV Import State
    const [csvInputText, setCsvInputText] = useState('');
    const [isImportingCsv, setIsImportingCsv] = useState(false);
    const [csvImportResult, setCsvImportResult] = useState(null);

    // SKU Detail & Propagation Modal State
    const [selectedSkuDetail, setSelectedSkuDetail] = useState(null);
    const [modalActiveTab, setModalActiveTab] = useState('accounts'); // 'accounts' | 'chart' | 'propagation'
    const [propagationMode, setPropagationMode] = useState('optimal'); // 'immediate' | 'staggered' | 'optimal'
    const [selectedAccountsToPropagate, setSelectedAccountsToPropagate] = useState([]);
    const [isPropagating, setIsPropagating] = useState(false);

    const handlePropagateSku = async (skuCode) => {
        if (selectedAccountsToPropagate.length === 0) return;
        setIsPropagating(true);
        const userOrgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';

        try {
            const res = await fetch('/api/sku/propagate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        } catch(err) {
            console.error("Erreur propagation:", err);
            if (window.showToast) window.showToast("❌ Erreur réseau lors de la propagation");
        } finally {
            setIsPropagating(false);
        }
    };


    const handleImportCsvOrders = async (e) => {
        e.preventDefault();
        if (!csvInputText.trim()) return;
        setIsImportingCsv(true);
        setCsvImportResult(null);

        const userOrgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';

        try {
            const res = await fetch('/api/import-orders-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvText: csvInputText, organisationId: userOrgId })
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

    const handleFileUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            setCsvInputText(evt.target.result || '');
        };
        reader.readAsText(file);
    };


    const comptesAll = appState.comptes || [];
    const comptesMap = useMemo(() => {
        const map = {};
        comptesAll.forEach(c => { map[c.id] = c; });
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


    // Répertoire des SKUs filtré par période
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
                    accountsSet: new Set(),
                    priceSet: new Set(),
                    lineIds: []
                };
            }
            if (l.produit && (!map[skuClean].produit || map[skuClean].produit.length < l.produit.length)) {
                map[skuClean].produit = l.produit;
            }
            map[skuClean].scoreCumule += (l.score || 0);
            map[skuClean].ventes += (l.vente || 0);
            map[skuClean].pubs += 1;
            map[skuClean].lineIds.push(l.id);
            if (l.classification) map[skuClean].classification = l.classification;

            const comp = comptesMap[l.compteId];
            if (comp && comp.pseudo) map[skuClean].accountsSet.add('@' + comp.pseudo.trim());
            else if (l.comptePseudo) map[skuClean].accountsSet.add('@' + l.comptePseudo.trim());

            if (l.prix) map[skuClean].priceSet.add(l.prix + '€');
        });
        return map;
    }, [filteredCalendrierForRanking, comptesMap]);


    // API SKU Summary State (Real DotB Cloud Sales & Publications Metrics)
    const [apiSkuSummary, setApiSkuSummary] = useState([]);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/sku/summary')
            .then(res => res.json())
            .then(data => {
                if (isMounted && Array.isArray(data)) {
                    setApiSkuSummary(data);
                }
            })
            .catch(err => console.warn("Err fetching SKU summary:", err));
        return () => { isMounted = false; };
    }, [calendrier]);

    const skuList = useMemo(() => {
        if (apiSkuSummary && apiSkuSummary.length > 0) {
            return apiSkuSummary.map(s => ({
                sku: s.sku,
                produit: s.produit,
                classification: s.classification,
                scoreCumule: s.scoreCumule || s.score || 0,
                ventes: s.ventes || 0,
                pubs: s.pubs || 1,
                accountsStr: s.accountsStr || 'Non spécifié',
                pricesStr: s.priceStr || s.pricesStr || '-',
                isMultiAccount: s.isMultiAccount,
                accountBreakdown: s.accountBreakdown || [],
                salesTimeline: s.salesTimeline || []
            }));
        }


        return Object.values(allSKUsMap).map(s => {
            const accs = Array.from(s.accountsSet);
            const prices = Array.from(s.priceSet);
            return {
                ...s,
                accountsStr: accs.length > 0 ? accs.join(', ') : 'Non spécifié',
                pricesStr: prices.length > 0 ? prices.slice(0, 2).join(' - ') : '-'
            };
        });
    }, [apiSkuSummary, allSKUsMap]);


    const filteredSKUList = useMemo(() => {
        let list = [...skuList];

        if (skuFilterClassif) {
            list = list.filter(s => s.classification === skuFilterClassif);
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
            list = list.filter(s => 
                s.sku.toLowerCase().includes(q) || 
                (s.produit && s.produit.toLowerCase().includes(q)) ||
                (s.classification && s.classification.toLowerCase().includes(q)) ||
                (s.accountsStr && s.accountsStr.toLowerCase().includes(q))
            );
        }

        if (skuSortBy === 'score') list.sort((a, b) => b.scoreCumule - a.scoreCumule);
        else if (skuSortBy === 'ventes') list.sort((a, b) => b.ventes - a.ventes);
        else if (skuSortBy === 'pubs') list.sort((a, b) => b.pubs - a.pubs);
        else if (skuSortBy === 'sku') list.sort((a, b) => a.sku.localeCompare(b.sku));

        return list;
    }, [skuList, skuSearchTerm, skuFilterClassif, skuFilterVentes, skuSortBy]);

    const topSKUs = useMemo(() => {
        return [...skuList].sort((a, b) => b.scoreCumule - a.scoreCumule).slice(0, 10);
    }, [skuList]);

    const topHours = useMemo(() => {
        const hours = {};
        calendrier.forEach(l => {
            if (!l.heurePrevue) return;
            const h = l.heurePrevue;
            if (!hours[h]) hours[h] = { heure: h, pubs: 0, scoreTotal: 0, ventes: 0 };
            hours[h].pubs += 1;
            hours[h].scoreTotal += (l.score || 0);
            hours[h].ventes += (l.vente || 0);
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
            statsMap[key].ventes += (l.vente || 0);
            statsMap[key].scoreTotal += (l.score || 0);
        });

        return Object.values(statsMap).filter(a => a.name !== 'Bot DotB' && a.name !== 'À attribuer').map(a => {
            const taux = a.pubsTotales > 0 ? Math.round((a.pubsFaites / a.pubsTotales) * 100) : 0;
            
            // Logique de classification des Agents (même niveau de présentation que les SKUs)
            let classification = '🌟 Nouvel Agent';
            if (a.scoreTotal >= 1000 || a.ventes >= 10 || (taux >= 80 && a.pubsTotales >= 20)) {
                classification = '🏆 Agent Top';
            } else if (a.scoreTotal >= 200 || a.ventes >= 2 || (taux >= 50 && a.pubsFaites >= 5)) {
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
        const counts = { total: agentRanking.length, top: 0, progression: 0, nouveau: 0, inactif: 0 };
        agentRanking.forEach(a => {
            if (a.classification === '🏆 Agent Top') counts.top++;
            else if (a.classification === '⚡ En Progression') counts.progression++;
            else if (a.classification === '🌟 Nouvel Agent') counts.nouveau++;
            else if (a.classification === '🛑 Inactif') counts.inactif++;
        });
        return counts;
    }, [agentRanking]);



    const handleRegisterSKU = async (e) => {
        e.preventDefault();
        if (!newSkuInput.trim()) return;
        const skuClean = newSkuInput.trim();
        const userOrgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';

        try {
            const res = await fetch('/api/sku/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sku: skuClean, classification: newClassifInput, organisationId: userOrgId })
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

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Classements & Gestion des SKUs</h2>

            {/* BARRE DE FILTRE TEMPOREL / PERIODE DE CLASSEMENT */}
            <div className="card" style={{ marginBottom: '24px', padding: '18px 24px', borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#2563eb', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                            <i className="fa-solid fa-calendar-range"></i>
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '15.5px', color: '#ffffff', fontWeight: 700 }}>
                                Période d'Analyse du Classement & Performances
                            </h4>
                            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                                {rankingDateFilter === 'all' ? 'Toutes les données historiques' :
                                 rankingDateFilter === 'custom' ? `Période personnalisée du ${customStartDate || 'début'} au ${customEndDate || 'fin'}` :
                                 `Derniers ${rankingDateFilter} jour(s)`}
                            </span>
                        </div>
                    </div>

                    {/* PILLS DE FILTRE TEMPOREL (1j, 2j, 3j, 1 semaine, 2 semaines, 30j, Custom, Tout) */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                            { id: 'all', label: '🌐 Tout', title: 'Historique complet' },
                            { id: '1', label: '📅 Aujourd\'hui (1j)', title: 'Dernières 24 heures' },
                            { id: '2', label: '⏱️ 2 Jours', title: 'Derniers 2 jours' },
                            { id: '3', label: '⏱️ 3 Jours', title: 'Derniers 3 jours' },
                            { id: '7', label: '🗓️ 1 Semaine (7j)', title: 'Derniers 7 jours' },
                            { id: '14', label: '🗓️ 2 Semaines (14j)', title: 'Derniers 14 jours' },
                            { id: '30', label: '📊 Ce Mois (30j)', title: 'Derniers 30 jours' },
                            { id: 'custom', label: '📆 Personnalisé', title: 'Définir une plage de dates exacte' }
                        ].map(btn => {
                            const isActive = rankingDateFilter === btn.id;
                            return (
                                <button
                                    key={btn.id}
                                    type="button"
                                    onClick={() => setRankingDateFilter(btn.id)}
                                    title={btn.title}
                                    style={{
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
                                    }}
                                >
                                    {btn.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SÉLECTEUR DE DATES PERSONNALISÉES QUAND LA PILL "PERSONNALISÉ" EST ACTIVE */}
                {rankingDateFilter === 'custom' && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Du :</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="input"
                                style={{ backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #475569', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', width: 'auto', colorScheme: 'dark' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Au :</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="input"
                                style={{ backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #475569', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', width: 'auto', colorScheme: 'dark' }}
                            />
                        </div>
                        {(customStartDate || customEndDate) && (
                            <button
                                type="button"
                                onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                <i className="fa-solid fa-rotate-left" style={{ marginRight: '6px' }}></i> Réinitialiser les dates
                            </button>
                        )}
                    </div>
                )}
            </div>


            {/* CLASSEMENT & CLASSIFICATION DES AGENTS */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }}></i>
                        Classement & Classification des Agents
                    </h3>

                    {/* BADGES RÉSUMÉ CLASSIFICATION DES AGENTS */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge badge-gagnant" style={{ padding: '6px 12px', fontSize: '12px' }}>🏆 {agentClassifCounts.top} Top Agent{agentClassifCounts.top > 1 ? 's' : ''}</span>
                        <span className="badge badge-retester" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6', color: '#fff' }}>⚡ {agentClassifCounts.progression} En Progression</span>
                        <span className="badge badge-nouveau" style={{ padding: '6px 12px', fontSize: '12px' }}>🌟 {agentClassifCounts.nouveau} Nouveau{agentClassifCounts.nouveau > 1 ? 'x' : ''}</span>
                        <span className="badge badge-ecarte" style={{ padding: '6px 12px', fontSize: '12px' }}>🛑 {agentClassifCounts.inactif} Inactif{agentClassifCounts.inactif > 1 ? 's' : ''}</span>
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                    Suivi en temps réel et classification des agents selon leur volume de publications, leur taux de réussite et leur score de ventes.
                </p>

                {/* FILTRES PAR CLASSIFICATION D'AGENT (MÊME LOGIQUE DE PRÉSENTATION QUE LES SKUS) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <button
                        type="button"
                        className={`btn ${agentFilterClassif === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAgentFilterClassif('all')}
                        style={{ height: '34px', fontSize: '12.5px', padding: '0 14px' }}
                    >
                        Tous ({agentClassifCounts.total})
                    </button>
                    <button
                        type="button"
                        className={`btn ${agentFilterClassif === '🏆 Agent Top' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAgentFilterClassif('🏆 Agent Top')}
                        style={{ height: '34px', fontSize: '12.5px', padding: '0 14px', backgroundColor: agentFilterClassif === '🏆 Agent Top' ? '#10b981' : '#fff', borderColor: '#10b981', color: agentFilterClassif === '🏆 Agent Top' ? '#fff' : '#047857' }}
                    >
                        🏆 Agent Top ({agentClassifCounts.top})
                    </button>
                    <button
                        type="button"
                        className={`btn ${agentFilterClassif === '⚡ En Progression' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAgentFilterClassif('⚡ En Progression')}
                        style={{ height: '34px', fontSize: '12.5px', padding: '0 14px', backgroundColor: agentFilterClassif === '⚡ En Progression' ? '#3b82f6' : '#fff', borderColor: '#3b82f6', color: agentFilterClassif === '⚡ En Progression' ? '#fff' : '#1d4ed8' }}
                    >
                        ⚡ En Progression ({agentClassifCounts.progression})
                    </button>
                    <button
                        type="button"
                        className={`btn ${agentFilterClassif === '🌟 Nouvel Agent' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAgentFilterClassif('🌟 Nouvel Agent')}
                        style={{ height: '34px', fontSize: '12.5px', padding: '0 14px', backgroundColor: agentFilterClassif === '🌟 Nouvel Agent' ? '#f59e0b' : '#fff', borderColor: '#f59e0b', color: agentFilterClassif === '🌟 Nouvel Agent' ? '#fff' : '#b45309' }}
                    >
                        🌟 Nouvel Agent ({agentClassifCounts.nouveau})
                    </button>
                    <button
                        type="button"
                        className={`btn ${agentFilterClassif === '🛑 Inactif' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAgentFilterClassif('🛑 Inactif')}
                        style={{ height: '34px', fontSize: '12.5px', padding: '0 14px', backgroundColor: agentFilterClassif === '🛑 Inactif' ? '#ef4444' : '#fff', borderColor: '#ef4444', color: agentFilterClassif === '🛑 Inactif' ? '#fff' : '#b91c1c' }}
                    >
                        🛑 Inactif ({agentClassifCounts.inactif})
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Rang</th>
                                <th>Agent</th>
                                <th>Classification</th>
                                <th>Publications</th>
                                <th>Taux Réussite</th>
                                <th>Ventes Total</th>
                                <th>Score Cumulé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgentRanking.length > 0 ? (
                                filteredAgentRanking.map((a, idx) => (
                                    <tr key={a.name}>
                                        <td>
                                            {idx === 0 ? <span style={{ fontSize: '18px' }} title="1er Place">🥇</span> :
                                             idx === 1 ? <span style={{ fontSize: '18px' }} title="2ème Place">🥈</span> :
                                             idx === 2 ? <span style={{ fontSize: '18px' }} title="3ème Place">🥉</span> :
                                             <b>#{idx + 1}</b>}
                                        </td>
                                        <td>
                                            <b style={{ color: 'var(--text-primary)' }}>{a.name}</b>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({a.role})</span>
                                        </td>
                                        <td>
                                            {a.classification === '🏆 Agent Top' ? (
                                                <span className="badge badge-gagnant">🏆 Agent Top</span>
                                            ) : a.classification === '⚡ En Progression' ? (
                                                <span className="badge badge-retester" style={{ backgroundColor: '#3b82f6', color: '#fff' }}>⚡ En Progression</span>
                                            ) : a.classification === '🌟 Nouvel Agent' ? (
                                                <span className="badge badge-nouveau">🌟 Nouvel Agent</span>
                                            ) : (
                                                <span className="badge badge-ecarte">🛑 Inactif</span>
                                            )}
                                        </td>
                                        <td>
                                            <b>{a.pubsFaites}</b> / {a.pubsTotales} pub{a.pubsTotales > 1 ? 's' : ''}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden', minWidth: '60px' }}>
                                                    <div style={{ width: `${a.taux}%`, backgroundColor: a.taux >= 80 ? '#10b981' : a.taux >= 50 ? '#f59e0b' : '#ef4444', height: '100%' }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{a.taux}%</span>
                                            </div>
                                        </td>
                                        <td><b>{a.ventes}</b> vente{a.ventes > 1 ? 's' : ''}</td>
                                        <td><span className="badge badge-gagnant">{a.scoreTotal.toFixed(1)} pts</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                                        Aucun agent correspondant à ce filtre de classification.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* IMPORTATION DES COMMANDES CSV (ANTI-DOUBLONS) */}
            <div className="card" style={{ marginBottom: '24px', border: '1px solid #cbd5e1', background: 'linear-gradient(to right, #ffffff, #f8fafc)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                    <i className="fa-solid fa-file-csv" style={{ color: '#2563eb', fontSize: '22px' }}></i>
                    Importation de Commandes CSV DotB Cloud (Anti-Doublons & Auto-SKU)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px', lineHeight: '1.5' }}>
                    Importez directement vos exports de commandes DotB Cloud (19 colonnes). Les commandes déjà existantes seront <b>automatiquement filtrées (anti-doublons)</b> et les <b>SKUs manquants auto-générés</b> avant d'être stockés en base de données.
                </p>

                <form onSubmit={handleImportCsvOrders} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '40px', fontSize: '13px', padding: '0 18px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#2563eb' }}></i> Sélectionner un fichier CSV (.csv)
                            <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ou collez les données CSV brutes ci-dessous :</span>
                    </div>

                    <textarea
                        className="input"
                        rows="5"
                        value={csvInputText}
                        onChange={(e) => setCsvInputText(e.target.value)}
                        placeholder={"Collez votre export CSV DotB ici...\nEx:\nID Transaction,Date de commande,Compte,Statut,...\n17967064088,2026-02-09 10:38:00,alchemy354,Suspendu,..."}
                        style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.45', backgroundColor: '#fff', border: '1px solid #cbd5e1' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isImportingCsv || !csvInputText.trim()}
                            style={{ height: '42px', padding: '0 24px', fontSize: '13.5px', fontWeight: 600, backgroundColor: '#2563eb', border: 'none', borderRadius: '8px' }}
                        >
                            {isImportingCsv ? (
                                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Filtrage Doublons & Stockage Base...</span>
                            ) : (
                                <span><i className="fa-solid fa-database" style={{ marginRight: '8px' }}></i> Lancer l'importation & Stocker en Base</span>
                            )}
                        </button>

                        {csvImportResult && (
                            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 600, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge badge-gagnant" style={{ padding: '6px 12px' }}>📥 {csvImportResult.insertedCount} Créées</span>
                                <span className="badge badge-retester" style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff' }}>🔄 {csvImportResult.updatedCount || 0} Mises à jour</span>
                                <span className="badge badge-ecarte" style={{ padding: '6px 12px' }}>🛑 {csvImportResult.duplicateCount} Inchangées</span>
                                <span className="badge badge-nouveau" style={{ padding: '6px 12px' }}>✨ {csvImportResult.generatedSkusCount} SKUs Générés</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* SECTION DÉDIÉE SKU AVEC CLASSIFICATION */}
            <div className="card" style={{ marginBottom: '24px' }}>

                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-boxes-packing" style={{ color: 'var(--primary)' }}></i>
                    Enregistrement & Répertoire des SKU avec Classification
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                    Enregistrez vos SKU et définissez directement leur classification (Nouveau produit, Gagnant, À retester, Écarté).
                </p>

                {/* FORMULAIRE D'AJOUT SKU */}
                <form onSubmit={handleRegisterSKU} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 2, minWidth: '180px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px', display: 'block' }}>Code SKU</label>
                        <input
                            type="text"
                            className="input"
                            value={newSkuInput}
                            onChange={(e) => setNewSkuInput(e.target.value)}
                            placeholder="ex: sz26001, SKU-JEAN-02"
                            required
                            style={{ height: '40px', fontSize: '13px' }}
                        />
                    </div>
                    <div style={{ flex: 2, minWidth: '180px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px', display: 'block' }}>Classification</label>
                        <select
                            className="input"
                            value={newClassifInput}
                            onChange={(e) => setNewClassifInput(e.target.value)}
                            style={{ height: '40px', fontSize: '13px' }}
                        >
                            <option value="Nouveau produit">✨ Nouveau produit</option>
                            <option value="Gagnant">🏆 Gagnant</option>
                            <option value="À retester">🔄 À retester</option>
                            <option value="Écarté">🚫 Écarté</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '40px', padding: '0 20px', fontSize: '13px' }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Enregistrer SKU
                    </button>
                </form>

                {/* TABLEAU DES SKUS ET CLASSIFICATIONS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Catalogue des SKUs Qualifiés ({filteredSKUList.length})</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="input"
                            value={skuFilterClassif}
                            onChange={(e) => setSkuFilterClassif(e.target.value)}
                            style={{ height: '34px', fontSize: '12px', width: '170px', borderRadius: '6px', border: skuFilterClassif ? '1.5px solid var(--primary)' : '1px solid var(--border)' }}
                        >
                            <option value="">Toutes les classifications</option>
                            <option value="Gagnant">🏆 Produit Gagnant</option>
                            <option value="Nouveau produit">✨ Nouveau produit</option>
                            <option value="À retester">🔄 À retester</option>
                            <option value="Écarté">🚫 Écarté</option>
                        </select>
                        <select
                            className="input"
                            value={skuFilterVentes}
                            onChange={(e) => setSkuFilterVentes(e.target.value)}
                            style={{ height: '34px', fontSize: '12px', width: '160px', borderRadius: '6px', border: skuFilterVentes !== 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)' }}
                        >
                            <option value="all">Toutes les ventes</option>
                            <option value="with_sales">💰 Avec Ventes (&gt;0)</option>
                            <option value="top_sales">🔥 Best-Sellers (&ge;3)</option>
                            <option value="no_sales">⚪ Sans Vente (0)</option>
                        </select>
                        <select
                            className="input"
                            value={skuSortBy}
                            onChange={(e) => setSkuSortBy(e.target.value)}
                            style={{ height: '34px', fontSize: '12px', width: '150px', borderRadius: '6px' }}
                        >
                            <option value="score">Trier par Score</option>
                            <option value="ventes">Trier par Ventes</option>
                            <option value="pubs">Trier par Pubs</option>
                            <option value="sku">Trier par Code SKU</option>
                        </select>
                        <input
                            type="text"
                            className="input"
                            value={skuSearchTerm}
                            onChange={(e) => setSkuSearchTerm(e.target.value)}
                            placeholder="🔍 Filtrer par SKU, Titre ou @compte..."
                            style={{ width: '220px', height: '34px', fontSize: '12px' }}
                        />
                    </div>
                </div>

                <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Code SKU</th>
                                <th>Publications (DotB)</th>
                                <th>Ventes (DotB)</th>
                                <th>Compte(s) Vinted Vendeur</th>
                                <th>Prix Constaté</th>
                                <th>Classification</th>
                                <th>Score Cumulé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSKUList.length > 0 ? (
                                filteredSKUList.map(s => (
                                    <tr key={s.sku} style={{ cursor: 'pointer' }} onClick={() => setSelectedSkuDetail(s)} title="Cliquez pour ouvrir les détails & l'option de propagation">
                                        <td><b style={{ color: 'var(--primary)' }} title={s.produit || s.sku}>{s.sku}</b></td>
                                        <td><b>{s.pubs}</b> pub{s.pubs > 1 ? 's' : ''}</td>
                                        <td><b style={{ color: s.ventes > 0 ? '#059669' : 'inherit' }}>{s.ventes}</b> vente{s.ventes > 1 ? 's' : ''}</td>
                                        <td><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{s.accountsStr}</span></td>
                                        <td><span style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488' }}>{s.pricesStr}</span></td>
                                        <td>
                                            <span className={`badge ${
                                                s.classification === 'Gagnant' ? 'badge-gagnant' :
                                                s.classification === 'Écarté' ? 'badge-ecarte' :
                                                s.classification === 'Nouveau produit' ? 'badge-nouveau' :
                                                'badge-retester'
                                            }`}>
                                                {s.classification}
                                            </span>
                                        </td>
                                        <td><b>{s.scoreCumule.toFixed(1)} pts</b></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                        Aucun SKU trouvé pour ce filtre.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h3 className="card-title">🏆 Top 10 SKU par Score Cumulé</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>SKU</th>
                                    <th>Pubs</th>
                                    <th>Ventes</th>
                                    <th>Score Cumulé</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSKUs.length > 0 ? (
                                    topSKUs.map((s, idx) => (
                                        <tr key={s.sku} style={{ cursor: 'pointer' }} onClick={() => setSelectedSkuDetail(s)} title="Cliquez pour ouvrir les détails & la propagation">
                                            <td><b>{idx + 1}</b></td>
                                            <td><code>{s.sku}</code></td>
                                            <td>{s.pubs}</td>
                                            <td><b>{s.ventes}</b></td>
                                            <td><span className="badge badge-gagnant">{(s.scoreCumule).toFixed(1)} pts</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>Données insuffisantes.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">⏰ Créneaux Horaires Optimaux</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Heure</th>
                                    <th>Pubs</th>
                                    <th>Ventes</th>
                                    <th>Score Moyen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topHours.length > 0 ? (
                                    topHours.map(h => (
                                        <tr key={h.heure}>
                                            <td><b>{h.heure}</b></td>
                                            <td>{h.pubs}</td>
                                            <td><b>{h.ventes}</b></td>
                                            <td><b>{h.scoreMoyen}</b></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>Données insuffisantes.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL / POP-UP DÉTAILS DU SKU ET PROPAGATION MULTI-COMPTES */}
            {selectedSkuDetail && (() => {
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


                return (
                    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div className="modal-content card" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
                            
                            {/* MODAL HEADER */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span className="badge badge-gagnant" style={{ fontSize: '12px', padding: '4px 10px' }}>{s.classification}</span>
                                        <code style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{s.sku}</code>
                                        {s.isMultiAccount && (
                                            <span className="badge" style={{ backgroundColor: '#8b5cf6', color: '#fff', fontSize: '11px' }}>🔀 Multi-Compte</span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                                        {s.produit || 'Produit SKU ' + s.sku}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSkuDetail(null)}
                                    style={{ border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            {/* HIGHLIGHT KPIS */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Ventes Totales</span>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{s.ventes} vente{s.ventes > 1 ? 's' : ''}</div>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Publications</span>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>{s.pubs} pub{s.pubs > 1 ? 's' : ''}</div>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Prix Constaté</span>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>{s.pricesStr || '35.00€'}</div>
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Score Cumulé</span>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{(s.scoreCumule || 0).toFixed(1)} pts</div>
                                </div>
                            </div>

                            {/* MODAL TAB NAVIGATION */}
                            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('accounts')}
                                    style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: modalActiveTab === 'accounts' ? '3px solid #2563eb' : 'none', color: modalActiveTab === 'accounts' ? '#2563eb' : '#64748b' }}
                                >
                                    <i className="fa-solid fa-users-gear" style={{ marginRight: '6px' }}></i> Comptes Vendeurs & Statut
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('chart')}
                                    style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: modalActiveTab === 'chart' ? '3px solid #2563eb' : 'none', color: modalActiveTab === 'chart' ? '#2563eb' : '#64748b' }}
                                >
                                    <i className="fa-solid fa-chart-line" style={{ marginRight: '6px' }}></i> Courbe Évolutive
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalActiveTab('propagation')}
                                    style={{ padding: '10px 16px', fontSize: '13.5px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: modalActiveTab === 'propagation' ? '3px solid #2563eb' : 'none', color: modalActiveTab === 'propagation' ? '#2563eb' : '#64748b' }}
                                >
                                    <i className="fa-solid fa-bullhorn" style={{ marginRight: '6px' }}></i> Option Propager ({missingAccounts.length})
                                </button>
                            </div>

                            {/* TAB 1: ACCOUNTS BREAKDOWN */}
                            {modalActiveTab === 'accounts' && (
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Ventes et Statut Réels par Compte Vendeur Vinted</h4>
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Compte Vendeur</th>
                                                    <th>Statut Publication</th>
                                                    <th>Ventes Enregistrées</th>
                                                    <th>Prix Renseigné</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentAccounts.length > 0 ? (
                                                    currentAccounts.map(acc => {
                                                        const accBreakdown = (s.accountBreakdown || []).find(b => b.account.toLowerCase() === acc.toLowerCase());
                                                        const realVentes = accBreakdown ? accBreakdown.ventes : 1;
                                                        return (
                                                            <tr key={acc}>
                                                                <td><b style={{ color: '#2563eb' }}>@{acc}</b></td>
                                                                <td><span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11.5px' }}>🟢 Actif sur le compte</span></td>
                                                                <td><b style={{ color: '#059669' }}>{realVentes} vente{realVentes > 1 ? 's' : ''}</b></td>
                                                                <td><b>{s.pricesStr || '35.00€'}</b></td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '11px', height: '28px' }}>
                                                                        <i className="fa-solid fa-sync" style={{ marginRight: '4px' }}></i> Synchroniser
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Aucun compte associé.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SALES EVOLUTION CHART */}
                            {modalActiveTab === 'chart' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Progression des Ventes par Période Réelle</h4>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Volume cumulé : <b>{s.ventes} ventes</b></span>
                                    </div>

                                    {/* VISUAL EVOLUTION BAR CHART FROM REAL TIMELINE */}
                                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '150px', paddingBottom: '10px', borderBottom: '2px solid #cbd5e1', overflowX: 'auto' }}>
                                            {(s.salesTimeline && s.salesTimeline.length > 0 ? s.salesTimeline : [
                                                { period: 'Fév 2026', count: Math.round(s.ventes * 0.3) || 1 },
                                                { period: 'Mars 2026', count: Math.round(s.ventes * 0.4) || 1 },
                                                { period: 'Avr 2026', count: Math.round(s.ventes * 0.3) || 1 }
                                            ]).map((bar, idx) => {
                                                const maxVal = Math.max(...(s.salesTimeline || [{ count: 1 }]).map(b => b.count), 1);
                                                const heightPct = Math.max(15, Math.min(100, (bar.count / maxVal) * 100));
                                                return (
                                                    <div key={idx} style={{ flex: 1, minWidth: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>{bar.count} v.</span>
                                                        <div style={{ width: '100%', height: `${heightPct}%`, backgroundColor: '#10b981', borderRadius: '6px 6px 0 0', transition: 'all 0.3s ease' }}></div>
                                                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{bar.period}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* TAB 3: PROPAGATION MULTI-COMPTES */}
                            {modalActiveTab === 'propagation' && (
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                                        🚀 Propager ce SKU sur les comptes non publiants
                                    </h4>
                                    <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                                        Sélectionnez les comptes vendeurs sur lesquels ce produit n'a <b>pas encore été publié</b> pour maximiser la visibilité et multiplier les ventes.
                                    </p>

                                    {missingAccounts.length > 0 ? (
                                        <div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                                    Mode de Propagation :
                                                </label>
                                                <select
                                                    className="input"
                                                    value={propagationMode}
                                                    onChange={(e) => setPropagationMode(e.target.value)}
                                                    style={{ height: '38px', fontSize: '13px', width: '100%' }}
                                                >
                                                    <option value="optimal">🎯 Créneaux Horaires Optimaux (Pic d'audience 20:15 / 16:30)</option>
                                                    <option value="staggered">📅 Dispatch Étalé (1 publication par jour sur chaque compte)</option>
                                                    <option value="immediate">⚡ Publication Immédiate (Création aujourd'hui)</option>
                                                </select>
                                            </div>

                                            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                                Comptes Cibles Disponibles ({missingAccounts.length}) :
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                                                {missingAccounts.map(acc => {
                                                    const isChecked = selectedAccountsToPropagate.includes(acc);
                                                    return (
                                                        <label key={acc} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', border: isChecked ? '1.5px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: isChecked ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedAccountsToPropagate([...selectedAccountsToPropagate, acc]);
                                                                    } else {
                                                                        setSelectedAccountsToPropagate(selectedAccountsToPropagate.filter(a => a !== acc));
                                                                    }
                                                                }}
                                                            />
                                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>@{acc}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={isPropagating || selectedAccountsToPropagate.length === 0}
                                                onClick={() => handlePropagateSku(s.sku)}
                                                style={{ height: '42px', padding: '0 24px', fontSize: '13.5px', fontWeight: 600, width: '100%', backgroundColor: '#2563eb' }}
                                            >
                                                {isPropagating ? (
                                                    <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Propagation en cours...</span>
                                                ) : (
                                                    <span><i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i> Propager le SKU sur {selectedAccountsToPropagate.length} compte(s)</span>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', color: '#166534', fontSize: '13px', textAlign: 'center' }}>
                                            <i className="fa-solid fa-circle-check" style={{ fontSize: '20px', marginBottom: '6px', display: 'block' }}></i>
                                            Ce SKU est déjà publié et actif sur l'ensemble de vos comptes vendeurs disponibles !
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                );
            })()}
        </section>

    );
}

// ------------------- VIEW: GAGNANTS -------------------
function GagnantsView({ appState, onPublishWinner }) {
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

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Suggestions SKU Gagnants & Propagation</h2>

            <div className="card">
                <h3 className="card-title">⭐ Moteur de Repost Gagnant 1-Clic</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Les produits identifiés comme <b>Gagnants</b> sur un compte peuvent être automatiquement répliqués sur l'ensemble de la flotte de comptes actifs.
                </p>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>SKU Gagnant</th>
                                <th>Score</th>
                                <th>Comptes Actuellement Publiés</th>
                                <th>Action de Propagation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {winnerSKUs.length > 0 ? (
                                winnerSKUs.map(w => (
                                    <tr key={w.sku}>
                                        <td><code><b>{w.sku}</b></code></td>
                                        <td><span className="badge badge-gagnant">{(w.score || 0).toFixed(1)}</span></td>
                                        <td><b>{w.comptesPublies.size}</b> compte(s)</td>
                                        <td>
                                            <button className="btn btn-primary btn-sm" onClick={() => onPublishWinner(w.sku)}>
                                                <i className="fa-solid fa-share-nodes" style={{ marginRight: '6px' }}></i>
                                                Publier sur les autres comptes actifs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucun produit n'a encore atteint le seuil de score "Gagnant".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- VIEW: JOURNAL -------------------
function JournalView({ appState }) {
    const journal = appState.journal || [];

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Journal d'Activité & Traçabilité (Audit Logs)</h2>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Horodatage</th>
                                <th>Action</th>
                                <th>Détails</th>
                                <th>Résultat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journal.length > 0 ? (
                                journal.map(j => (
                                    <tr key={j.id}>
                                        <td>{j.horodatage}</td>
                                        <td><span className="badge badge-compte">{j.action}</span></td>
                                        <td>{j.detail}</td>
                                        <td>
                                            <span className={`badge ${j.resultat === 'Succès' ? 'badge-actif' : 'badge-limite'}`}>
                                                {j.resultat}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucune entrée dans le journal d'activité.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

// ------------------- CORBEILLE VIEW -------------------
function CorbeilleView({ corbeille = [], onRestoreItem, onDeleteItem, onEmptyCorbeille, onRefresh }) {
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

    const getEntityIcon = (type) => {
        switch (type) {
            case 'calendrier': return 'fa-calendar-days';
            case 'comptes': return 'fa-store';
            case 'utilisateurs': return 'fa-users-gear';
            case 'organisations': return 'fa-sitemap';
            case 'incidents': return 'fa-triangle-exclamation';
            default: return 'fa-database';
        }
    };

    const getEntityLabel = (type) => {
        switch (type) {
            case 'calendrier': return 'Calendrier';
            case 'comptes': return 'Compte Vinted';
            case 'utilisateurs': return 'Utilisateur';
            case 'organisations': return 'Organisation';
            case 'incidents': return 'Incident';
            default: return type;
        }
    };

    return (
        <div className="view-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 700 }}>
                        <i className="fa-solid fa-trash-can" style={{ color: '#ef4444' }}></i> Corbeille de Sauvegarde & Chiffrement
                    </h2>
                    <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Historique chiffré (AES-256) des éléments modifiés et supprimés. Restauration en un clic.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={onRefresh} title="Actualiser la corbeille">
                        <i className="fa-solid fa-arrows-rotate"></i> Actualiser
                    </button>
                    {corbeille.length > 0 && (
                        <button className="btn btn-danger" onClick={onEmptyCorbeille} style={{ background: '#dc2626', color: '#fff' }}>
                            <i className="fa-solid fa-broom"></i> Vider la corbeille ({corbeille.length})
                        </button>
                    )}
                </div>
            </header>

            {/* Filtres & Recherche */}
            <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, SKU, ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px', height: '38px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Entité :</label>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}>
                        <option value="ALL">Toutes les entités</option>
                        <option value="calendrier">Calendrier</option>
                        <option value="comptes">Comptes</option>
                        <option value="utilisateurs">Utilisateurs</option>
                        <option value="organisations">Organisations</option>
                        <option value="incidents">Incidents</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Action :</label>
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        style={{ height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}>
                        <option value="ALL">Toutes les actions</option>
                        <option value="DELETE">Suppression</option>
                        <option value="UPDATE">Modification</option>
                    </select>
                </div>
            </div>

            {/* Liste des éléments archivés */}
            {filteredList.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-box-open" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                    <h3>Aucun élément dans la corbeille</h3>
                    <p style={{ marginTop: '6px', fontSize: '14px' }}>Les éléments modifiés ou supprimés apparaîtront ici avec leurs sauvegardes chiffrées.</p>
                </div>
            ) : (
                <div className="table-responsive card" style={{ padding: 0 }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Date & Heure</th>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Action</th>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Type</th>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Élément</th>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Chiffrement JSON</th>
                                <th style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(item => {
                                const isExpanded = expandedId === item.id;
                                const dateStr = item.dateAction ? new Date(item.dateAction).toLocaleString('fr-FR') : '-';
                                const isDelete = item.action === 'DELETE';
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                <i className="fa-regular fa-clock" style={{ marginRight: '6px', color: 'var(--text-muted)' }}></i>
                                                {dateStr}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className="badge" style={{
                                                    background: isDelete ? '#ef4444' : '#f59e0b',
                                                    color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px'
                                                }}>
                                                    {isDelete ? 'Suppression' : 'Modification'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                                                <i className={`fa-solid ${getEntityIcon(item.typeEntite)}`} style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                                                {getEntityLabel(item.typeEntite)}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                                                {item.nomElement || item.idEntite}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                                    style={{ padding: '3px 8px', fontSize: '11px', gap: '6px' }}>
                                                    <i className={`fa-solid ${isExpanded ? 'fa-lock-open' : 'fa-lock'}`} style={{ color: isExpanded ? '#22c55e' : '#64748b' }}></i>
                                                    {isExpanded ? 'Masquer détails' : 'AES-256 (Déchiffrer)'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => onRestoreItem(item.id)}
                                                        title="Restaurer cet élément vers sa table d'origine"
                                                        style={{ padding: '4px 10px', fontSize: '12px', background: '#0284c7' }}>
                                                        <i className="fa-solid fa-rotate-left"></i> Restaurer
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => onDeleteItem(item.id)}
                                                        title="Supprimer définitivement de la corbeille"
                                                        style={{ padding: '4px 10px', fontSize: '12px' }}>
                                                        <i className="fa-solid fa-trash"></i> Purger
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                                <td colSpan="6" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                                🔒 Raw Ciphertext (Payload Chiffré en Base) :
                                                            </div>
                                                            <pre style={{
                                                                background: '#1e293b', color: '#38bdf8', padding: '12px', borderRadius: '6px',
                                                                fontSize: '11px', overflowX: 'auto', maxHeight: '180px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                                                            }}>
                                                                {item.donneesChiffrees}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', marginBottom: '6px', textTransform: 'uppercase' }}>
                                                                🔓 JSON Original Déchiffré :
                                                            </div>
                                                            <pre style={{
                                                                background: '#0f172a', color: '#4ade80', padding: '12px', borderRadius: '6px',
                                                                fontSize: '11px', overflowX: 'auto', maxHeight: '180px'
                                                            }}>
                                                                {JSON.stringify(item.donneesOriginales || {}, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ------------------- MESSAGERIE & INBOX VINTED VIEW -------------------
function MessagerieView({ appState }) {
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

    const toggleStatus = async (msg) => {
        const newStatus = msg.statutLecture === 'lu' ? 'non_lu' : 'lu';
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...msg, statutLecture: newStatus })
            });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, statutLecture: newStatus } : m));
            if (window.showToast) window.showToast(`Statut du message mis à jour (${newStatus === 'lu' ? 'Lu' : 'Non Lu'}) !`);
        } catch (e) {
            console.error(e);
        }
    };

    const filteredMessages = useMemo(() => {
        return messages.filter(m => {
            const matchesSearch = !searchTerm || 
                (m.contenu && m.contenu.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.pseudo && m.pseudo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (m.sku && m.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCompte = selectedCompte === 'all' || m.pseudo === selectedCompte;
            const matchesStatut = selectedStatut === 'all' || m.statutLecture === selectedStatut;
            return matchesSearch && matchesCompte && matchesStatut;
        });
    }, [messages, searchTerm, selectedCompte, selectedStatut]);

    const unreadCount = messages.filter(m => m.statutLecture === 'non_lu').length;
    const readCount = messages.filter(m => m.statutLecture === 'lu').length;

    return (
        <div className="view-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2>💬 Messagerie & Registre des Messages Vinted</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        Détecteur et enregistreur automatique de toutes les conversations et messages d'acheteurs/vendeurs via l'API DotB Cloud.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={loadMessages} disabled={isLoading}>
                    <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i> Actualiser la boîte de réception
                </button>
            </div>

            {/* Badges Statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, #09b1ba 0%, #0d9488 100%)', color: '#fff' }}>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>📩 Total Messages Capturés</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{messages.length}</div>
                </div>
                <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }}>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>💬 Non Lus (Action requise)</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{unreadCount}</div>
                </div>
                <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>🟢 Lus & Traités</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{readCount}</div>
                </div>
            </div>

            {/* Filtres & Recherche */}
            <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="🔍 Rechercher par mot-clé, pseudo Vinted ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="select" style={{ width: '180px' }} value={selectedCompte} onChange={(e) => setSelectedCompte(e.target.value)}>
                        <option value="all">Tous les comptes Vinted</option>
                        {(appState.comptes || []).map(c => (
                            <option key={c.id} value={c.pseudo}>@{c.pseudo || c.id}</option>
                        ))}
                    </select>
                    <select className="select" style={{ width: '150px' }} value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="non_lu">🔴 Non Lus</option>
                        <option value="lu">🟢 Lus</option>
                    </select>
                </div>
            </div>

            {/* Table des Messages */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date & Heure</th>
                                <th>Compte Vinted</th>
                                <th>Auteur</th>
                                <th>SKU Associé</th>
                                <th>Message</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        <i className="fa-solid fa-inbox" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}></i>
                                        Aucun message trouvé pour cette sélection.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map(msg => (
                                    <tr key={msg.id} style={{ backgroundColor: msg.statutLecture === 'non_lu' ? '#fef2f2' : 'transparent' }}>
                                        <td style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                                            📅 {msg.dateMessage} <br />
                                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>⏰ {msg.heureMessage}</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-secondary">@{msg.pseudo}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${msg.auteur === 'Acheteur' ? 'badge-primary' : 'badge-secondary'}`}>
                                                {msg.auteur || 'Acheteur'}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                            {msg.sku || '-'}
                                        </td>
                                        <td style={{ maxWidth: '300px', fontSize: '13px' }}>
                                            {msg.contenu}
                                        </td>
                                        <td>
                                            <span className={`badge ${msg.statutLecture === 'non_lu' ? 'badge-danger' : 'badge-gagnant'}`}>
                                                {msg.statutLecture === 'non_lu' ? '🔴 Non lu' : '🟢 Lu'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`btn btn-xs ${msg.statutLecture === 'non_lu' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => toggleStatus(msg)}
                                            >
                                                {msg.statutLecture === 'non_lu' ? '✔ Marquer Lu' : '↩ Marquer Non Lu'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Export global React components
window.ReactComponents = {
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
    LoginView
};

