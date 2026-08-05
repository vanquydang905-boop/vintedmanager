require('dotenv').config();
const path = require('path');
const fs = require('fs');
const dbService = require('./database');

const dbPath = path.join(__dirname, 'vinted_manager.db');

async function migrate() {
    console.log('🚀 Démarrage de la migration SQLite -> Supabase...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error('❌ ERREUR: SUPABASE_URL et SUPABASE_KEY doivent être renseignés dans le fichier .env !');
        process.exit(1);
    }

    if (!fs.existsSync(dbPath)) {
        console.log('⚠️ Aucune base de données SQLite locale vinted_manager.db n\'a été trouvée.');
        console.log('💡 La base de données Supabase est prête à l\'emploi sans migration.');
        process.exit(0);
    }

    let sqliteDb;
    try {
        const { DatabaseSync } = require('node:sqlite');
        sqliteDb = new DatabaseSync(dbPath);
    } catch (e) {
        console.error('❌ Erreur lors de l\'ouverture de SQLite:', e.message);
        process.exit(1);
    }

    try {
        // 1. Extraction des données SQLite
        console.log('📦 Lecture des tables SQLite local...');
        
        let parametres = null;
        try {
            const rowParam = sqliteDb.prepare('SELECT data FROM parametres WHERE id = 1').get();
            if (rowParam) parametres = JSON.parse(rowParam.data);
        } catch (e) {}

        let comptes = [];
        try {
            comptes = sqliteDb.prepare('SELECT * FROM comptes').all();
        } catch (e) {}

        let calendrierRaw = [];
        try {
            calendrierRaw = sqliteDb.prepare('SELECT * FROM calendrier').all();
        } catch (e) {}

        let incidentsRaw = [];
        try {
            incidentsRaw = sqliteDb.prepare('SELECT * FROM incidents').all();
        } catch (e) {}

        let journal = [];
        try {
            journal = sqliteDb.prepare('SELECT * FROM journal').all();
        } catch (e) {}

        const calendrier = calendrierRaw.map(r => ({
            ...r,
            heuresVentesReposts: r.heuresVentesReposts ? JSON.parse(r.heuresVentesReposts) : []
        }));

        const incidents = incidentsRaw.map(r => ({
            ...r,
            heuresPubs24h: r.heuresPubs24h ? JSON.parse(r.heuresPubs24h) : [],
            detailVentes: r.detailVentes ? JSON.parse(r.detailVentes) : []
        }));

        console.log(`📊 Données trouvées:
        - Paramètres: ${parametres ? 'Oui' : 'Non'}
        - Comptes: ${comptes.length}
        - Calendrier: ${calendrier.length} lignes
        - Incidents: ${incidents.length}
        - Journal: ${journal.length} logs`);

        // 2. Transfert vers Supabase
        console.log('☁️ Envoi des données vers Supabase...');
        await dbService.restoreFullDatabase({
            parametres,
            comptes,
            calendrier,
            incidents,
            journal
        });

        console.log('✅ Migration SQLite -> Supabase terminée avec succès !');
    } catch (err) {
        console.error('❌ Échec de la migration:', err.message);
    }
}

migrate();
