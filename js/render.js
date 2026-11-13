// Draws the page: the product cards, the cart rows, the summary and the cart count.
// Every function here builds or updates page elements from the cart it receives.
// It never changes the cart. Clicks are handled in main.js.
//
// Elements are built with document.createElement and textContent, never with innerHTML.
// So a text is always shown as text. The browser never reads it as HTML.
//
// This file needs PRODUCTS (products.js), formatMoney and formatShipping (format.js)
// and the cart functions (cart.js).

"use strict";

// ---------- Small helpers ----------

// Makes one element with a CSS class and a text inside. Returns the element.
// Example: createTextElement("p", "product-price", "180.00 EGP")
function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

// Makes a small SVG icon. Returns the <svg> element.
// The shapes are drawn once in index.html, inside <symbol> tags.
// This function only points to one of them: <svg><use href="#icon-plus"></use></svg>
// SVG elements need createElementNS with the SVG address, not createElement.
function createIcon(symbolId, className) {
  const svgAddress = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgAddress, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(svgAddress, "use");
  use.setAttribute("href", "#" + symbolId);
  svg.appendChild(use);
  return svg;
}

// Makes a button that main.js can understand. Returns the button.
// data-action says what the button does: "add", "increase", "decrease" or "remove".
// data-id says which product it belongs to.
function createActionButton(className, action, productId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("data-action", action);
  button.setAttribute("data-id", productId);
  return button;
}

// Writes a text into the page element that has this id.
function setText(elementId, text) {
  document.getElementById(elementId).textContent = text;
}

// ---------- Product list ----------

// Builds the colored tile with the product icon. Returns a <div>.
// The color comes from the CSS class "tile-" plus the product id.
// The icon comes from the symbol "icon-" plus the product id.
function createProductTile(product) {
  const tile = document.createElement("div");
  tile.className = "product-tile tile-" + product.id;
  tile.appendChild(createIcon("icon-" + product.id, "product-icon"));
  return tile;
}

// Returns the text of the small label on a product card, like "In cart: 2".
function getInCartText(quantityInCart) {
  if (quantityInCart >= MAX_QUANTITY) {
    return "In cart: " + quantityInCart + " (max)";
  }
  return "In cart: " + quantityInCart;
}

// Builds the "Add to cart" button of one product. Returns the button.
// When the cart already has the maximum quantity, the button is marked with aria-disabled.
// aria-disabled (and not disabled) lets the button keep the keyboard focus.
function createAddButton(product, quantityInCart) {
  const button = createActionButton("button button-outline", "add", product.id);
  button.textContent = "Add to cart";
  button.setAttribute("aria-label", "Add to cart: " + product.name);
  if (quantityInCart >= MAX_QUANTITY) {
    button.setAttribute("aria-disabled", "true");
  }
  return button;
}

// Builds the card of one product. Returns an <li>.
// The "In cart" label is added only when the product is in the cart.
function createProductCard(product, quantityInCart) {
  const card = document.createElement("li");
  card.className = "product-card";
  card.appendChild(createProductTile(product));
  card.appendChild(createTextElement("h3", "product-name", product.name));
  card.appendChild(createTextElement("p", "product-description", product.description));
  card.appendChild(createTextElement("p", "product-price", formatMoney(product.price)));
  if (quantityInCart > 0) {
    card.appendChild(createTextElement("p", "in-cart-label", getInCartText(quantityInCart)));
  }
  card.appendChild(createAddButton(product, quantityInCart));
  return card;
}

// Draws all product cards again.
// It needs the cart to show the "In cart" labels.
function renderProducts(cart) {
  const list = document.getElementById("product-list");
  // replaceChildren() without a value removes the old cards.
  list.replaceChildren();
  for (const product of PRODUCTS) {
    list.appendChild(createProductCard(product, getQuantity(cart, product.id)));
  }
}

// ---------- Cart rows ----------

// Builds a button that shows only an icon. Returns the button.
// The label is not shown on the screen. It tells a screen reader what the button does.
function createIconButton(action, productId, symbolId, label) {
  const button = createActionButton("icon-button", action, productId);
  button.setAttribute("aria-label", label);
  button.appendChild(createIcon(symbolId, "icon"));
  return button;
}

// Builds the minus button, the quantity and the plus button of one cart row. Returns a <div>.
// At the maximum quantity the plus button is marked with aria-disabled.
function createQuantityControl(product, quantity) {
  const control = document.createElement("div");
  control.className = "quantity-control";
  const minusButton = createIconButton("decrease", product.id, "icon-minus", "Remove one " + product.name);
  const plusButton = createIconButton("increase", product.id, "icon-plus", "Add one " + product.name);
  if (quantity >= MAX_QUANTITY) {
    plusButton.setAttribute("aria-disabled", "true");
  }
  control.appendChild(minusButton);
  control.appendChild(createTextElement("span", "quantity-value", String(quantity)));
  control.appendChild(plusButton);
  return control;
}

// Builds one cart row: name, price of one piece, quantity buttons, row price and remove button.
// Returns an <li>.
function createCartRow(item) {
  const product = findProduct(item.id);
  const row = document.createElement("li");
  row.className = "cart-row";
  row.appendChild(createTextElement("p", "cart-row-name", product.name));
  row.appendChild(createTextElement("p", "cart-row-price", formatMoney(product.price) + " each"));
  row.appendChild(createQuantityControl(product, item.quantity));
  row.appendChild(createTextElement("p", "cart-row-total", formatMoney(getLineTotal(item))));
  const removeButton = createIconButton("remove", product.id, "icon-trash", "Remove " + product.name + " from cart");
  removeButton.classList.add("remove-button");
  row.appendChild(removeButton);
  return row;
}

// Draws all cart rows again.
// The message "Your cart is empty" is shown only when there are no rows.
function renderCart(cart) {
  const list = document.getElementById("cart-list");
  list.replaceChildren();
  for (const item of cart) {
    list.appendChild(createCartRow(item));
  }
  document.getElementById("cart-empty").hidden = cart.length > 0;
}

// ---------- Summary ----------

// Returns the sentence about free shipping that stands under the totals.
function getShippingHintText(cart) {
  if (cart.length === 0) {
    return "Free shipping from " + formatMoney(FREE_SHIPPING_LIMIT) + ".";
  }
  if (getShipping(cart) === 0) {
    return "You get free shipping.";
  }
  return "Add " + formatMoney(getMissingForFreeShipping(cart)) + " more for free shipping";
}

// Writes the free shipping sentence and sets the width of the progress bar.
function renderShippingHint(cart) {
  const hint = document.getElementById("shipping-hint");
  hint.textContent = getShippingHintText(cart);
  // toggle with a second value: true adds the class, false removes it.
  hint.classList.toggle("is-reached", cart.length > 0 && getShipping(cart) === 0);
  const progressFill = document.getElementById("shipping-progress");
  progressFill.style.width = getFreeShippingPercent(cart) + "%";
}

// Writes the numbers of the summary: items, subtotal, shipping and total.
// "Place order" is switched off while the cart is empty.
function renderSummary(cart) {
  setText("summary-items", String(getCount(cart)));
  setText("summary-subtotal", formatMoney(getSubtotal(cart)));
  setText("summary-shipping", formatShipping(getShipping(cart)));
  setText("summary-total", formatMoney(getGrandTotal(cart)));
  document.getElementById("place-order").disabled = cart.length === 0;
  renderShippingHint(cart);
}

// ---------- Cart count ----------

// Writes the number of pieces into the small badge of the Cart button in the header.
function renderCartCount(cart) {
  setText("cart-count", String(getCount(cart)));
}
