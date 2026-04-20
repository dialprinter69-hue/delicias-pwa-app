/**
 * APP.JS - Delicias Restaurante (Uber Eats Style)
 * Configurado para Vanilla JS y GitHub JSON
 */

const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    // URL optimizada para evitar problemas de CORS/Redirección
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json"
};

let menuData = [];
let cart = [];

/**
 * 1. INICIALIZACIÓN
 */
async function init() {
    const grid = document.getElementById('menu-grid');
    
    try {
        // Añadimos un timestamp para evitar el caché de GitHub durante el desarrollo
        const response = await fetch(`${CONFIG.MENU_URL}?t=${new Date().getTime()}`);
        
        if (!response.ok) throw new Error("No se pudo conectar con el archivo de menú.");
        
        const data = await response.json();
        
        // Mapeo flexible por si las propiedades están en inglés en el JSON
        menuData = data.map(item => ({
            id: item.id || Math.random(),
            nombre: item.nombre || item.name || "Producto sin nombre",
            precio: parseFloat(item.precio || item.price || 0),
            descripcion: item.descripcion || item.description || "",
            categoria: item.categoria || item.category || "General",
            imagen: item.imagen || item.image || "https://via.placeholder.com/150?text=Comida"
        }));

        console.log("Menú procesado:", menuData);
        
        renderCategories();
        renderMenu(menuData);
        
    } catch (err) {
        console.error("Error crítico:", err);
        grid.innerHTML = `
            <div style="text-align:center; padding: 40px 20px;">
                <i class="ph ph-warning-circle" style="font-size: 3rem; color: #ff4444;"></i>
                <p style="margin-top:15px; font-weight:600;">No pudimos cargar el menú.</p>
                <p style="font-size:0.8rem; color:gray;">Detalle: ${err.message}</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; border-radius:20px; border:none; background:#000; color:#fff;">Reintentar</button>
            </div>
        `;
    }
}

/**
 * 2. RENDERIZADO DE INTERFAZ
 */
function renderCategories() {
    const container = document.getElementById('categories-container');
    const categories = ["Todos", ...new Set(menuData.map(item => item.categoria))];
    
    container.innerHTML = categories.map(cat => `
        <div class="category-chip ${cat === 'Todos' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

function renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    
    if (items.length === 0) {
        grid.innerHTML = `<p style="padding:20px; text-align:center;">No hay resultados para tu búsqueda.</p>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <article class="product-card" onclick="addToCart(${item.id})">
            <div class="product-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <span class="product-price">$${item.precio.toFixed(2)}</span>
            </div>
            <div class="product-img-wrapper">
                <img src="${item.imagen}" class="product-img" loading="lazy" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/150?text=Food'">
                <div class="add-icon"><i class="ph ph-plus"></i></div>
            </div>
        </article>
    `).join('');
}

/**
 * 3. LÓGICA DEL CARRITO & HAPTICS
 */
function addToCart(id) {
    const item = menuData.find(p => p.id == id); // Usamos == por si el ID viene como string
    if (item) {
        cart.push(item);
        
        // Haptic Feedback sutil (50ms)
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
        
        updateCartUI();
        
        // Animación visual rápida al botón (opcional)
        const btn = document.getElementById('cart-floating-btn');
        btn.style.transform = "translateX(-50%) scale(1.05)";
        setTimeout(() => btn.style.transform = "translateX(-50%) scale(1)", 100);
    }
}

function updateCartUI() {
    const btn = document.getElementById('cart-floating-btn');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    
    const total = cart.reduce((sum, item) => sum + item.precio, 0);
    
    if (cart.length > 0) {
        btn.classList.remove('hidden');
        countEl.innerText = `${cart.length} ${cart.length === 1 ? 'item' : 'items'}`;
        totalEl.innerText = `$${total.toFixed(2)}`;
    }
}

/**
 * 4. EVENTOS (BÚSQUEDA Y FILTROS)
 */
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = menuData.filter(p => 
        p.nombre.toLowerCase().includes(term) || 
        p.descripcion.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term)
    );
    renderMenu(filtered);
});

window.filterByCategory = function(cat, element) {
    // UI: Cambiar clase activa
    document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    
    // Filtro
    const filtered = cat === "Todos" ? menuData : menuData.filter(p => p.categoria === cat);
    renderMenu(filtered);
    
    // Scroll suave hacia arriba al filtrar
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 5. CHECKOUT WHATSAPP
 */
document.getElementById('cart-floating-btn').addEventListener('click', () => {
    if (cart.length === 0) return;

    // Vibración de confirmación (Doble toque)
    if ("vibrate" in navigator) {
        navigator.vibrate([40, 30, 40]);
    }

    const subtotal = cart.reduce((sum, item) => sum + item.precio, 0);
    const total = subtotal + CONFIG.DELIVERY_FEE;
    
    // Agrupar items repetidos para que el mensaje sea legible
    const resumenItems = cart.reduce((acc, item) => {
        acc[item.nombre] = (acc[item.nombre] || 0) + 1;
        return acc;
    }, {});

    let listaTexto = "";
    for (const [nombre, cantidad] of Object.entries(resumenItems)) {
        listaTexto += `${cantidad}x ${nombre}%0A`;
    }

    const mensaje = `*Nueva Orden - Delicias*%0A` +
                    `--------------------------%0A` +
                    `${listaTexto}` +
                    `--------------------------%0A` +
                    `*Subtotal:* $${subtotal.toFixed(2)}%0A` +
                    `*Envío:* $${CONFIG.DELIVERY_FEE.toFixed(2)}%0A` +
                    `*Total a pagar:* $${total.toFixed(2)}%0A%0A` +
                    `_Por favor, confirma mi pedido._`;

    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${mensaje}`, '_blank');
});

// Arrancar App
init();
