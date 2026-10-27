// ============================================================
// REACT COMPONENTS - VINTED MANAGER
// ============================================================

var { useState, useEffect, useMemo, useCallback } = React;

// ============================================================
// PERMISSION & ROLE MANAGER (GESTION DES ACCÈS PERSONNALISÉS)
// ============================================================
var PermissionManager = {
    MODULES: [
        { key: 'comptes', label: 'Comptes Vinted', icon: 'fa-store', desc: 'Gestion des comptes, statuts et inventaire' },
        { key: 'todos', label: 'To-Do & Rappels', icon: 'fa-list-check', desc: 'Gestionnaire de tâches et alertes' },
        { key: 'classement', label: 'Classement & Scores', icon: 'fa-trophy', desc: 'Leaderboard des ventes et performances' },
        { key: 'gagnants', label: 'Suggestions & Gagnants', icon: 'fa-lightbulb', desc: 'Articles prometteurs et republications' },
        { key: 'incidents', label: 'Journal des Incidents', icon: 'fa-triangle-exclamation', desc: 'Litiges, blocages et alertes comptes' },
        { key: 'messagerie', label: 'Messagerie Vinted', icon: 'fa-comments', desc: 'Messages et échanges avec les acheteurs' },
        { key: 'organisations', label: 'Organisations', icon: 'fa-sitemap', desc: 'Gestion multi-tenancy des structures' },
        { key: 'utilisateurs', label: 'Utilisateurs & Membres', icon: 'fa-users-gear', desc: 'Gestion des comptes et droits d\'accès' },
        { key: 'corbeille', label: 'Corbeille & Restauration', icon: 'fa-trash-can', desc: 'Éléments supprimés et restauration' },
        { key: 'parametres', label: 'Paramètres Système', icon: 'fa-sliders', desc: 'Configuration des scores et créneaux' },
        { key: 'journal', label: 'Journal d\'Audit', icon: 'fa-clock-rotate-left', desc: 'Historique des actions système' }
    ],

    ACTIONS: [
        { key: 'comptes_create', label: 'Créer des comptes Vinted', icon: 'fa-plus', desc: 'Ajouter de nouveaux comptes Vinted' },
        { key: 'comptes_edit', label: 'Modifier les comptes Vinted', icon: 'fa-pen', desc: 'Éditer les paramètres, mots de passe et statuts' },
        { key: 'comptes_delete', label: 'Supprimer des comptes Vinted', icon: 'fa-trash', desc: 'Supprimer ou archiver des comptes' },
        { key: 'todos_manage', label: 'Gérer la To-Do List', icon: 'fa-list-check', desc: 'Créer, réassigner et modifier les tâches' },
        { key: 'incidents_manage', label: 'Gérer les incidents', icon: 'fa-circle-exclamation', desc: 'Déclarer et clôturer des litiges' },
        { key: 'sync_dotb', label: 'Synchronisation DotB Cloud', icon: 'fa-arrows-rotate', desc: 'Actualisation en direct depuis DotB' },
        { key: 'export_data', label: 'Exporter la base (JSON)', icon: 'fa-download', desc: 'Télécharger les sauvegardes complètes' },
        { key: 'import_data', label: 'Importer / Restaurer (JSON)', icon: 'fa-file-import', desc: 'Restaurer une sauvegarde JSON' }
    ],

    PRESETS: {
        admin: {
            comptes: true, todos: true, classement: true, gagnants: true, incidents: true, messagerie: true,
            organisations: true, utilisateurs: true, corbeille: true, parametres: true, journal: true,
            comptes_create: true, comptes_edit: true, comptes_delete: true, todos_manage: true,
            incidents_manage: true, sync_dotb: true, export_data: true, import_data: true
        },
        cadre: {
            comptes: true, todos: true, classement: true, gagnants: true, incidents: true, messagerie: true,
            organisations: false, utilisateurs: true, corbeille: true, parametres: true, journal: true,
            comptes_create: true, comptes_edit: true, comptes_delete: true, todos_manage: true,
            incidents_manage: true, sync_dotb: false, export_data: true, import_data: false
        },
        agent: {
            comptes: true, todos: true, classement: true, gagnants: true, incidents: true, messagerie: true,
            organisations: false, utilisateurs: false, corbeille: false, parametres: false, journal: false,
            comptes_create: false, comptes_edit: false, comptes_delete: false, todos_manage: true,
            incidents_manage: true, sync_dotb: false, export_data: false, import_data: false
        },
        read_only: {
            comptes: true, todos: true, classement: true, gagnants: true, incidents: true, messagerie: true,
            organisations: false, utilisateurs: false, corbeille: false, parametres: false, journal: false,
            comptes_create: false, comptes_edit: false, comptes_delete: false, todos_manage: false,
            incidents_manage: false, sync_dotb: false, export_data: false, import_data: false
        }
    },

    getPermissions: function(user) {
        if (!user) return {};
        const role = user.role || 'agent';
        const basePreset = this.PRESETS[role] || this.PRESETS.agent;
        if (!user.permissions || typeof user.permissions !== 'object') {
            return { ...basePreset };
        }
        return {
            ...basePreset,
            ...user.permissions
        };
    },

    can: function(user, permKey) {
        if (!user) return false;
        if (user.role === 'admin' && (!user.permissions || user.permissions[permKey] === undefined)) {
            return true;
        }
        const perms = this.getPermissions(user);
        return Boolean(perms[permKey]);
    }
};

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

// ------------------- COMPOSANT RÉUTILISABLE LOGO OFFICIEL -------------------
function Logo({
    variant = 'header', // 'header' | 'full' | 'icon' | 'wordmark'
    size = 'md',        // 'sm' | 'md' | 'lg' | 'xl' | ou hauteur en pixels
    height,
    width,
    className = '',
    style = {},
    alt = 'Vinted Manager',
    asLink = false,
    href = '#',
    onClick,
    loading = 'eager',
    fondBlanc = false,
    pulse = false,
    title = 'Vinted Manager'
}) {
    let targetHeight = height;
    let targetWidth = width;

    if (!targetHeight) {
        if (typeof size === 'number') {
            targetHeight = size;
        } else {
            switch (size) {
                case 'xs': targetHeight = variant === 'icon' ? 24 : 28; break;
                case 'sm': targetHeight = variant === 'icon' ? 32 : 36; break;
                case 'md': targetHeight = variant === 'icon' ? 44 : 44; break;
                case 'lg': targetHeight = variant === 'icon' ? 64 : 68; break;
                case 'xl': targetHeight = variant === 'icon' ? 96 : 102; break;
                default: targetHeight = 44;
            }
        }
    }

    let src1x = '';
    let src2x = '';
    let srcWebp = '';
    let nativeW = 134;
    let nativeH = 48;

    switch (variant) {
        case 'icon':
            if (fondBlanc) {
                src1x = '/assets/icone/icone-fond-blanc-1024.png';
                src2x = '/assets/icone/icone-fond-blanc-1024.png';
                nativeW = 1024; nativeH = 1024;
            } else if (targetHeight <= 48) {
                src1x = '/assets/icone/icone-64.png';
                src2x = '/assets/icone/icone-128.png';
                nativeW = 64; nativeH = 64;
            } else if (targetHeight <= 96) {
                src1x = '/assets/icone/icone-128.png';
                src2x = '/assets/icone/icone-256.png';
                srcWebp = '/assets/icone/icone-512.webp';
                nativeW = 128; nativeH = 128;
            } else {
                src1x = '/assets/icone/icone-256.png';
                src2x = '/assets/icone/icone-512.png';
                srcWebp = '/assets/icone/icone-512.webp';
                nativeW = 256; nativeH = 256;
            }
            break;

        case 'header':
            src1x = '/assets/logo/logo-header-h48.png';
            src2x = '/assets/logo/logo-header-h96.png';
            nativeW = 134; nativeH = 48;
            break;

        case 'wordmark':
            src1x = '/assets/logo/texte-seul-transparent.png';
            src2x = '/assets/logo/texte-seul-transparent.png';
            nativeW = 614; nativeH = 307;
            break;

        case 'full':
        default:
            if (fondBlanc) {
                if (targetHeight <= 50) {
                    src1x = '/assets/logo/logo-principal-fond-blanc-400px.png';
                    src2x = '/assets/logo/logo-principal-fond-blanc-800px.png';
                    nativeW = 400; nativeH = 183;
                } else if (targetHeight <= 120) {
                    src1x = '/assets/logo/logo-principal-fond-blanc-400px.png';
                    src2x = '/assets/logo/logo-principal-fond-blanc-800px.png';
                    nativeW = 400; nativeH = 183;
                } else {
                    src1x = '/assets/logo/logo-principal-fond-blanc-800px.png';
                    src2x = '/assets/logo/logo-principal-fond-blanc-1600px.png';
                    nativeW = 800; nativeH = 367;
                }
            } else {
                if (targetHeight <= 36) {
                    src1x = '/assets/logo/logo-principal-transparent-200px.png';
                    src2x = '/assets/logo/logo-principal-transparent-400px.png';
                    nativeW = 200; nativeH = 81;
                } else if (targetHeight <= 140) {
                    src1x = '/assets/logo/logo-principal-transparent-400px.png';
                    src2x = '/assets/logo/logo-principal-transparent-800px.png';
                    srcWebp = '/assets/logo/logo-principal-transparent.webp';
                    nativeW = 400; nativeH = 163;
                } else {
                    src1x = '/assets/logo/logo-principal-transparent-800px.png';
                    src2x = '/assets/logo/logo-principal-transparent.png';
                    srcWebp = '/assets/logo/logo-principal-transparent.webp';
                    nativeW = 800; nativeH = 326;
                }
            }
            break;
    }

    const calculatedWidth = targetWidth || (targetHeight ? Math.round(targetHeight * (nativeW / nativeH)) : nativeW);

    const imgElement = (
        <picture className="vinted-logo-picture">
            {srcWebp && <source type="image/webp" srcSet={srcWebp} />}
            <img
                src={src1x}
                srcSet={`${src1x} 1x, ${src2x} 2x`}
                alt={alt}
                title={title}
                width={calculatedWidth}
                height={targetHeight}
                loading={loading}
                decoding="async"
                className={`vinted-logo-img ${pulse ? 'logo-pulse' : ''} ${className}`}
                style={{
                    height: targetHeight ? `${targetHeight}px` : 'auto',
                    width: targetWidth ? `${targetWidth}px` : 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    ...style
                }}
            />
        </picture>
    );

    if (asLink) {
        return (
            <a
                href={href}
                onClick={onClick}
                className="brand-logo-link"
                style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}
                aria-label={alt || 'Vinted Manager Accueil'}
            >
                {imgElement}
            </a>
        );
    }

    return imgElement;
}

// ------------------- COMPOSANT LOADER CIRCULAIRE AVEC ICÔNE -------------------
function CircularIconLoader({ size = 64, pulse = true, showOuterRing = true, className = "", style = {} }) {
    const ringOffset = Math.max(8, Math.round(size * 0.22));
    const outerRingOffset = ringOffset + Math.max(5, Math.round(size * 0.12));
    const borderWidth = Math.max(2.5, Math.round(size * 0.05));
    
    return (
        <div className={`circular-loader-container ${className}`} style={{ width: `${size}px`, height: `${size}px`, ...style }}>
            {showOuterRing && (
                <div
                    className="circular-loader-ring-outer"
                    style={{
                        inset: `-${outerRingOffset}px`,
                        borderWidth: '1.5px'
                    }}
                />
            )}
            <div
                className="circular-loader-ring"
                style={{
                    inset: `-${ringOffset}px`,
                    borderWidth: `${borderWidth}px`
                }}
            />
            <div className={pulse ? "circular-loader-icon" : ""}>
                <Logo variant="icon" height={size} alt="Vinted Manager" />
            </div>
        </div>
    );
}

// ------------------- ÉCRAN DE CHARGEMENT AVEC ICÔNE & ANIMATION CIRCULAIRE -------------------
function LoadingScreen({ message = "Chargement en cours...", subtext = "Vinted Manager" }) {
    return (
        <div className="app-loading-overlay">
            <CircularIconLoader size={72} pulse={true} showOuterRing={true} />
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a', marginTop: '16px', letterSpacing: '-0.3px', textAlign: 'center' }}>
                {message}
            </div>
            {subtext && (
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500, textAlign: 'center' }}>
                    {subtext}
                </div>
            )}
        </div>
    );
}

// ------------------- ÉTAT VIDE AVEC LOGO -------------------
function EmptyStateWithLogo({ title = "Aucune donnée disponible", description = "", actionBtn = null }) {
    return (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.9 }}>
                <Logo variant="full" height={56} alt="" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>{title}</h4>
            {description && <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>{description}</p>}
            {actionBtn}
        </div>
    );
}

