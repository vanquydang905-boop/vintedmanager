-- ============================================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Vinted Manager - Architecture Multi-Organisation (Multi-Tenancy)
-- Exécuter ce script dans le SQL Editor Supabase
-- ============================================================

-- Réinitialisation propre des tables si elles existaient déjà
DROP TABLE IF EXISTS journal CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS calendrier CASCADE;
DROP TABLE IF EXISTS comptes CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;
DROP TABLE IF EXISTS parametres CASCADE;
DROP TABLE IF EXISTS organisations CASCADE;
DROP TABLE IF EXISTS corbeille CASCADE;

-- 1. Table des Organisations (Multi-Tenancy)
CREATE TABLE organisations (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    dateCreation TEXT DEFAULT ''
);

-- 2. Table des Paramètres (Par Organisation)
CREATE TABLE parametres (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL,
    data JSONB NOT NULL
);

-- 3. Table des Utilisateurs & Rôles
CREATE TABLE utilisateurs (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'cadre', 'agent')) NOT NULL DEFAULT 'agent',
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    agentAssigne TEXT DEFAULT '',
    motDePasse TEXT DEFAULT '123456',
    dateCreation TEXT DEFAULT ''
);

-- 4. Table des Comptes Vinted
CREATE TABLE comptes (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    pseudo TEXT NOT NULL,
    agent TEXT NOT NULL,
    lienProfil TEXT DEFAULT '',
    statut TEXT DEFAULT 'Actif',
    dateCreation TEXT DEFAULT '',
    notes TEXT DEFAULT ''
);

-- 5. Table du Calendrier de Publication
CREATE TABLE calendrier (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    date TEXT NOT NULL,
    jour TEXT NOT NULL,
    compteId TEXT NOT NULL,
    agent TEXT NOT NULL,
    heurePrevue TEXT NOT NULL,
    sku TEXT DEFAULT '',
    produit TEXT DEFAULT '',
    lien TEXT DEFAULT '',
    vues INT DEFAULT 0,
    likes INT DEFAULT 0,
    favoris INT DEFAULT 0,
    messages INT DEFAULT 0,
    vente INT DEFAULT 0,
    score FLOAT DEFAULT 0,
    classification TEXT DEFAULT 'À retester',
    statut TEXT DEFAULT 'Non fait',
    dateStatut TEXT,
    heureStatut TEXT,
    nbVentesReposts INT DEFAULT 0,
    heuresVentesReposts JSONB DEFAULT '[]'::jsonb,
    prochainRepost TEXT
);

-- 6. Table des Incidents et Blocages
CREATE TABLE incidents (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    compteId TEXT NOT NULL,
    dateBlocage TEXT NOT NULL,
    heureBlocage TEXT NOT NULL,
    type TEXT NOT NULL,
    nbPubs24h INT DEFAULT 0,
    heuresPubs24h JSONB DEFAULT '[]'::jsonb,
    nbVentesConnues INT DEFAULT 0,
    detailVentes JSONB DEFAULT '[]'::jsonb,
    nbAnnoncesMasquees INT DEFAULT 0,
    skuAnnoncesMasquees TEXT DEFAULT '',
    notesActivites TEXT DEFAULT ''
);

-- 7. Table du Journal d'Activité (Logs)
CREATE TABLE journal (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    horodatage TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    resultat TEXT NOT NULL
);

-- 8. Table de la Corbeille de Sauvegarde (Format JSON Chiffré)
CREATE TABLE corbeille (
    id TEXT PRIMARY KEY,
    organisationId TEXT NOT NULL DEFAULT 'org_default',
    typeEntite TEXT NOT NULL,
    idEntite TEXT NOT NULL,
    action TEXT NOT NULL,
    nomElement TEXT DEFAULT '',
    donneesChiffrees TEXT NOT NULL,
    dateAction TEXT NOT NULL,
    auteur TEXT DEFAULT 'Système'
);

-- Désactivation de la sécurité RLS pour autoriser les requêtes API Directes de l'application
ALTER TABLE organisations DISABLE ROW LEVEL SECURITY;
ALTER TABLE parametres DISABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs DISABLE ROW LEVEL SECURITY;
ALTER TABLE comptes DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendrier DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal DISABLE ROW LEVEL SECURITY;
ALTER TABLE corbeille DISABLE ROW LEVEL SECURITY;

-- Initialisation des organisations par défaut
INSERT INTO organisations (id, nom, dateCreation) VALUES
('org_default', 'Organisation Principale', '2026-08-04'),
('org_paris', 'Agence Vinted Paris', '2026-08-04')
ON CONFLICT (id) DO NOTHING;

-- Initialisation des paramètres par défaut pour les organisations
INSERT INTO parametres (id, organisationId, data) VALUES 
('param_org_default', 'org_default', '{
    "poidsScore": { "vues": 0.1, "likes": 1, "favoris": 2, "messages": 5, "vente": 20 },
    "seuils": { "ecarte": 15, "gagnant": 40 },
    "decalageMinutesEntreComptes": 60,
    "margeAleatoireMinutes": 15,
    "creneauxParJour": 3,
    "delaiProchainRepostMinutes": 30,
    "heuresParPeriode": {
        "matin": ["06:30", "07:30", "08:30", "09:30", "10:30", "11:30"],
        "midi": ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        "soir": ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
    },
    "nbJoursPlanningParDefaut": 7,
    "heureDeclencheurAuto": "05:00"
}'::jsonb),
('param_org_paris', 'org_paris', '{
    "poidsScore": { "vues": 0.1, "likes": 1, "favoris": 2, "messages": 5, "vente": 20 },
    "seuils": { "ecarte": 15, "gagnant": 40 },
    "decalageMinutesEntreComptes": 60,
    "margeAleatoireMinutes": 15,
    "creneauxParJour": 3,
    "delaiProchainRepostMinutes": 30,
    "heuresParPeriode": {
        "matin": ["06:30", "07:30", "08:30", "09:30", "10:30", "11:30"],
        "midi": ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        "soir": ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
    },
    "nbJoursPlanningParDefaut": 7,
    "heureDeclencheurAuto": "05:00"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Initialisation de l'utilisateur administrateur unique (Florencio)
INSERT INTO utilisateurs (id, nom, email, role, organisationId, agentAssigne, motDePasse, dateCreation) VALUES
('usr_admin_florencio', 'Florencio', 'florencio@vintedmanager.com', 'admin', 'org_default', '', 'VOTRE_MOT_DE_PASSE', '2026-08-04')
ON CONFLICT (id) DO NOTHING;
