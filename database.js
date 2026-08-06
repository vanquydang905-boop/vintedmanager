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
    contactnumero: 'contactNumero'
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

let DEFAULT_ORGANISATIONS = [
    { id: 'org_default', nom: 'Organisation Principale', dateCreation: '2026-08-07' },
    { id: 'org_paris', nom: 'Agence Vinted Paris', dateCreation: '2026-08-07' }
];

let DEFAULT_UTILISATEURS = [
    { id: 'usr_admin_florencio', nom: 'Florencio', email: 'florencio@vintedmanager.com', role: 'admin', organisationId: 'org_default', agentAssigne: '', motDePasse: process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!', dateCreation: '2026-08-07' },
    { id: 'usr_muller', nom: 'Muller', email: 'tsaralahy343@gmail.com', role: 'agent', organisationId: 'org_default', agentAssigne: 'Muller', motDePasse: 'muller2026', dateCreation: '2026-08-07' }
];

let DEFAULT_COMPTES = [
    { id: 'compte_demo1', organisationId: 'org_default', pseudo: 'vinted_boutique_fr', agent: 'Muller', statut: 'Actif', dateCreation: '2026-08-07', notes: 'Compte principal' }
];

let DEFAULT_CALENDRIER = [];
let DEFAULT_INCIDENTS = [];
let DEFAULT_JOURNAL = [];

const dbService = {
    supabase,
    DEFAULT_PARAMETRES,
    DEFAULT_ORGANISATIONS,
    DEFAULT_UTILISATEURS,
    DEFAULT_COMPTES,
    DEFAULT_CALENDRIER,
    DEFAULT_INCIDENTS,
    DEFAULT_JOURNAL,

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
            dateCreation: new Date().toISOString().split('T')[0],
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
        if (idx >= 0) DEFAULT_ORGANISATIONS[idx] = { ...DEFAULT_ORGANISATIONS[idx], ...fields };

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
            dateCreation: new Date().toISOString().split('T')[0],
            ...user
        };

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
        const idx = DEFAULT_UTILISATEURS.findIndex(u => u.id === id);
        if (idx >= 0) DEFAULT_UTILISATEURS[idx] = { ...DEFAULT_UTILISATEURS[idx], ...fields };

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                const { data, error } = await supabase.from('utilisateurs').update(dbFields).eq('id', id).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return { id, ...fields };
    },

    async deleteUtilisateur(id) {
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
                    data.map(fromDbFormat).forEach(dbRow => {
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
            dateCreation: new Date().toISOString().split('T')[0],
            notes: '',
            ...compte
        };

        const idx = DEFAULT_COMPTES.findIndex(c => c.id === payload.id);
        if (idx >= 0) DEFAULT_COMPTES[idx] = payload;
        else DEFAULT_COMPTES.unshift(payload);

        if (supabaseUrl && supabaseKey) {
            try {
                const dbPayload = toDbFormat(payload);
                const { data, error } = await supabase.from('comptes').upsert([dbPayload]).select();
                if (!error && data && data.length) return fromDbFormat(data[0]);
            } catch (err) {}
        }
        return payload;
    },

    async updateCompte(id, fields) {
        const idx = DEFAULT_COMPTES.findIndex(c => c.id === id);
        if (idx >= 0) DEFAULT_COMPTES[idx] = { ...DEFAULT_COMPTES[idx], ...fields };

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                await supabase.from('comptes').update(dbFields).eq('id', id).select();
            } catch (err) {}
        }
        if (fields.agent) {
            DEFAULT_CALENDRIER.forEach(l => {
                if (l.compteId === id) l.agent = fields.agent;
            });
        }
        return { id, ...fields };
    },

    async deleteCompte(id) {
        const targetCompte = DEFAULT_COMPTES.find(c => c.id === id);
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
        if (idx >= 0) DEFAULT_CALENDRIER[idx] = { ...DEFAULT_CALENDRIER[idx], ...fields };

        if (supabaseUrl && supabaseKey) {
            try {
                const dbFields = toDbFormat(fields);
                await supabase.from('calendrier').update(dbFields).eq('id', id);
            } catch (err) {}
        }
        return { id, ...fields };
    },

    async deleteCalendrierRow(id) {
        DEFAULT_CALENDRIER = DEFAULT_CALENDRIER.filter(l => l.id !== id);
        if (supabaseUrl && supabaseKey) {
            try {
                await supabase.from('calendrier').delete().eq('id', id);
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
