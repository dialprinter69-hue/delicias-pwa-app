:root {
    --primary: #06C167;
    --bg: #FFFFFF;
    --secondary-bg: #F6F6F6;
    --text-main: #000000;
    --text-muted: #545454;
    --shadow: 0 4px 12px rgba(0,0,0,0.08);
    --radius: 12px;
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }

body { background-color: var(--bg); color: var(--text-main); padding-bottom: 110px; }

/* Header */
.main-header {
    position: sticky; top: 0; background: white; z-index: 100;
    padding: 15px; border-bottom: 1px solid #eee;
}
.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.delivery-badge { background: var(--secondary-bg); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

.search-container {
    background: var(--secondary-bg); display: flex; align-items: center;
    padding: 10px 15px; border-radius: 25px;
}
.search-container input { background: none; border: none; outline: none; margin-left: 10px; width: 100%; font-size: 1rem; }

/* Categorías */
.categories-nav { display: flex; overflow-x: auto; padding: 15px; gap: 10px; scrollbar-width: none; }
.categories-nav::-webkit-scrollbar { display: none; }
.category-chip {
    background: var(--secondary-bg); padding: 8px 18px; border-radius: 20px;
    white-space: nowrap; font-size: 0.9rem; font-weight: 500; cursor: pointer;
}
.category-chip.active { background: var(--text-main); color: white; }

/* Grid de Menú */
.menu-container { display: grid; grid-template-columns: 1fr; gap: 10px; padding: 0 15px; }

.product-card {
    display: flex; align-items: center; gap: 15px; padding: 15px 0;
    border-bottom: 1px solid #f0f0f0; cursor: pointer;
}
.product-info { flex: 1; }
.product-info h3 { font-size: 1rem; margin-bottom: 4px; font-weight: 600; }
.product-info p { font-size: 0.85rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-price { font-weight: 600; margin-top: 8px; display: block; font-size: 0.95rem; }
.product-img { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; background: #f9f9f9; }

/* Botón Flotante */
.cart-btn {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    width: 90%; max-width: 450px; background: var(--primary);
    color: white; padding: 18px; border-radius: var(--radius);
    box-shadow: 0 8px 20px rgba(6,193,103,0.3); z-index: 1000;
}
.cart-btn-content { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
#cart-count { background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 4px; }

.hidden { display: none; }
