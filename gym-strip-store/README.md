# Gym Strip Store

A parent-facing order form for embroidered school gym strip (navy tee, VTT
shorts, no-logo shorts), fulfilled by Printful and paid via Stripe Checkout.
No inventory, no packing boxes — Printful embroiders and ships each order
straight to the family's home.

## How it works

1. A parent fills out the form at `public/index.html` and hits Checkout.
2. `api/create-checkout-session.js` builds a Stripe Checkout Session priced
   at whatever you set in `lib/products.js` (your retail price, already
   including your markup) and redirects the parent to Stripe to pay.
3. When Stripe confirms payment, it calls `api/webhook.js`, which creates a
   **draft** order in Printful (not yet sent to production) using the
   parent's shipping address.
4. You review the draft order in your Printful dashboard — check size,
   confirm the right garment/logo combo went in — then click Confirm.
   Printful embroiders it and ships directly to the parent.

Nothing auto-produces without your review, which matters here since
InSchoolWear flagged a possible mix-up with the no-logo shorts image.

## One-time setup

### 1. Printful
1. Create a free account at printful.com and set up a Store (any type, e.g.
   "Manual order / API").
2. Add three products, uploading the school's vector logo as the
   embroidery placement for the tee (chest) and the VTT shorts (leg):
   - Ring Spun Cotton Youth Tee, **Navy**, embroidered logo
   - Youth shorts w/ pockets, embroidered "VTT"
   - Youth shorts w/ pockets, no logo
   Add all the youth sizes you want to offer for each.
3. Note Printful's cost per variant (Store > Products > variant) — that's
   your COGS including their production; add their per-order shipping fee
   separately (shown at checkout in their dashboard or via the API) if you
   want to fold it into your retail price instead of charging shipping
   separately.
4. Get your API key: Settings > API/webhooks in the Printful dashboard.
5. Open `lib/products.js` and paste each variant's `sync_variant_id` and
   real `costCents` into the matching size slot. Set `retailCents` to what
   you want to charge (keep it under InSchoolWear's $18 / $28 / $23 +tax to
   be the cheaper option, while still covering Printful's cost + Stripe fees
   + your margin).

### 2. Stripe
1. Create a Stripe account, switch on **Stripe Tax** if you want GST/PST
   calculated automatically (Settings > Tax), and register for the
   provinces you're selling into. Also set a default product tax category
   there (e.g. clothing) so ad-hoc checkout line items get taxed correctly
   without you having to tag a `tax_code` on every item in code.
2. Get your secret key from Developers > API keys.
3. Deploy this project first (step 3 below), then add a webhook endpoint
   pointing at `https://<your-deployed-url>/api/webhook` listening for
   `checkout.session.completed`. Copy the signing secret it gives you.

### 3. Deploy
This is set up for [Vercel](https://vercel.com) (free tier is enough for
this volume):

```bash
cd gym-strip-store
npm install
npx vercel
```

Then in the Vercel project's Settings > Environment Variables, add everything
from `.env.example` (real values, not placeholders), including `PUBLIC_URL`
set to the URL Vercel gives you. Redeploy after adding env vars.

Netlify Functions work too with minor changes (move `api/` to
`netlify/functions/`, same code).

## Where the profit comes from

Your revenue per item is `retailCents - costCents - Stripe's ~2.9% + $0.30
fee`. The `ADDONS` section in `lib/products.js` (water bottle, spirit
hoodie, etc.) is where you add optional upsells parents can check at
checkout — pure margin on top of the core gym strip order. Add more
add-ons any time by adding entries to that object and a checkbox in
`public/index.html`.

## Before you launch

- Confirm with the school/PAC that you're clear to sell an alternative to
  the current InSchoolWear/Taryn offering, especially since it uses the
  school's logo.
- Wait for InSchoolWear to confirm whether the no-logo-shorts product image
  is a mistake before you commit to that garment's artwork.
- Place one real test order yourself end-to-end (real card, small qty)
  before opening it up to other parents.
