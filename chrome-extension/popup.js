// ============================================================
// POPUP SCRIPT - VINTED MANAGER CHROME EXTENSION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const serverUrlInput = document.getElementById('serverUrl');
    const pseudoOverrideInput = document.getElementById('pseudoOverride');
    const btnSync = document.getElementById('btnSync');
    const statusMsg = document.getElementById('statusMsg');

    const valVues = document.getElementById('valVues');
    const valLikes = document.getElementById('valLikes');
    const valMsgs = document.getElementById('valMsgs');
    const valVentes = document.getElementById('valVentes');

    // Charge la configuration sauvegardée
    chrome.storage.local.get(['serverUrl', 'pseudoOverride'], (res) => {
        if (res.serverUrl) serverUrlInput.value = res.serverUrl;
        if (res.pseudoOverride) pseudoOverrideInput.value = res.pseudoOverride;
    });

    // Sauvegarde auto des réglages lors de la modification
    serverUrlInput.addEventListener('change', () => {
        chrome.storage.local.set({ serverUrl: serverUrlInput.value.trim() });
    });

    pseudoOverrideInput.addEventListener('change', () => {
        chrome.storage.local.set({ pseudoOverride: pseudoOverrideInput.value.trim() });
    });

    // Clic sur Scraper & Synchroniser
    btnSync.addEventListener('click', async () => {
        statusMsg.innerText = "⏳ Extraction des données Vinted...";
        statusMsg.className = "status-msg";

        const serverUrl = serverUrlInput.value.trim() || "http://localhost:3000";
        const pseudoOverride = pseudoOverrideInput.value.trim();

        // Récupérer l'onglet actif Vinted
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) {
                statusMsg.innerText = "❌ Aucun onglet actif trouvé";
                statusMsg.className = "status-msg error";
                return;
            }

            // Demander au script de contenu d'extraire les données
            chrome.tabs.sendMessage(activeTab.id, { action: "SCRAPE_DATA" }, (response) => {
                if (chrome.runtime.lastError || !response || !response.data) {
                    statusMsg.innerText = "⚠️ Ouvrez une page Vinted (vinted.fr)";
                    statusMsg.className = "status-msg error";
                    return;
                }

                const data = response.data;
                if (pseudoOverride) {
                    data.pseudo = pseudoOverride;
                }

                // Mettre à jour l'affichage popup
                valVues.innerText = data.vues;
                valLikes.innerText = data.likes;
                valMsgs.innerText = data.messages;
                valVentes.innerText = data.ventes;

                statusMsg.innerText = `⏳ Envoi vers ${serverUrl}...`;

                // Transmettre les données à l'API via le service worker background
                chrome.runtime.sendMessage({
                    action: "SYNC_TO_SERVER",
                    serverUrl,
                    payload: data
                }, (res) => {
                    if (res && res.success) {
                        statusMsg.innerText = `✅ Synchronisé pour @${data.pseudo}`;
                        statusMsg.className = "status-msg success";
                    } else {
                        statusMsg.innerText = `❌ Erreur API: ${res?.error || 'Serveur injoignable'}`;
                        statusMsg.className = "status-msg error";
                    }
                });
            });
        });
    });
});
