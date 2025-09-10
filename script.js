// Global variables
let wishlist = [];
let currentProduct = null;

// --- Page Switching Logic ---

/**
 * Shows a specific page section and hides others.
 * @param {string} pageId - The ID of the page section to show.
 * @param {boolean} isHome - Whether the page to show is the homepage.
 */
function showPage(pageId, isHome = false) {
    const pages = ['homepage-content', 'products-page', 'custom-products-page', 'product-detail-page', 'seller-page', 'profile-page', 'raw-materials-page', 'about-us-page', 'help-support-page', 'wishlist-page'];
    const heroSection = document.getElementById('hero-section');
    
    // Toggle hero section visibility
    if (pageId === 'homepage-content' && isHome) {
        heroSection.classList.remove('hidden');
    } else {
        heroSection.classList.add('hidden');
    }

    // Hide all content pages
    pages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    // Show the selected page
    const currentPage = document.getElementById(pageId);
    if (currentPage) {
        currentPage.classList.remove('hidden');
        if (pageId === 'products-page') {
            renderProductsPage();
        } else if (pageId === 'custom-products-page') {
            renderCustomProductsPage();
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Switches between buyer and seller profile sections.
 * @param {string} section - The section to show ('buyer' or 'seller').
 */
function showProfileSection(section) {
    const buyerSection = document.getElementById('buyer-profile-section');
    const sellerSection = document.getElementById('seller-profile-section');
    const buyerTab = document.getElementById('buyer-tab');
    const sellerTab = document.getElementById('seller-tab');
    
    if (section === 'buyer') {
        buyerSection.classList.remove('hidden');
        sellerSection.classList.add('hidden');
        buyerTab.classList.add('border-[#6b584d]', 'text-[#6b584d]');
        buyerTab.classList.remove('border-transparent', 'text-gray-500');
        sellerTab.classList.add('border-transparent', 'text-gray-500');
        sellerTab.classList.remove('border-[#6b584d]', 'text-[#6b584d]');
        renderBuyerOrders();
    } else if (section === 'seller') {
        buyerSection.classList.add('hidden');
        sellerSection.classList.remove('hidden');
        sellerTab.classList.add('border-[#6b584d]', 'text-[#6b584d]');
        sellerTab.classList.remove('border-transparent', 'text-gray-500');
        buyerTab.classList.add('border-transparent', 'text-gray-500');
        buyerTab.classList.remove('border-[#6b584d]', 'text-[#6b584d]');
        renderSellerProducts();
        showSellerSection('products');
    }
}

/**
 * Switches between seller products and payments sections.
 * @param {string} section - The section to show ('products' or 'payments').
 */
function showSellerSection(section) {
    const productsSection = document.getElementById('seller-products-section');
    const paymentsSection = document.getElementById('seller-payments-section');
    const productsTab = document.getElementById('seller-products-tab');
    const paymentsTab = document.getElementById('seller-payments-tab');

    if (section === 'products') {
        productsSection.classList.remove('hidden');
        paymentsSection.classList.add('hidden');
        productsTab.classList.add('border-[#6b584d]', 'text-[#6b584d]');
        productsTab.classList.remove('border-transparent', 'text-gray-500');
        paymentsTab.classList.add('border-transparent', 'text-gray-500');
        paymentsTab.classList.remove('border-[#6b584d]', 'text-[#6b584d]');
    } else if (section === 'payments') {
        productsSection.classList.add('hidden');
        paymentsSection.classList.remove('hidden');
        paymentsTab.classList.add('border-[#6b584d]', 'text-[#6b584d]');
        paymentsTab.classList.remove('border-transparent', 'text-gray-500');
        productsTab.classList.add('border-transparent', 'text-gray-500');
        productsTab.classList.remove('border-[#6b584d]', 'text-[#6b584d]');
        renderPayments();
    }
}

// --- Rendering Functions ---

/**
 * Renders a grid of products.
 * @param {string} gridId - The ID of the grid element.
 * @param {Array} productsToRender - The array of products to render.
 */
function renderProductGrid(gridId, productsToRender) {
    const productGrid = document.getElementById(gridId);
    productGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg overflow-hidden shadow-md group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer';
        const isWishlisted = wishlist.includes(product.id);
        const wishlistIconColor = isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600';

        productCard.innerHTML = `
            <div class="relative">
                <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
                <button onclick="toggleWishlist(${product.id}, event)" class="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md ${wishlistIconColor} hover:text-red-500 transition-colors duration-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.66l1.318-1.342a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                </button>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg text-gray-800">${product.name}</h3>
                <p class="text-sm text-gray-500 mb-2">by ${product.seller}</p>
                <p class="text-gray-600 text-sm mb-2">${product.description.substring(0, 50)}...</p>
                <p class="font-bold text-[#6b584d]">${product.price}</p>
            </div>
        `;
        // Add a click listener to show the product detail page
        productCard.addEventListener('click', () => {
            showProductDetail(product);
        });
        productGrid.appendChild(productCard);
    });
}

/**
 * Renders the products page.
 * @param {string|null} category - The category to filter by, or null for all.
 */
function renderProductsPage(category = null) {
    let productsToRender = products;
    if (category) {
        productsToRender = products.filter(p => p.category === category);
    }
    renderProductGrid('all-products-grid', productsToRender);
}

/**
 * Renders the custom products page.
 */
function renderCustomProductsPage() {
    const customProducts = products.filter(p => p.customizable);
    renderProductGrid('custom-products-grid', customProducts);
}

/**
 * Renders product cards on the homepage.
 * @param {string|null} category - The category to filter by, or null for all.
 */
function renderProducts(category = null) {
    const productGridTitle = document.getElementById('product-grid-title');
    const backBtn = document.getElementById('back-to-all-products-btn');

    let productsToRender = products;
    let title = "Trending Products";
    
    if (category) {
        productsToRender = products.filter(p => p.category === category);
        title = category;
        backBtn.classList.remove('hidden');
    } else {
        backBtn.classList.add('hidden');
    }
    
    productGridTitle.textContent = title;
    renderProductGrid('product-grid', productsToRender);
}

/**
 * Populates and shows the product detail page.
 * @param {object} product - The product object to display.
 */
function showProductDetail(product) {
    currentProduct = product;
    document.getElementById('product-main-image').src = product.images[0];
    document.getElementById('product-main-image').alt = product.name;
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('seller-link').textContent = product.seller;
    document.getElementById('seller-link').href = product.sellerLink;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('product-description').textContent = product.description;

    // Update thumbnails
    document.getElementById('thumb-1').src = product.images[0];
    document.getElementById('thumb-2').src = product.images[1];
    document.getElementById('thumb-3').src = product.images[2];

    // Handle customization options section
    const customOptionsContainer = document.getElementById('custom-options-container');
    const presetSelect = document.getElementById('preset-option');
    if (product.customizable) {
        customOptionsContainer.classList.remove('hidden');
        // Clear and populate presets
        presetSelect.innerHTML = '';
        product.customOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            presetSelect.appendChild(optionElement);
        });
    } else {
        customOptionsContainer.classList.add('hidden');
    }

    // Clear previous form data and messages
    document.getElementById('custom-instructions').value = '';
    document.getElementById('file-upload').value = null;
    document.getElementById('add-to-cart-message').classList.add('hidden');

    // Attach event listener to the Add to Cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.onclick = () => {
        handleAddToCart(product);
    };

    // Render suggested products
    renderSuggestedProducts(product);

    showPage('product-detail-page');
}

