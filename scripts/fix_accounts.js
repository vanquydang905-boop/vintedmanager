const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL || 'https://kdtmpgcsfawbsiiscazu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_EStL78lhwgNnP2RVOTmRTw_6XYeSTKJ';
const supabase = createClient(supabaseUrl, supabaseKey);

const trueData = [
    { id: 'compte_47', numeroCompte: '47', pseudo: 'elina_sor', telephone: '', email: 'mmanjudj2@gmail.com', motDePasse: 'ymdrc4EWE0t6ws1', gereParInitiales: '', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '', userNotes: '' },
    { id: 'compte_48', numeroCompte: '48', pseudo: 'isis_mlf', telephone: '06 33 40 86 06', email: 'juyjgj26@gmail.com', motDePasse: 'Vinted009&*', gereParInitiales: 'TD', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '28/07/2026', userNotes: '' },
    { id: 'compte_49', numeroCompte: '49', pseudo: 'naya_sky', telephone: '06 33 43 85 51', email: 'ee010010@outlook.fr', motDePasse: 'Vinted009&*', gereParInitiales: 'TD', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '31/07/2026', userNotes: 'connecté à Adspower le 05/08/26' },
    { id: 'compte_51', numeroCompte: '51', pseudo: 'lina_mya8', telephone: '06 33 43 89 34', email: 'ee010020@outlook.fr', motDePasse: 'Vinted009&*', gereParInitiales: 'EG', agent: 'À attribuer', statut: 'Banni', dateStatutCompte: '01/08/2026', userNotes: 'Vinted bloqué dès l\'ouverture' },
    { id: 'compte_52', numeroCompte: '52', pseudo: 'maia_lysa', telephone: '06 33 43 38 18', email: 'ee010030@outlook.fr', motDePasse: 'Vinted009&*', gereParInitiales: 'EG', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '02/08/2026', userNotes: '1 article en vente | connecté à Adspower le 05/08/26' },
    { id: 'compte_53', numeroCompte: '53', pseudo: 'nona_lia', telephone: '06 33 43 49 54', email: 'terre2azur123@gmail.com', motDePasse: 'Vinted009&*', gereParInitiales: 'EG', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '02/08/2026', userNotes: '1 article en vente' },
    { id: 'compte_54', numeroCompte: '54', pseudo: 'milla_sia', telephone: '06 33 43 44 78', email: 'ee010040@outlook.fr', motDePasse: 'Vinted054&*', gereParInitiales: 'EG', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '03/08/2026', userNotes: '1 article en vente | connecté à Adspower le 05/08/26' },
    { id: 'compte_18', numeroCompte: '18', pseudo: 'elsa_vay', telephone: '', email: '', motDePasse: '', gereParInitiales: '', agent: 'À attribuer', statut: 'Actif', dateStatutCompte: '', userNotes: '' }
];

async function fixAllBrokenAccounts() {
    for (const d of trueData) {
        const extraMeta = {
            numeroCompte: d.numeroCompte,
            telephone: d.telephone,
            email: d.email,
            motDePasse: d.motDePasse,
            gereParInitiales: d.gereParInitiales,
            dateStatutCompte: d.dateStatutCompte,
            userNotes: d.userNotes
        };
        const { error } = await supabase.from('comptes').update({
            pseudo: d.pseudo,
            agent: d.agent,
            statut: d.statut,
            notes: JSON.stringify(extraMeta)
        }).eq('id', d.id);
        if (error) console.error('Error on', d.id, error.message);
        else console.log('  ✓ Fixed', d.id, '(' + d.pseudo + ')');
    }
    console.log('\n✅ All broken accounts restored with correct real data!');

    // Verify
    const { data } = await supabase.from('comptes').select('*');
    const sorted = data.map(r => {
        let extra = {};
        try { extra = JSON.parse(r.notes || '{}'); } catch(e) {}
        return { pseudo: r.pseudo, numero: extra.numeroCompte || '-', tel: extra.telephone || '-', email: extra.email || '-' };
    }).sort((a,b)=>(parseInt(a.numero)||0)-(parseInt(b.numero)||0));

    console.log('\nFinal state:');
    sorted.forEach(r => console.log('  N°' + r.numero + ' | ' + r.pseudo + ' | Tél: ' + r.tel + ' | Email: ' + r.email));
}

fixAllBrokenAccounts();
