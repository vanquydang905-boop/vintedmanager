// ==========================================
// STATE MANAGEMENT & INIT
// ==========================================
let appState = {
    parametres: null,
    organisations: [],
    utilisateurs: [],
    comptes: [],
    calendrier: [],
    incidents: [],
    journal: [],
    currentUserRole: 'admin',
    currentUser: null,
    currentOrganisationId: 'org_default'
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndInit();
});

async function checkAuthAndInit() {
    const savedUser = localStorage.getItem('vinted_manager_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            appState.currentUser = user;
            appState.currentUserRole = user.role;
            appState.currentOrganisationId = user.organisationId || 'org_default';
            updateUserProfileWidget(user);
            await loadAppState();
            return;
        } catch (e) {
            localStorage.removeItem('vinted_manager_user');
        }
    }
    showLoginView();
}

async function loadAppState() {
    try {
        const dbData = await API.getFullDB(appState.currentOrganisationId);
        appState = {
            ...appState,
            ...dbData
        };
        populateOrganisationDropdown();
        applyRolePermissions();
        renderAll();
    } catch (err) {
        console.error("[loadAppState Error]", err);
        showToast("Erreur API : " + (err.message || "Impossible de contacter le serveur"), true);
    }
}

function populateOrganisationDropdown() {
    const select = document.getElementById('currentOrgSelect');
    if (!select) return;

    const orgs = appState.organisations || [{ id: 'org_default', nom: 'Organisation Principale' }];
    select.innerHTML = orgs.map(o => `<option value="${o.id}">${escapeHtml(o.nom)}</option>`).join('');
    select.value = appState.currentOrganisationId || 'org_default';
}

async function switchOrganisation(orgId) {
    appState.currentOrganisationId = orgId;
    showToast("Chargement de l'organisation...");
    await loadAppState();
}

function renderAll() {
    showView('dashboard', document.querySelector('.nav-btn.active'));
}

// ------------------- AUTHENTIFICATION -------------------
function showLoginView() {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const loginView = document.getElementById('view-login');
    if (loginView) loginView.style.display = 'block';

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
}

function showAppContent() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'flex';

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) mobileMenuBtn.style.display = '';
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const user = await API.login({ email, motDePasse: password });
        setUserSession(user);
        showToast(`Bienvenue, ${user.nom} !`);
    } catch (err) {
        showToast("Identifiants incorrects. Veuillez réessayer.", true);
    }
}

function setUserSession(user) {
    appState.currentUser = user;
    appState.currentUserRole = user.role;
    appState.currentOrganisationId = user.organisationId || 'org_default';
    localStorage.setItem('vinted_manager_user', JSON.stringify(user));
    updateUserProfileWidget(user);
    showAppContent();
    loadAppState();
}

function updateUserProfileWidget(user) {
    const nameEl = document.getElementById('activeUserName');
    const emailEl = document.getElementById('activeUserEmail');
    const badgeEl = document.getElementById('roleBadge');

    if (nameEl) nameEl.innerText = user.nom || 'Utilisateur';
    if (emailEl) emailEl.innerText = user.email || '';
    if (badgeEl) {
        if (user.role === 'admin') {
            badgeEl.style.background = '#9333ea';
            badgeEl.innerHTML = '👑 Admin';
        } else if (user.role === 'cadre') {
            badgeEl.style.background = '#2563eb';
            badgeEl.innerHTML = '👔 Cadre';
        } else {
            badgeEl.style.background = '#16a34a';
            badgeEl.innerHTML = '🧑‍💼 Agent';
        }
    }
}

function logout() {
    localStorage.removeItem('vinted_manager_user');
    appState.currentUser = null;
    appState.currentUserRole = null;
    showToast("Déconnexion réussie");
    showLoginView();
}

function applyRolePermissions() {
    const role = appState.currentUserRole;
    const btnComptes = document.getElementById('nav-btn-comptes');
    const btnPlanning = document.getElementById('nav-btn-planning');
    const btnOrgs = document.getElementById('nav-btn-organisations');
    const btnUsers = document.getElementById('nav-btn-utilisateurs');
    const btnParams = document.getElementById('nav-btn-parametres');
    const btnJournal = document.getElementById('nav-btn-journal');
    const orgSelectorWidget = document.getElementById('orgSelectorWidget');

    if (role === 'admin') {
        if (btnComptes) btnComptes.style.display = 'flex';
        if (btnPlanning) btnPlanning.style.display = 'flex';
        if (btnOrgs) btnOrgs.style.display = 'flex';
        if (btnUsers) btnUsers.style.display = 'flex';
        if (btnParams) btnParams.style.display = 'flex';
        if (btnJournal) btnJournal.style.display = 'flex';
        if (orgSelectorWidget) orgSelectorWidget.style.display = 'block';
    } else if (role === 'cadre') {
        if (btnComptes) btnComptes.style.display = 'flex';
        if (btnPlanning) btnPlanning.style.display = 'flex';
        if (btnOrgs) btnOrgs.style.display = 'none';
        if (btnUsers) btnUsers.style.display = 'flex';
        if (btnParams) btnParams.style.display = 'flex';
        if (btnJournal) btnJournal.style.display = 'flex';
        if (orgSelectorWidget) orgSelectorWidget.style.display = 'none';
    } else if (role === 'agent') {
        if (btnComptes) btnComptes.style.display = 'none';
        if (btnPlanning) btnPlanning.style.display = 'none';
        if (btnOrgs) btnOrgs.style.display = 'none';
        if (btnUsers) btnUsers.style.display = 'none';
        if (btnParams) btnParams.style.display = 'none';
        if (btnJournal) btnJournal.style.display = 'none';
        if (orgSelectorWidget) orgSelectorWidget.style.display = 'none';
    }
}

