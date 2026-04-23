const WHATSAPP_NUMBER = "19785027983";
const CASHAPP = "$AleshkaMatos6";
const DELIVERY_FEE = 4;

/* Fallback: IDs legados que deben tratarse como postres aunque no tengan category. */
const LEGACY_DESSERT_IDS = new Set(["dish-tres-leches"]);

let MAINS = [];
let POSTRES = [];
let cart = [];

/* Contexto temporal para el modal de postres */
let pendingDessert = null;
let pendingSizeId = null;

function isDessert(item) {
  if (item && item.category === "dessert") return true;
  if (item && LEGACY_DESSERT_IDS.has(item.id)) return true;
  return false;
}

/* =========================
   HELPERS
========================= */
function parsePrice(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    return Number(value.replace("$", "").trim()) || 0;
  }
  return 0;
}

function normalizeItem(item) {
  const normalized = { ...item };
  if (item.price !== undefined) normalized.price = parsePrice(item.price);
  if (Array.isArray(item.sizes)) {
    normalized.sizes = item.sizes.map(s => ({ ...s, price: parsePrice(s.price) }));
  }
  return normalized;
}

function formatMoney(n) {
  return `$${Number(n).toFixed(2).replace(/\.00$/, "")}`;
}

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatFriendlyDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

/* =========================
   LOAD MENU FROM GITHUB
========================= */
fetch("https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json", { cache: "no-cache" })
  .then(res => res.json())
  .then(data => {
    const all = data.map(normalizeItem);

    MAINS = all.filter(it => !isDessert(it));
    POSTRES = all.filter(isDessert).map(item => {
      /* Si un postre viejo (legacy) no tiene sizes, creamos variantes por defecto. */
      if (!Array.isArray(item.sizes) || item.sizes.length === 0) {
        const base = item.price || 5;
        return {
          ...item,
          sizes: [
            { id: "individual", label: "Porción individual", desc: "Para 1 persona", price: base },
            { id: "bandeja", label: "Bandeja", desc: "Para compartir (8–10 porciones)", price: 25, badge: "Familiar" }
          ]
        };
      }
      return item;
    });

    renderMenu();
    renderPostres();
  })
  .catch(err => {
    console.error("Error loading menu:", err);
    document.getElementById("menu").innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--c-muted);">
        No pudimos cargar el menú. Intenta nuevamente más tarde.
      </div>
    `;
    renderPostres();
  });

/* =========================
   ICONS (inline SVG)
========================= */
const ICON = {
  plate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  cake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13h12l-1.5 7.5a1 1 0 0 1-1 .5h-7a1 1 0 0 1-1-.5L6 13z"/><path d="M6 13a6 6 0 0 1 12 0"/><path d="M12 7V3"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
};

/* =========================
   RENDER MAINS
========================= */
function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  MAINS.forEach(item => {
    const card = document.createElement("article");
    card.className = "menu-card";

    const imageHtml = item.imageUrl
      ? `<img class="menu-image" src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'menu-image-placeholder\\'>${ICON.plate}</div>'">`
      : `<div class="menu-image-placeholder">${ICON.plate}</div>`;

    card.innerHTML = `
      <div class="menu-image-wrap">
        ${imageHtml}
        <span class="menu-badge">Especial</span>
      </div>
      <div class="menu-body">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="menu-footer">
          <span class="menu-price">${formatMoney(item.price)}</span>
          <button class="add-btn" type="button">
            ${ICON.plus}
            Agregar
          </button>
        </div>
      </div>
    `;

    card.querySelector(".add-btn").onclick = () => addToCart(item);
    menuDiv.appendChild(card);
  });
}

