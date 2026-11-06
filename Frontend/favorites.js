
const FAVORITES_KEY = "modimal-favorites";

const favoritesContainer = document.querySelector(".favorites-items");

// Отримуємо збережені ID товарів
function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

// Зберігаємо ID товарів
function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Оновлюємо лічильники на сторінці
function updateFavoritesCount() {
    const count = getFavorites().length;

    document.querySelectorAll(".favorites-count").forEach(element => {
        element.textContent = count;
    });

    document.querySelectorAll(".favorites-count-label").forEach(element => {
        element.textContent = count === 1 ? "item" : "items";
    });
}

// Додаємо або видаляємо товар
function toggleFavorite(productId) {
    const favorites = getFavorites();

    const updatedFavorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

    saveFavorites(updatedFavorites);

    return updatedFavorites;
}

// Змінюємо вигляд сердечка
function updateFavoriteButtons() {
    document.querySelectorAll(".favorite-toggle").forEach(button => {
        const product = button.closest(".product-tile-shop");

        if (!product) return;

        const isFavorite = getFavorites().includes(product.dataset.productId);

        button.setAttribute("aria-pressed", String(isFavorite));

        const label = button.dataset.favoriteLabel || "product";

        button.setAttribute(
            "aria-label",
            `${isFavorite ? "Remove" : "Add"} ${label} ${isFavorite ? "from" : "to"} favorites`
        );
    });
}

// Завантажуємо каталог для сторінки Favorites
async function loadCatalog() {
    const response = await fetch("./shop.html");

    if (!response.ok) {
        throw new Error("Could not load shop.html");
    }

    const html = await response.text();
    const parser = new DOMParser();
    const catalogDocument = parser.parseFromString(html, "text/html");

    return [...catalogDocument.querySelectorAll(".product-tile-shop")];
}

// Відображаємо улюблені товари
async function renderFavorites() {
    if (!favoritesContainer) return;

    favoritesContainer.innerHTML = "";

    const favorites = getFavorites();

    const countElement = document.querySelector(".favorites-count-label");

    if (countElement) {
        countElement.textContent = favorites.length === 1 ? "item" : "items";
    }

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = "<p class='empty-favorites'>Your wish list is empty.</p>";
        return;
    }

    try {
        const catalogProducts = await loadCatalog();

        const favoriteProducts = catalogProducts.filter(product =>
            favorites.includes(product.dataset.productId)
        );

        favoriteProducts.forEach(product => {
            const productClone = product.cloneNode(true);

            // Оновлюємо шляхи до зображень відносно shop.html
            productClone.querySelectorAll("[src]").forEach(element => {
                element.src = new URL(
                element.getAttribute("src"),
                new URL("./shop.html", window.location.href)
            ).href;
});


            favoritesContainer.append(productClone);
        });

        updateFavoriteButtons();

    } catch (error) {
        console.error(error);
        favoritesContainer.innerHTML =
            "<p>Sorry, we couldn't load your favorite products.</p>";
    }
}

// Обробляємо натискання на сердечка
document.addEventListener("click", async event => {
    const button = event.target.closest(".favorite-toggle");

    if (!button) return;

    const product = button.closest(".product-tile-shop");

    if (!product) return;

    const productId = product.dataset.productId;

    toggleFavorite(productId);

    updateFavoritesCount();
    updateFavoriteButtons();

    // Якщо ми на Favorites — перемальовуємо список
    if (favoritesContainer) {
        await renderFavorites();
    }
});

// Початкова ініціалізація
async function initializeFavorites() {
    updateFavoritesCount();

    if (favoritesContainer) {
        await renderFavorites();
    } else {
        updateFavoriteButtons();
    }
}

initializeFavorites();
