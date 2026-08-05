require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('\n⚠️ [SUPABASE WARNING] SUPABASE_URL ou SUPABASE_KEY manquant dans le fichier .env !');
    console.warn('⚠️ Veuillez renseigner vos identifiants Supabase dans le fichier .env pour activer la persistance.\n');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);

const DEFAULT_PARAMETRES = {
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

const DEFAULT_ORGANISATIONS = [
    { id: 'org_default', nom: 'Organisation Principale', dateCreation: '2026-08-04' },
    { id: 'org_paris', nom: 'Agence Vinted Paris', dateCreation: '2026-08-04' }
];

const DEFAULT_UTILISATEURS = [
    { id: 'usr_admin_florencio', nom: 'Florencio', email: 'florencio@vintedmanager.com', role: 'admin', organisationId: 'org_default', agentAssigne: '', motDePasse: process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!', dateCreation: '2026-08-04' }
];

const dbService = {
    supabase,
    DEFAULT_PARAMETRES,
    DEFAULT_ORGANISATIONS,
    DEFAULT_UTILISATEURS,

    // ------------------- ORGANISATIONS -------------------
    async getOrganisations() {
        if (!supabaseUrl || !supabaseKey) return DEFAULT_ORGANISATIONS;
        try {
            const { data, error } = await supabase.from('organisations').select('*');
            if (error || !data || data.length === 0) return DEFAULT_ORGANISATIONS;
            return data;
        } catch (e) {
            return DEFAULT_ORGANISATIONS;
        }
    },

    async createOrganisation(org) {
        if (!supabaseUrl || !supabaseKey) return org;
        const { data, error } = await supabase.from('organisations').insert([org]).select().single();
        if (error) throw new Error("Erreur création organisation Supabase: " + error.message);
        
        // Initialiser les paramètres par défaut pour cette organisation
        const paramId = `param_${org.id}`;
        await supabase.from('parametres').upsert({ id: paramId, organisationId: org.id, data: DEFAULT_PARAMETRES });
        return data;
    },

    async updateOrganisation(id, fields) {
        if (!supabaseUrl || !supabaseKey) return { id, ...fields };
        const { data, error } = await supabase.from('organisations').update(fields).eq('id', id).select().single();
        if (error) throw new Error("Erreur mise à jour organisation Supabase: " + error.message);
        return data;
    },

    async deleteOrganisation(id) {
        if (!supabaseUrl || !supabaseKey) return true;
        const { error } = await supabase.from('organisations').delete().eq('id', id);
        if (error) throw new Error("Erreur suppression organisation: " + error.message);
        
        // Supprimer toutes les données associées à cette organisation
        await supabase.from('comptes').delete().eq('organisationId', id);
        await supabase.from('calendrier').delete().eq('organisationId', id);
        await supabase.from('incidents').delete().eq('organisationId', id);
        await supabase.from('journal').delete().eq('organisationId', id);
        await supabase.from('utilisateurs').delete().eq('organisationId', id);
        await supabase.from('parametres').delete().eq('organisationId', id);
        return true;
    },

    // ------------------- PARAMETRES -------------------
    async getParametres(organisationId = 'org_default') {
        if (!supabaseUrl || !supabaseKey) return DEFAULT_PARAMETRES;
        try {
            const { data, error } = await supabase
                .from('parametres')
                .select('data')
                .eq('organisationId', organisationId)
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
        if (!supabaseUrl || !supabaseKey) return paramsObj;
        const paramId = `param_${organisationId}`;
        const { error } = await supabase
            .from('parametres')
            .upsert({ id: paramId, organisationId, data: paramsObj });
        if (error) throw new Error("Erreur de sauvegarde des paramètres Supabase: " + error.message);
        return paramsObj;
    },

    // ------------------- UTILISATEURS -------------------
    async getUtilisateurs(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return DEFAULT_UTILISATEURS;
        try {
            let query = supabase.from('utilisateurs').select('*');
            if (organisationId) query = query.eq('organisationId', organisationId);
            const { data, error } = await query;
            if (error || !data || data.length === 0) return DEFAULT_UTILISATEURS;
            return data;
        } catch (e) {
            return DEFAULT_UTILISATEURS;
        }
    },

    async createUtilisateur(user) {
        if (!supabaseUrl || !supabaseKey) return user;
        const payload = {
            organisationId: 'org_default',
            ...user
        };
        try {
            const { data, error } = await supabase.from('utilisateurs').insert([payload]).select().single();
            if (error) {
                console.warn("⚠️ [SUPABASE USER INSERT RETRY]", error.message);
                // Si la table distante Supabase n'a pas encore toutes les colonnes optionnelles
                const cleanPayload = {
                    id: payload.id,
                    nom: payload.nom,
                    email: payload.email,
                    role: payload.role,
                    organisationId: payload.organisationId || 'org_default'
                };
                if (payload.motDePasse) cleanPayload.motDePasse = payload.motDePasse;
                
                const { data: dRetry, error: eRetry } = await supabase.from('utilisateurs').insert([cleanPayload]).select().single();
                if (!eRetry && dRetry) return { ...dRetry, ...payload };
                return payload;
            }
            return data;
        } catch (err) {
            console.warn("⚠️ [SUPABASE USER INSERT FALLBACK]", err.message);
            return payload;
        }
    },

    async updateUtilisateur(id, fields) {
        if (!supabaseUrl || !supabaseKey) return { id, ...fields };
        try {
            const { data, error } = await supabase.from('utilisateurs').update(fields).eq('id', id).select().single();
            if (error) {
                console.warn("⚠️ [SUPABASE USER UPDATE RETRY]", error.message);
                return { id, ...fields };
            }
            return data;
        } catch (err) {
            return { id, ...fields };
        }
    },

    async deleteUtilisateur(id) {
        if (!supabaseUrl || !supabaseKey) return true;
        try {
            await supabase.from('utilisateurs').delete().eq('id', id);
            return true;
        } catch (err) {
            return true;
        }
    },

    // ------------------- COMPTES -------------------
    async getComptes(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return [];
        try {
            let query = supabase.from('comptes').select('*');
            if (organisationId) query = query.eq('organisationId', organisationId);
            const { data, error } = await query;
            if (error) {
                console.warn("⚠️ [SUPABASE COMPTES]", error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            return [];
        }
    },

    async createCompte(compte) {
        if (!supabaseUrl || !supabaseKey) return compte;
        const payload = {
            organisationId: 'org_default',
            ...compte
        };
        try {
            const { data, error } = await supabase.from('comptes').insert([payload]).select().single();
            if (error) {
                console.warn("⚠️ [SUPABASE COMPTE INSERT RETRY]", error.message);
                const cleanPayload = {
                    id: payload.id,
                    pseudo: payload.pseudo,
                    agent: payload.agent,
                    statut: payload.statut || 'Actif'
                };
                const { data: dRetry, error: eRetry } = await supabase.from('comptes').insert([cleanPayload]).select().single();
                if (!eRetry && dRetry) return { ...dRetry, ...payload };
                return payload;
            }
            return data;
        } catch (err) {
            return payload;
        }
    },

    async updateCompte(id, fields) {
        if (!supabaseUrl || !supabaseKey) return { id, ...fields };
        const { data, error } = await supabase.from('comptes').update(fields).eq('id', id).select().single();
        if (error) throw new Error("Erreur mise à jour compte Supabase: " + error.message);
        if (fields.agent) {
            await supabase.from('calendrier').update({ agent: fields.agent }).eq('compteId', id);
        }
        return data;
    },

    async deleteCompte(id) {
        if (!supabaseUrl || !supabaseKey) return { pseudo: id };
        const { data: compte } = await supabase.from('comptes').select('pseudo').eq('id', id).maybeSingle();
        const { error: err1 } = await supabase.from('comptes').delete().eq('id', id);
        if (err1) throw new Error("Erreur suppression compte: " + err1.message);
        await supabase.from('calendrier').delete().eq('compteId', id);
        return compte;
    },

    // ------------------- CALENDRIER -------------------
    async getCalendrier(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return [];
        try {
            let query = supabase.from('calendrier').select('*');
            if (organisationId) query = query.eq('organisationId', organisationId);
            const { data, error } = await query;
            if (error) {
                console.warn("⚠️ [SUPABASE CALENDRIER]", error.message);
                return [];
            }
            return (data || []).map(row => ({
                ...row,
                heuresVentesReposts: typeof row.heuresVentesReposts === 'string'
                    ? JSON.parse(row.heuresVentesReposts)
                    : (row.heuresVentesReposts || [])
            }));
        } catch (e) {
            return [];
        }
    },

    async getCalendrierRowById(id) {
        if (!supabaseUrl || !supabaseKey) return null;
        const { data, error } = await supabase.from('calendrier').select('*').eq('id', id).maybeSingle();
        if (error || !data) return null;
        return {
            ...data,
            heuresVentesReposts: typeof data.heuresVentesReposts === 'string'
                ? JSON.parse(data.heuresVentesReposts)
                : (data.heuresVentesReposts || [])
        };
    },

    async createCalendrierRow(row) {
        if (!supabaseUrl || !supabaseKey) return row;
        const payload = {
            organisationId: 'org_default',
            ...row,
            heuresVentesReposts: Array.isArray(row.heuresVentesReposts) ? row.heuresVentesReposts : []
        };
        const { data, error } = await supabase.from('calendrier').insert([payload]).select().single();
        if (error) throw new Error("Erreur ajout calendrier Supabase: " + error.message);
        return {
            ...data,
            heuresVentesReposts: typeof data.heuresVentesReposts === 'string'
                ? JSON.parse(data.heuresVentesReposts)
                : (data.heuresVentesReposts || [])
        };
    },

    async updateCalendrierRow(id, fields) {
        if (!supabaseUrl || !supabaseKey) return { id, ...fields };
        const { data, error } = await supabase.from('calendrier').update(fields).eq('id', id).select().single();
        if (error) throw new Error("Erreur MAJ calendrier Supabase: " + error.message);
        return {
            ...data,
            heuresVentesReposts: typeof data.heuresVentesReposts === 'string'
                ? JSON.parse(data.heuresVentesReposts)
                : (data.heuresVentesReposts || [])
        };
    },

    async deleteCalendrierRow(id) {
        if (!supabaseUrl || !supabaseKey) return true;
        const { error } = await supabase.from('calendrier').delete().eq('id', id);
        if (error) throw new Error("Erreur suppression ligne calendrier: " + error.message);
        return true;
    },

    // ------------------- INCIDENTS -------------------
    async getIncidents(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return [];
        try {
            let query = supabase.from('incidents').select('*');
            if (organisationId) query = query.eq('organisationId', organisationId);
            const { data, error } = await query;
            if (error) {
                console.warn("⚠️ [SUPABASE INCIDENTS]", error.message);
                return [];
            }
            return (data || []).map(row => ({
                ...row,
                heuresPubs24h: typeof row.heuresPubs24h === 'string' ? JSON.parse(row.heuresPubs24h) : (row.heuresPubs24h || []),
                detailVentes: typeof row.detailVentes === 'string' ? JSON.parse(row.detailVentes) : (row.detailVentes || [])
            }));
        } catch (e) {
            return [];
        }
    },

    async createIncident(incident) {
        if (!supabaseUrl || !supabaseKey) return incident;
        const payload = {
            organisationId: 'org_default',
            ...incident,
            heuresPubs24h: Array.isArray(incident.heuresPubs24h) ? incident.heuresPubs24h : [],
            detailVentes: Array.isArray(incident.detailVentes) ? incident.detailVentes : []
        };
        const { data, error } = await supabase.from('incidents').insert([payload]).select().single();
        if (error) throw new Error("Erreur création incident Supabase: " + error.message);
        return data;
    },

    // ------------------- JOURNAL -------------------
    async getJournal(organisationId = null) {
        if (!supabaseUrl || !supabaseKey) return [];
        try {
            let query = supabase.from('journal').select('*').order('horodatage', { ascending: false });
            if (organisationId) query = query.eq('organisationId', organisationId);
            const { data, error } = await query;
            if (error) {
                console.warn("⚠️ [SUPABASE JOURNAL]", error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            return [];
        }
    },

    async logAction(action, detail, resultat, organisationId = 'org_default') {
        if (!supabaseUrl || !supabaseKey) {
            console.log(`[LOG MOCK] ${action} - ${detail} - ${resultat}`);
            return;
        }
        const id = "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
        const horodatage = new Date().toISOString();
        try {
            await supabase.from('journal').insert([{ id, organisationId, horodatage, action, detail, resultat }]);
        } catch (err) {
            console.error("Erreur d'écriture dans le journal Supabase:", err.message);
        }
    },

    // ------------------- RESTORE COMPLET -------------------
    async restoreFullDatabase({ parametres, organisations, utilisateurs, comptes, calendrier, incidents, journal }) {
        if (!supabaseUrl || !supabaseKey) return;

        if (parametres) {
            await this.saveParametres(parametres);
        }

        await supabase.from('organisations').delete().neq('id', '');
        await supabase.from('utilisateurs').delete().neq('id', '');
        await supabase.from('comptes').delete().neq('id', '');
        await supabase.from('calendrier').delete().neq('id', '');
        await supabase.from('incidents').delete().neq('id', '');
        await supabase.from('journal').delete().neq('id', '');

        if (Array.isArray(organisations) && organisations.length > 0) {
            await supabase.from('organisations').insert(organisations);
        }
        if (Array.isArray(utilisateurs) && utilisateurs.length > 0) {
            await supabase.from('utilisateurs').insert(utilisateurs);
        }
        if (Array.isArray(comptes) && comptes.length > 0) {
            await supabase.from('comptes').insert(comptes);
        }
        if (Array.isArray(calendrier) && calendrier.length > 0) {
            const formattedCal = calendrier.map(item => ({
                ...item,
                heuresVentesReposts: Array.isArray(item.heuresVentesReposts) ? item.heuresVentesReposts : []
            }));
            await supabase.from('calendrier').insert(formattedCal);
        }
        if (Array.isArray(incidents) && incidents.length > 0) {
            const formattedInc = incidents.map(item => ({
                ...item,
                heuresPubs24h: Array.isArray(item.heuresPubs24h) ? item.heuresPubs24h : [],
                detailVentes: Array.isArray(item.detailVentes) ? item.detailVentes : []
            }));
            await supabase.from('incidents').insert(formattedInc);
        }
        if (Array.isArray(journal) && journal.length > 0) {
            await supabase.from('journal').insert(journal);
        }
    }
};

module.exports = dbService;
