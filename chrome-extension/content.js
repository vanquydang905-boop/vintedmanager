// ============================================================
// CONTENT SCRIPT - VINTED MANAGER CHROME EXTENSION
// ============================================================

console.log("[Vinted Manager Extension] Content script loaded on Vinted page.");

function extractVintedData() {
    let pseudo = "";
    
    // 1. Extraire le pseudo de l'utilisateur connecté
    const userAvatarEl = document.querySelector('a[href*="/member/"], a[data-testid*="user-menu"], .web_ui__Header__user-menu');
    if (userAvatarEl) {
        const href = userAvatarEl.getAttribute('href') || '';
        const match = href.match(/\/member\/(\d+)-([^\/?#]+)/);
        if (match) {
            pseudo = match[2];
        }
    }
    if (!pseudo) {
        const titleEl = document.querySelector('.user-profile__username, h1.web_ui__Text__title');
        if (titleEl) pseudo = titleEl.innerText.trim();
    }
    if (!pseudo) {
        const navUser = document.querySelector('[data-testid="header-user-menu-username"]');
        if (navUser) pseudo = navUser.innerText.trim();
    }

    // 2. Extraire le nombre de vues cumulées et favoris (likes)
    let vuesTotal = 0;
    let likesTotal = 0;

    const favoriteEls = document.querySelectorAll('[data-testid*="favourite-count"], .favourite-button__count');
    favoriteEls.forEach(el => {
        const val = parseInt(el.innerText.replace(/\D/g, '')) || 0;
        likesTotal += val;
    });

    const viewEls = document.querySelectorAll('[data-testid*="view-count"], .item-box__views');
    viewEls.forEach(el => {
        const val = parseInt(el.innerText.replace(/\D/g, '')) || 0;
        vuesTotal += val;
    });

    // 3. Extraire les messages non lus
    let messagesCount = 0;
    const msgBadge = document.querySelector('[data-testid="header-inbox-badge"], .web_ui__Badge__badge');
    if (msgBadge) {
        messagesCount = parseInt(msgBadge.innerText.replace(/\D/g, '')) || 0;
    }

    // 4. Extraire les ventes
    let ventesCount = 0;
    const soldTab = document.querySelector('a[href*="/sold"], [data-testid="profile-tab-sold"]');
    if (soldTab) {
        ventesCount = parseInt(soldTab.innerText.replace(/\D/g, '')) || 0;
    }

    // 5. Extraire les articles individuels
    const items = [];
    const itemCards = document.querySelectorAll('.feed-grid__item, [data-testid="grid-item"]');
    itemCards.forEach(card => {
        const title = card.querySelector('.web_ui__ItemBox__title, [data-testid*="title"]')?.innerText?.trim() || "Article Vinted";
        const price = card.querySelector('.web_ui__ItemBox__price, [data-testid*="price"]')?.innerText?.trim() || "";
        const likes = parseInt(card.querySelector('[data-testid*="favourite"]')?.innerText?.replace(/\D/g, '')) || 0;
        items.push({ title, price, likes });
    });

    return {
        pseudo: pseudo || "compte_vinted",
        vues: vuesTotal,
        likes: likesTotal,
        favoris: likesTotal,
        messages: messagesCount,
        ventes: ventesCount,
        itemsCount: items.length,
        items,
        timestamp: new Date().toISOString()
    };
}

// Écouter les messages venant du Popup ou Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SCRAPE_DATA") {
        const data = extractVintedData();
        console.log("[Vinted Manager Extension] Données Vinted capturées :", data);
        sendResponse({ success: true, data });
    }
    return true;
});
