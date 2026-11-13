// Tests for the cart logic in js/cart.js.
// Run them with: npm test
// They use the test runner that comes with Node, so there is nothing to install.

"use strict";

const test = require("node:test");
const assert = require("node:assert");

// ---------- Setup ----------

// In the browser, cart.js finds PRODUCTS, formatMoney and formatShipping as global names,
// because the script tags load products.js and format.js first.
// Node has no script tags, so the tests put the three names on `global` before cart.js loads.
//
// The cart tests use their own short product list. The numbers are easy to check by hand,
// and the tests still pass when the prices in the shop change.
global.PRODUCTS = [
  { id: "pen", name: "Pen", price: 1250 },      // 12.50 EGP
  { id: "lamp", name: "Lamp", price: 45000 },   // 450 EGP
  { id: "desk", name: "Desk", price: 100000 }   // 1,000 EGP, exactly the free shipping limit
];

const format = require("../js/format.js");
global.formatMoney = format.formatMoney;
global.formatShipping = format.formatShipping;

const {
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
} = require("../js/cart.js");

// Builds the same small cart for every test that needs one.
// 2 pens and 1 lamp: 3 pieces, subtotal 47500 piasters (475 EGP).
function makeCart() {
  return [
    { id: "pen", quantity: 2 },
    { id: "lamp", quantity: 1 }
  ];
}

// Returns the receipt line that starts with the given text, or "" when there is no such line.
function findReceiptLine(receipt, startText) {
  for (const line of receipt.split("\n")) {
    if (line.startsWith(startText)) {
      return line;
    }
  }
  return "";
}

// ---------- Looking things up ----------

test("findProduct returns the product that has the id", function () {
  const product = findProduct("lamp");
  assert.strictEqual(product.name, "Lamp");
  assert.strictEqual(product.price, 45000);
});

test("findProduct returns null for an unknown id", function () {
  assert.strictEqual(findProduct("sofa"), null);
});

test("getQuantity returns the quantity of a product in the cart", function () {
  assert.strictEqual(getQuantity(makeCart(), "pen"), 2);
});

test("getQuantity returns 0 when the product is not in the cart", function () {
  assert.strictEqual(getQuantity(makeCart(), "desk"), 0);
});

// ---------- addToCart ----------

test("addToCart adds a new product with quantity 1", function () {
  const result = addToCart([], "pen");
  assert.deepStrictEqual(result, [{ id: "pen", quantity: 1 }]);
});

test("addToCart puts a new product after the rows that are already there", function () {
  const result = addToCart(makeCart(), "desk");
  assert.deepStrictEqual(result, [
    { id: "pen", quantity: 2 },
    { id: "lamp", quantity: 1 },
    { id: "desk", quantity: 1 }
  ]);
});

test("addToCart adds 1 to the quantity when the product is already in the cart", function () {
  const result = addToCart(makeCart(), "pen");
  assert.deepStrictEqual(result, [
    { id: "pen", quantity: 3 },
    { id: "lamp", quantity: 1 }
  ]);
});

test("addToCart returns the cart unchanged for an unknown id", function () {
  const result = addToCart(makeCart(), "sofa");
  assert.deepStrictEqual(result, makeCart());
});

test("addToCart does not go above the maximum quantity of 10", function () {
  const result = addToCart([{ id: "pen", quantity: 10 }], "pen");
  assert.deepStrictEqual(result, [{ id: "pen", quantity: 10 }]);
});

// ---------- removeFromCart ----------

test("removeFromCart removes the whole row of the product", function () {
  const result = removeFromCart(makeCart(), "pen");
  assert.deepStrictEqual(result, [{ id: "lamp", quantity: 1 }]);
});

test("removeFromCart keeps every row when the product is not in the cart", function () {
  const result = removeFromCart(makeCart(), "desk");
  assert.deepStrictEqual(result, makeCart());
});

// ---------- changeQuantity ----------

test("changeQuantity with +1 makes the quantity one bigger", function () {
  const result = changeQuantity(makeCart(), "pen", 1);
  assert.deepStrictEqual(result, [
    { id: "pen", quantity: 3 },
    { id: "lamp", quantity: 1 }
  ]);
});

test("changeQuantity with -1 makes the quantity one smaller", function () {
  const result = changeQuantity(makeCart(), "pen", -1);
  assert.deepStrictEqual(result, [
    { id: "pen", quantity: 1 },
    { id: "lamp", quantity: 1 }
  ]);
});

test("changeQuantity removes the row when the quantity reaches 0", function () {
  const result = changeQuantity(makeCart(), "lamp", -1);
  assert.deepStrictEqual(result, [{ id: "pen", quantity: 2 }]);
});

test("changeQuantity stops at the maximum quantity of 10", function () {
  assert.strictEqual(MAX_QUANTITY, 10);
  const result = changeQuantity([{ id: "pen", quantity: 10 }], "pen", 1);
  assert.deepStrictEqual(result, [{ id: "pen", quantity: 10 }]);
});

