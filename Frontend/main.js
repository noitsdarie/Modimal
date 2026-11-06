const selectedFilters = {
    size: [],
    color: [],
    collection: [],
    fabric: []
};

const productCards = document.querySelectorAll(".product-tile-shop");
const loadMoreButton = document.querySelector(".load-more");

let visibleProducts = 6;

const productsPerClick = 2;

const sortSelect = document.querySelector("#sort-by");
const originalOrder = [...productCards];

function matchesFilter(product, filterName) {
    const selectedValues = selectedFilters[filterName];

    if (selectedValues.length === 0) {
        return true;
    }

    const productValues = product.dataset[filterName].split(",");

    return selectedValues.some(value => productValues.includes(value));
}

function applyFilters() {
    const matchingProducts = [...productCards].filter(product => {
        return Object.keys(selectedFilters).every(filterName => {
            return matchesFilter(product, filterName);
        });
    });

    productCards.forEach(product => {
        product.hidden = true;
    });

    matchingProducts.slice(0, visibleProducts).forEach(product => {
        product.hidden = false;
    });

    loadMoreButton.hidden = matchingProducts.length <= visibleProducts;
}

loadMoreButton.addEventListener("click", () => {
    visibleProducts += productsPerClick;

    applyFilters();
});

function sortProducts() {
    const sortValue = sortSelect.value;

    const sortedProducts = [...productCards];

    if (sortValue === "price-low") {
        sortedProducts.sort((a, b) => {
            const priceA = Number(a.querySelector(".price data").value);
            const priceB = Number(b.querySelector(".price data").value);

            return priceA - priceB;
        });
    }

    else if (sortValue === "price-high") {
        sortedProducts.sort((a, b) => {
            const priceA = Number(a.querySelector(".price data").value);
            const priceB = Number(b.querySelector(".price data").value);

            return priceB - priceA;
        });
    }

    else if (sortValue === "newest") {
        sortedProducts.sort((a, b) => {
            return new Date(b.dataset.date) - new Date(a.dataset.date);
        });
    }

    else if (sortValue === "featured") {
        sortedProducts.sort((a, b) => {
            return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        });
    }

    document.querySelector(".shop-all-items").append(...sortedProducts);
}

sortSelect.addEventListener("change", () => {
    visibleProducts = 6;

    sortProducts();
    applyFilters();
});

applyFilters();

document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="toggle-favorite"]');

    if (button) {
        const isFavorite = button.getAttribute("aria-pressed") === "true";
        const nextIsFavorite = !isFavorite;
        const favoriteLabel = button.dataset.favoriteLabel;

        button.setAttribute("aria-pressed", String(nextIsFavorite));
        button.setAttribute(
            "aria-label",
            `${nextIsFavorite ? "Remove" : "Add"} ${favoriteLabel} ${nextIsFavorite ? "from" : "to"} favorites`
        );
    }

    const bestSellerDot = event.target.closest('[data-action="show-best-seller"]');
    if (bestSellerDot) {
        const track = bestSellerDot.closest("#best-sellers").querySelector(".best-sellers-products");
        const slide = track.querySelectorAll(".product-tile")[Number(bestSellerDot.dataset.slide)];

        if (slide) {
            track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
        }
        return;
    }

    const burger = event.target.closest('[data-action="toggle-menu"]');

    if (burger) {
        const searchDrawer = document.querySelector("#search-drawer");
        searchDrawer.setAttribute("aria-hidden", "true");
        searchDrawer.hidden = true;
        burger.closest(".nav-menu").classList.remove("is-search-open");
        document.querySelectorAll('[data-action="open-search"]').forEach((trigger) => {
            trigger.setAttribute("aria-expanded", "false");
        });

        const isOpen = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!isOpen));
        burger.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
        burger.closest(".nav-menu").classList.toggle("is-menu-open", !isOpen);

        resetMobileSubmenus(burger.closest(".nav-menu"));
        return;
    }

    const searchTrigger = event.target.closest('[data-action="open-search"]');
    const searchClose = event.target.closest('[data-action="close-search"]');

    if (searchTrigger || searchClose) {
        const drawer = document.querySelector("#search-drawer");
        const isOpen = drawer.getAttribute("aria-hidden") === "false";
        const shouldOpen = searchTrigger ? !isOpen : false;

        drawer.setAttribute("aria-hidden", String(!shouldOpen));
        drawer.hidden = !shouldOpen;
        document.querySelectorAll('[data-action="open-search"]').forEach((trigger) => {
            trigger.setAttribute("aria-expanded", String(shouldOpen));
        });
        drawer.closest(".nav-menu").classList.toggle("is-search-open", shouldOpen);

        if (shouldOpen) {
            const nav = searchTrigger.closest(".nav-menu");
            nav.classList.remove("is-menu-open");
            const burgerButton = nav.querySelector('[data-action="toggle-menu"]');
            burgerButton.setAttribute("aria-expanded", "false");
            burgerButton.setAttribute("aria-label", "Open menu");
            resetMobileSubmenus(nav);
            document.querySelector("#site-search").focus();
        } else {
            const focusTarget = window.matchMedia("(max-width: 800px)").matches
                ? document.querySelector(".mobile-search")
                : document.querySelector('[data-action="open-search"]:not(.mobile-search)');
            focusTarget.focus();
        }
        return;
    }

    const menuTrigger = event.target.closest(
        ".collection-nav-item > .menu-item, .new-in-nav-item > .menu-item, .plus-size-nav-item > .menu-item, .sustainability-nav-item > .menu-item"
    );

    if (!menuTrigger || !window.matchMedia("(max-width: 800px)").matches) {
        const mobileLink = event.target.closest("#main-nav-options a");
        if (mobileLink && window.matchMedia("(max-width: 800px)").matches) {
            const nav = mobileLink.closest(".nav-menu");
            nav.classList.remove("is-menu-open");
            nav.querySelector('[data-action="toggle-menu"]').setAttribute("aria-expanded", "false");
            nav.querySelector('[data-action="toggle-menu"]').setAttribute("aria-label", "Open menu");
            resetMobileSubmenus(nav);
        }
        return;
    }

    event.preventDefault();
    const menuItem = menuTrigger.parentElement;
    const isOpen = menuItem.classList.toggle("is-submenu-open");
    menuTrigger.setAttribute("aria-expanded", String(isOpen));
    menuTrigger.closest(".options").scrollTop = 0;

    return;
});

