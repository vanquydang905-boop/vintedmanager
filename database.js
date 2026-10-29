require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kdtmpgcsfawbsiiscazu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_EStL78lhwgNnP2RVOTmRTw_6XYeSTKJ';

if (!global.WebSocket) global.WebSocket = class {};
const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers de conversion CamelCase <-> Lowercase pour Supabase PostgreSQL
const camelMap = {
    organisationid: 'organisationId',
    agentassigne: 'agentAssigne',
    motdepasse: 'motDePasse',
    datecreation: 'dateCreation',
    compteid: 'compteId',
    lienprofil: 'lienProfil',
    heureprevue: 'heurePrevue',
    datestatut: 'dateStatut',
    heurestatut: 'heureStatut',
    nbventesreposts: 'nbVentesReposts',
    heuresventesreposts: 'heuresVentesReposts',
    prochainrepost: 'prochainRepost',
    dateblocage: 'dateBlocage',
    heureblocage: 'heureBlocage',
    nbpubs24h: 'nbPubs24h',
    heurespubs24h: 'heuresPubs24h',
    nbventesconnues: 'nbVentesConnues',
    detailventes: 'detailVentes',
    nbannoncesmasquees: 'nbAnnoncesMasquees',
    skuannoncesmasquees: 'skuAnnoncesMasquees',
    notesactivites: 'notesActivites',
    contacttype: 'contactType',
    contactnumero: 'contactNumero',
    numerocompte: 'numeroCompte',
    telephone: 'telephone',
    email: 'email',
    gereparinitiales: 'gereParInitiales',
    datestatutcompte: 'dateStatutCompte',
    typeentite: 'typeEntite',
    identite: 'idEntite',
    nomelement: 'nomElement',
    donneeschiffrees: 'donneesChiffrees',
    dateaction: 'dateAction',
    permissions: 'permissions',
    soustaches: 'sousTaches',
    dateecheance: 'dateEcheance',
    heureecheance: 'heureEcheance',
    rappelminutes: 'rappelMinutes',
    alertesonore: 'alerteSonore',
    creepar: 'creePar',
    terminepar: 'terminePar',
    dateterminee: 'dateTerminee',
    comptenom: 'compteNom',
    comptepseudo: 'comptePseudo'
};

function toDbFormat(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const dbObj = {};
    for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        let value = obj[key];
        if (['heuresventesreposts', 'heurespubs24h', 'detailventes', 'permissions', 'soustaches', 'photos'].includes(lowerKey)) {
            if (Array.isArray(value) || (value && typeof value === 'object')) {
                value = JSON.stringify(value);
            }
        }
        dbObj[lowerKey] = value;
    }
    return dbObj;
}

function fromDbFormat(dbObj) {
    if (!dbObj || typeof dbObj !== 'object') return dbObj;
    const res = {};
    for (const key of Object.keys(dbObj)) {
        const camelKey = camelMap[key.toLowerCase()] || key;
        let value = dbObj[key];
        if (['heuresVentesReposts', 'heuresPubs24h', 'detailVentes', 'permissions', 'sousTaches', 'photos'].includes(camelKey)) {
            if (typeof value === 'string') {
                try { value = JSON.parse(value); } catch (e) { value = camelKey === 'permissions' ? {} : []; }
            }
        }
        res[camelKey] = value;
    }
    return res;
}

const ALLOWED_UTILISATEUR_COLUMNS = [
    'id', 'nom', 'email', 'role', 'organisationid', 'agentassigne', 'motdepasse', 'datecreation'
];

function sanitizeUtilisateurDb(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const dbObj = toDbFormat(obj);
    const sanitized = {};
    for (const col of ALLOWED_UTILISATEUR_COLUMNS) {
        if (dbObj[col] !== undefined) {
            sanitized[col] = dbObj[col];
        }
    }
    return sanitized;
}

let DEFAULT_PARAMETRES = {
    poidsScore: { vues: 0.1, likes: 1, favoris: 2, messages: 5, vente: 20 },
    seuils: { ecarte: 15, gagnant: 40 },
    modePlanification: "intervalle",
    decalageMinutesEntreComptes: 60,
    margeAleatoireMinutes: 15,
    creneauxParJour: 3,
    delaiProchainRepostMinutes: 30,
    heuresParPeriode: {
        matin: ["06:30", "07:30", "08:30", "09:30", "10:30", "11:30"],
        midi: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        soir: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
    },
    nbJoursPlanningParDefaut: 7,
    heureDeclencheurAuto: "05:00"
};

let DEFAULT_STOCK = {};
try {
    const fs = require('fs');
    const path = require('path');
    const stockPath = path.join(__dirname, 'initial_stock.json');
    if (fs.existsSync(stockPath)) {
        DEFAULT_STOCK = JSON.parse(fs.readFileSync(stockPath, 'utf8'));
    }
} catch (e) {
    console.warn('[Stock] Could not load initial_stock.json:', e);
}

const crypto = require('crypto');

function hashPassword(password) {
    if (!password) return '';
    if (typeof password === 'string' && (password.startsWith('sha256$') || password.startsWith('scrypt$'))) {
        return password;
    }
    const salt = process.env.PASSWORD_SALT || 'vinted_manager_secure_salt_2026';
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return `sha256$${hash}`;
}

function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function verifyPassword(inputPassword, storedHash) {
    if (!inputPassword || !storedHash) return false;
    if (!storedHash.startsWith('sha256$')) {
        return inputPassword === storedHash;
    }
    const hashedInput = hashPassword(inputPassword);
    return hashedInput === storedHash;
}

// Clé de sécurité maîtresse cachée dérivée via HMAC-SHA512 + SHA-256
function getAESKey() {
    const envSecret = process.env.CORBEILLE_SECRET || process.env.SUPABASE_KEY || 'vinted_manager_master_sec_key_2026_99a8b7';
    const hiddenSalt = 'vinted_manager_hidden_salt_c8f93a2b7e10c49d5a6b8c9d0e1f2a3b4c5d6e7f8';
    const masterSecret = crypto.createHmac('sha512', hiddenSalt).update(envSecret).digest();
    return crypto.createHash('sha256').update(masterSecret).digest(); // Exact 32 bytes AES-256 key
}

function encryptString(text) {
    if (text === null || text === undefined) return '';
    const str = String(text);
    if (!str) return '';
    try {
        const key = getAESKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(str, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        return str;
    }
}

function decryptString(encryptedText) {
    if (!encryptedText) return '';
    if (!encryptedText.includes(':')) return encryptedText;
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 2) return encryptedText;
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = getAESKey();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return encryptedText;
    }
}

function encryptJSON(data) {
    if (!data) return '';
    try {
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
        const key = getAESKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(jsonString, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        console.error('[Corbeille Encrypt Error]', e);
        return '';
    }
}

function decryptJSON(encryptedText) {
    if (!encryptedText) return null;
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 2) return null;
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = getAESKey();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (err) {
        console.error('[Corbeille Decrypt Error]', err);
        return null;
    }
}

function getNomElement(typeEntite, data) {
    if (!data) return typeEntite;
    if (typeEntite === 'calendrier') {
        const skuPart = data.sku ? `SKU: ${data.sku}` : '';
        const prodPart = data.produit ? `${data.produit}` : '';
        return (skuPart && prodPart ? `${skuPart} - ${prodPart}` : skuPart || prodPart) || `Créneau ID ${data.id}`;
    }
    if (typeEntite === 'todos') {
        return data.titre ? `Tâche "${data.titre}"` : `Tâche ID ${data.id}`;
    }
    if (typeEntite === 'comptes') {
        return data.pseudo ? `Compte @${data.pseudo}` : `Compte ID ${data.id}`;
    }
    if (typeEntite === 'utilisateurs') {
        return data.nom ? `Utilisateur ${data.nom}` : `Utilisateur ID ${data.id}`;
    }
    if (typeEntite === 'organisations') {
        return data.nom ? `Organisation ${data.nom}` : `Organisation ID ${data.id}`;
    }
    if (typeEntite === 'incidents') {
        return data.type ? `Incident ${data.type}` : `Incident ID ${data.id}`;
    }
    return `Élément ID ${data.id || ''}`;
}

