// Starts the shop and connects the page to the cart logic.
//
// The current cart lives in ONE variable in this file. Every click follows the same steps:
//   1. a cart function from cart.js builds a new cart,
//   2. updateCart keeps the new cart and draws the page again.
// So the page always shows what is in the cart, and no other code changes the cart.
//
// This file needs all the other scripts, so it loads last.

"use strict";

// ---------- Page elements ----------

const siteHeader = document.getElementById("site-header");
const cartButton = document.getElementById("cart-button");
const productsSection = document.getElementById("products");
const productsTitle = document.getElementById("products-title");
const productList = document.getElementById("product-list");
const cartTitle = document.getElementById("cart-title");
const closeDrawerButton = document.getElementById("drawer-close");
const cartList = document.getElementById("cart-list");
const placeOrderButton = document.getElementById("place-order");
const clearCartButton = document.getElementById("clear-cart");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const receiptDialog = document.getElementById("receipt-dialog");
const receiptText = document.getElementById("receipt-text");
const newOrderButton = document.getElementById("new-order");

// Tells if the screen is 900px wide or more. There the cart is a side panel, not a drawer.
// The same number is in css/layout.css and css/components.css.
const wideScreen = window.matchMedia("(min-width: 900px)");

// ---------- The current cart ----------

// The cart that the page shows now. Only updateCart gives it a new value.
let currentCart = [];

// Keeps the new cart and draws every part of the page again.
function updateCart(newCart) {
  currentCart = newCart;
  renderProducts(currentCart);
  renderCart(currentCart);
  renderSummary(currentCart);
  renderCartCount(currentCart);
}

// ---------- Clicks in the lists ----------

// Gives the keyboard focus back to a button after its list was drawn again.
// Drawing a list again removes the old buttons, so the button that had the focus is gone.
// The new list has a button with the same data-action and data-id. That button gets the focus.
// If there is no such button (its row was removed), the cart title gets the focus.
function restoreFocus(list, action, productId) {
  const selector = 'button[data-action="' + action + '"][data-id="' + productId + '"]';
  const button = list.querySelector(selector);
  if (button === null) {
    cartTitle.focus();
  } else {
    button.focus();
  }
}

// Handles every click inside the product list with one listener.
// This is called event delegation: the list listens, not every single button.
// closest() starts at the clicked element and goes up to the nearest "Add to cart" button.
// It returns null when the click was not on such a button.
function handleProductListClick(event) {
  const button = event.target.closest('button[data-action="add"]');
  if (button === null) {
    return;
  }
  const productId = button.getAttribute("data-id");
  updateCart(addToCart(currentCart, productId));
  restoreFocus(productList, "add", productId);
}

// Handles every click inside the cart list with one listener.
// The data-action of the clicked button says which cart function to call.
function handleCartListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (button === null) {
    return;
  }
  const action = button.getAttribute("data-action");
  const productId = button.getAttribute("data-id");
  if (action === "increase") {
    updateCart(changeQuantity(currentCart, productId, 1));
  }
  if (action === "decrease") {
    updateCart(changeQuantity(currentCart, productId, -1));
  }
  if (action === "remove") {
    updateCart(removeFromCart(currentCart, productId));
  }
  restoreFocus(cartList, action, productId);
}

// Runs when "Clear cart" is pressed. An empty array is an empty cart.
function handleClearCartClick() {
  updateCart([]);
}

// ---------- Cart drawer (small screens) ----------

// Opens the cart drawer and moves the keyboard focus into it.
// The CSS shows the drawer when <body> has the class "drawer-open".
// inert switches off the page behind the drawer: it cannot be clicked or reached with the Tab key.
function openDrawer() {
  document.body.classList.add("drawer-open");
  siteHeader.inert = true;
  productsSection.inert = true;
  closeDrawerButton.focus();
}

// Closes the cart drawer and gives the keyboard focus back to the Cart button.
// It does nothing when the drawer is not open.
function closeDrawer() {
  if (!document.body.classList.contains("drawer-open")) {
    return;
  }
  document.body.classList.remove("drawer-open");
  siteHeader.inert = false;
  productsSection.inert = false;
  cartButton.focus();
}

// Runs when the Cart button in the header is pressed.
// On small screens it opens the drawer.
// On wide screens the cart is already on the page, so the button only moves the keyboard focus to it.
function handleCartButtonClick() {
  if (wideScreen.matches) {
    cartTitle.focus();
  } else {
    openDrawer();
  }
}

// Closes the drawer when the Escape key is pressed.
function handleKeyDown(event) {
  if (event.key === "Escape") {
    closeDrawer();
  }
}

// ---------- Order and receipt ----------

// Writes the receipt of the current cart into the dialog and opens the dialog.
// showModal() keeps the keyboard focus inside the dialog and lets the Escape key close it.
function showReceipt() {
  receiptText.textContent = buildReceipt(currentCart);
  receiptDialog.showModal();
}

// Runs when "Start a new order" is pressed. Closing the dialog starts handleReceiptClose.
function handleNewOrderClick() {
  receiptDialog.close();
}

// Runs after the receipt dialog has closed, by its button or by the Escape key.
// The order is finished, so the next one starts with an empty cart at the product list.
function handleReceiptClose() {
  updateCart([]);
  closeDrawer();
  productsTitle.focus();
}

// ---------- Start ----------

productList.addEventListener("click", handleProductListClick);
cartList.addEventListener("click", handleCartListClick);
clearCartButton.addEventListener("click", handleClearCartClick);

cartButton.addEventListener("click", handleCartButtonClick);
closeDrawerButton.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);
document.addEventListener("keydown", handleKeyDown);
// When the window becomes wide, the cart is a side panel, so an open drawer is closed.
wideScreen.addEventListener("change", closeDrawer);

placeOrderButton.addEventListener("click", showReceipt);
newOrderButton.addEventListener("click", handleNewOrderClick);
receiptDialog.addEventListener("close", handleReceiptClose);

// Draw the page for the first time with an empty cart.
updateCart([]);
