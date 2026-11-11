const selectedFilters = {
    size: [],
    color: [],
    collection: [],
    fabric: []
};

const productsPerPage = 4;
const productsPerClick = 2;
const productGrid = document.querySelector(".shop-all-items");
const catalogStatus = document.querySelector(".catalog-status");
const loadMoreButton = document.querySelector(".load-more");
const sortSelect = document.querySelector("#sort-by");
const productFiltersForm = document.querySelector("#product-filters");
const filterCheckboxes = document.querySelectorAll('#product-filters input[type="checkbox"]');
const mobileFiltersTrigger = document.querySelector('[data-action="toggle-filters"]');
const filtersPanel = document.querySelector("#filters-panel");
const filtersBackdrop = document.querySelector(".filters-backdrop");
const filtersCloseButton = document.querySelector(".filters-close");
const applyFiltersButton = document.querySelector(".filter-apply");
const clearFiltersButton = document.querySelector('[data-action="clear-filters"]');

let productCards = [];
let originalOrder = [];
let visibleProducts = productsPerPage;

function matchesFilter(product, filterName) {
    const selectedValues = selectedFilters[filterName];

    if (selectedValues.length === 0) {
        return true;
    }

    const productValues = product.dataset[filterName]
        .split(",")
        .map(value => value.trim());

    return selectedValues.some(value => productValues.includes(value));
}

function applyFilters() {
    const matchingProducts = productCards.filter(product =>
        Object.keys(selectedFilters).every(filterName =>
            matchesFilter(product, filterName)
        )
    );

    productCards.forEach(product => {
        product.hidden = true;
    });

    matchingProducts.slice(0, visibleProducts).forEach(product => {
        product.hidden = false;
    });

    if (loadMoreButton) {
        loadMoreButton.hidden = matchingProducts.length <= visibleProducts;
    }
}

function sortProducts() {
    const sortValue = sortSelect.value;
    const sortedProducts = [...productCards];

    if (sortValue === "price-low" || sortValue === "price-high") {
        const direction = sortValue === "price-low" ? 1 : -1;
        sortedProducts.sort((a, b) => {
            const priceA = Number(a.querySelector(".price data").value);
            const priceB = Number(b.querySelector(".price data").value);
            return (priceA - priceB) * direction;
        });
    } else if (sortValue === "newest") {
        sortedProducts.sort((a, b) =>
            new Date(b.dataset.date) - new Date(a.dataset.date)
        );
    } else if (sortValue === "featured") {
        sortedProducts.sort((a, b) =>
            originalOrder.indexOf(a) - originalOrder.indexOf(b)
        );
    }

    productGrid.append(...sortedProducts);
}

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
        visibleProducts += productsPerClick;
        applyFilters();
    });
}

if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        visibleProducts = productsPerPage;
        sortProducts();
        applyFilters();
    });
}

const filterButtons = document.querySelectorAll(".filter-toggle");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const options = document.getElementById(button.getAttribute("aria-controls"));
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        options.hidden = isExpanded;
    });
});

function resetFilters() {
    productFiltersForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    Object.keys(selectedFilters).forEach(filterName => {
        selectedFilters[filterName] = [];
    });

    visibleProducts = productsPerPage;
    applyFilters();
}

if (clearFiltersButton && productFiltersForm) {
    clearFiltersButton.addEventListener("click", resetFilters);
}

function setMobileFiltersOpen(isOpen, restoreFocus = true) {
    if (!mobileFiltersTrigger || !filtersPanel || !filtersBackdrop) {
        return;
    }

    filtersPanel.classList.toggle("is-open", isOpen);
    filtersBackdrop.hidden = !isOpen;
    mobileFiltersTrigger.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("filters-open", isOpen);

    if (isOpen) {
        filtersPanel.setAttribute("role", "dialog");
        filtersPanel.setAttribute("aria-modal", "true");
        filtersCloseButton.focus();
    } else {
        filtersPanel.removeAttribute("role");
        filtersPanel.removeAttribute("aria-modal");

        if (restoreFocus) {
            mobileFiltersTrigger.focus();
        }
    }
}

if (productFiltersForm && applyFiltersButton) {
    productFiltersForm.addEventListener("submit", event => {
        event.preventDefault();

        Object.keys(selectedFilters).forEach(filterName => {
            selectedFilters[filterName] = [...filterCheckboxes]
                .filter(checkbox => checkbox.name === filterName && checkbox.checked)
                .map(checkbox => checkbox.value);
        });

        visibleProducts = productsPerPage;
        applyFilters();

        if (filtersPanel && filtersPanel.classList.contains("is-open")) {
            setMobileFiltersOpen(false);
        }
    });
}

if (mobileFiltersTrigger && filtersPanel && filtersBackdrop && filtersCloseButton) {
    mobileFiltersTrigger.addEventListener("click", () => {
        setMobileFiltersOpen(!filtersPanel.classList.contains("is-open"));
    });

    document.querySelectorAll('[data-action="close-filters"]').forEach(button => {
        button.addEventListener("click", () => setMobileFiltersOpen(false));
    });

    document.addEventListener("keydown", event => {
        if (!filtersPanel.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            setMobileFiltersOpen(false);
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableElements = [...filtersPanel.querySelectorAll(
            'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )].filter(element => !element.closest("[hidden]"));
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (
            !window.matchMedia("(max-width: 800px)").matches &&
            filtersPanel.classList.contains("is-open")
        ) {
            setMobileFiltersOpen(false, false);
        }
    });
}

async function initializeShop() {
    try {
        const products = await window.ModimalProducts.loadCatalog();
        const cards = products.map(product => window.ModimalProducts.createCard(product));

        productGrid.replaceChildren(...cards);
        productCards = [...productGrid.querySelectorAll(".product-tile-shop")];
        originalOrder = [...productCards];

        if (catalogStatus) {
            catalogStatus.hidden = true;
        }

        applyFilters();
    } catch (error) {
        console.error(error);
        if (catalogStatus) {
            catalogStatus.textContent = "Sorry, we couldn't load the products. Please try again later.";
            catalogStatus.hidden = false;
        }
        if (loadMoreButton) {
            loadMoreButton.hidden = true;
        }
    }
}

initializeShop();
