const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/refs/heads/main/menu.json"
};

let menuData = [];
let cart = [];

// 1. Cargar Menú
async function init() {
    try {
        const response = await fetch(CONFIG.MENU_URL);
        menuData = await response.json();
        renderCategories();
        renderMenu(menuData);
    } catch (err) {
        console.error("Error cargando menú:", err);
    }
}

// 2. Renderizar Categorías (Chips)
function renderCategories() {
    const container = document.getElementById('categories-container');
    const categories = ["Todos", ...new Set(menuData.map(item => item.categoria))];
    
    container.innerHTML = categories.map(cat => `
        <div class="category-chip ${cat === 'Todos' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

// 3. Renderizar Productos
function renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = items.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="product-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <span class="product-price">$${item.precio.toFixed(2)}</span>
            </div>
            <img src="${item.imagen}" class="product-img" alt="${item.nombre}">
        </div>
    `).join('');
}

// 4. Carrito y Estado
function addToCart(id) {
    const item = menuData.find(p => p.id === id);
    cart.push(item);
    updateCartUI();
}

function updateCartUI() {
    const btn = document.getElementById('cart-floating-btn');
    const total = cart.reduce((sum, item) => sum + item.precio, 0);
    
    if (cart.length > 0) {
        btn.classList.remove('hidden');
        document.getElementById('cart-count').innerText = `${cart.length} items`;
        document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    }
}

// 5. Búsqueda y Filtros
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = menuData.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.descripcion.toLowerCase().includes(term)
    );
    renderMenu(filtered);
});

function filterByCategory(cat, element) {
    document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    const filtered = cat === "Todos" ? menuData : menuData.filter(p => p.categoria === cat);
    renderMenu(filtered);
}

// 6. Checkout WhatsApp
document.getElementById('cart-floating-btn').addEventListener('click', () => {
    const total = cart.reduce((sum, item) => sum + item.precio, 0) + CONFIG.DELIVERY_FEE;
    const itemsList = cart.map(i => `- ${i.nombre} ($${i.precio})`).join('%0A');
    
    const msg = `*Nueva Orden - Delicias*%0A${itemsList}%0A%0A*Delivery:* $${CONFIG.DELIVERY_FEE}%0A*Total:* $${total.toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
});

init();