// ------------------- SIDEBAR NAVIGATION -------------------
function Sidebar({ currentUser, currentOrgId, organisations, activeView, onSelectView, onSwitchOrg, onLogout, onExportJSON, onImportJSON, corbeilleCount = 0, todoUrgentCount = 0, isOpen = false, onCloseMobile }) {
    if (!currentUser) return null;

    const isAdmin = currentUser.role === 'admin';
    const canAccess = (viewKey) => PermissionManager.can(currentUser, viewKey);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
            <div className="brand-header">
                <Logo
                    variant="header"
                    height={40}
                    asLink={true}
                    onClick={(e) => {
                        e.preventDefault();
                        onSelectView('comptes');
                    }}
                    alt="Vinted Manager"
                    title="Aller à l'accueil"
                />
                {onCloseMobile && (
                    <button
                        type="button"
                        className="sidebar-close-mobile-btn"
                        onClick={onCloseMobile}
                        title="Fermer le menu"
                        aria-label="Fermer le menu"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                )}
            </div>

            {/* Utilisateur Connecté Widget */}
            <div className="user-role-widget" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', margin: '0 0 14px 0', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>Utilisateur Connecté</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '2px' }}>{currentUser.nom || 'Utilisateur'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email || ''}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span className="badge" style={{
                        background: currentUser.role === 'admin' ? '#9333ea' : (currentUser.role === 'cadre' ? '#0284c7' : '#16a34a'),
                        color: 'white', fontSize: '11px', padding: '2px 8px'
                    }}>
                        {currentUser.role === 'admin' ? 'Admin' : (currentUser.role === 'cadre' ? 'Cadre' : 'Agent')}
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={onLogout} title="Se déconnecter" style={{ padding: '3px 8px', fontSize: '11px' }}>
                        <i className="fa-solid fa-right-from-bracket"></i> Déconnexion
                    </button>
                </div>
            </div>

            {/* Selector Organisation (Seulement si autorisé) */}
            {canAccess('organisations') && (
                <div id="orgSelectorWidget" style={{ padding: '10px 14px', background: 'rgba(9, 177, 186, 0.04)', borderRadius: '8px', margin: '0 0 14px 0', border: '1px solid rgba(9, 177, 186, 0.15)', flexShrink: 0 }}>
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

            {/* Menu Nav Links avec permissions personnalisées */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, paddingBottom: 0, marginBottom: 0 }}>
                {canAccess('comptes') && (
                    <button className={`nav-btn ${activeView === 'comptes' ? 'active' : ''}`} onClick={() => onSelectView('comptes')} id="nav-btn-comptes">
                        <i className="fa-solid fa-store"></i> Comptes
                    </button>
                )}

                {canAccess('todos') && (
                    <button className={`nav-btn ${activeView === 'todos' ? 'active' : ''}`} onClick={() => onSelectView('todos')} id="nav-btn-todos">
                        <i className="fa-solid fa-list-check"></i> To-Do & Rappels
                        {todoUrgentCount > 0 && (
                            <span className="badge badge-urgent-pulse" style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10.5px', padding: '2px 7px', borderRadius: '10px' }}>
                                {todoUrgentCount}
                            </span>
                        )}
                    </button>
                )}

                {canAccess('classement') && (
                    <button className={`nav-btn ${activeView === 'classement' ? 'active' : ''}`} onClick={() => onSelectView('classement')}>
                        <i className="fa-solid fa-trophy"></i> Classement
                    </button>
                )}

                {canAccess('gagnants') && (
                    <button className={`nav-btn ${activeView === 'gagnants' ? 'active' : ''}`} onClick={() => onSelectView('gagnants')}>
                        <i className="fa-solid fa-lightbulb"></i> Suggestions
                    </button>
                )}

                {canAccess('incidents') && (
                    <button className={`nav-btn ${activeView === 'incidents' ? 'active' : ''}`} onClick={() => onSelectView('incidents')}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Incidents
                    </button>
                )}

                {canAccess('messagerie') && (
                    <button className={`nav-btn ${activeView === 'messagerie' ? 'active' : ''}`} onClick={() => onSelectView('messagerie')}>
                        <i className="fa-solid fa-comments"></i> Messagerie Vinted
                    </button>
                )}

                {canAccess('organisations') && (
                    <button className={`nav-btn ${activeView === 'organisations' ? 'active' : ''}`} onClick={() => onSelectView('organisations')}>
                        <i className="fa-solid fa-sitemap"></i> Organisations
                    </button>
                )}

                {canAccess('utilisateurs') && (
                    <button className={`nav-btn ${activeView === 'utilisateurs' ? 'active' : ''}`} onClick={() => onSelectView('utilisateurs')}>
                        <i className="fa-solid fa-users-gear"></i> Utilisateurs
                    </button>
                )}

                {canAccess('corbeille') && (
                    <button className={`nav-btn ${activeView === 'corbeille' ? 'active' : ''}`} onClick={() => onSelectView('corbeille')}>
                        <i className="fa-solid fa-trash-can"></i> Corbeille
                        {corbeilleCount > 0 && (
                            <span className="badge" style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                                {corbeilleCount}
                            </span>
                        )}
                    </button>
                )}

                {canAccess('parametres') && (
                    <button className={`nav-btn ${activeView === 'parametres' ? 'active' : ''}`} onClick={() => onSelectView('parametres')}>
                        <i className="fa-solid fa-sliders"></i> Paramètres
                    </button>
                )}

                {canAccess('journal') && (
                    <button className={`nav-btn ${activeView === 'journal' ? 'active' : ''}`} onClick={() => onSelectView('journal')}>
                        <i className="fa-solid fa-clock-rotate-left"></i> Journal
                    </button>
                )}
            </nav>

            {/* Pied de page Sidebar avec icône officielle */}
            <div className="sidebar-footer">
                <Logo variant="icon" height={20} alt="" />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>© {new Date().getFullYear()} Vinted Manager</span>
            </div>
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

// ------------------- VIEW: DASHBOARD / CALENDRIER (SUPPRIMÉ) -------------------
function DashboardView() {
    return null;
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
        setCouleurFond(c.couleurFond || c.couleur_fond || '');
        setTaille(c.taille || c.taille_vetement || '');
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
        setCouleurFond('');
        setTaille('');
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

                        <div className="grid-3" style={{ marginBottom: '12px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-palette" style={{ color: '#ec4899' }}></i> Code Couleur de Fond
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={couleurFond}
                                        onChange={(e) => setCouleurFond(e.target.value)}
                                        placeholder="ex: #ffffff, Fond Bois, Beige, #f1f5f9"
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="color"
                                        value={couleurFond && couleurFond.startsWith('#') && couleurFond.length === 7 ? couleurFond : '#ffffff'}
                                        onChange={(e) => setCouleurFond(e.target.value)}
                                        style={{ width: '38px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Choisir une couleur"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-ruler" style={{ color: '#8b5cf6' }}></i> Taille des Articles (Input Text)
                                </label>
                                <input
                                    type="text"
                                    value={taille}
                                    onChange={(e) => setTaille(e.target.value)}
                                    placeholder="ex: S, M, L, 38-40, XS-S"
                                />
                            </div>

                            <div className="form-group">
                                <label>Organisation</label>
                                <select value={isAdmin ? organisationId : userOrgId} onChange={(e) => setOrganisationId(e.target.value)} disabled={!isAdmin}>
                                    {organisations.map(o => (
                                        <option key={o.id} value={o.id}>{o.nom}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-1" style={{ marginBottom: '16px' }}>
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
                                <th>Couleur Fond</th>
                                <th>Taille</th>
                                <th>Téléphone</th>
                                <th>Email</th>
                                <th>Mot de passe</th>
                                <th>Notes & Observations</th>
                                {isCadre && <th style={{ width: '90px', minWidth: '90px', textAlign: 'center' }}>Actions</th>}
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
                                            {c.couleurFond ? (
                                                <span className="badge" style={{ backgroundColor: (c.couleurFond.startsWith('#') && c.couleurFond.length === 7) ? c.couleurFond : '#f8fafc', color: (c.couleurFond.startsWith('#') && c.couleurFond.length === 7) ? '#1e293b' : '#334155', border: '1px solid #cbd5e1', padding: '3px 9px', fontSize: '11.5px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: (c.couleurFond.startsWith('#') && c.couleurFond.length === 7) ? c.couleurFond : '#cbd5e1', border: '1px solid rgba(0,0,0,0.25)', display: 'inline-block' }}></span>
                                                    {c.couleurFond}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {c.taille ? (
                                                <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', padding: '3px 9px', fontSize: '11.5px', fontWeight: 700, borderRadius: '12px' }}>
                                                    📏 {c.taille}
                                                </span>
                                            ) : '-'}
                                        </td>

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
                                         <td style={{ fontSize: '12px', width: '220px', minWidth: '180px', maxWidth: '240px' }}>
                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                 {c.notes ? (
                                                     <span 
                                                         title={c.notes} 
                                                         style={{ 
                                                             color: '#334155', 
                                                             fontWeight: 500, 
                                                             display: '-webkit-box', 
                                                             WebkitLineClamp: 2, 
                                                             WebkitBoxOrient: 'vertical', 
                                                             overflow: 'hidden', 
                                                             textOverflow: 'ellipsis',
                                                             lineHeight: '1.35',
                                                             wordBreak: 'break-word'
                                                         }}
                                                     >
                                                         {c.notes}
                                                     </span>
                                                 ) : (
                                                     <span style={{ color: '#94a3b8' }}>-</span>
                                                 )}
                                                 <button
                                                     type="button"
                                                     onClick={() => handleCopyText(`N°${c.numeroCompte || ''} | Pseudo: ${c.pseudo || ''} | Tél: ${c.telephone || ''} | Email: ${c.email || ''} | MP: ${c.motDePasse || ''}`, 'all', c.id)}
                                                     title="Copier TOUS les identifiants"
                                                     style={{ alignSelf: 'flex-start', border: '1px solid #cbd5e1', background: copiedField === `${c.id}_all` ? '#dcfce7' : '#f8fafc', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px', color: copiedField === `${c.id}_all` ? '#166534' : '#475569', fontSize: '10.5px', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap' }}
                                                 >
                                                     {copiedField === `${c.id}_all` ? '✓ Copié !' : '📋 Tout copier'}
                                                 </button>
                                             </div>
                                         </td>
                                        {isCadre && (
                                            <td style={{ width: '90px', minWidth: '90px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(c)} title="Éditer le compte" style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteCompte(c.id)} title="Supprimer le compte" style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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

// ------------------- VIEW: PLANNING GENERATION (SUPPRIMÉ) -------------------
function PlanningView() {
    return null;
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
                <div style={{ textAlign: 'center', marginBottom: '26px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <Logo
                            variant="full"
                            height={102}
                            alt="Vinted Manager"
                            title="Vinted Manager"
                        />
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                        Connectez-vous pour accéder au tableau de bord
                    </p>
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

// ------------------- VIEW: UTILISATEURS AVEC ACCÈS PERSONNALISABLES -------------------
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

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        if (newRole === 'admin') setPermissions({ ...PermissionManager.PRESETS.admin });
        else if (newRole === 'cadre') setPermissions({ ...PermissionManager.PRESETS.cadre });
        else setPermissions({ ...PermissionManager.PRESETS.agent });
    };

    const handleTogglePermission = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleApplyPreset = (presetKey) => {
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
            setPermissions({ ...PermissionManager.PRESETS[presetKey] });
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
        setPermissions({ ...PermissionManager.PRESETS.agent });
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
            contactNumero,
            permissions
        });
        handleReset();
    };

    // Quick Modal Actions
    const openPermModal = (u) => {
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

    const handleToggleModalPerm = (key) => {
        setModalPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleApplyModalPreset = (presetKey) => {
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
            setModalPermissions({ ...PermissionManager.PRESETS[presetKey] });
        }
    };

    return (
        <section className="view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-users-gear" style={{ color: 'var(--primary-color)' }}></i>
                        Gestion des Utilisateurs & Droits d'Accès
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Personnalisez de façon granulaire les modules visibles et les actions autorisées pour chaque collaborateur.
                    </p>
                </div>
            </div>

            {/* FORMULAIRE UTILISATEUR */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-user-pen" style={{ color: 'var(--primary-color)' }}></i>
                    {userId ? 'Modifier le profil & les accès du membre' : 'Ajouter un nouveau membre avec accès personnalisables'}
                </h3>

                {!isAdmin && (
                    <p style={{ fontSize: '12px', color: 'var(--info)', marginBottom: '16px', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px' }}>
                        <i className="fa-solid fa-circle-info"></i> En tant que Cadre/Superviseur, vous pouvez gérer les accès des collaborateurs de votre organisation.
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid-3" style={{ marginBottom: '12px' }}>
                        <div className="form-group">
                            <label>Nom complet <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Van Quy Dang" required />
                        </div>
                        <div className="form-group">
                            <label>Adresse Email <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: vanquydang905@gmail.com" required />
                        </div>
                        <div className="form-group">
                            <label>Rôle Principal</label>
                            <select value={isAdmin ? role : 'agent'} onChange={(e) => handleRoleChange(e.target.value)} disabled={!isAdmin}>
                                {isAdmin && <option value="admin">Admin (Global)</option>}
                                {isAdmin && <option value="cadre">Cadre (Superviseur)</option>}
                                <option value="agent">Agent de publication</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid-3" style={{ marginBottom: '12px' }}>
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

                    <div className="grid-2" style={{ marginBottom: '16px' }}>
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

                    {/* SECTION: PERMISSIONS PERSONNALISABLES */}
                    <div style={{
                        marginTop: '16px',
                        marginBottom: '20px',
                        padding: '16px 18px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-shield-halved" style={{ color: 'var(--primary-color)' }}></i>
                                    Droits d'Accès Personnalisés pour ce Membre
                                </h4>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    Cochez les modules du menu et les actions opérationnelles accordés à cet utilisateur.
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button type="button" className="perm-preset-btn" onClick={() => handleApplyPreset('admin')}>
                                    👑 Tout Accorder
                                </button>
                                <button type="button" className="perm-preset-btn" onClick={() => handleApplyPreset('cadre')}>
                                    👔 Cadre
                                </button>
                                <button type="button" className="perm-preset-btn" onClick={() => handleApplyPreset('agent')}>
                                    👤 Agent Standard
                                </button>
                                <button type="button" className="perm-preset-btn" onClick={() => handleApplyPreset('none')}>
                                    🔒 Tout Refuser
                                </button>
                            </div>
                        </div>

                        {/* SOUS-GROUPE 1: VUES & MODULES DU MENU */}
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                📑 Modules & Vues Autorisés
                            </div>
                            <div className="perm-card-grid">
                                {PermissionManager.MODULES.map(m => {
                                    const active = Boolean(permissions[m.key]);
                                    return (
                                        <div
                                            key={m.key}
                                            className={`perm-item-card ${active ? 'active' : ''}`}
                                            onClick={() => handleTogglePermission(m.key)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className="perm-item-icon">
                                                    <i className={`fa-solid ${m.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>{m.label}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{m.desc}</div>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={() => {}} // handled by parent card onClick
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SOUS-GROUPE 2: DROITS D'ACTIONS & OPÉRATIONS */}
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                ⚡ Privilèges & Actions Opérationnelles
                            </div>
                            <div className="perm-card-grid">
                                {PermissionManager.ACTIONS.map(a => {
                                    const active = Boolean(permissions[a.key]);
                                    return (
                                        <div
                                            key={a.key}
                                            className={`perm-item-card ${active ? 'active' : ''}`}
                                            onClick={() => handleTogglePermission(a.key)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className="perm-item-icon">
                                                    <i className={`fa-solid ${a.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>{a.label}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{a.desc}</div>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={() => {}} // handled by parent card onClick
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ fontWeight: 600 }}>
                            <i className="fa-solid fa-user-check" style={{ marginRight: '6px' }}></i>
                            {userId ? 'Mettre à jour l\'utilisateur' : 'Enregistrer le nouveau membre'}
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
                <h3 className="card-title">Liste des Collaborateurs & Droits d'Accès ({visibleUsers.length})</h3>
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
                                <th>Accès & Permissions</th>
                                <th>Contact Direct</th>
                                <th>Agent Assigné</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.length > 0 ? (
                                visibleUsers.map(u => {
                                    const uPerms = PermissionManager.getPermissions(u);
                                    const allowedModulesCount = PermissionManager.MODULES.filter(m => uPerms[m.key]).length;
                                    const allowedActionsCount = PermissionManager.ACTIONS.filter(a => uPerms[a.key]).length;

                                    return (
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
                                                    {u.role === 'admin' ? 'Admin' : (u.role === 'cadre' ? 'Cadre' : 'Agent')}
                                                </span>
                                            </td>
                                            <td><span className="badge badge-compte">{((organisations.find(o => o.id === u.organisationId) || {}).nom) || u.organisationId || 'Par défaut'}</span></td>
                                            
                                            {/* Colonne Permissions & Accès personnalisables */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span className={`badge ${allowedModulesCount >= 10 ? 'badge-primary' : (allowedModulesCount >= 6 ? 'badge-secondary' : 'badge-danger')}`} style={{ fontSize: '11px', padding: '2px 7px' }}>
                                                        {allowedModulesCount}/11 modules
                                                    </span>
                                                    <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '2px 5px' }} title={`${allowedActionsCount} actions opérationnelles autorisées`}>
                                                        ⚡ {allowedActionsCount} actions
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-xs"
                                                        onClick={() => openPermModal(u)}
                                                        title="Modifier directement les accès de ce membre"
                                                        style={{ fontSize: '10.5px', padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <i className="fa-solid fa-sliders" style={{ color: 'var(--primary-color)' }}></i> Régler
                                                    </button>
                                                </div>
                                            </td>

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
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(u)} title="Éditer le profil et les accès">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteUser(u.id)} title="Supprimer">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL RAPIDE DE GESTION DES PERMISSIONS */}
            {permModalUser && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                            <div>
                                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-shield-halved" style={{ color: 'var(--primary-color)' }}></i>
                                    Permissions & Accès : {permModalUser.nom}
                                </h3>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    Rôle : <strong>{permModalUser.role}</strong> | Email : {permModalUser.email}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPermModalUser(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Presets in Modal */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', alignSelf: 'center', marginRight: '4px' }}>Préréglages :</span>
                            <button type="button" className="perm-preset-btn" onClick={() => handleApplyModalPreset('admin')}>
                                👑 Tout Accorder
                            </button>
                            <button type="button" className="perm-preset-btn" onClick={() => handleApplyModalPreset('cadre')}>
                                👔 Cadre
                            </button>
                            <button type="button" className="perm-preset-btn" onClick={() => handleApplyModalPreset('agent')}>
                                👤 Agent Standard
                            </button>
                            <button type="button" className="perm-preset-btn" onClick={() => handleApplyModalPreset('none')}>
                                🔒 Tout Refuser
                            </button>
                        </div>

                        {/* Modules Grid */}
                        <div style={{ marginBottom: '18px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                📑 Modules & Vues Autorisés
                            </div>
                            <div className="perm-card-grid">
                                {PermissionManager.MODULES.map(m => {
                                    const active = Boolean(modalPermissions[m.key]);
                                    return (
                                        <div
                                            key={m.key}
                                            className={`perm-item-card ${active ? 'active' : ''}`}
                                            onClick={() => handleToggleModalPerm(m.key)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className="perm-item-icon">
                                                    <i className={`fa-solid ${m.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>{m.label}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{m.desc}</div>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={() => {}}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions Grid */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                ⚡ Privilèges & Actions Opérationnelles
                            </div>
                            <div className="perm-card-grid">
                                {PermissionManager.ACTIONS.map(a => {
                                    const active = Boolean(modalPermissions[a.key]);
                                    return (
                                        <div
                                            key={a.key}
                                            className={`perm-item-card ${active ? 'active' : ''}`}
                                            onClick={() => handleToggleModalPerm(a.key)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className="perm-item-icon">
                                                    <i className={`fa-solid ${a.icon}`}></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>{a.label}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{a.desc}</div>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={() => {}}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setPermModalUser(null)}>
                                Annuler
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveModalPermissions} style={{ fontWeight: 600 }}>
                                <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>
                                Enregistrer les Accès
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

    const handleBulkRegisterSkus = async (e) => {
        if (e) e.preventDefault();
        setIsBulkProcessing(true);
        const userOrgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';

        try {
            const res = await fetch('/api/sku/bulk-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Filtre Temporel pour les Classements (Aujourd'hui par défaut, 2j, 3j, 7j, 14j, 30j, Custom, Tout)
    const [rankingDateFilter, setRankingDateFilter] = useState('1');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const referenceDate = useMemo(() => {
        let maxMs = 0;
        (calendrier || []).forEach(l => {
            if (l.date || l.datePrevue || l.created_at) {
                const val = l.date || l.datePrevue || l.created_at;
                const d = new Date(String(val).replace(' ', 'T'));
                if (!isNaN(d.getTime()) && d.getTime() > maxMs) {
                    maxMs = d.getTime();
                }
            }
        });
        return maxMs > 0 ? new Date(maxMs) : new Date();
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
        const todayStr = new Date().toISOString().split('T')[0];

        return (calendrier || []).filter(l => {
            if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return false;
            const dateVal = l.date || l.datePrevue || l.created_at;
            if (!dateVal) return false;
            const dStr = String(dateVal).split(' ')[0].split('T')[0];
            
            // Si filtre Aujourd'hui (1j) : match exact de la date du jour ou dernières 24h
            if (daysLimit === 1 && dStr === todayStr) {
                return true;
            }

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
            map[skuClean].scoreCumule += (l.score || 0);
            map[skuClean].ventes += (l.vente || 0);
            map[skuClean].pubs += 1;
            map[skuClean].lineIds.push(l.id);
            if (l.classification) map[skuClean].classification = l.classification;

            // Détection si le SKU est toujours actif et en ligne sur des comptes distincts
            const isDoneOrOnline = l.statut === 'Fait' || l.statut === 'Publié' || l.statut === '✓ Fait' || l.done || l.isOnline || l.enLigne;
            if (isDoneOrOnline) {
                map[skuClean].isOnline = true;
                const comp = comptesMap[l.compteId];
                const pseudoClean = comp && comp.pseudo ? comp.pseudo.trim() : (l.comptePseudo ? l.comptePseudo.trim() : '');
                if (pseudoClean) map[skuClean].onlineAccountsSet.add(pseudoClean.toLowerCase());
            }

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
            return apiSkuSummary.map(s => {
                const localInfo = allSKUsMap[s.sku] || {};
                const isOnline = Boolean(s.isOnline || s.status === 'PUBLISHED' || s.status === 'ACTIVE' || localInfo.isOnline || (s.pubs > 0));
                
                // Nombre de publications/comptes actifs 100% cohérent avec les publications réelles
                const activeAccountsCount = s.accountBreakdown && s.accountBreakdown.length > 0 
                    ? s.accountBreakdown.length 
                    : (localInfo.onlineAccountsSet ? localInfo.onlineAccountsSet.size : 0);

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
    }, [skuList, skuSearchTerm, skuFilterClassif, skuFilterOnline, skuFilterVentes, skuSortBy]);


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

    // Détail des comptes assignés à chaque agent (Actifs, Bannis, Restreints / Pause, Total)
    const agentComptesStats = useMemo(() => {
        const stats = {};
        (comptesAll || []).forEach(c => {
            if (c.agent && c.agent !== 'À attribuer' && c.agent !== 'Non assigné') {
                const k = c.agent.trim().toLowerCase();
                if (!stats[k]) {
                    stats[k] = { total: 0, actifs: 0, bannis: 0, restreints: 0 };
                }
                stats[k].total += 1;
                const st = (c.statut || '').trim().toLowerCase();
                if (st === 'actif') {
                    stats[k].actifs += 1;
                } else if (st === 'banni' || st === 'ban' || st === 'bloqué') {
                    stats[k].bannis += 1;
                } else {
                    // Limité, Restreint, Pause, Shadowban
                    stats[k].restreints += 1;
                }
            }
        });
        return stats;
    }, [comptesAll]);

    // Classement et performance des agents filtré par la période sélectionnée avec Classification
    const agentRanking = useMemo(() => {
        const statsMap = {};
        const poids = (appState.parametres && appState.parametres.poidsScore) || { vues: 0.1, likes: 1, favoris: 2, messages: 5, vente: 20 };

        (appState.utilisateurs || []).forEach(u => {
            const name = (u.nom || u.agentAssigne || '').trim();
            if (name && !statsMap[name.toLowerCase()]) {
                const key = name.toLowerCase();
                const cStats = agentComptesStats[key] || { total: 0, actifs: 0, bannis: 0, restreints: 0 };
                statsMap[key] = {
                    name,
                    role: u.role || 'agent',
                    dateCreation: u.dateCreation || u.createdAt || u.created_at || '',
                    comptesCount: cStats.total,
                    comptesTotal: cStats.total,
                    comptesActifs: cStats.actifs,
                    comptesBannis: cStats.bannis,
                    comptesRestreints: cStats.restreints,
                    pubsFaites: 0,
                    pubsTotales: 0,
                    ventes: 0,
                    vues: 0,
                    likes: 0,
                    scoreTotal: 0
                };
            }
        });

        filteredCalendrierForRanking.forEach(l => {
            if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return;
            let agentName = (l.agent || '').trim();
            // Lier les créneaux sans agent direct à l'agent assigné au compte
            if ((!agentName || agentName === 'À attribuer') && l.compteId && comptesMap[l.compteId] && comptesMap[l.compteId].agent && comptesMap[l.compteId].agent !== 'À attribuer') {
                agentName = comptesMap[l.compteId].agent.trim();
            }
            if (!agentName || agentName.toLowerCase().includes('attribuer') || agentName.toLowerCase().includes('bot dotb') || agentName.toLowerCase().includes('non assign')) return;
            const key = agentName.toLowerCase();
            if (!statsMap[key]) {
                const cStats = agentComptesStats[key] || { total: 0, actifs: 0, bannis: 0, restreints: 0 };
                const matchedUser = (appState.utilisateurs || []).find(u => 
                    (u.nom && u.nom.trim().toLowerCase() === key) ||
                    (u.agentAssigne && u.agentAssigne.trim().toLowerCase() === key)
                );
                statsMap[key] = {
                    name: agentName,
                    role: (matchedUser && matchedUser.role) || 'agent',
                    dateCreation: (matchedUser && (matchedUser.dateCreation || matchedUser.createdAt || matchedUser.created_at)) || '',
                    comptesCount: cStats.total,
                    comptesTotal: cStats.total,
                    comptesActifs: cStats.actifs,
                    comptesBannis: cStats.bannis,
                    comptesRestreints: cStats.restreints,
                    pubsFaites: 0,
                    pubsTotales: 0,
                    ventes: 0,
                    vues: 0,
                    likes: 0,
                    scoreTotal: 0
                };
            }
            statsMap[key].pubsTotales += 1;
            if (l.statut === 'Fait' || l.statut === 'Publié' || l.statut === '✓ Fait' || l.done) {
                statsMap[key].pubsFaites += 1;
            }
            statsMap[key].ventes += (l.vente || 0);
            statsMap[key].vues += (l.vues || 0);
            statsMap[key].likes += (l.likes || 0);

            const lineScore = (typeof l.score === 'number' && l.score > 0)
                ? l.score
                : ((l.vues || 0) * (poids.vues || 0.1) + (l.likes || 0) * (poids.likes || 1) + (l.favoris || 0) * (poids.favoris || 2) + (l.messages || 0) * (poids.messages || 5) + (l.vente || 0) * (poids.vente || 20));
            statsMap[key].scoreTotal += lineScore;
        });

        return Object.values(statsMap).filter(a => {
            const n = (a.name || '').toLowerCase();
            return !n.includes('attribuer') && !n.includes('bot dotb') && !n.includes('non assign') && n.trim().length > 0;
        }).map(a => {
            const taux = a.pubsTotales > 0 ? Math.round((a.pubsFaites / a.pubsTotales) * 100) : 0;
            const scoreMoyen = a.pubsTotales > 0 ? (a.scoreTotal / a.pubsTotales).toFixed(1) : 0;
            
            // Calcul de l'ancienneté de l'agent sur VintedManager (moins de 30 jours)
            let isRecentUser = false;
            if (a.dateCreation) {
                const creationDate = new Date(String(a.dateCreation).split('T')[0]);
                if (!isNaN(creationDate.getTime())) {
                    const diffDays = (Date.now() - creationDate.getTime()) / (1000 * 3600 * 24);
                    // Règle : utilisateur ajouté sur vintedmanager depuis moins de 30 jours
                    if (diffDays <= 30) {
                        isRecentUser = true;
                    }
                }
            }

            // Logique de classification : 🌟 Nouvel Agent uniquement si ajouté il y a - de 30 jours
            let classification = '🛑 Inactif';
            if (a.scoreTotal >= 1000 || a.ventes >= 10 || (taux >= 80 && a.pubsTotales >= 20)) {
                classification = '🏆 Agent Top';
            } else if (a.scoreTotal >= 150 || a.ventes >= 2 || (taux >= 50 && a.pubsFaites >= 5)) {
                classification = '⚡ En Progression';
            } else if (isRecentUser) {
                classification = '🌟 Nouvel Agent';
            } else if (a.pubsTotales > 0 || a.pubsFaites > 0 || a.scoreTotal > 0 || a.ventes > 0) {
                classification = '⚡ En Progression';
            } else {
                classification = '🛑 Inactif';
            }

            return {
                ...a,
                taux,
                scoreMoyen,
                classification
            };
        }).sort((a, b) => {
            if (b.scoreTotal !== a.scoreTotal) return b.scoreTotal - a.scoreTotal;
            if (b.ventes !== a.ventes) return b.ventes - a.ventes;
            return b.pubsFaites - a.pubsFaites;
        });
    }, [filteredCalendrierForRanking, appState.utilisateurs, appState.parametres, agentComptesStats, comptesMap]);

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

    const handleRegisterSKU = async (e) => {
        e.preventDefault();
        if (!newSkuInput.trim()) {
            if (window.showToast) window.showToast("⚠️ Veuillez saisir un code SKU valide.");
            return;
        }
        const skuClean = newSkuInput.trim();
        const userOrgId = (appState.currentUser && appState.currentUser.organisationId) || 'org_default';

        try {
            const res = await fetch('/api/sku/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                                 rankingDateFilter === '1' ? 'Données d\'aujourd\'hui (1j)' :
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
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, flexWrap: 'wrap' }}>
                        <i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }}></i>
                        Classement & Classification des Agents
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '5px' }} title="Données et métriques issues directement de l'API DotB Cloud">
                            <i className="fa-solid fa-cloud" style={{ color: '#2563eb' }}></i> Source : DotB Cloud
                        </span>
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
                                <th style={{ width: '65px', textAlign: 'center' }}>Rang</th>
                                <th>Agent & Rôle</th>
                                <th style={{ minWidth: '170px' }}>Comptes</th>
                                <th>Classification</th>
                                <th>Taux Réussite</th>
                                <th>Ventes</th>
                                <th style={{ textAlign: 'right' }}>Score Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgentRanking.length > 0 ? (
                                filteredAgentRanking.map((a, idx) => (
                                    <tr key={a.name}>
                                        <td style={{ textAlign: 'center' }}>
                                            {idx === 0 ? <span style={{ fontSize: '20px' }} title="1er Place">🥇</span> :
                                             idx === 1 ? <span style={{ fontSize: '20px' }} title="2ème Place">🥈</span> :
                                             idx === 2 ? <span style={{ fontSize: '20px' }} title="3ème Place">🥉</span> :
                                             <b style={{ color: 'var(--text-muted)' }}>#{idx + 1}</b>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                                    {a.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <b style={{ color: 'var(--text-primary)', display: 'block', lineHeight: '1.2' }}>{a.name}</b>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {a.comptesTotal > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                                        <span 
                                                            title={`${a.comptesActifs} compte(s) actif(s)`}
                                                            style={{ 
                                                                display: 'inline-flex', 
                                                                alignItems: 'center', 
                                                                gap: '4px', 
                                                                padding: '2px 7px', 
                                                                borderRadius: '12px', 
                                                                fontSize: '11px', 
                                                                fontWeight: 600, 
                                                                backgroundColor: a.comptesActifs > 0 ? '#ecfdf5' : '#f8fafc', 
                                                                color: a.comptesActifs > 0 ? '#059669' : '#94a3b8', 
                                                                border: `1px solid ${a.comptesActifs > 0 ? '#a7f3d0' : '#e2e8f0'}` 
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-circle-check" style={{ fontSize: '9.5px', color: a.comptesActifs > 0 ? '#10b981' : '#cbd5e1' }}></i>
                                                            {a.comptesActifs} actif{a.comptesActifs > 1 ? 's' : ''}
                                                        </span>
                                                        {a.comptesBannis > 0 && (
                                                            <span 
                                                                title={`${a.comptesBannis} compte(s) banni(s)`}
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '4px', 
                                                                    padding: '2px 7px', 
                                                                    borderRadius: '12px', 
                                                                    fontSize: '11px', 
                                                                    fontWeight: 600, 
                                                                    backgroundColor: '#fef2f2', 
                                                                    color: '#dc2626', 
                                                                    border: '1px solid #fecaca' 
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-ban" style={{ fontSize: '9.5px', color: '#ef4444' }}></i>
                                                                {a.comptesBannis} ban{a.comptesBannis > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                        {a.comptesRestreints > 0 && (
                                                            <span 
                                                                title={`${a.comptesRestreints} compte(s) restreint(s) ou en pause`}
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '4px', 
                                                                    padding: '2px 7px', 
                                                                    borderRadius: '12px', 
                                                                    fontSize: '11px', 
                                                                    fontWeight: 600, 
                                                                    backgroundColor: '#fffbeb', 
                                                                    color: '#d97706', 
                                                                    border: '1px solid #fde68a' 
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '9.5px', color: '#f59e0b' }}></i>
                                                                {a.comptesRestreints} restr.
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                                        Total : <b style={{ color: 'var(--text-secondary)' }}>{a.comptesTotal}</b>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                                            )}
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                                                <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${a.taux}%`, backgroundColor: a.taux >= 80 ? '#10b981' : a.taux >= 50 ? '#f59e0b' : '#ef4444', height: '100%' }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 600 }}>{a.taux}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: a.ventes > 0 ? '#059669' : 'inherit' }}>
                                                {a.ventes} vente{a.ventes > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="badge badge-gagnant" style={{ fontSize: '13px', fontWeight: 700 }}>
                                                {Math.round(a.scoreTotal).toLocaleString('fr-FR')} pts
                                            </span>
                                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {a.scoreMoyen} pts/pub
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
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

                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <i className="fa-solid fa-boxes-packing" style={{ color: 'var(--primary)' }}></i>
                    Enregistrement & Répertoire des SKU avec Classification
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '5px' }} title="Métriques et ventes consolidées depuis l'API et les exports DotB Cloud">
                        <i className="fa-solid fa-cloud" style={{ color: '#2563eb' }}></i> Source : DotB Cloud
                    </span>
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                    Enregistrez vos SKU et définissez directement leur classification (Nouveau produit, Gagnant, À retester, Écarté).
                </p>

                {/* FORMULAIRE D'AJOUT ET VÉRIFICATION SKU */}
                <form onSubmit={handleRegisterSKU} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 3, minWidth: '220px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-solid fa-barcode" style={{ color: '#2563eb' }}></i> Code SKU à Vérifier & Enregistrer
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="input"
                                    value={newSkuInput}
                                    onChange={(e) => setNewSkuInput(e.target.value)}
                                    placeholder="ex: sz2602188195162729, SKU-JEAN-02"
                                    required
                                    style={{
                                        height: '42px',
                                        fontSize: '13px',
                                        paddingRight: '36px',
                                        borderColor: skuVerificationStatus ? (skuVerificationStatus.exists ? '#f59e0b' : '#10b981') : '#cbd5e1',
                                        backgroundColor: skuVerificationStatus ? (skuVerificationStatus.exists ? '#fffbeb' : '#f0fdf4') : '#fff'
                                    }}
                                />
                                {skuVerificationStatus && (
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px' }}>
                                        {skuVerificationStatus.exists ? '⚠️' : '✅'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 2, minWidth: '180px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Classification Définie</label>
                            <select
                                className="input"
                                value={newClassifInput}
                                onChange={(e) => setNewClassifInput(e.target.value)}
                                style={{ height: '42px', fontSize: '13px' }}
                            >
                                <option value="Nouveau produit">✨ Nouveau produit</option>
                                <option value="Gagnant">🏆 Gagnant</option>
                                <option value="À retester">🔄 À retester</option>
                                <option value="Écarté">🚫 Écarté</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 22px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-shield-check"></i> {skuVerificationStatus && skuVerificationStatus.exists ? 'Mettre à jour SKU' : 'Vérifier & Enregistrer'}
                        </button>
                    </div>

                    {/* ENCADRÉ DE VÉRIFICATION EN TEMPS RÉEL DU SKU */}
                    {skuVerificationStatus && (
                        <div style={{
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
                        }}>
                            {skuVerificationStatus.exists ? (
                                <>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d97706', fontSize: '15px' }}></i>
                                    <span>
                                        <b>SKU Déjà Enregistré :</b> Produit "{skuVerificationStatus.produit}" — Classification actuelle : <span className="badge badge-gagnant" style={{ padding: '2px 8px', fontSize: '11px', marginLeft: '4px' }}>{skuVerificationStatus.classification}</span> ({skuVerificationStatus.ventes} vente(s), {skuVerificationStatus.pubs} publication(s)).
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', fontSize: '15px' }}></i>
                                    <span>
                                        <b>SKU Valide & Conforme :</b> Ce code est prêt à être enregistré et classé sous <b>"{newClassifInput}"</b>.
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </form>

                {/* FORMULAIRE DE QUALIFICATION DE MASSE / GOOGLE SHEET EN "À RETESTER" */}
                <form onSubmit={handleBulkRegisterSkus} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', backgroundColor: '#f1f5f9', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-file-spreadsheet" style={{ color: '#059669', fontSize: '18px' }}></i>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                Qualification de Masse depuis Google Sheet ou Liste (Statut : <span className="badge badge-retester" style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '2px 8px' }}>🔄 À retester</span>)
                            </h4>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>Importation directe de tous les articles du Google Sheet</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 3, minWidth: '260px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px', display: 'block' }}>
                                Lien Google Sheet ou Liste de SKUs (Séparez par virgule ou saut de ligne)
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={bulkSheetUrlInput}
                                onChange={(e) => setBulkSheetUrlInput(e.target.value)}
                                placeholder="ex: https://docs.google.com/spreadsheets/d/1_8zZWfVVCU96VLLIlyulK2gchbrNkBVOyMb6WTr0X6w..."
                                style={{ height: '40px', fontSize: '12.5px', backgroundColor: '#ffffff' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isBulkProcessing}
                            className="btn btn-secondary"
                            style={{ height: '40px', padding: '0 20px', fontSize: '13px', fontWeight: 600, backgroundColor: '#059669', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isBulkProcessing ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i> Traitement...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-down"></i> Classer les SKUs du Sheet comme "À retester"
                                </>
                            )}
                        </button>
                    </div>


                    <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>

                        <span><b>Note sur les permissions Google Sheet :</b> Si le fichier est en accès restreint, assurez-vous de régler le partage sur <i>"Tous les utilisateurs disposant du lien"</i> ou collez directement la liste des SKUs ci-dessous :</span>
                        <textarea
                            className="input"
                            rows="2"
                            value={bulkSkusTextInput}
                            onChange={(e) => setBulkSkusTextInput(e.target.value)}
                            placeholder="Collez vos codes SKUs ici (ex: sz26001, sz26002, sz26003...)"
                            style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '4px', backgroundColor: '#f8fafc' }}
                        />
                    </div>
                </form>

                {/* TABLEAU DES SKUS ET CLASSIFICATIONS */}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Catalogue des SKUs Qualifiés ({filteredSKUList.length})
                        <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                            🌐 {onlineSkuCount} En Ligne
                        </span>
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="input"
                            value={skuFilterOnline}
                            onChange={(e) => setSkuFilterOnline(e.target.value)}
                            style={{ height: '34px', fontSize: '12px', width: '160px', borderRadius: '6px', border: skuFilterOnline !== 'all' ? '1.5px solid #10b981' : '1px solid var(--border)' }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="online">🌐 En Ligne uniquement</option>
                            <option value="offline">⚪ Hors Ligne / Non publiés</option>
                        </select>
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
                                <th>Statut En Ligne</th>
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
                                        <td>
                                            {s.isOnline ? (
                                                <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '4px 10px', fontSize: '11.5px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                                    <i className="fa-solid fa-globe"></i> En Ligne ({s.onlinePubs || 1})
                                                </span>
                                            ) : (
                                                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '4px 8px', fontSize: '11.5px', borderRadius: '12px' }}>
                                                    Hors Ligne
                                                </span>
                                            )}
                                        </td>
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
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
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
                                        {s.isOnline ? (
                                            <span className="badge" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '3px 9px', fontSize: '11.5px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                                <i className="fa-solid fa-globe"></i> En Ligne ({s.onlinePubs || s.pubs || 1})
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '3px 9px', fontSize: '11.5px', borderRadius: '12px' }}>
                                                Hors Ligne
                                            </span>
                                        )}
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

// ============================================================
// AUDIO SYNTHESIZER & NOTIFICATION ENGINE (Web Audio API)
// ============================================================
var SoundEngine = {
    ctx: null,
    isMuted: function() {
        try {
            return localStorage.getItem('vinted_notif_sound_muted') === 'true';
        } catch(e) {
            return false;
        }
    },
    setMuted: function(muted) {
        try {
            localStorage.setItem('vinted_notif_sound_muted', muted ? 'true' : 'false');
        } catch(e) {}
    },
    getContext: function() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },
    playTone: function(freq, type, duration, delay, gain) {
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
        } catch(e) {
            console.warn('Audio tone error', e);
        }
    },
    playUrgentAlert: function() {
        // High attention urgent alert (double siren pulse + harmonic octave)
        this.playTone(880, 'triangle', 0.14, 0, 0.25);
        this.playTone(1174.66, 'triangle', 0.16, 0.11, 0.25);
        this.playTone(880, 'triangle', 0.14, 0.24, 0.25);
        this.playTone(1760, 'triangle', 0.30, 0.36, 0.28);
    },
    playWarningAlert: function() {
        // 2-step attention chime
        this.playTone(587.33, 'sine', 0.18, 0, 0.2);
        this.playTone(880, 'sine', 0.28, 0.15, 0.22);
    },
    playSuccess: function() {
        // Melodic ascending chord C5 -> E5 -> G5 -> C6
        this.playTone(523.25, 'sine', 0.11, 0, 0.2);
        this.playTone(659.25, 'sine', 0.11, 0.09, 0.2);
        this.playTone(783.99, 'sine', 0.13, 0.18, 0.22);
        this.playTone(1046.50, 'sine', 0.28, 0.29, 0.25);
    },
    playSnooze: function() {
        this.playTone(659.25, 'sine', 0.14, 0, 0.18);
        this.playTone(440, 'sine', 0.20, 0.11, 0.15);
    },
    playCheck: function() {
        this.playTone(587.33, 'triangle', 0.07, 0, 0.15);
        this.playTone(880, 'triangle', 0.10, 0.06, 0.18);
    }
};

var SystemNotifications = {
    isSupported: function() {
        return typeof window !== 'undefined' && 'Notification' in window;
    },
    getPermission: function() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    },
    requestPermission: async function() {
        if (!this.isSupported()) return 'unsupported';
        try {
            const p = await Notification.requestPermission();
            return p;
        } catch(e) {
            return 'denied';
        }
    },
    notify: function(title, body, options) {
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
            notif.onclick = function() {
                window.focus();
                if (options.onClick) options.onClick();
                notif.close();
            };
            return notif;
        } catch(e) {
            console.warn('System push error', e);
            return null;
        }
    }
};

var TodoUtils = {
    parseDeadline: function(todo) {
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
    getStatusInfo: function(todo) {
        if (todo.statut === 'terminee') {
            return { isDone: true, isOverdue: false, isImminent: false, label: 'Terminée', diffHours: 0 };
        }
        const d = this.parseDeadline(todo);
        if (!d) {
            return { isDone: false, isOverdue: false, isImminent: false, label: 'Non définie', diffHours: 9999 };
        }
        const now = Date.now();
        const diffMs = d.getTime() - now;
        const diffMinutes = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);

        if (diffMs < 0) {
            const overdueMin = Math.abs(diffMinutes);
            let text = '';
            if (overdueMin < 60) text = `En retard de ${overdueMin}m`;
            else if (overdueMin < 1440) text = `En retard de ${Math.round(overdueMin/60)}h`;
            else text = `En retard de ${Math.round(overdueMin/1440)}j`;
            return { isDone: false, isOverdue: true, isImminent: false, label: text, diffMinutes, diffHours };
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

        return { isDone: false, isOverdue: false, isImminent, label: text, diffMinutes, diffHours };
    },
    isAuthor: function(todo, user) {
        if (!todo || !user) return false;
        const userNom = (user.nom || '').trim().toLowerCase();
        const userAgent = (user.agentAssigne || '').trim().toLowerCase();
        const userEmail = (user.email || '').trim().toLowerCase();
        const userId = user.id;

        if (todo.creeParId && userId && String(todo.creeParId) === String(userId)) return true;
        const creator = (todo.creePar || '').trim().toLowerCase();
        if (creator && (creator === userNom || (userAgent && creator === userAgent) || (userEmail && creator === userEmail))) {
            return true;
        }
        return false;
    },
    isGlobalTask: function(todo) {
        if (!todo) return false;
        const assigned = (todo.agentAssigne || todo.agent || '').trim().toLowerCase();
        return !assigned || assigned === 'tous' || assigned === 'all' || assigned === 'équipe' || assigned === 'equipe' || assigned === 'non assigné';
    },
    isTaskForUser: function(todo, user) {
        if (!todo || !user) return false;
        // Si c'est une tâche globale destinée à toute l'équipe
        if (this.isGlobalTask(todo)) return true;

        const userNom = (user.nom || '').trim().toLowerCase();
        const userAgent = (user.agentAssigne || '').trim().toLowerCase();
        const userEmail = (user.email || '').trim().toLowerCase();
        const assigned = (todo.agentAssigne || todo.agent || '').trim().toLowerCase();

        // Si la tâche est assignée directement à l'agent
        if (assigned === userNom || (userAgent && assigned === userAgent) || (userEmail && assigned === userEmail)) {
            return true;
        }

        // Si l'utilisateur est le créateur de la tâche
        if (this.isAuthor(todo, user)) return true;

        return false;
    },
    formatDateTime: function(dateValue) {
        if (!dateValue) return '';
        try {
            const d = new Date(dateValue);
            if (isNaN(d.getTime())) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} à ${hours}:${minutes}`;
        } catch(e) {
            return '';
        }
    },
    compressImageFile: function(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("Aucun fichier fourni"));
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error("Format d'image non supporté"));
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        } else {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
                    const bytes = Math.round(base64Length * 0.75);
                    const formattedSize = bytes > 1048576 
                        ? (bytes / 1048576).toFixed(1) + ' Mo' 
                        : Math.round(bytes / 1024) + ' Ko';

                    resolve({
                        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                        nom: file.name || 'photo.jpg',
                        taille: formattedSize,
                        url: compressedDataUrl,
                        dateAjout: new Date().toISOString()
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },
    downloadImage: function(photo) {
        if (!photo || !photo.url) return;
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = photo.nom || `photo_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ============================================================
// NOTIFICATION BELL CENTER (HEADER COMPONENT)
// ============================================================
function NotificationBellCenter({ todos = [], currentUser = null, onNavigateTodo, onSaveTodo, showToast }) {
    const [isOpen, setIsOpen] = useState(false);
    const [soundMuted, setSoundMuted] = useState(() => SoundEngine.isMuted());
    const [pushPerm, setPushPerm] = useState(() => SystemNotifications.getPermission());
    const [tabFilter, setTabFilter] = useState('urgents'); // 'urgents' | 'all' | 'today'

    // Real-time calculated alerts
    const alerts = useMemo(() => {
        return (todos || []).map(t => {
            const info = TodoUtils.getStatusInfo(t);
            return { todo: t, info };
        }).filter(item => !item.info.isDone);
    }, [todos]);

    const urgentOverdueAlerts = useMemo(() => {
        return alerts.filter(a => a.info.isOverdue || a.todo.priorite === 'urgente' || a.info.isImminent);
    }, [alerts]);

    const activeList = useMemo(() => {
        if (tabFilter === 'urgents') return urgentOverdueAlerts;
        if (tabFilter === 'today') {
            return alerts.filter(a => a.info.isOverdue || (a.info.diffMinutes >= 0 && a.info.diffMinutes < 1440));
        }
        return alerts;
    }, [tabFilter, alerts, urgentOverdueAlerts]);

    const hasUrgent = urgentOverdueAlerts.length > 0;
    const badgeCount = urgentOverdueAlerts.length;

    // Toggle sound
    const handleToggleSound = (e) => {
        e.stopPropagation();
        const next = !soundMuted;
        setSoundMuted(next);
        SoundEngine.setMuted(next);
        if (showToast) showToast(next ? '🔇 Alertes sonores désactivées' : '🔊 Alertes sonores activées');
        if (!next) SoundEngine.playCheck();
    };

    // Test audio
    const handleTestSound = (e) => {
        e.stopPropagation();
        SoundEngine.playUrgentAlert();
        if (showToast) showToast('🔔 Démonstration alerte sonore ultra-haute priorité !');
    };

    // Request push
    const handleRequestPush = async (e) => {
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
        const author = currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Utilisateur') : 'Utilisateur';
        if (onSaveTodo) {
            await onSaveTodo({
                ...todo,
                statut: 'terminee',
                terminePar: author,
                dateTerminee: new Date().toISOString(),
                modifiePar: author
            });
        }
        if (showToast) showToast(`🎉 Tâche "${todo.titre}" réalisée avec succès !`);
        SystemNotifications.notify('Tâche Réalisée ! ✅', `"${todo.titre}" a été complétée par ${author}.`);
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

    return (
        <div className="notif-dropdown-wrapper" style={{ position: 'relative' }}>
            <button
                type="button"
                className={`notif-bell-btn ${hasUrgent ? 'has-urgent' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications & Rappels Tâches"
                aria-label="Centre de notifications"
            >
                <i className={`fa-solid ${hasUrgent ? 'fa-bell fa-bounce' : 'fa-bell'}`} style={{ fontSize: '15px' }}></i>
                {badgeCount > 0 && (
                    <span className={`notif-badge-counter ${hasUrgent ? 'pulse' : ''}`}>
                        {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="notif-popover">
                        {/* Header */}
                        <div className="notif-popover-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-bell" style={{ color: 'var(--primary-color)' }}></i>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Notifications & Alertes</span>
                                <span className={`badge ${badgeCount > 0 ? 'badge-danger' : 'badge-secondary'}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                                    {alerts.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                    type="button"
                                    onClick={handleToggleSound}
                                    title={soundMuted ? 'Activer le son' : 'Couper le son'}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: soundMuted ? '#ef4444' : '#22c55e', fontSize: '14px' }}
                                >
                                    <i className={`fa-solid ${soundMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTestSound}
                                    title="Tester l'alerte sonore"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}
                                >
                                    <i className="fa-solid fa-play"></i>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        {/* Push Permission Alert Banner */}
                        {pushPerm !== 'granted' && (
                            <div style={{
                                padding: '8px 12px',
                                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(147,51,234,0.08))',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '11.5px'
                            }}>
                                <span style={{ color: '#1e293b' }}>
                                    <i className="fa-solid fa-desktop" style={{ marginRight: '6px', color: '#2563eb' }}></i>
                                    Activer les alertes sur votre bureau ?
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-xs"
                                    onClick={handleRequestPush}
                                    style={{ fontSize: '11px', padding: '2px 8px' }}
                                >
                                    Activer
                                </button>
                            </div>
                        )}

                        {/* Quick Filter Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '4px 8px', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setTabFilter('urgents')}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 4px',
                                    fontSize: '11px',
                                    fontWeight: tabFilter === 'urgents' ? 700 : 500,
                                    background: tabFilter === 'urgents' ? '#fee2e2' : 'transparent',
                                    color: tabFilter === 'urgents' ? '#b91c1c' : '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                🚨 Urgents ({urgentOverdueAlerts.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabFilter('today')}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 4px',
                                    fontSize: '11px',
                                    fontWeight: tabFilter === 'today' ? 700 : 500,
                                    background: tabFilter === 'today' ? '#e0e7ff' : 'transparent',
                                    color: tabFilter === 'today' ? '#4338ca' : '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                📅 Aujourd'hui
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabFilter('all')}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 4px',
                                    fontSize: '11px',
                                    fontWeight: tabFilter === 'all' ? 700 : 500,
                                    background: tabFilter === 'all' ? '#e2e8f0' : 'transparent',
                                    color: tabFilter === 'all' ? '#0f172a' : '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                Tout ({alerts.length})
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="notif-popover-body">
                            {activeList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 16px', color: '#94a3b8' }}>
                                    <i className="fa-solid fa-circle-check" style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px', display: 'block' }}></i>
                                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Aucune alerte en attente !</div>
                                    <div style={{ fontSize: '11.5px', marginTop: '4px' }}>Toutes vos tâches sont à jour et sous contrôle.</div>
                                </div>
                            ) : (
                                activeList.map(({ todo, info }) => {
                                    const subtasksCount = (todo.sousTaches || []).length;
                                    const subtasksDone = (todo.sousTaches || []).filter(s => s.fait).length;
                                    return (
                                        <div
                                            key={todo.id}
                                            className={`notif-item ${info.isOverdue ? 'overdue' : (todo.priorite === 'urgente' ? 'urgent' : '')}`}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                                        <span className={`badge-priority badge-priority-${todo.priorite || 'moyenne'}`}>
                                                            {todo.priorite === 'urgente' ? '🚨 URGENTE' : (todo.priorite || 'Moyenne')}
                                                        </span>
                                                        {todo.categorie && (
                                                            <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                                                {todo.categorie}
                                                            </span>
                                                        )}
                                                        {todo.compteNom && (
                                                            <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                                                @{todo.compteNom}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>
                                                        {todo.titre}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: info.isOverdue ? '#dc2626' : (info.isImminent ? '#ea580c' : '#64748b'), fontWeight: info.isOverdue || info.isImminent ? 600 : 400 }}>
                                                        <i className={`fa-solid ${info.isOverdue ? 'fa-triangle-exclamation' : 'fa-clock'}`}></i>
                                                        <span>{info.label}</span>
                                                        {subtasksCount > 0 && (
                                                            <span style={{ color: '#64748b', marginLeft: 'auto' }}>
                                                                <i className="fa-solid fa-list-check" style={{ marginRight: '3px' }}></i>
                                                                {subtasksDone}/{subtasksCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-success"
                                                    onClick={(e) => handleQuickDone(todo, e)}
                                                    title="Marquer comme terminée"
                                                    style={{ fontSize: '10.5px', padding: '2px 7px' }}
                                                >
                                                    <i className="fa-solid fa-check"></i> Fait
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-secondary"
                                                    onClick={(e) => handleSnooze(todo, 1, e)}
                                                    title="Reporter de 1 heure"
                                                    style={{ fontSize: '10.5px', padding: '2px 7px' }}
                                                >
                                                    +1h
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-secondary"
                                                    onClick={(e) => handleSnooze(todo, 24, e)}
                                                    title="Reporter de 1 jour"
                                                    style={{ fontSize: '10.5px', padding: '2px 7px' }}
                                                >
                                                    +1j
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        if (onNavigateTodo) onNavigateTodo(todo.id);
                                                    }}
                                                    title="Voir dans le gestionnaire"
                                                    style={{ fontSize: '10.5px', padding: '2px 7px' }}
                                                >
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="notif-popover-footer">
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => {
                                    setIsOpen(false);
                                    if (onNavigateTodo) onNavigateTodo();
                                }}
                            >
                                <i className="fa-solid fa-list-check" style={{ marginRight: '6px' }}></i>
                                Ouvrir le Gestionnaire To-Do
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================
// LIGHTBOX VIEWER POUR PHOTOS DE TÂCHES (VOIR & TÉLÉCHARGER)
// ============================================================
function TodoPhotoLightboxModal({ isOpen, onClose, photos = [], initialIndex = 0, taskTitle = '' }) {
    if (!isOpen || !photos || photos.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

    useEffect(() => {
        setCurrentIndex(initialIndex || 0);
    }, [initialIndex, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
            else if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, photos.length]);

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    };

    const currentPhoto = photos[currentIndex] || photos[0];

    const handleDownload = (e) => {
        if (e) e.stopPropagation();
        TodoUtils.downloadImage(currentPhoto);
    };

    return (
        <div className="todo-lightbox-backdrop" onClick={onClose}>
            <div className="todo-lightbox-content" onClick={e => e.stopPropagation()}>
                {/* En-tête Lightbox */}
                <div className="todo-lightbox-header">
                    <div className="todo-lightbox-title-area">
                        <span className="todo-lightbox-task-badge">
                            <i className="fa-solid fa-list-check" style={{ marginRight: '6px' }}></i>
                            {taskTitle || 'Tâche'}
                        </span>
                        <span className="todo-lightbox-photo-name" title={currentPhoto.nom}>
                            {currentPhoto.nom || 'Photo'}
                        </span>
                        {currentPhoto.taille && (
                            <span className="todo-lightbox-size-badge">{currentPhoto.taille}</span>
                        )}
                    </div>

                    <div className="todo-lightbox-actions">
                        <span className="todo-lightbox-counter">
                            {currentIndex + 1} / {photos.length}
                        </span>

                        <button
                            type="button"
                            className="btn btn-sm btn-primary todo-lightbox-download-btn"
                            onClick={handleDownload}
                            title="Télécharger l'image sur votre appareil"
                        >
                            <i className="fa-solid fa-download"></i>
                            <span>Télécharger</span>
                        </button>

                        <a
                            href={currentPhoto.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary todo-lightbox-icon-btn"
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>

                        <button
                            type="button"
                            className="todo-lightbox-close-btn"
                            onClick={onClose}
                            title="Fermer (Échap)"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Zone principale d'affichage de l'image */}
                <div className="todo-lightbox-main">
                    {photos.length > 1 && (
                        <button
                            type="button"
                            className="todo-lightbox-nav prev"
                            onClick={handlePrev}
                            title="Photo précédente (←)"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                    )}

                    <div className="todo-lightbox-image-wrapper">
                        <img
                            src={currentPhoto.url}
                            alt={currentPhoto.nom || 'Photo tâche'}
                            className="todo-lightbox-image"
                        />
                    </div>

                    {photos.length > 1 && (
                        <button
                            type="button"
                            className="todo-lightbox-nav next"
                            onClick={handleNext}
                            title="Photo suivante (→)"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    )}
                </div>

                {/* Bandeau de vignettes en bas si plusieurs photos */}
                {photos.length > 1 && (
                    <div className="todo-lightbox-thumbnails">
                        {photos.map((p, idx) => (
                            <div
                                key={p.id || idx}
                                className={`todo-lightbox-thumb ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                                title={p.nom}
                            >
                                <img src={p.url} alt={p.nom} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
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
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'done'
    const [isDoneSectionCollapsed, setIsDoneSectionCollapsed] = useState(false);

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
    const [categorie, setCategorie] = useState('Autre');
    const [compteId, setCompteId] = useState('');
    const [agentAssigne, setAgentAssigne] = useState('');
    const [dateEcheance, setDateEcheance] = useState('');
    const [heureEcheance, setHeureEcheance] = useState('');
    const [rappelMinutes, setRappelMinutes] = useState(30);
    const [alerteSonore, setAlerteSonore] = useState(true);
    const [creePar, setCreePar] = useState('');
    const [sousTaches, setSousTaches] = useState([]);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [lightboxData, setLightboxData] = useState(null); // { isOpen, photos, initialIndex, taskTitle }

    // Pre-fill categories list
    const predefinedCategories = ['Autre', 'Expédition', 'Litige & SAV', 'Annonce & Photos', 'Boost & Promos', 'Comptabilité', 'Inventaire'];

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

        const percentDone = total > 0 ? Math.round((terminees / total) * 100) : 0;
        return { total, urgentes, enRetard, enCours, terminees, percentDone };
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
                const matchCreator = (t.creePar || '').toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchCat && !matchCompte && !matchAgent && !matchCreator) return false;
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
                const weights = { urgente: 4, haute: 3, moyenne: 2, basse: 1 };
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

    // Séparation des tâches en attente et terminées
    const pendingTodos = useMemo(() => {
        return filteredTodos.filter(t => t.statut !== 'terminee');
    }, [filteredTodos]);

    const doneTodos = useMemo(() => {
        return filteredTodos.filter(t => t.statut === 'terminee');
    }, [filteredTodos]);

    // Séparation : Mes Tâches Personnelles (assignées à moi ou créées par moi) vs Tâches Globales (Tous / Équipe)
    const myPendingTodos = useMemo(() => {
        return pendingTodos.filter(t => !TodoUtils.isGlobalTask(t) && TodoUtils.isTaskForUser(t, currentUser));
    }, [pendingTodos, currentUser]);

    const globalPendingTodos = useMemo(() => {
        return pendingTodos.filter(t => TodoUtils.isGlobalTask(t));
    }, [pendingTodos]);

    const otherPendingTodos = useMemo(() => {
        return pendingTodos.filter(t => !TodoUtils.isGlobalTask(t) && !TodoUtils.isTaskForUser(t, currentUser));
    }, [pendingTodos, currentUser]);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingTodo(null);
        setTitre('');
        setDescription('');
        setPriorite('moyenne');
        setStatut('a_faire');
        setCategorie('Autre');
        setCompteId(comptes[0] ? comptes[0].id : '');
        setAgentAssigne(currentUser ? (currentUser.agentAssigne || currentUser.nom) : '');
        setCreePar(currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Florencio') : 'Florencio');
        setDateEcheance('');
        setHeureEcheance('');
        setRappelMinutes(30);
        setAlerteSonore(true);
        setSousTaches([]);
        setNewSubtaskText('');
        setPhotos([]);
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (todo) => {
        setEditingTodo(todo);
        setTitre(todo.titre || '');
        setDescription(todo.description || '');
        setPriorite(todo.priorite || 'moyenne');
        setStatut(todo.statut || 'a_faire');
        setCategorie(todo.categorie || 'Autre');
        setCompteId(todo.compteId || '');
        setAgentAssigne(todo.agentAssigne || '');
        setCreePar(todo.creePar || (currentUser ? (currentUser.nom || currentUser.agentAssigne) : 'Florencio'));
        setDateEcheance(todo.dateEcheance || '');
        setHeureEcheance(todo.heureEcheance || '');
        setRappelMinutes(todo.rappelMinutes !== undefined ? todo.rappelMinutes : 30);
        setAlerteSonore(todo.alerteSonore !== false);
        setSousTaches(Array.isArray(todo.sousTaches) ? [...todo.sousTaches] : []);
        setNewSubtaskText('');
        setPhotos(Array.isArray(todo.photos) ? [...todo.photos] : []);
        setIsModalOpen(true);
    };

    // Photo handlers
    const handleFilesSelected = async (fileList) => {
        if (!fileList || fileList.length === 0) return;
        const validFiles = Array.from(fileList).filter(f => f.type && f.type.startsWith('image/'));
        if (validFiles.length === 0) {
            if (showToast) showToast('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP...)', true);
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const processed = await Promise.all(validFiles.map(f => TodoUtils.compressImageFile(f)));
            setPhotos(prev => [...prev, ...processed]);
            SoundEngine.playCheck();
            if (showToast) showToast(`📷 ${processed.length} photo(s) ajoutée(s) à la tâche`);
        } catch (err) {
            console.error(err);
            if (showToast) showToast("Erreur lors de la compression de l'image", true);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleRemovePhoto = (photoIndex) => {
        setPhotos(prev => prev.filter((_, i) => i !== photoIndex));
    };

    const handleOpenLightbox = (todo, photoIndex = 0) => {
        const todoPhotos = Array.isArray(todo.photos) ? todo.photos : [];
        if (todoPhotos.length === 0) return;
        setLightboxData({
            isOpen: true,
            photos: todoPhotos,
            initialIndex: photoIndex,
            taskTitle: todo.titre
        });
    };

    // Save Todo
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titre.trim()) {
            if (showToast) showToast('Veuillez renseigner un titre de tâche', true);
            return;
        }

        const selectedCompte = comptes.find(c => c.id === compteId);
        const compteNom = selectedCompte ? (selectedCompte.nomCompte || selectedCompte.nom || selectedCompte.pseudo) : '';

        const payload = {
            id: editingTodo ? editingTodo.id : undefined,
            titre: titre.trim(),
            description: description.trim(),
            priorite,
            statut,
            categorie: categorie || 'Autre',
            compteId,
            compteNom,
            agentAssigne,
            creePar: creePar.trim() || (currentUser ? (currentUser.nom || currentUser.agentAssigne) : 'Florencio'),
            creeParId: editingTodo ? (editingTodo.creeParId || (currentUser ? currentUser.id : undefined)) : (currentUser ? currentUser.id : undefined),
            dateCreation: editingTodo ? (editingTodo.dateCreation || new Date().toISOString()) : new Date().toISOString(),
            dateTerminee: editingTodo ? editingTodo.dateTerminee : (statut === 'terminee' ? new Date().toISOString() : null),
            terminePar: editingTodo ? editingTodo.terminePar : (statut === 'terminee' ? (currentUser ? currentUser.nom : 'Florencio') : null),
            dateEcheance: dateEcheance || null,
            heureEcheance: dateEcheance ? (heureEcheance || null) : null,
            rappelMinutes: Number(rappelMinutes),
            alerteSonore,
            sousTaches,
            photos: Array.isArray(photos) ? photos : []
        };

        try {
            await onSaveTodo(payload);
            setIsModalOpen(false);
            if (payload.priorite === 'urgente') {
                SoundEngine.playUrgentAlert();
            } else {
                SoundEngine.playCheck();
            }
        } catch(err) {
            console.error(err);
        }
    };

    // Toggle direct complete / status cycle
    const handleToggleDone = async (todo) => {
        const isCurrentlyDone = todo.statut === 'terminee';
        const nextStatut = isCurrentlyDone ? 'a_faire' : 'terminee';
        const author = currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Florencio') : 'Florencio';
        if (!isCurrentlyDone) {
            SoundEngine.playSuccess();
            if (showToast) showToast(`🎉 Tâche "${todo.titre}" réalisée par ${author} !`);
            SystemNotifications.notify('Tâche Réalisée ! ✅', `"${todo.titre}" a été complétée par ${author}.`);
        } else {
            SoundEngine.playCheck();
            if (showToast) showToast(`Tâche "${todo.titre}" remise à faire`);
        }
        await onSaveTodo({
            ...todo,
            statut: nextStatut,
            terminePar: !isCurrentlyDone ? author : null,
            dateTerminee: !isCurrentlyDone ? new Date().toISOString() : null,
            modifiePar: author
        });
    };

    // Toggle Subtask
    const handleToggleSubtask = async (todo, subIndex) => {
        SoundEngine.playCheck();
        const updatedSubs = (todo.sousTaches || []).map((s, idx) => {
            if (idx === subIndex) return { ...s, fait: !s.fait };
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
        setSousTaches([...sousTaches, { id: Date.now(), texte: newSubtaskText.trim(), fait: false }]);
        setNewSubtaskText('');
    };

    const handleRemoveSubtaskInModal = (index) => {
        setSousTaches(sousTaches.filter((_, i) => i !== index));
    };

    // Bulk selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredTodos.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkMarkDone = async () => {
        if (selectedIds.length === 0) return;
        SoundEngine.playSuccess();
        await onBulkUpdateTodos(selectedIds, { statut: 'terminee' });
        setSelectedIds([]);
        if (showToast) showToast(`${selectedIds.length} tâche(s) marquée(s) comme terminée(s)`);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const authorTodos = todos.filter(t => selectedIds.includes(t.id) && TodoUtils.isAuthor(t, currentUser));
        if (authorTodos.length === 0) {
            if (showToast) showToast("Action refusée : Vous ne pouvez supprimer que les tâches dont vous êtes l'auteur.", "error");
            return;
        }
        const nonAuthorCount = selectedIds.length - authorTodos.length;
        const confirmMsg = nonAuthorCount > 0
            ? `Seules les ${authorTodos.length} tâche(s) dont vous êtes l'auteur seront supprimées (${nonAuthorCount} tâche(s) ignorée(s) car réservées à leur créateur). Continuer ?`
            : `Supprimer définitivement ${authorTodos.length} tâche(s) ?`;
        if (!confirm(confirmMsg)) return;
        await onBulkDeleteTodos(authorTodos.map(t => t.id));
        setSelectedIds([]);
        if (showToast) showToast(`${authorTodos.length} tâche(s) supprimée(s)`);
    };


    const renderTableHeader = (list = []) => {
        const isAllSelected = list.length > 0 && list.every(t => selectedIds.includes(t.id));
        const handleToggleSelectAllInList = () => {
            if (isAllSelected) {
                const listIds = list.map(t => t.id);
                setSelectedIds(prev => prev.filter(id => !listIds.includes(id)));
            } else {
                const listIds = list.map(t => t.id);
                setSelectedIds(prev => Array.from(new Set([...prev, ...listIds])));
            }
        };

        return (
            <thead>
                <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleToggleSelectAllInList}
                            style={{ cursor: 'pointer' }}
                            title="Sélectionner toutes les tâches de cette section"
                        />
                    </th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Statut</th>
                    <th>Tâche & Détails</th>
                    <th style={{ width: '130px' }}>Priorité</th>
                    <th style={{ width: '140px' }}>Compte / Agent</th>
                    <th style={{ width: '170px' }}>Échéance & Alerte</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
        );
    };

    const renderTodoRow = (todo) => {
        const isDone = todo.statut === 'terminee';
        const info = TodoUtils.getStatusInfo(todo);
        const isSelected = selectedIds.includes(todo.id);
        const subtasks = Array.isArray(todo.sousTaches) ? todo.sousTaches : [];
        const subtasksDone = subtasks.filter(s => s.fait).length;
        const subtasksPercent = subtasks.length > 0 ? Math.round((subtasksDone / subtasks.length) * 100) : 0;

        return (
            <tr
                key={todo.id}
                className={`todo-row ${isDone ? 'done' : ''} ${info.isOverdue ? 'overdue' : ''} ${todo.priorite === 'urgente' && !isDone ? 'urgent-glow' : ''}`}
                style={{ backgroundColor: isSelected ? 'rgba(9, 177, 186, 0.06)' : undefined }}
            >
                {/* Selection Checkbox */}
                <td style={{ textAlign: 'center' }}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(todo.id)}
                        style={{ cursor: 'pointer' }}
                    />
                </td>

                {/* Done Checkbox */}
                <td style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => handleToggleDone(todo)}
                        title={isDone ? 'Rétablir comme non terminée' : 'Marquer comme terminée'}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '19px',
                            color: isDone ? '#10b981' : '#94a3b8',
                            transition: 'color 0.15s ease, transform 0.15s ease'
                        }}
                    >
                        <i className={`fa-regular ${isDone ? 'fa-circle-check fa-solid' : 'fa-circle'}`}></i>
                    </button>
                </td>

                {/* Task Details & Subtasks */}
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontWeight: 700,
                            fontSize: '14px',
                            color: isDone ? '#64748b' : 'var(--text-main)',
                            textDecoration: isDone ? 'line-through' : 'none'
                        }}>
                            {todo.titre}
                        </span>
                        {todo.categorie && (
                            <span className="badge badge-secondary" style={{ fontSize: '11px', padding: '1px 6px' }}>
                                {todo.categorie}
                            </span>
                        )}
                        {(todo.creePar || todo.dateCreation) && (
                            <span style={{
                                fontSize: '11px',
                                backgroundColor: '#eef2ff',
                                color: '#4338ca',
                                padding: '2px 9px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                border: '1px solid #c7d2fe',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }} title={`Tâche ajoutée par ${todo.creePar || 'Florencio'}${todo.dateCreation ? ` le ${TodoUtils.formatDateTime(todo.dateCreation)}` : ''}`}>
                                <i className="fa-solid fa-user-pen" style={{ fontSize: '10px' }}></i>
                                <span>Ajouté par : <strong>{todo.creePar || 'Florencio'}</strong></span>
                                {todo.dateCreation && (
                                    <span style={{ color: '#6366f1', fontWeight: 500, marginLeft: '2px' }}>
                                        le {TodoUtils.formatDateTime(todo.dateCreation)}
                                    </span>
                                )}
                            </span>
                        )}
                        {isDone && (
                            <span style={{
                                fontSize: '11px',
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                padding: '2px 9px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                border: '1px solid #a7f3d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }} title={`Tâche terminée${todo.terminePar ? ` par ${todo.terminePar}` : ''}${todo.dateTerminee ? ` le ${TodoUtils.formatDateTime(todo.dateTerminee)}` : ''}`}>
                                <i className="fa-solid fa-check" style={{ fontSize: '10px' }}></i>
                                <span>Réalisée{todo.terminePar ? ` par ${todo.terminePar}` : ''}</span>
                                {todo.dateTerminee && (
                                    <span style={{ color: '#047857', fontWeight: 500, marginLeft: '2px' }}>
                                        le {TodoUtils.formatDateTime(todo.dateTerminee)}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    {todo.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', whiteSpace: 'pre-line' }}>
                            {todo.description}
                        </div>
                    )}

                    {/* Checklist Subtasks */}
                    {subtasks.length > 0 && (
                        <div style={{ marginTop: '8px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                                <span>
                                    <i className="fa-solid fa-list-check" style={{ marginRight: '5px' }}></i>
                                    Sous-tâches : {subtasksDone}/{subtasks.length} ({subtasksPercent}%)
                                </span>
                            </div>
                            <div className="subtask-progress-bar" style={{ marginBottom: '8px' }}>
                                <div className="subtask-progress-fill" style={{ width: `${subtasksPercent}%` }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {subtasks.map((st, sIdx) => (
                                    <label
                                        key={st.id || sIdx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '11.5px',
                                            color: st.fait ? '#94a3b8' : '#334155',
                                            textDecoration: st.fait ? 'line-through' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={Boolean(st.fait)}
                                            onChange={() => handleToggleSubtask(todo, sIdx)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span>{st.texte}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photos & Pièces Jointes attachées */}
                    {Array.isArray(todo.photos) && todo.photos.length > 0 && (
                        <div className="todo-photos-strip">
                            {todo.photos.slice(0, 4).map((p, pIdx) => (
                                <div
                                    key={p.id || pIdx}
                                    className="todo-photo-thumb-wrapper"
                                    onClick={() => handleOpenLightbox(todo, pIdx)}
                                    title={`${p.nom || 'Photo'} - Cliquez pour voir et télécharger`}
                                >
                                    <img src={p.url} alt={p.nom || 'Photo'} className="todo-photo-thumb" />
                                    <div className="todo-photo-thumb-overlay">
                                        <i className="fa-solid fa-eye"></i>
                                    </div>
                                </div>
                            ))}
                            {todo.photos.length > 4 && (
                                <div
                                    className="todo-photo-thumb-wrapper"
                                    onClick={() => handleOpenLightbox(todo, 4)}
                                    title={`+${todo.photos.length - 4} autre(s) photo(s)`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#e2e8f0',
                                        color: '#334155',
                                        fontWeight: 700,
                                        fontSize: '11px'
                                    }}
                                >
                                    +{todo.photos.length - 4}
                                </div>
                            )}
                            <span
                                className="todo-photos-badge"
                                onClick={() => handleOpenLightbox(todo, 0)}
                                title="Voir les photos en grand écran et les télécharger"
                            >
                                <i className="fa-solid fa-camera"></i>
                                <span>{todo.photos.length} photo{todo.photos.length > 1 ? 's' : ''}</span>
                                <i className="fa-solid fa-download" style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.8 }}></i>
                            </span>
                        </div>
                    )}
                </td>

                {/* Priority */}
                <td>
                    <span className={`badge-priority badge-priority-${todo.priorite || 'moyenne'}`}>
                        {todo.priorite === 'urgente' && (
                            <span className="urgent-ping" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', marginRight: '5px' }} />
                        )}
                        {todo.priorite === 'urgente' ? '🚨 URGENTE' : (todo.priorite || 'Moyenne').toUpperCase()}
                    </span>
                </td>

                {/* Compte & Agent */}
                <td>
                    {todo.compteNom ? (
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '2px' }}>
                            <i className="fa-solid fa-store" style={{ marginRight: '4px', fontSize: '11px' }}></i>
                            @{todo.compteNom}
                        </div>
                    ) : (
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>-</div>
                    )}
                    {todo.agentAssigne && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-user" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                            {todo.agentAssigne}
                        </div>
                    )}
                </td>

                {/* Échéance & Countdown */}
                <td>
                    {todo.dateEcheance ? (
                        <>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: info.isOverdue ? 700 : (info.isImminent ? 600 : 500),
                                color: info.isOverdue ? '#dc2626' : (info.isImminent ? '#ea580c' : '#334155'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <i className={`fa-solid ${info.isOverdue ? 'fa-triangle-exclamation' : 'fa-calendar-day'}`}></i>
                                <span>{info.label}</span>
                            </div>
                            {todo.heureEcheance && (
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                    Heure : {todo.heureEcheance}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '11px' }}></i>
                            <span>Non définie</span>
                        </div>
                    )}
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {!isDone && todo.dateEcheance && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-xs"
                                onClick={() => handleQuickSnooze(todo, 1)}
                                title="Reporter de 1 heure"
                            >
                                +1h
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleOpenEdit(todo)}
                            title="Modifier la tâche"
                        >
                            <i className="fa-solid fa-pen"></i>
                        </button>
                        {TodoUtils.isAuthor(todo, currentUser) ? (
                            <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => {
                                    if (confirm(`Supprimer la tâche "${todo.titre}" ?`)) {
                                        onDeleteTodo(todo.id);
                                    }
                                }}
                                title="Supprimer la tâche (auteur)"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-secondary btn-xs"
                                disabled
                                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                                title={`Suppression réservée à l'auteur (${todo.creePar || 'le créateur'})`}
                            >
                                <i className="fa-solid fa-lock" style={{ fontSize: '10px' }}></i>
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="todo-view-container">
            {/* View Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-list-check" style={{ color: 'var(--primary-color)' }}></i>
                        To-Do List & Rappels Intelligents
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Suivi en temps réel des actions, alertes sonores instantanées et synchronisation d'équipe.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                            SoundEngine.playUrgentAlert();
                            if (showToast) showToast('🔊 Test alerte sonore effectué');
                        }}
                        title="Tester le son du synthétiseur Web Audio"
                    >
                        <i className="fa-solid fa-volume-high"></i> Tester Alerte
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleOpenAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                    >
                        <i className="fa-solid fa-plus"></i> Nouvelle Tâche
                    </button>
                </div>
            </div>

            {/* Suivi Visuel & Graphe Circulaire */}
            <div className="todo-tracking-card">
                {/* Donut Chart Gauge */}
                <div className="todo-donut-container">
                    <div className="todo-donut-svg-wrapper">
                        <svg viewBox="0 0 120 120" className="todo-donut-svg">
                            <defs>
                                <linearGradient id="todoCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#09b1ba" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                            <circle className="todo-donut-track" cx="60" cy="60" r="46" />
                            <circle
                                className="todo-donut-progress"
                                cx="60"
                                cy="60"
                                r="46"
                                stroke="url(#todoCircleGrad)"
                                strokeDasharray={289.03}
                                strokeDashoffset={289.03 - (289.03 * (stats.percentDone || 0)) / 100}
                            />
                        </svg>
                        <div className="todo-donut-text">
                            <span className="todo-donut-percent">{stats.percentDone}%</span>
                            <span className="todo-donut-sub">Accompli</span>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-chart-pie" style={{ color: '#09b1ba' }}></i>
                            Progression Globale
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                            <strong>{stats.terminees}</strong> sur <strong>{stats.total}</strong> tâche{stats.total > 1 ? 's' : ''} réalisée{stats.terminees > 1 ? 's' : ''}
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: stats.percentDone === 100 ? '#15803d' : (stats.percentDone >= 50 ? '#0284c7' : '#ea580c'),
                            backgroundColor: stats.percentDone === 100 ? '#f0fdf4' : (stats.percentDone >= 50 ? '#f0f9ff' : '#fffbeb'),
                            padding: '3px 10px',
                            borderRadius: '12px',
                            border: `1px solid ${stats.percentDone === 100 ? '#bbf7d0' : (stats.percentDone >= 50 ? '#bae6fd' : '#fde68a')}`
                        }}>
                            <i className={`fa-solid ${stats.percentDone === 100 ? 'fa-circle-check' : (stats.percentDone >= 50 ? 'fa-bolt' : 'fa-clock')}`}></i>
                            <span>{stats.percentDone === 100 ? 'Toutes tâches terminées !' : (stats.percentDone >= 50 ? 'Rythme optimal' : 'Actions en attente')}</span>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="todo-kpis-grid">
                    {/* Urgentes */}
                    <div
                        className="todo-kpi-item urgent"
                        onClick={() => setPriorityFilter(priorityFilter === 'urgente' ? 'all' : 'urgente')}
                        style={{ cursor: 'pointer' }}
                        title="Filtrer les tâches urgentes"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9f1239' }}>🚨 Urgentes</span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.urgentes > 0 ? '#e11d48' : '#cbd5e1' }} />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#e11d48', margin: '4px 0 2px 0' }}>
                            {stats.urgentes}
                        </div>
                        <div style={{ fontSize: '11px', color: '#be123c', fontWeight: 600 }}>
                            {stats.urgentes > 0 ? 'Priorité immédiate' : 'Aucune urgence'}
                        </div>
                    </div>

                    {/* En Retard */}
                    <div
                        className="todo-kpi-item late"
                        onClick={() => setSortBy('echeance_asc')}
                        style={{ cursor: 'pointer' }}
                        title="Trier par échéance la plus proche"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>⚠️ En Retard</span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stats.enRetard > 0 ? '#d97706' : '#cbd5e1' }} />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', margin: '4px 0 2px 0' }}>
                            {stats.enRetard}
                        </div>
                        <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                            {stats.enRetard > 0 ? 'Échéances passées' : 'Toutes à jour'}
                        </div>
                    </div>

                    {/* En Cours */}
                    <div
                        className="todo-kpi-item progress"
                        onClick={() => setStatusFilter(statusFilter === 'en_cours' ? 'all' : 'en_cours')}
                        style={{ cursor: 'pointer' }}
                        title="Filtrer les tâches en cours"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#075985' }}>⏳ En Cours</span>
                            <i className="fa-solid fa-spinner" style={{ fontSize: '11px', color: '#0284c7' }}></i>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', margin: '4px 0 2px 0' }}>
                            {stats.enCours}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600 }}>
                            En traitement actif
                        </div>
                    </div>

                    {/* Terminées */}
                    <div
                        className="todo-kpi-item done"
                        onClick={() => setActiveTab('done')}
                        style={{ cursor: 'pointer' }}
                        title="Afficher les tâches terminées"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>✅ Terminées</span>
                            <i className="fa-solid fa-circle-check" style={{ fontSize: '12px', color: '#16a34a' }}></i>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', margin: '4px 0 2px 0' }}>
                            {stats.terminees}
                        </div>
                        <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                            {stats.percentDone}% accomplies
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="table-card" style={{ padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    {/* Search */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Recherche
                        </label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Rechercher par titre, description, compte, agent..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                    </div>

                    {/* Statut */}
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Statut
                        </label>
                        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tous les statuts</option>
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminées</option>
                        </select>
                    </div>

                    {/* Priorité */}
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Priorité
                        </label>
                        <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="all">Toutes priorités</option>
                            <option value="urgente">🚨 Urgente</option>
                            <option value="haute">Haute</option>
                            <option value="moyenne">Moyenne</option>
                            <option value="basse">Basse</option>
                        </select>
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Catégorie
                        </label>
                        <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">Toutes catégories</option>
                            {predefinedCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Compte Vinted */}
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Compte Vinted
                        </label>
                        <select className="form-control" value={compteFilter} onChange={(e) => setCompteFilter(e.target.value)}>
                            <option value="all">Tous les comptes</option>
                            {comptes.map(c => (
                                <option key={c.id} value={c.id}>@{c.nomCompte || c.nom || c.pseudo}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tri */}
                    <div>
                        <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Trier par
                        </label>
                        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="echeance_asc">Échéance (Plus proche)</option>
                            <option value="echeance_desc">Échéance (Plus lointaine)</option>
                            <option value="priorite_desc">Priorité (Haute en premier)</option>
                            <option value="date_desc">Date de création (Récent)</option>
                            <option value="titre_asc">Titre (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions Banner */}
                {selectedIds.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '8px',
                        marginTop: '10px'
                    }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary-color)' }}>
                            <i className="fa-solid fa-check-double" style={{ marginRight: '6px' }}></i>
                            {selectedIds.length} tâche(s) sélectionnée(s)
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-success btn-sm" onClick={handleBulkMarkDone}>
                                <i className="fa-solid fa-check"></i> Marquer Terminées
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                                <i className="fa-solid fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Tabs : Mes Tâches, Tâches Globales, Vue Complète, Terminées */}
            <div className="todo-tab-pills">
                <button
                    type="button"
                    className={`todo-tab-pill ${activeTab === 'mine' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    <i className="fa-solid fa-user-check"></i>
                    <span>Mes Tâches</span>
                    <span className="todo-tab-badge">{myPendingTodos.length}</span>
                </button>
                <button
                    type="button"
                    className={`todo-tab-pill ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    <i className="fa-solid fa-users"></i>
                    <span>Tâches Globales</span>
                    <span className="todo-tab-badge">{globalPendingTodos.length}</span>
                </button>
                <button
                    type="button"
                    className={`todo-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <i className="fa-solid fa-table-cells-large"></i>
                    <span>Vue Séparée (Toutes)</span>
                    <span className="todo-tab-badge">{pendingTodos.length}</span>
                </button>
                <button
                    type="button"
                    className={`todo-tab-pill ${activeTab === 'done' ? 'active' : ''}`}
                    onClick={() => setActiveTab('done')}
                >
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Terminées & Réalisées</span>
                    <span className="todo-tab-badge">{doneTodos.length}</span>
                </button>
            </div>

            {/* SECTION 1 : MES TÂCHES PERSONNELLES & ASSIGNÉES */}
            {(activeTab === 'all' || activeTab === 'mine') && (
                <div className="todo-section-container" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div className="todo-section-header">
                        <div className="todo-section-title-wrap">
                            <h3 className="todo-section-title">
                                <i className="fa-solid fa-user-check" style={{ color: '#6366f1' }}></i>
                                Mes Tâches Personnelles & Assignées
                            </h3>
                            <span className={`todo-section-count ${myPendingTodos.some(t => t.priorite === 'urgente') ? 'urgent' : ''}`}>
                                {myPendingTodos.length} tâche{myPendingTodos.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            <i className="fa-regular fa-circle-check" style={{ marginRight: '5px', color: '#10b981' }}></i>
                            Tâches assignées à votre profil ou créées par vous
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            {renderTableHeader(myPendingTodos)}
                            <tbody>
                                {myPendingTodos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                                            <i className="fa-solid fa-user-check" style={{ fontSize: '32px', color: '#6366f1', marginBottom: '8px', display: 'block' }}></i>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Aucune tâche personnelle en cours</div>
                                            <div style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>Vous êtes à jour sur vos tâches assignées !</div>
                                        </td>
                                    </tr>
                                ) : (
                                    myPendingTodos.map(renderTodoRow)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION 2 : TÂCHES GLOBALES D'ÉQUIPE (TOUS) */}
            {(activeTab === 'all' || activeTab === 'global') && (
                <div className="todo-section-container" style={{ borderLeft: '4px solid #09b1ba' }}>
                    <div className="todo-section-header">
                        <div className="todo-section-title-wrap">
                            <h3 className="todo-section-title">
                                <i className="fa-solid fa-users" style={{ color: '#09b1ba' }}></i>
                                Tâches Globales d'Équipe (Tous)
                            </h3>
                            <span className={`todo-section-count ${globalPendingTodos.some(t => t.priorite === 'urgente') ? 'urgent' : ''}`}>
                                {globalPendingTodos.length} tâche{globalPendingTodos.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            <i className="fa-solid fa-bullhorn" style={{ marginRight: '5px', color: '#09b1ba' }}></i>
                            Tâches collectives partagées par l'ensemble des agents
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            {renderTableHeader(globalPendingTodos)}
                            <tbody>
                                {globalPendingTodos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                                            <i className="fa-solid fa-users" style={{ fontSize: '32px', color: '#09b1ba', marginBottom: '8px', display: 'block' }}></i>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Aucune tâche globale d'équipe en attente</div>
                                            <div style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>Toutes les actions d'équipe ont été complétées.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    globalPendingTodos.map(renderTodoRow)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION 3 : TÂCHES DES AUTRES COLLABORATEURS (VISIBLES EN VUE SÉPARÉE GLOBALE) */}
            {activeTab === 'all' && otherPendingTodos.length > 0 && (
                <div className="todo-section-container" style={{ borderLeft: '4px solid #8b5cf6', opacity: 0.95 }}>
                    <div className="todo-section-header">
                        <div className="todo-section-title-wrap">
                            <h3 className="todo-section-title">
                                <i className="fa-solid fa-user-group" style={{ color: '#8b5cf6' }}></i>
                                Tâches des Autres Collaborateurs
                            </h3>
                            <span className="todo-section-count" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                                {otherPendingTodos.length} tâche{otherPendingTodos.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            <i className="fa-regular fa-eye" style={{ marginRight: '5px', color: '#8b5cf6' }}></i>
                            Tâches spécifiques attribuées à d'autres agents de l'équipe
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            {renderTableHeader(otherPendingTodos)}
                            <tbody>
                                {otherPendingTodos.map(renderTodoRow)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECTION 4 : TÂCHES TERMINÉES & RÉALISÉES */}
            {(activeTab === 'all' || activeTab === 'done') && (
                <div className="todo-section-container" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="todo-section-header">
                        <div className="todo-section-title-wrap">
                            <h3 className="todo-section-title">
                                <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
                                Tâches Terminées & Réalisées
                            </h3>
                            <span className="todo-section-count done">
                                {doneTodos.length} terminée{doneTodos.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => setIsDoneSectionCollapsed(!isDoneSectionCollapsed)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', padding: '4px 10px' }}
                        >
                            <i className={`fa-solid ${isDoneSectionCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                            <span>{isDoneSectionCollapsed ? 'Afficher les terminées' : 'Masquer cette section'}</span>
                        </button>
                    </div>

                    {!isDoneSectionCollapsed && (
                        <div className="table-responsive">
                            <table className="data-table">
                                {renderTableHeader(doneTodos)}
                                <tbody>
                                    {doneTodos.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                                                <i className="fa-solid fa-clipboard-check" style={{ fontSize: '34px', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}></i>
                                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>Aucune tâche terminée pour le moment</div>
                                                <div style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>Les tâches terminées apparaîtront ici avec la date et le nom de l'agent.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        doneTodos.map(renderTodoRow)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL AJOUT / ÉDITION */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-container" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-list-check" style={{ color: 'var(--primary-color)' }}></i>
                                {editingTodo ? 'Modifier la Tâche' : 'Créer une Nouvelle Tâche To-Do'}
                            </h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ padding: '20px' }}>
                                {/* Titre */}
                                <div className="form-group" style={{ marginBottom: '14px' }}>
                                    <label style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                                        Titre de la Tâche <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="ex: Expédier commande #4920 Mondial Relay"
                                        value={titre}
                                        onChange={(e) => setTitre(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Photos & Pièces Jointes */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                            <i className="fa-solid fa-camera" style={{ color: 'var(--primary-color)' }}></i>
                                            Photos & Pièces Jointes ({photos.length})
                                        </label>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                                            Captures, bordereaux, preuves...
                                        </span>
                                    </div>

                                    {/* Dropzone / Upload area */}
                                    <label
                                        className="todo-photo-dropzone"
                                        style={{ display: 'block', margin: 0 }}
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('dragover');
                                            if (e.dataTransfer && e.dataTransfer.files) {
                                                handleFilesSelected(e.dataTransfer.files);
                                            }
                                        }}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                handleFilesSelected(e.target.files);
                                                e.target.value = '';
                                            }}
                                            disabled={isUploadingPhoto}
                                        />
                                        {isUploadingPhoto ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#09b1ba', fontSize: '12px', padding: '10px 0' }}>
                                                <CircularIconLoader size={26} pulse={false} showOuterRing={false} />
                                                <span>Traitement et optimisation des images...</span>
                                            </div>
                                        ) : (
                                            <div style={{ cursor: 'pointer' }}>
                                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '24px', color: '#09b1ba', marginBottom: '6px', display: 'block' }}></i>
                                                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                                                    Cliquez ou glissez-déposez des photos ici
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                    JPG, PNG, WEBP • Plusieurs photos autorisées
                                                </div>
                                            </div>
                                        )}
                                    </label>

                                    {/* Grille des photos */}
                                    {photos.length > 0 && (
                                        <div className="todo-photo-grid">
                                            {photos.map((p, idx) => (
                                                <div key={p.id || idx} className="todo-photo-card">
                                                    <img
                                                        src={p.url}
                                                        alt={p.nom}
                                                        className="todo-photo-card-img"
                                                        onClick={() => setLightboxData({
                                                            isOpen: true,
                                                            photos: photos,
                                                            initialIndex: idx,
                                                            taskTitle: titre || 'Nouvelle tâche'
                                                        })}
                                                        title="Cliquer pour agrandir"
                                                    />
                                                    <div className="todo-photo-card-info">
                                                        <span className="todo-photo-card-name" title={p.nom}>
                                                            {p.nom}
                                                        </span>
                                                        <div className="todo-photo-card-actions">
                                                            <button
                                                                type="button"
                                                                className="todo-photo-card-btn"
                                                                style={{ color: '#09b1ba' }}
                                                                onClick={() => setLightboxData({
                                                                    isOpen: true,
                                                                    photos: photos,
                                                                    initialIndex: idx,
                                                                    taskTitle: titre || 'Nouvelle tâche'
                                                                })}
                                                                title="Visualiser"
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="todo-photo-card-btn"
                                                                style={{ color: '#10b981' }}
                                                                onClick={() => TodoUtils.downloadImage(p)}
                                                                title="Télécharger"
                                                            >
                                                                <i className="fa-solid fa-download"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="todo-photo-card-btn"
                                                                style={{ color: '#ef4444' }}
                                                                onClick={() => handleRemovePhoto(idx)}
                                                                title="Supprimer la photo"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Priorité, Statut & Catégorie */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Priorité
                                        </label>
                                        <select className="form-control" value={priorite} onChange={(e) => setPriorite(e.target.value)}>
                                            <option value="urgente">🚨 Urgente (Alerte Sonore)</option>
                                            <option value="haute">Haute</option>
                                            <option value="moyenne">Moyenne</option>
                                            <option value="basse">Basse</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Statut
                                        </label>
                                        <select className="form-control" value={statut} onChange={(e) => setStatut(e.target.value)}>
                                            <option value="a_faire">À faire</option>
                                            <option value="en_cours">En cours</option>
                                            <option value="terminee">Terminée</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Catégorie
                                        </label>
                                        <select className="form-control" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                                            {predefinedCategories.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Compte Vinted, Agent & Auteur */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Compte Vinted Associé
                                        </label>
                                        <select className="form-control" value={compteId} onChange={(e) => setCompteId(e.target.value)}>
                                            <option value="">Aucun compte associé</option>
                                            {comptes.map(c => (
                                                <option key={c.id} value={c.id}>@{c.nomCompte || c.nom || c.pseudo}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Agent Assigné
                                        </label>
                                        <select className="form-control" value={agentAssigne} onChange={(e) => setAgentAssigne(e.target.value)}>
                                            <option value="">Non assigné</option>
                                            {utilisateurs.map(u => (
                                                <option key={u.id} value={u.agentAssigne || u.nom}>{u.nom} ({u.agentAssigne || u.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                            Ajouté par (Auteur)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={creePar}
                                            onChange={(e) => setCreePar(e.target.value)}
                                            placeholder="Nom de l'auteur..."
                                        />
                                        {editingTodo && editingTodo.dateCreation && (
                                            <span style={{ fontSize: '10.5px', color: '#6366f1', marginTop: '3px', display: 'block' }}>
                                                📅 Ajouté le {TodoUtils.formatDateTime(editingTodo.dateCreation)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Échéance, Heure & Rappel */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '12px', marginBottom: '14px' }}>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontWeight: 600, fontSize: '12px', margin: 0 }}>
                                                Date d'échéance
                                            </label>
                                            {dateEcheance ? (
                                                <button
                                                    type="button"
                                                    onClick={() => { setDateEcheance(''); setHeureEcheance(''); }}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                    title="Retirer l'échéance"
                                                >
                                                    <i className="fa-solid fa-xmark" style={{ marginRight: '3px' }}></i>Effacer
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Non définie</span>
                                            )}
                                        </div>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateEcheance}
                                            onChange={(e) => setDateEcheance(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block', color: dateEcheance ? undefined : '#94a3b8' }}>
                                            Heure
                                        </label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={heureEcheance}
                                            onChange={(e) => setHeureEcheance(e.target.value)}
                                            disabled={!dateEcheance}
                                            style={{ opacity: dateEcheance ? 1 : 0.6 }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block', color: dateEcheance ? undefined : '#94a3b8' }}>
                                            Alerte & Rappel
                                        </label>
                                        <select
                                            className="form-control"
                                            value={rappelMinutes}
                                            onChange={(e) => setRappelMinutes(e.target.value)}
                                            disabled={!dateEcheance}
                                            style={{ opacity: dateEcheance ? 1 : 0.6 }}
                                        >
                                            <option value="0">À l'heure exacte</option>
                                            <option value="15">15 minutes avant</option>
                                            <option value="30">30 minutes avant</option>
                                            <option value="60">1 heure avant</option>
                                            <option value="120">2 heures avant</option>
                                            <option value="1440">1 jour avant</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Alerte sonore checkbox */}
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#1e293b', margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={alerteSonore}
                                            onChange={(e) => setAlerteSonore(e.target.checked)}
                                            style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }}
                                        />
                                        <span>🔔 Activer la sonnerie d'alerte lors du rappel ou en cas de retard</span>
                                    </label>
                                </div>

                                {/* Description */}
                                <div className="form-group" style={{ marginBottom: '14px' }}>
                                    <label style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                                        Description & Notes
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Informations supplémentaires, consignes..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                {/* Checklist / Sous-tâches */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <i className="fa-solid fa-list-check" style={{ color: 'var(--primary-color)' }}></i>
                                        Checklist / Sous-tâches
                                    </label>

                                    {/* Subtasks list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                        {sousTaches.map((st, idx) => (
                                            <div key={st.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                                <span style={{ fontSize: '12px', color: '#334155' }}>
                                                    {idx + 1}. {st.texte}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubtaskInModal(idx)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '12px' }}
                                                    title="Supprimer la sous-tâche"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add subtask row */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="+ Ajouter une étape (ex: Imprimer bordereau)..."
                                            value={newSubtaskText}
                                            onChange={(e) => setNewSubtaskText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSubtaskInModal();
                                                }
                                            }}
                                            style={{ fontSize: '12px' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleAddSubtaskInModal}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            + Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ fontWeight: 600 }}>
                                    <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i>
                                    {editingTodo ? 'Mettre à jour' : 'Enregistrer la tâche'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Lightbox pour visualiser et télécharger les photos */}
            {lightboxData && lightboxData.isOpen && (
                <TodoPhotoLightboxModal
                    isOpen={lightboxData.isOpen}
                    onClose={() => setLightboxData(null)}
                    photos={lightboxData.photos}
                    initialIndex={lightboxData.initialIndex}
                    taskTitle={lightboxData.taskTitle}
                />
            )}
        </div>
    );
}


// ============================================================
// POPUP NOTIFICATION TÂCHES NON RÉALISÉES (OUVERTURE APP)
// ============================================================
function StartupTodoModal({ isOpen, onClose, todos = [], currentUser = null, onNavigateToTodos, onSaveTodo, showToast }) {
    if (!isOpen) return null;

    // Ne notifier que pour les tâches qui concernent l'agent connecté
    const pendingTodos = (todos || []).filter(t => t && t.statut !== 'terminee' && TodoUtils.isTaskForUser(t, currentUser));
    if (pendingTodos.length === 0) return null;

    const urgentesCount = pendingTodos.filter(t => t.priorite === 'urgente').length;
    const enRetardCount = pendingTodos.filter(t => TodoUtils.getStatusInfo(t).isOverdue).length;

    // Trier les tâches : En retard d'abord, puis urgentes, puis échéance proche
    const sortedPending = [...pendingTodos].sort((a, b) => {
        const infoA = TodoUtils.getStatusInfo(a);
        const infoB = TodoUtils.getStatusInfo(b);
        if (infoA.isOverdue && !infoB.isOverdue) return -1;
        if (!infoA.isOverdue && infoB.isOverdue) return 1;
        if (a.priorite === 'urgente' && b.priorite !== 'urgente') return -1;
        if (a.priorite !== 'urgente' && b.priorite === 'urgente') return 1;
        const da = TodoUtils.parseDeadline(a) || new Date('2099-12-31');
        const db = TodoUtils.parseDeadline(b) || new Date('2099-12-31');
        return da - db;
    });

    const displayTodos = sortedPending.slice(0, 5);
    const extraCount = sortedPending.length - displayTodos.length;

    const handleQuickDone = async (todo, e) => {
        e.stopPropagation();
        if (onSaveTodo) {
            SoundEngine.playSuccess();
            await onSaveTodo({
                ...todo,
                statut: 'terminee',
                dateTerminee: new Date().toISOString(),
                terminePar: currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Florencio') : 'Florencio'
            });
            if (showToast) showToast(`✅ Tâche "${todo.titre}" marquée comme terminée !`);
        }
    };

    const handleGoToTodos = () => {
        onClose();
        if (onNavigateToTodos) {
            onNavigateToTodos();
        }
    };

    return (
        <div 
            className="modal-backdrop"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
            onClick={onClose}
        >
            <div 
                className="modal-content"
                style={{
                    maxWidth: '580px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header moderne avec dégradé sombre et liseré turquoise */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '20px 24px',
                    color: '#ffffff',
                    position: 'relative',
                    borderBottom: '2px solid #09b1ba'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #09b1ba 0%, #0284c7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                flexShrink: 0,
                                boxShadow: '0 4px 14px rgba(9, 177, 186, 0.45)'
                            }}>
                                <i className="fa-solid fa-bell"></i>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                                    Rappel des Tâches en Attente
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                                    Bonjour {currentUser ? (currentUser.nom || 'Florencio') : 'Florencio'} ! Vous avez des actions à réaliser.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: '#ffffff',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '15px'
                            }}
                            title="Fermer"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Synthèse des alertes */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: 'rgba(9, 177, 186, 0.2)',
                            color: '#5eead4',
                            border: '1px solid rgba(9, 177, 186, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <i className="fa-solid fa-list-check"></i>
                            {pendingTodos.length} tâche{pendingTodos.length > 1 ? 's' : ''} non réalisée{pendingTodos.length > 1 ? 's' : ''}
                        </span>

                        {urgentesCount > 0 && (
                            <span style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: 'rgba(239, 68, 68, 0.25)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.45)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                🚨 {urgentesCount} urgente{urgentesCount > 1 ? 's' : ''}
                            </span>
                        )}

                        {enRetardCount > 0 && (
                            <span style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: 'rgba(245, 158, 11, 0.25)',
                                color: '#fde68a',
                                border: '1px solid rgba(245, 158, 11, 0.45)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                ⚠️ {enRetardCount} en retard
                            </span>
                        )}
                    </div>
                </div>

                {/* Corps avec liste des tâches */}
                <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                        Actions prioritaires à traiter :
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {displayTodos.map(todo => {
                            const info = TodoUtils.getStatusInfo(todo);
                            const subtasks = Array.isArray(todo.sousTaches) ? todo.sousTaches : [];
                            const subDone = subtasks.filter(s => s.fait).length;

                            return (
                                <div
                                    key={todo.id}
                                    style={{
                                        border: info.isOverdue ? '1px solid #fecdd3' : (todo.priorite === 'urgente' ? '1px solid #fed7aa' : '1px solid #e2e8f0'),
                                        backgroundColor: info.isOverdue ? '#fff1f2' : (todo.priorite === 'urgente' ? '#fffbeb' : '#f8fafc'),
                                        borderRadius: '12px',
                                        padding: '12px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                                                {todo.titre}
                                            </span>
                                            {todo.priorite === 'urgente' && (
                                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626' }}>
                                                    🚨 URGENTE
                                                </span>
                                            )}
                                            {todo.categorie && (
                                                <span style={{ fontSize: '10.5px', fontWeight: 600, padding: '1px 6px', borderRadius: '6px', background: '#e2e8f0', color: '#475569' }}>
                                                    {todo.categorie}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#64748b', flexWrap: 'wrap' }}>
                                            {todo.compteNom && (
                                                <span style={{ color: '#09b1ba', fontWeight: 600 }}>
                                                    <i className="fa-solid fa-store" style={{ marginRight: '3px' }}></i>
                                                    @{todo.compteNom}
                                                </span>
                                            )}
                                            <span style={{ color: info.isOverdue ? '#dc2626' : (info.isImminent ? '#ea580c' : '#475569'), fontWeight: info.isOverdue ? 700 : 500 }}>
                                                <i className={`fa-solid ${info.isOverdue ? 'fa-triangle-exclamation' : 'fa-clock'}`} style={{ marginRight: '4px' }}></i>
                                                {info.label}
                                            </span>
                                            {subtasks.length > 0 && (
                                                <span style={{ color: '#64748b' }}>
                                                    <i className="fa-solid fa-list-check" style={{ marginRight: '3px' }}></i>
                                                    {subDone}/{subtasks.length}
                                                </span>
                                            )}
                                            {Array.isArray(todo.photos) && todo.photos.length > 0 && (
                                                <span style={{ color: '#09b1ba', fontWeight: 600 }}>
                                                    <i className="fa-solid fa-camera" style={{ marginRight: '3px' }}></i>
                                                    {todo.photos.length} photo{todo.photos.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action rapide cocher comme terminée */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleQuickDone(todo, e)}
                                        className="btn btn-outline-success btn-xs"
                                        style={{
                                            border: '1px solid #a7f3d0',
                                            backgroundColor: '#f0fdf4',
                                            color: '#16a34a',
                                            borderRadius: '8px',
                                            padding: '6px 10px',
                                            fontSize: '11.5px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            flexShrink: 0
                                        }}
                                        title="Marquer directement comme terminée"
                                    >
                                        <i className="fa-solid fa-check"></i>
                                        <span>Fait</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {extraCount > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                            + {extraCount} autre{extraCount > 1 ? 's' : ''} tâche{extraCount > 1 ? 's' : ''} en attente dans votre To-Do List
                        </div>
                    )}
                </div>

                {/* Footer avec boutons d'action */}
                <div style={{
                    padding: '14px 24px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                        Plus tard
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleGoToTodos}
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #09b1ba 0%, #0d9488 100%)',
                            boxShadow: '0 2px 8px rgba(9, 177, 186, 0.35)'
                        }}
                    >
                        <span>Ouvrir la To-Do List</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
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
    TodoView,
    StartupTodoModal,
    TodoPhotoLightboxModal,
    Logo,
    CircularIconLoader,
    LoadingScreen,
    EmptyStateWithLogo
};