test("changeQuantity changes nothing when the product is not in the cart", function () {
  const result = changeQuantity(makeCart(), "desk", 1);
  assert.deepStrictEqual(result, makeCart());
});

// ---------- The cart that goes in stays the same ----------

test("addToCart does not change the cart it receives", function () {
  const cart = makeCart();
  addToCart(cart, "pen");
  addToCart(cart, "desk");
  assert.deepStrictEqual(cart, makeCart());
});

test("removeFromCart does not change the cart it receives", function () {
  const cart = makeCart();
  removeFromCart(cart, "pen");
  assert.deepStrictEqual(cart, makeCart());
});

test("changeQuantity does not change the cart it receives", function () {
  const cart = makeCart();
  changeQuantity(cart, "pen", 1);
  changeQuantity(cart, "lamp", -1);
  assert.deepStrictEqual(cart, makeCart());
});

test("the functions that count and build the receipt do not change the cart they receive", function () {
  const cart = makeCart();
  getCount(cart);
  getSubtotal(cart);
  getShipping(cart);
  getGrandTotal(cart);
  getMissingForFreeShipping(cart);
  getFreeShippingPercent(cart);
  buildReceipt(cart);
  cleanSavedCart(cart);
  assert.deepStrictEqual(cart, makeCart());
});

test("a changed cart is a new array with new rows inside", function () {
  const cart = makeCart();
  const result = changeQuantity(cart, "pen", 1);
  assert.notStrictEqual(result, cart);
  assert.notStrictEqual(result[1], cart[1]);
});

// ---------- getCount and getSubtotal ----------

test("getCount returns 0 for an empty cart", function () {
  assert.strictEqual(getCount([]), 0);
});

test("getCount returns the sum of all quantities", function () {
  assert.strictEqual(getCount(makeCart()), 3);
});

test("getLineTotal returns the price of one piece times the quantity", function () {
  assert.strictEqual(getLineTotal({ id: "pen", quantity: 2 }), 2500);
});

test("getSubtotal returns 0 for an empty cart", function () {
  assert.strictEqual(getSubtotal([]), 0);
});

test("getSubtotal adds price times quantity for every row", function () {
  // 2 x 1250 + 1 x 45000 = 47500
  assert.strictEqual(getSubtotal(makeCart()), 47500);
});

// ---------- getShipping ----------

test("the shipping rule uses a limit of 1,000 EGP and a price of 50 EGP", function () {
  assert.strictEqual(FREE_SHIPPING_LIMIT, 100000);
  assert.strictEqual(SHIPPING_PRICE, 5000);
});

test("getShipping is 0 for an empty cart", function () {
  assert.strictEqual(getShipping([]), 0);
});

test("getShipping is 50 EGP when the subtotal is below the limit", function () {
  // 2 x 45000 = 90000, that is 900 EGP
  assert.strictEqual(getShipping([{ id: "lamp", quantity: 2 }]), 5000);
});

test("getShipping is 0 when the subtotal is exactly the limit", function () {
  assert.strictEqual(getShipping([{ id: "desk", quantity: 1 }]), 0);
});

test("getShipping is 0 when the subtotal is above the limit", function () {
  const cart = [
    { id: "desk", quantity: 1 },
    { id: "pen", quantity: 1 }
  ];
  assert.strictEqual(getShipping(cart), 0);
});

// ---------- getGrandTotal ----------

test("getGrandTotal is 0 for an empty cart", function () {
  assert.strictEqual(getGrandTotal([]), 0);
});

test("getGrandTotal adds the shipping price to the subtotal", function () {
  // 47500 + 5000 = 52500
  assert.strictEqual(getGrandTotal(makeCart()), 52500);
});

test("getGrandTotal is the same as the subtotal when shipping is free", function () {
  assert.strictEqual(getGrandTotal([{ id: "desk", quantity: 1 }]), 100000);
});

// ---------- Free shipping ----------

test("getMissingForFreeShipping returns the piasters that are still needed", function () {
  // 100000 - 47500 = 52500
  assert.strictEqual(getMissingForFreeShipping(makeCart()), 52500);
});

test("getMissingForFreeShipping returns 0 when shipping is already free", function () {
  assert.strictEqual(getMissingForFreeShipping([{ id: "desk", quantity: 1 }]), 0);
  assert.strictEqual(getMissingForFreeShipping([{ id: "desk", quantity: 2 }]), 0);
});

test("getMissingForFreeShipping returns 0 for an empty cart", function () {
  assert.strictEqual(getMissingForFreeShipping([]), 0);
});

test("getFreeShippingPercent is a whole number that rounds down", function () {
  assert.strictEqual(getFreeShippingPercent([]), 0);
  // 1250 of 100000 is 1.25 percent
  assert.strictEqual(getFreeShippingPercent([{ id: "pen", quantity: 1 }]), 1);
  // 47500 of 100000 is 47.5 percent
  assert.strictEqual(getFreeShippingPercent(makeCart()), 47);
});

