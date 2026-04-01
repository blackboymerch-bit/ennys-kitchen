const WHATSAPP_NUMBER = "2349138071796"; // Replace with your real WhatsApp number
const BRAND_NAME = "Enny's Kitchen";
const BRAND_ADDRESS = "26 Majolate Street, Onipanu, Lagos";

const dynamicTodayMenu = [
  { id: "t1", name: "Ofada Rice & Ayamase", price: 7500, category: "Hot Deal", note: "Rich local flavour with assorted protein." },
  { id: "t2", name: "Akara & Custard Combo", price: 3200, category: "Breakfast", note: "Fresh akara with creamy custard." },
  { id: "t3", name: "Chicken Shawarma", price: 5000, category: "Snack", note: "Loaded wrap with creamy sauce." },
  { id: "t4", name: "Small Chops Tray", price: 9000, category: "Party Pack", note: "Perfect for quick events and hangouts." },
  { id: "t5", name: "Beans & Fried Plantain", price: 4500, category: "Local", note: "Simple, filling, and satisfying." },
  { id: "t6", name: "Fruit Parfait Cup", price: 2800, category: "Dessert", note: "Layered fresh fruit and cream." }
];

const cart = JSON.parse(localStorage.getItem("ennys-kitchen-pro-cart") || "[]");

const cartToggle = document.getElementById("cartToggle");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCart");
const checkoutWhatsAppBtn = document.getElementById("checkoutWhatsApp");
const contactWhatsAppBtn = document.getElementById("contactWhatsApp");
const todayMenuGrid = document.getElementById("todayMenuGrid");
const refreshMenuBtn = document.getElementById("refreshMenuBtn");
const todayDateLabel = document.getElementById("todayDateLabel");
const todayDayLabel = document.getElementById("todayDayLabel");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function saveCart() {
  localStorage.setItem("ennys-kitchen-pro-cart", JSON.stringify(cart));
}

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) return removeItem(id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  const index = cart.findIndex((item) => item.id === id);
  if (index > -1) cart.splice(index, 1);
  saveCart();
  renderCart();
}

function getCartTotals() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return { count, total };
}

function renderCart() {
  const { count, total } = getCartTotals();
  cartCount.textContent = count;
  cartTotal.textContent = formatCurrency(total);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div>
        <h4>${item.name}</h4>
        <p>${formatCurrency(item.price)} each</p>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="remove-item" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
      <strong>${formatCurrency(item.quantity * item.price)}</strong>
    </div>
  `).join("");
}

function sendCartToWhatsApp() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const { total } = getCartTotals();
  const lines = [
    `Hello ${BRAND_NAME},`,
    "",
    "I would like to place an order for the following items:",
    "",
    ...cart.map((item, index) => `${index + 1}. ${item.name} — Qty: ${item.quantity} — ${formatCurrency(item.quantity * item.price)}`),
    "",
    `Total: ${formatCurrency(total)}`,
    `Pickup/Address: ${BRAND_ADDRESS}`,
    "",
    "Please confirm availability and delivery details."
  ];

  const message = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${+2349138071796}?text=${message}`, "_blank");
}

function sendDirectWhatsAppMessage() {
  const message = encodeURIComponent(`Hello ${BRAND_NAME}, I would like to make an enquiry about today's menu.`);
  window.open(`https://wa.me/${+2349138071796}?text=${message}`, "_blank");
}

function renderTodayMenu() {
  const now = new Date();
  todayDayLabel.textContent = "Today's Specials";
  todayDateLabel.textContent = now.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  todayMenuGrid.innerHTML = dynamicTodayMenu.map((item) => `
    <article class="today-menu-item reveal visible">
      <span class="mini-tag">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.note}</p>
      <div class="price-line">
        <strong>${formatCurrency(item.price)}</strong>
        <button class="btn btn-primary add-dynamic-item" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
          Add to Cart
        </button>
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    addToCart({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
    });
  });
});

todayMenuGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-dynamic-item");
  if (!btn) return;
  addToCart({
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: Number(btn.dataset.price),
  });
});

cartItems.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) return;
  if (action === "increase") updateQuantity(id, 1);
  if (action === "decrease") updateQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

cartToggle.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

clearCartBtn.addEventListener("click", () => {
  cart.length = 0;
  saveCart();
  renderCart();
});

checkoutWhatsAppBtn.addEventListener("click", sendCartToWhatsApp);
contactWhatsAppBtn.addEventListener("click", sendDirectWhatsAppMessage);
refreshMenuBtn.addEventListener("click", renderTodayMenu);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const glow = document.querySelector(".cursor-glow");
window.addEventListener("mousemove", (e) => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

renderTodayMenu();
renderCart();
