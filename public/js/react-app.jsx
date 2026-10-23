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
    const [toast, setToast] = useState({ visible: false, message: '', isError: false });
    const [loginError, setLoginError] = useState('');
    const [showStartupTodoModal, setShowStartupTodoModal] = useState(false);
    const [hasCheckedStartupTodos, setHasCheckedStartupTodos] = useState(false);

    const [isSyncingDotB, setIsSyncingDotB] = useState(false);

    const handleSwitchTZ = (tz) => {
        setTimeZone(tz);
        localStorage.setItem('vinted_timezone', tz);
    };

    const handleFetchLiveDotB = async () => {
        setIsSyncingDotB(true);
        showToast("⚡ Synchronisation et actualisation en cours avec DotB Cloud...");
        try {
            const res = await fetch('/api/dotb/fetch-live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organisationId: currentOrgId, period: 'all' })
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

    // Popup d'alerte automatique à l'ouverture de l'application si des tâches sont non réalisées
    useEffect(() => {
        if (!currentUser) {
            setHasCheckedStartupTodos(false);
            return;
        }

        if (!hasCheckedStartupTodos && Array.isArray(appState.todos) && appState.todos.length > 0) {
            const pending = appState.todos.filter(t => t && t.statut !== 'terminee');
            if (pending.length > 0) {
                setShowStartupTodoModal(true);
                if (typeof SoundEngine !== 'undefined' && SoundEngine.playWarningAlert) {
                    setTimeout(() => {
                        try { SoundEngine.playWarningAlert(); } catch (e) {}
                    }, 400);
                }
            }
            setHasCheckedStartupTodos(true);
        }
    }, [currentUser, appState.todos, hasCheckedStartupTodos]);

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

                        const pushTitle = isOverdue 
                            ? '🚨 Vinted Manager: Tâche en retard !'
                            : `⏰ Vinted Manager: Échéance imminente (${info.label})`;
                        
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
            const payload = role ? { role } : { email: loginInput, motDePasse: password };
            const user = await API.login(payload);
            localStorage.setItem('vinted_manager_user', JSON.stringify(user));
            setCurrentUser(user);
            setHasCheckedStartupTodos(false);
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


    const handleSaveIncident = async (incidentData) => {
        try {
            if (incidentData.id) {
                await API.updateIncident(incidentData.id, incidentData);
                showToast("Incident mis à jour avec succès");
            } else {
                await API.createIncident({ ...incidentData, organisationId: currentOrgId });
                showToast("Incident enregistré et statut du compte mis à jour");
            }
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

    const handleSaveTodo = async (todoData) => {
        try {
            const author = currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Utilisateur') : 'Utilisateur';
            const isCompleting = todoData.statut === 'terminee';

            if (todoData.id) {
                await API.updateTodo(todoData.id, {
                    ...todoData,
                    modifiePar: author,
                    terminePar: isCompleting ? (todoData.terminePar || author) : null
                });
                if (isCompleting) {
                    showToast(`🎉 Tâche "${todoData.titre}" réalisée avec succès !`);
                    if (window.SystemNotifications) {
                        window.SystemNotifications.notify("Tâche Réalisée ! ✅", `"${todoData.titre}" a été complétée par ${author}.`);
                    }
                } else {
                    showToast("Tâche mise à jour avec succès");
                }
            } else {
                await API.createTodo({
                    ...todoData,
                    creePar: todoData.creePar || author,
                    organisationId: currentOrgId
                });
                showToast(`Tâche créée par ${todoData.creePar || author} avec succès`);
            }
            await loadData();
        } catch (err) {
            showToast("Erreur lors de l'enregistrement de la tâche", true);
        }
    };

    const handleDeleteTodo = async (id) => {
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
            const author = currentUser ? (currentUser.nom || currentUser.agentAssigne || 'Utilisateur') : 'Utilisateur';
            await API.bulkUpdateTodos(ids, fields, author, currentOrgId);
            if (fields.statut === 'terminee') {
                showToast(`🎉 ${ids.length} tâche(s) marquée(s) comme réalisée(s) !`);
                if (window.SystemNotifications) {
                    window.SystemNotifications.notify("Tâches Réalisées ! ✅", `${ids.length} tâche(s) marquée(s) comme terminées par ${author}.`);
                }
            } else {
                showToast(`${ids.length} tâche(s) mise(s) à jour en masse !`);
            }
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la mise à jour des tâches en masse", true);
        }
    };

    const handleBulkDeleteTodos = async (ids) => {
        try {
            await API.bulkDeleteTodos(ids, currentOrgId);
            showToast(`${ids.length} tâche(s) supprimée(s) en masse !`);
            await loadData();
        } catch (err) {
            showToast("Erreur lors de la suppression des tâches en masse", true);
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            const finalData = { ...userData };
            // Restriction Cadre : Cadres can ONLY create agent profiles for their own organisation
            if (currentUser && currentUser.role !== 'admin' && !finalData.role) {
                finalData.role = 'agent';
                finalData.organisationId = currentUser.organisationId || 'org_default';
            }
            if (finalData.id) {
                const updated = await API.updateUtilisateur(finalData.id, finalData);
                showToast("Profil utilisateur et permissions mis à jour");
                if (currentUser && currentUser.id === finalData.id) {
                    const mergedUser = { ...currentUser, ...updated, permissions: finalData.permissions || updated.permissions };
                    setCurrentUser(mergedUser);
                    localStorage.setItem('vinted_manager_user', JSON.stringify(mergedUser));
                }
            } else {
                await API.createUtilisateur({ ...finalData, organisationId: finalData.organisationId || currentOrgId });
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
        const availableViews = [
            'comptes', 'todos', 'classement', 'gagnants', 'incidents',
            'messagerie', 'organisations', 'utilisateurs', 'corbeille',
            'parametres', 'journal'
        ];
        if (!PermissionManager.can(currentUser, activeView)) {
            const firstAllowed = availableViews.find(v => PermissionManager.can(currentUser, v));
            if (firstAllowed && firstAllowed !== activeView) {
                setActiveView(firstAllowed);
            }
        }
    }, [currentUser, activeView]);

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
                todoUrgentCount={todoUrgentCount}
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
                    <NotificationBellCenter
                        todos={appState.todos || []}
                        currentUser={currentUser}
                        onNavigateTodo={(todoId) => {
                            setActiveView('todos');
                        }}
                        onSaveTodo={handleSaveTodo}
                        showToast={showToast}
                    />

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

                    {currentUser && (
                        <>
                            {PermissionManager.can(currentUser, 'sync_dotb') && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleFetchLiveDotB}
                                    disabled={isSyncingDotB}
                                    style={{ backgroundColor: '#2563eb', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
                                    title="Actualiser en direct tous les comptes, articles en ligne et commandes depuis DotB Cloud"
                                >
                                    {isSyncingDotB ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Sync DotB...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-arrows-rotate"></i> Actualiser DotB
                                        </>
                                    )}
                                </button>
                            )}
                            {PermissionManager.can(currentUser, 'export_data') && (
                                <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} title="Exporter la base de données en JSON">
                                    <i className="fa-solid fa-download"></i> Exporter JSON
                                </button>
                            )}
                            {PermissionManager.can(currentUser, 'import_data') && (
                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }} title="Importer la base de données depuis un fichier JSON">
                                    <i className="fa-solid fa-file-import"></i> Importer JSON
                                    <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                                </label>
                            )}
                        </>
                    )}

                </div>

                {!PermissionManager.can(currentUser, activeView) && (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '500px' }}>
                        <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px', display: 'block' }}></i>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Accès Non Autorisé</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                            Vous ne disposez pas des droits d'accès nécessaires pour consulter ce module. Contactez votre superviseur ou administrateur pour personnaliser vos permissions.
                        </p>
                    </div>
                )}

                {activeView === 'todos' && PermissionManager.can(currentUser, 'todos') && (
                    <TodoView
                        currentUser={currentUser}
                        appState={appState}
                        onSaveTodo={handleSaveTodo}
                        onDeleteTodo={handleDeleteTodo}
                        onBulkUpdateTodos={handleBulkUpdateTodos}
                        onBulkDeleteTodos={handleBulkDeleteTodos}
                        showToast={showToast}
                    />
                )}

                {activeView === 'comptes' && PermissionManager.can(currentUser, 'comptes') && (
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

                {activeView === 'incidents' && PermissionManager.can(currentUser, 'incidents') && (
                    <IncidentsView
                        appState={appState}
                        onSaveIncident={handleSaveIncident}
                        onBulkDeleteIncidents={handleBulkDeleteIncidents}
                    />
                )}

                {activeView === 'messagerie' && PermissionManager.can(currentUser, 'messagerie') && (
                    <MessagerieView
                        appState={appState}
                    />
                )}

                {activeView === 'parametres' && PermissionManager.can(currentUser, 'parametres') && (
                    <ParametresView
                        appState={appState}
                        onSaveParametres={handleSaveParametres}
                    />
                )}

                {activeView === 'utilisateurs' && PermissionManager.can(currentUser, 'utilisateurs') && (
                    <UtilisateursView
                        currentUser={currentUser}
                        appState={appState}
                        onSaveUser={handleSaveUser}
                        onDeleteUser={handleDeleteUser}
                        onBulkDeleteUsers={handleBulkDeleteUsers}
                    />
                )}

                {activeView === 'organisations' && PermissionManager.can(currentUser, 'organisations') && (
                    <OrganisationsView
                        appState={appState}
                        onSaveOrg={handleSaveOrg}
                        onDeleteOrg={handleDeleteOrg}
                    />
                )}

                {activeView === 'classement' && PermissionManager.can(currentUser, 'classement') && (
                    <ClassementView
                        appState={appState}
                    />
                )}

                {activeView === 'gagnants' && PermissionManager.can(currentUser, 'gagnants') && (
                    <GagnantsView
                        appState={appState}
                        onPublishWinner={handlePublishWinner}
                    />
                )}

                {activeView === 'journal' && PermissionManager.can(currentUser, 'journal') && (
                    <JournalView
                        appState={appState}
                    />
                )}

                {activeView === 'corbeille' && PermissionManager.can(currentUser, 'corbeille') && (
                    <CorbeilleView
                        corbeille={appState.corbeille || []}
                        onRestoreItem={handleRestoreCorbeilleItem}
                        onDeleteItem={handleDeleteCorbeilleItem}
                        onEmptyCorbeille={handleEmptyCorbeille}
                        onRefresh={() => loadData()}
                    />
                )}
            </main>

            <StartupTodoModal
                isOpen={showStartupTodoModal}
                onClose={() => setShowStartupTodoModal(false)}
                todos={appState.todos || []}
                currentUser={currentUser}
                onNavigateToTodos={() => {
                    setActiveView('todos');
                    setShowStartupTodoModal(false);
                }}
                onSaveTodo={handleSaveTodo}
                showToast={showToast}
            />

            <Toast toast={toast} />
        </div>
    );
}

// Render React App into #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
