const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    // URL limpia sin refs/heads
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json"
};

let menuData = [];
let cart = [];

async function init() {
    const grid = document.getElementById('menu-grid');
    console.log("Cargando menú desde:", CONFIG.MENU_URL);

    try {
        const response = await fetch(`${CONFIG.MENU_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("No se pudo descargar el JSON");

        const data = await response.json();
        console.log("Datos recibidos:", data);

        // MAPEO INTELIGENTE: Detecta inglés o español y limpia el precio
        menuData = data.map((item, index) => {
            // 1. Detectar el nombre
            const nombreFinal = item.nombre || item.name || "Producto sin nombre";
            
            // 2. Limpiar el precio (Quita $, comas y espacios)
            let pRaw = item.precio || item.price || "0";
            let pClean = String(pRaw).replace(/[^0-9.]/g, ''); 
            let pNum = parseFloat(pClean) || 0;

            // 3. Detectar el resto de campos
            return {
                id: item.id || index + 1,
                nombre: nombreFinal,
                precio: pNum,
                descripcion: item.descripcion || item.description || "",
                categoria: item.categoria || item.category || "General",
                imagen: item.imagen || item.image || "https://via.placeholder.com/150?text=Comida"
            };
        });

        console.log("Datos procesados listos:", menuData);

        if (menuData.length > 0) {
            renderCategories();
            renderMenu(menuData);
        } else {
            grid.innerHTML = "<p>El menú está vacío.</p>";
        }

    } catch (err) {
        console.error("Error cargando el menú:", err);
        grid.innerHTML = `<div style="padding:20px; color:red;">Error de carga. Revisa que el JSON en GitHub sea válido.</div>`;
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    const categories = ["Todos", ...new Set(menuData.map(item => item.categoria))];
    container.innerHTML = categories.map(cat => `
        <div class="category-chip ${cat === 'Todos' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

function renderMenu(items) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => `
        <article class="product-card" onclick="addToCart(${item.id})">
            <div class="product-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <span class="product-price">$${item.precio.toFixed(2)}</span>
            </div>
            <img src="${item.imagen}" class="product-img" onerror="this.src='https://via.placeholder.com/150'">
        </article>
    `).join('');
}

function addToCart(id) {
    const item = menuData.find(p => p.id == id);
    if (item) {
        cart.push(item);
        if ("vibrate" in navigator) navigator.vibrate(50);
        updateCartUI();
    }
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

window.filterByCategory = function(cat, element) {
    document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    const filtered = cat === "Todos" ? menuData : menuData.filter(p => p.categoria === cat);
    renderMenu(filtered);
};

// Checkout por WhatsApp
document.getElementById('cart-floating-btn').addEventListener('click', () => {
    const subtotal = cart.reduce((sum, item) => sum + item.precio, 0);
    const total = subtotal + CONFIG.DELIVERY_FEE;
    let texto = cart.map(i => `- ${i.nombre} ($${i.precio.toFixed(2)})`).join('%0A');
    const msg = `*Orden Delicias*%0A${texto}%0A*Total:* $${total.toFixed(2)}`;
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
});

// Arrancar app
init();
