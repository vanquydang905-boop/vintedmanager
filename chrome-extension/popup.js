// ============================================================
// POPUP SCRIPT - VINTED MANAGER CHROME EXTENSION (DOTB + IFRAME SUPPORT)
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
    const valActifs = document.getElementById('valActifs');
    const valBrouillons = document.getElementById('valBrouillons');
    const valMasques = document.getElementById('valMasques');
    const valItems = document.getElementById('valItems');

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

    function processScrapedData(data, serverUrl, pseudoOverride) {
        if (pseudoOverride) {
            data.pseudo = pseudoOverride;
        }

        if (pseudoOverrideInput && !pseudoOverrideInput.value && data.pseudo) {
            pseudoOverrideInput.value = data.pseudo;
        }

        // Mettre à jour l'affichage popup
        valVues.innerText = data.vues || 0;
        valLikes.innerText = data.likes || 0;
        valMsgs.innerText = data.messages || 0;
        valVentes.innerText = data.ventes || 0;
        if (valActifs) valActifs.innerText = data.actifsCount || 0;
        if (valBrouillons) valBrouillons.innerText = data.brouillonsCount || 0;
        if (valMasques) valMasques.innerText = data.masquesCount || 0;
        if (valItems) valItems.innerText = data.itemsCount || 0;

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
    }

    // Clic sur Scraper & Synchroniser
    btnSync.addEventListener('click', async () => {
        statusMsg.innerText = "⏳ Extraction des données Dotb...";
        statusMsg.className = "status-msg";

        const serverUrl = serverUrlInput.value.trim() || "http://localhost:3000";
        const pseudoOverride = pseudoOverrideInput.value.trim();

        // Récupérer l'onglet actif
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) {
                statusMsg.innerText = "❌ Aucun onglet actif trouvé";
                statusMsg.className = "status-msg error";
                return;
            }

            // Demander d'abord au script de contenu
            chrome.tabs.sendMessage(activeTab.id, { action: "SCRAPE_DATA" }, (response) => {
                if (response && response.data && response.data.itemsCount > 0) {
                    processScrapedData(response.data, serverUrl, pseudoOverride);
                } else {
                    // Fallback : Exécuter l'extraction sur tous les frames de la page
                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id, allFrames: true },
                        files: ['content.js']
                    }, () => {
                        chrome.tabs.sendMessage(activeTab.id, { action: "SCRAPE_DATA" }, (resp2) => {
                            if (resp2 && resp2.data) {
                                processScrapedData(resp2.data, serverUrl, pseudoOverride);
                            } else {
                                statusMsg.innerText = "⚠️ Ouvrez la page du dressing Dotb";
                                statusMsg.className = "status-msg error";
                            }
                        });
                    });
                }
            });
        });
    });
});
