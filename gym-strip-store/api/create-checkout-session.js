const Stripe = require("stripe");
const { findProduct } = require("../lib/products");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Expects a POST body like:
// {
//   items: [{ sku: "navy_tee", size: "YM", quantity: 1 }, ...],
//   childName: "Jamie Smith", division: "Div 4",
//   email: "parent@example.com"
// }
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { items, childName, division, email } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "No items in order" });
      return;
    }

    const line_items = items.map(({ sku, size, quantity }) => {
      const product = findProduct(sku);
      if (!product) throw new Error(`Unknown sku: ${sku}`);
      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const label = size ? `${product.name} - Size ${size}` : product.name;

      return {
        quantity: qty,
        price_data: {
          currency: "cad",
          unit_amount: product.retailCents,
          product_data: {
            name: label,
            metadata: { sku, size: size || "" },
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["CA"] },
      customer_email: email || undefined,
      custom_fields: [
        {
          key: "child_info",
          label: { type: "custom", custom: "Child's name & class/division" },
          type: "text",
          optional: false,
        },
      ],
      metadata: {
        childName: childName || "",
        division: division || "",
      },
      automatic_tax: { enabled: true }, // requires Stripe Tax enabled in your dashboard
      success_url: `${process.env.PUBLIC_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/cancel.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
