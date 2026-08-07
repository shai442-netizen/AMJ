// Central catalog + pricing config for the gym strip store.
//
// costCents below is UNVERIFIED — every value is null until you fill it
// in from a real Printful quote. Do not trust a number here that isn't
// null; don't calculate margin until it's a real one either.
//
// HOW TO FILL THIS IN:
// 1. Create a free Printful account -> Store -> "Add product".
// 2. Add the youth tee (Ring Spun Cotton Youth Tee, Navy) and upload the
//    school's vector logo as an embroidery placement. Add the two short
//    styles (VTT logo, no logo) the same way.
// 3. For each size variant Printful creates, copy its "sync_variant_id"
//    (Store > Products > click the variant > id shown in the URL / API).
// 4. Paste those ids below in place of the placeholder numbers (0).
// 5. Printful shows you the exact garment + embroidery + shipping cost per
//    variant in the product editor — copy that into costCents (in cents).
//    Your profit per item is retailCents - costCents - (~2.9% + $0.30 for
//    Stripe's fee). Nobody can tell you that number until step 5 is done.
//
// retailCents is a starting suggestion only, picked to undercut
// InSchoolWear's current pricing (shirts $18, VTT shorts $28, no-logo
// shorts $23, all + tax). Re-check it once costCents is real — if your
// actual cost is close to or above retail, raise the price before you
// take anyone's money.

const SIZES = ["YXS", "YS", "YM", "YL", "YXL"];

function emptyVariantMap() {
  return Object.fromEntries(SIZES.map((s) => [s, 0]));
}

const PRODUCTS = {
  navy_tee: {
    sku: "navy_tee",
    name: "Navy Gym Tee (embroidered logo)",
    costCents: null, // TODO: real Printful cost, in cents
    retailCents: 1600, // suggestion only — confirm margin once costCents is real
    variantIdsBySize: emptyVariantMap(), // TODO: fill with Printful sync_variant_id per size
  },
  vtt_shorts: {
    sku: "vtt_shorts",
    name: 'Shorts with "VTT" embroidery',
    costCents: null,
    retailCents: 2500,
    variantIdsBySize: emptyVariantMap(),
  },
  plain_shorts: {
    sku: "plain_shorts",
    name: "Shorts, no logo",
    costCents: null,
    retailCents: 2000,
    variantIdsBySize: emptyVariantMap(),
  },
};

// Optional upsell add-ons. Add more here any time — this is where the
// extra margin comes from beyond the core gym strip order. Only include
// items the decoration method actually works on: embroidery needs fabric,
// so hats/hoodies/bags qualify; hard goods (bottles, mugs) would need a
// different Printful product line (engraving/UV print), not embroidery.
const ADDONS = {
  spirit_cap: {
    sku: "spirit_cap",
    name: "Embroidered ball cap",
    costCents: null,
    retailCents: 1800,
  },
  spirit_hoodie: {
    sku: "spirit_hoodie",
    name: "School spirit hoodie (embroidered)",
    costCents: null,
    retailCents: 4000,
  },
};

function findProduct(sku) {
  return PRODUCTS[sku] || ADDONS[sku];
}

function variantIdFor(sku, size) {
  const product = PRODUCTS[sku];
  if (!product) return null;
  if (!size) return null;
  return product.variantIdsBySize[size] || null;
}

module.exports = { SIZES, PRODUCTS, ADDONS, findProduct, variantIdFor };