let DEFAULT_ORGANISATIONS = [];
let DEFAULT_UTILISATEURS = [];
let DEFAULT_COMPTES = [];
let DEFAULT_CALENDRIER = [];
let DEFAULT_INCIDENTS = [];
let DEFAULT_JOURNAL = [];
let DEFAULT_CORBEILLE = [];
let DEFAULT_TODOS = [];

const dbService = {
    supabase,
    hashPassword,
    verifyPassword,
    encryptJSON,
    decryptJSON,
    encryptString,
    decryptString,
    DEFAULT_PARAMETRES,
    DEFAULT_ORGANISATIONS,
    DEFAULT_UTILISATEURS,
    DEFAULT_COMPTES,
    DEFAULT_CALENDRIER,
    DEFAULT_INCIDENTS,
    DEFAULT_JOURNAL,
    DEFAULT_CORBEILLE,
    DEFAULT_TODOS,

    // ------------------- CORBEILLE (SAUVEGARDE & CHIFFREMENT) -------------------
    async saveToCorbeille(typeEntite, idEntite, action, originalData, customNomElement = null, organisationId = null, auteur = 'Système') {
        if (!originalData) return null;
        const orgId = organisationId || originalData.organisationId || 'org_default';
        const rawNomElem = customNomElement || getNomElement(typeEntite, originalData);
        
        // Tout chiffrer en base de données, y compris l'étiquette / SKU !
        const nomElementChiffre = encryptString(rawNomElem);
        const donneesChiffrees = encryptJSON(originalData);
        const auteurChiffre = encryptString(auteur);

        const item = {
            id: 'trash_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            organisationId: orgId,
            typeEntite,
            idEntite: String(idEntite),
            action,
            nomElement: nomElementChiffre,
            donneesChiffrees,
            dateAction: new Date().toISOString(),
            auteur: auteurChiffre
        };

        const idx = DEFAULT_CORBEILLE.findIndex(c => c.id === item.id);
        if (idx >= 0) DEFAULT_CORBEILLE[idx] = item;
        else DEFAULT_CORBEILLE.unshift(item);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(item);
                await supabase.from('corbeille').upsert([dbPayload]);
            } catch (e) {
                console.error('[Corbeille Save Error]', e);
            }
        }
        return item;
    },

    async getCorbeille(organisationId = null) {
        let list = [...DEFAULT_CORBEILLE];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('corbeille').select('*');
                if (organisationId) query = query.eq('organisationid', organisationId.toLowerCase());
                const { data, error } = await query;
                if (!error && Array.isArray(data)) {
                    data.map(fromDbFormat).forEach(dbRow => {
                        const idx = list.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...dbRow };
                        else list.push(dbRow);
                    });
                }
            } catch (e) {}
        }
        if (organisationId) {
            list = list.filter(c => c.organisationId === organisationId);
        }
        return list.map(item => ({
            ...item,
            nomElement: decryptString(item.nomElement),
            auteur: decryptString(item.auteur),
            donneesOriginales: decryptJSON(item.donneesChiffrees)
        }));
    },

    async restoreCorbeilleItem(id) {
        const list = await this.getCorbeille();
        const item = list.find(c => c.id === id);
        if (!item) throw new Error("Élément introuvable dans la corbeille");

        const originalData = item.donneesOriginales || decryptJSON(item.donneesChiffrees);
        if (!originalData) throw new Error("Impossible de déchiffrer les données de sauvegarde");

        const { typeEntite } = item;
        if (typeEntite === 'organisations') {
            await this.createOrganisation(originalData);
        } else if (typeEntite === 'utilisateurs') {
            await this.createUtilisateur(originalData);
        } else if (typeEntite === 'comptes') {
            await this.createCompte(originalData);
        } else if (typeEntite === 'calendrier') {
            await this.createCalendrierRow(originalData);
        } else if (typeEntite === 'incidents') {
            await this.createIncident(originalData);
        } else if (typeEntite === 'todos') {
            await this.createTodo(originalData);
        } else {
            throw new Error(`Type d'entité non pris en charge pour la restauration: ${typeEntite}`);
        }

        await this.deleteCorbeilleItem(id);
        return originalData;
    },

    async deleteCorbeilleItem(id) {
        DEFAULT_CORBEILLE = DEFAULT_CORBEILLE.filter(c => c.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('corbeille').delete().eq('id', id);
            } catch (err) {}
        }
        return true;
    },

    async emptyCorbeille(organisationId = null) {
        if (organisationId) {
            DEFAULT_CORBEILLE = DEFAULT_CORBEILLE.filter(c => c.organisationId !== organisationId);
        } else {
            DEFAULT_CORBEILLE = [];
        }

        if (supabaseUrl && supabaseKey) {
            try {
                if (organisationId) {
                    await supabase.from('corbeille').delete().eq('organisationid', organisationId.toLowerCase());
                } else {
                    await supabase.from('corbeille').delete().neq('id', '');
                }
            } catch (err) {}
        }
        return true;
    },

    // ------------------- ORGANISATIONS -------------------
    async getOrganisations() {
        let list = [...DEFAULT_ORGANISATIONS];
        if (supabaseUrl && supabaseKey) {
            try {
                const { data, error } = await supabase.from('organisations').select('*');
                if (!error && Array.isArray(data)) {
                    data.map(fromDbFormat).forEach(dbRow => {
                        const idx = list.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...dbRow };
                        else list.push(dbRow);
                    });
                }
            } catch (e) {}
        }
        return list;
    },

    async createOrganisation(org) {
        const payload = {
            dateCreation: getLocalDateString(),
            ...org
        };
        const idx = DEFAULT_ORGANISATIONS.findIndex(o => o.id === payload.id);
        if (idx >= 0) DEFAULT_ORGANISATIONS[idx] = payload;
        else DEFAULT_ORGANISATIONS.push(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                const { data, error } = await supabase.from('organisations').upsert([dbPayload]).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return payload;
    },

    async updateOrganisation(id, fields) {
        const idx = DEFAULT_ORGANISATIONS.findIndex(o => o.id === id);
        if (idx >= 0) {
            const snapshot = { ...DEFAULT_ORGANISATIONS[idx] };
            await this.saveToCorbeille('organisations', id, 'UPDATE', snapshot, snapshot.nom);
            DEFAULT_ORGANISATIONS[idx] = { ...DEFAULT_ORGANISATIONS[idx], ...fields };
        }

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                const { data, error } = await supabase.from('organisations').update(dbFields).eq('id', id).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return { id, ...fields };
    },

    async deleteOrganisation(id) {
        const targetOrg = DEFAULT_ORGANISATIONS.find(o => o.id === id);
        if (targetOrg) {
            await this.saveToCorbeille('organisations', id, 'DELETE', targetOrg, targetOrg.nom);
        }
        DEFAULT_ORGANISATIONS = DEFAULT_ORGANISATIONS.filter(o => o.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('organisations').delete().eq('id', id);
            } catch (err) {}
        }
        return true;
    },

    // ------------------- PARAMETRES -------------------
    async getParametres(organisationId = 'org_default') {
        if (!supabaseUrl || !supabaseKey) return DEFAULT_PARAMETRES;
        try {
            const dbOrgId = (organisationId || 'org_default').toLowerCase();
            const { data, error } = await supabase
                .from('parametres')
                .select('data')
                .eq('organisationid', dbOrgId)
                .maybeSingle();

            if (error || !data) {
                return DEFAULT_PARAMETRES;
            }
            const loaded = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
            return { ...DEFAULT_PARAMETRES, ...loaded };
        } catch (e) {
            return DEFAULT_PARAMETRES;
        }
    },

    async saveParametres(paramsObj, organisationId = 'org_default') {
        DEFAULT_PARAMETRES = { ...DEFAULT_PARAMETRES, ...paramsObj };
        if (supabaseUrl && supabaseKey) {
            try {
                const paramId = `param_${organisationId}`;
                await supabase.from('parametres').upsert({ id: paramId, organisationid: organisationId, data: paramsObj });
            } catch (e) {}
        }
        return DEFAULT_PARAMETRES;
    },

    // ------------------- UTILISATEURS -------------------
    async getUtilisateurs(organisationId = null) {
        let list = [...DEFAULT_UTILISATEURS];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('utilisateurs').select('*');
                if (organisationId) query = query.eq('organisationid', organisationId.toLowerCase());
                const { data, error } = await query;
                if (error) {
                    console.error('[Supabase getUtilisateurs Error]', error);
                } else if (Array.isArray(data)) {
                    // Récupération des métadonnées (permissions, contactType, contactNumero) depuis parametres
                    const metaMap = {};
                    try {
                        const { data: metaRows, error: metaErr } = await supabase
                            .from('parametres')
                            .select('id, data')
                            .like('id', 'usermeta_%');
                        if (!metaErr && Array.isArray(metaRows)) {
                            metaRows.forEach(row => {
                                const uid = row.id.replace('usermeta_', '');
                                const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                                metaMap[uid] = d || {};
                            });
                        }
                    } catch (metaErr) {
                        console.warn('[Get Utilisateurs Meta Warning]', metaErr);
                    }

                    data.map(fromDbFormat).forEach(dbRow => {
                        const meta = metaMap[dbRow.id] || {};
                        const mergedRow = {
                            ...dbRow,
                            contactType: meta.contactType || dbRow.contactType || 'WhatsApp',
                            contactNumero: meta.contactNumero || dbRow.contactNumero || '',
                            permissions: meta.permissions !== undefined ? meta.permissions : (dbRow.permissions || null)
                        };
                        const idx = list.findIndex(item => item.id === mergedRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...mergedRow };
                        else list.push(mergedRow);
                    });
                }
            } catch (e) {
                console.error('[getUtilisateurs Exception]', e);
            }
        }
        if (organisationId) {
            return list.filter(u => u.organisationId === organisationId);
        }
        return list;
    },

    async createUtilisateur(user) {
        const id = user.id || ('usr_' + Date.now());
        const payload = {
            id,
            organisationId: 'org_default',
            dateCreation: getLocalDateString(),
            ...user
        };

        if (payload.motDePasse) {
            payload.motDePasse = hashPassword(payload.motDePasse);
        } else {
            payload.motDePasse = hashPassword('123456');
        }

        const idx = DEFAULT_UTILISATEURS.findIndex(u => u.id === payload.id);
        if (idx >= 0) DEFAULT_UTILISATEURS[idx] = payload;
        else DEFAULT_UTILISATEURS.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = sanitizeUtilisateurDb(payload);
                const { data, error } = await supabase.from('utilisateurs').upsert([dbPayload]).select();
                if (error) {
                    console.error('[Supabase createUtilisateur Error]', error);
                }

                // Sauvegarde métadonnées étendues (contactType, contactNumero, permissions) dans parametres
                const metaData = {
                    contactType: payload.contactType || 'WhatsApp',
                    contactNumero: payload.contactNumero || '',
                    permissions: payload.permissions !== undefined ? payload.permissions : null
                };
                const { error: metaErr } = await supabase.from('parametres').upsert({
                    id: `usermeta_${payload.id}`,
                    organisationid: payload.organisationId || 'org_default',
                    data: metaData
                });
                if (metaErr) {
                    console.error('[Supabase createUtilisateur Meta Error]', metaErr);
                }

                if (!error && data && data.length) {
                    const row = fromDbFormat(data[0]);
                    return {
                        ...row,
                        contactType: metaData.contactType,
                        contactNumero: metaData.contactNumero,
                        permissions: metaData.permissions
                    };
                }
            } catch (err) {
                console.error('[createUtilisateur Exception]', err);
            }
        }
        return payload;
    },

    async updateUtilisateur(id, fields) {
        const updatedFields = { ...fields };
        if (updatedFields.motDePasse) {
            updatedFields.motDePasse = hashPassword(updatedFields.motDePasse);
        } else {
            delete updatedFields.motDePasse;
        }

        const idx = DEFAULT_UTILISATEURS.findIndex(u => u.id === id);
        let existingUser = idx >= 0 ? DEFAULT_UTILISATEURS[idx] : null;
        if (existingUser) {
            const snapshot = { ...existingUser };
            await this.saveToCorbeille('utilisateurs', id, 'UPDATE', snapshot, snapshot.nom);
            DEFAULT_UTILISATEURS[idx] = { ...existingUser, ...updatedFields };
        }

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = sanitizeUtilisateurDb(updatedFields);
                delete dbFields.id;

                if (Object.keys(dbFields).length > 0) {
                    const { error } = await supabase.from('utilisateurs').update(dbFields).eq('id', id);
                    if (error) {
                        console.error('[Supabase updateUtilisateur Error]', error);
                    }
                }

                // Métadonnées étendues
                if (updatedFields.contactType !== undefined || updatedFields.contactNumero !== undefined || updatedFields.permissions !== undefined) {
                    const metaUpdate = {
                        contactType: updatedFields.contactType !== undefined ? updatedFields.contactType : (existingUser ? existingUser.contactType : 'WhatsApp'),
                        contactNumero: updatedFields.contactNumero !== undefined ? updatedFields.contactNumero : (existingUser ? existingUser.contactNumero : ''),
                        permissions: updatedFields.permissions !== undefined ? updatedFields.permissions : (existingUser ? existingUser.permissions : null)
                    };
                    const orgId = updatedFields.organisationId || (existingUser ? existingUser.organisationId : 'org_default');
                    const { error: metaErr } = await supabase.from('parametres').upsert({
                        id: `usermeta_${id}`,
                        organisationid: orgId,
                        data: metaUpdate
                    });
                    if (metaErr) {
                        console.error('[Supabase updateUtilisateur Meta Error]', metaErr);
                    }
                }
            } catch (err) {
                console.error('[updateUtilisateur Exception]', err);
            }
        }

        const merged = existingUser ? { ...existingUser, ...updatedFields } : { id, ...updatedFields };
        return merged;
    },

    async deleteUtilisateur(id) {
        const targetUser = DEFAULT_UTILISATEURS.find(u => u.id === id);
        if (targetUser) {
            await this.saveToCorbeille('utilisateurs', id, 'DELETE', targetUser, targetUser.nom);
        }
        DEFAULT_UTILISATEURS = DEFAULT_UTILISATEURS.filter(u => u.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                const { error } = await supabase.from('utilisateurs').delete().eq('id', id);
                if (error) console.error('[Supabase deleteUtilisateur Error]', error);
                await supabase.from('parametres').delete().eq('id', `usermeta_${id}`);
            } catch (err) {
                console.error('[deleteUtilisateur Exception]', err);
            }
        }
        return true;
    },

    // ------------------- COMPTES -------------------
    async getComptes(organisationId = null) {
        let list = [...DEFAULT_COMPTES];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('comptes').select('*');
                if (organisationId) query = query.eq('organisationid', organisationId.toLowerCase());
                const { data, error } = await query;
                if (!error && Array.isArray(data)) {
                    data.map(dbRow => {
                        let extra = {};
                        if (dbRow.notes) {
                            try {
                                extra = JSON.parse(dbRow.notes);
                                if (typeof extra !== 'object' || extra === null) extra = {};
                            } catch (e) {
                                extra = { userNotes: dbRow.notes };
                            }
                        }

                        return {
                            id: dbRow.id,
                            organisationId: dbRow.organisationid || 'org_default',
                            pseudo: dbRow.pseudo || '',
                            agent: dbRow.agent || '',
                            lienProfil: dbRow.lienprofil || '',
                            statut: dbRow.statut || 'Actif',
                            dateCreation: dbRow.datecreation || '',
                            numeroCompte: extra.numeroCompte || dbRow.numerocompte || '',
                            adspowerProfileId: extra.adspowerProfileId || extra.adsPowerUserId || dbRow.adspowerprofileid || '',
                            proxyHost: extra.proxyHost || dbRow.proxyhost || '',
                            telephone: extra.telephone || dbRow.telephone || '',
                            email: extra.email || dbRow.email || '',
                            motDePasse: extra.motDePasse || dbRow.motdepasse || '',
                            gereParInitiales: extra.gereParInitiales || dbRow.gereparinitiales || '',
                            dateStatutCompte: extra.dateStatutCompte || dbRow.datestatutcompte || '',
                            couleurFond: extra.couleurFond || extra.couleur_fond || dbRow.couleur_fond || dbRow.couleurfond || '',
                            taille: extra.taille || extra.taille_vetement || dbRow.taille || '',
                            notes: extra.userNotes !== undefined ? extra.userNotes : (dbRow.notes || '')
                        };
                    }).forEach(dbRow => {
                        const idx = list.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...dbRow };
                        else list.push(dbRow);
                    });
                }
            } catch (e) {}
        }
        if (organisationId) {
            return list.filter(c => c.organisationId === organisationId);
        }
        return list;
    },

    async createCompte(compte) {
        const payload = {
            organisationId: 'org_default',
            statut: 'Actif',
            dateCreation: getLocalDateString(),
            couleurFond: '',
            taille: '',
            notes: '',
            ...compte
        };

        const idx = DEFAULT_COMPTES.findIndex(c => c.id === payload.id);
        if (idx >= 0) DEFAULT_COMPTES[idx] = payload;
        else DEFAULT_COMPTES.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const extraMeta = {
                    numeroCompte: payload.numeroCompte || '',
                    adspowerProfileId: payload.adspowerProfileId || payload.adsPowerUserId || '',
                    proxyHost: payload.proxyHost || '',
                    telephone: payload.telephone || '',
                    email: payload.email || '',
                    motDePasse: payload.motDePasse || '',
                    gereParInitiales: payload.gereParInitiales || '',
                    dateStatutCompte: payload.dateStatutCompte || '',
                    couleurFond: payload.couleurFond || payload.couleur_fond || '',
                    taille: payload.taille || payload.taille_vetement || '',
                    userNotes: payload.notes || '',
                    adsPowerUserId: payload.adspowerProfileId || payload.adsPowerUserId || ''
                };

                const dbPayload = {
                    id: payload.id,
                    organisationid: (payload.organisationId || 'org_default').toLowerCase(),
                    pseudo: payload.pseudo || '',
                    agent: payload.agent || '',
                    lienprofil: payload.lienProfil || '',
                    statut: payload.statut || 'Actif',
                    datecreation: payload.dateCreation || getLocalDateString(),
                    notes: JSON.stringify(extraMeta)
                };

                const { data, error } = await supabase.from('comptes').upsert([dbPayload]).select();
                if (!error && data && data.length) {
                    return payload;
                }
            } catch (err) {}
        }
        return payload;
    },

    async updateCompte(id, fields) {
        const idx = DEFAULT_COMPTES.findIndex(c => c.id === id);
        let existingCompte = idx >= 0 ? DEFAULT_COMPTES[idx] : { id };
        if (idx >= 0) {
            await this.saveToCorbeille('comptes', id, 'UPDATE', { ...existingCompte }, existingCompte.pseudo ? `@${existingCompte.pseudo}` : id);
        }
        const updatedCompte = { ...existingCompte, ...fields };

        if (idx >= 0) DEFAULT_COMPTES[idx] = updatedCompte;

        if (supabaseUrl && supabaseKey) {
            try {
                const extraMeta = {
                    numeroCompte: updatedCompte.numeroCompte || '',
                    adspowerProfileId: updatedCompte.adspowerProfileId || updatedCompte.adsPowerUserId || '',
                    proxyHost: updatedCompte.proxyHost || '',
                    telephone: updatedCompte.telephone || '',
                    email: updatedCompte.email || '',
                    motDePasse: updatedCompte.motDePasse || '',
                    gereParInitiales: updatedCompte.gereParInitiales || '',
                    dateStatutCompte: updatedCompte.dateStatutCompte || '',
                    couleurFond: updatedCompte.couleurFond || updatedCompte.couleur_fond || '',
                    taille: updatedCompte.taille || updatedCompte.taille_vetement || '',
                    userNotes: updatedCompte.notes || '',
                    adsPowerUserId: updatedCompte.adspowerProfileId || updatedCompte.adsPowerUserId || ''
                };

                const dbFields = {
                    organisationid: (updatedCompte.organisationId || 'org_default').toLowerCase(),
                    pseudo: updatedCompte.pseudo || '',
                    agent: updatedCompte.agent || '',
                    statut: updatedCompte.statut || 'Actif',
                    notes: JSON.stringify(extraMeta)
                };


                await supabase.from('comptes').update(dbFields).eq('id', id).select();
            } catch (err) {}
        }
        return updatedCompte;
    },

    async deleteCompte(id) {
        const targetCompte = DEFAULT_COMPTES.find(c => c.id === id);
        if (targetCompte) {
            await this.saveToCorbeille('comptes', id, 'DELETE', targetCompte, targetCompte.pseudo ? `@${targetCompte.pseudo}` : id);
        }
        DEFAULT_COMPTES = DEFAULT_COMPTES.filter(c => c.id !== id);

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('comptes').delete().eq('id', id);
            } catch (err) {}
        }
        return targetCompte || { id, pseudo: id };
    },

    // ------------------- TO-DOS & TÂCHES (PERSISTANCE HYBRIDE SUPABASE) -------------------
    async persistTodosBackup(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return;
        try {
            const oid = (organisationId || 'org_default').toLowerCase();
            const todosForOrg = DEFAULT_TODOS.filter(t => !t.organisationId || t.organisationId.toLowerCase() === oid);
            await supabase.from('parametres').upsert([{
                id: 'todos_' + oid,
                organisationid: oid,
                data: { todos: todosForOrg }
            }]);
        } catch(err) {
            console.error('[Supabase Backup Todos error]', err);
        }
    },

    async getTodos(organisationId = null) {
        const orgKey = (organisationId || 'org_default').toLowerCase();
        let loadedFromRemote = false;

        if (supabaseUrl && supabaseKey) {
            // 1. Essai direct sur la table 'todos'
            try {
                let query = supabase.from('todos').select('*');
                if (organisationId) query = query.eq('organisationid', orgKey);
                const { data, error } = await query;
                if (!error && Array.isArray(data) && data.length > 0) {
                    data.map(fromDbFormat).forEach(dbRow => {
                        const idx = DEFAULT_TODOS.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) DEFAULT_TODOS[idx] = { ...DEFAULT_TODOS[idx], ...dbRow };
                        else DEFAULT_TODOS.push(dbRow);
                    });
                    loadedFromRemote = true;
                }
            } catch (e) {}

            // 2. Si la table 'todos' n'existe pas ou est vide, synchroniser depuis le stockage cloud Supabase 'parametres'
            try {
                const { data: paramData, error: paramError } = await supabase
                    .from('parametres')
                    .select('*')
                    .eq('id', 'todos_' + orgKey);
                
                if (!paramError && Array.isArray(paramData) && paramData.length > 0 && paramData[0].data && Array.isArray(paramData[0].data.todos)) {
                    const remoteTodos = paramData[0].data.todos;
                    if (!loadedFromRemote) {
                        // Conserver les tâches des autres organisations et charger celles de cette org
                        DEFAULT_TODOS = DEFAULT_TODOS.filter(t => t.organisationId && t.organisationId.toLowerCase() !== orgKey);
                        remoteTodos.forEach(rt => DEFAULT_TODOS.push(rt));
                        loadedFromRemote = true;
                    } else {
                        // Si chargé depuis la table 'todos', fusionner les photos depuis le backup au cas où la table n'a pas la colonne
                        remoteTodos.forEach(rt => {
                            const idx = DEFAULT_TODOS.findIndex(t => t.id === rt.id);
                            if (idx >= 0 && Array.isArray(rt.photos) && rt.photos.length > 0) {
                                if (!DEFAULT_TODOS[idx].photos || DEFAULT_TODOS[idx].photos.length === 0) {
                                    DEFAULT_TODOS[idx].photos = rt.photos;
                                }
                            }
                        });
                    }
                }
            } catch(e) {}
        }

        // Si première initialisation, sauvegarder l'état initial dans Supabase
        if (!loadedFromRemote && supabaseUrl && supabaseKey) {
            await this.persistTodosBackup(organisationId || 'org_default');
        }

        if (organisationId) {
            return DEFAULT_TODOS.filter(t => !t.organisationId || t.organisationId.toLowerCase() === orgKey);
        }
        return [...DEFAULT_TODOS];
    },

    async createTodo(todo) {
        const orgId = (todo.organisationId || 'org_default').toLowerCase();
        const payload = {
            id: todo.id || ("todo_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4)),
            organisationId: orgId,
            titre: todo.titre || 'Nouvelle tâche',
            description: todo.description || '',
            priorite: todo.priorite || 'moyenne',
            statut: todo.statut || 'a_faire',
            agent: todo.agent || todo.agentAssigne || 'Tous',
            agentAssigne: todo.agentAssigne || todo.agent || 'Tous',
            compteId: todo.compteId || '',
            compteNom: todo.compteNom || todo.comptePseudo || '',
            comptePseudo: todo.comptePseudo || todo.compteNom || '',
            categorie: todo.categorie || 'Autre',
            dateEcheance: todo.dateEcheance || null,
            heureEcheance: todo.heureEcheance || null,
            rappelMinutes: parseInt(todo.rappelMinutes) || 15,
            alerteSonore: todo.alerteSonore !== false,
            sousTaches: Array.isArray(todo.sousTaches) ? todo.sousTaches : [],
            photos: Array.isArray(todo.photos) ? todo.photos : [],
            dateCreation: todo.dateCreation || new Date().toISOString(),
            dateTerminee: todo.statut === 'terminee' ? (todo.dateTerminee || new Date().toISOString()) : null,
            creePar: todo.creePar || todo.auteur || 'Florencio',
            terminePar: todo.statut === 'terminee' ? (todo.terminePar || todo.modifiePar || todo.creePar || '') : null
        };
        const idx = DEFAULT_TODOS.findIndex(t => t.id === payload.id);
        if (idx >= 0) DEFAULT_TODOS[idx] = payload;
        else DEFAULT_TODOS.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('todos').upsert([toDbFormat(payload)]);
            } catch (e) {}
            await this.persistTodosBackup(orgId);
        }
        return payload;
    },

    async updateTodo(id, fields) {
        const idx = DEFAULT_TODOS.findIndex(t => t.id === id);
        let updatedItem = null;
        let orgId = 'org_default';

        if (idx >= 0) {
            const oldItem = { ...DEFAULT_TODOS[idx] };
            await this.saveToCorbeille('todos', id, 'UPDATE', oldItem, oldItem.titre);
            
            const mergedFields = { ...fields };
            if (fields.statut === 'terminee' && oldItem.statut !== 'terminee') {
                mergedFields.dateTerminee = fields.dateTerminee || new Date().toISOString();
                if (fields.modifiePar || fields.terminePar) {
                    mergedFields.terminePar = fields.terminePar || fields.modifiePar;
                }
            } else if (fields.statut && fields.statut !== 'terminee') {
                mergedFields.dateTerminee = null;
                mergedFields.terminePar = null;
            }

            DEFAULT_TODOS[idx] = { ...DEFAULT_TODOS[idx], ...mergedFields };
            updatedItem = DEFAULT_TODOS[idx];
            orgId = updatedItem.organisationId || 'org_default';
        } else {
            updatedItem = { id, ...fields };
            DEFAULT_TODOS.unshift(updatedItem);
            orgId = updatedItem.organisationId || 'org_default';
        }

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('todos').update(toDbFormat(fields)).eq('id', id);
            } catch (e) {}
            await this.persistTodosBackup(orgId);
        }
        return updatedItem;
    },

    async deleteTodo(id) {
        const target = DEFAULT_TODOS.find(t => t.id === id);
        const orgId = target ? (target.organisationId || 'org_default') : 'org_default';
        if (target) {
            await this.saveToCorbeille('todos', id, 'DELETE', target, target.titre);
        }
        DEFAULT_TODOS = DEFAULT_TODOS.filter(t => t.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('todos').delete().eq('id', id);
            } catch (e) {}
            await this.persistTodosBackup(orgId);
        }
        return true;
    },

    async bulkUpdateTodos(ids, fields) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        let orgId = 'org_default';
        for (const id of ids) {
            const item = DEFAULT_TODOS.find(t => t.id === id);
            if (item) {
                orgId = item.organisationId || orgId;
                await this.saveToCorbeille('todos', id, 'UPDATE', { ...item }, item.titre);
            }
        }
        DEFAULT_TODOS = DEFAULT_TODOS.map(t => {
            if (!ids.includes(t.id)) return t;
            const merged = { ...t, ...fields };
            if (fields.statut === 'terminee' && t.statut !== 'terminee') {
                merged.dateTerminee = fields.dateTerminee || new Date().toISOString();
                if (fields.modifiePar || fields.terminePar) {
                    merged.terminePar = fields.terminePar || fields.modifiePar;
                }
            } else if (fields.statut && fields.statut !== 'terminee') {
                merged.dateTerminee = null;
                merged.terminePar = null;
            }
            return merged;
        });
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('todos').update(toDbFormat(fields)).in('id', ids);
            } catch (e) {}
            await this.persistTodosBackup(orgId);
        }
        return true;
    },

    async bulkDeleteTodos(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        let orgId = 'org_default';
        for (const id of ids) {
            const item = DEFAULT_TODOS.find(t => t.id === id);
            if (item) {
                orgId = item.organisationId || orgId;
                await this.saveToCorbeille('todos', id, 'DELETE', item, item.titre);
            }
        }
        DEFAULT_TODOS = DEFAULT_TODOS.filter(t => !ids.includes(t.id));
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('todos').delete().in('id', ids);
            } catch (e) {}
            await this.persistTodosBackup(orgId);
        }
        return true;
    },

    // ------------------- PUBLICATIONS & CALENDRIER (MÉTRIQUES AGENTS & SKUS) -------------------
    async getCalendrier(organisationId = null) {
        const now = Date.now();
        if (!global._CACHED_CALENDRIER || (now - (global._CACHE_CALENDRIER_TIME || 0)) > 180000) {
            try {
                if (supabaseUrl && supabaseKey) {
                    const { count, error: countErr } = await supabase.from('calendrier').select('*', { count: 'exact', head: true });
                    if (!countErr && typeof count === 'number' && count > 0) {
                        const batchPromises = [];
                        for (let from = 0; from < count; from += 1000) {
                            batchPromises.push(supabase.from('calendrier').select('*').range(from, from + 999));
                        }
                        const results = await Promise.all(batchPromises);
                        let allRows = [];
                        for (const r of results) {
                            if (r.data && Array.isArray(r.data)) {
                                allRows = allRows.concat(r.data.map(fromDbFormat));
                            }
                        }
                        global._CACHED_CALENDRIER = allRows;
                        global._CACHE_CALENDRIER_TIME = now;
                    }
                }
            } catch (err) {
                console.error("[getCalendrier Supabase Cache Error]", err.message);
            }
            if (!global._CACHED_CALENDRIER) {
                global._CACHED_CALENDRIER = [...DEFAULT_CALENDRIER];
            }
        }

        let list = global._CACHED_CALENDRIER || [];
        if (organisationId) {
            return list.filter(l => !l.organisationId || l.organisationId.toLowerCase() === organisationId.toLowerCase());
        }
        return list;
    },

    async getCalendrierRowById(id) {
        const all = await this.getCalendrier();
        return all.find(l => l.id === id) || null;
    },

    async createCalendrierRow(row) {
        const payload = {
            id: row.id || ("ligne_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4)),
            organisationId: row.organisationId || 'org_default',
            ...row,
            heuresVentesReposts: Array.isArray(row.heuresVentesReposts) ? row.heuresVentesReposts : []
        };
        if (!global._CACHED_CALENDRIER) global._CACHED_CALENDRIER = [];
        const idx = global._CACHED_CALENDRIER.findIndex(l => l.id === payload.id);
        if (idx >= 0) global._CACHED_CALENDRIER[idx] = payload;
        else global._CACHED_CALENDRIER.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                await supabase.from('calendrier').upsert([dbPayload]);
            } catch (err) {}
        }
        return payload;
    },

    async updateCalendrierRow(id, fields) {
        if (!global._CACHED_CALENDRIER) await this.getCalendrier();
        const idx = (global._CACHED_CALENDRIER || []).findIndex(l => l.id === id);
        if (idx >= 0) {
            const oldRow = { ...global._CACHED_CALENDRIER[idx] };
            await this.saveToCorbeille('calendrier', id, 'UPDATE', oldRow);
            global._CACHED_CALENDRIER[idx] = { ...global._CACHED_CALENDRIER[idx], ...fields };
        }
        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                await supabase.from('calendrier').update(dbFields).eq('id', id);
            } catch (err) {}
        }
        return { id, ...fields };
    },

    async deleteCalendrierRow(id) {
        if (!global._CACHED_CALENDRIER) await this.getCalendrier();
        const targetRow = (global._CACHED_CALENDRIER || []).find(l => l.id === id);
        if (targetRow) {
            await this.saveToCorbeille('calendrier', id, 'DELETE', targetRow);
        }
        if (global._CACHED_CALENDRIER) {
            global._CACHED_CALENDRIER = global._CACHED_CALENDRIER.filter(l => l.id !== id);
        }
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('calendrier').delete().eq('id', id);
            } catch (err) {}
        }
        return true;
    },

    async bulkUpdateCalendrierRows(ids, fields) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        if (!global._CACHED_CALENDRIER) await this.getCalendrier();
        for (const id of ids) {
            const item = (global._CACHED_CALENDRIER || []).find(l => l.id === id);
            if (item) await this.saveToCorbeille('calendrier', id, 'UPDATE', { ...item });
        }
        if (global._CACHED_CALENDRIER) {
            global._CACHED_CALENDRIER = global._CACHED_CALENDRIER.map(l => ids.includes(l.id) ? { ...l, ...fields } : l);
        }
        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                await supabase.from('calendrier').update(dbFields).in('id', ids);
            } catch (err) {}
        }
        return true;
    },

    async bulkDeleteCalendrierRows(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        if (!global._CACHED_CALENDRIER) await this.getCalendrier();
        for (const id of ids) {
            const item = (global._CACHED_CALENDRIER || []).find(l => l.id === id);
            if (item) await this.saveToCorbeille('calendrier', id, 'DELETE', item);
        }
        if (global._CACHED_CALENDRIER) {
            global._CACHED_CALENDRIER = global._CACHED_CALENDRIER.filter(l => !ids.includes(l.id));
        }
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('calendrier').delete().in('id', ids);
            } catch (err) {}
        }
        return true;
    },

    async bulkUpdateComptes(ids, fields) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        for (const id of ids) {
            const item = DEFAULT_COMPTES.find(c => c.id === id);
            if (item) await this.saveToCorbeille('comptes', id, 'UPDATE', { ...item }, item.pseudo ? `@${item.pseudo}` : id);
        }
        DEFAULT_COMPTES = DEFAULT_COMPTES.map(c => ids.includes(c.id) ? { ...c, ...fields } : c);
        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                await supabase.from('comptes').update(dbFields).in('id', ids);
            } catch (err) {}
        }
        return true;
    },

    async bulkDeleteComptes(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        for (const id of ids) {
            const item = DEFAULT_COMPTES.find(c => c.id === id);
            if (item) await this.saveToCorbeille('comptes', id, 'DELETE', item, item.pseudo ? `@${item.pseudo}` : id);
        }
        DEFAULT_COMPTES = DEFAULT_COMPTES.filter(c => !ids.includes(c.id));
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('comptes').delete().in('id', ids);
            } catch (err) {}
        }
        return true;
    },

    async bulkDeleteUtilisateurs(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        for (const id of ids) {
            const item = DEFAULT_UTILISATEURS.find(u => u.id === id);
            if (item) await this.saveToCorbeille('utilisateurs', id, 'DELETE', item, item.nom);
        }
        DEFAULT_UTILISATEURS = DEFAULT_UTILISATEURS.filter(u => !ids.includes(u.id));
        if (supabaseUrl && supabaseKey) {
            try {
                const { error } = await supabase.from('utilisateurs').delete().in('id', ids);
                if (error) console.error('[Supabase bulkDeleteUtilisateurs Error]', error);
                const metaIds = ids.map(id => `usermeta_${id}`);
                await supabase.from('parametres').delete().in('id', metaIds);
            } catch (err) {
                console.error('[bulkDeleteUtilisateurs Exception]', err);
            }
        }
        return true;
    },

    async bulkDeleteIncidents(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        for (const id of ids) {
            const item = DEFAULT_INCIDENTS.find(i => i.id === id);
            if (item) await this.saveToCorbeille('incidents', id, 'DELETE', item);
        }
        DEFAULT_INCIDENTS = DEFAULT_INCIDENTS.filter(i => !ids.includes(i.id));
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('incidents').delete().in('id', ids);
            } catch (err) {}
        }
        return true;
    },

    // ------------------- INCIDENTS (PERSISTANCE HYBRIDE & PHOTOS) -------------------
    async persistIncidentsBackup(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return;
        try {
            const oid = (organisationId || 'org_default').toLowerCase();
            const incidentsForOrg = DEFAULT_INCIDENTS.filter(i => !i.organisationId || i.organisationId.toLowerCase() === oid);
            await supabase.from('parametres').upsert([{
                id: 'incidents_' + oid,
                organisationid: oid,
                data: { incidents: incidentsForOrg }
            }]);
        } catch(err) {
            console.error('[Supabase Backup Incidents error]', err);
        }
    },

    async getIncidents(organisationId = null) {
        const orgKey = (organisationId || 'org_default').toLowerCase();
        let list = [...DEFAULT_INCIDENTS];
        if (supabaseUrl && supabaseKey) {
            // 1. Table SQL 'incidents'
            try {
                let query = supabase.from('incidents').select('*');
                if (organisationId) query = query.eq('organisationid', orgKey);
                const { data, error } = await query;
                if (!error && Array.isArray(data)) {
                    data.map(fromDbFormat).forEach(dbRow => {
                        const idx = list.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...dbRow };
                        else list.push(dbRow);
                    });
                }
            } catch (e) {}

            // 2. Backup JSON dans 'parametres' pour conserver les photos et notes étendues
            try {
                const { data: paramRow, error: paramErr } = await supabase
                    .from('parametres')
                    .select('data')
                    .eq('id', 'incidents_' + orgKey)
                    .maybeSingle();

                if (!paramErr && paramRow && paramRow.data && Array.isArray(paramRow.data.incidents)) {
                    paramRow.data.incidents.forEach(bkInc => {
                        const idx = list.findIndex(item => item.id === bkInc.id);
                        if (idx >= 0) {
                            list[idx] = {
                                ...bkInc,
                                ...list[idx],
                                photos: (bkInc.photos && bkInc.photos.length > 0) ? bkInc.photos : (list[idx].photos || [])
                            };
                        } else {
                            list.push(bkInc);
                        }
                    });
                }
            } catch (e) {}
        }
        if (organisationId) {
            return list.filter(i => i.organisationId === organisationId);
        }
        return list;
    },

    async createIncident(incident) {
        const payload = {
            organisationId: 'org_default',
            ...incident,
            heuresPubs24h: Array.isArray(incident.heuresPubs24h) ? incident.heuresPubs24h : [],
            detailVentes: Array.isArray(incident.detailVentes) ? incident.detailVentes : [],
            photos: Array.isArray(incident.photos) ? incident.photos : []
        };
        DEFAULT_INCIDENTS.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                await supabase.from('incidents').upsert([dbPayload]);
            } catch (err) {}
            await this.persistIncidentsBackup(payload.organisationId);
        }
        return payload;
    },

    async updateIncident(id, updates) {
        const idx = DEFAULT_INCIDENTS.findIndex(i => i.id === id);
        if (idx >= 0) {
            DEFAULT_INCIDENTS[idx] = { ...DEFAULT_INCIDENTS[idx], ...updates };
        }
        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(updates);
                await supabase.from('incidents').update(dbPayload).eq('id', id);
            } catch (err) {}
            const target = DEFAULT_INCIDENTS.find(i => i.id === id);
            await this.persistIncidentsBackup(target ? target.organisationId : 'org_default');
        }
        return true;
    },

    async deleteIncident(id) {
        const item = DEFAULT_INCIDENTS.find(i => i.id === id);
        if (item) await this.saveToCorbeille('incidents', id, 'DELETE', item);
        DEFAULT_INCIDENTS = DEFAULT_INCIDENTS.filter(i => i.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('incidents').delete().eq('id', id);
            } catch (err) {}
            await this.persistIncidentsBackup(item ? item.organisationId : 'org_default');
        }
        return true;
    },

    // ------------------- JOURNAL -------------------
    async getJournal(organisationId = null) {
        let list = [...DEFAULT_JOURNAL];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('journal').select('*').order('horodatage', { ascending: false });
                if (organisationId) query = query.eq('organisationid', organisationId.toLowerCase());
                const { data, error } = await query;
                if (!error && Array.isArray(data)) {
                    data.map(fromDbFormat).forEach(dbRow => {
                        const idx = list.findIndex(item => item.id === dbRow.id);
                        if (idx >= 0) list[idx] = { ...list[idx], ...dbRow };
                        else list.push(dbRow);
                    });
                }
            } catch (e) {}
        }
        if (organisationId) {
            return list.filter(j => j.organisationId === organisationId);
        }
        return list;
    },

    async logAction(action, detail, resultat, organisationId = 'org_default') {
        const id = "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const horodatage = new Date().toISOString();
        const payload = { id, organisationId, horodatage, action, detail, resultat };
        DEFAULT_JOURNAL.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                await supabase.from('journal').upsert([dbPayload]);
            } catch (err) {}
        }
    },

    // ------------------- MESSAGES & INBOX VINTED -------------------
    async getMessages(organisationId = 'org_default') {
        if (supabaseUrl && supabaseKey) {
            try {
                const { data, error } = await supabase
                    .from('messages_vinted')
                    .select('*')
                    .eq('organisationid', organisationId);
                if (!error && data) {
                    return data.map(fromDbFormat);
                }
            } catch (err) {}
        }
        return (global.DEFAULT_MESSAGES || []).filter(m => (m.organisationId || 'org_default') === organisationId);
    },

    async saveMessage(msgData) {
        if (!global.DEFAULT_MESSAGES) global.DEFAULT_MESSAGES = [];
        const item = {
            id: msgData.id || "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            organisationId: msgData.organisationId || 'org_default',
            compteId: msgData.compteId || '',
            pseudo: msgData.pseudo || '',
            conversationId: msgData.conversationId || '',
            auteur: msgData.auteur || '',
            contenu: msgData.contenu || '',
            statutLecture: msgData.statutLecture || 'non_lu',
            dateMessage: msgData.dateMessage || new Date().toISOString().split('T')[0],
            heureMessage: msgData.heureMessage || new Date().toTimeString().split(' ')[0].substring(0, 5),
            sku: msgData.sku || ''
        };

        const existingIdx = global.DEFAULT_MESSAGES.findIndex(m => m.id === item.id || (item.conversationId && m.conversationId === item.conversationId));
        if (existingIdx >= 0) {
            global.DEFAULT_MESSAGES[existingIdx] = { ...global.DEFAULT_MESSAGES[existingIdx], ...item };
        } else {
            global.DEFAULT_MESSAGES.unshift(item);
        }

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('messages_vinted').upsert([toDbFormat(item)]);
            } catch (err) {}
        }
        return item;
    },

    // ------------------- GESTION DES STOCKS MULTI-ONGLETS -------------------
    async getStock(organisationId = 'org_default') {
        const oid = (organisationId || 'org_default').toLowerCase();
        let stockData = global[`STOCK_${oid}`] || DEFAULT_STOCK;

        if (supabaseUrl && supabaseKey) {
            try {
                const { data, error } = await supabase
                    .from('parametres')
                    .select('data')
                    .eq('id', 'stock_' + oid)
                    .maybeSingle();

                if (!error && data && data.data && data.data.stock) {
                    stockData = data.data.stock;
                    global[`STOCK_${oid}`] = stockData;
                }
            } catch (err) {
                console.error('[Supabase getStock error]', err);
            }
        }
        return stockData;
    },

    async persistStock(organisationId = 'org_default', stockData) {
        const oid = (organisationId || 'org_default').toLowerCase();
        global[`STOCK_${oid}`] = stockData;

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('parametres').upsert([{
                    id: 'stock_' + oid,
                    organisationid: oid,
                    data: { stock: stockData }
                }]);
            } catch (err) {
                console.error('[Supabase persistStock error]', err);
            }
        }
        return stockData;
    },

    async saveStockTab(organisationId = 'org_default', tabKey, items) {
        const currentStock = await this.getStock(organisationId);
        const updatedStock = { ...currentStock };
        if (updatedStock[tabKey]) {
            updatedStock[tabKey] = {
                ...updatedStock[tabKey],
                items: Array.isArray(items) ? items : []
            };
        } else {
            updatedStock[tabKey] = {
                key: tabKey,
                name: tabKey.toUpperCase(),
                icon: 'fa-box-open',
                items: Array.isArray(items) ? items : []
            };
        }
        return await this.persistStock(organisationId, updatedStock);
    },

    async saveStockItem(organisationId = 'org_default', tabKey, itemData) {
        const currentStock = await this.getStock(organisationId);
        const updatedStock = { ...currentStock };
        if (!updatedStock[tabKey]) {
            updatedStock[tabKey] = {
                key: tabKey,
                name: tabKey.toUpperCase(),
                icon: 'fa-box-open',
                items: []
            };
        }

        const items = [...(updatedStock[tabKey].items || [])];
        const existingIdx = items.findIndex(it => it.id === itemData.id);

        if (existingIdx >= 0) {
            items[existingIdx] = { ...items[existingIdx], ...itemData };
        } else {
            const newItem = {
                id: itemData.id || `stock_${tabKey}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                ...itemData
            };
            items.unshift(newItem);
        }

        updatedStock[tabKey] = {
            ...updatedStock[tabKey],
            items
        };

        await this.persistStock(organisationId, updatedStock);
        return { success: true, item: itemData, tabKey };
    },

    async deleteStockItem(organisationId = 'org_default', tabKey, itemId) {
        const currentStock = await this.getStock(organisationId);
        const updatedStock = { ...currentStock };
        if (!updatedStock[tabKey] || !Array.isArray(updatedStock[tabKey].items)) return false;

        updatedStock[tabKey].items = updatedStock[tabKey].items.filter(it => it.id !== itemId);
        await this.persistStock(organisationId, updatedStock);
        return true;
    },

    async syncGoogleStock(organisationId = 'org_default') {
        const { execSync } = require('child_process');
        const gids = [
            { key: 'tops', name: 'TOPS', icon: 'fa-shirt', gid: '0' },
            { key: 'bas', name: 'BAS', icon: 'fa-socks', gid: '96160675' },
            { key: 'robes', name: 'ROBES + ENSEMBLES', icon: 'fa-person-dress', gid: '827780982' },
            { key: 'maillots', name: 'MAILLOTS', icon: 'fa-person-swimming', gid: '1160523751' },
            { key: 'divers', name: 'DIVERS', icon: 'fa-box-open', gid: '645845453' },
            { key: 'bijoux', name: 'BIJOUX', icon: 'fa-gem', gid: '1281491528' },
            { key: 'chaussures', name: 'CHAUSSURES', icon: 'fa-shoe-prints', gid: '1756531177' },
            { key: 'sacs', name: 'SACS', icon: 'fa-bag-shopping', gid: '1519340196' }
        ];

        function parseCsv(text) {
            const lines = text.split('\n');
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cells = [];
                let current = '';
                let inQuotes = false;
                for (let j = 0; j < line.length; j++) {
                    const c = line[j];
                    if (c === '"') inQuotes = !inQuotes;
                    else if (c === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
                    else current += c;
                }
                cells.push(current.trim());
                result.push(cells);
            }
            return result;
        }

        function normalizePhoto(val) {
            if (!val || typeof val !== 'string') return { photo: '', note: '' };
            let clean = val.trim();
            if (clean.startsWith('=IMAGE(') && clean.endsWith(')')) {
                const m = clean.match(/=IMAGE\s*\(\s*["\x27]([^"\x27]+)["\x27]/i);
                if (m) clean = m[1].trim();
            }
            // Support direct des liens Google Drive (/file/d/ID ou ?id=ID)
            const gd = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (gd && (clean.includes('drive.google.com') || clean.includes('docs.google.com'))) {
                return { photo: `https://drive.google.com/thumbnail?id=${gd[1]}&sz=w1000`, note: '' };
            }
            if (/^https?:\/\//i.test(clean) || clean.startsWith('data:image/')) {
                return { photo: clean, note: '' };
            }
            // Note textuelle en colonne photo ("PLUS DISPONIBLE SUR SHEIN", etc.)
            return { photo: '', note: clean };
        }

        const currentStock = await this.getStock(organisationId);
        const freshStock = {};
        for (const tab of gids) {
            try {
                const raw = execSync(`curl -sL "https://docs.google.com/spreadsheets/d/1oQUUfCg6orAkTApNDYLQekKJxTXE6B-rttdxVeXro_0/export?format=csv&gid=${tab.gid}"`).toString();
                const rows = parseCsv(raw);

                // Indexation des articles existants pour préserver les photos ajoutées par les utilisateurs
                const existingMap = {};
                if (currentStock && currentStock[tab.key] && Array.isArray(currentStock[tab.key].items)) {
                    currentStock[tab.key].items.forEach(it => {
                        if (it.sku) existingMap[it.sku.toLowerCase().trim()] = it;
                        if (it.id) existingMap[it.id] = it;
                    });
                }

                const items = rows.map((r, idx) => {
                    const parsedPhoto = normalizePhoto(r[1]);
                    const existingItem = (r[0] ? existingMap[r[0].toLowerCase().trim()] : null) || existingMap[`stock_${tab.key}_${idx + 1}`];

                    // Préservation de la photo locale si le Sheet n'en a pas
                    const existingPhotoValid = existingItem && existingItem.photo && (existingItem.photo.startsWith('http') || existingItem.photo.startsWith('/assets/') || existingItem.photo.startsWith('data:image/'));
                    const finalPhoto = existingPhotoValid ? existingItem.photo : (parsedPhoto.photo || '');
                    const finalNotes = (existingItem && existingItem.notes) ? existingItem.notes : parsedPhoto.note;

                    if (tab.key === 'chaussures') {
                        return {
                            id: `stock_${tab.key}_${idx + 1}`,
                            sku: r[0] || '',
                            photo: finalPhoto,
                            taille: r[2] || '',
                            qte: parseInt(r[3]) || (r[3] ? 1 : 0),
                            localisation: r[4] || '',
                            notes: finalNotes || ''
                        };
                    }
                    return {
                        id: `stock_${tab.key}_${idx + 1}`,
                        sku: r[0] || '',
                        photo: finalPhoto,
                        tailleS: r[2] || '',
                        tailleM: r[3] || '',
                        tailleL: r[4] || '',
                        tailleXL: r[5] || '',
                        tailleUnique: r[6] || '',
                        localisation: r[7] || '',
                        notes: finalNotes || ''
                    };
                }).filter(it => it.sku || it.localisation || it.tailleS || it.tailleM || it.tailleL || it.tailleXL || it.tailleUnique || it.qte);

                freshStock[tab.key] = {
                    key: tab.key,
                    name: tab.name,
                    icon: tab.icon,
                    items
                };
            } catch (e) {
                console.error(`Error syncing tab ${tab.name}:`, e.message);
            }
        }

        await this.persistStock(organisationId, freshStock);
        return freshStock;
    },

    // ------------------- RESTORE COMPLET -------------------
    async restoreFullDatabase({ parametres, organisations, utilisateurs, comptes, calendrier, incidents, journal }) {
        if (parametres) await this.saveParametres(parametres);
        if (Array.isArray(organisations)) DEFAULT_ORGANISATIONS = [...organisations];
        if (Array.isArray(utilisateurs)) DEFAULT_UTILISATEURS = [...utilisateurs];
        if (Array.isArray(comptes)) DEFAULT_COMPTES = [...comptes];
        if (Array.isArray(calendrier)) DEFAULT_CALENDRIER = [...calendrier];
        if (Array.isArray(incidents)) DEFAULT_INCIDENTS = [...incidents];
        if (Array.isArray(journal)) DEFAULT_JOURNAL = [...journal];

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('organisations').delete().neq('id', '');
                await supabase.from('utilisateurs').delete().neq('id', '');
                await supabase.from('comptes').delete().neq('id', '');
                await supabase.from('calendrier').delete().neq('id', '');
                await supabase.from('incidents').delete().neq('id', '');
                await supabase.from('journal').delete().neq('id', '');

                if (organisations.length) await supabase.from('organisations').upsert(organisations.map(toDbFormat));
                if (utilisateurs.length) {
                    await supabase.from('utilisateurs').upsert(utilisateurs.map(sanitizeUtilisateurDb));
                    for (const u of utilisateurs) {
                        if (u.contactType || u.contactNumero || u.permissions) {
                            await supabase.from('parametres').upsert({
                                id: `usermeta_${u.id}`,
                                organisationid: u.organisationId || 'org_default',
                                data: {
                                    contactType: u.contactType || 'WhatsApp',
                                    contactNumero: u.contactNumero || '',
                                    permissions: u.permissions || null
                                }
                            });
                        }
                    }
                }
                if (comptes.length) await supabase.from('comptes').upsert(comptes.map(toDbFormat));
                if (calendrier.length) await supabase.from('calendrier').upsert(calendrier.map(toDbFormat));
            } catch (e) {
                console.error('[restoreFullDatabase Exception]', e);
            }
        }
    }
};

module.exports = dbService;
