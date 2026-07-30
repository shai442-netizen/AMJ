// Central catalog + pricing config for the gym strip store.
//
// HOW TO FILL THIS IN:
// 1. Create a free Printful account -> Store -> "Add product".
// 2. Add the youth tee (Ring Spun Cotton Youth Tee, Navy) and upload the
//    school's vector logo as an embroidery placement. Add the two short
//    styles (VTT logo, no logo) the same way.
// 3. For each size variant Printful creates, copy its "sync_variant_id"
//    (Store > Products > click the variant > id shown in the URL / API).
// 4. Paste those ids below in place of the placeholder numbers (0).
// 5. Fill in costCents from your Printful product cost (garment + embroidery
//    + Printful's shipping fee) so you can see your margin per item.
//    Ballpark from public Printful pricing (verify against your own account):
//      blank youth tee   ~$8-11 CAD  + embroidery ~$13-20 + per-1000-stitch fee
//      blank youth shorts ~$10-14 CAD + embroidery ~$13-20 + per-1000-stitch fee
//
// retailCents is what the parent pays (before tax/shipping if you charge
// those separately). Keep it below InSchoolWear's current pricing
// (shirts $18, VTT shorts $28, no-logo shorts $23, all + tax) to be "cheaper."

const SIZES = ["YXS", "YS", "YM", "YL", "YXL"];

function emptyVariantMap() {
  return Object.fromEntries(SIZES.map((s) => [s, 0]));
}

const PRODUCTS = {
  navy_tee: {
    sku: "navy_tee",
    name: "Navy Gym Tee (embroidered logo)",
    costCents: 1600, // TODO: replace with your real Printful cost
    retailCents: 1600, // TODO: set your retail price
    variantIdsBySize: emptyVariantMap(), // TODO: fill with Printful sync_variant_id per size
  },
  vtt_shorts: {
    sku: "vtt_shorts",
    name: 'Shorts with "VTT" embroidery',
    costCents: 2200,
    retailCents: 2500,
    variantIdsBySize: emptyVariantMap(),
  },
  plain_shorts: {
    sku: "plain_shorts",
    name: "Shorts, no logo",
    costCents: 1800,
    retailCents: 2000,
    variantIdsBySize: emptyVariantMap(),
  },
};

// Optional upsell add-ons shown at checkout. Add more here any time —
// this is where the extra margin comes from beyond the core gym strip.
const ADDONS = {
  water_bottle: {
    sku: "water_bottle",
    name: "Embroidered water bottle",
    costCents: 900,
    retailCents: 1500,
  },
  spirit_hoodie: {
    sku: "spirit_hoodie",
    name: "School spirit hoodie (embroidered)",
    costCents: 2800,
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
