/**
 * APP.JS - Delicias Restaurante 
 * Versión Final Optimizada (Uber Eats Style)
 */

const CONFIG = {
    WHATSAPP_NUMBER: "19785027983",
    DELIVERY_FEE: 5.00,
    // URL de GitHub optimizada para evitar caché
    MENU_URL: "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json"
};

let menuData = [];
let cart = [];

/**
 * 1. INICIALIZACIÓN
 */
async function init() {
    const grid = document.getElementById('menu-grid');
    console.log("Intentando cargar menú...");

    try {
        // El "?t=" fuerza a GitHub a darnos la versión más nueva de tu archivo
        const response = await fetch(`${CONFIG.MENU_URL}?t=${new Date().getTime()}`);
        
        if (!response.ok) {
            throw new Error(`Error de servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos cargados correctamente:", data);

        // Procesar y limpiar datos (Previene errores de $NaN y nombres mal escritos)
        menuData = data.map((item, index) => {
            // Limpieza de precio: quita "$", espacios y comas
            let rawPrice = item.precio || item.price || "0";
            let cleanPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;

            return {
                id: item.id || index + 1,
                nombre: item.nombre || item.name || "Producto sin nombre",
                precio: cleanPrice,
                descripcion: item.descripcion || item.description || "Sin descripción disponible",
                categoria: item.categoria || item.category || "General",
                imagen: item.imagen || item.image || "https://via.placeholder.com/150?text=Delicias"
            };
        });

        renderCategories();
        renderMenu(menuData);

    } catch (err) {
        console.error("Error crítico en app.js:", err);
        grid.innerHTML = `
            <div style="padding:50px; text-align:center; font-family:sans-serif;">
                <i class="ph ph-warning-circle" style="font-size:3rem; color:#ff4444;"></i>
                <h3 style="margin-top:15px;">No se pudo mostrar el menú</h3>
                <p style="color:gray; font-size:0
