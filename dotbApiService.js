const https = require('https');

const DOTB_API_BASE = 'https://dotb.io/api/public/v1';

class DotbApiService {
    /**
     * Effectue un appel authentifié vers l'API publique DotB v1
     */
    static async request(endpoint, token, options = {}) {
        if (!token) throw new Error("Jeton d'authentification DotB requis");
        const url = `${DOTB_API_BASE}${endpoint}`;

        if (typeof globalThis.fetch === 'function') {
            try {
                const res = await globalThis.fetch(url, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    }
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur API DotB (${res.status}): ${errText}`);
                }
                return await res.json();
            } catch (e) {
                console.warn("[DotbApiService] Fetch natif échoué, passage sur https natif:", e.message);
            }
        }

        // Secours HTTP Natif sans dépendance
        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: options.method || 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 400) {
                            return reject(new Error(`Erreur API DotB (${res.statusCode}): ${body}`));
                        }
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
            req.end();
        });
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
        const data = await this.request('/orders?limit=100&include=account,items', token);
        return data.data || [];
    }
}

module.exports = DotbApiService;
