const WHATSAPP_NUMBER = "19785027983";
const CASHAPP = "$AleshkaMatos6";
const DELIVERY_FEE = 4;

let MENU = [];
let cart = [];

/* =========================
   LOAD MENU FROM GITHUB
========================= */
fetch("https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/main/menu.json")
  .then(res => res.json())
  .then(data => {
    MENU = data;
    renderMenu();
  })
  .catch(err => {
    console.error("Error loading menu:", err);
  });

/* =========================
   RENDER MENU
========================= */
function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  MENU.forEach((item, index) => {
    const btn = document.createElement("button");

    btn.innerHTML = `${item.name} - $${item.price}`;
    btn.onclick = () => addToCart(item);

    menuDiv.appendChild(btn);
  });
}

/* =========================
   CART FUNCTIONS
========================= */
function addToCart(item) {
  cart.push(item);
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";

  cart.forEach((item, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.name} - $${item.price}
      <button onclick="removeItem(${i})">X</button>
    `;
    cartDiv.appendChild(div);
  });
}

/* =========================
   CALCULATIONS
========================= */
function subtotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

function total() {
  if (cart.length === 0) return 0;
  return subtotal() + DELIVERY_FEE;
}

/* =========================
   WHATSAPP ORDER
========================= */
function sendWhatsApp() {
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;

  let msg = `🍽️ *New Order - Delicias*%0A%0A`;
  msg += `Name: ${name}%0A`;
  msg += `Address: ${address}%0A`;
  msg += `Phone: ${phone}%0A%0A`;

  msg += `Items:%0A`;

  cart.forEach(item => {
    msg += `- ${item.name} ($${item.price})%0A`;
  });

  msg += `%0ASubtotal: $${subtotal()}%0A`;
  msg += `Delivery: $${cart.length ? DELIVERY_FEE : 0}%0A`;
  msg += `Total: $${total()}%0A`;

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