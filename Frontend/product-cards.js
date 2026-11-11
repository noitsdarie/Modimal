(() => {
    async function loadCatalog() {
        const response = await fetch("./products.json");

        if (!response.ok) {
            throw new Error(`Could not load products.json (${response.status})`);
        }

        const catalog = await response.json();
        const products = Array.isArray(catalog) ? catalog : catalog.products;

        if (!Array.isArray(products)) {
            throw new TypeError("products.json must contain a products array");
        }

        const ids = new Set();
        products.forEach(product => {
            if (
                !product.id ||
                !product.title ||
                !product.name ||
                !Number.isFinite(product.price) ||
                !product.image ||
                !Array.isArray(product.sizes) ||
                !Array.isArray(product.colors) ||
                !product.fabric ||
                !product.collection ||
                !product.date ||
                !Array.isArray(product.swatches)
            ) {
                throw new TypeError("products.json contains an incomplete product record");
            }

            if (ids.has(product.id)) {
                throw new TypeError(`products.json contains duplicate product ID: ${product.id}`);
            }

            ids.add(product.id);
        });

        return products;
    }

    function createCard(product) {
        const card = document.createElement("article");
        card.className = "product-tile-shop";
        card.dataset.productId = product.id;
        card.dataset.size = product.sizes.join(",");
        card.dataset.color = product.colors.join(",");
        card.dataset.fabric = product.fabric;
        card.dataset.collection = product.collection;
        card.dataset.date = product.date;

        const imageWrap = document.createElement("div");
        imageWrap.className = "shop-product-image-wrap";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.alt;
        image.loading = "lazy";
        imageWrap.append(image);

        const nextButton = document.createElement("button");
        nextButton.className = "card-action";
        nextButton.type = "button";
        nextButton.dataset.action = "next-product";
        nextButton.textContent = "NEXT";
        imageWrap.append(nextButton);

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "favorite-toggle";
        favoriteButton.type = "button";
        favoriteButton.dataset.action = "toggle-favorite";
        favoriteButton.dataset.favoriteLabel = product.name;
        favoriteButton.setAttribute("aria-label", `Add ${product.name} to favorites`);
        favoriteButton.setAttribute("aria-pressed", "false");
        favoriteButton.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"></path></svg>';
        imageWrap.append(favoriteButton);
        card.append(imageWrap);

        const title = document.createElement("p");
        title.className = "product-title";
        title.textContent = product.title;
        card.append(title);

        const namePrice = document.createElement("div");
        namePrice.className = "nameprice";

        const name = document.createElement("p");
        name.textContent = product.name;
        namePrice.append(name);

        const price = document.createElement("p");
        price.className = "price";
        const priceData = document.createElement("data");
        priceData.value = String(product.price);
        const priceLabel = document.createElement("b");
        priceLabel.textContent = `$${product.price}`;
        priceData.append(priceLabel);
        price.append(priceData);
        namePrice.append(price);
        card.append(namePrice);

        const colors = document.createElement("div");
        colors.className = "colors";
        colors.setAttribute("role", "group");
        colors.setAttribute("aria-label", "Available colors");

        product.swatches.forEach(swatch => {
            const colorButton = document.createElement("button");
            colorButton.type = "button";
            colorButton.setAttribute("aria-label", swatch.name);
            colorButton.setAttribute("aria-pressed", "false");
            colorButton.style.setProperty("--swatch-color", swatch.value);
            colorButton.dataset.color = swatch.value;
            colors.append(colorButton);
        });

        card.append(colors);
        return card;
    }

    window.ModimalProducts = {
        loadCatalog,
        createCard
    };
})();
