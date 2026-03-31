const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const state = {
  products: window.CANA_PRODUCTS || [],
  cart: JSON.parse(localStorage.getItem("cana_cart") || "[]")
};

const els = {
  productGrid: document.getElementById("productGrid"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartItems: document.getElementById("cartItems"),
  subtotalValue: document.getElementById("subtotalValue"),
  shippingValue: document.getElementById("shippingValue"),
  totalValue: document.getElementById("totalValue"),
  shippingModal: document.getElementById("shippingModal"),
  estimateResult: document.getElementById("estimateResult"),
  checkoutModal: document.getElementById("checkoutModal"),
  checkoutSummary: document.getElementById("checkoutSummary")
};

function saveCart() {
  localStorage.setItem("cana_cart", JSON.stringify(state.cart));
}

function getProduct(productId) {
  return state.products.find((product) => product.id === productId);
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function changeQty(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }
  saveCart();
  renderCart();
}

function getSubtotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + ((product?.price || 0) * item.qty);
  }, 0);
}

function getTotalWeight() {
  return state.cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + ((product?.weightLbs || 0) * item.qty);
  }, 0);
}

function estimateShipping(subtotal, weightLbs, zipCode = "") {
  let shipping = 0;

  if (subtotal >= 75) {
    shipping = 0;
  } else if (weightLbs <= 2) {
    shipping = 8.95;
  } else if (weightLbs <= 6) {
    shipping = 12.95;
  } else if (weightLbs <= 12) {
    shipping = 18.95;
  } else {
    shipping = 29.95;
  }

  if (/^(9|8)/.test((zipCode || "").trim())) {
    shipping += 3.5;
  }

  return Number(shipping.toFixed(2));
}

function renderProducts() {
  if (!els.productGrid) return;

  els.productGrid.innerHTML = state.products.map((product) => `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name} ${product.subtitle}" />
      </div>
      <div class="product-content">
        <div>
          <div class="product-meta">
            <span class="mini-tag">${product.subtitle}</span>
            <span class="mini-tag">${product.unitLabel}</span>
          </div>
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
        </div>
        <div class="tag-list">
          ${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div>
          <p class="small-note">About ${product.servings} servings per package</p>
          <div class="price-row">
            <div>
              <div class="price">${formatCurrency(product.price)}</div>
              <div class="small-note">Suggested starter price</div>
            </div>
            <button class="btn btn-primary" data-add="${product.id}" type="button">Add to cart</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  els.productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
}

function renderCart() {
  const subtotal = getSubtotal();
  const weight = getTotalWeight();
  const shipping = state.cart.length ? estimateShipping(subtotal, weight) : 0;
  const total = subtotal + shipping;
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if (els.cartCount) els.cartCount.textContent = count;
  if (els.subtotalValue) els.subtotalValue.textContent = formatCurrency(subtotal);
  if (els.shippingValue) els.shippingValue.textContent = formatCurrency(shipping);
  if (els.totalValue) els.totalValue.textContent = formatCurrency(total);

  if (!els.cartItems) return;

  if (!state.cart.length) {
    els.cartItems.innerHTML = `<div class="empty-state">Your cart is empty. Add a few noodle items to get started.</div>`;
  } else {
    els.cartItems.innerHTML = state.cart.map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h4>${product.name}</h4>
            <p>${product.subtitle}</p>
            <p>${formatCurrency(product.price)} each</p>
            <div class="qty-controls">
              <button data-delta="-1" data-id="${product.id}" type="button">−</button>
              <strong>${item.qty}</strong>
              <button data-delta="1" data-id="${product.id}" type="button">+</button>
            </div>
          </div>
          <strong>${formatCurrency(product.price * item.qty)}</strong>
        </article>
      `;
    }).join("");

    els.cartItems.querySelectorAll("[data-delta]").forEach((button) => {
      button.addEventListener("click", () => changeQty(button.dataset.id, Number(button.dataset.delta)));
    });
  }

  renderCheckoutSummary(subtotal, shipping, total, weight);
}

function renderCheckoutSummary(subtotal, shipping, total, weight) {
  if (!els.checkoutSummary) return;

  els.checkoutSummary.innerHTML = `
    <div class="order-line"><span>Items</span><strong>${state.cart.reduce((sum, item) => sum + item.qty, 0)}</strong></div>
    <div class="order-line"><span>Estimated weight</span><strong>${weight.toFixed(1)} lbs</strong></div>
    <div class="order-line"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
    <div class="order-line"><span>Estimated shipping</span><strong>${formatCurrency(shipping)}</strong></div>
    <div class="order-line"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
  `;
}

function openCart() {
  if (!els.cartDrawer) return;
  els.cartDrawer.classList.add("open");
  els.cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!els.cartDrawer) return;
  els.cartDrawer.classList.remove("open");
  els.cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add("open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function wireEvents() {
  const openCartBtn = document.getElementById("openCart");
  const closeCartBtn = document.getElementById("closeCart");
  const openEstimatorBtn = document.getElementById("openEstimator");
  const closeEstimatorBtn = document.getElementById("closeEstimator");
  const goCheckoutBtn = document.getElementById("goCheckout");
  const closeCheckoutBtn = document.getElementById("closeCheckout");
  const shippingForm = document.getElementById("shippingForm");
  const checkoutForm = document.getElementById("checkoutForm");
  const yearEl = document.getElementById("year");

  if (openCartBtn) openCartBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (openEstimatorBtn) openEstimatorBtn.addEventListener("click", () => openModal(els.shippingModal));
  if (closeEstimatorBtn) closeEstimatorBtn.addEventListener("click", () => closeModal(els.shippingModal));

  if (goCheckoutBtn) {
    goCheckoutBtn.addEventListener("click", () => {
      if (!state.cart.length) {
        alert("Add at least one item before checking out.");
        return;
      }
      closeCart();
      openModal(els.checkoutModal);
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener("click", () => closeModal(els.checkoutModal));
  }

  if (els.cartDrawer) {
    els.cartDrawer.addEventListener("click", (event) => {
      if (event.target === els.cartDrawer) closeCart();
    });
  }

  [els.shippingModal, els.checkoutModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  if (shippingForm) {
    shippingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const zipCode = document.getElementById("zipCode")?.value || "";
      const subtotal = Number(document.getElementById("orderSubtotal")?.value || 0);
      const weight = Number(document.getElementById("orderWeight")?.value || 0);
      const shipping = estimateShipping(subtotal, weight, zipCode);
      const total = subtotal + shipping;

      if (els.estimateResult) {
        els.estimateResult.innerHTML = `Estimated shipping: <strong>${formatCurrency(shipping)}</strong><br>Total after shipping: <strong>${formatCurrency(total)}</strong>`;
      }
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const zipCode = document.getElementById("checkoutZip")?.value || "";
      const subtotal = getSubtotal();
      const shipping = estimateShipping(subtotal, getTotalWeight(), zipCode);
      const total = subtotal + shipping;
      alert(`Checkout placeholder complete.\n\nSubtotal: ${formatCurrency(subtotal)}\nShipping: ${formatCurrency(shipping)}\nTotal: ${formatCurrency(total)}\n\nNext step: connect payment provider and order submission.`);
    });
  }

  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

renderProducts();
renderCart();
wireEvents();