/**
 * Renders a list of suggested products.
 * @param {object} currentProduct - The currently viewed product.
 */
function renderSuggestedProducts(currentProduct) {
    // Filter out the current product and shuffle the remaining
    const otherProducts = products.filter(p => p.id !== currentProduct.id).sort(() => 0.5 - Math.random());
    
    // Take up to 4 suggested products
    const suggestions = otherProducts.slice(0, 4);

    renderProductGrid('suggested-products-grid', suggestions);
}

/**
 * Renders raw material cards.
 * @param {string|null} category - The category to filter by, or null for all.
 */
function renderRawMaterials(category = null) {
    const rawMaterialsGrid = document.getElementById('raw-materials-grid');
    const rawMaterialsGridTitle = document.getElementById('raw-materials-grid-title');
    const backBtn = document.getElementById('back-to-all-materials-btn');

    let materialsToRender = rawMaterials;
    let title = "All Materials";
    
    if (category) {
        materialsToRender = rawMaterials.filter(m => m.category === category);
        title = category;
        backBtn.classList.remove('hidden');
    } else {
        backBtn.classList.add('hidden');
    }
    
    rawMaterialsGridTitle.textContent = title;
    rawMaterialsGrid.innerHTML = '';

    materialsToRender.forEach(material => {
        const materialCard = document.createElement('div');
        materialCard.className = 'bg-white rounded-lg overflow-hidden shadow-md group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer';
        materialCard.innerHTML = `
            <img src="${material.image}" alt="${material.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg text-gray-800">${material.name}</h3>
                <p class="text-sm text-gray-500 mb-2">by ${material.supplier}</p>
                <p class="font-bold text-[#6b584d]">${material.price}</p>
            </div>
        `;
        rawMaterialsGrid.appendChild(materialCard);
    });
}

