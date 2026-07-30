const Stripe = require("stripe");
const { variantIdFor } = require("../lib/products");
const { createDraftOrder } = require("../lib/printful");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Vercel serverless functions parse JSON bodies by default, but Stripe's
// signature check needs the exact raw bytes, so we turn that off here.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type !== "checkout.session.completed") {
    res.status(200).json({ received: true });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      event.data.object.id,
      { expand: ["line_items.data.price.product"] }
    );

    const address = session.shipping_details?.address || session.customer_details?.address;
    if (!address) throw new Error("No shipping address on session");

    const recipient = {
      name: session.shipping_details?.name || session.customer_details?.name,
      email: session.customer_details?.email,
      phone: session.customer_details?.phone || undefined,
      address1: address.line1,
      address2: address.line2 || undefined,
      city: address.city,
      state_code: address.state,
      country_code: address.country,
      zip: address.postal_code,
    };

    const items = [];
    for (const li of session.line_items.data) {
      const meta = li.price?.product?.metadata || {};
      const variantId = variantIdFor(meta.sku, meta.size);
      if (!variantId) {
        throw new Error(
          `No Printful variant configured for sku=${meta.sku} size=${meta.size}. ` +
            `Fill it in lib/products.js.`
        );
      }
      items.push({ sync_variant_id: variantId, quantity: li.quantity });
    }

    const childInfoField = session.custom_fields?.find((f) => f.key === "child_info");
    const note = [
      session.metadata?.childName && `Child: ${session.metadata.childName}`,
      session.metadata?.division && `Division: ${session.metadata.division}`,
      childInfoField?.text?.value && `Noted: ${childInfoField.text.value}`,
    ]
      .filter(Boolean)
      .join(" | ");

    await createDraftOrder({ recipient, items, note });

    res.status(200).json({ received: true });
  } catch (err) {
    // Return 500 so Stripe retries the webhook automatically; this is a
    // paid order, so a transient Printful API failure shouldn't silently
    // drop it. If retries keep failing, check the Vercel function logs
    // and create the Printful order manually from the Stripe payment details.
    console.error("Failed to create Printful order:", err.message);
    res.status(500).json({ error: err.message });
  }
};
