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

## 4. Set up the newsletter with Constant Contact (Elizabeth, with Gavin if she wants help)

The site has a "Get the specials before they sell out" sign-up box (search
`newsletter` in `index.html`). Right now it's a placeholder — the inputs
are disabled and it says "Not connected yet" underneath. To make it real:

1. **Elizabeth creates a Constant Contact account** at constantcontact.com,
   using her own email — the account needs to be hers so the email list,
   and everyone who signs up, belongs to her business, not you.
2. Inside Constant Contact, go to **Contacts** and make (or use the
   default) list she wants sign-ups to land in — e.g. "SourPuss
   Newsletter."
3. Go to **Website > Sign-Up Forms** (sometimes listed under "Grow Your
   List" or "Landing Pages & Sign-Up Forms," Constant Contact renames
   these sections occasionally). Create a new **Sign-Up Form**, choose the
   **Embedded** style (not pop-up, not anchor — embedded is the one meant
   to sit inside an existing page like this one), connect it to the list
   from step 2, and keep the fields simple (just email, to match the
   site's design — extra fields can always be added later).
4. Constant Contact will give you an **embed code** — a snippet of HTML
   and `<script>` tags. Copy the whole thing.
5. Open `index.html`, search for `id="ctct-signup-form"`, and replace
   everything between that opening `<div id="ctct-signup-form">` tag and
   its closing `</div>` with the snippet you copied. Delete the
   placeholder `<form>` and `<small>` that were there as a stand-in.
6. Push to GitHub. Vercel redeploys automatically, and the box on the
   live site becomes Constant Contact's real form — submissions go
   straight into Elizabeth's Constant Contact account, into the list you
   picked in step 2. Nothing else on the site needs to change; this piece
   doesn't need Vercel environment variables like Square does, because
   Constant Contact's embedded form talks directly to Constant Contact
   from the visitor's browser.
7. Test it yourself with a real email address once it's live, and confirm
   the contact shows up in Constant Contact under the right list.

One note on styling: Constant Contact's embedded form comes with its own
default look, which won't automatically match the site's fonts and
colors. Constant Contact's form editor lets you customize colors and
fonts for the embed — worth spending a few minutes there so it doesn't
look like a foreign box dropped into the page. If it still looks
mismatched after that, send me a screenshot and I can help tighten the
CSS around it.

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
