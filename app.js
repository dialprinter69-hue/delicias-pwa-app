const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    // URL Corregida
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json"
};

let menuData = [];
let cart = [];

// Inicialización
async function init() {
    try {
        const response = await fetch(CONFIG.MENU_URL);
        if (!response.ok) throw new Error("No se pudo cargar el menú");
        
        menuData = await response.json();
        console.log("Menú cargado correctamente:", menuData);
        
        renderCategories();
        renderMenu(menuData);
    } catch (err) {
        document.getElementById('menu-grid').innerHTML = `<p style="padding:20px;">Error al cargar el menú. Revisa la conexión.</p>`;
        console.error(err);
    }
}

// Crear chips de categorías
function renderCategories() {
    const container = document.getElementById('categories-container');
    const categories = ["Todos", ...new Set(menuData.map(item => item.categoria))];
    
    container.innerHTML = categories.map(cat => `
        <div class="category-chip ${cat === 'Todos' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

// Dibujar productos en pantalla
function renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    if (items.length === 0) {
        grid.innerHTML = `<p style="padding:20px;">No se encontraron productos.</p>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="product-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion || ''}</p>
                <span class="product-price">$${parseFloat(item.precio).toFixed(2)}</span>
            </div>
            <img src="${item.imagen}" class="product-img" onerror="this.src='https://via.placeholder.com/100?text=Comida'">
        </div>
    `).join('');
}

// Lógica del Carrito con Haptic Feedback
function addToCart(id) {
    const item = menuData.find(p => p.id === id);
    if (item) {
        cart.push(item);
        
        // Haptic Feedback suave
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
        
        updateCartUI();
    }
}

function updateCartUI() {
    const btn = document.getElementById('cart-floating-btn');
    const total = cart.reduce((sum, item) => sum + parseFloat(item.precio), 0);
    
    if (cart.length > 0) {
        btn.classList.remove('hidden');
        document.getElementById('cart-count').innerText = cart.length;
        document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    }
}

// Buscador
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = menuData.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        (p.categoria && p.categoria.toLowerCase().includes(term))
    );
    renderMenu(filtered);
});

// Filtro por categoría
window.filterByCategory = function(cat, element) {
    document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    const filtered = cat === "Todos" ? menuData : menuData.filter(p => p.categoria === cat);
    renderMenu(filtered);
};

// Checkout WhatsApp
document.getElementById('cart-floating-btn').addEventListener('click', () => {
    if ("vibrate" in navigator) {
        navigator.vibrate([40, 30, 40]);
    }

    const totalProductos = cart.reduce((sum, item) => sum + parseFloat(item.precio), 0);
    const totalFinal = totalProductos + CONFIG.DELIVERY_FEE;
    
    let itemsText = cart.map(i => `- ${i.nombre} ($${i.precio})`).join('%0A');
    
    const msg = `*Nueva Orden - Delicias*%0A%0A${itemsText}%0A%0A*Subtotal:* $${totalProductos.toFixed(2)}%0A*Envío:* $${CONFIG.DELIVERY_FEE.toFixed(2)}%0A*Total a pagar:* $${totalFinal.toFixed(2)}`;
    
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
});

init();
