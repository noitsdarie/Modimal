const productDetail = document.querySelector("#productDetail");
const productPageStatus = document.querySelector("#productPageStatus");
const productNotFound = document.querySelector("#productNotFound");
const productId = new URLSearchParams(window.location.search).get("id");

function showProductNotFound(message) {
    productPageStatus.hidden = true;
    productNotFound.hidden = false;
    if (message) {
        productNotFound.querySelector("p").textContent = message;
    }
}

function renderProduct(product) {
    const image = document.querySelector("#productImage");
    const swatches = document.querySelector("#productColors");
    const selectedColor = document.querySelector("#selectedColor");
    const sizeSelect = document.querySelector("#productSize");

    document.title = `${product.title} | Modimal`;
    document.querySelector('meta[name="description"]').content = product.description;
    document.querySelector("#productBreadcrumb").textContent = product.title;
    document.querySelector("#productSubtitle").textContent = product.name;
    document.querySelector("#productTitle").textContent = product.title;
    document.querySelector("#productPrice").textContent = `$${product.price}`;
    document.querySelector("#productDescription").textContent = product.description;

    image.src = product.image;
    image.alt = product.alt || product.title;

    sizeSelect.replaceChildren(new Option("Select size", ""));
    product.sizes.forEach(size => {
        sizeSelect.add(new Option(size.toUpperCase(), size));
    });

    swatches.replaceChildren();
    product.swatches.forEach((swatch, index) => {
        const colorButton = document.createElement("button");
        colorButton.type = "button";
        colorButton.setAttribute("aria-label", swatch.name);
        colorButton.setAttribute("aria-pressed", String(index === 0));
        colorButton.title = swatch.name;
        colorButton.style.setProperty("--swatch-color", swatch.value);
        colorButton.addEventListener("click", () => {
            swatches.querySelectorAll("button").forEach(button => {
                button.setAttribute("aria-pressed", String(button === colorButton));
            });
            selectedColor.textContent = swatch.name;
        });
        swatches.append(colorButton);
    });

    selectedColor.textContent = product.swatches[0]?.name || "";
    productPageStatus.hidden = true;
    productDetail.hidden = false;
}

async function initializeProductPage() {
    if (!productId) {
        showProductNotFound("Choose a product from the collection to view its details.");
        return;
    }

    try {
        const products = await window.ModimalProducts.loadCatalog();
        const product = products.find(item => item.id === productId);

        if (!product) {
            showProductNotFound();
            return;
        }

        renderProduct(product);
    } catch (error) {
        console.error(error);
        showProductNotFound("Sorry, we couldn't load this product. Please try again later.");
    }
}

initializeProductPage();
