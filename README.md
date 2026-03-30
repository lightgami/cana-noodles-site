# Cana Noodles Starter Storefront

This is a portable static storefront concept for Cana Noodles.

## What is included

- Product-based homepage
- Simple product catalog driven by JavaScript data
- Cart with localStorage persistence
- Shipping estimator placeholder
- Checkout UI placeholder
- Packaging-inspired visual design

## How to run locally

Because this is a static site, you can host it with many simple options.

### Option 1: open directly

Open `index.html` in a browser.

### Option 2: run a lightweight local server

Using Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Files to update first

### Product data

Edit:

```text
assets/js/products.js
```

This is where you will update:
- product names
- prices
- weights
- bundle options
- product tags
- descriptions

### Styling

Edit:

```text
assets/css/styles.css
```

### Main layout

Edit:

```text
index.html
```

## Recommended next steps

1. Replace placeholder products with your real product list
2. Confirm prices and shipping rules
3. Add more photos
4. Replace placeholder checkout with a real payment provider
5. Add policy pages such as shipping, returns, privacy, and terms
6. Add order submission backend or hosted checkout integration

## Suggested payment integrations for later

- Stripe Checkout
- Square Online Payments
- PayPal Checkout

## Suggested shipping integrations for later

- Shippo
- EasyPost
- UPS / USPS API integration

## Hosting options later

This starter project can be hosted on:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Amazon S3 static hosting
- traditional shared hosting that serves static files

It can also be folded into a FastAPI or other backend project later.
