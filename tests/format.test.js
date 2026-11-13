// Tests for the text functions in js/format.js.
// Run them with: npm test

"use strict";

const test = require("node:test");
const assert = require("node:assert");

const { formatMoney, formatShipping } = require("../js/format.js");

// ---------- formatMoney ----------

test("formatMoney shows 0 piasters as 0.00 EGP", function () {
  assert.strictEqual(formatMoney(0), "0.00 EGP");
});

test("formatMoney shows 5 piasters as 0.05 EGP", function () {
  assert.strictEqual(formatMoney(5), "0.05 EGP");
});

test("formatMoney shows 10 piasters as 0.10 EGP", function () {
  assert.strictEqual(formatMoney(10), "0.10 EGP");
});

test("formatMoney shows 1250 piasters as 12.50 EGP", function () {
  assert.strictEqual(formatMoney(1250), "12.50 EGP");
});

test("formatMoney writes no comma below one thousand pounds", function () {
  assert.strictEqual(formatMoney(99999), "999.99 EGP");
});

test("formatMoney shows 125050 piasters as 1,250.50 EGP", function () {
  assert.strictEqual(formatMoney(125050), "1,250.50 EGP");
});

test("formatMoney shows 100000000 piasters as 1,000,000.00 EGP", function () {
  assert.strictEqual(formatMoney(100000000), "1,000,000.00 EGP");
});

// ---------- formatShipping ----------

test("formatShipping writes Free when the price is 0", function () {
  assert.strictEqual(formatShipping(0), "Free");
});

test("formatShipping writes the money text when the price is above 0", function () {
  assert.strictEqual(formatShipping(5000), "50.00 EGP");
});

// ---------- Why money is stored in piasters ----------

test("adding whole piasters is exact, adding decimal pounds is not", function () {
  // In pounds: 0.10 + 0.20 does not give exactly 0.30.
  assert.notStrictEqual(0.1 + 0.2, 0.3);
  // In piasters: 10 + 20 gives exactly 30.
  assert.strictEqual(10 + 20, 30);
  assert.strictEqual(formatMoney(10 + 20), "0.30 EGP");
});
