const form = document.getElementById("order-form");
const errorEl = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

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
  submitBtn.textContent = "Redirecting to checkout...";

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
    submitBtn.textContent = "Checkout";
  }
});