/* =========================
   RENDER POSTRES
========================= */
function renderPostres() {
  const postresDiv = document.getElementById("postres");
  if (!postresDiv) return;
  postresDiv.innerHTML = "";

  POSTRES.forEach(item => {
    const card = document.createElement("article");
    card.className = "menu-card is-dessert";

    const imageHtml = item.imageUrl
      ? `<img class="menu-image" src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'menu-image-placeholder\\'>${ICON.cake}</div>'">`
      : `<div class="menu-image-placeholder">${ICON.cake}</div>`;

    const minPrice = Math.min(...item.sizes.map(s => s.price));

    card.innerHTML = `
      <div class="menu-image-wrap">
        ${imageHtml}
        <span class="menu-badge">Pre-orden</span>
      </div>
      <div class="menu-body">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <div class="menu-footer">
          <span class="menu-price">desde ${formatMoney(minPrice)}</span>
          <button class="add-btn" type="button">
            ${ICON.calendar}
            Pedir
          </button>
        </div>
      </div>
    `;

    card.querySelector(".add-btn").onclick = () => openDessertModal(item);
    postresDiv.appendChild(card);
  });
}

/* =========================
   DESSERT MODAL
========================= */
function openDessertModal(item, existingEntry = null) {
  pendingDessert = { item, existingEntry };

  const modal = document.getElementById("dessert-modal");
  const dateInput = document.getElementById("dessert-date");
  const notesInput = document.getElementById("dessert-notes");
  const title = document.getElementById("dessert-modal-title");
  const subtitle = document.getElementById("dessert-modal-subtitle");

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  dateInput.min = toISODate(minDate);
  dateInput.max = toISODate(maxDate);

  if (existingEntry) {
    title.textContent = `Editar ${item.name}`;
    subtitle.textContent = `Ajusta el tamaño, la fecha o las notas.`;
    dateInput.value = existingEntry.orderDate || toISODate(minDate);
    notesInput.value = existingEntry.notes || "";
    pendingSizeId = existingEntry.sizeId || item.sizes[0].id;
  } else {
    title.textContent = item.name;
    subtitle.textContent = `Elige tamaño y cuándo lo quieres recibir.`;
    dateInput.value = toISODate(minDate);
    notesInput.value = "";
    pendingSizeId = item.sizes[0].id;
  }

  renderSizeOptions(item);
  renderQuickDates(dateInput.value);

  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => modal.classList.add("show"));
  document.body.style.overflow = "hidden";
}

function renderSizeOptions(item) {
  const container = document.getElementById("dessert-sizes");
  if (!container) return;
  container.innerHTML = "";

  item.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "size-option" + (size.id === pendingSizeId ? " active" : "");
    btn.dataset.sizeId = size.id;
    btn.innerHTML = `
      <div class="size-option-info">
        <span class="size-option-label">
          ${size.label}
          ${size.badge ? `<span class="size-option-badge">${size.badge}</span>` : ""}
        </span>
        <span class="size-option-desc">${size.desc || ""}</span>
      </div>
      <span class="size-option-price">${formatMoney(size.price)}</span>
    `;
    btn.onclick = () => {
      pendingSizeId = size.id;
      renderSizeOptions(item);
    };
    container.appendChild(btn);
  });
}

function closeDessertModal() {
  const modal = document.getElementById("dessert-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    modal.hidden = true;
    if (!document.getElementById("cart-drawer").classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }, 250);
  pendingDessert = null;
}

function renderQuickDates(selectedIso) {
  const container = document.getElementById("dessert-quick-dates");
  if (!container) return;
  container.innerHTML = "";

  const base = new Date();
  const options = [1, 2, 3, 7].map(offset => {
    const d = new Date();
    d.setDate(base.getDate() + offset);
    return d;
  });

  const labels = ["Mañana", "Pasado mañana", "En 3 días", "En 1 semana"];

  options.forEach((d, i) => {
    const iso = toISODate(d);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "quick-chip" + (iso === selectedIso ? " active" : "");
    chip.textContent = labels[i];
    chip.onclick = () => {
      document.getElementById("dessert-date").value = iso;
      renderQuickDates(iso);
    };
    container.appendChild(chip);
  });
}

