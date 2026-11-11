const FAVORITES_KEY = "modimal-favorites";
const favoritesContainer = document.querySelector(".favorites-items");
const favoriteIdAliases = new Map([["Rule-zip-jacket", "rule-zip-jacket"]]);

function getFavorites() {
    return (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [])
        .map(id => favoriteIdAliases.get(id) || id);
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function updateFavoritesCount() {
    const count = getFavorites().length;

    document.querySelectorAll(".favorites-count").forEach(element => {
        element.textContent = count;
    });

    document.querySelectorAll(".favorites-count-label").forEach(element => {
        element.textContent = count === 1 ? "item" : "items";
    });
}

function toggleFavorite(productId) {
    const favorites = getFavorites();
    const updatedFavorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

    saveFavorites(updatedFavorites);
    return updatedFavorites;
}

function updateFavoriteButtons() {
    document.querySelectorAll(".favorite-toggle").forEach(button => {
        const product = button.closest("[data-product-id]");

        if (!product) {
            return;
        }

        const isFavorite = getFavorites().includes(product.dataset.productId);
        const label = button.dataset.favoriteLabel || "product";

        button.setAttribute("aria-pressed", String(isFavorite));
        button.setAttribute(
            "aria-label",
            `${isFavorite ? "Remove" : "Add"} ${label} ${isFavorite ? "from" : "to"} favorites`
        );
    });
}

async function loadFavoritesCatalog() {
    const [products, response] = await Promise.all([
        window.ModimalProducts.loadCatalog(),
        fetch("./index.html")
    ]);

    if (!response.ok) {
        throw new Error(`Could not load ./index.html (${response.status})`);
    }

    const html = await response.text();
    const indexDocument = new DOMParser().parseFromString(html, "text/html");
    const modiweekItems = [...indexDocument.querySelectorAll(".modiweek-item")];

    return { products, modiweekItems };
}

function makeModiweekCard(item) {
    const clone = item.cloneNode(true);
    clone.classList.add("favorite-product-card");
    clone.querySelector(".product-image-wrap")?.classList.add("favorite-product-image");

    clone.querySelectorAll("[src]").forEach(element => {
        element.src = new URL(element.getAttribute("src"), new URL("./index.html", window.location.href)).href;
    });

    return clone;
}

async function renderFavorites() {
    if (!favoritesContainer) {
        return;
    }

    favoritesContainer.replaceChildren();
    const favorites = getFavorites();

    if (favorites.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-favorites";
        emptyMessage.textContent = "Your wish list is empty.";
        favoritesContainer.append(emptyMessage);
        updateFavoritesCount();
        return;
    }

    try {
        const { products, modiweekItems } = await loadFavoritesCatalog();
        const favoriteIds = new Set(favorites);
        const productCards = products
            .filter(product => favoriteIds.has(product.id))
            .map(product => {
                const card = window.ModimalProducts.createCard(product);
                card.classList.add("favorite-product-card");
                card.querySelector(".shop-product-image-wrap")
                    .classList.add("favorite-product-image");
                return card;
            });
        const modiweekCards = modiweekItems
            .filter(item => favoriteIds.has(item.dataset.productId))
            .map(makeModiweekCard);

        favoritesContainer.append(...productCards, ...modiweekCards);
        updateFavoritesCount();
        updateFavoriteButtons();
    } catch (error) {
        console.error(error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Sorry, we couldn't load your favorite products.";
        favoritesContainer.replaceChildren(errorMessage);
    }
}

document.addEventListener("click", async event => {
    const button = event.target.closest(".favorite-toggle");

    if (!button) {
        return;
    }

    const product = button.closest("[data-product-id]");

    if (!product) {
        return;
    }

    toggleFavorite(product.dataset.productId);
    updateFavoritesCount();
    updateFavoriteButtons();

    if (favoritesContainer) {
        await renderFavorites();
    }
});

async function initializeFavorites() {
    updateFavoritesCount();

    if (favoritesContainer) {
        await renderFavorites();
    } else {
        updateFavoriteButtons();
    }
}

initializeFavorites();
