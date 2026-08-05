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
function calcScore(item, params) {
    const p = params.poidsScore || { vues: 0.1, likes: 1, favoris: 2, messages: 5, vente: 20 };
    const favCount = (item.favoris || 0) + (item.likes || 0);
    const weightFav = p.favoris || p.likes || 2.0;
    return (item.vues || 0) * (p.vues || 0) +
        favCount * weightFav +
        (item.messages || 0) * (p.messages || 0) +
        (item.vente || 0) * (p.vente || 0);
}

function getClassification(score, vente, params) {
    const s = params.seuils || { ecarte: 15, gagnant: 40 };
    if (vente === 1 || score >= s.gagnant) return "Gagnant";
    if (score < s.ecarte) return "Écarté";
    return "À retester";
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

        res.json({ organisations, parametres, utilisateurs, comptes, calendrier, incidents, journal });
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
        const { email, motDePasse, role } = req.body;
        const users = await dbService.getUtilisateurs();
        
        let found = null;
        const loginInput = (email || '').trim().toLowerCase();
        if (loginInput && motDePasse) {
            found = users.find(u => 
                ((u.email && u.email.toLowerCase() === loginInput) ||
                 (u.nom && u.nom.toLowerCase() === loginInput)) &&
                u.motDePasse === motDePasse
            );
        } else if (role) {
            if (role === 'admin_florencio') {
                found = users.find(u => u.email === 'florencio@vintedmanager.com') || users.find(u => u.role === 'admin');
            } else if (role === 'cadre_paris') {
                found = users.find(u => u.email === 'sophie.paris@vintedmanager.com') || users.find(u => u.role === 'cadre');
            } else if (role === 'agent_paris') {
                found = users.find(u => u.email === 'lucas.paris@vintedmanager.com') || users.find(u => u.role === 'agent');
            } else {
                found = users.find(u => u.role === role);
            }
        }

        if (!found) {
            return res.status(401).json({ error: "Identifiants ou rôle invalide" });
        }

        await dbService.logAction("Authentification", `Connexion de ${found.nom} (${found.role})`, "Succès", found.organisationId || 'org_default');
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
        const { pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId } = req.body;
        const id = "compte_" + Date.now();
        const newCompte = {
            id,
            organisationId: organisationId || 'org_default',
            pseudo,
            agent,
            lienProfil: lienProfil || '',
            statut: statut || 'Actif',
            dateCreation: dateCreation || new Date().toISOString().split('T')[0],
            notes: notes || ''
        };
        const created = await dbService.createCompte(newCompte);
        await dbService.logAction("Gestion Compte", `Création du compte ${pseudo}`, "Succès", newCompte.organisationId);
        res.json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/comptes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId } = req.body;
        const updated = await dbService.updateCompte(id, { pseudo, agent, lienProfil, statut, dateCreation, notes, organisationId });
        await dbService.logAction("Gestion Compte", `Modification du compte ${pseudo}`, "Succès", organisationId || 'org_default');
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

        newLine.score = calcScore(newLine, params);
        newLine.classification = getClassification(newLine.score, newLine.vente, params);

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

        if (field === 'statut') {
            updated.statut = value;
            if (value === 'Fait') {
                updated.dateStatut = new Date().toISOString().split('T')[0];
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

        // Recalcul du score et classification
        updated.score = calcScore(updated, params);
        updated.classification = getClassification(updated.score, updated.vente, params);

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

// Génération automatique du planning
app.post('/api/calendrier/generate', async (req, res) => {
    try {
        const nbJours = parseInt(req.body.nbJours) || 7;
        const orgId = req.body.organisationId || 'org_default';
        const params = await dbService.getParametres(orgId);
        const comptes = await dbService.getComptes(orgId);
        const activeComptes = comptes.filter(c => c.statut === 'Actif');

        if (activeComptes.length === 0) {
            return res.status(400).json({ error: "Aucun compte actif !" });
        }

        const allHours = [...params.heuresParPeriode.matin, ...params.heuresParPeriode.midi, ...params.heuresParPeriode.soir];
        const decalageMs = (params.decalageMinutesEntreComptes || 60) * 60000;
        const margeAleatoireMin = params.margeAleatoireMinutes !== undefined 
            ? parseInt(params.margeAleatoireMinutes) 
            : (params.modePlanification === 'aleatoire' ? 15 : 0);

        let generated = 0;
        const today = new Date();
        const existingAll = await dbService.getCalendrier(orgId);

        for (let i = 0; i < nbJours; i++) {
            const dateObj = new Date(today);
            dateObj.setDate(today.getDate() + i);
            const dateStr = dateObj.toISOString().split('T')[0];
            const jourRaw = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
            const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);

            const existingSlots = existingAll.filter(l => l.date === dateStr);
            const usedSlotsToday = existingSlots.map(l => new Date(`${dateStr}T${l.heurePrevue}:00`).getTime());

            let compteIndex = 0;
            for (let s = 0; s < (params.creneauxParJour || 3); s++) {
                for (let c = 0; c < activeComptes.length; c++) {
                    const compte = activeComptes[(compteIndex + c) % activeComptes.length];

                    let chosenHour = null;
                    for (const hour of allHours) {
                        const maxAttempts = (margeAleatoireMin > 0) ? 6 : 1;
                        for (let att = 0; att < maxAttempts; att++) {
                            let candidateHour = hour;
                            if (margeAleatoireMin > 0) {
                                const randomOffsetMin = Math.floor(Math.random() * (2 * margeAleatoireMin + 1)) - margeAleatoireMin;
                                const baseDate = new Date(`${dateStr}T${hour}:00`);
                                baseDate.setMinutes(baseDate.getMinutes() + randomOffsetMin);
                                const hStr = String(baseDate.getHours()).padStart(2, '0');
                                const mStr = String(baseDate.getMinutes()).padStart(2, '0');
                                candidateHour = `${hStr}:${mStr}`;
                            }

                            const timeMs = new Date(`${dateStr}T${candidateHour}:00`).getTime();
                            const isFree = (params.modePlanification === 'fixe')
                                ? usedSlotsToday.every(used => timeMs !== used)
                                : usedSlotsToday.every(used => Math.abs(timeMs - used) >= decalageMs);

                            if (isFree) {
                                chosenHour = candidateHour;
                                usedSlotsToday.push(timeMs);
                                break;
                            }
                        }

                        if (chosenHour) break;
                    }

                    if (chosenHour) {
                        const id = "ligne_" + Date.now() + Math.random().toString(36).substr(2, 5);
                        await dbService.createCalendrierRow({
                            id,
                            organisationId: orgId,
                            date: dateStr,
                            jour: jourCap,
                            compteId: compte.id,
                            agent: compte.agent,
                            heurePrevue: chosenHour,
                            sku: "",
                            produit: "",
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
                        generated++;
                    }
                }
                compteIndex++;
            }
        }

        await dbService.logAction("Génération planning", `${generated} lignes générées pour ${nbJours} jours`, "Succès", orgId);
        res.json({ message: `${generated} lignes de planning générées avec succès !`, generated });
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
        const params = await dbService.getParametres(orgId);

        if (accountLines.length > 0) {
            for (const line of accountLines) {
                const newVues = Math.max(line.vues || 0, countVues);
                const newLikes = Math.max(line.likes || 0, countLikes);
                const newMessages = Math.max(line.messages || 0, countMessages);
                const newVente = countVentes > 0 ? 1 : line.vente;

                const score = calculateScore({ vues: newVues, likes: newLikes, favoris: newLikes, messages: newMessages, vente: newVente }, params.poidsScore);
                const classif = classifyScore(score, params.seuils);

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

        await dbService.logAction("Extension Sync", `Synchronisation Chrome pour @${pseudo} (${countVues} vues, ${countLikes} likes, ${countVentes} ventes)`, "Succès", orgId);
        res.json({
            success: true,
            pseudo,
            compteId: compte.id,
            updatedRows: updatedCount,
            message: `Synchronisation réussie pour ${pseudo}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`  Vinted Manager Server running on port ${PORT}`);
    console.log(`  Moteur de base de données : Supabase (Cloud)`);
    console.log(`  Architecture : Multi-Organisation (Multi-Tenancy)`);
    console.log(`  Gestion des rôles : Admin, Cadre, Agent`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`================================================`);
});
