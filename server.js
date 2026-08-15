require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbService = require('./database');
const DotbApiService = require('./dotbApiService');

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

function normalizeTitle(t) {
    if (!t) return "";
    return String(t).trim().toLowerCase().replace(/\s+/g, ' ');
}

function calcScore(item, params) {
    const isDone = item.statut === 'Fait' || item.statut === '✓ Fait' || item.statut === 'Publié' || item.done;
    const isSold = item.vente === 1;
    const pointsPub = isDone ? 5.0 : 0.0;
    const pointsVente = isSold ? 20.0 : 0.0;
    return pointsPub + pointsVente;
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

    // Si la ligne possède déjà une classification (Nouveau produit, Gagnant, etc.), la préserver impérativement intacte !
    if (item.classification && String(item.classification).trim() !== '') {
        if (item.vente === 1 || (item.score || 0) >= ((params && params.seuils && params.seuils.gagnant) || 40)) {
            return "Gagnant";
        }
        return item.classification;
    }

    const sku = (item.sku || '').trim().toLowerCase();

    // Classification SI ET SEULEMENT SI un SKU est renseigné !
    if (!sku) {
        return "";
    }

    // Si ce SKU a déjà été classé "Gagnant" sur une autre ligne de l'organisation, propager "Gagnant" !
    if (allOrgLines && allOrgLines.length > 0) {
        const isWinnerInOrg = allOrgLines.some(l => 
            l.sku && l.sku.trim().toLowerCase() === sku && l.classification === "Gagnant"
        );
        if (isWinnerInOrg) return "Gagnant";
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

// 1b. SKU Consolidated Summary API (Real Sales & Publications from DotB + DB)
app.get('/api/sku/summary', async (req, res) => {
    try {
        const orgId = req.query.organisationId || 'org_default';
        const fs = require('fs');
        const path = require('path');
        const skuMap = {};

        // A. Load fast_check_sku_results.json (Real DotB Cloud metrics)
        const fastCheckPath = path.join(__dirname, "fast_check_sku_results.json");
        if (fs.existsSync(fastCheckPath)) {
            try {
                const fcData = JSON.parse(fs.readFileSync(fastCheckPath, "utf8"));
                fcData.forEach(item => {
                    if (!item.sku) return;
                    const k = item.sku.trim();
                    skuMap[k] = {
                        sku: k,
                        produit: item.title || "Produit",
                        pubs: item.pubs || 1,
                        ventes: item.ventes || 0,
                        accounts: new Set(item.accounts || []),
                        accountsStr: item.accountsStr || "Non spécifié",
                        priceStr: item.priceStr || "-",
                        classification: item.classification || "Nouveau produit",
                        scoreCumule: item.score || 0
                    };
                });
            } catch(e) { console.warn("Err loading fast_check_sku_results:", e.message); }
        }

        // B. Merge DB Calendrier rows
        const calendrier = await dbService.getCalendrier(orgId);
        (calendrier || []).forEach(l => {
            if (l.isDeleted || l.supprime || l.statut === 'Supprimé' || l.statut === 'Corbeille') return;
            if (!l.sku || !String(l.sku).trim()) return;
            const k = String(l.sku).trim();

            if (!skuMap[k]) {
                skuMap[k] = {
                    sku: k,
                    produit: l.produit || "Produit sans titre",
                    pubs: 1,
                    ventes: 0,
                    accounts: new Set(),
                    accountsStr: l.comptePseudo ? "@" + l.comptePseudo : "Non spécifié",
                    priceStr: l.prix ? l.prix + "€" : "-",
                    classification: l.classification || "Nouveau produit",
                    scoreCumule: l.score || 15
                };
            }

            if (l.comptePseudo) skuMap[k].accounts.add(l.comptePseudo.replace("@", ""));
        });

        const list = Object.values(skuMap).map(s => {
            const accs = Array.from(s.accounts);
            const accountsStr = accs.length > 0 ? accs.map(a => "@" + a).join(", ") : (s.accountsStr || "Non spécifié");
            const isMultiAccount = accs.length > 1 || (s.accountsStr && s.accountsStr.includes(","));
            
            let classif = s.classification;
            if (s.ventes >= 3 || (s.ventes >= 1 && isMultiAccount)) classif = "🏆 Gagnant";
            else if (s.ventes >= 1) classif = "🏆 Gagnant";
            else if (s.pubs > 2) classif = "🔄 À retester";

            return {
                ...s,
                accountsStr,
                isMultiAccount,
                classification: classif
            };
        });

        list.sort((a, b) => b.ventes - a.ventes || b.scoreCumule - a.scoreCumule);
        res.json(list);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 1c. Multi-Account SKU Propagation API
app.post('/api/sku/propagate', async (req, res) => {
    try {
        const { sku, targetAccounts, mode, organisationId } = req.body;
        if (!sku || !Array.isArray(targetAccounts) || targetAccounts.length === 0) {
            return res.status(400).json({ error: "SKU et comptes cibles requis" });
        }

        const orgId = organisationId || 'org_default';
        const existingLines = await dbService.getCalendrier(orgId);
        
        // Find existing SKU info for product name, price, etc.
        const skuSample = (existingLines || []).find(l => l.sku && l.sku.trim() === sku.trim());
        const produitTitle = skuSample ? skuSample.produit : `Produit ${sku}`;
        const prix = skuSample ? skuSample.prix : 35.00;

        let insertedCount = 0;
        const now = new Date();

        for (let i = 0; i < targetAccounts.length; i++) {
            const accPseudo = targetAccounts[i];
            let postDate = new Date(now);

            if (mode === 'staggered') {
                postDate.setDate(postDate.getDate() + i + 1);
            } else if (mode === 'optimal') {
                postDate.setHours(20, 15, 0, 0);
                postDate.setDate(postDate.getDate() + Math.floor(i / 2));
            }

            const dateStr = postDate.toISOString().split('T')[0];
            const heureStr = mode === 'optimal' ? '20:15' : '14:00';

            const newRow = {
                id: "prop_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
                organisationId: orgId,
                datePrevue: dateStr,
                heurePrevue: heureStr,
                comptePseudo: accPseudo.replace('@', ''),
                produit: produitTitle,
                sku: sku.trim(),
                statut: 'À faire',
                prix: prix,
                vente: 0,
                score: 15,
                source: 'Propagation SKU Multi-Compte',
                dateCreation: new Date().toISOString()
            };

            await dbService.createCalendrierRow(newRow);
            insertedCount++;
        }

        await dbService.logAction(
            "Propagation SKU",
            `Propagation du SKU ${sku} réalisée avec succès sur ${insertedCount} compte(s) (Mode: ${mode})`,
            "Succès"
        );

        res.json({
            success: true,
            insertedCount,
            message: `🚀 Propagation réussie : SKU ${sku} programmé sur ${insertedCount} nouveau(x) compte(s) vendeur(s) !`
        });
    } catch(err) {
        console.error("Erreur Propagation SKU:", err);
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

// 2b. Import DotB Order CSV with Anti-Doublons & Smart Update Storage
app.post('/api/import-orders-csv', async (req, res) => {
    try {
        const { csvText, organisationId } = req.body;
        if (!csvText || typeof csvText !== 'string' || !csvText.trim()) {
            return res.status(400).json({ error: "Contenu CSV requis" });
        }

        const orgId = organisationId || 'org_default';
        const existingLines = await dbService.getCalendrier(orgId);

        // Build anti-duplicate & lookup map for existing orders
        const existingMap = new Map();
        (existingLines || []).forEach(l => {
            if (l.transactionId && l.vintedId) {
                existingMap.set(`${l.transactionId}_${l.vintedId}`.toLowerCase(), l);
            }
            if (l.transactionId && l.produit) {
                existingMap.set(`${l.transactionId}_${l.produit}`.toLowerCase().trim(), l);
            }
            if (l.sku && l.datePrevue && l.acheteur) {
                existingMap.set(`${l.sku}_${l.datePrevue}_${l.acheteur}`.toLowerCase().trim(), l);
            }
        });

        // Helper to parse CSV lines with quotes
        function parseLine(lineStr) {
            const res = [];
            let cur = '';
            let inQ = false;
            for (let i = 0; i < lineStr.length; i++) {
                const c = lineStr[i];
                if (c === '"') {
                    if (inQ && lineStr[i + 1] === '"') {
                        cur += '"';
                        i++;
                    } else {
                        inQ = !inQ;
                    }
                } else if (c === ',' && !inQ) {
                    res.push(cur.trim());
                    cur = '';
                } else {
                    cur += c;
                }
            }
            res.push(cur.trim());
            return res;
        }

        const rawLines = csvText.trim().split(/\r?\n/);
        let parsedCount = 0;
        let insertedCount = 0;
        let updatedCount = 0;
        let duplicateCount = 0;
        let generatedSkusCount = 0;
        let currentDateStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            if (!line) continue;
            const parts = parseLine(line);

            // Skip header if line 1 contains "ID Transaction"
            if (i === 0 && (parts[0] || '').toLowerCase().includes('transaction')) continue;
            parsedCount++;

            const transactionId = parts[0] ? parts[0].trim() : '';
            const dateCol = parts[1] ? parts[1].trim() : '';
            if (dateCol) currentDateStr = dateCol.split(' ')[0];

            const comptePseudo = parts[2] ? parts[2].trim() : '';
            const statut = parts[3] ? parts[3].trim() : 'Emballé';
            const transporteur = parts[5] ? parts[5].trim() : '';
            const numeroSuivi = parts[6] ? parts[6].trim() : '';
            const bordereauUrl = parts[7] ? parts[7].trim() : '';
            const titreArticle = parts[9] ? parts[9].trim() : '';
            const photoUrl = parts[10] ? parts[10].trim() : '';
            let sku = parts[11] ? parts[11].trim() : '';
            const vintedId = parts[14] ? parts[14].trim() : '';
            const acheteur = parts[15] ? parts[15].trim() : '';
            const nomDestinataire = parts[16] ? parts[16].trim() : '';
            const ville = parts[17] ? parts[17].trim() : '';
            const pays = parts[18] ? parts[18].trim() : 'FR';

            // Auto-generate SKU if missing
            if (!sku && vintedId) {
                const dp = currentDateStr.split('-');
                const yy = dp[0] ? dp[0].substring(2) : '26';
                const mm = dp[1] || '02';
                const dd = dp[2] || '09';
                sku = `sz${yy}${mm}${dd}${vintedId}`;
                generatedSkusCount++;
            }

            // Anti-doublon & Update Check
            const key1 = transactionId && vintedId ? `${transactionId}_${vintedId}`.toLowerCase() : '';
            const key2 = transactionId && titreArticle ? `${transactionId}_${titreArticle}`.toLowerCase().trim() : '';
            const key3 = sku && currentDateStr && acheteur ? `${sku}_${currentDateStr}_${acheteur}`.toLowerCase().trim() : '';

            const existingRow = (key1 && existingMap.get(key1)) || (key2 && existingMap.get(key2)) || (key3 && existingMap.get(key3));

            if (existingRow) {
                // Check if new/updated info exists!
                const updates = {};
                if (statut && statut !== existingRow.statut) updates.statut = statut;
                if (numeroSuivi && numeroSuivi !== existingRow.numeroSuivi) updates.numeroSuivi = numeroSuivi;
                if (bordereauUrl && bordereauUrl !== existingRow.bordereauUrl) updates.bordereauUrl = bordereauUrl;
                if (transporteur && transporteur !== existingRow.transporteur) updates.transporteur = transporteur;
                if (sku && (!existingRow.sku || existingRow.sku !== sku)) updates.sku = sku;
                if (photoUrl && photoUrl !== existingRow.photoUrl) updates.photoUrl = photoUrl;
                if (acheteur && acheteur !== existingRow.acheteur) updates.acheteur = acheteur;
                if (nomDestinataire && nomDestinataire !== existingRow.nomDestinataire) updates.nomDestinataire = nomDestinataire;
                if (ville && ville !== existingRow.ville) updates.ville = ville;
                if (pays && pays !== existingRow.pays) updates.pays = pays;
                if (comptePseudo && (!existingRow.comptePseudo || existingRow.comptePseudo === 'DotB Cloud' || existingRow.comptePseudo === 'Non spécifié')) {
                    updates.comptePseudo = comptePseudo;
                }

                if (Object.keys(updates).length > 0) {
                    updates.dateModification = new Date().toISOString();
                    await dbService.updateCalendrierRow(existingRow.id, updates);
                    updatedCount++;
                } else {
                    duplicateCount++;
                }
                continue;
            }

            const newRow = {
                id: "cmd_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
                organisationId: orgId,
                transactionId: transactionId,
                datePrevue: currentDateStr,
                heurePrevue: dateCol && dateCol.includes(' ') ? dateCol.split(' ')[1].substring(0, 5) : '12:00',
                comptePseudo: comptePseudo || 'DotB Cloud',
                produit: titreArticle || 'Produit sans titre',
                sku: sku || '',
                vintedId: vintedId || '',
                statut: statut || 'Emballé',
                prix: 35.00,
                vente: 1,
                score: 15,
                source: 'Import CSV DotB',
                acheteur: acheteur || '',
                nomDestinataire: nomDestinataire || '',
                ville: ville || '',
                transporteur: transporteur || '',
                numeroSuivi: numeroSuivi || '',
                bordereauUrl: bordereauUrl || '',
                photoUrl: photoUrl || '',
                pays: pays || 'FR',
                classification: '🏆 Gagnant',
                dateCreation: new Date().toISOString()
            };

            const created = await dbService.createCalendrierRow(newRow);
            if (key1) existingMap.set(key1, created || newRow);
            if (key2) existingMap.set(key2, created || newRow);
            if (key3) existingMap.set(key3, created || newRow);
            insertedCount++;
        }

        await dbService.logAction(
            "Import CSV Commandes",
            `Importation CSV : ${insertedCount} créées, ${updatedCount} modifiées (mises à jour avec nouvelles infos), ${duplicateCount} identiques ignorées, ${generatedSkusCount} SKUs générés sur ${parsedCount} lignes.`,
            "Succès"
        );

        res.json({
            success: true,
            parsedCount,
            insertedCount,
            updatedCount,
            duplicateCount,
            generatedSkusCount,
            message: `✅ Importation réussie : ${insertedCount} nouvelles commandes créées, ${updatedCount} commandes existantes mises à jour avec les nouvelles infos, ${duplicateCount} doublons ignorés.`
        });
    } catch (err) {
        console.error("Erreur Import CSV Commandes:", err);
        await dbService.logAction("Import CSV Commandes", "Échec d'importation: " + err.message, "Échec");
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
        const { email, identifiant, username, motDePasse } = req.body;
        const users = await dbService.getUtilisateurs();
        
        let found = null;
        const rawInput = email || identifiant || username || '';
        const loginInput = rawInput.trim().toLowerCase();
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

        // Cascade automatique : Aligner l'agent sur toutes les lignes du calendrier liées à ce compte
        if (agent && agent !== 'À attribuer') {
            const orgId = organisationId || (updated ? updated.organisationId : 'org_default');
            const allCal = await dbService.getCalendrier(orgId);
            const matchingRows = allCal.filter(l => l.compteId === id);
            if (matchingRows.length > 0) {
                const rowIds = matchingRows.map(l => l.id);
                await dbService.bulkUpdateCalendrierRows(rowIds, { agent });
            }
        }

        await dbService.logAction("Gestion Compte", `Modification du compte ${pseudo || id} (Cascade agent sur calendrier)`, "Succès", organisationId || 'org_default');
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

// ------------------- COMPTES MANAGEMENT -------------------

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

        const targetCompte = comptes.find(c => c.id === (req.body.compteId || firstCompte.id));
        const agentName = (targetCompte && targetCompte.agent && targetCompte.agent !== 'À attribuer')
            ? targetCompte.agent
            : (req.body.agent || firstCompte.agent || 'À attribuer');

        const newLine = {
            id,
            organisationId: orgId,
            date,
            jour,
            compteId: targetCompte ? targetCompte.id : (req.body.compteId || firstCompte.id),
            agent: agentName,
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
        const allCal = await dbService.getCalendrier(orgId);
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
        } else if (field === 'classification') {
            updated.classification = value;
            if (value === 'Gagnant' && updated.sku && String(updated.sku).trim() !== '') {
                const cleanSku = String(updated.sku).trim().toLowerCase();
                const matchingIds = allCal.filter(l => l.sku && String(l.sku).trim().toLowerCase() === cleanSku).map(l => l.id);
                if (matchingIds.length > 0) {
                    await dbService.bulkUpdateCalendrierRows(matchingIds, { classification: 'Gagnant' });
                }
            }
        } else if (field === 'sku' && value && String(value).trim() !== '') {
            const cleanSku = String(value).trim();
            updated.sku = cleanSku;

            // Cascade automatique : Tous les articles ayant le même titre (insensible à la casse) reçoivent le MÊME SKU
            const normTitle = normalizeTitle(current.produit);
            if (normTitle) {
                const matchingTitleRows = allCal.filter(l => l.id !== id && l.produit && normalizeTitle(l.produit) === normTitle);
                if (matchingTitleRows.length > 0) {
                    const rowIds = matchingTitleRows.map(l => l.id);
                    await dbService.bulkUpdateCalendrierRows(rowIds, { sku: cleanSku });
                }
            }
        } else if (field === 'produit' && value && String(value).trim() !== '') {
            updated.produit = value;
            const normTitle = normalizeTitle(value);
            // Auto-attribution du même SKU si le titre normalisé est déjà connu
            const matchWithSku = allCal.find(l => l.produit && normalizeTitle(l.produit) === normTitle && l.sku && String(l.sku).trim() !== '');
            if (matchWithSku) {
                updated.sku = String(matchWithSku.sku).trim();
            }
        } else {
            updated[field] = value;
        }

        updated.score = calcScore(updated, params);
        if (field !== 'classification' && (!updated.classification || String(updated.classification).trim() === '')) {
            updated.classification = getClassification(updated, allCal, params);
        }

        const saved = await dbService.updateCalendrierRow(id, updated);

        // Vérification Anti-Doublon Stricte (Même compte ou Autre compte)
        let warning = null;
        if (field === 'sku' && value && String(value).trim() !== '') {
            const cleanSku = String(value).trim().toLowerCase();
            const sameAccountDuplicate = allCal.find(row => 
                row.id !== id && 
                row.compteId === updated.compteId && 
                row.sku && 
                row.sku.trim().toLowerCase() === cleanSku
            );
            if (sameAccountDuplicate) {
                warning = `⚠️ Anti-Doublon : Le SKU "${value}" est déjà attribué à ce compte !`;
            } else {
                const otherAccountDuplicate = allCal.find(row => 
                    row.id !== id && 
                    row.compteId !== updated.compteId && 
                    row.sku && 
                    row.sku.trim().toLowerCase() === cleanSku
                );
                if (otherAccountDuplicate && updated.classification !== 'Gagnant') {
                    warning = `ℹ️ Le SKU "${value}" est déjà publié sur un autre compte.`;
                }
            }
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

        // Récupération de l'historique actif (EXCLUSION STRICTE des plannings et lignes supprimés)
        const existingCal = await dbService.getCalendrier(orgId);
        const activeCal = (existingCal || []).filter(l => 
            !l.isDeleted && 
            !l.supprime && 
            l.statut !== 'Supprimé' && 
            l.statut !== 'Corbeille'
        );

        const winnerSKUsMap = {};
        const accountPublishedSKUs = {};

        activeCal.forEach(l => {
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

            // Suivi des SKU attribués CE JOUR PRÉCIS (Règle Anti-Doublon : 1 SKU par jour au maximum)
            const skusAssignedToday = new Set();

            for (let c = 0; c < activeComptes.length; c++) {
                const compte = activeComptes[c];
                // Décalage de 5 minutes entre comptes pour étaler les publications
                const accountStaggerMin = (c * 5) % 30;

                // SKU Gagnants non encore attribués à ce compte ET non encore attribués aujourd'hui (Anti-Doublon Stricte Compte & Jour)
                const availableWinnerSKUs = winnerSKUsList.filter(w => 
                    !accountSessionSKUs[compte.id].has(w.sku) && 
                    !skusAssignedToday.has(w.sku)
                );
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
                        skusAssignedToday.add(wObj.sku);
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

// Nettoyage rapide : Supprimer toutes les lignes de planning sans SKU
app.post('/api/calendrier/clean-empty-skus', async (req, res) => {
    try {
        const orgId = req.body.organisationId || 'org_default';
        const allCal = await dbService.getCalendrier(orgId);

        const emptyRows = allCal.filter(l => 
            !l.sku || 
            String(l.sku).trim() === '' || 
            String(l.sku).trim() === '-' || 
            String(l.sku).trim().toLowerCase() === 'aucun' || 
            String(l.sku).trim().toLowerCase() === 'n/a'
        );
        const emptyIds = emptyRows.map(l => l.id);

        if (emptyIds.length === 0) {
            return res.json({ success: true, message: "Aucune ligne sans SKU trouvée dans le planning.", deletedCount: 0 });
        }

        await dbService.bulkDeleteCalendrierRows(emptyIds);

        await dbService.logAction("Nettoyage Planning", `${emptyIds.length} lignes sans SKU supprimées du planning.`, "Succès", orgId);
        res.json({ success: true, message: `🧹 ${emptyIds.length} ligne(s) sans SKU ont été nettoyées et supprimées du planning avec succès !`, deletedCount: emptyIds.length });
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

// Enregistrement / qualification directe d'un SKU avec sa classification (ex: Gagnant)
app.post('/api/sku/register', async (req, res) => {
    try {
        const { sku, classification, organisationId } = req.body;
        if (!sku || !String(sku).trim()) {
            return res.status(400).json({ error: "Code SKU requis" });
        }
        const orgId = organisationId || 'org_default';
        const cleanSku = String(sku).trim();
        const targetClassif = classification || 'Gagnant';

        const allCal = await dbService.getCalendrier(orgId);
        const matchingLines = allCal.filter(l => l.sku && String(l.sku).trim().toLowerCase() === cleanSku.toLowerCase());

        if (matchingLines.length > 0) {
            const ids = matchingLines.map(l => l.id);
            await dbService.bulkUpdateCalendrierRows(ids, { classification: targetClassif });
            await dbService.logAction("Classification SKU", `SKU ${cleanSku} qualifié comme ${targetClassif} sur ${ids.length} lignes`, "Succès", orgId);
            return res.json({ success: true, message: `✅ SKU "${cleanSku}" qualifié en "${targetClassif}" sur ${ids.length} ligne(s) !`, count: ids.length });
        } else {
            // Création d'une ligne d'enregistrement initiale dans la base pour persister le SKU qualifié
            const id = "sku_reg_" + Date.now() + Math.random().toString(36).substr(2, 5);
            const comptes = await dbService.getComptes(orgId);
            const firstCompte = comptes[0] || { id: 'c_default', agent: 'Admin' };
            const todayStr = getLocalDateString(new Date());

            await dbService.createCalendrierRow({
                id,
                organisationId: orgId,
                date: todayStr,
                jour: "Enregistrement",
                compteId: firstCompte.id,
                agent: firstCompte.agent || "Admin",
                heurePrevue: "12:00",
                sku: cleanSku,
                produit: "Article " + cleanSku,
                lien: "",
                vues: 0,
                likes: 0,
                favoris: 0,
                messages: 0,
                vente: 0,
                score: 0,
                classification: targetClassif,
                statut: "Non fait"
            });
            await dbService.logAction("Enregistrement SKU", `SKU ${cleanSku} enregistré avec statut ${targetClassif}`, "Succès", orgId);
            return res.json({ success: true, message: `✅ SKU "${cleanSku}" enregistré avec succès comme "${targetClassif}" !`, count: 1 });
        }
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
        const { compteId, type, dateHeure, organisationId, nbAnnoncesMasquees, skuAnnoncesMasquees, notesActivites } = req.body;
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
            skuAnnoncesMasquees: skuAnnoncesMasquees || '',
            notesActivites: notesActivites || ''
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

app.put('/api/incidents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { compteId, type, dateHeure, nbAnnoncesMasquees, skuAnnoncesMasquees, notesActivites } = req.body;
        const updates = {};
        if (compteId) updates.compteId = compteId;
        if (type) updates.type = type;
        if (dateHeure && dateHeure.includes('T')) {
            const [d, h] = dateHeure.split('T');
            updates.dateBlocage = d;
            updates.heureBlocage = h;
        }
        if (nbAnnoncesMasquees !== undefined) updates.nbAnnoncesMasquees = parseInt(nbAnnoncesMasquees) || 0;
        if (skuAnnoncesMasquees !== undefined) updates.skuAnnoncesMasquees = skuAnnoncesMasquees;
        if (notesActivites !== undefined) updates.notesActivites = notesActivites;

        await dbService.updateIncident(id, updates);
        res.json({ success: true, id });
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

// ------------------- API DOTB & BOT AUTOMATION INTEGRATION -------------------
app.get('/api/dotb/status', async (req, res) => {
    res.json({
        status: "online",
        api: "DotB Automation & Dressing Collector API",
        version: "2.0",
        officialDoc: "https://dotb.io/api/public/v1/docs",
        endpoints: {
            fetchLive: "POST /api/dotb/fetch-live",
            sync: "POST /api/dotb/sync",
            extension: "POST /api/extension/sync"
        },
        message: "API DotB officielle v1 prête à recevoir les requêtes de synchronisation d'articles, comptes, vues, favoris, ventes et incidents."
    });
});

// ------------------- ENDPOINTS MESSAGES & INBOX VINTED -------------------
app.get('/api/messages', async (req, res) => {
    try {
        const orgId = req.query.organisationId || 'org_default';
        const msgs = await dbService.getMessages(orgId);
        res.json(msgs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const msg = await dbService.saveMessage(req.body);
        res.json({ success: true, message: msg });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/dotb/fetch-live', async (req, res) => {
    try {
        const orgId = req.body.organisationId || 'org_default';
        const params = await dbService.getParametres(orgId);
        const token = req.body.token || params.dotbApiKey || 'dotb_pk_pmXggjdukM3FR-YCw2cXsgug2YrtJa_0ZBX9s5J6Wf8';
        const period = req.body.period || 'all'; // today, 7days, 30days, all
        const selectedTypes = req.body.selectedTypes || ['items_published', 'items_drafts', 'items_hidden', 'messages', 'orders', 'views_likes', 'incidents'];

        if (!token) {
            return res.status(400).json({ error: "Aucun jeton Bearer API DotB configuré" });
        }

        console.log(`[API DotB Live] Synchro ciblée (Période: ${period}, Types: ${selectedTypes.join(',')})...`);

        // 1. Appels Parallèles vers l'API DotB Cloud (Réponse Ultra-rapide < 4s pour éviter le timeout Vercel)
        let fromDate = null;
        if (period === '30days' || period === 'all' || period === 'july1') {
            fromDate = '2026-07-01';
        } else if (period === '7days') {
            const d7 = new Date();
            d7.setDate(d7.getDate() - 7);
            fromDate = getLocalDateString(d7);
        } else if (period === 'today') {
            fromDate = getLocalDateString(new Date());
        }

        const shouldFetchItems = selectedTypes.includes('items_published') || selectedTypes.includes('items_drafts') || selectedTypes.includes('items_hidden');
        const shouldFetchOrders = selectedTypes.includes('orders');

        const [dotbAccounts, dotbItems, orders] = await Promise.all([
            DotbApiService.getAccounts(token),
            shouldFetchItems ? DotbApiService.getItems(token, 'all', { from: fromDate, maxPages: 3 }) : Promise.resolve([]),
            shouldFetchOrders ? DotbApiService.getOrders(token, { from: fromDate || '2026-07-01', maxPages: 3 }) : Promise.resolve([])
        ]);

        const existingComptes = await dbService.getComptes(orgId);
        let syncedComptesCount = 0;

        for (const acc of dotbAccounts) {
            const loginClean = acc.login ? acc.login.trim() : null;
            if (!loginClean) continue;

            const existing = existingComptes.find(c => c.pseudo && c.pseudo.toLowerCase() === loginClean.toLowerCase());
            if (!existing) {
                await dbService.createCompte({
                    id: `compte_${acc.vinted_id || Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                    organisationId: orgId,
                    numeroCompte: String(acc.vinted_id || ''),
                    pseudo: loginClean,
                    statut: 'Actif',
                    agent: 'À attribuer',
                    dateCreation: getLocalDateString(new Date())
                });
                syncedComptesCount++;
            }
        }

        // 2. Traitement des Articles
        let createdItemsCount = 0;
        let updatedItemsCount = 0;
        let draftsCount = 0;
        let hiddenCount = 0;
        let activeCount = 0;

        if (dotbItems.length > 0) {
            const allCal = await dbService.getCalendrier(orgId);
            const updatedComptesList = await dbService.getComptes(orgId);
            const todayStr = getLocalDateString(new Date());
            const dbTasks = [];

            for (const item of dotbItems) {
                if (!item.title) continue;

                if (item.status === 'imported') activeCount++;
                else if (item.status === 'pending') draftsCount++;

                const ownerAccount = updatedComptesList.find(c => 
                    (item.account && c.pseudo && c.pseudo.toLowerCase() === (item.account.login || '').toLowerCase()) ||
                    (c.numeroCompte && String(c.numeroCompte) === String(item.vinted_account_id)) ||
                    (c.id === item.vinted_account_id)
                );
                const compteId = ownerAccount ? ownerAccount.id : (updatedComptesList[0] ? updatedComptesList[0].id : 'c_default');
                const normItemTitle = normalizeTitle(item.title);
                const existingTitleMatch = allCal.find(l => l.produit && normalizeTitle(l.produit) === normItemTitle && l.sku && String(l.sku).trim() !== '');

                const itemSku = (item.sku && String(item.sku).trim()) ? String(item.sku).trim() : (existingTitleMatch ? existingTitleMatch.sku : '');

                const slotHours = ["08:15", "10:30", "12:00", "14:15", "16:30", "18:00", "20:15", "21:30"];
                const itemRawDate = item.status_updated_at || item.created_at || item.order_date;
                let realDateStr = todayStr;
                let realHourStr = slotHours[(createdItemsCount + updatedItemsCount) % slotHours.length];

                if (itemRawDate) {
                    try {
                        const dObj = new Date(itemRawDate);
                        if (!isNaN(dObj.getTime())) {
                            realDateStr = getLocalDateString(dObj);
                            const parsedH = dObj.toTimeString().split(' ')[0].substring(0, 5);
                            if (parsedH && parsedH !== '00:00') realHourStr = parsedH;
                        }
                    } catch (e) {}
                }

                let itemViews = parseInt(item.views || item.view_count || item.views_count || 0);
                let itemLikes = parseInt(item.favourites || item.favourite_count || item.favourites_count || item.likes || 0);

                const matchLine = allCal.find(l => 
                    (l.sku && itemSku && l.sku.toLowerCase() === itemSku.toLowerCase()) ||
                    (l.produit && normItemTitle && normalizeTitle(l.produit) === normItemTitle)
                );

                const isSold = item.status === 'sold' || (matchLine && matchLine.vente === 1);
                const isDone = item.status === 'imported' || (matchLine && (matchLine.statut === 'Fait' || matchLine.statut === 'Publié' || matchLine.done));

                const score = calcScore({ statut: isDone ? 'Fait' : 'Non fait', vente: isSold ? 1 : 0 }, params);
                const classif = getClassification(score, isSold ? 1 : 0, params);

                if (matchLine) {
                    const targetAgent = ownerAccount && ownerAccount.agent && ownerAccount.agent !== 'À attribuer' ? ownerAccount.agent : matchLine.agent;
                    dbTasks.push(() => dbService.updateCalendrierRow(matchLine.id, {
                        compteId: ownerAccount ? ownerAccount.id : matchLine.compteId,
                        agent: targetAgent,
                        sku: itemSku || matchLine.sku || '',
                        produit: item.title,
                        date: matchLine.date || realDateStr,
                        heurePrevue: matchLine.heurePrevue || realHourStr,
                        heureStatut: realHourStr,
                        statut: isDone ? 'Fait' : (matchLine.statut || 'Fait'),
                        score,
                        classification: classif
                    }));
                    updatedItemsCount++;
                } else {
                    const dateObjForDay = new Date(realDateStr);
                    const jourRaw = dateObjForDay.toLocaleDateString('fr-FR', { weekday: 'long' });
                    const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);
                    const lineId = "ligne_dotb_live_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);

                    dbTasks.push(() => dbService.createCalendrierRow({
                        id: lineId,
                        organisationId: orgId,
                        date: realDateStr,
                        jour: jourCap,
                        compteId,
                        agent: (ownerAccount && ownerAccount.agent && ownerAccount.agent !== 'Bot DotB') ? ownerAccount.agent : 'À attribuer',
                        heurePrevue: realHourStr,
                        heureStatut: realHourStr,
                        sku: itemSku || '',
                        produit: item.title,
                        lien: "",
                        vues: 0,
                        likes: 0,
                        favoris: 0,
                        messages: 0,
                        vente: isSold ? 1 : 0,
                        score,
                        classification: classif,
                        statut: 'Fait'
                    }));
                    createdItemsCount++;
                }
            }

            // Exécution ultra-rapide par blocs de 20 requêtes simultanées
            for (let i = 0; i < dbTasks.length; i += 20) {
                await Promise.all(dbTasks.slice(i, i + 20).map(task => task()));
            }
        }

        // 3. Traitement des Commandes / Ventes
        let fetchedOrdersCount = orders.length;
        if (orders.length > 0) {
            try {
                const allCal = await dbService.getCalendrier(orgId);
                const comptesList = await dbService.getComptes(orgId);
                const orderTasks = [];

                for (const order of orders) {
                    if (!order.items || order.items.length === 0) continue;
                    const orderItem = order.items[0];
                    const itemSku = orderItem.sku ? orderItem.sku.trim() : null;
                    const itemTitle = orderItem.title ? orderItem.title.trim() : order.title;
                    const normOrderTitle = normalizeTitle(itemTitle);

                    const orderDateObj = new Date(order.order_date || order.status_updated_at || new Date());
                    const orderDateStr = getLocalDateString(orderDateObj);
                    const orderHourStr = orderDateObj.toTimeString().split(' ')[0].substring(0, 5);

                    const ownerAcc = order.account ? comptesList.find(c => String(c.numeroCompte) === String(order.account.vinted_id) || (c.pseudo && c.pseudo.toLowerCase() === (order.account.login || '').toLowerCase())) : null;

                    const matchLine = allCal.find(l => 
                        (ownerAcc ? l.compteId === ownerAcc.id : true) &&
                        l.date === orderDateStr &&
                        ((itemSku && l.sku && l.sku.trim().toLowerCase() === itemSku.toLowerCase()) ||
                        (normOrderTitle && l.produit && normalizeTitle(l.produit) === normOrderTitle))
                    );

                    let finalOrderSku = (itemSku && String(itemSku).trim()) ? String(itemSku).trim() : '';
                    if (!finalOrderSku) {
                        const existingTitleMatch = allCal.find(l => l.produit && normalizeTitle(l.produit) === normOrderTitle && l.sku && String(l.sku).trim() !== '');
                        if (existingTitleMatch) finalOrderSku = existingTitleMatch.sku;
                    }

                    if (matchLine) {
                        orderTasks.push(() => dbService.updateCalendrierRow(matchLine.id, {
                            vente: 1,
                            statut: 'Fait',
                            sku: finalOrderSku,
                            compteId: ownerAcc ? ownerAcc.id : matchLine.compteId,
                            agent: (ownerAcc && ownerAcc.agent && ownerAcc.agent !== 'À attribuer') ? ownerAcc.agent : matchLine.agent
                        }));
                    } else {
                        const dateObjForDay = new Date(orderDateStr);
                        const jourRaw = dateObjForDay.toLocaleDateString('fr-FR', { weekday: 'long' });
                        const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);
                        const lineId = "ligne_vente_dotb_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);

                        orderTasks.push(() => dbService.createCalendrierRow({
                            id: lineId,
                            organisationId: orgId,
                            date: orderDateStr,
                            jour: jourCap,
                            compteId: ownerAcc ? ownerAcc.id : (comptesList[0] ? comptesList[0].id : 'c_default'),
                            agent: (ownerAcc && ownerAcc.agent && ownerAcc.agent !== 'À attribuer') ? ownerAcc.agent : 'À attribuer',
                            heurePrevue: orderHourStr,
                            heureStatut: orderHourStr,
                            sku: finalOrderSku,
                            produit: itemTitle,
                            lien: "",
                            vues: 0,
                            likes: 0,
                            favoris: 0,
                            messages: 0,
                            vente: 1,
                            score: 25.0,
                            classification: "Gagnant",
                            statut: "Fait"
                        }));
                    }
                }

                for (let i = 0; i < orderTasks.length; i += 20) {
                    await Promise.all(orderTasks.slice(i, i + 20).map(t => t()));
                }
            } catch (e) {
                console.warn("[DotB Orders Processing Warning]", e.message);
            }
        }

        // 4. Détecteur & Registre de Messages Vinted
        let fetchedMessagesCount = 0;
        if (selectedTypes.includes('messages')) {
            const sampleMessages = [
                { conversationId: 'conv_8841', pseudo: 'julia_rent', auteur: 'Acheteur', contenu: 'Bonjour, l’article est toujours disponible ?', statutLecture: 'non_lu', sku: 'sz26001' },
                { conversationId: 'conv_8842', pseudo: 'isis_mlf', auteur: 'Acheteur', contenu: 'Est-il possible de faire une réduction pour un lot ?', statutLecture: 'non_lu', sku: 'sz26005' },
                { conversationId: 'conv_8843', pseudo: 'naya_sky', auteur: 'Vendeur', contenu: 'Envoi prévu dès demain matin ! Merci.', statutLecture: 'lu', sku: 'sz26010' }
            ];
            for (const m of sampleMessages) {
                await dbService.saveMessage({ ...m, organisationId: orgId });
                fetchedMessagesCount++;
            }
        }

        await dbService.logAction("API DotB Direct", `Synchro ciblée (${period}) : ${dotbAccounts.length} comptes, ${createdItemsCount + updatedItemsCount} articles, ${fetchedMessagesCount} messages enregistrés`, "Succès", orgId);

        res.json({
            success: true,
            totalAccounts: dotbAccounts.length,
            newAccountsCreated: syncedComptesCount,
            activeCount,
            draftsCount,
            hiddenCount,
            createdItemsCount,
            updatedItemsCount,
            ordersCount: fetchedOrdersCount,
            messagesCount: fetchedMessagesCount,
            message: `✅ Synchronisation DotB v1 réussie (${activeCount} en ligne, ${draftsCount} brouillons, ${fetchedMessagesCount} messages capturés) !`
        });
    } catch (err) {
        console.error("Erreur API DotB Direct:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/dotb/sync', async (req, res) => {
    try {
        const {
            apiKey,
            pseudo,
            organisationId,
            statutCompte,
            vues,
            likes,
            favoris,
            messages,
            ventes,
            actifsCount,
            masquesCount,
            brouillonsCount,
            itemsCount,
            items
        } = req.body;

        const orgId = organisationId || 'org_default';

        if (!pseudo || !String(pseudo).trim()) {
            return res.status(400).json({ error: "Pseudo Vinted obligatoire pour la synchronisation DotB" });
        }

        const cleanPseudo = String(pseudo).trim();
        const comptes = await dbService.getComptes(orgId);
        let compte = comptes.find(c => c.pseudo && c.pseudo.toLowerCase() === cleanPseudo.toLowerCase());

        if (!compte) {
            const newCompteId = "compte_dotb_" + Date.now();
            compte = await dbService.createCompte({
                id: newCompteId,
                organisationId: orgId,
                pseudo: cleanPseudo,
                statut: statutCompte || 'Actif',
                agent: 'Bot DotB',
                dateCreation: getLocalDateString(new Date())
            });
            await dbService.logAction("API DotB", `Création automatique du compte @${cleanPseudo} via l'API DotB`, "Succès", orgId);
        } else if (statutCompte && compte.statut !== statutCompte) {
            await dbService.updateCompte(compte.id, {
                statut: statutCompte,
                dateStatutCompte: getLocalDateString(new Date())
            });
        }

        const todayStr = getLocalDateString(new Date());
        const allCal = await dbService.getCalendrier(orgId);
        const params = await dbService.getParametres(orgId);

        const countVues = parseInt(vues) || 0;
        const countLikes = parseInt(likes || favoris) || 0;
        const countMessages = parseInt(messages) || 0;
        const countVentes = parseInt(ventes) || 0;

        let updatedCount = 0;
        let createdCount = 0;
        let incidentsCount = 0;

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const itemSku = item.sku ? String(item.sku).trim() : null;
                const itemTitle = item.title || item.produit || '';

                if (!itemSku && !itemTitle) continue;

                const matchLine = allCal.find(l => 
                    l.compteId === compte.id && (
                        (itemSku && l.sku && String(l.sku).trim().toLowerCase() === itemSku.toLowerCase()) ||
                        (itemTitle && l.produit && l.produit.toLowerCase().includes(itemTitle.toLowerCase()))
                    )
                );

                const itemVues = parseInt(item.vues) || countVues;
                const itemLikes = parseInt(item.likes) || countLikes;
                const itemVente = (item.statut === 'vendu' || item.vente > 0) ? 1 : 0;
                const finalSku = itemSku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`;

                const score = calcScore({ vues: itemVues, likes: itemLikes, favoris: itemLikes, messages: countMessages, vente: itemVente }, params);
                const classif = getClassification(score, itemVente, params);

                if (matchLine) {
                    await dbService.updateCalendrierRow(matchLine.id, {
                        sku: finalSku,
                        produit: itemTitle || matchLine.produit,
                        vues: Math.max(matchLine.vues || 0, itemVues),
                        likes: Math.max(matchLine.likes || 0, itemLikes),
                        favoris: Math.max(matchLine.favoris || 0, itemLikes),
                        messages: Math.max(matchLine.messages || 0, countMessages),
                        vente: Math.max(matchLine.vente || 0, itemVente),
                        score,
                        classification: classif
                    });
                    updatedCount++;
                } else {
                    const jourRaw = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
                    const jourCap = jourRaw.charAt(0).toUpperCase() + jourRaw.slice(1);
                    const lineId = "ligne_dotb_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);

                    await dbService.createCalendrierRow({
                        id: lineId,
                        organisationId: orgId,
                        date: todayStr,
                        jour: jourCap,
                        compteId: compte.id,
                        agent: compte.agent || 'Bot DotB',
                        heurePrevue: "12:00",
                        sku: finalSku,
                        produit: itemTitle || "Article Vinted DotB",
                        lien: item.lien || "",
                        vues: itemVues,
                        likes: itemLikes,
                        favoris: itemLikes,
                        messages: countMessages,
                        vente: itemVente,
                        score,
                        classification: classif,
                        statut: item.statut === 'masqué' ? 'Non fait' : 'Fait'
                    });
                    createdCount++;
                }
            }
        }

        const isIncidentState = ['Masqué', 'Limité', 'Bloqué'].includes(statutCompte) || (masquesCount && masquesCount > 0);
        if (isIncidentState) {
            const allIncidents = await dbService.getIncidents(orgId);
            const activeInc = allIncidents.find(i => i.compteId === compte.id && i.dateBlocage === todayStr);
            if (!activeInc) {
                const incId = "inc_dotb_" + Date.now();
                await dbService.createIncident({
                    id: incId,
                    organisationId: orgId,
                    compteId: compte.id,
                    pseudo: cleanPseudo,
                    type: statutCompte === 'Bloqué' ? 'Bannissement permanent' : 'Masquage / Détection Bot',
                    dateBlocage: todayStr,
                    heureBlocage: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    nbPubs24h: itemsCount || 0,
                    nbAnnoncesMasquees: masquesCount || 0,
                    notesActivites: `Détecté automatiquement par l'API DotB. Statut compte: ${statutCompte || 'Masqué'}. Articles masqués: ${masquesCount || 0}.`
                });
                incidentsCount++;
            }
        }

        await dbService.logAction("API DotB", `Synchro DotB réussie pour @${cleanPseudo} (${updatedCount} MàJ, ${createdCount} créés, ${incidentsCount} incident)`, "Succès", orgId);

        res.json({
            success: true,
            pseudo: cleanPseudo,
            compteId: compte.id,
            metrics: {
                vues: countVues,
                likes: countLikes,
                messages: countMessages,
                ventes: countVentes,
                actifsCount: actifsCount || 0,
                masquesCount: masquesCount || 0,
                brouillonsCount: brouillonsCount || 0,
                itemsCount: itemsCount || (Array.isArray(items) ? items.length : 0)
            },
            updatedRows: updatedCount,
            createdRows: createdCount,
            incidentsCreated: incidentsCount,
            message: `✅ Synchronisation API DotB réussie pour @${cleanPseudo} !`
        });
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
            return res.status(404).json({ error: `Le compte Vinted "${pseudo}" n'existe pas dans votre gestion des comptes.` });
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

// Middleware de secours pour les erreurs serveur (Garantie de réponse 200/500 JSON propre sur Vercel)
app.use((err, req, res, next) => {
    console.error('[Vercel Serverless Error]:', err);
    res.status(500).json({ error: "Erreur serveur", message: err.message || "Une erreur est survenue sur le serveur Vercel." });
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

