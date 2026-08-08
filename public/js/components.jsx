// ============================================================
// REACT COMPONENTS - VINTED MANAGER
// ============================================================

const { useState, useEffect, useMemo } = React;

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

                {isCadre && (
                    <button className={`nav-btn ${activeView === 'comptes' ? 'active' : ''}`} onClick={() => onSelectView('comptes')}>
                        <i className="fa-solid fa-store"></i> Comptes
                    </button>
                )}

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
    };

    const isAnyFilterActive = useMemo(() => {
        return Boolean(searchTerm || filterDate || filterHeure || filterComptes.length > 0 || (!isAgent && filterAgent) || filterStatut || filterClassif);
    }, [searchTerm, filterDate, filterHeure, filterComptes, filterAgent, filterStatut, filterClassif, isAgent]);

    // Fermer dropdown Compte si clic en dehors
    React.useEffect(() => {
        const close = (e) => {
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

    // Lignes de base : Pour un Agent, afficher STRICTEMENT ses lignes attribuées
    const baseLines = useMemo(() => {
        if (isAgent && myAgentName) {
            return calendrierAll.filter(l => l.agent && l.agent.trim().toLowerCase() === myAgentName.toLowerCase());
        }
        return calendrierAll;
    }, [calendrierAll, isAgent, myAgentName]);

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

    const agentsUnique = useMemo(() => [...new Set(comptesAll.map(c => c.agent).filter(Boolean))], [comptesAll]);

    const filteredLines = useMemo(() => {
        return baseLines.filter(l => {
            if (filterDate && l.date !== filterDate) return false;
            if (filterHeure && l.heurePrevue !== filterHeure) return false;
            if (filterComptes.length > 0 && !filterComptes.includes(l.compteId)) return false;
            if (filterAgent && l.agent !== filterAgent) return false;
            if (filterStatut && l.statut !== filterStatut) return false;
            if (filterClassif && l.classification !== filterClassif) return false;
            if (searchTerm.trim()) {
                const q = searchTerm.trim().toLowerCase();
                const cObj = comptesAll.find(c => c.id === l.compteId);
                const pseudoStr = cObj ? (cObj.pseudo || '').toLowerCase() : '';
                const numProxyStr = cObj && cObj.numeroCompte ? String(cObj.numeroCompte).toLowerCase() : '';
                const skuStr = (l.sku || '').toLowerCase();
                const agentStr = (l.agent || '').toLowerCase();
                const statutStr = (l.statut || '').toLowerCase();
                const classifStr = (l.classification || '').toLowerCase();

                if (!skuStr.includes(q) && !pseudoStr.includes(q) && !numProxyStr.includes(q) && !agentStr.includes(q) && !statutStr.includes(q) && !classifStr.includes(q)) {
                    return false;
                }
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
    }, [baseLines, filterDate, filterHeure, filterComptes, filterAgent, filterStatut, filterClassif, sortField, sortAsc]);

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

    return (
        <section className="view">
            <div className="header-actions">
                <div>
                    <h2 className="page-title">Tableau de Bord & Calendrier</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Suivi temps réel des publications, scores et réinterventions</p>
                </div>
                {(currentUser && currentUser.role !== 'agent') && (
                    <button className="btn btn-primary" onClick={onAddRowClick}>
                        <i className="fa-solid fa-plus"></i> Ajouter une ligne
                    </button>
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
                                            {c.pseudo}
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

                    {isAnyFilterActive && (
                        <div style={{ marginTop: '20px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={resetAllFilters}
                                style={{ color: 'var(--danger)', borderColor: '#fca5a5', backgroundColor: '#fef2f2', fontWeight: 600 }}
                                title="Réinitialiser tous les filtres active"
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
                                <th>Vues</th>
                                {/* <th>Likes</th> */}
                                <th>Favoris</th>
                                {/* <th>Msgs</th> */}
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
                                                    <option key={c.id} value={c.id}>{c.pseudo}</option>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <input type="text" className="input-table" value={l.sku || ''} placeholder="SKU"
                                                    disabled={currentUser && currentUser.role === 'agent'}
                                                    onChange={(e) => onUpdateRow(l.id, { sku: e.target.value })} style={{ flex: 1, minWidth: '70px' }} />
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
                                        </td>
                                        <td>
                                            {l.sku && String(l.sku).trim() !== '' ? (
                                                <span className={`badge ${
                                                    l.classification === 'Gagnant' ? 'badge-gagnant' :
                                                    l.classification === 'Écarté' ? 'badge-ecarte' :
                                                    l.classification === 'Nouveau produit' ? 'badge-nouveau' :
                                                    'badge-retester'
                                                }`}>
                                                    {l.classification || 'Nouveau produit'}
                                                </span>
                                            ) : (
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
                                        <td>
                                            <input type="number" className="input-table" style={{ width: '60px' }} value={l.vues || 0}
                                                onChange={(e) => onUpdateRow(l.id, { vues: parseInt(e.target.value) || 0 })} />
                                        </td>
                                        {/* <td>
                                            <input type="number" className="input-table" style={{ width: '60px' }} value={l.likes || 0}
                                                onChange={(e) => onUpdateRow(l.id, { likes: parseInt(e.target.value) || 0 })} />
                                        </td> */}
                                        <td>
                                            <input type="number" className="input-table" style={{ width: '60px' }} value={l.favoris || 0}
                                                onChange={(e) => onUpdateRow(l.id, { favoris: parseInt(e.target.value) || 0 })} />
                                        </td>
                                        {/* <td>
                                            <input type="number" className="input-table" style={{ width: '60px' }} value={l.messages || 0}
                                                onChange={(e) => onUpdateRow(l.id, { messages: parseInt(e.target.value) || 0 })} />
                                        </td> */}
                                        <td><b>{(l.score || 0).toFixed(1)}</b></td>
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
    const [notes, setNotes] = useState('');
    const [selectedCompteIds, setSelectedCompteIds] = useState([]);
    
    // Quick Text Import Modal State
    const [showTextModal, setShowTextModal] = useState(false);
    const [rawImportText, setRawImportText] = useState('');

    // AdsPower API State
    const [showAdsPowerModal, setShowAdsPowerModal] = useState(false);
    const [adsPowerApiUrl, setAdsPowerApiUrl] = useState('http://local.adspower.net:50325');
    const [adsPowerApiKey, setAdsPowerApiKey] = useState('');
    const [adsPowerStatus, setAdsPowerStatus] = useState(null);
    const [adsPowerLoading, setAdsPowerLoading] = useState(false);

    const handleTestAdsPower = async () => {
        setAdsPowerLoading(true);
        setAdsPowerStatus(null);
        let keyQuery = adsPowerApiKey ? `&api_key=${encodeURIComponent(adsPowerApiKey)}` : '';

        // 1. Essai direct côté navigateur client
        try {
            let testUrl = `${adsPowerApiUrl}/api/v1/user/list?page_size=1${keyQuery}`;
            const res = await fetch(testUrl);
            const data = await res.json();
            if (data.code === 0) {
                const total = data.data ? (data.data.total || (data.data.list ? data.data.list.length : 0)) : 0;
                setAdsPowerStatus({ type: 'success', message: `✅ Connexion directe AdsPower réussie ! ${total} profils détectés.` });
                setAdsPowerLoading(false);
                return;
            }
        } catch (e) {
            console.log("Échec du fetch direct navigateur, tentative via le serveur...", e);
        }

        // 2. Essai via le serveur backend
        try {
            const res = await fetch(`/api/adspower/test?apiUrl=${encodeURIComponent(adsPowerApiUrl)}&apiKey=${encodeURIComponent(adsPowerApiKey)}`);
            const data = await res.json();
            if (data.connected) {
                setAdsPowerStatus({ type: 'success', message: `✅ Connexion réussie via le serveur ! ${data.count} profils détectés.` });
            } else {
                setAdsPowerStatus({ type: 'error', message: `❌ ${data.error || 'Erreur de connexion.'}` });
            }
        } catch (err) {
            setAdsPowerStatus({ 
                type: 'error', 
                message: `❌ Note de connexion : L'application web tourne sur Vercel Cloud (HTTPS). Le navigateur bloque les requêtes HTTP locales (Mixed Content). Dans AdsPower > API & MCP, générez votre Clé API et désactivez la "Vérification de l'API" (interrupteur bleu) si elle bloque la connexion.` 
            });
        } finally {
            setAdsPowerLoading(false);
        }
    };

    const handleSyncAdsPower = async () => {
        setAdsPowerLoading(true);
        setAdsPowerStatus(null);
        let profilesToImport = null;
        let keyQuery = adsPowerApiKey ? `&api_key=${encodeURIComponent(adsPowerApiKey)}` : '';

        // 1. Tentative de récupération directe par le navigateur de l'utilisateur
        try {
            let listUrl = `${adsPowerApiUrl}/api/v1/user/list?page_size=200${keyQuery}`;
            const res = await fetch(listUrl);
            const data = await res.json();
            if (data.code === 0 && data.data && Array.isArray(data.data.list)) {
                profilesToImport = data.data.list;
            }
        } catch (e) {
            console.log("Fetch direct client échoué, tentative via le proxy serveur...", e);
        }

        // Si le navigateur a récupéré les profils : envoi direct à la base de données
        if (profilesToImport && profilesToImport.length > 0) {
            try {
                const res = await fetch('/api/adspower/import-profiles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profiles: profilesToImport, organisationId: userOrgId })
                });
                const data = await res.json();
                if (data.success) {
                    setAdsPowerStatus({ type: 'success', message: `🎉 ${data.count} comptes AdsPower importés/mis à jour avec succès !` });
                    if (window.showToast) window.showToast(`🎉 ${data.count} comptes AdsPower synchronisés !`);
                    setTimeout(() => {
                        setShowAdsPowerModal(false);
                        window.location.reload();
                    }, 1500);
                    return;
                }
            } catch (err) {
                console.error("Erreur d'envoi des profils au serveur:", err);
            } finally {
                setAdsPowerLoading(false);
            }
        }

        // 2. Repli vers la synchro serveur
        try {
            const res = await fetch('/api/adspower/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiUrl: adsPowerApiUrl, apiKey: adsPowerApiKey, organisationId: userOrgId })
            });
            const data = await res.json();
            if (data.success) {
                setAdsPowerStatus({ type: 'success', message: `🎉 Synchronisation réussie ! ${data.count} comptes AdsPower importés.` });
                if (window.showToast) window.showToast(`🎉 ${data.count} comptes AdsPower synchronisés !`);
                setTimeout(() => {
                    setShowAdsPowerModal(false);
                    window.location.reload();
                }, 1500);
            } else {
                setAdsPowerStatus({ type: 'error', message: `❌ ${data.error || 'Échec de synchronisation.'}` });
            }
        } catch (err) {
            setAdsPowerStatus({ type: 'error', message: `❌ Erreur de réseau : ${err.message}` });
        } finally {
            setAdsPowerLoading(false);
        }
    };

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
        
        if (filterStatutCompte) {
            list = list.filter(c => c.statut === filterStatutCompte);
        }
        if (filterAgentCompte) {
            list = list.filter(c => c.agent === filterAgentCompte);
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
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Gérez les comptes Vinted (N°, pseudo, tél, email, mot de passe, géré par, statut et date)</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowTextModal(true)}>
                        <i className="fa-solid fa-file-import"></i> Importer par Texte
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setShowAdsPowerModal(true)} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none' }}>
                        <i className="fa-solid fa-bolt"></i> Synchro AdsPower API
                    </button>
                </div>
            </div>

            {/* MODAL SYNCHRONISATION ADSPOWER */}
            {showAdsPowerModal && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content card" style={{ maxWidth: '550px', width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '24px' }}>
                        <h3 className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-bolt" style={{ color: '#0284c7' }}></i>
                            Synchronisation & Importation AdsPower API
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Connectez-vous directement à l'API locale AdsPower pour importer et synchroniser automatiquement tous vos profils Vinted (N° Proxy, Pseudos, Emails, Mots de passe, Proxies et IDs).
                        </p>
                        
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label>URL de l'API Locale AdsPower</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    value={adsPowerApiUrl} 
                                    onChange={(e) => setAdsPowerApiUrl(e.target.value)} 
                                    placeholder="http://local.adspower.net:50325"
                                />
                                <button type="button" className="btn btn-secondary" onClick={handleTestAdsPower} disabled={adsPowerLoading}>
                                    Tester
                                </button>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                Adresse par défaut AdsPower : <code>http://local.adspower.net:50325</code> ou <code>http://127.0.0.1:50325</code>
                            </span>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label>Clé API AdsPower (Optionnelle si configurée dans AdsPower)</label>
                            <input 
                                type="password" 
                                value={adsPowerApiKey} 
                                onChange={(e) => setAdsPowerApiKey(e.target.value)} 
                                placeholder="Collez la Clé API générée depuis AdsPower > API & MCP"
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                💡 Disponible dans AdsPower ➔ <b>API & MCP</b> ➔ Bouton <b>« Générer »</b> sous API Key.
                            </span>
                        </div>

                        {adsPowerStatus && (
                            <div style={{ 
                                padding: '10px 14px', 
                                borderRadius: '8px', 
                                marginBottom: '16px', 
                                fontSize: '13px',
                                backgroundColor: adsPowerStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: adsPowerStatus.type === 'success' ? '#047857' : '#b91c1c',
                                border: `1px solid ${adsPowerStatus.type === 'success' ? '#6ee7b7' : '#fca5a5'}`
                            }}>
                                {adsPowerStatus.message}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAdsPowerModal(false)}>Fermer</button>
                            <button type="button" className="btn btn-primary" onClick={handleSyncAdsPower} disabled={adsPowerLoading} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none' }}>
                                {adsPowerLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>} Lancer la Synchronisation
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* FORMULAIRE COMPTE */}
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

            {/* BULK ACTIONS FOR COMPTES */}
            {selectedCompteIds.length > 0 && (
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
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={isAllComptesSelected} onChange={toggleSelectAllComptes} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                </th>
                                <th>Statut & Date</th>
                                <th>N° Proxy</th>
                                <th>Pseudo</th>
                                <th>Géré par</th>
                                <th>Agent</th>
                                <th>Téléphone</th>
                                <th>Email</th>
                                <th>Mot de passe</th>
                                <th>Notes & Observations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleComptes.length > 0 ? (
                                visibleComptes.map(c => (
                                    <tr key={c.id} style={{ backgroundColor: selectedCompteIds.includes(c.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedCompteIds.includes(c.id)} onChange={() => toggleSelectCompte(c.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                        </td>
                                        <td>
                                            <span className={`badge ${c.statut === 'Actif' ? 'badge-actif' : (c.statut === 'Pause' ? 'badge-pause' : (c.statut === 'Banni' ? 'badge-banni' : 'badge-limite'))}`}>
                                                {c.statut}
                                            </span>
                                            {c.dateStatutCompte && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{c.dateStatutCompte}</span>}
                                        </td>
                                        <td><b style={{ color: 'var(--primary)' }}>{c.numeroCompte || '-'}</b></td>
                                        <td><b>{c.pseudo}</b></td>
                                        <td>{c.gereParInitiales ? <span className="badge" style={{ backgroundColor: '#475569', color: '#fff' }}>{c.gereParInitiales}</span> : '-'}</td>
                                        <td>{c.agent && c.agent !== 'À attribuer' ? <span className="badge badge-agent">{c.agent}</span> : <span className="badge" style={{ backgroundColor: '#64748b', color: '#fff' }}>À attribuer</span>}</td>
                                        <td>{c.telephone || '-'}</td>
                                        <td><span style={{ fontSize: '12px' }}>{c.email || '-'}</span></td>
                                        <td><code style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>{c.motDePasse || '-'}</code></td>
                                        <td style={{ fontSize: '12px', maxWidth: '200px' }}>{c.notes || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {c.adsPowerUserId && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                        title={`Ouvrir le profil AdsPower (${c.adsPowerUserId})`}
                                                        onClick={async () => {
                                                            try {
                                                                if (window.showToast) window.showToast(`Lancement AdsPower pour ${c.pseudo}...`);
                                                                const res = await fetch('/api/adspower/start', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ userId: c.adsPowerUserId })
                                                                });
                                                                const data = await res.json();
                                                                if (data.success) {
                                                                    if (window.showToast) window.showToast(`🚀 Profil AdsPower "${c.pseudo}" ouvert !`);
                                                                } else {
                                                                    if (window.showToast) window.showToast(`Erreur AdsPower: ${data.error}`, true);
                                                                }
                                                            } catch (err) {
                                                                if (window.showToast) window.showToast(`Connexion AdsPower impossible : ${err.message}`, true);
                                                            }
                                                        }}>
                                                        <i className="fa-solid fa-rocket"></i> AdsPower
                                                    </button>
                                                )}
                                                <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c)} title="Éditer">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => onDeleteCompte(c.id)} title="Supprimer">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
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

    // Comptes actifs filtrés par la sélection d'agents (excluant les pauses/congés)
    const filteredActiveComptes = useMemo(() => getComptesActifsEtAttribues(comptes, selectedAgents), [comptes, selectedAgents]);

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
            await onGeneratePlanning(dateDebut, dateFin, creneauxParJour, heureDebut, heureFin, selectedAgents);
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

                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={loading || totalDays <= 0 || filteredActiveComptes.length === 0}
                    style={{ padding: '12px 24px', fontSize: '15px' }}
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> : <i className="fa-solid fa-bolt" style={{ marginRight: '8px' }}></i>}
                    {loading ? 'Génération en cours...' : `Générer le Planning (${totalEstimatedSlots} pub${totalEstimatedSlots > 1 ? 's' : ''})`}
                </button>
            </div>
        </section>
    );
}

// ------------------- VIEW: INCIDENTS -------------------
function IncidentsView({ appState, onSaveIncident, onBulkDeleteIncidents }) {
    const todayDateTimeStr = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }, []);

    const [compteId, setCompteId] = useState('');
    const [type, setType] = useState('Limitation');
    const [dateHeure, setDateHeure] = useState(todayDateTimeStr);
    const [nbAnnonces, setNbAnnonces] = useState('');
    const [skuAnnonces, setSkuAnnonces] = useState('');
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
        return c ? c.pseudo : 'Inconnu';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!compteId || !dateHeure) return;
        onSaveIncident({
            compteId,
            type,
            dateHeure,
            nbAnnoncesMasquees: parseInt(nbAnnonces) || 0,
            skuAnnoncesMasquees: skuAnnonces
        });
        setNbAnnonces('');
        setSkuAnnonces('');
    };

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Gestion des Incidents & Limitations</h2>

            {/* FORMULAIRE INCIDENT */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">
                    <i className="fa-solid fa-shield-cat" style={{ color: 'var(--danger)', marginRight: '8px' }}></i>
                    Déclarer un Incident Compte
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

                    <button type="submit" className="btn btn-danger" style={{ marginTop: '15px' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Enregistrer l'incident
                    </button>
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

                                    return (
                                        <tr key={inc.id} style={{ backgroundColor: selectedIncidentIds.includes(inc.id) ? 'rgba(9, 177, 186, 0.08)' : 'transparent' }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={selectedIncidentIds.includes(inc.id)} onChange={() => toggleSelectIncident(inc.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                            </td>
                                            <td><b>{inc.dateBlocage}</b> {inc.heureBlocage}</td>
                                            <td><span className="badge badge-compte">{getComptePseudo(inc.compteId)}</span></td>
                                            <td><span className={`badge ${badgeClass}`}>{inc.type}</span></td>
                                            <td><b>{inc.nbPubs24h}</b> pubs</td>
                                            <td>{detailsCol}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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

    // Répertoire de tous les SKUs enregistrés avec leur classification et statistiques
    const allSKUsMap = useMemo(() => {
        const map = {};
        calendrier.forEach(l => {
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
            map[skuClean].scoreCumule += (l.score || 0);
            map[skuClean].ventes += (l.vente || 0);
            map[skuClean].pubs += 1;
            map[skuClean].lineIds.push(l.id);
            if (l.classification) map[skuClean].classification = l.classification;
        });
        return map;
    }, [calendrier]);

    const skuList = useMemo(() => Object.values(allSKUsMap), [allSKUsMap]);

    const filteredSKUList = useMemo(() => {
        if (!skuSearchTerm.trim()) return skuList;
        const q = skuSearchTerm.trim().toLowerCase();
        return skuList.filter(s => s.sku.toLowerCase().includes(q) || s.classification.toLowerCase().includes(q));
    }, [skuList, skuSearchTerm]);

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

    const handleRegisterSKU = (e) => {
        e.preventDefault();
        if (!newSkuInput.trim()) return;
        const skuClean = newSkuInput.trim();
        const existingSKU = allSKUsMap[skuClean];

        if (existingSKU && existingSKU.lineIds.length > 0 && onUpdateRow) {
            existingSKU.lineIds.forEach(id => {
                onUpdateRow(id, { classification: newClassifInput });
            });
            if (window.showToast) window.showToast(`✅ Classification du SKU "${skuClean}" mise à jour en "${newClassifInput}" !`);
        } else {
            if (window.showToast) window.showToast(`✅ SKU "${skuClean}" enregistré avec la classification "${newClassifInput}" !`);
        }

        setNewSkuInput('');
    };

    return (
        <section className="view">
            <h2 className="page-title" style={{ marginBottom: '20px' }}>Classements & Gestion des SKUs</h2>

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
                    <input
                        type="text"
                        className="input"
                        value={skuSearchTerm}
                        onChange={(e) => setSkuSearchTerm(e.target.value)}
                        placeholder="🔍 Filtrer les SKUs..."
                        style={{ width: '220px', height: '34px', fontSize: '12px' }}
                    />
                </div>

                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Code SKU</th>
                                <th>Classification</th>
                                <th>Publications</th>
                                <th>Ventes</th>
                                <th>Score Cumulé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSKUList.length > 0 ? (
                                filteredSKUList.map(s => (
                                    <tr key={s.sku}>
                                        <td><b style={{ color: 'var(--primary)' }}>{s.sku}</b></td>
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
                                        <td>{s.pubs} pub{s.pubs > 1 ? 's' : ''}</td>
                                        <td><b>{s.ventes}</b> vente{s.ventes > 1 ? 's' : ''}</td>
                                        <td><b>{s.scoreCumule.toFixed(1)} pts</b></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                        Aucun SKU enregistré dans la base.
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
                                        <tr key={s.sku}>
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

