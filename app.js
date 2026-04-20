/**
 * APP.JS - Delicias Restaurante 
 * Versión Final con Corrección de NaN y Haptic Feedback
 */

const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    // URL Robusta para GitHub Raw
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json"
};

let menuData = [];
let cart = [];

/**
 * 1. INICIALIZACIÓN Y CARGA DE DATOS
 */
async function init() {
    const grid = document.getElementById('menu-grid');
    
    try {
        // Fetch con timestamp para evitar caché de versiones viejas del JSON
        const response = await fetch(`${CONFIG.MENU_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("Error al conectar con el servidor de menú");
        
        const data = await response.json();
        
        // PROCESAMIENTO Y LIMPIEZA DE DATOS (Solución al $NaN)
        menuData = data.map(item => {
            // Extraer precio y limpiar símbolos como "$", " ", o ","
            let rawPrice = item.precio || item.price || "0";
            let cleanPrice = String(rawPrice).replace(/[^0-9.]/g, ''); 
            let finalPrice = parseFloat(cleanPrice);

            return {
                id: item.id || Math.floor(Math.random() * 100000),
                nombre: item.nombre || item.name || "Producto",
                precio: isNaN(finalPrice) ? 0 : finalPrice, // Si falla, pone 0 en lugar de NaN
                descripcion: item.descripcion || item.description || "",
                categoria: item.categoria || item.category || "General",
                imagen: item.imagen || item.image || "https://via.placeholder.com/150?text=Comida"
            };
        });

        renderCategories();
        renderMenu(menuData);
        
    } catch (err) {
        console.error("Error cargando el menú:", err);
        grid.innerHTML = `<div style="padding:50px; text-align:center;">Error: No se pudo cargar el menú.</div>`;
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
    
    grid.innerHTML = items.map(item => `
        <article class="product-card" onclick="addToCart(${item.id})">
            <div class="product-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <span class="
