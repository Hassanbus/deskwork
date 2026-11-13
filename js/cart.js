// The cart logic of the shop: add, remove, count, totals, shipping and the receipt text.
//
// Every function in this file is PURE. That means:
//   - it uses only the values it receives and the PRODUCTS list,
//   - it never touches the page, the window or the browser storage,
//   - it never changes the cart it receives. When the cart must change, it returns a NEW cart array.
//
// Why a new cart: the old cart stays as it was. A test can compare the cart before and after,
// and the page can simply be drawn again from the new cart.
//
// A cart is an array of rows shaped like { id: "notebook", quantity: 2 }.
// Every id in a cart is a known product id: addToCart refuses unknown ids,
// and cleanSavedCart checks saved data before the shop uses it.
//
// This file needs PRODUCTS (products.js) and formatMoney and formatShipping (format.js).

"use strict";

// ---------- Shop rules ----------

// The largest quantity of one product in a cart.
const MAX_QUANTITY = 10;

// Shipping is free when the subtotal is this much or more. 100000 piasters = 1,000 EGP.
const FREE_SHIPPING_LIMIT = 100000;

// The shipping price below the limit. 5000 piasters = 50 EGP.
const SHIPPING_PRICE = 5000;

// The number of characters in one line of the receipt.
const RECEIPT_WIDTH = 36;

// ---------- Looking things up ----------

// Finds one product by its id.
// Returns the product object, or null when no product has this id.
function findProduct(productId) {
  for (const product of PRODUCTS) {
    if (product.id === productId) {
      return product;
    }
  }
  return null;
}

// Returns the quantity of one product in the cart.
// Returns 0 when the product is not in the cart.
function getQuantity(cart, productId) {
  for (const item of cart) {
    if (item.id === productId) {
      return item.quantity;
    }
  }
  return 0;
}

// ---------- Changing the cart ----------

// Makes a copy of the cart: a new array with new row objects inside.
// Returns the copy. Changing the copy does not change the first cart.
function copyCart(cart) {
  const newCart = [];
  for (const item of cart) {
    newCart.push({ id: item.id, quantity: item.quantity });
  }
  return newCart;
}

// Adds one piece of a product to the cart.
// If the product is already in the cart, its quantity grows by 1.
// Returns a new cart. For an unknown id it returns the cart it received, unchanged.
function addToCart(cart, productId) {
  if (findProduct(productId) === null) {
    return cart;
  }
  if (getQuantity(cart, productId) > 0) {
    return changeQuantity(cart, productId, 1);
  }
  const newCart = copyCart(cart);
  newCart.push({ id: productId, quantity: 1 });
  return newCart;
}

// Removes the whole row of one product.
// Returns a new cart without that row.
function removeFromCart(cart, productId) {
  const newCart = [];
  for (const item of cart) {
    if (item.id !== productId) {
      newCart.push({ id: item.id, quantity: item.quantity });
    }
  }
  return newCart;
}

// Adds `change` (+1 or -1) to the quantity of one product.
// The quantity never goes above MAX_QUANTITY.
// When the quantity reaches 0 or less, the row is removed.
// Returns a new cart.
function changeQuantity(cart, productId, change) {
  const newCart = [];
  for (const item of cart) {
    let quantity = item.quantity;
    if (item.id === productId) {
      quantity = quantity + change;
    }
    if (quantity > MAX_QUANTITY) {
      quantity = MAX_QUANTITY;
    }
    if (quantity > 0) {
      newCart.push({ id: item.id, quantity: quantity });
    }
  }
  return newCart;
}

// ---------- Counting and totals ----------

// Returns the total number of pieces in the cart (the sum of all quantities).
function getCount(cart) {
  let count = 0;
  for (const item of cart) {
    count = count + item.quantity;
  }
  return count;
}

// Returns the price of one cart row in piasters: the price of one piece times the quantity.
function getLineTotal(item) {
  const product = findProduct(item.id);
  return product.price * item.quantity;
}

// Returns the subtotal in piasters: the sum of all row prices, without shipping.
function getSubtotal(cart) {
  let subtotal = 0;
  for (const item of cart) {
    subtotal = subtotal + getLineTotal(item);
  }
  return subtotal;
}

// Returns the shipping price in piasters.
// An empty cart has no shipping (0). From FREE_SHIPPING_LIMIT shipping is free (0).
// Every other cart pays SHIPPING_PRICE.
function getShipping(cart) {
  if (cart.length === 0) {
    return 0;
  }
  if (getSubtotal(cart) >= FREE_SHIPPING_LIMIT) {
    return 0;
  }
  return SHIPPING_PRICE;
}