const bestSellersTrack = document.querySelector(
    "#best-sellers .best-sellers-products"
);

if (bestSellersTrack) {
    const bestSellerDots = document.querySelectorAll(
        '#best-sellers [data-action="show-best-seller"]'
    );

    let bestSellersScrollFrame = 0;

    bestSellersTrack.addEventListener("scroll", () => {
        if (bestSellersScrollFrame) {
            cancelAnimationFrame(bestSellersScrollFrame);
        }

        bestSellersScrollFrame = requestAnimationFrame(() => {
            const slides = [...bestSellersTrack.querySelectorAll(".product-tile")];

            if (slides.length === 0) {
                bestSellersScrollFrame = 0;
                return;
            }

            const activeIndex = slides.reduce((closestIndex, slide, index) => {
                const closestSlide = slides[closestIndex];

                return Math.abs(
                    slide.offsetLeft - bestSellersTrack.offsetLeft -
                    bestSellersTrack.scrollLeft
                ) < Math.abs(
                    closestSlide.offsetLeft - bestSellersTrack.offsetLeft -
                    bestSellersTrack.scrollLeft
                )
                    ? index
                    : closestIndex;
            }, 0);

            bestSellerDots.forEach((dot, index) => {
                dot.setAttribute("aria-pressed", String(index === activeIndex));
            });

            bestSellersScrollFrame = 0;
        });
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    const drawer = document.querySelector("#search-drawer");
    if (drawer.getAttribute("aria-hidden") === "true") {
        return;
    }

    drawer.setAttribute("aria-hidden", "true");
    drawer.hidden = true;
    drawer.closest(".nav-menu").classList.remove("is-search-open");
    document.querySelectorAll('[data-action="open-search"]').forEach((trigger) => {
        trigger.setAttribute("aria-expanded", "false");
    });
    const focusTarget = window.matchMedia("(max-width: 800px)").matches
        ? document.querySelector(".mobile-search")
        : document.querySelector('[data-action="open-search"]:not(.mobile-search)');
    focusTarget.focus();
});

function resetMobileSubmenus(nav) {
    nav.querySelectorAll(".options > .is-submenu-open").forEach((item) => {
        item.classList.remove("is-submenu-open");
        item.querySelector(":scope > .menu-item").setAttribute("aria-expanded", "false");
    });
    nav.querySelector(".options").scrollTop = 0;
}

const newsletterForm = document.querySelector("#newsletter-form");
const newsletterStatus = document.querySelector("#newsletter-status");

newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterStatus.textContent =
        "Thanks! Your email and consent are valid. Newsletter signup isn't connected to a server yet.";
});

newsletterForm.addEventListener("input", () => {
    newsletterStatus.textContent = "";
});


const filterButtons = document.querySelectorAll(".filter-toggle");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const optionsId = button.getAttribute("aria-controls");
        const options = document.getElementById(optionsId);
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        options.hidden = isExpanded;
    });
});

const checkboxes = document.querySelectorAll('#product-filters input[type="checkbox"]');
const productFiltersForm = document.querySelector("#product-filters");

const clearFiltersButton = document.querySelector('[data-action="clear-filters"]');

if (clearFiltersButton && productFiltersForm) {
    clearFiltersButton.addEventListener("click", () => {
        productFiltersForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        Object.keys(selectedFilters).forEach(filterName => {
            selectedFilters[filterName] = [];
        });

        visibleProducts = 6;
        applyFilters();
    });
}

const mobileFiltersTrigger = document.querySelector('[data-action="toggle-filters"]');
const filtersPanel = document.querySelector("#filters-panel");
const filtersBackdrop = document.querySelector(".filters-backdrop");
const filtersCloseButton = document.querySelector(".filters-close");
const applyFiltersButton = document.querySelector(".filter-apply");

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
            selectedFilters[filterName] = [...checkboxes]
                .filter(checkbox => checkbox.name === filterName && checkbox.checked)
                .map(checkbox => checkbox.value);
        });

        visibleProducts = 6;
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
        button.addEventListener("click", () => {
            setMobileFiltersOpen(false);
        });
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
        if (!window.matchMedia("(max-width: 800px)").matches && filtersPanel.classList.contains("is-open")) {
            setMobileFiltersOpen(false, false);
        }
    });
}