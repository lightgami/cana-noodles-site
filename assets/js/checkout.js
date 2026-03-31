const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const state = {
  products: window.CANA_PRODUCTS || [],
  cart: JSON.parse(localStorage.getItem("cana_cart") || "[]"),
  step: 1
};

function getProduct(productId) {
  return state.products.find((product) => product.id === productId);
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

function setStep(step) {
  state.step = step;

  document.querySelectorAll(".checkout-panel").forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.step) === step);
  });

  document.querySelectorAll(".checkout-step").forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.stepIndicator) === step);
  });

  if (step === 3 || step === 4) {
    renderReview();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCartItems(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!state.cart.length) {
    target.innerHTML = `<div class="empty-state">Your cart is empty.</div>`;
    return;
  }

  target.innerHTML = state.cart.map((item) => {
    const product = getProduct(item.id);
    if (!product) return "";

    return `
      <div class="review-line">
        <span>${product.name} × ${item.qty}</span>
        <strong>${formatCurrency(product.price * item.qty)}</strong>
      </div>
    `;
  }).join("");
}

function renderTotals(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const zip = document.getElementById("shipZip")?.value || "";
  const subtotal = getSubtotal();
  const shipping = state.cart.length ? estimateShipping(subtotal, getTotalWeight(), zip) : 0;
  const total = subtotal + shipping;

  target.innerHTML = `
    <div class="order-line"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
    <div class="order-line"><span>Estimated shipping</span><strong>${formatCurrency(shipping)}</strong></div>
    <div class="order-line"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
  `;
}

function renderReview() {
  renderCartItems("reviewItems");
  renderCartItems("sidebarItems");
  renderTotals("reviewTotals");
  renderTotals("sidebarTotals");
  renderTotals("paymentTotals");

  const shippingAddress = document.getElementById("reviewShippingAddress");
  if (shippingAddress) {
    shippingAddress.innerHTML = `
      <p>
        <strong>${document.getElementById("shipName")?.value || ""}</strong><br>
        ${document.getElementById("shipEmail")?.value || ""}<br>
        ${document.getElementById("shipPhone")?.value || ""}<br>
        ${document.getElementById("shipAddress1")?.value || ""}<br>
        ${document.getElementById("shipAddress2")?.value || ""}<br>
        ${document.getElementById("shipCity")?.value || ""}, ${document.getElementById("shipState")?.value || ""} ${document.getElementById("shipZip")?.value || ""}
      </p>
    `;
  }
}

function validateShippingStep() {
  const requiredIds = [
    "shipName",
    "shipEmail",
    "shipAddress1",
    "shipCity",
    "shipState",
    "shipZip"
  ];

  for (const id of requiredIds) {
    const field = document.getElementById(id);
    if (field && !field.value.trim()) {
      field.focus();
      field.reportValidity();
      return false;
    }
  }

  return true;
}

function wireBillingToggle() {
  const sameAsShipping = document.getElementById("sameAsShipping");
  const billingFields = document.getElementById("billingFields");
  if (!sameAsShipping || !billingFields) return;

  const sync = () => {
    billingFields.classList.toggle("is-hidden", sameAsShipping.checked);
  };

  sameAsShipping.addEventListener("change", sync);
  sync();
}

function wireStepButtons() {
  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextStep = Number(button.dataset.nextStep);

      if (nextStep === 2 && !validateShippingStep()) {
        return;
      }

      setStep(nextStep);
    });
  });

  document.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", () => {
      setStep(Number(button.dataset.prevStep));
    });
  });
}

function wireForm() {
  const form = document.getElementById("checkoutPageForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const subtotal = getSubtotal();
    const shipping = estimateShipping(subtotal, getTotalWeight(), document.getElementById("shipZip")?.value || "");
    const total = subtotal + shipping;

    alert(`Order placeholder complete.\n\nSubtotal: ${formatCurrency(subtotal)}\nShipping: ${formatCurrency(shipping)}\nTotal: ${formatCurrency(total)}\n\nNext step: connect payment provider and order submission.`);
  });
}

function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderCartItems("sidebarItems");
  renderTotals("sidebarTotals");
  wireBillingToggle();
  wireStepButtons();
  wireForm();
  setStep(1);
}

init();