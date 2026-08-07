// Keep this in sync with the retailCents values in lib/products.js —
// it only exists so the form can show a live running total client-side.
const PRICES = {
  navy_tee: { name: "Navy Gym Tee", cents: 1600 },
  vtt_shorts: { name: 'Shorts with "VTT"', cents: 2500 },
  plain_shorts: { name: "Shorts, no logo", cents: 2000 },
  spirit_cap: { name: "Embroidered ball cap", cents: 1800 },
  spirit_hoodie: { name: "School spirit hoodie", cents: 4000 },
};

const form = document.getElementById("order-form");
const errorEl = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");
const btnLabelEl = document.getElementById("btn-label");
const btnTotalEl = document.getElementById("btn-total");
const summaryList = document.getElementById("summary-list");
const summaryTotalEl = document.getElementById("summary-total");

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

document.querySelectorAll(".price-tag[data-price]").forEach((el) => {
  const price = PRICES[el.dataset.price];
  if (price) el.textContent = money(price.cents);
});

function collectItems() {
  const items = [];

  document.querySelectorAll(".size-select").forEach((select) => {
    if (!select.value) return;
    const sku = select.dataset.sku;
    const qtyInput = document.querySelector(`.qty-input[data-sku="${sku}"]`);
    items.push({
      sku,
      size: select.value,
      quantity: parseInt(qtyInput.value, 10) || 1,
    });
  });

  document.querySelectorAll(".addon-check:checked").forEach((check) => {
    items.push({ sku: check.dataset.sku, quantity: 1 });
  });

  return items;
}

function renderSummary() {
  const items = collectItems();
  summaryList.innerHTML = "";

  if (items.length === 0) {
    summaryList.innerHTML = '<li class="empty">Nothing selected yet</li>';
    summaryTotalEl.textContent = money(0);
    btnTotalEl.textContent = money(0);
    return;
  }

  let total = 0;
  items.forEach(({ sku, size, quantity }) => {
    const price = PRICES[sku];
    if (!price) return;
    const lineTotal = price.cents * quantity;
    total += lineTotal;

    const li = document.createElement("li");
    const label = size ? `${price.name} (${size}) × ${quantity}` : `${price.name} × ${quantity}`;
    li.innerHTML = `<span>${label}</span><span class="line-amount">${money(lineTotal)}</span>`;
    summaryList.appendChild(li);
  });

  summaryTotalEl.textContent = money(total);
  btnTotalEl.textContent = money(total);
}

form.addEventListener("input", renderSummary);
renderSummary();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const items = collectItems();

  if (items.length === 0) {
    errorEl.textContent = "Pick at least one item.";
    errorEl.hidden = false;
    return;
  }

  const payload = {
    items,
    email: document.getElementById("email").value,
    childName: document.getElementById("childName").value,
    division: document.getElementById("division").value,
  };

  submitBtn.disabled = true;
  btnLabelEl.textContent = "Redirecting to checkout...";
  btnTotalEl.hidden = true;

  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    window.location.href = data.url;
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
    submitBtn.disabled = false;
    btnLabelEl.textContent = "Checkout";
    btnTotalEl.hidden = false;
  }
});
