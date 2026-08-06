# SourPuss NH Bakery — website setup guide

This is a plain HTML/CSS/JS site (`index.html`) plus one small serverless
function (`api/create-checkout.js`) that connects the order builder to
Square for real payment. It's built to deploy straight from GitHub to
Vercel — no database, no traditional server to manage.

## 1. Get the code on GitHub (Gavin)

1. Create a new repository on GitHub (public or private, either works).
2. Add every file in this folder to it, keeping the same structure:
   - `index.html` — must stay named exactly `index.html` and stay at the
     root of the repo, so it loads at your domain's homepage.
   - `images/` — all the photos.
   - `api/create-checkout.js` — the Square function.
   - `README.md` — this file.
3. Commit and push.

## 2. Deploy on Vercel (Gavin)

1. Create a free account at vercel.com and sign in with GitHub.
2. Click **Add New > Project**, pick this repository, and click **Deploy**.
   Vercel auto-detects the static `index.html` and the `api/` folder — no
   configuration needed.
3. Vercel gives you a working URL like `your-project.vercel.app`. Confirm
   the site loads and the images show up.
4. Buy the domain (Namecheap, Porkbun, GoDaddy, wherever), then in the
   Vercel project go to **Settings > Domains**, add it, and follow Vercel's
   instructions for the DNS records to add at the registrar.
5. From now on, every time you push a change to the GitHub repo, Vercel
   redeploys automatically.

## 3. Set up Square (Elizabeth, with Gavin if she wants help)

1. Create a Square account at squareup.com if she doesn't already have one
   — the same account can also run her in-person card reader later if she
   wants one.
2. Go to the Square Developer Dashboard: developer.squareup.com/apps, and
   create an application (any name, e.g. "SourPuss Website").
3. Inside that application, grab two things:
   - **Access Token** (start with the **Sandbox** token for testing — it
     processes fake payments so nothing gets charged for real while you
     test the site)
   - **Location ID** (under the app's "Locations" tab)
4. In Vercel: **Settings > Environment Variables**, add:
   - `SQUARE_ACCESS_TOKEN` — the token from step 3
   - `SQUARE_LOCATION_ID` — the location ID from step 3
   - `SQUARE_ENV` — `sandbox` for now
   - `SITE_URL` — the site's Vercel or custom domain URL
5. Redeploy (Vercel > Deployments > … > Redeploy, or just push any small
   change to GitHub).
6. Test an order on the live site using Square's sandbox test card number
   `4111 1111 1111 1111`, any future expiration date, any CVV. Confirm the
   test order shows up in the Square **sandbox** dashboard.
7. When it all works, go back to the Developer Dashboard, switch to
   **Production**, copy the production Access Token and Location ID, and
   swap them into Vercel's environment variables (`SQUARE_ACCESS_TOKEN`,
   `SQUARE_LOCATION_ID`), and change `SQUARE_ENV` to `production`.
   Redeploy. The site now takes real payments.

**Security note:** the Access Token is a secret — it should only ever live
in Vercel's environment variables, never pasted into `index.html` or
committed to the GitHub repo.

## 4. Newsletter (Constant Contact) — already connected

Every "Join Our Email List" button/link on the site (nav bar, the
newsletter section, the footer — search `lp.constantcontactpages.com` in
`index.html` to find all of them) points straight to Elizabeth's live
Constant Contact sign-up page:

`https://lp.constantcontactpages.com/sl/ZP7lzVM`

That page is already hers — it's set up under "SourPuss NH Bakery" with
her address, and anyone who signs up through it lands directly in her
Constant Contact contacts list. Nothing else needs to be configured; it
just works once the site is deployed.

**If she ever creates a new sign-up page** (a redesign, a different list,
etc.), just replace that URL everywhere it appears — search
`lp.constantcontactpages.com` in `index.html` and swap in the new link in
each spot.

## 5. Keeping it updated

- **Prices / flavors:** open `index.html`, search for `var FLAVORS`, and
  edit the `price` values or add/remove flavors there. Everything else
  (the order form, the menu grid, the checkout total) updates automatically
  from that one list.
- **Weekly specials:** search for `special-tags` in `index.html` and edit
  the flavor names listed there.
- **Reviews:** search for `yelp-review` in `index.html` to add or edit
  reviews in the Yelp-style box.
- **Photos:** add new files to the `images/` folder and reference them by
  filename in the `FLAVORS` list (the `photo` field) or wherever else in
  the HTML. Push to GitHub and Vercel redeploys automatically.

## 6. Optional upgrade: scheduled pickup/delivery in Square

Right now the fulfillment day, ready date, and customer's contact info are
attached to the order as a note, so Elizabeth sees them in the Square
dashboard alongside the payment. Square also supports a structured
`fulfillments` field on orders (pickup/delivery with real scheduled times)
which would let the order show up on a proper fulfillment schedule in
Square instead of just a note. That's a reasonable next step once the
basic flow is live and working — happy to help wire that up later.
