// ============================================================
// MAIN REACT APP CONTROLLER - VINTED MANAGER
// ============================================================

const { useState, useEffect, useCallback } = React;
const {
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
} = window.ReactComponents;

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
    const [toast, setToast] = useState({ visible: false, message: '', isError: false });
    const [loginError, setLoginError] = useState('');

    const handleSwitchTZ = (tz) => {
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
        setToast({ visible: true, message, isError });
        setTimeout(() => {
            setToast({ visible: false, message: '', isError: false });
        }, 3500);
    }, []);

    const loadData = useCallback(async (orgId) => {
        if (!currentUser) return;
        const targetOrgId = (currentUser.role !== 'admin' && currentUser.organisationId) 
            ? currentUser.organisationId 
            : (orgId || currentOrgId);
        try {
            const data = await API.getFullDB(targetOrgId);
            setAppState(prev => ({ ...prev, ...data }));
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
            const targetOrgId = (currentUser.role !== 'admin' && currentUser.organisationId) ? currentUser.organisationId : currentOrgId;
            loadData(targetOrgId);
        }
    }, [currentUser, currentOrgId, loadData]);

    const handleLoginSubmit = async (loginInput, password, role = null) => {
        setLoginError('');
        try {
            const payload = role ? { role } : { email: loginInput, motDePasse: password };
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

    const handleSwitchOrg = (orgId) => {
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
                        repubHeure = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
                    } catch(e) { repubHeure = '12:30'; }

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
                } catch(repErr) {
                    showToast('Vente enregistrée (erreur création repub automatique)', true);
                }
            }

            await loadData();
        } catch (err) {
            showToast("Erreur de mise à jour de la ligne", true);
        }
    };


    const handleDeleteRow = async (id) => {
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

    const handleSaveCompte = async (compteData) => {
        try {
            if (compteData.id) {
                await API.updateCompte(compteData.id, compteData);
                showToast("Compte mis à jour");
            } else {
                await API.createCompte({ ...compteData, organisationId: currentOrgId });
                showToast("Compte créé avec succès");
            }
            await loadData();
        } catch (err) {
            showToast("Erreur lors de l'enregistrement du compte", true);
        }
    };

    const handleDeleteCompte = async (id) => {
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

    const handleSaveIncident = async (incidentData) => {
        try {
            await API.createIncident({ ...incidentData, organisationId: currentOrgId });
            showToast("Incident enregistré et statut du compte mis à jour");
            await loadData();
        } catch (err) {
            showToast("Erreur lors de l'enregistrement de l'incident", true);
        }
    };

    const handleSaveParametres = async (paramsData) => {
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

    const handleBulkDeleteCalendrier = async (ids) => {
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

    const handleBulkDeleteComptes = async (ids) => {
        try {
            await API.bulkDeleteComptes(ids);
            showToast(`${ids.length} compte(s) supprimé(s) en masse !`);
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression des comptes en masse", true);
        }
    };

    const handleBulkDeleteUsers = async (ids) => {
        try {
            await API.bulkDeleteUsers(ids);
            showToast(`${ids.length} utilisateur(s) supprimé(s) en masse !`);
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression des utilisateurs en masse", true);
        }
    };

    const handleBulkDeleteIncidents = async (ids) => {
        try {
            await API.bulkDeleteIncidents(ids);
            showToast(`${ids.length} incident(s) supprimé(s) en masse !`);
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression des incidents en masse", true);
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            const finalData = { ...userData };
            // Restriction Cadre : Cadres can ONLY create agent profiles for their own organisation
            if (currentUser && currentUser.role !== 'admin') {
                finalData.role = 'agent';
                finalData.organisationId = currentUser.organisationId || 'org_default';
            }
            if (finalData.id) {
                await API.updateUtilisateur(finalData.id, finalData);
                showToast("Profil utilisateur mis à jour");
            } else {
                await API.createUtilisateur({ ...finalData, organisationId: finalData.organisationId || currentOrgId });
                showToast("Profil agent créé avec succès");
            }
            await loadData();
        } catch (err) {
            showToast("Erreur lors de l'enregistrement utilisateur", true);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
        try {
            await API.deleteUtilisateur(id);
            showToast("Utilisateur supprimé");
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression utilisateur", true);
        }
    };

    const handleSaveOrg = async (orgData) => {
        try {
            if (orgData.isEdit) {
                await API.updateOrganisation(orgData.id, { nom: orgData.nom });
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

    const handleDeleteOrg = async (id) => {
        if (!confirm("Voulez-vous supprimer cette organisation ?")) return;
        try {
            await API.deleteOrganisation(id);
            showToast("Organisation supprimée");
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression de l'organisation", true);
        }
    };

    const handlePublishWinner = async (sku) => {
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

    const handleImportJSON = (e) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = async (event) => {
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

    const handleRestoreCorbeilleItem = async (id) => {
        try {
            await API.restoreCorbeilleItem(id);
            showToast("Élément restauré avec succès dans sa table d'origine !");
            await loadData();
        } catch (err) {
            showToast("Erreur de restauration : " + (err.message || "Impossible de restaurer l'élément"), true);
        }
    };

    const handleDeleteCorbeilleItem = async (id) => {
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
        return (
            <div className="app-container">
                <LoginView onLoginSubmit={handleLoginSubmit} loginError={loginError} />
                <Toast toast={toast} />
            </div>
        );
    }

    return (
        <div className="app-container">
            <button
                type="button"
                className="mobile-menu-btn btn btn-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                title="Menu principal">
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i> Menu
            </button>

            {mobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 99
                    }}
                />
            )}

            <Sidebar
                currentUser={currentUser}
                currentOrgId={currentOrgId}
                organisations={appState.organisations}
                activeView={activeView}
                onSelectView={(view) => {
                    setActiveView(view);
                    setMobileMenuOpen(false);
                }}
                onSwitchOrg={handleSwitchOrg}
                onLogout={handleLogout}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
                corbeilleCount={(appState.corbeille || []).length}
                isOpen={mobileMenuOpen}
            />

            <main className="main-content">
                <div className="top-header-actions" style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '20px',
                        padding: '3px 4px',
                        gap: '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <button
                            type="button"
                            onClick={() => handleSwitchTZ('FR')}
                            style={{
                                border: 'none',
                                borderRadius: '16px',
                                padding: '4px 10px',
                                fontSize: '11.5px',
                                fontWeight: timeZone === 'FR' ? 700 : 500,
                                backgroundColor: timeZone === 'FR' ? 'var(--primary-color)' : 'transparent',
                                color: timeZone === 'FR' ? '#fff' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title="Fuseau Horaire France (Europe/Paris - UTC+2 / UTC+1)"
                        >
                            🇫🇷 FR (UTC+2)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSwitchTZ('MADA')}
                            style={{
                                border: 'none',
                                borderRadius: '16px',
                                padding: '4px 10px',
                                fontSize: '11.5px',
                                fontWeight: timeZone === 'MADA' ? 700 : 500,
                                backgroundColor: timeZone === 'MADA' ? 'var(--primary-color)' : 'transparent',
                                color: timeZone === 'MADA' ? '#fff' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title="Fuseau Horaire Madagascar (Indian/Antananarivo - UTC+3)"
                        >
                            🇲🇬 MADA (UTC+3)
                        </button>
                    </div>

                    {currentUser && currentUser.role === 'admin' && (
                        <>
                            <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} title="Exporter la base de données en JSON">
                                <i className="fa-solid fa-download"></i> Exporter JSON
                            </button>
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }} title="Importer la base de données depuis un fichier JSON">
                                <i className="fa-solid fa-file-import"></i> Importer JSON
                                <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                            </label>
                        </>
                    )}
                </div>

                {activeView === 'dashboard' && (
                    <DashboardView
                        appState={appState}
                        currentUser={currentUser}
                        selectedTZ={timeZone}
                        onUpdateRow={handleUpdateRow}
                        onDeleteRow={handleDeleteRow}
                        onAddRowClick={handleAddRow}
                        onBulkUpdateCalendrier={handleBulkUpdateCalendrier}
                        onBulkDeleteCalendrier={handleBulkDeleteCalendrier}
                    />
                )}

                {activeView === 'comptes' && (
                    <ComptesView
                        currentUser={currentUser}
                        appState={appState}
                        onSaveCompte={handleSaveCompte}
                        onDeleteCompte={handleDeleteCompte}
                        onBulkUpdateComptes={handleBulkUpdateComptes}
                        onBulkDeleteComptes={handleBulkDeleteComptes}
                        onOpenQuickAgentModal={() => setActiveView('utilisateurs')}
                    />
                )}

                {activeView === 'planning' && (
                    <PlanningView
                        appState={appState}
                        onGeneratePlanning={handleGeneratePlanning}
                    />
                )}

                {activeView === 'incidents' && (
                    <IncidentsView
                        appState={appState}
                        onSaveIncident={handleSaveIncident}
                        onBulkDeleteIncidents={handleBulkDeleteIncidents}
                    />
                )}

                {activeView === 'parametres' && (
                    <ParametresView
                        appState={appState}
                        onSaveParametres={handleSaveParametres}
                    />
                )}

                {activeView === 'utilisateurs' && (
                    <UtilisateursView
                        currentUser={currentUser}
                        appState={appState}
                        onSaveUser={handleSaveUser}
                        onDeleteUser={handleDeleteUser}
                        onBulkDeleteUsers={handleBulkDeleteUsers}
                    />
                )}

                {activeView === 'organisations' && (
                    <OrganisationsView
                        appState={appState}
                        onSaveOrg={handleSaveOrg}
                        onDeleteOrg={handleDeleteOrg}
                    />
                )}

                {activeView === 'classement' && (
                    <ClassementView
                        appState={appState}
                    />
                )}

                {activeView === 'gagnants' && (
                    <GagnantsView
                        appState={appState}
                        onPublishWinner={handlePublishWinner}
                    />
                )}

                {activeView === 'journal' && (
                    <JournalView
                        appState={appState}
                    />
                )}

                {activeView === 'corbeille' && (
                    <CorbeilleView
                        corbeille={appState.corbeille || []}
                        onRestoreItem={handleRestoreCorbeilleItem}
                        onDeleteItem={handleDeleteCorbeilleItem}
                        onEmptyCorbeille={handleEmptyCorbeille}
                        onRefresh={() => loadData()}
                    />
                )}
            </main>

            <Toast toast={toast} />
        </div>
    );
}

// Render React App into #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
