/*********************************************************
 * DELICIAS PWA - UBER EATS PRO (VANILLA JS VERSION)
 * Compatible with: index.html + style.css + app.js
 *********************************************************/

const CONFIG = {
  remoteMenuJsonUrl:
    "https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/refs/heads/main/menu.json",
  restaurantWhatsappE164: "19785027983",
  deliveryFee: 4.0,
};

const state = {
  menu: [],
  cart: {},
  search: "",
  category: "all",
  loading: true,
};

// ----------------------
// INIT
// ----------------------

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindUI();
  await loadMenu();
  render();
}

// ----------------------
// FETCH MENU
// ----------------------

async function loadMenu() {
  try {
    const res = await fetch(CONFIG.remoteMenuJsonUrl);
    const data = await res.json();
    state.menu = Array.isArray(data) ? data : [];
  } catch (e) {
    state.menu = [];
  }
  state.loading = false;
}

// ----------------------
// UI BINDINGS
// ----------------------

function bindUI() {
  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", (e) => {
      state.search = e.target.value;
      render();
    });
  }

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      render();
    });
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", openCheckout);
  }
}

// ----------------------
// CART LOGIC
// ----------------------

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  render();
}

function removeFromCart(id) {
  state.cart[id] = (state.cart[id] || 0) - 1;
  if (state.cart[id] <= 0) delete state.cart[id];
  render();
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  let total = 0;
  for (const id in state.cart) {
    const item = state.menu.find((m) => m.id === id);
    if (!item) continue;
    const price = parsePrice(item.price);
    total += price * state.cart[id];
  }
  return total + CONFIG.deliveryFee;
}

function parsePrice(price) {
  return Number(String(price).replace("$", "")) || 0;
}

// ----------------------
// FILTERS
// ----------------------

function getFilteredMenu() {
  return state.menu.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(state.search.toLowerCase());

    const matchCategory =
      state.category === "all" || (item.category || "food") === state.category;

    return matchSearch && matchCategory;
  });
}

// ----------------------
// RENDER
// ----------------------

function render() {
  renderMenu();
  renderCartBar();
}

function renderMenu() {
  const container = document.getElementById("menu-list");
  if (!container) return;

  container.innerHTML = "";

  if (state.loading) {
    container.innerHTML = "<p>Cargando menú...</p>";
    return;
  }

  const items = getFilteredMenu();

  if (items.length === 0) {
    container.innerHTML = "<p>No hay resultados</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.imageUrl || ''}" class="card-img" />
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="card-footer">
          <span class="price">${item.price}</span>
          <div class="qty">
            <button onclick="removeFromCart('${item.id}')">-</button>
            <span>${state.cart[item.id] || 0}</span>
            <button onclick="addToCart('${item.id}')">+</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderCartBar() {
  let bar = document.getElementById("cart-bar");

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "cart-bar";
    document.body.appendChild(bar);
  }

  const count = cartCount();

  if (count === 0) {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "block";
  bar.innerHTML = `🛒 ${count} items · Ver pedido · $${cartTotal().toFixed(2)}`;

  bar.onclick = openCheckout;
}

// ----------------------
// CHECKOUT + WHATSAPP
// ----------------------

function openCheckout() {
  const phone = CONFIG.restaurantWhatsappE164;

  let msg = "🍽️ NUEVO PEDIDO\n\n";

  for (const id in state.cart) {
    const item = state.menu.find((m) => m.id === id);
    if (!item) continue;
    msg += `${state.cart[id]}x ${item.name}\n`;
  }

  msg += `\nTotal: $${cartTotal().toFixed(2)}`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  state.cart = {};
  render();
}

// Expose global functions (for inline onclick)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openCheckout = openCheckout;
