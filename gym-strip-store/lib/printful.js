// Thin wrapper around Printful's v1 REST API.
// Docs: https://developers.printful.com/docs/

const PRINTFUL_BASE = "https://api.printful.com";

async function printfulRequest(path, options = {}) {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) {
    throw new Error("PRINTFUL_API_KEY is not set");
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  // Only needed if your Printful account has multiple stores.
  if (process.env.PRINTFUL_STORE_ID) {
    headers["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
  }

  const res = await fetch(`${PRINTFUL_BASE}${path}`, { ...options, headers });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      `Printful API error (${res.status}): ${JSON.stringify(body)}`
    );
  }
  return body;
}

// Creates a DRAFT order (confirm: false) so nothing is produced/shipped
// until you review it in the Printful dashboard and confirm it. This is
// your safety net for catching sizing mistakes, the shorts/no-logo mixup
// mentioned by InSchoolWear, etc. before real money is spent on production.
async function createDraftOrder({ recipient, items, note }) {
  return printfulRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      recipient,
      items,
      confirm: false,
      packing_slip: note ? { custom_message: note } : undefined,
    }),
  });
}

module.exports = { createDraftOrder };
