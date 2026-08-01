// netlify/functions/create-checkout.js
//
// This runs on Netlify's servers, not in the customer's browser — that's required,
// because it uses a secret Square Access Token that must never be exposed in
// client-side code. The website's order builder POSTs the customer's selections
// here; this function turns them into a real Square Order and asks Square for a
// hosted checkout page URL, then sends that URL back so the browser can redirect
// the customer to it to pay.
//
// SETUP — see README.md in the project root for the full walkthrough. In short:
//   1. In the Netlify site dashboard: Site configuration > Environment variables, add:
//        SQUARE_ACCESS_TOKEN   - from the Square Developer Dashboard
//        SQUARE_LOCATION_ID    - from the same place
//        SQUARE_ENV            - "sandbox" while testing, "production" when live
//        SITE_URL              - e.g. https://sourpussnhbakery.com (used for the
//                                 receipt redirect link)
//   2. Deploy. Netlify will automatically pick up any file in netlify/functions/
//      as an endpoint at /.netlify/functions/<filename>.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let order;
  try {
    order = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    return { statusCode: 400, body: 'No items in order' };
  }

  const ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const ENV = process.env.SQUARE_ENV === 'production' ? 'production' : 'sandbox';
  const SITE_URL = process.env.SITE_URL || 'https://example.com';
  const BASE_URL = ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

  if (!ACCESS_TOKEN || !LOCATION_ID) {
    return {
      statusCode: 500,
      body: 'Square is not configured yet — missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID.'
    };
  }

  // Build Square order line items. Square wants prices in the smallest currency
  // unit (cents for USD), as integers.
  const lineItems = items.map((item) => ({
    name: String(item.name).slice(0, 500),
    quantity: String(item.quantity),
    base_price_money: {
      amount: Math.round(Number(item.price) * 100),
      currency: 'USD'
    }
  }));

  const noteParts = [];
  if (order.fulfillment) noteParts.push(order.fulfillment);
  if (order.readyDate) noteParts.push('Ready ' + order.readyDate);
  if (order.name) noteParts.push('Name: ' + order.name);
  if (order.contact) noteParts.push('Contact: ' + order.contact);
  if (order.note) noteParts.push('Note: ' + order.note);

  const body = {
    idempotency_key: cryptoRandomId(),
    order: {
      location_id: LOCATION_ID,
      line_items: lineItems,
      // Square keeps a running note on the order — this is how the fulfillment
      // day, ready date, and customer's contact info reach Elizabeth's Square
      // dashboard alongside the paid order.
      // (See README.md for a note on upgrading this to Square's structured
      // "fulfillments" field for pickup/delivery scheduling.)
      metadata: { source: 'sourpuss-website' }
    },
    checkout_options: {
      redirect_url: SITE_URL.replace(/\/$/, '') + '/#order',
      ask_for_shipping_address: false
    },
    payment_note: noteParts.join(' · ').slice(0, 500)
  };

  try {
    const res = await fetch(BASE_URL + '/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Square-Version': '2026-07-15'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Square API error:', data);
      return { statusCode: 502, body: 'Square could not create the checkout page.' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: data.payment_link.url })
    };
  } catch (err) {
    console.error('Checkout function error:', err);
    return { statusCode: 500, body: 'Something went wrong creating checkout.' };
  }
};

function cryptoRandomId() {
  // Square requires a unique idempotency key per request.
  return 'sp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}
