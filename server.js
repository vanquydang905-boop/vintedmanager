require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbService = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// UTILITIES & HELPERS
// ==========================================
function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calcScore(item, params) {
    const p = params.poidsScore || { vues: 0.1, favoris: 2, vente: 20 };
    // Likes et Messages désactivés temporairement
    // const favCount = (item.favoris || 0) + (item.likes || 0);
    const favCount = (item.favoris || 0);
    const weightFav = p.favoris || 2.0;
    return (item.vues || 0) * (p.vues || 0) +
        favCount * weightFav +
        // (item.messages || 0) * (p.messages || 0) +
        (item.vente || 0) * (p.vente || 0);
}

function getClassification(itemOrScore, allOrgLinesOrVente = [], paramsObj = {}) {
    let item = {};
    let allOrgLines = [];
    let params = {};

    if (typeof itemOrScore === 'object' && itemOrScore !== null) {
        item = itemOrScore;
        allOrgLines = Array.isArray(allOrgLinesOrVente) ? allOrgLinesOrVente : [];
        params = paramsObj || {};
    } else {
        item = {
            score: typeof itemOrScore === 'number' ? itemOrScore : 0,
            vente: typeof allOrgLinesOrVente === 'number' ? allOrgLinesOrVente : 0
        };
        params = paramsObj || {};
        allOrgLines = arguments[3] && Array.isArray(arguments[3]) ? arguments[3] : [];
        if (arguments[4] && typeof arguments[4] === 'string') {
            item.sku = arguments[4];
        }
    }

    const sku = (item.sku || '').trim().toLowerCase();

    // Classification SI ET SEULEMENT SI un SKU est renseigné !
    if (!sku) {
        return "";
    }

    const s = params.seuils || { ecarte: 15, gagnant: 40 };
    const score = item.score || 0;
    const vente = item.vente || 0;

    if (vente === 1 || score >= s.gagnant) return "Gagnant";
    if (score > 0 && score < s.ecarte) return "Écarté";

    // Vérifier si ce SKU a déjà été enregistré auparavant sur n'importe quel compte ou ligne de l'organisation
    const otherWithSameSKU = (allOrgLines || []).filter(l => 
        l.id !== item.id && 
        l.sku && 
        l.sku.trim().toLowerCase() === sku
    );

    if (otherWithSameSKU.length > 0) {
        return "À retester";
    }

    // SKU jamais enregistré auparavant -> Nouveau produit !
    return "Nouveau produit";
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Full Database Export
app.get('/api/db', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const organisations = await dbService.getOrganisations();
        const parametres = await dbService.getParametres(orgId || 'org_default');
        const utilisateurs = await dbService.getUtilisateurs(orgId);
        const comptes = await dbService.getComptes(orgId);
        const calendrier = await dbService.getCalendrier(orgId);
        const incidents = await dbService.getIncidents(orgId);
        const journal = await dbService.getJournal(orgId);
        const corbeille = await dbService.getCorbeille(orgId);

        res.json({ organisations, parametres, utilisateurs, comptes, calendrier, incidents, journal, corbeille });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- CORBEILLE API -------------------
app.get('/api/corbeille', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const list = await dbService.getCorbeille(orgId);
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/corbeille/restore/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const restoredData = await dbService.restoreCorbeilleItem(id);
        await dbService.logAction("Restauration Corbeille", `Restauration de l'élément ${id}`, "Succès");
        res.json({ message: "Élément restauré avec succès", restoredData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/corbeille/empty', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        await dbService.emptyCorbeille(orgId);
        await dbService.logAction("Purge Corbeille", `Vidage de la corbeille ${orgId ? 'pour org ' + orgId : 'complète'}`, "Succès");
        res.json({ message: "Corbeille vidée avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/corbeille/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbService.deleteCorbeilleItem(id);
        await dbService.logAction("Purge Corbeille", `Suppression définitive de l'élément ${id} de la corbeille`, "Succès");
        res.json({ message: "Élément supprimé définitivement de la corbeille" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Full Database Import / Restore
app.post('/api/import', async (req, res) => {
    try {
        const { parametres, organisations, utilisateurs, comptes, calendrier, incidents, journal } = req.body;
        if (!parametres || !Array.isArray(comptes) || !Array.isArray(calendrier)) {
            return res.status(400).json({ error: "Structure JSON invalide" });
        }

        await dbService.restoreFullDatabase({ parametres, organisations, utilisateurs, comptes, calendrier, incidents, journal });
        await dbService.logAction("Import JSON", "Importation complète des données via l'API", "Succès");
        res.json({ message: "Base de données importée avec succès dans Supabase" });
    } catch (err) {
        await dbService.logAction("Import JSON", "Échec d'importation: " + err.message, "Échec");
        res.status(500).json({ error: err.message });
    }
});

// ------------------- ORGANISATIONS -------------------
app.get('/api/organisations', async (req, res) => {
    try {
        const orgs = await dbService.getOrganisations();
        res.json(orgs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/organisations', async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ error: "Nom de l'organisation requis" });
        const id = "org_" + Date.now();
        const newOrg = {
            id,
            nom,
            dateCreation: new Date().toISOString().split('T')[0]
        };
        const created = await dbService.createOrganisation(newOrg);
        await dbService.logAction("Gestion Organisation", `Création de l'organisation ${nom}`, "Succès");
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/organisations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom } = req.body;
        const updated = await dbService.updateOrganisation(id, { nom });
        await dbService.logAction("Gestion Organisation", `Modification de l'organisation ${nom}`, "Succès");
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/organisations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'org_default') {
            return res.status(400).json({ error: "Impossible de supprimer l'organisation principale par défaut" });
        }
        await dbService.deleteOrganisation(id);
        await dbService.logAction("Gestion Organisation", `Suppression de l'organisation ${id}`, "Succès");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- AUTH & USERS -------------------
app.get('/api/users', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const users = await dbService.getUtilisateurs(orgId);
        const safeUsers = users.map(u => ({
            id: u.id,
            nom: u.nom,
            email: u.email,
            role: u.role,
            organisationId: u.organisationId || 'org_default',
            agentAssigne: u.agentAssigne || '',
            dateCreation: u.dateCreation || ''
        }));
        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        const users = await dbService.getUtilisateurs();
        
        let found = null;
        const loginInput = (email || '').trim().toLowerCase();
        if (loginInput && motDePasse) {
            found = users.find(u => 
                ((u.email && u.email.toLowerCase() === loginInput) ||
                 (u.nom && u.nom.toLowerCase() === loginInput)) &&
                dbService.verifyPassword(motDePasse, u.motDePasse)
            );
        }

        if (!found) {
            return res.status(401).json({ error: "Identifiants ou mot de passe invalide" });
        }

        if (found.motDePasse && !found.motDePasse.startsWith('sha256$')) {
            await dbService.updateUtilisateur(found.id, { motDePasse });
        }

        await dbService.logAction("Authentification", `Connexion sécurisée de ${found.nom} (${found.role})`, "Succès", found.organisationId || 'org_default');
        res.json({
            id: found.id,
            nom: found.nom,
            email: found.email,
            role: found.role,
            organisationId: found.organisationId || 'org_default',
            agentAssigne: found.agentAssigne || ''
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { nom, email, role, organisationId, agentAssigne, motDePasse } = req.body;
        const id = "usr_" + Date.now();
        const newUser = {
            id,
            nom,
            email,
            role: role || 'agent',
            organisationId: organisationId || 'org_default',
            agentAssigne: agentAssigne || '',
            motDePasse: motDePasse || '123456',
            dateCreation: new Date().toISOString().split('T')[0]
        };
        const created = await dbService.createUtilisateur(newUser);
        await dbService.logAction("Gestion Utilisateur", `Création de l'utilisateur ${nom} (${role})`, "Succès", newUser.organisationId);
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, email, role, organisationId, agentAssigne, motDePasse } = req.body;
        const fields = { nom, email, role, organisationId, agentAssigne };
        if (motDePasse) fields.motDePasse = motDePasse;
        
        const updated = await dbService.updateUtilisateur(id, fields);
        await dbService.logAction("Gestion Utilisateur", `Modification de l'utilisateur ${nom}`, "Succès", organisationId || 'org_default');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbService.deleteUtilisateur(id);
        await dbService.logAction("Gestion Utilisateur", `Suppression de l'utilisateur ${id}`, "Succès");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- COMPTES -------------------
app.get('/api/comptes', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const comptes = await dbService.getComptes(orgId);
        res.json(comptes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comptes', async (req, res) => {
    try {
        const {
            pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId,
            numeroCompte, telephone, email, motDePasse, gereParInitiales, dateStatutCompte
        } = req.body;
        // Use provided id if given (e.g. from text-paste import), otherwise generate
        const id = req.body.id || ("compte_" + Date.now());
        const newCompte = {
            id,
            organisationId: organisationId || 'org_default',
            numeroCompte: numeroCompte || '',
            pseudo: pseudo || '',
            telephone: telephone || '',
            email: email || '',
            motDePasse: motDePasse || '',
            gereParInitiales: gereParInitiales || '',
            agent: agent || 'À attribuer',
            lienProfil: lienProfil || '',
            statut: statut || 'Actif',
            dateStatutCompte: dateStatutCompte || '',
            dateCreation: dateCreation || new Date().toISOString().split('T')[0],
            notes: notes || ''
        };
        const created = await dbService.createCompte(newCompte);
        await dbService.logAction("Gestion Compte", `Création du compte ${pseudo || numeroCompte}`, "Succès", newCompte.organisationId);
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/comptes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId,
            numeroCompte, telephone, email, motDePasse, gereParInitiales, dateStatutCompte
        } = req.body;
        const updated = await dbService.updateCompte(id, {
            pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId,
            numeroCompte, telephone, email, motDePasse, gereParInitiales, dateStatutCompte
        });
        await dbService.logAction("Gestion Compte", `Modification du compte ${pseudo || id}`, "Succès", organisationId || 'org_default');
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/comptes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCompte = await dbService.deleteCompte(id);
        await dbService.logAction("Gestion Compte", `Suppression du compte ${deletedCompte ? deletedCompte.pseudo : id}`, "Succès");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- ADSPOWER API INTEGRATION -------------------
app.post('/api/adspower/import-profiles', async (req, res) => {
    try {
        const profiles = req.body.profiles;
        const orgId = req.body.organisationId || 'org_default';

        if (!Array.isArray(profiles) || profiles.length === 0) {
            return res.status(400).json({ error: "Aucun profil AdsPower fourni à enregistrer." });
        }

        const existingComptes = await dbService.getComptes(orgId);
        let importedCount = 0;

        for (const p of profiles) {
            const numProxy = p.serial_number ? String(p.serial_number) : '';
            const pseudo = p.name ? String(p.name) : (numProxy ? `compte_${numProxy}` : `compte_${p.user_id}`);
            const email = p.username || p.email || '';
            const motDePasse = p.password || '';
            const notes = [p.remark, p.proxy ? `Proxy: ${p.proxy}` : ''].filter(Boolean).join(' | ');

            const combinedInfo = `${p.remark || ''} ${p.name || ''} ${p.group_name || ''}`.toLowerCase();
            let detectedStatut = 'Actif';
            if (combinedInfo.includes('pause')) {
                detectedStatut = 'Pause';
            } else if (combinedInfo.includes('attribuer') || combinedInfo.includes('non attribue') || combinedInfo.includes('a attribuer')) {
                detectedStatut = 'À attribuer';
            } else if (combinedInfo.includes('banni') || combinedInfo.includes('bloqué') || combinedInfo.includes('ban')) {
                detectedStatut = 'Banni';
            } else if (combinedInfo.includes('limité') || combinedInfo.includes('restreint') || combinedInfo.includes('limite')) {
                detectedStatut = 'Limité';
            }

            const existing = existingComptes.find(c => 
                (numProxy && String(c.numeroCompte) === numProxy) || 
                (c.pseudo && c.pseudo.toLowerCase() === pseudo.toLowerCase()) ||
                (c.adsPowerUserId && c.adsPowerUserId === p.user_id)
            );

            if (existing) {
                await dbService.updateCompte(existing.id, {
                    numeroCompte: numProxy || existing.numeroCompte,
                    pseudo: pseudo || existing.pseudo,
                    email: email || existing.email,
                    motDePasse: motDePasse || existing.motDePasse,
                    notes: notes || existing.notes,
                    adsPowerUserId: p.user_id,
                    statut: detectedStatut !== 'Actif' ? detectedStatut : existing.statut
                });
            } else {
                await dbService.createCompte({
                    organisationId: orgId,
                    numeroCompte: numProxy,
                    pseudo: pseudo,
                    telephone: '',
                    email: email,
                    motDePasse: motDePasse,
                    gereParInitiales: '',
                    agent: 'À attribuer',
                    lienProfil: '',
                    statut: detectedStatut,
                    dateStatutCompte: '',
                    dateCreation: new Date().toISOString().split('T')[0],
                    notes: notes,
                    adsPowerUserId: p.user_id
                });
            }
            importedCount++;
        }

        await dbService.logAction("AdsPower Synchro", `Importation directe de ${importedCount} profils AdsPower`, "Succès", orgId);
        const updatedComptes = await dbService.getComptes(orgId);
        res.json({ success: true, count: importedCount, comptes: updatedComptes });
    } catch (err) {
        res.status(500).json({ error: `Erreur lors de l'enregistrement des profils : ${err.message}` });
    }
});

app.get('/api/adspower/test', async (req, res) => {
    try {
        const apiUrl = req.query.apiUrl || 'http://127.0.0.1:50325';
        const apiKey = req.query.apiKey || '';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        let fetchUrl = `${apiUrl}/api/v1/user/list?page_size=1`;
        if (apiKey) fetchUrl += `&api_key=${encodeURIComponent(apiKey)}`;

        const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'api_key': apiKey } : {};
        const response = await fetch(fetchUrl, { signal: controller.signal, headers });
        clearTimeout(timeout);
        const data = await response.json();

        if (data.code === 0) {
            res.json({ connected: true, msg: "Connexion à AdsPower réussie !", count: data.data ? (data.data.total || (data.data.list ? data.data.list.length : 0)) : 0 });
        } else {
            res.status(400).json({ connected: false, error: data.msg || "Erreur de réponse AdsPower" });
        }
    } catch (err) {
        res.status(500).json({ connected: false, error: `Impossible de contacter AdsPower sur ${req.query.apiUrl || 'http://127.0.0.1:50325'} : ${err.message}` });
    }
});

app.post('/api/adspower/sync', async (req, res) => {
    try {
        const apiUrl = req.body.apiUrl || 'http://127.0.0.1:50325';
        const apiKey = req.body.apiKey || '';
        const orgId = req.body.organisationId || 'org_default';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        let fetchUrl = `${apiUrl}/api/v1/user/list?page_size=200`;
        if (apiKey) fetchUrl += `&api_key=${encodeURIComponent(apiKey)}`;

        const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'api_key': apiKey } : {};
        const response = await fetch(fetchUrl, { signal: controller.signal, headers });
        clearTimeout(timeout);
        const data = await response.json();

        if (data.code !== 0 || !data.data || !Array.isArray(data.data.list)) {
            return res.status(400).json({ error: data.msg || "Erreur lors de la récupération des profils AdsPower" });
        }

        const profiles = data.data.list;
        const existingComptes = await dbService.getComptes(orgId);
        let importedCount = 0;

        for (const p of profiles) {
            const numProxy = p.serial_number ? String(p.serial_number) : '';
            const pseudo = p.name ? String(p.name) : (numProxy ? `compte_${numProxy}` : `compte_${p.user_id}`);
            const email = p.username || p.email || '';
            const motDePasse = p.password || '';
            const notes = [p.remark, p.proxy ? `Proxy: ${p.proxy}` : ''].filter(Boolean).join(' | ');

            const combinedInfo = `${p.remark || ''} ${p.name || ''} ${p.group_name || ''}`.toLowerCase();
            let detectedStatut = 'Actif';
            if (combinedInfo.includes('pause')) {
                detectedStatut = 'Pause';
            } else if (combinedInfo.includes('attribuer') || combinedInfo.includes('non attribue') || combinedInfo.includes('a attribuer')) {
                detectedStatut = 'À attribuer';
            } else if (combinedInfo.includes('banni') || combinedInfo.includes('bloqué') || combinedInfo.includes('ban')) {
                detectedStatut = 'Banni';
            } else if (combinedInfo.includes('limité') || combinedInfo.includes('restreint') || combinedInfo.includes('limite')) {
                detectedStatut = 'Limité';
            }

            const existing = existingComptes.find(c => 
                (numProxy && String(c.numeroCompte) === numProxy) || 
                (c.pseudo && c.pseudo.toLowerCase() === pseudo.toLowerCase()) ||
                (c.adsPowerUserId && c.adsPowerUserId === p.user_id)
            );

            if (existing) {
                await dbService.updateCompte(existing.id, {
                    numeroCompte: numProxy || existing.numeroCompte,
                    pseudo: pseudo || existing.pseudo,
                    email: email || existing.email,
                    motDePasse: motDePasse || existing.motDePasse,
                    notes: notes || existing.notes,
                    adsPowerUserId: p.user_id,
                    statut: detectedStatut !== 'Actif' ? detectedStatut : existing.statut
                });
            } else {
                await dbService.createCompte({
                    organisationId: orgId,
                    numeroCompte: numProxy,
                    pseudo: pseudo,
                    telephone: '',
                    email: email,
                    motDePasse: motDePasse,
                    gereParInitiales: '',
                    agent: 'À attribuer',
                    lienProfil: '',
                    statut: detectedStatut,
                    dateStatutCompte: '',
                    dateCreation: new Date().toISOString().split('T')[0],
                    notes: notes,
                    adsPowerUserId: p.user_id
                });
            }
            importedCount++;
        }

        await dbService.logAction("AdsPower Synchro", `Synchronisation réussie de ${importedCount} profils AdsPower`, "Succès", orgId);
        const updatedComptes = await dbService.getComptes(orgId);
        res.json({ success: true, count: importedCount, comptes: updatedComptes });
    } catch (err) {
        res.status(500).json({ error: `Erreur lors de la synchronisation AdsPower : ${err.message}` });
    }
});

app.post('/api/adspower/start', async (req, res) => {
    try {
        const apiUrl = req.body.apiUrl || 'http://127.0.0.1:50325';
        const userId = req.body.userId;
        if (!userId) return res.status(400).json({ error: "userId (AdsPower profile ID) requis" });

        const response = await fetch(`${apiUrl}/api/v1/browser/start?user_id=${userId}`);
        const data = await response.json();

        if (data.code === 0) {
            await dbService.logAction("AdsPower Launch", `Lancement du profil AdsPower ${userId}`, "Succès");
            res.json({ success: true, data: data.data });
        } else {
            res.status(400).json({ error: data.msg || "Impossible d'ouvrir le navigateur AdsPower" });
        }
    } catch (err) {
        res.status(500).json({ error: `Erreur d'ouverture AdsPower : ${err.message}` });
    }
});

// ------------------- CALENDRIER -------------------
app.get('/api/calendrier', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const rows = await dbService.getCalendrier(orgId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calendrier', async (req, res) => {
    try {
        const orgId = req.body.organisationId || 'org_default';
        const params = await dbService.getParametres(orgId);
        const comptes = await dbService.getComptes(orgId);
        const firstCompte = comptes[0] || { id: '', agent: '' };

        const id = "ligne_" + Date.now() + Math.random().toString(36).substr(2, 5);
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const dateObj = new Date(date);
        const jourRaw = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
        const jour = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);

        const newLine = {
            id,
            organisationId: orgId,
            date,
            jour,
            compteId: req.body.compteId || firstCompte.id,
            agent: req.body.agent || firstCompte.agent,
            heurePrevue: req.body.heurePrevue || "12:00",
            sku: req.body.sku || "",
            produit: req.body.produit || "",
            lien: req.body.lien || "",
            vues: req.body.vues || 0,
            likes: req.body.likes || 0,
            favoris: req.body.favoris || 0,
            messages: req.body.messages || 0,
            vente: req.body.vente || 0,
            score: 0,
            classification: "À retester",
            statut: req.body.statut || "Non fait",
            dateStatut: null,
            heureStatut: null,
            nbVentesReposts: 0,
            heuresVentesReposts: [],
            prochainRepost: null
        };

        const allCal = await dbService.getCalendrier(orgId);
        newLine.score = calcScore(newLine, params);
        newLine.classification = getClassification(newLine, allCal, params);

        const created = await dbService.createCalendrierRow(newLine);
        await dbService.logAction("Calendrier", `Ajout manuel d'une ligne SKU ${newLine.sku}`, "Succès", orgId);
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/calendrier/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { field, value } = req.body;

        const current = await dbService.getCalendrierRowById(id);
        if (!current) return res.status(404).json({ error: "Ligne non trouvée" });

        const orgId = current.organisationId || 'org_default';
        const params = await dbService.getParametres(orgId);
        const updated = { ...current };

        if (field === 'compteId') {
            updated.compteId = value;
            const comptes = await dbService.getComptes(orgId);
            const targetCompte = comptes.find(c => c.id === value);
            if (targetCompte && targetCompte.agent && targetCompte.agent !== 'À attribuer') {
                updated.agent = targetCompte.agent;
            }
        } else if (field === 'agent') {
            const comptes = await dbService.getComptes(orgId);
            const targetCompte = comptes.find(c => c.id === updated.compteId);
            if (targetCompte && targetCompte.agent && targetCompte.agent !== 'À attribuer' && targetCompte.agent !== value) {
                return res.status(400).json({ error: `Attribution refusée : Le compte "${targetCompte.pseudo}" est officiellement attribué à ${targetCompte.agent} !` });
            }
            updated.agent = value;
        } else if (field === 'statut') {
            updated.statut = value;
            if (value === 'Fait') {
                updated.dateStatut = getLocalDateString();
                updated.heureStatut = new Date().toTimeString().split(' ')[0].substring(0, 5);
                await dbService.logAction("Statut Calendrier", `Ligne ${id} marquée comme Faite`, "Succès", orgId);
            }
        } else if (field === 'vente') {
            updated.vente = parseInt(value);
            if (updated.vente === 1) {
                updated.nbVentesReposts = (updated.nbVentesReposts || 0) + 1;
                const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
                if (!Array.isArray(updated.heuresVentesReposts)) updated.heuresVentesReposts = [];
                updated.heuresVentesReposts.push(now);
                const reposDate = new Date();
                reposDate.setMinutes(reposDate.getMinutes() + (params.delaiProchainRepostMinutes || 30));
                updated.prochainRepost = reposDate.toTimeString().split(' ')[0].substring(0, 5);
                await dbService.logAction("Vente détectée", `Vente enregistrée pour la ligne ${id}`, "Succès", orgId);
            }
        } else if (['vues', 'likes', 'favoris', 'messages'].includes(field)) {
            updated[field] = parseInt(value) || 0;
        } else {
            updated[field] = value;
        }

        const allCal = await dbService.getCalendrier(orgId);
        updated.score = calcScore(updated, params);
        updated.classification = getClassification(updated, allCal, params);

        const saved = await dbService.updateCalendrierRow(id, updated);

        // Verification SKU unique avertissement
        let warning = null;
        if (field === 'sku' && value && updated.classification !== 'Gagnant') {
            const allCal = await dbService.getCalendrier(orgId);
            const exists = allCal.find(row => row.sku === value && row.compteId !== updated.compteId && row.id !== id);
            if (exists) warning = `Attention: SKU ${value} déjà publié sur un autre compte!`;
        }

        res.json({ item: saved, warning });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/calendrier/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbService.deleteCalendrierRow(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- BULK CRUD OPERATIONS -------------------
app.post('/api/calendrier/bulk-update', async (req, res) => {
    try {
        const { ids, fields } = req.body;
        await dbService.bulkUpdateCalendrierRows(ids, fields);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calendrier/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await dbService.bulkDeleteCalendrierRows(ids);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comptes/bulk-update', async (req, res) => {
    try {
        const { ids, fields } = req.body;
        await dbService.bulkUpdateComptes(ids, fields);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comptes/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await dbService.bulkDeleteComptes(ids);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await dbService.bulkDeleteUtilisateurs(ids);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/incidents/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await dbService.bulkDeleteIncidents(ids);
        res.json({ success: true, count: ids ? ids.length : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

// Génération automatique du planning
app.post('/api/calendrier/generate', async (req, res) => {
    try {
        const orgId = req.body.organisationId || 'org_default';
        const params = (await dbService.getParametres(orgId)) || {};
        const comptes = await dbService.getComptes(orgId);
        const selectedAgents = req.body.selectedAgents;
        const selectedComptes = req.body.selectedComptes || req.body.selectedAccountIds;

        // Exclusivité stricte : Seuls les comptes au statut Actif ET attribués à un agent réel
        let activeComptes = getComptesActifsEtAttribues(comptes, selectedAgents);
        if (Array.isArray(selectedComptes) && selectedComptes.length > 0) {
            activeComptes = activeComptes.filter(c => selectedComptes.includes(c.id));
        }

        if (activeComptes.length === 0) {
            return res.status(400).json({ error: "Aucun compte au statut Actif et attribué à un agent sélectionné trouvé !" });
        }

        let datesList = [];
        if (req.body.dateDebut && req.body.dateFin) {
            let curr = new Date(req.body.dateDebut);
            let end = new Date(req.body.dateFin);
            if (!isNaN(curr.getTime()) && !isNaN(end.getTime())) {
                while (curr <= end) {
                    datesList.push(new Date(curr));
                    curr.setDate(curr.getDate() + 1);
                }
            }
        }
        if (datesList.length === 0) {
            const nbJours = parseInt(req.body.nbJours) || 7;
            const today = new Date();
            for (let i = 0; i < nbJours; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                datesList.push(d);
            }
        }

        const slotsPerAccount = req.body.creneauxParJour ? parseInt(req.body.creneauxParJour) : (params.creneauxParJour || 6);
        const margeAleatoireMin = params.margeAleatoireMinutes !== undefined 
            ? parseInt(params.margeAleatoireMinutes) 
            : (params.modePlanification === 'aleatoire' ? 10 : 5);

        // Plage horaire globale personnalisable (ex: 07:00 à 22:00)
        const startHourStr = req.body.heureDebut || "07:00";
        const endHourStr = req.body.heureFin || "22:00";
        const [startH, startM] = startHourStr.split(':').map(Number);
        const [endH, endM] = endHourStr.split(':').map(Number);

        const startHourMin = (isNaN(startH) ? 7 : startH) * 60 + (isNaN(startM) ? 0 : startM);
        const endHourMin = (isNaN(endH) ? 22 : endH) * 60 + (isNaN(endM) ? 0 : endM);
        const windowDurationMin = Math.max(60, endHourMin - startHourMin);

        const includeWinnerSKUs = req.body.includeWinnerSKUs !== false;

        // Récupération de l'historique pour extraire les SKU Gagnants et l'historique par compte
        const existingCal = await dbService.getCalendrier(orgId);
        const winnerSKUsMap = {};
        const accountPublishedSKUs = {};

        existingCal.forEach(l => {
            if (!l.compteId) return;
            if (!accountPublishedSKUs[l.compteId]) {
                accountPublishedSKUs[l.compteId] = new Set();
            }
            if (l.sku && String(l.sku).trim() !== '') {
                accountPublishedSKUs[l.compteId].add(String(l.sku).trim());
            }
            if (includeWinnerSKUs && l.classification === 'Gagnant' && l.sku && String(l.sku).trim() !== '') {
                const cleanSku = String(l.sku).trim();
                winnerSKUsMap[cleanSku] = {
                    sku: cleanSku,
                    produit: l.produit || '',
                    classification: 'Gagnant'
                };
            }
        });

        const winnerSKUsList = includeWinnerSKUs ? Object.values(winnerSKUsMap) : [];

        // Suivi local des SKU attribués par compte pendant cette session de génération (anti-doublon)
        const accountSessionSKUs = {};
        activeComptes.forEach(c => {
            accountSessionSKUs[c.id] = new Set(accountPublishedSKUs[c.id] || []);
        });

        let generated = 0;
        let winnersAssignedCount = 0;

        for (const dateObj of datesList) {
            const dateStr = getLocalDateString(dateObj);
            const jourRaw = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
            const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);

            const intervalPerSlot = windowDurationMin / Math.max(1, slotsPerAccount);

            for (let c = 0; c < activeComptes.length; c++) {
                const compte = activeComptes[c];
                // Décalage de 5 minutes entre comptes pour étaler les publications
                const accountStaggerMin = (c * 5) % 30;

                // Trouver les SKU Gagnants non encore attribués à ce compte (Anti-Doublon stricte par compte)
                const availableWinnerSKUs = winnerSKUsList.filter(w => !accountSessionSKUs[compte.id].has(w.sku));
                let winnerIdx = 0;

                for (let s = 0; s < slotsPerAccount; s++) {
                    // Calcul de l'heure cible
                    let targetMinutes = startHourMin + Math.round(s * intervalPerSlot) + accountStaggerMin;

                    // Marge aléatoire discrète (± N minutes) pour un rendu naturel
                    if (margeAleatoireMin > 0) {
                        const offset = Math.floor(Math.random() * (2 * margeAleatoireMin + 1)) - margeAleatoireMin;
                        targetMinutes += offset;
                    }

                    // Bornage entre 06:30 (390 min) et 23:30 (1410 min)
                    targetMinutes = Math.max(390, Math.min(1410, targetMinutes));

                    const hStr = String(Math.floor(targetMinutes / 60)).padStart(2, '0');
                    const mStr = String(targetMinutes % 60).padStart(2, '0');
                    const chosenHour = `${hStr}:${mStr}`;

                    // Auto-assignation d'un SKU Gagnant disponible si présent
                    let assignedSku = "";
                    let assignedProduit = "";
                    let assignedClassif = "Nouveau produit";

                    if (winnerIdx < availableWinnerSKUs.length) {
                        const wObj = availableWinnerSKUs[winnerIdx];
                        assignedSku = wObj.sku;
                        assignedProduit = wObj.produit;
                        assignedClassif = "Gagnant";
                        accountSessionSKUs[compte.id].add(wObj.sku);
                        winnerIdx++;
                        winnersAssignedCount++;
                    }

                    const id = "ligne_" + Date.now() + Math.random().toString(36).substr(2, 5);
                    await dbService.createCalendrierRow({
                        id,
                        organisationId: orgId,
                        date: dateStr,
                        jour: jourCap,
                        compteId: compte.id,
                        agent: compte.agent,
                        heurePrevue: chosenHour,
                        sku: assignedSku,
                        produit: assignedProduit,
                        lien: "",
                        vues: 0,
                        likes: 0,
                        favoris: 0,
                        messages: 0,
                        vente: 0,
                        score: 0,
                        classification: assignedClassif,
                        statut: "Non fait",
                        dateStatut: null,
                        heureStatut: null,
                        nbVentesReposts: 0,
                        heuresVentesReposts: [],
                        prochainRepost: null
                    });
                    generated++;
                }
            }
        }

        const dateStartStr = datesList[0].toISOString().split('T')[0];
        const dateEndStr = datesList[datesList.length - 1].toISOString().split('T')[0];

        await dbService.logAction("Génération planning", `${generated} lignes générées (${winnersAssignedCount} SKU Gagnants répartis sans doublon) pour ${datesList.length} jours et ${activeComptes.length} comptes (${slotsPerAccount} pub/compte/jour, du ${dateStartStr} au ${dateEndStr})`, "Succès", orgId);
        res.json({ message: `${generated} lignes de planning générées avec succès (${winnersAssignedCount} SKU Gagnants attribués sans aucun doublon par compte) !`, generated, winnersAssignedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Publication produit gagnant sur tous les comptes actifs sans ce SKU
app.post('/api/calendrier/publish-winner', async (req, res) => {
    try {
        const { sku, organisationId } = req.body;
        const orgId = organisationId || 'org_default';
        if (!sku) return res.status(400).json({ error: "SKU requis" });

        const comptes = await dbService.getComptes(orgId);
        const activeComptes = comptes.filter(c => c.statut === 'Actif');
        const dateStr = new Date().toISOString().split('T')[0];
        const jourRaw = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
        const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);
        let added = 0;
        const allCal = await dbService.getCalendrier(orgId);

        for (const c of activeComptes) {
            const dejaPublie = allCal.find(row => row.compteId === c.id && row.sku === sku);
            if (!dejaPublie) {
                const id = "ligne_" + Date.now() + Math.random().toString(36).substr(2, 5);
                await dbService.createCalendrierRow({
                    id,
                    organisationId: orgId,
                    date: dateStr,
                    jour: jourCap,
                    compteId: c.id,
                    agent: c.agent,
                    heurePrevue: "12:00",
                    sku,
                    produit: "REPOST GAGNANT",
                    lien: "",
                    vues: 0,
                    likes: 0,
                    favoris: 0,
                    messages: 0,
                    vente: 0,
                    score: 0,
                    classification: "À retester",
                    statut: "Non fait",
                    dateStatut: null,
                    heureStatut: null,
                    nbVentesReposts: 0,
                    heuresVentesReposts: [],
                    prochainRepost: null
                });
                added++;
            }
        }

        await dbService.logAction("Suggestion Gagnant", `SKU ${sku} publié sur ${added} comptes`, "Succès", orgId);
        res.json({ message: `${added} lignes ajoutées au calendrier pour le SKU ${sku}`, added });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- INCIDENTS -------------------
app.get('/api/incidents', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const rows = await dbService.getIncidents(orgId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/incidents', async (req, res) => {
    try {
        const { compteId, type, dateHeure, organisationId, nbAnnoncesMasquees, skuAnnoncesMasquees } = req.body;
        const orgId = organisationId || 'org_default';
        if (!compteId || !dateHeure) return res.status(400).json({ error: "Compte et Date/Heure requis" });

        const [date, heure] = dateHeure.split('T');
        const comptes = await dbService.getComptes(orgId);
        const compte = comptes.find(c => c.id === compteId);
        if (!compte) return res.status(404).json({ error: "Compte non trouvé" });

        // Calcul des publications dans les dernières 24h
        const dateIncident = new Date(dateHeure);
        const allCal = await dbService.getCalendrier(orgId);
        const pubs24h = allCal.filter(l => {
            if (l.compteId !== compteId) return false;
            const timeSlot = new Date(`${l.date}T${l.heurePrevue}`);
            return timeSlot >= new Date(dateIncident.getTime() - 86400000) && timeSlot <= dateIncident;
        });

        const ventes24h = pubs24h.filter(p => p.vente === 1).map(p => p.sku || 'N/A');
        const heuresPubs24h = pubs24h.map(p => p.heurePrevue);

        const id = "inc_" + Date.now();
        await dbService.createIncident({
            id,
            organisationId: orgId,
            compteId,
            dateBlocage: date,
            heureBlocage: heure,
            type,
            nbPubs24h: pubs24h.length,
            heuresPubs24h,
            nbVentesConnues: ventes24h.length,
            detailVentes: ventes24h,
            nbAnnoncesMasquees: parseInt(nbAnnoncesMasquees) || 0,
            skuAnnoncesMasquees: skuAnnoncesMasquees || ''
        });

        // Mise à jour du statut du compte
        const nouveauStatut = (type === 'Ban définitif') ? 'Banni' : 'Limité';
        await dbService.updateCompte(compteId, { statut: nouveauStatut });

        await dbService.logAction("Incident", `Incident ${type} enregistré pour le compte ${compte.pseudo}`, "Succès", orgId);
        res.json({ success: true, id, nouveauStatut });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- PARAMETRES -------------------
app.get('/api/parametres', async (req, res) => {
    try {
        const orgId = req.query.organisationId || 'org_default';
        const params = await dbService.getParametres(orgId);
        res.json(params);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/parametres', async (req, res) => {
    try {
        const newParams = req.body;
        const orgId = req.query.organisationId || 'org_default';
        await dbService.saveParametres(newParams, orgId);

        // Recalculer tous les scores et classifications dans la base pour cette organisation
        const rows = await dbService.getCalendrier(orgId);
        for (const row of rows) {
            const score = calcScore(row, newParams);
            const classification = getClassification(score, row.vente, newParams);
            await dbService.updateCalendrierRow(row.id, { score, classification });
        }

        await dbService.logAction("Paramètres", "Mise à jour des paramètres et recalcul général des scores", "Succès", orgId);
        res.json({ message: "Paramètres mis à jour et scores recalculés", parametres: newParams });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- JOURNAL -------------------
app.get('/api/journal', async (req, res) => {
    try {
        const orgId = req.query.organisationId || null;
        const rows = await dbService.getJournal(orgId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------- CHROME EXTENSION SYNC -------------------
app.get('/api/extension/sync', (req, res) => {
    res.json({
        status: "online",
        endpoint: "POST /api/extension/sync",
        message: "Endpoint de synchronisation Vinted Manager actif. Envoyez des requêtes POST depuis l'extension Chrome."
    });
});

app.post('/api/extension/sync', async (req, res) => {
    try {
        const { pseudo, organisationId, vues, likes, favoris, messages, ventes, items } = req.body;
        const orgId = organisationId || 'org_default';

        if (!pseudo) {
            return res.status(400).json({ error: "Pseudo Vinted requis pour la synchronisation" });
        }

        const comptes = await dbService.getComptes(orgId);
        let compte = comptes.find(c => c.pseudo.toLowerCase() === pseudo.toLowerCase());
        if (!compte) {
            const newCompteId = "cmp_" + Date.now();
            compte = await dbService.createCompte({
                id: newCompteId,
                organisationId: orgId,
                pseudo,
                agent: 'Extension Chrome',
                statut: 'Actif',
                dateCreation: new Date().toISOString().split('T')[0],
                notes: 'Créé automatiquement via Extension Chrome'
            });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const allCal = await dbService.getCalendrier(orgId);
        const accountLines = allCal.filter(l => l.compteId === compte.id && (l.date === todayStr || l.statut === 'Non fait'));

        const countVues = parseInt(vues) || 0;
        const countLikes = parseInt(likes || favoris) || 0;
        const countMessages = parseInt(messages) || 0;
        const countVentes = parseInt(ventes) || 0;

        let updatedCount = 0;
        let createdCount = 0;
        const params = await dbService.getParametres(orgId);

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (!item.title && !item.sku) continue;
                const matchLine = accountLines.find(l => 
                    (item.sku && l.sku && l.sku.toLowerCase() === item.sku.toLowerCase()) ||
                    (item.title && l.produit && l.produit.toLowerCase().includes(item.title.toLowerCase()))
                );

                const itemVues = parseInt(item.vues) || countVues;
                const itemLikes = parseInt(item.likes) || countLikes;
                const itemVente = (item.statut === 'vendu' || countVentes > 0) ? 1 : 0;
                const itemSKU = item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

                const score = calcScore({ vues: itemVues, likes: itemLikes, favoris: itemLikes, messages: countMessages, vente: itemVente }, params);
                const classif = getClassification(score, itemVente, params);

                if (matchLine) {
                    await dbService.updateCalendrierRow(matchLine.id, {
                        sku: itemSKU,
                        produit: item.title || matchLine.produit,
                        vues: Math.max(matchLine.vues || 0, itemVues),
                        likes: Math.max(matchLine.likes || 0, itemLikes),
                        favoris: Math.max(matchLine.favoris || 0, itemLikes),
                        messages: countMessages,
                        vente: Math.max(matchLine.vente || 0, itemVente),
                        score,
                        classification: classif
                    });
                    updatedCount++;
                } else {
                    const jourRaw = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
                    const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);
                    const lineId = "ligne_" + Date.now() + Math.random().toString(36).substr(2, 5);

                    await dbService.createCalendrierRow({
                        id: lineId,
                        organisationId: orgId,
                        date: todayStr,
                        jour: jourCap,
                        compteId: compte.id,
                        agent: compte.agent || 'Extension Chrome',
                        heurePrevue: "12:00",
                        sku: itemSKU,
                        produit: item.title || "Article Vinted",
                        lien: "",
                        vues: itemVues,
                        likes: itemLikes,
                        favoris: itemLikes,
                        messages: countMessages,
                        vente: itemVente,
                        score,
                        classification: classif,
                        statut: item.statut === 'masqué' ? 'Non fait' : (item.statut === 'brouillon' ? 'Non fait' : 'Fait'),
                        dateStatut: null,
                        heureStatut: null
                    });
                    createdCount++;
                }
            }
        } else if (accountLines.length > 0) {
            for (const line of accountLines) {
                const newVues = Math.max(line.vues || 0, countVues);
                const newLikes = Math.max(line.likes || 0, countLikes);
                const newMessages = Math.max(line.messages || 0, countMessages);
                const newVente = countVentes > 0 ? 1 : line.vente;

                const score = calcScore({ vues: newVues, likes: newLikes, favoris: newLikes, messages: newMessages, vente: newVente }, params);
                const classif = getClassification(score, newVente, params);

                await dbService.updateCalendrierRow(line.id, {
                    vues: newVues,
                    likes: newLikes,
                    favoris: newLikes,
                    messages: newMessages,
                    vente: newVente,
                    score,
                    classification: classif
                });
                updatedCount++;
            }
        }

        const totalItemsCount = Array.isArray(items) ? items.length : 0;
        await dbService.logAction("Extension Sync", `Synchronisation Chrome complète pour @${pseudo} (${totalItemsCount} articles : ${createdCount} créés, ${updatedCount} mis à jour)`, "Succès", orgId);
        res.json({
            success: true,
            pseudo,
            compteId: compte.id,
            updatedRows: updatedCount,
            createdRows: createdCount,
            totalArticles: totalItemsCount,
            message: `Synchronisation réussie pour ${pseudo} (${totalItemsCount} articles traités)`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SPA Fallback Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`================================================`);
        console.log(`  Vinted Manager Server running on port ${PORT}`);
        console.log(`  Moteur de base de données : Supabase (Cloud)`);
        console.log(`  Architecture : Multi-Organisation (Multi-Tenancy)`);
        console.log(`  Gestion des rôles : Admin, Cadre, Agent`);
        console.log(`  Local URL: http://localhost:${PORT}`);
        console.log(`================================================`);
    });
}

module.exports = app;