/**
 * Renders the buyer's order history.
 */
function renderBuyerOrders() {
    const list = document.getElementById('order-history-list');
    list.innerHTML = '';
    mockBuyerOrders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center';
        orderItem.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">Order #${order.orderId}</p>
                <p class="text-sm text-gray-500">Item: ${order.item}</p>
                <p class="text-sm text-gray-500">Date: ${order.date}</p>
            </div>
            <div class="mt-2 sm:mt-0 text-right">
                <p class="font-bold text-[#6b584d]">${order.total}</p>
                <span class="text-xs text-green-500">${order.status}</span>
            </div>
        `;
        list.appendChild(orderItem);
    });
}

/**
 * Renders the seller's products.
 */
function renderSellerProducts() {
    const list = document.getElementById('seller-products-list');
    list.innerHTML = '';
    mockSellerProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'bg-white rounded-lg overflow-hidden shadow-md';
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-cover">
            <div class="p-2 text-center">
                <p class="font-semibold text-sm text-gray-800">${product.name}</p>
            </div>
        `;
        list.appendChild(productItem);
    });
}

/**
 * Renders the seller's payment history.
 */
function renderPayments() {
    const list = document.getElementById('payments-list');
    list.innerHTML = '';
    mockPayments.forEach(payment => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'bg-white p-4 rounded-lg shadow-sm flex justify-between items-center';
        paymentItem.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">Transaction #${payment.transactionId}</p>
                <p class="text-sm text-gray-500">Date: ${payment.date}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-[#6b584d]">${payment.amount}</p>
                <span class="text-xs text-green-500">${payment.status}</span>
            </div>
        `;
        list.appendChild(paymentItem);
    });
}

/**
 * Renders the wishlist.
 */
function renderWishlist() {
    const wishlistGrid = document.getElementById('wishlist-grid');
    wishlistGrid.innerHTML = '';
    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

    if (wishlistedProducts.length === 0) {
        wishlistGrid.innerHTML = '<p class="text-gray-500 col-span-full text-center">Your wishlist is empty.</p>';
        return;
    }

    wishlistedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg overflow-hidden shadow-md group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer';
        productCard.innerHTML = `
            <div class="relative">
                <img src="${product.images[0]}" alt="${product.name}" class="w-full h-48 object-cover">
                <button onclick="toggleWishlist(${product.id}, event)" class="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-red-500 fill-current hover:text-red-600 transition-colors duration-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.66l1.318-1.342a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                </button>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg text-gray-800">${product.name}</h3>
                <p class="text-sm text-gray-500 mb-2">by ${product.seller}</p>
                <p class="font-bold text-[#6b584d]">${product.price}</p>
            </div>
        `;
        productCard.addEventListener('click', () => {
            showProductDetail(product);
        });
        wishlistGrid.appendChild(productCard);
    });
}

// --- Event Handlers ---

/**
 * Toggles a product in the wishlist.
 * @param {number} productId - The ID of the product to toggle.
 * @param {Event} event - The click event.
 */
function toggleWishlist(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    const button = event ? event.currentTarget : document.querySelector(`[onclick="toggleWishlist(${productId})"]`);
    const icon = button.querySelector('svg');

    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        icon.classList.remove('text-red-500', 'fill-current');
    } else {
        wishlist.push(productId);
        icon.classList.add('text-red-500', 'fill-current');
    }
    renderWishlist();
}

/**
 * Changes the main product image on the product detail page.
 * @param {HTMLElement} thumbnail - The thumbnail image element.
 */
function changeImage(thumbnail) {
    document.getElementById('product-main-image').src = thumbnail.src;
}

/**
 * Handles adding a product to the cart.
 * @param {object} product - The product being added.
 */
function handleAddToCart(product) {
    const toast = document.getElementById('toast-notification');
    let message = `Added ${product.name} to your cart.`;
    
    if (product.customizable) {
        const selectedOption = document.getElementById('preset-option').value;
        const instructions = document.getElementById('custom-instructions').value;
        const fileInput = document.getElementById('file-upload');
        const attachedFile = fileInput.files[0];

        message += " Your customization details: ";
        if (selectedOption) {
            message += `Option: ${selectedOption}. `;
        }
        if (instructions) {
            message += `Instructions: "${instructions}". `;
        }
        if (attachedFile) {
            message += `File attached: ${attachedFile.name}.`;
        }
    }
    
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Handle seller form submission
    const sellerForm = document.getElementById('seller-form');
    const messageBox = document.getElementById('message-box');
    sellerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        messageBox.classList.remove('hidden');
        sellerForm.reset();
    });

    // Initial render on page load
    renderProducts();
    renderBuyerOrders();
    renderRawMaterials();
});