# Deskwork

Deskwork is a small shopping cart site for desk accessories, written in plain HTML, CSS and JavaScript.
It uses no framework, no library and no build step.

## How to run

Open `index.html` in a browser. A double-click on the file is enough.

You can also start a small local server in the project folder:

```
npx serve
```

Then open the address that it prints, for example `http://localhost:3000`.

## File structure

```
index.html            the page: header, product list, cart panel, receipt dialog and icon shapes
css/tokens.css        colors, spacing and font sizes as CSS variables
css/base.css          reset, body, typography and focus styles
css/layout.css        page layout, grids and the rules for wide screens
css/components.css    buttons, product cards, cart rows, summary, dialog and drawer
js/products.js        the PRODUCTS list with 8 products
js/format.js          formatMoney: turns piasters into text like "1,250.50 EGP"
js/cart.js            the cart logic as pure functions
js/storage.js         saves and loads the cart with localStorage
js/render.js          draws the products, the cart and the summary into the page
js/main.js            starts the app and connects clicks to the cart functions
tests/cart.test.js    tests for the cart logic
tests/format.test.js  tests for the money text
package.json          the "test" script
.gitignore            files that git does not track
```

## How it works

- **The logic is separate from the page.** `js/cart.js` has small pure functions such as `addToCart`,
  `removeFromCart`, `changeQuantity`, `getSubtotal`, `getShipping` and `buildReceipt`. They do not know
  the page. They take a cart and return a new cart or a value. They never change the cart they receive.
- **One variable holds the cart.** `js/main.js` keeps the current cart. A click calls a cart function
  and gives the result to `updateCart`. `updateCart` saves the cart, and `js/render.js` draws the page
  again from it.
- **Money is stored in piasters.** Every price is a whole number (1 pound = 100 piasters), so 12.50 EGP
  is `1250`. Whole numbers keep the math exact. In JavaScript `0.1 + 0.2` gives `0.30000000000000004`.
  Only `formatMoney` turns piasters into text for the screen.
- **The cart is saved in localStorage.** It is saved after every change and loaded when the page opens.
  Saved data is checked first. Rows with an unknown product or a bad quantity are ignored.
- **The scripts are plain files.** They load with `<script defer>` in a fixed order and share global
  names, so the page works from `file://` without a server. The logic files also export their functions
  for the tests in Node.
- **The receipt is text.** `buildReceipt` returns the receipt as a string. "Place order" shows it in a
  dialog. Closing the dialog, with its button or with the Escape key, starts a new order with an empty cart.

## Tests

The tests use the test runner that comes with Node.js (version 18 or newer). There is nothing to install.

```
npm test
```

## Shipping rule

| Cart                          | Shipping |
| ----------------------------- | -------- |
| Empty                         | 0        |
| Subtotal below 1,000 EGP      | 50 EGP   |
| Subtotal of 1,000 EGP or more | Free     |

The cart panel shows how much is still missing for free shipping.
One product can be in the cart 10 times at most.
