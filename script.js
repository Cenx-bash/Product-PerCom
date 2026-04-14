/* ============================================================
   AROMA TEA HOUSE - MAIN SCRIPT
   Handles: navigation scroll state, mobile menu, cart drawer,
            product filtering, newsletter form, toast notifications,
            and scroll-reveal animations.
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. DOM References
     ---------------------------------------------------------- */
  const nav            = document.getElementById("nav");
  const hamburger      = document.getElementById("hamburger");
  const mobileMenu     = document.getElementById("mobileMenu");
  const mobileLinks    = document.querySelectorAll(".mobile-menu__link");

  const cartBtn        = document.getElementById("cartBtn");
  const cartCount      = document.getElementById("cartCount");
  const cartClose      = document.getElementById("cartClose");
  const cartDrawer     = document.getElementById("cartDrawer");
  const cartOverlay    = document.getElementById("cartOverlay");
  const cartList       = document.getElementById("cartList");
  const cartTotal      = document.getElementById("cartTotal");

  const addButtons     = document.querySelectorAll(".btn-add");
  const filterButtons  = document.querySelectorAll(".filter-btn");
  const teaCards       = document.querySelectorAll(".tea-card");

  const newsletterForm = document.getElementById("newsletterForm");
  const emailInput     = document.getElementById("emailInput");
  const formMessage    = document.getElementById("formMessage");

  const toast          = document.getElementById("toast");

  /* ----------------------------------------------------------
     2. State
     ---------------------------------------------------------- */
  let cart      = [];       // Array of { name, price, qty } objects
  let toastTimer = null;    // Reference for clearing the toast timeout

  /* ----------------------------------------------------------
     3. Navigation: Scroll State
     ---------------------------------------------------------- */
  function handleNavScroll() {
    if (window.scrollY > 60) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll(); // Run once on load in case page is already scrolled

  /* ----------------------------------------------------------
     4. Mobile Menu Toggle
     ---------------------------------------------------------- */
  function openMobileMenu() {
    mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
    hamburger.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
    hamburger.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    if (mobileMenu.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  hamburger.addEventListener("click", toggleMobileMenu);

  // Close menu when any mobile nav link is clicked
  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  /* ----------------------------------------------------------
     5. Cart Drawer Open / Close
     ---------------------------------------------------------- */
  function openCart() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Allow pressing Escape to close the cart
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (cartDrawer.classList.contains("open")) closeCart();
      if (mobileMenu.classList.contains("open")) closeMobileMenu();
    }
  });

  /* ----------------------------------------------------------
     6. Cart Logic: Add, Update Quantity, Remove, Render
     ---------------------------------------------------------- */

  /* Find a cart item by product name */
  function findCartItem(name) {
    return cart.find(function (item) { return item.name === name; });
  }

  /* Add a product to the cart or increment its quantity */
  function addToCart(name, price) {
    var existing = findCartItem(name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: parseFloat(price), qty: 1 });
    }
    renderCart();
    updateCartCount();
    showToast(name + " added to cart");
  }

  /* Change the quantity of an item by delta (+1 or -1) */
  function changeQty(name, delta) {
    var item = findCartItem(name);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(name);
    } else {
      renderCart();
    }
    updateCartCount();
  }

  /* Remove an item from the cart entirely */
  function removeFromCart(name) {
    cart = cart.filter(function (item) { return item.name !== name; });
    renderCart();
    updateCartCount();
  }

  /* Calculate and return the cart total as a number */
  function calculateTotal() {
    return cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  /* Update the cart badge count in the navbar */
  function updateCartCount() {
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    cartCount.textContent = total;
  }

  /* Re-render the cart drawer contents */
  function renderCart() {
    cartList.innerHTML = "";

    if (cart.length === 0) {
      var emptyMsg = document.createElement("li");
      emptyMsg.className = "cart-empty";
      emptyMsg.textContent = "Your cart is empty.";
      cartList.appendChild(emptyMsg);
      cartTotal.textContent = "$0.00";
      return;
    }

    cart.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "cart-item";

      /* Item info */
      var infoDiv = document.createElement("div");
      infoDiv.className = "cart-item__info";

      var nameEl = document.createElement("span");
      nameEl.className = "cart-item__name";
      nameEl.textContent = item.name;

      var priceEl = document.createElement("span");
      priceEl.className = "cart-item__price";
      priceEl.textContent = "$" + (item.price * item.qty).toFixed(2);

      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(priceEl);

      /* Quantity controls */
      var qtyDiv = document.createElement("div");
      qtyDiv.className = "cart-item__qty";

      var decBtn = document.createElement("button");
      decBtn.className = "cart-item__qty-btn";
      decBtn.textContent = "-";
      decBtn.setAttribute("aria-label", "Decrease quantity of " + item.name);
      decBtn.addEventListener("click", function () { changeQty(item.name, -1); });

      var qtyNum = document.createElement("span");
      qtyNum.className = "cart-item__qty-num";
      qtyNum.textContent = item.qty;

      var incBtn = document.createElement("button");
      incBtn.className = "cart-item__qty-btn";
      incBtn.textContent = "+";
      incBtn.setAttribute("aria-label", "Increase quantity of " + item.name);
      incBtn.addEventListener("click", function () { changeQty(item.name, 1); });

      qtyDiv.appendChild(decBtn);
      qtyDiv.appendChild(qtyNum);
      qtyDiv.appendChild(incBtn);

      li.appendChild(infoDiv);
      li.appendChild(qtyDiv);
      cartList.appendChild(li);
    });

    /* Update total */
    cartTotal.textContent = "$" + calculateTotal().toFixed(2);
  }

  /* Attach add-to-cart click events to all product buttons */
  addButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name  = btn.getAttribute("data-name");
      var price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  /* ----------------------------------------------------------
     7. Product Filtering by Category
     ---------------------------------------------------------- */
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      /* Update active state */
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");

      teaCards.forEach(function (card) {
        var category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.classList.remove("hidden");
          /* Staggered reveal for visible cards */
          card.style.animationDelay = "0s";
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  /* ----------------------------------------------------------
     8. Newsletter Form Submission
     ---------------------------------------------------------- */
  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();

    /* Basic email format validation */
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormMessage("Please enter a valid email address.", "error");
      return;
    }

    /* Simulate a successful subscription */
    setFormMessage("Thank you. You have been added to the list.", "success");
    emailInput.value = "";
  });

  /* Set the newsletter form feedback message */
  function setFormMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = "contact__message " + type;

    /* Clear the message after 5 seconds */
    setTimeout(function () {
      formMessage.textContent = "";
      formMessage.className = "contact__message";
    }, 5000);
  }

  /* ----------------------------------------------------------
     9. Toast Notification
     ---------------------------------------------------------- */
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");

    /* Clear any existing timer before setting a new one */
    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
      toastTimer = null;
    }, 2800);
  }

  /* ----------------------------------------------------------
     10. Scroll Reveal Animations
     ---------------------------------------------------------- */

  /* Apply the reveal class to elements that should animate in */
  var revealTargets = document.querySelectorAll(
    ".tea-card, .teas__header, .origin__text, .contact, .section-eyebrow, .section-title"
  );

  revealTargets.forEach(function (el) {
    el.classList.add("reveal");
  });

  /* IntersectionObserver triggers the revealed class when element enters viewport */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target); // Animate only once
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     11. Smooth Anchor Navigation (offset for fixed nav)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = anchor.getAttribute("href");
      if (targetId === "#") return;

      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      var navHeight = nav.offsetHeight;
      var targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  });

  /* ----------------------------------------------------------
     12. Initial Cart Render
     ---------------------------------------------------------- */
  renderCart(); // Render the empty cart state on page load

})();