function confirmDessert() {
  if (!pendingDessert) return;
  const dateInput = document.getElementById("dessert-date");
  const notesInput = document.getElementById("dessert-notes");
  const orderDate = dateInput.value;
  const notes = notesInput.value.trim();

  if (!orderDate) {
    alert("Por favor elige una fecha.");
    return;
  }

  const { item, existingEntry } = pendingDessert;
  const size = item.sizes.find(s => s.id === pendingSizeId) || item.sizes[0];

  if (existingEntry) {
    existingEntry.orderDate = orderDate;
    existingEntry.notes = notes;
    existingEntry.sizeId = size.id;
    existingEntry.sizeLabel = size.label;
    existingEntry.price = size.price;
    existingEntry.matchKey = `${item.id}|${size.id}|${orderDate}|${notes}`;
  } else {
    const matchKey = `${item.id}|${size.id}|${orderDate}|${notes}`;
    const existing = cart.find(ci => ci.matchKey === matchKey);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: size.price,
        sizeId: size.id,
        sizeLabel: size.label,
        qty: 1,
        isDessert: true,
        orderDate,
        notes,
        matchKey
      });
    }
  }

  closeDessertModal();
  renderCart();
  openDrawer();
}

/* =========================
   CART FUNCTIONS
========================= */
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id && !ci.isDessert);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1, isDessert: false });
  }
  renderCart();
  openDrawer();
}

function cartKey(entry) {
  return entry.isDessert ? entry.matchKey : entry.id;
}

function changeQty(key, delta) {
  const idx = cart.findIndex(ci => cartKey(ci) === key);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}

function editDessertDate(key) {
  const entry = cart.find(ci => cartKey(ci) === key);
  if (!entry) return;
  const catalogItem = POSTRES.find(p => p.id === entry.id);
  if (!catalogItem) return;
  openDessertModal(catalogItem, entry);
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";

  if (cart.length === 0) {
    cartDiv.innerHTML = `
      <div class="cart-empty">
        ${ICON.bag}
        <p>Tu carrito está vacío.<br>Agrega algo delicioso.</p>
      </div>
    `;
  } else {
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const key = cartKey(item);

      const imgHtml = item.imageUrl
        ? `<img class="cart-item-img" src="${item.imageUrl}" alt="${item.name}">`
        : `<div class="cart-item-img" style="display:grid;place-items:center;color:var(--c-primary);">${item.isDessert ? ICON.cake : ICON.plate}</div>`;

      const dateHtml = item.isDessert
        ? `<button class="cart-item-date" type="button" data-act="edit-date" title="Cambiar tamaño o fecha">
             ${ICON.calendar}
             ${formatFriendlyDate(item.orderDate)}
           </button>`
        : "";

      const variantHtml = item.isDessert && item.sizeLabel
        ? `<div class="cart-item-variant">${item.sizeLabel}</div>`
        : "";

      row.innerHTML = `
        ${imgHtml}
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${variantHtml}
          <div class="cart-item-price">${formatMoney(item.price * item.qty)}</div>
          ${dateHtml}
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-act="dec" aria-label="Quitar uno">${ICON.minus}</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-act="inc" aria-label="Agregar uno">${ICON.plus}</button>
        </div>
      `;

      row.querySelector('[data-act="dec"]').onclick = () => changeQty(key, -1);
      row.querySelector('[data-act="inc"]').onclick = () => changeQty(key, +1);
      const dateBtn = row.querySelector('[data-act="edit-date"]');
      if (dateBtn) dateBtn.onclick = () => editDessertDate(key);
      cartDiv.appendChild(row);
    });
  }

  updateSummary();
  updateCartBadge();
}

/* =========================
   CART UI STATE
========================= */
function itemCount() {
  return cart.reduce((n, i) => n + i.qty, 0);
}

