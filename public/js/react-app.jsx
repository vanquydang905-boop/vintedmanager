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
    const [toast, setToast] = useState({ visible: false, message: '', isError: false });

    const [appState, setAppState] = useState({
        organisations: [],
        parametres: {},
        utilisateurs: [],
        comptes: [],
        calendrier: [],
        incidents: [],
        journal: []
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
            showToast("Identifiants incorrects. Veuillez réessayer.", true);
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
            await API.updateCalendrierRow(id, fields);
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

    const handleGeneratePlanning = async (nbJours) => {
        try {
            const res = await API.generatePlanning(nbJours, currentOrgId);
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

    if (!currentUser) {
        return (
            <div className="app-container">
                <LoginView onLoginSubmit={handleLoginSubmit} />
                <Toast toast={toast} />
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar
                currentUser={currentUser}
                currentOrgId={currentOrgId}
                organisations={appState.organisations}
                activeView={activeView}
                onSelectView={setActiveView}
                onSwitchOrg={handleSwitchOrg}
                onLogout={handleLogout}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
            />

            <main className="main-content">
                {currentUser && currentUser.role === 'admin' && (
                    <div style={{
                        position: 'fixed',
                        top: '18px',
                        right: '24px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} title="Exporter la base de données en JSON" style={{ fontSize: '12px', padding: '5px 10px' }}>
                            <i className="fa-solid fa-download"></i> Exporter JSON
                        </button>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, fontSize: '12px', padding: '5px 10px' }} title="Importer la base de données depuis un fichier JSON">
                            <i className="fa-solid fa-file-import"></i> Importer JSON
                            <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                        </label>
                    </div>
                )}
                {activeView === 'dashboard' && (
                    <DashboardView
                        appState={appState}
                        currentUser={currentUser}
                        onUpdateRow={handleUpdateRow}
                        onDeleteRow={handleDeleteRow}
                        onAddRowClick={handleAddRow}
                    />
                )}

                {activeView === 'comptes' && (
                    <ComptesView
                        currentUser={currentUser}
                        appState={appState}
                        onSaveCompte={handleSaveCompte}
                        onDeleteCompte={handleDeleteCompte}
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
            </main>

            <Toast toast={toast} />
        </div>
    );
}

// Render React App into #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
