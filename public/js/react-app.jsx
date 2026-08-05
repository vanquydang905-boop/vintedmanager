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
        try {
            const data = await API.getFullDB(orgId || currentOrgId);
            setAppState(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error("[React App loadData Error]", err);
            showToast("Erreur API : " + (err.message || "Impossible de contacter le serveur"), true);
        }
    }, [currentUser, currentOrgId, showToast]);

    useEffect(() => {
        if (currentUser) {
            loadData(currentOrgId);
        }
    }, [currentUser, currentOrgId, loadData]);

    const handleLoginSubmit = async (loginInput, password) => {
        try {
            const user = await API.login({ email: loginInput, motDePasse: password });
            localStorage.setItem('vinted_manager_user', JSON.stringify(user));
            setCurrentUser(user);
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
            if (userData.id) {
                await API.updateUtilisateur(userData.id, userData);
                showToast("Utilisateur mis à jour");
            } else {
                await API.createUtilisateur({ ...userData, organisationId: currentOrgId });
                showToast("Utilisateur créé avec succès");
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
            await API.createOrganisation(orgData);
            showToast("Organisation créée avec succès");
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la création de l'organisation", true);
        }
    };

    const handleDeleteOrg = async (id) => {
        if (!confirm("Voulez-vous supprimer cette organisation ?")) return;
        try {
            await API.deleteOrganisation(id);
            showToast("Organisation supprimée");
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression d'organisation", true);
        }
    };

    const handlePublishWinner = async (sku) => {
        try {
            const res = await API.publishWinner(sku, currentOrgId);
            showToast(res.message || `SKU ${sku} publié sur les comptes`);
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la publication du produit gagnant", true);
        }
    };

    const handleExportJSON = async () => {
        try {
            const dbData = await API.getFullDB(currentOrgId);
            const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vinted_manager_export_${currentOrgId}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("Base de données exportée en JSON");
        } catch (err) {
            showToast("Erreur lors de l'export JSON", true);
        }
    };

    const handleImportJSON = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                await API.restoreFullDB(imported);
                showToast("Importation JSON effectuée avec succès");
                await loadData();
            } catch (err) {
                showToast("Fichier JSON invalide", true);
            }
        };
        reader.readAsText(file);
    };

    if (!currentUser) {
        return (
            <>
                <LoginView onLoginSubmit={handleLoginSubmit} />
                <Toast toast={toast} />
            </>
        );
    }

    return (
        <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
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
                        appState={appState}
                        onSaveCompte={handleSaveCompte}
                        onDeleteCompte={handleDeleteCompte}
                        onOpenQuickAgentModal={() => alert("Pour créer un agent, rendez-vous dans la section Utilisateurs.")}
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