// Navigation & Views
function showView(viewName, btnElement) {
    if (!appState.currentUser) {
        showLoginView();
        return;
    }
    showAppContent();

    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Trigger rendering for active view
    switch (viewName) {
        case 'dashboard': renderDashboard(); break;
        case 'comptes': renderComptes(); break;
        case 'planning': renderPlanning(); break;
        case 'classement': renderClassement(); break;
        case 'gagnants': renderGagnants(); break;
        case 'incidents': renderIncidents(); break;
        case 'organisations': renderOrganisations(); break;
        case 'utilisateurs': renderUtilisateurs(); break;
        case 'parametres': renderParametres(); break;
        case 'journal': renderJournal(); break;
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function getCompteById(id) {
    return appState.comptes.find(c => c.id === id);
}

// ==========================================
// 1. DASHBOARD & CALENDRIER
// ==========================================
function renderDashboard() {
    const fCompte = document.getElementById('filter-compte');
    const fAgent = document.getElementById('filter-agent');
    const fStatut = document.getElementById('filter-statut');
    const fClassif = document.getElementById('filter-classif');

    if (!fCompte || !fAgent || !fStatut || !fClassif) return;

    const currentFCompte = fCompte.value;
    const currentFAgent = fAgent.value;

    fCompte.innerHTML = '<option value="">Tous les comptes</option>' +
        (appState.comptes || []).map(c => `<option value="${c.id}">${escapeHtml(c.pseudo)}</option>`).join('');

    const agentsUnique = [...new Set((appState.comptes || []).map(c => c.agent).filter(Boolean))];
    fAgent.innerHTML = '<option value="">Tous les agents</option>' +
        agentsUnique.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');

    fCompte.value = currentFCompte;
    fAgent.value = currentFAgent;

    if (appState.currentUserRole === 'agent' && appState.currentUser?.agentAssigne) {
        fAgent.value = appState.currentUser.agentAssigne;
    }

    const filterC = fCompte.value;
    const filterA = fAgent.value;
    const filterS = fStatut.value;
    const filterCl = fClassif.value;

    const filteredLines = appState.calendrier.filter(l =>
        (!filterC || l.compteId === filterC) &&
        (!filterA || l.agent === filterA) &&
        (!filterS || l.statut === filterS) &&
        (!filterCl || l.classification === filterCl)
    ).sort((a, b) => new Date(`${a.date}T${a.heurePrevue}`) - new Date(`${b.date}T${b.heurePrevue}`));

    const totalVentes = appState.calendrier.reduce((sum, l) => sum + (l.vente || 0), 0);
    const pubsFaite = appState.calendrier.filter(l => l.statut === 'Fait').length;
    const totalPubs = appState.calendrier.length;
    const avgScore = totalPubs > 0 ? (appState.calendrier.reduce((sum, l) => sum + (l.score || 0), 0) / totalPubs).toFixed(1) : "0.0";
    const winnersCount = new Set(appState.calendrier.filter(l => l.classification === 'Gagnant' && l.sku).map(l => l.sku)).size;

    document.getElementById('metric-ventes').innerText = totalVentes;
    document.getElementById('metric-pubs').innerText = `${pubsFaite} / ${totalPubs}`;
    document.getElementById('metric-score').innerText = avgScore;
    document.getElementById('metric-gagnants').innerText = winnersCount;

    const tbody = document.getElementById('tbody-calendrier');
    tbody.innerHTML = filteredLines.map(l => {
        const compte = getCompteById(l.compteId) || { pseudo: 'Inconnu' };
        const classifBadgeClass = l.classification === 'Gagnant' ? 'badge-gagnant' : (l.classification === 'Écarté' ? 'badge-ecarte' : 'badge-retester');
        const isFait = l.statut === 'Fait';

        return `
            <tr>
                <td><b>${l.date}</b><br><small style="color:var(--text-muted);">${l.jour}</small></td>
                <td><span class="badge badge-compte">${escapeHtml(compte.pseudo)}</span></td>
                <td>${escapeHtml(l.agent)}</td>
                <td><b>${l.heurePrevue}</b></td>
                <td><input type="text" value="${escapeHtml(l.sku)}" onchange="updateLine('${l.id}', 'sku', this.value)" placeholder="ex: SKU-101" style="width:110px;"></td>
                <td><input type="text" value="${escapeHtml(l.produit)}" onchange="updateLine('${l.id}', 'produit', this.value)" placeholder="Titre produit..." style="width:160px;"></td>
                <td>
                    ${l.lien ? `<a href="${escapeHtml(l.lien)}" target="_blank" class="btn btn-secondary btn-sm"><i class="fa-solid fa-arrow-up-right-from-square"></i> Voir</a>` : ''}
                    <input type="text" value="${escapeHtml(l.lien)}" onchange="updateLine('${l.id}', 'lien', this.value)" placeholder="URL Vinted..." style="width:130px; font-size:12px;">
                </td>
                <td><input type="number" value="${l.vues}" onchange="updateLine('${l.id}', 'vues', this.value)" style="width:60px;"></td>
                <td><input type="number" value="${l.likes}" onchange="updateLine('${l.id}', 'likes', this.value)" style="width:60px;"></td>
                <td><input type="number" value="${l.favoris}" onchange="updateLine('${l.id}', 'favoris', this.value)" style="width:60px;"></td>
                <td><input type="number" value="${l.messages}" onchange="updateLine('${l.id}', 'messages', this.value)" style="width:60px;"></td>
                <td>
                    <select onchange="updateLine('${l.id}', 'vente', this.value)" class="${l.vente === 1 ? 'input-vente-yes' : ''}">
                        <option value="0" ${l.vente === 0 ? 'selected' : ''}>Non</option>
                        <option value="1" ${l.vente === 1 ? 'selected' : ''}>Oui (1)</option>
                    </select>
                </td>
                <td><b>${(l.score || 0).toFixed(1)}</b></td>
                <td><span class="badge ${classifBadgeClass}">${l.classification}</span></td>
                <td>
                    <button class="btn ${isFait ? 'btn-success' : 'btn-secondary'} btn-sm" onclick="toggleStatut('${l.id}', '${l.statut}')">
                        <i class="fa-solid ${isFait ? 'fa-circle-check' : 'fa-circle'}"></i> ${l.statut}
                    </button>
                    ${l.dateStatut ? `<div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Fait à ${l.heureStatut}</div>` : ''}
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteLine('${l.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="16" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucune ligne ne correspond aux filtres sélectionnés.</td></tr>';
}

async function updateLine(id, field, value) {
    try {
        const res = await API.updateCalendrierField(id, field, value);
        if (res.warning) showToast(res.warning, true);
        const index = appState.calendrier.findIndex(l => l.id === id);
        if (index !== -1) appState.calendrier[index] = res.item;
        renderDashboard();
    } catch (err) {
        showToast("Erreur lors de la mise à jour", true);
    }
}

async function toggleStatut(id, currentStatut) {
    const newStatut = currentStatut === 'Fait' ? 'Non fait' : 'Fait';
    await updateLine(id, 'statut', newStatut);
}

async function deleteLine(id) {
    if (appState.currentUserRole === 'agent') {
        showToast("Seuls les Administrateurs et Cadres peuvent supprimer des créneaux", true);
        return;
    }
    if (!confirm("Supprimer cette ligne de publication ?")) return;
    try {
        await API.deleteCalendrierLine(id);
        appState.calendrier = appState.calendrier.filter(l => l.id !== id);
        renderDashboard();
        showToast("Ligne supprimée");
    } catch (err) {
        showToast("Erreur de suppression", true);
    }
}

async function addManualLine() {
    try {
        const newLine = await API.createCalendrierLine({ organisationId: appState.currentOrganisationId });
        appState.calendrier.push(newLine);
        renderDashboard();
        showToast("Nouvelle ligne de publication ajoutée");
    } catch (err) {
        showToast("Erreur lors de l'ajout", true);
    }
}

// ==========================================
// 2. COMPTES
// ==========================================
function populateAgentDropdown(selectedValue = '') {
    const select = document.getElementById('compte-agent');
    if (!select) return;

    // Collect all agents from utilisateurs and existing comptes
    const userAgents = (appState.utilisateurs || [])
        .filter(u => u.role === 'agent' || u.agentAssigne)
        .map(u => u.agentAssigne || u.nom);
    const compteAgents = (appState.comptes || []).map(c => c.agent);
    
    const allAgents = [...new Set([...userAgents, ...compteAgents, "Agent Marc", "Agent Lucas"])].filter(Boolean);

    select.innerHTML = allAgents.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    if (selectedValue) select.value = selectedValue;
}

function showQuickAddAgentModal() {
    document.getElementById('quick-agent-nom').value = '';
    document.getElementById('quick-agent-email').value = '';
    document.getElementById('quick-agent-password').value = '123456';
    document.getElementById('modalQuickAgent').style.display = 'block';
}

function hideQuickAddAgentModal() {
    document.getElementById('modalQuickAgent').style.display = 'none';
}

async function saveQuickAgent() {
    const nom = document.getElementById('quick-agent-nom').value.trim();
    const email = document.getElementById('quick-agent-email').value.trim();
    const motDePasse = document.getElementById('quick-agent-password').value || '123456';

    if (!nom || !email) {
        showToast("Le nom et l'email de l'agent sont obligatoires", true);
        return;
    }

    try {
        const newAgent = await API.createUser({
            nom,
            email,
            role: 'agent',
            organisationId: appState.currentOrganisationId,
            agentAssigne: nom,
            motDePasse
        });
        showToast(`Nouvel agent "${nom}" créé avec succès !`);
        hideQuickAddAgentModal();
        await loadAppState();
        populateAgentDropdown(nom);
    } catch (err) {
        showToast("Erreur lors de la création de l'agent: " + err.message, true);
    }
}

function renderComptes() {
    populateAgentDropdown();
    const tbody = document.getElementById('tbody-comptes');
    tbody.innerHTML = appState.comptes.map(c => `
        <tr>
            <td><b>${escapeHtml(c.pseudo)}</b></td>
            <td>${escapeHtml(c.agent)}</td>
            <td>${c.lienProfil ? `<a href="${escapeHtml(c.lienProfil)}" target="_blank" style="color:var(--primary-color);">Profil Vinted</a>` : '-'}</td>
            <td>
                <span class="badge ${c.statut === 'Actif' ? 'badge-actif' : (c.statut === 'Banni' ? 'badge-banni' : 'badge-limite')}">${c.statut}</span>
            </td>
            <td>${c.dateCreation || '-'}</td>
            <td>${escapeHtml(c.notes || '-')}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCompte('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                ${appState.currentUserRole === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteCompte('${c.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucun compte enregistré pour cette organisation.</td></tr>';
}

function showAddCompteModal() {
    populateAgentDropdown();
    document.getElementById('modalCompteTitle').innerText = "Ajouter un Compte Vinted";
    document.getElementById('compte-id').value = '';
    document.getElementById('compte-pseudo').value = '';
    document.getElementById('compte-lien').value = '';
    document.getElementById('compte-statut').value = 'Actif';
    document.getElementById('compte-notes').value = '';
    document.getElementById('modalCompte').style.display = 'block';
}

function hideCompteModal() {
    document.getElementById('modalCompte').style.display = 'none';
}

function editCompte(id) {
    const c = getCompteById(id);
    if (!c) return;
    populateAgentDropdown(c.agent);
    document.getElementById('modalCompteTitle').innerText = "Modifier le Compte";
    document.getElementById('compte-id').value = c.id;
    document.getElementById('compte-pseudo').value = c.pseudo;
    document.getElementById('compte-agent').value = c.agent;
    document.getElementById('compte-lien').value = c.lienProfil || '';
    document.getElementById('compte-statut').value = c.statut;
    document.getElementById('compte-notes').value = c.notes || '';
    document.getElementById('modalCompte').style.display = 'block';
}

async function saveCompte() {
    const id = document.getElementById('compte-id').value;
    const data = {
        organisationId: appState.currentOrganisationId,
        pseudo: document.getElementById('compte-pseudo').value.trim(),
        agent: document.getElementById('compte-agent').value.trim(),
        lienProfil: document.getElementById('compte-lien').value.trim(),
        statut: document.getElementById('compte-statut').value,
        notes: document.getElementById('compte-notes').value.trim()
    };

    if (!data.pseudo || !data.agent) {
        showToast("Pseudo et Agent sont obligatoires", true);
        return;
    }

    try {
        if (id) {
            await API.updateCompte(id, data);
            showToast("Compte mis à jour avec succès");
        } else {
            await API.createCompte(data);
            showToast("Nouveau compte créé avec succès");
        }
        hideCompteModal();
        loadAppState();
    } catch (err) {
        showToast("Erreur lors de l'enregistrement", true);
    }
}

async function deleteCompte(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce compte et son historique ?")) return;
    try {
        await API.deleteCompte(id);
        showToast("Compte supprimé");
        loadAppState();
    } catch (err) {
        showToast("Erreur de suppression", true);
    }
}

// ==========================================
// 3. GENERATION PLANNING
// ==========================================
function renderPlanning() {
    const countActive = appState.comptes.filter(c => c.statut === 'Actif').length;
    document.getElementById('planning-active-comptes').innerText = countActive;
}

async function runPlanningGeneration() {
    const nbJours = parseInt(document.getElementById('planning-nb-jours').value) || 7;
    try {
        const res = await API.generatePlanning(nbJours, appState.currentOrganisationId);
        await loadAppState();
        showToast(res.message);
        showView('dashboard', document.querySelector('.nav-btn'));
    } catch (err) {
        showToast(err.message, true);
    }
}

// ==========================================
// 4. CLASSEMENT
// ==========================================
function renderClassement() {
    const productsMap = {};
    appState.calendrier.forEach(l => {
        if (!l.sku) return;
        if (!productsMap[l.sku]) {
            productsMap[l.sku] = {
                sku: l.sku,
                produit: l.produit || l.sku,
                compteId: l.compteId,
                agent: l.agent,
                vues: 0,
                likes: 0,
                favoris: 0,
                messages: 0,
                ventes: 0,
                maxScore: 0,
                count: 0
            };
        }
        const p = productsMap[l.sku];
        p.vues += l.vues || 0;
        p.likes += l.likes || 0;
        p.favoris += l.favoris || 0;
        p.messages += l.messages || 0;
        p.ventes += l.vente || 0;
        if (l.score > p.maxScore) p.maxScore = l.score;
        p.count++;
    });

    const sortedList = Object.values(productsMap).sort((a, b) => b.maxScore - a.maxScore);
    const tbody = document.getElementById('tbody-classement');
    const params = appState.parametres || {};

    tbody.innerHTML = sortedList.map((p, index) => {
        const compte = getCompteById(p.compteId) || { pseudo: 'Multicomptes' };
        const classification = (p.ventes > 0 || p.maxScore >= (params.seuils?.gagnant || 40)) ? "Gagnant" : (p.maxScore < (params.seuils?.ecarte || 15) ? "Écarté" : "À retester");
        const badgeClass = classification === 'Gagnant' ? 'badge-gagnant' : (classification === 'Écarté' ? 'badge-ecarte' : 'badge-retester');

        return `
            <tr>
                <td><b>#${index + 1}</b></td>
                <td><span class="badge badge-compte">${p.sku}</span></td>
                <td>${escapeHtml(p.produit)}</td>
                <td>${escapeHtml(compte.pseudo)}</td>
                <td>${escapeHtml(p.agent)}</td>
                <td>${p.vues}</td>
                <td>${p.likes + p.favoris}</td>
                <td>${p.messages}</td>
                <td><b>${p.ventes}</b></td>
                <td><b>${p.maxScore.toFixed(1)}</b></td>
                <td><span class="badge ${badgeClass}">${classification}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucun article SKU enregistré.</td></tr>';
}

// ==========================================
// 5. SUGGESTIONS / WINNERS
// ==========================================
function renderGagnants() {
    const params = appState.parametres || {};
    const winnersMap = {};

    appState.calendrier.forEach(l => {
        if (!l.sku) return;
        const isWinner = l.vente === 1 || l.score >= (params.seuils?.gagnant || 40);
        if (isWinner) {
            if (!winnersMap[l.sku]) {
                winnersMap[l.sku] = {
                    sku: l.sku,
                    produit: l.produit || l.sku,
                    bestScore: l.score,
                    ventesTotal: 0,
                    comptesPublies: new Set()
                };
            }
            winnersMap[l.sku].ventesTotal += l.vente || 0;
            if (l.score > winnersMap[l.sku].bestScore) winnersMap[l.sku].bestScore = l.score;
            winnersMap[l.sku].comptesPublies.add(l.compteId);
        }
    });

    const activeComptesCount = appState.comptes.filter(c => c.statut === 'Actif').length;
    const winnersList = Object.values(winnersMap);
    const grid = document.getElementById('grid-gagnants');

    grid.innerHTML = winnersList.map(w => {
        const missingComptes = activeComptesCount - w.comptesPublies.size;
        return `
            <div class="card" style="border-top: 4px solid var(--success);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span class="badge badge-gagnant">Produit Gagnant</span>
                        <h3 style="margin-top:8px;">${escapeHtml(w.produit)}</h3>
                        <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">SKU: ${w.sku}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:20px; font-weight:700; color:var(--success);">${w.bestScore.toFixed(1)} pts</div>
                        <div style="font-size:12px; color:var(--text-muted);">${w.ventesTotal} Vente(s)</div>
                    </div>
                </div>

                <div style="margin-top:16px; font-size:13px;">
                    <i class="fa-solid fa-network-wired"></i> Publié sur <b>${w.comptesPublies.size} / ${activeComptesCount}</b> comptes actifs.
                </div>

                ${missingComptes > 0 ? `
                    <button class="btn btn-success" style="width:100%; margin-top:16px;" onclick="publishWinnerToAll('${w.sku}')">
                        <i class="fa-solid fa-bullhorn"></i> Publier sur les ${missingComptes} comptes restants
                    </button>
                ` : `
                    <div style="margin-top:16px; padding:8px; background:rgba(46,204,113,0.1); color:var(--success); border-radius:6px; font-size:12px; text-align:center;">
                        <i class="fa-solid fa-check-double"></i> Déjà propagé sur tous les comptes
                    </div>
                `}
            </div>
        `;
    }).join('') || '<div class="card" style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding:32px;">Aucun produit n\'a encore atteint le statut Gagnant.</div>';
}

async function publishWinnerToAll(sku) {
    try {
        const res = await API.publishWinner(sku, appState.currentOrganisationId);
        await loadAppState();
        showToast(res.message);
        showView('dashboard', document.querySelector('.nav-btn'));
    } catch (err) {
        showToast("Erreur lors de la publication", true);
    }
}

// ==========================================
// 6. INCIDENTS
// ==========================================
function toggleIncidentFields() {
    const typeEl = document.getElementById('inc-type') || document.getElementById('incident-type');
    const wrapper = document.getElementById('wrapper-annonces-masquees');
    if (wrapper && typeEl) {
        wrapper.style.display = (typeEl.value === 'Annonces masquées') ? 'grid' : 'none';
    }
}

function renderIncidents() {
    const selCompte = document.getElementById('inc-compte') || document.getElementById('incident-compte');
    if (selCompte) {
        selCompte.innerHTML = '<option value="">Sélectionner un compte...</option>' +
            appState.comptes.map(c => `<option value="${c.id}">${c.pseudo} (${c.agent})</option>`).join('');
    }

    toggleIncidentFields();

    const tbody = document.getElementById('tbody-incidents');
    if (!tbody) return;

    tbody.innerHTML = appState.incidents.map(inc => {
        const compte = getCompteById(inc.compteId) || { pseudo: 'Inconnu' };
        const isAnnoncesMasquees = (inc.type === 'Annonces masquées');
        const badgeClass = isAnnoncesMasquees ? 'badge-warning' : (inc.type === 'Ban définitif' ? 'badge-banni' : 'badge-limite');
        
        const detailsCol = isAnnoncesMasquees
            ? `🙈 <b>${inc.nbAnnoncesMasquees || 0}</b> annonces (SKU: ${escapeHtml(inc.skuAnnoncesMasquees || 'Non renseigné')})`
            : `<b>${inc.nbVentesConnues || 0}</b> ventes (${(inc.detailVentes || []).join(', ')})`;

        return `
            <tr>
                <td><b>${escapeHtml(inc.dateBlocage || '')}</b> ${escapeHtml(inc.heureBlocage || '')}</td>
                <td><span class="badge badge-compte">${escapeHtml(compte.pseudo)}</span></td>
                <td><span class="badge ${badgeClass}">${escapeHtml(inc.type || '')}</span></td>
                <td><b>${inc.nbPubs24h || 0}</b> pubs (${(inc.heuresPubs24h || []).join(', ')})</td>
                <td>${detailsCol}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucun incident enregistré.</td></tr>';
}

async function saveIncident(e) {
    if (e && e.preventDefault) e.preventDefault();

    const compteId = document.getElementById('inc-compte')?.value || document.getElementById('incident-compte')?.value;
    const type = document.getElementById('inc-type')?.value || document.getElementById('incident-type')?.value;
    const dateHeure = document.getElementById('inc-date')?.value || document.getElementById('incident-datetime')?.value;
    const nbAnnoncesMasquees = parseInt(document.getElementById('inc-nb-annonces')?.value) || 0;
    const skuAnnoncesMasquees = document.getElementById('inc-sku')?.value || '';

    if (!compteId || !dateHeure) {
        showToast("Compte et Date/Heure sont requis", true);
        return;
    }

    try {
        await API.createIncident({
            compteId,
            type,
            dateHeure,
            nbAnnoncesMasquees,
            skuAnnoncesMasquees,
            organisationId: appState.currentOrganisationId
        });
        showToast("Incident enregistré et statut du compte mis à jour");
        loadAppState();
    } catch (err) {
        showToast("Erreur lors de l'enregistrement de l'incident: " + err.message, true);
    }
}

async function reportIncident() {
    return saveIncident(null);
}

// ==========================================
// 7. ORGANISATIONS
// ==========================================
function renderOrganisations() {
    const tbody = document.getElementById('tbody-organisations');
    if (!tbody) return;

    const orgs = appState.organisations || [];
    tbody.innerHTML = orgs.map(o => `
        <tr>
            <td><strong>${escapeHtml(o.nom)}</strong></td>
            <td><code>${o.id}</code></td>
            <td>${escapeHtml(o.dateCreation || '-')}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editOrganisation('${o.id}')"><i class="fa-solid fa-pen"></i></button>
                ${o.id !== 'org_default' ? `<button class="btn btn-danger btn-sm" onclick="deleteOrganisation('${o.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucune organisation enregistrée.</td></tr>';
}

function showAddOrgModal() {
    document.getElementById('modalOrgTitle').innerText = "Créer une Organisation";
    document.getElementById('org-id').value = '';
    document.getElementById('org-nom').value = '';
    document.getElementById('modalOrg').style.display = 'block';
}

function hideOrgModal() {
    document.getElementById('modalOrg').style.display = 'none';
}

function editOrganisation(id) {
    const org = (appState.organisations || []).find(o => o.id === id);
    if (!org) return;

    document.getElementById('modalOrgTitle').innerText = "Modifier l'Organisation";
    document.getElementById('org-id').value = org.id;
    document.getElementById('org-nom').value = org.nom;
    document.getElementById('modalOrg').style.display = 'block';
}

async function saveOrganisation() {
    const id = document.getElementById('org-id').value;
    const nom = document.getElementById('org-nom').value.trim();

    if (!nom) {
        showToast("Le nom de l'organisation est obligatoire", true);
        return;
    }

    try {
        if (id) {
            await API.updateOrganisation(id, { nom });
            showToast("Organisation mise à jour avec succès");
        } else {
            await API.createOrganisation({ nom });
            showToast("Organisation créée avec succès");
        }
        hideOrgModal();
        loadAppState();
    } catch (err) {
        showToast("Erreur: " + err.message, true);
    }
}

async function deleteOrganisation(id) {
    if (id === 'org_default') {
        showToast("Impossible de supprimer l'organisation principale par défaut", true);
        return;
    }
    if (!confirm("Voulez-vous vraiment supprimer cette organisation et TOUTES ses données associées ?")) return;
    try {
        await API.deleteOrganisation(id);
        showToast("Organisation supprimée");
        if (appState.currentOrganisationId === id) {
            appState.currentOrganisationId = 'org_default';
        }
        loadAppState();
    } catch (err) {
        showToast("Erreur: " + err.message, true);
    }
}

// ==========================================
// 8. UTILISATEURS
// ==========================================
function renderUtilisateurs() {
    const tbody = document.getElementById('tbody-utilisateurs');
    if (!tbody) return;

    const users = appState.utilisateurs || [];
    const orgs = appState.organisations || [];

    // Populate user-org dropdown in modal
    const userOrgSelect = document.getElementById('user-org');
    if (userOrgSelect) {
        userOrgSelect.innerHTML = orgs.map(o => `<option value="${o.id}">${escapeHtml(o.nom)}</option>`).join('');
    }

    tbody.innerHTML = users.map(u => {
        let roleBadge = '<span class="badge" style="background:#9333ea; color:white;">👑 Admin</span>';
        if (u.role === 'cadre') roleBadge = '<span class="badge" style="background:#2563eb; color:white;">👔 Cadre</span>';
        if (u.role === 'agent') roleBadge = '<span class="badge" style="background:#16a34a; color:white;">🧑‍💼 Agent</span>';

        const orgObj = orgs.find(o => o.id === u.organisationId) || { nom: u.organisationId || 'Principale' };

        return `
            <tr>
                <td><strong>${escapeHtml(u.nom)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td>${roleBadge}</td>
                <td><span class="badge badge-compte"><i class="fa-solid fa-building"></i> ${escapeHtml(orgObj.nom)}</span></td>
                <td>${escapeHtml(u.agentAssigne || '-')}</td>
                <td>${escapeHtml(u.dateCreation || '-')}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editUser('${u.id}')"><i class="fa-solid fa-pen"></i></button>
                    ${appState.currentUserRole === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">Aucun utilisateur enregistré.</td></tr>';
}

function showAddUserModal() {
    document.getElementById('modalUserTitle').innerText = "Ajouter un Utilisateur / Agent";
    document.getElementById('user-id').value = '';
    document.getElementById('user-nom').value = '';
    document.getElementById('user-email').value = '';
    
    const roleSelect = document.getElementById('user-role');
    const orgSelect = document.getElementById('user-org');
    
    roleSelect.value = 'agent';
    orgSelect.value = appState.currentOrganisationId || 'org_default';

    if (appState.currentUserRole === 'cadre') {
        roleSelect.disabled = true;
        orgSelect.disabled = true;
    } else {
        roleSelect.disabled = false;
        orgSelect.disabled = false;
    }

    document.getElementById('user-agent').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('modalUser').style.display = 'block';
}

function hideUserModal() {
    document.getElementById('modalUser').style.display = 'none';
}

function editUser(id) {
    const user = (appState.utilisateurs || []).find(u => u.id === id);
    if (!user) return;

    document.getElementById('modalUserTitle').innerText = "Modifier l'Utilisateur";
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-nom').value = user.nom;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-org').value = user.organisationId || 'org_default';
    document.getElementById('user-agent').value = user.agentAssigne || '';
    document.getElementById('user-password').value = '';
    document.getElementById('modalUser').style.display = 'block';
}

async function saveUser() {
    const id = document.getElementById('user-id').value;
    const nom = document.getElementById('user-nom').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const role = document.getElementById('user-role').value;
    const organisationId = document.getElementById('user-org').value;
    const agentAssigne = document.getElementById('user-agent').value.trim();
    const motDePasse = document.getElementById('user-password').value;

    if (!nom || !email) {
        showToast("Veuillez remplir le nom et l'email", true);
        return;
    }

    try {
        if (id) {
            await API.updateUser(id, { nom, email, role, organisationId, agentAssigne, motDePasse });
            showToast("Utilisateur mis à jour avec succès");
        } else {
            await API.createUser({ nom, email, role, organisationId, agentAssigne, motDePasse });
            showToast("Utilisateur créé avec succès");
        }
        hideUserModal();
        loadAppState();
    } catch (err) {
        showToast("Erreur: " + err.message, true);
    }
}

async function deleteUser(id) {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
        await API.deleteUser(id);
        showToast("Utilisateur supprimé");
        loadAppState();
    } catch (err) {
        showToast("Erreur: " + err.message, true);
    }
}

// ==========================================
// 9. PARAMETRES
// ==========================================
function renderParametres() {
    const p = appState.parametres || {};
    document.getElementById('param-mode-planif').value = p.modePlanification || 'intervalle';
    document.getElementById('param-poids-vues').value = p.poidsScore?.vues || 0.1;
    document.getElementById('param-poids-likes').value = p.poidsScore?.likes || 1;
    document.getElementById('param-poids-favoris').value = p.poidsScore?.favoris || 2;
    document.getElementById('param-poids-messages').value = p.poidsScore?.messages || 5;
    document.getElementById('param-poids-vente').value = p.poidsScore?.vente || 20;

    document.getElementById('param-seuil-ecarte').value = p.seuils?.ecarte || 15;
    document.getElementById('param-seuil-gagnant').value = p.seuils?.gagnant || 40;
    document.getElementById('param-decalage').value = p.decalageMinutesEntreComptes || 60;
    const elMarge = document.getElementById('param-marge-aleatoire');
    if (elMarge) elMarge.value = p.margeAleatoireMinutes !== undefined ? p.margeAleatoireMinutes : 15;
    document.getElementById('param-creneaux').value = p.creneauxParJour || 3;
    document.getElementById('param-delai-repost').value = p.delaiProchainRepostMinutes || 30;
    document.getElementById('param-jours-defaut').value = p.nbJoursPlanningParDefaut || 7;

    const elMatin = document.getElementById('param-matin');
    if (elMatin) elMatin.value = (p.heuresParPeriode?.matin || []).join(', ');
    const elMidi = document.getElementById('param-midi');
    if (elMidi) elMidi.value = (p.heuresParPeriode?.midi || []).join(', ');
    const elSoir = document.getElementById('param-soir');
    if (elSoir) elSoir.value = (p.heuresParPeriode?.soir || []).join(', ');
}

async function saveParametres() {
    if (appState.currentUserRole !== 'admin' && appState.currentUserRole !== 'cadre') {
        showToast("Seul l'Administrateur ou le Cadre peut modifier la configuration des paramètres", true);
        return;
    }

    const p = {
        modePlanification: document.getElementById('param-mode-planif').value || 'intervalle',
        poidsScore: {
            vues: parseFloat(document.getElementById('param-poids-vues').value) || 0,
            likes: parseFloat(document.getElementById('param-poids-likes').value) || 0,
            favoris: parseFloat(document.getElementById('param-poids-favoris').value) || 0,
            messages: parseFloat(document.getElementById('param-poids-messages').value) || 0,
            vente: parseFloat(document.getElementById('param-poids-vente').value) || 0,
        },
        seuils: {
            ecarte: parseFloat(document.getElementById('param-seuil-ecarte').value) || 15,
            gagnant: parseFloat(document.getElementById('param-seuil-gagnant').value) || 40,
        },
        decalageMinutesEntreComptes: parseInt(document.getElementById('param-decalage').value) || 60,
        margeAleatoireMinutes: parseInt(document.getElementById('param-marge-aleatoire')?.value || 0),
        creneauxParJour: parseInt(document.getElementById('param-creneaux').value) || 3,
        delaiProchainRepostMinutes: parseInt(document.getElementById('param-delai-repost').value) || 30,
        nbJoursPlanningParDefaut: parseInt(document.getElementById('param-jours-defaut').value) || 7,
        heuresParPeriode: document.getElementById('param-matin') ? {
            matin: document.getElementById('param-matin').value.split(',').map(s => s.trim()).filter(Boolean),
            midi: document.getElementById('param-midi').value.split(',').map(s => s.trim()).filter(Boolean),
            soir: document.getElementById('param-soir').value.split(',').map(s => s.trim()).filter(Boolean),
        } : (appState.parametres?.heuresParPeriode || {
            matin: ["06:30", "07:30", "08:30", "09:30", "10:30", "11:30"],
            midi: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
            soir: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
        })
    };

    try {
        const res = await API.updateParametres(p, appState.currentOrganisationId);
        await loadAppState();
        showToast(res.message);
    } catch (err) {
        showToast("Erreur lors de la sauvegarde des paramètres", true);
    }
}

// ==========================================
// 10. JOURNAL
// ==========================================
function renderJournal() {
    const tbody = document.getElementById('tbody-journal');
    tbody.innerHTML = appState.journal.map(j => `
        <tr>
            <td><b>${new Date(j.horodatage).toLocaleString('fr-FR')}</b></td>
            <td>${escapeHtml(j.action)}</td>
            <td>${escapeHtml(j.detail)}</td>
            <td><span class="badge ${j.resultat === 'Succès' ? 'badge-actif' : 'badge-banni'}">${j.resultat}</span></td>
        </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 24px; color: var(--text-muted);">Journal vide.</td></tr>';
}

// EXPORT / IMPORT JSON
async function exportJSON() {
    if (appState.currentUserRole !== 'admin') {
        showToast("Seul un Administrateur peut exporter la base de données", true);
        return;
    }
    try {
        const fullDb = await API.getFullDB(appState.currentOrganisationId);
        const dataStr = JSON.stringify(fullDb, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vinted_backup_${appState.currentOrganisationId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Exportation des données réussie");
    } catch (err) {
        showToast("Erreur lors de l'exportation", true);
    }
}

async function importJSON(event) {
    if (appState.currentUserRole !== 'admin') {
        showToast("Seul un Administrateur peut importer et remplacer la base de données", true);
        return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!imported.parametres || !imported.comptes || !imported.calendrier) {
                throw new Error("Format JSON invalide");
            }

            if (confirm("Attention: Cette action va remplacer toutes les données actuelles de la base de données. Continuer ?")) {
                await API.importDB(imported);
                await loadAppState();
                renderAll();
                showToast("Importation réussie");
            }
        } catch (err) {
            showToast("Erreur lors de l'importation: " + err.message, true);
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}

// UTILS
function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.backgroundColor = isError ? 'var(--danger)' : 'var(--text-main)';
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