function updateCartBadge() {
  const count = itemCount();
  const badge = document.getElementById("cart-badge");
  const floatBtn = document.getElementById("cart-float");
  const floatText = document.getElementById("cart-float-text");

  if (count > 0) {
    badge.hidden = false;
    badge.textContent = count;
    floatBtn.hidden = false;
    floatText.textContent = `Ver pedido · ${formatMoney(total())}`;
  } else {
    badge.hidden = true;
    floatBtn.hidden = true;
  }
}

function updateSummary() {
  document.getElementById("summary-subtotal").textContent = formatMoney(subtotal());
  document.getElementById("summary-delivery").textContent = formatMoney(cart.length ? DELIVERY_FEE : 0);
  document.getElementById("summary-total").textContent = formatMoney(total());
}

/* =========================
   DRAWER CONTROLS
========================= */
function openDrawer() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
  const backdrop = document.getElementById("cart-backdrop");
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("show"));
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
  const backdrop = document.getElementById("cart-backdrop");
  backdrop.classList.remove("show");
  setTimeout(() => { backdrop.hidden = true; }, 300);
  document.body.style.overflow = "";
}

document.getElementById("cart-toggle").addEventListener("click", openDrawer);
document.getElementById("cart-close").addEventListener("click", closeDrawer);
document.getElementById("cart-backdrop").addEventListener("click", closeDrawer);
document.getElementById("cart-float").addEventListener("click", openDrawer);

/* Dessert modal wiring */
document.getElementById("dessert-modal-close").addEventListener("click", closeDessertModal);
document.getElementById("dessert-modal-cancel").addEventListener("click", closeDessertModal);
document.getElementById("dessert-modal-confirm").addEventListener("click", confirmDessert);
document.getElementById("dessert-modal").addEventListener("click", (e) => {
  if (e.target.id === "dessert-modal") closeDessertModal();
});
document.getElementById("dessert-date").addEventListener("change", (e) => {
  renderQuickDates(e.target.value);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("dessert-modal").hidden) {
    closeDessertModal();
  }
});

/* =========================
   CALCULATIONS
========================= */
function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function total() {
  if (cart.length === 0) return 0;
  return subtotal() + DELIVERY_FEE;
}

/* =========================
   WHATSAPP ORDER
========================= */
function sendWhatsApp() {
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  if (!name || !address || !phone) {
    alert("Por favor completa tu nombre, dirección y teléfono.");
    return;
  }

  const mains = cart.filter(ci => !ci.isDessert);
  const desserts = cart.filter(ci => ci.isDessert);

  let msg = `🍽️ *Nuevo Pedido - Delicias*%0A%0A`;
  msg += `*Cliente:* ${name}%0A`;
  msg += `*Dirección:* ${address}%0A`;
  msg += `*Teléfono:* ${phone}%0A%0A`;

  if (mains.length) {
    msg += `*Platos:*%0A`;
    mains.forEach(item => {
      msg += `• ${item.qty}× ${item.name} — ${formatMoney(item.price * item.qty)}%0A`;
    });
    msg += `%0A`;
  }

  if (desserts.length) {
    msg += `*Postres (pre-orden):*%0A`;
    desserts.forEach(item => {
      const variant = item.sizeLabel ? ` (${item.sizeLabel})` : "";
      msg += `• ${item.qty}× ${item.name}${variant} — ${formatMoney(item.price * item.qty)}%0A`;
      msg += `   📅 Para: ${formatFriendlyDate(item.orderDate)}%0A`;
      if (item.notes) msg += `   📝 ${item.notes}%0A`;
    });
    msg += `%0A`;
  }

  msg += `Subtotal: ${formatMoney(subtotal())}%0A`;
  msg += `Envío: ${formatMoney(cart.length ? DELIVERY_FEE : 0)}%0A`;
  msg += `*Total: ${formatMoney(total())}*%0A`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,
    "_blank"
  );
}

/* =========================
   CASH APP
========================= */
function openCashApp() {
  window.open(
    `https://cash.app/${CASHAPP.replace("$", "")}`,
    "_blank"
  );
}

/* =========================
   INIT
========================= */
renderCart();