// Returns the total price in piasters: subtotal plus shipping.
function getGrandTotal(cart) {
  return getSubtotal(cart) + getShipping(cart);
}

// Returns how many piasters are still missing for free shipping.
// Returns 0 when shipping is already free. Returns 0 for an empty cart too.
function getMissingForFreeShipping(cart) {
  if (cart.length === 0) {
    return 0;
  }
  const missing = FREE_SHIPPING_LIMIT - getSubtotal(cart);
  if (missing < 0) {
    return 0;
  }
  return missing;
}

// Returns how close the cart is to free shipping, as a whole number from 0 to 100.
// The page uses it for the width of the progress bar.
function getFreeShippingPercent(cart) {
  const subtotal = getSubtotal(cart);
  if (subtotal >= FREE_SHIPPING_LIMIT) {
    return 100;
  }
  return Math.floor((subtotal * 100) / FREE_SHIPPING_LIMIT);
}

// ---------- Receipt ----------

// Builds one receipt line: the left text, a row of dots, the right text.
// The dots fill the line up to RECEIPT_WIDTH characters. There are always 3 dots or more.
// Example: buildReceiptLine("Notebook x2", "360.00 EGP") returns
// "Notebook x2 ............. 360.00 EGP".
function buildReceiptLine(leftText, rightText) {
  let dotCount = RECEIPT_WIDTH - leftText.length - rightText.length - 2;
  if (dotCount < 3) {
    dotCount = 3;
  }
  return leftText + " " + ".".repeat(dotCount) + " " + rightText;
}

// Builds the receipt line of one cart row, like "Notebook x2 ..... 360.00 EGP".
function buildReceiptRow(item) {
  const product = findProduct(item.id);
  const leftText = product.name + " x" + item.quantity;
  return buildReceiptLine(leftText, formatMoney(getLineTotal(item)));
}

// Builds the receipt of the cart as plain text, one line under the other.
// Returns the text. It does not print anything and it does not touch the page.
function buildReceipt(cart) {
  const separator = "-".repeat(RECEIPT_WIDTH);
  const lines = ["Deskwork receipt", separator];
  for (const item of cart) {
    lines.push(buildReceiptRow(item));
  }
  lines.push(separator);
  lines.push(buildReceiptLine("Items", String(getCount(cart))));
  lines.push(buildReceiptLine("Subtotal", formatMoney(getSubtotal(cart))));
  lines.push(buildReceiptLine("Shipping", formatShipping(getShipping(cart))));
  lines.push(buildReceiptLine("Total", formatMoney(getGrandTotal(cart))));
  // "\n" is the sign for a new line. join puts it between the lines.
  return lines.join("\n");
}

// ---------- Checking saved data ----------

// Checks one row that comes from saved data.
// Returns true when the row has a known product id and a whole quantity from 1 to MAX_QUANTITY.
function isValidCartItem(item) {
  if (typeof item !== "object" || item === null) {
    return false;
  }
  if (findProduct(item.id) === null) {
    return false;
  }
  if (!Number.isInteger(item.quantity)) {
    return false;
  }
  return item.quantity >= 1 && item.quantity <= MAX_QUANTITY;
}

// Builds a safe cart from saved data that the shop cannot trust.
// Takes any value. Returns a new cart with only the valid rows.
// When a product comes twice, only its first row is kept.
function cleanSavedCart(savedData) {
  const cart = [];
  if (!Array.isArray(savedData)) {
    return cart;
  }
  for (const item of savedData) {
    if (isValidCartItem(item) && getQuantity(cart, item.id) === 0) {
      cart.push({ id: item.id, quantity: item.quantity });
    }
  }
  return cart;
}

// ---------- Export for tests ----------

// The browser has no `module`, so this block runs only in Node, where the tests run.
// The same pattern is explained at the end of products.js.
if (typeof module !== "undefined") {
  module.exports = {
    MAX_QUANTITY,
    FREE_SHIPPING_LIMIT,
    SHIPPING_PRICE,
    RECEIPT_WIDTH,
    findProduct,
    getQuantity,
    addToCart,
    removeFromCart,
    changeQuantity,
    getCount,
    getLineTotal,
    getSubtotal,
    getShipping,
    getGrandTotal,
    getMissingForFreeShipping,
    getFreeShippingPercent,
    buildReceipt,
    cleanSavedCart
  };
}
