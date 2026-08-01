# SourPuss NH Bakery — website setup guide

This is a plain HTML/CSS/JS site (`index.html`) plus one small serverless
function (`netlify/functions/create-checkout.js`) that connects the order
builder to Square for real payment. Nothing here needs a database or a
traditional server — it's built to run on Netlify's free tier.

## 1. Get the site online (Gavin)

1. Create a free account at netlify.com.
2. Drag the whole project folder (this README, `index.html`, the `images/`
   folder, and the `netlify/` folder) onto Netlify's "Deploy manually" upload
   area — or, better long-term, put this folder in a GitHub repo and connect
   that repo to Netlify so future edits redeploy automatically.
3. Netlify will give you a temporary URL like `random-name-123.netlify.app`.
   Confirm the site loads and the images show up before moving on.
4. Buy the domain (wherever you like — Namecheap, Porkbun, GoDaddy, etc.),
   then in Netlify go to **Domain management > Add a domain** and follow
   Netlify's instructions to point it at the new domain. This part is just
   DNS records; Netlify walks you through exactly what to add at the
   registrar.

## 2. Set up Square (Elizabeth, with Gavin if she wants help)

1. Create a Square account at squareup.com if she doesn't already have one —
   the same account can also run her in-person card reader later if she
   wants one.
2. Go to the Square Developer Dashboard: developer.squareup.com/apps, and
   create an application (any name, e.g. "SourPuss Website").
3. Inside that application, grab two things:
   - **Access Token** (start with the **Sandbox** token for testing — it
     processes fake payments so nothing gets charged for real while you
     test the site)
   - **Location ID** (under the app's "Locations" tab)
4. In Netlify: **Site configuration > Environment variables**, add:
   - `SQUARE_ACCESS_TOKEN` — the token from step 3
   - `SQUARE_LOCATION_ID` — the location ID from step 3
   - `SQUARE_ENV` — `sandbox` for now
   - `SITE_URL` — the site's Netlify or custom domain URL
5. Redeploy the site (Netlify does this automatically after you save
   environment variables, or trigger it manually).
6. Test an order on the live site using Square's sandbox test card number
   `4111 1111 1111 1111`, any future expiration date, any CVV. Confirm the
   test order shows up in the Square **sandbox** dashboard.
7. When it all works, go back to the Developer Dashboard, switch to
   **Production**, copy the production Access Token and Location ID, and
   swap them into Netlify's environment variables (`SQUARE_ACCESS_TOKEN`,
   `SQUARE_LOCATION_ID`), and change `SQUARE_ENV` to `production`. Redeploy.
   The site now takes real payments.

**Security note:** the Access Token is a secret — it should only ever live
in Netlify's environment variables, never pasted into `index.html` or any
file that gets committed to a public GitHub repo.

## 3. Keeping it updated

- **Prices / flavors:** open `index.html`, search for `var FLAVORS`, and
  edit the `price` values or add/remove flavors there. Everything else
  (the order form, the menu grid, the checkout total) updates automatically
  from that one list.
- **Weekly specials:** search for `special-tags` in `index.html` and edit
  the flavor names listed there.
- **Photos:** add new files to the `images/` folder and reference them by
  filename in the `FLAVORS` list (the `photo` field) or wherever else in
  the HTML.

## 4. Optional upgrade: scheduled pickup/delivery in Square

Right now the fulfillment day, ready date, and customer's contact info are
attached to the order as a note, so Elizabeth sees them in the Square
dashboard alongside the payment. Square also supports a structured
`fulfillments` field on orders (pickup/delivery with real scheduled times)
which would let the order show up on a proper fulfillment schedule in
Square instead of just a note. That's a reasonable next step once the
basic flow is live and working — happy to help wire that up later.
