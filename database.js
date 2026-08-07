require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kdtmpgcsfawbsiiscazu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_EStL78lhwgNnP2RVOTmRTw_6XYeSTKJ';

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
    dateaction: 'dateAction'
};

function toDbFormat(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const dbObj = {};
    for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        let value = obj[key];
        if (['heuresventesreposts', 'heurespubs24h', 'detailventes'].includes(lowerKey)) {
            if (Array.isArray(value) || typeof value === 'object') {
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
        if (['heuresVentesReposts', 'heuresPubs24h', 'detailVentes'].includes(camelKey)) {
            if (typeof value === 'string') {
                try { value = JSON.parse(value); } catch (e) { value = []; }
            }
        }
        res[camelKey] = value;
    }
    return res;
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
            return list.filter(u => u.organisationId === organisationId);
        }
        return list;
    },

    async createUtilisateur(user) {
        const payload = {
            organisationId: 'org_default',
            dateCreation: getLocalDateString(),
            ...user
        };

        if (payload.motDePasse) {
            payload.motDePasse = hashPassword(payload.motDePasse);
        }

        const idx = DEFAULT_UTILISATEURS.findIndex(u => u.id === payload.id);
        if (idx >= 0) DEFAULT_UTILISATEURS[idx] = payload;
        else DEFAULT_UTILISATEURS.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                const { data, error } = await supabase.from('utilisateurs').upsert([dbPayload]).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return payload;
    },

    async updateUtilisateur(id, fields) {
        const updatedFields = { ...fields };
        if (updatedFields.motDePasse) {
            updatedFields.motDePasse = hashPassword(updatedFields.motDePasse);
        }

        const idx = DEFAULT_UTILISATEURS.findIndex(u => u.id === id);
        if (idx >= 0) {
            const snapshot = { ...DEFAULT_UTILISATEURS[idx] };
            await this.saveToCorbeille('utilisateurs', id, 'UPDATE', snapshot, snapshot.nom);
            DEFAULT_UTILISATEURS[idx] = { ...DEFAULT_UTILISATEURS[idx], ...updatedFields };
        }

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(updatedFields);
                const { data, error } = await supabase.from('utilisateurs').update(dbFields).eq('id', id).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return { id, ...updatedFields };
    },

    async deleteUtilisateur(id) {
        const targetUser = DEFAULT_UTILISATEURS.find(u => u.id === id);
        if (targetUser) {
            await this.saveToCorbeille('utilisateurs', id, 'DELETE', targetUser, targetUser.nom);
        }
        DEFAULT_UTILISATEURS = DEFAULT_UTILISATEURS.filter(u => u.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('utilisateurs').delete().eq('id', id);
            } catch (err) {}
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
                            telephone: extra.telephone || dbRow.telephone || '',
                            email: extra.email || dbRow.email || '',
                            motDePasse: extra.motDePasse || dbRow.motdepasse || '',
                            gereParInitiales: extra.gereParInitiales || dbRow.gereparinitiales || '',
                            dateStatutCompte: extra.dateStatutCompte || dbRow.datestatutcompte || '',
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
                    telephone: payload.telephone || '',
                    email: payload.email || '',
                    motDePasse: payload.motDePasse || '',
                    gereParInitiales: payload.gereParInitiales || '',
                    dateStatutCompte: payload.dateStatutCompte || '',
                    userNotes: payload.notes || ''
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
                    telephone: updatedCompte.telephone || '',
                    email: updatedCompte.email || '',
                    motDePasse: updatedCompte.motDePasse || '',
                    gereParInitiales: updatedCompte.gereParInitiales || '',
                    dateStatutCompte: updatedCompte.dateStatutCompte || '',
                    userNotes: updatedCompte.notes || ''
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
        if (fields.agent) {
            DEFAULT_CALENDRIER.forEach(l => {
                if (l.compteId === id) l.agent = fields.agent;
            });
        }
        return updatedCompte;
    },

    async deleteCompte(id) {
        const targetCompte = DEFAULT_COMPTES.find(c => c.id === id);
        if (targetCompte) {
            await this.saveToCorbeille('comptes', id, 'DELETE', targetCompte, targetCompte.pseudo ? `@${targetCompte.pseudo}` : id);
        }
        DEFAULT_COMPTES = DEFAULT_COMPTES.filter(c => c.id !== id);
        DEFAULT_CALENDRIER = DEFAULT_CALENDRIER.filter(l => l.compteId !== id);

        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('comptes').delete().eq('id', id);
                await supabase.from('calendrier').delete().eq('compteid', id);
            } catch (err) {}
        }
        return targetCompte || { id, pseudo: id };
    },

    // ------------------- CALENDRIER -------------------
    async getCalendrier(organisationId = null) {
        let list = [...DEFAULT_CALENDRIER];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('calendrier').select('*');
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
            return list.filter(l => l.organisationId === organisationId);
        }
        return list;
    },

    async getCalendrierRowById(id) {
        const row = DEFAULT_CALENDRIER.find(l => l.id === id);
        if (row) return row;
        if (supabaseUrl && supabaseKey) {
            try {
                const { data, error } = await supabase.from('calendrier').select('*').eq('id', id).maybeSingle();
                if (!error && data) return fromDbFormat(data);
            } catch (e) {}
        }
        return null;
    },

    async createCalendrierRow(row) {
        const payload = {
            organisationId: 'org_default',
            ...row,
            heuresVentesReposts: Array.isArray(row.heuresVentesReposts) ? row.heuresVentesReposts : []
        };

        const idx = DEFAULT_CALENDRIER.findIndex(l => l.id === payload.id);
        if (idx >= 0) DEFAULT_CALENDRIER[idx] = payload;
        else DEFAULT_CALENDRIER.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                const { data, error } = await supabase.from('calendrier').upsert([dbPayload]).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return payload;
    },

    async updateCalendrierRow(id, fields) {
        const idx = DEFAULT_CALENDRIER.findIndex(l => l.id === id);
        if (idx >= 0) {
            const oldRow = { ...DEFAULT_CALENDRIER[idx] };
            await this.saveToCorbeille('calendrier', id, 'UPDATE', oldRow);
            DEFAULT_CALENDRIER[idx] = { ...DEFAULT_CALENDRIER[idx], ...fields };
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
        const targetRow = DEFAULT_CALENDRIER.find(l => l.id === id);
        if (targetRow) {
            await this.saveToCorbeille('calendrier', id, 'DELETE', targetRow);
        }
        DEFAULT_CALENDRIER = DEFAULT_CALENDRIER.filter(l => l.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('calendrier').delete().eq('id', id);
            } catch (err) {}
        }
        return true;
    },

    async bulkUpdateCalendrierRows(ids, fields) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        for (const id of ids) {
            const item = DEFAULT_CALENDRIER.find(l => l.id === id);
            if (item) await this.saveToCorbeille('calendrier', id, 'UPDATE', { ...item });
        }
        DEFAULT_CALENDRIER = DEFAULT_CALENDRIER.map(l => ids.includes(l.id) ? { ...l, ...fields } : l);
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
        for (const id of ids) {
            const item = DEFAULT_CALENDRIER.find(l => l.id === id);
            if (item) await this.saveToCorbeille('calendrier', id, 'DELETE', item);
        }
        DEFAULT_CALENDRIER = DEFAULT_CALENDRIER.filter(l => !ids.includes(l.id));
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
                await supabase.from('utilisateurs').delete().in('id', ids);
            } catch (err) {}
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

    // ------------------- INCIDENTS -------------------
    async getIncidents(organisationId = null) {
        let list = [...DEFAULT_INCIDENTS];
        if (supabaseUrl && supabaseKey) {
            try {
                let query = supabase.from('incidents').select('*');
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
            return list.filter(i => i.organisationId === organisationId);
        }
        return list;
    },

    async createIncident(incident) {
        const payload = {
            organisationId: 'org_default',
            ...incident,
            heuresPubs24h: Array.isArray(incident.heuresPubs24h) ? incident.heuresPubs24h : [],
            detailVentes: Array.isArray(incident.detailVentes) ? incident.detailVentes : []
        };
        DEFAULT_INCIDENTS.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                await supabase.from('incidents').upsert([dbPayload]);
            } catch (err) {}
        }
        return payload;
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
                if (utilisateurs.length) await supabase.from('utilisateurs').upsert(utilisateurs.map(toDbFormat));
                if (comptes.length) await supabase.from('comptes').upsert(comptes.map(toDbFormat));
                if (calendrier.length) await supabase.from('calendrier').upsert(calendrier.map(toDbFormat));
            } catch (e) {}
        }
    }
};

module.exports = dbService;