test("getFreeShippingPercent stops at 100", function () {
  assert.strictEqual(getFreeShippingPercent([{ id: "desk", quantity: 1 }]), 100);
  assert.strictEqual(getFreeShippingPercent([{ id: "desk", quantity: 2 }]), 100);
});

// ---------- buildReceipt ----------

test("buildReceipt returns text that starts with the shop name", function () {
  const receipt = buildReceipt(makeCart());
  assert.strictEqual(typeof receipt, "string");
  assert.strictEqual(receipt.split("\n")[0], "Deskwork receipt");
});

test("buildReceipt has one line for every row, with name, quantity and row price", function () {
  const lines = buildReceipt(makeCart()).split("\n");
  // 6 + 1 + 19 + 1 + 9 = 36 characters
  assert.strictEqual(lines[2], "Pen x2 " + ".".repeat(19) + " 25.00 EGP");
  // 7 + 1 + 17 + 1 + 10 = 36 characters
  assert.strictEqual(lines[3], "Lamp x1 " + ".".repeat(17) + " 450.00 EGP");
});

test("buildReceipt shows items, subtotal, shipping and total", function () {
  const receipt = buildReceipt(makeCart());
  assert.ok(findReceiptLine(receipt, "Items").endsWith(" 3"));
  assert.ok(findReceiptLine(receipt, "Subtotal").endsWith(" 475.00 EGP"));
  assert.ok(findReceiptLine(receipt, "Shipping").endsWith(" 50.00 EGP"));
  assert.ok(findReceiptLine(receipt, "Total").endsWith(" 525.00 EGP"));
});

test("buildReceipt writes Free when shipping costs nothing", function () {
  const receipt = buildReceipt([{ id: "desk", quantity: 1 }]);
  assert.ok(findReceiptLine(receipt, "Shipping").endsWith(" Free"));
  assert.ok(findReceiptLine(receipt, "Total").endsWith(" 1,000.00 EGP"));
});

test("every receipt line under the title has the same width", function () {
  const lines = buildReceipt(makeCart()).split("\n");
  // slice(1) gives all lines except the first one, the title.
  for (const line of lines.slice(1)) {
    assert.strictEqual(line.length, RECEIPT_WIDTH);
  }
});

// ---------- cleanSavedCart ----------

test("cleanSavedCart keeps rows that are valid", function () {
  const savedData = [
    { id: "pen", quantity: 2 },
    { id: "lamp", quantity: 10 }
  ];
  assert.deepStrictEqual(cleanSavedCart(savedData), savedData);
});

test("cleanSavedCart returns an empty cart when the data is not an array", function () {
  assert.deepStrictEqual(cleanSavedCart(null), []);
  assert.deepStrictEqual(cleanSavedCart("pen"), []);
  assert.deepStrictEqual(cleanSavedCart(5), []);
  assert.deepStrictEqual(cleanSavedCart({ id: "pen", quantity: 1 }), []);
});

test("cleanSavedCart leaves out rows with an unknown id or a bad quantity", function () {
  const savedData = [
    { id: "sofa", quantity: 1 },
    { id: "pen", quantity: 0 },
    { id: "pen", quantity: 11 },
    { id: "pen", quantity: 1.5 },
    { id: "pen", quantity: "2" },
    { id: "pen" },
    null,
    "pen",
    { id: "lamp", quantity: 3 }
  ];
  assert.deepStrictEqual(cleanSavedCart(savedData), [{ id: "lamp", quantity: 3 }]);
});

test("cleanSavedCart keeps a product only once", function () {
  const savedData = [
    { id: "pen", quantity: 1 },
    { id: "pen", quantity: 5 }
  ];
  assert.deepStrictEqual(cleanSavedCart(savedData), [{ id: "pen", quantity: 1 }]);
});

// ---------- The real product list ----------

// The tests below read js/products.js, the list that the shop shows.
const shopProducts = require("../js/products.js").PRODUCTS;

test("the shop has 8 products", function () {
  assert.strictEqual(shopProducts.length, 8);
});

test("every product has an id, a name, a description and a price", function () {
  for (const product of shopProducts) {
    assert.strictEqual(typeof product.id, "string");
    assert.strictEqual(typeof product.name, "string");
    assert.strictEqual(typeof product.description, "string");
    assert.strictEqual(typeof product.price, "number");
  }
});

test("every product id is used only once", function () {
  const seenIds = [];
  for (const product of shopProducts) {
    assert.ok(!seenIds.includes(product.id));
    seenIds.push(product.id);
  }
});

test("every price is a whole number of piasters above 0", function () {
  for (const product of shopProducts) {
    assert.ok(Number.isInteger(product.price));
    assert.ok(product.price > 0);
  }
});

test("every product fits in one receipt line, even with the maximum quantity", function () {
  for (const product of shopProducts) {
    const leftText = product.name + " x" + MAX_QUANTITY;
    const rightText = format.formatMoney(product.price * MAX_QUANTITY);
    // Between the two texts stand 2 spaces and 3 dots or more.
    assert.ok(leftText.length + rightText.length + 5 <= RECEIPT_WIDTH);
  }
});
