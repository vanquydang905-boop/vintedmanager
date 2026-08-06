// ============================================================
// BACKGROUND SERVICE WORKER - VINTED MANAGER EXTENSION
// ============================================================

console.log("[Vinted Manager Extension] Background Service Worker initialized.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_TO_SERVER") {
        const { serverUrl, payload } = request;
        const targetUrl = (serverUrl || "https://vintedmanager-bkgg.vercel.app").replace(/\/$/, '') + "/api/extension/sync";

        fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            console.log("[Vinted Manager Extension] Sync successful:", data);
            sendResponse({ success: true, response: data });
        })
        .catch(err => {
            console.error("[Vinted Manager Extension] Sync error:", err);
            sendResponse({ success: false, error: err.message });
        });

        return true;
    }
});
