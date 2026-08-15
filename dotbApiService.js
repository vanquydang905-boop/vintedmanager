const fetch = require('node-fetch');

const DOTB_API_BASE = 'https://dotb.io/api/public/v1';

class DotbApiService {
    /**
     * Effectue un appel authentifié vers l'API publique DotB v1
     */
    static async request(endpoint, token, options = {}) {
        if (!token) throw new Error("Jeton d'authentification DotB requis");
        const url = `${DOTB_API_BASE}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Erreur API DotB (${res.status}): ${errText}`);
        }
        return await res.json();
    }

    /**
     * Récupère les comptes Vinted connectés à DotB
     */
    static async getAccounts(token) {
        const data = await this.request('/accounts', token);
        return data.data || [];
    }

    /**
     * Récupère les articles gérés sur DotB
     */
    static async getItems(token, status = 'all') {
        const data = await this.request(`/items?status=${status}&limit=100`, token);
        return data.data || [];
    }

    /**
     * Récupère les commandes / ventes gérées sur DotB
     */
    static async getOrders(token) {
        const data = await this.request('/orders?limit=100', token);
        return data.data || [];
    }
}

module.exports = DotbApiService;
