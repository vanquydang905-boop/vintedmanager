const API = {
    async fetchJSON(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Erreur serveur (${response.status})`);
            }
            return data;
        } catch (err) {
            console.error(`[API Error] ${url}:`, err);
            throw err;
        }
    },

    // DB Operations
    async getFullDB(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/db${query}`);
    },

    async importDB(dbData) {
        return this.fetchJSON('/api/import', {
            method: 'POST',
            body: JSON.stringify(dbData)
        });
    },

    // Organisations
    async getOrganisations() {
        return this.fetchJSON('/api/organisations');
    },

    async createOrganisation(data) {
        return this.fetchJSON('/api/organisations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateOrganisation(id, data) {
        return this.fetchJSON(`/api/organisations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteOrganisation(id) {
        return this.fetchJSON(`/api/organisations/${id}`, {
            method: 'DELETE'
        });
    },

    // Users & Roles
    async getUsers(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/users${query}`);
    },

    async login(payload) {
        return this.fetchJSON('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async createUser(data) {
        return this.fetchJSON('/api/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    async createUtilisateur(data) { return this.createUser(data); },

    async updateUser(id, data) {
        return this.fetchJSON(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    async updateUtilisateur(id, data) { return this.updateUser(id, data); },

    async deleteUser(id) {
        return this.fetchJSON(`/api/users/${id}`, {
            method: 'DELETE'
        });
    },
    async deleteUtilisateur(id) { return this.deleteUser(id); },

    // Comptes
    async getComptes(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/comptes${query}`);
    },

    async createCompte(data) {
        return this.fetchJSON('/api/comptes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateCompte(id, data) {
        return this.fetchJSON(`/api/comptes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteCompte(id) {
        return this.fetchJSON(`/api/comptes/${id}`, {
            method: 'DELETE'
        });
    },

    // Calendrier
    async getCalendrier(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/calendrier${query}`);
    },

    async createCalendrierLine(lineData = {}) {
        return this.fetchJSON('/api/calendrier', {
            method: 'POST',
            body: JSON.stringify(lineData)
        });
    },
    async createCalendrierRow(lineData = {}) { return this.createCalendrierLine(lineData); },

    async updateCalendrierField(id, field, value) {
        return this.fetchJSON(`/api/calendrier/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ field, value })
        });
    },

    async updateCalendrierRow(id, fields) {
        for (const [field, value] of Object.entries(fields)) {
            await this.updateCalendrierField(id, field, value);
        }
        return { success: true };
    },

    async deleteCalendrierLine(id) {
        return this.fetchJSON(`/api/calendrier/${id}`, {
            method: 'DELETE'
        });
    },
    async deleteCalendrierRow(id) { return this.deleteCalendrierLine(id); },

    async generatePlanning(dateDebut, dateFin, creneauxParJour = null, heureDebut = "07:00", heureFin = "22:00", organisationId = null) {
        let payload = {};
        if (typeof dateDebut === 'object') {
            payload = dateDebut;
        } else if (dateDebut && !dateFin && typeof dateDebut === 'number') {
            payload = { nbJours: dateDebut, creneauxParJour, heureDebut, heureFin, organisationId };
        } else {
            payload = { dateDebut, dateFin, creneauxParJour, heureDebut, heureFin, organisationId };
        }
        return this.fetchJSON('/api/calendrier/generate', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async publishWinner(sku, organisationId = null) {
        return this.fetchJSON('/api/calendrier/publish-winner', {
            method: 'POST',
            body: JSON.stringify({ sku, organisationId })
        });
    },

    // Incidents
    async getIncidents(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/incidents${query}`);
    },

    async createIncident(data) {
        return this.fetchJSON('/api/incidents', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Paramètres
    async getParametres(organisationId = 'org_default') {
        const query = `?organisationId=${encodeURIComponent(organisationId)}`;
        return this.fetchJSON(`/api/parametres${query}`);
    },

    async updateParametres(paramsData, organisationId = 'org_default') {
        const query = `?organisationId=${encodeURIComponent(organisationId)}`;
        return this.fetchJSON(`/api/parametres${query}`, {
            method: 'PUT',
            body: JSON.stringify(paramsData)
        });
    },

    // Journal
    async getJournal(organisationId = null) {
        const query = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : '';
        return this.fetchJSON(`/api/journal${query}`);
    },

    // BULK CRUD
    async bulkUpdateCalendrier(ids, fields) {
        return this.fetchJSON('/api/calendrier/bulk-update', { method: 'POST', body: JSON.stringify({ ids, fields }) });
    },
    async bulkDeleteCalendrier(ids) {
        return this.fetchJSON('/api/calendrier/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
    },
    async bulkUpdateComptes(ids, fields) {
        return this.fetchJSON('/api/comptes/bulk-update', { method: 'POST', body: JSON.stringify({ ids, fields }) });
    },
    async bulkDeleteComptes(ids) {
        return this.fetchJSON('/api/comptes/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
    },
    async bulkDeleteUsers(ids) {
        return this.fetchJSON('/api/users/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
    },
    async bulkDeleteIncidents(ids) {
        return this.fetchJSON('/api/incidents/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
    }
};
