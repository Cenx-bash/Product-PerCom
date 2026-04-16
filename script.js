// Tea Data
const teasData = [
  {
    id: 1,
    name: "Ceremonial Matcha",
    origin: "Uji, Japan",
    desc: "Stone-ground from shade-grown tencha. Vivid umami with a smooth finish.",
    price: 28.0,
    category: "green",
    badge: "Bestseller",
    imgClass: "tea-card__img--matcha",
  },
  {
    id: 2,
    name: "Rock Oolong",
    origin: "Wuyi Mountains, China",
    desc: "Aged on mineral-rich cliffs. Deep roasted notes with honeyed sweetness.",
    price: 34.0,
    category: "green",
    badge: null,
    imgClass: "tea-card__img--oolong",
  },
  {
    id: 3,
    name: "First Flush Sencha",
    origin: "Shizuoka, Japan",
    desc: "Harvested in early spring. Crisp, grassy brightness with clean finish.",
    price: 22.0,
    category: "green",
    badge: "New",
    imgClass: "tea-card__img--sencha",
  },
  {
    id: 4,
    name: "Vintage Pu-erh",
    origin: "Yunnan, China",
    desc: "Aged for ten years in humid caves. Earthy, deep, and profoundly complex.",
    price: 48.0,
    category: "aged",
    badge: null,
    imgClass: "tea-card__img--puerh",
  },
  {
    id: 5,
    name: "Wild Chamomile",
    origin: "Thessaly, Greece",
    desc: "Hand-picked from mountain meadows. Soft apple notes with calming warmth.",
    price: 18.0,
    category: "herbal",
    badge: null,
    imgClass: "tea-card__img--chamomile",
  },
  {
    id: 6,
    name: "Earl Grey Reserve",
    origin: "Assam, India",
    desc: "Bold Assam base infused with hand-pressed bergamot oil.",
    price: 24.0,
    category: "black",
    badge: null,
    imgClass: "tea-card__img--earlgrey",
  },
  {
    id: 7,
    name: "Gyokuro Shade",
    origin: "Yame, Japan",
    desc: "Shaded for six weeks before harvest. Intensely sweet with savory character.",
    price: 52.0,
    category: "green",
    badge: "Rare",
    imgClass: "tea-card__img--gyokuro",
  },
  {
    id: 8,
    name: "Darjeeling Second Flush",
    origin: "Darjeeling, India",
    desc: "The champagne of teas. Muscatel grape notes with lingering complexity.",
    price: 38.0,
    category: "black",
    badge: null,
    imgClass: "tea-card__img--darjeeling",
  },
];

// Cart State
let cart = JSON.parse(localStorage.getItem("teaCart")) || [];

// DOM Elements
const teaGrid = document.getElementById("teaGrid");
const filterBtns = document.querySelectorAll(".filter-btn");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const newsletterForm = document.getElementById("newsletterForm");

// Render Tea Grid
function renderTeas(filter = "all") {
  const filtered =
    filter === "all" ? teasData : (
      teasData.filter((tea) => tea.category === filter)
    );

  teaGrid.innerHTML = filtered
    .map(
      (tea) => `
    <article class="tea-card" data-category="${tea.category}">
      <div class="tea-card__img-wrap">
        <div class="tea-card__img ${tea.imgClass}"></div>
        ${tea.badge ? `<span class="tea-card__badge">${tea.badge}</span>` : ""}
      </div>
      <div class="tea-card__body">
        <p class="tea-card__origin">${tea.origin}</p>
        <h3 class="tea-card__name">${tea.name}</h3>
        <p class="tea-card__desc">${tea.desc}</p>
        <div class="tea-card__footer">
          <span class="tea-card__price">$${tea.price.toFixed(2)}</span>
          <button class="btn-add" data-id="${tea.id}" data-name="${tea.name}" data-price="${tea.price}">Add to Cart</button>
        </div>
      </div>
    </article>
  `,
    )
    .join("");

  // Attach add to cart events
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      addToCart(id, name, price);
    });
  });
}

// Add to Cart
function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  saveCart();
  showToast(`Added ${name} to cart`);
  updateCartUI();
}

// Update Cart UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cartList) {
    if (cart.length === 0) {
      cartList.innerHTML =
        '<div class="cart-empty" style="text-align:center;padding:2rem;color:#6B635C;">Your cart is empty</div>';
      cartTotal.textContent = "$0.00";
      return;
    }

    cartList.innerHTML = cart
      .map(
        (item) => `
      <li class="cart-item">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" data-id="${item.id}" data-delta="-1">-</button>
          <span>${item.quantity}</span>
          <button class="cart-item__qty-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="cart-item__remove" data-id="${item.id}">🗑</button>
        </div>
      </li>
    `,
      )
      .join("");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Attach cart item events
    document.querySelectorAll(".cart-item__qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const delta = parseInt(btn.dataset.delta);
        updateQuantity(id, delta);
      });
    });
    document.querySelectorAll(".cart-item__remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        removeFromCart(id);
      });
    });
  }
}

function updateQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
  showToast("Item removed from cart");
}

function saveCart() {
  localStorage.setItem("teaCart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Filter functionality
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    renderTeas(filter);
  });
});

// Cart Drawer
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  updateCartUI();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Mobile Menu
hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
document.querySelectorAll(".mobile-menu__link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
});

// Newsletter Form
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  const message = document.getElementById("formMessage");
  if (email && email.includes("@")) {
    message.textContent = "Thanks for subscribing! ✨";
    message.style.color = "#B47C5E";
    newsletterForm.reset();
    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  } else {
    message.textContent = "Please enter a valid email address.";
    message.style.color = "#c0392b";
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const nav = document.getElementById("nav");
  if (window.scrollY > 50) {
    nav.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
  } else {
    nav.style.boxShadow = "none";
  }
});

// Initialize
renderTeas("all");
updateCartUI();
