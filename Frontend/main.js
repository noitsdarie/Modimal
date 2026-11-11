document.addEventListener("click", (event) => {
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
