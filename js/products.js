// The list of products that the shop sells.
// This file is only data. It has no logic and it does not touch the page.

"use strict";

// ---------- Money rule ----------

// Every price is a whole number of piasters (1 pound = 100 piasters).
// 12.50 pounds is stored as 1250.
//
// Why: JavaScript cannot keep many decimal numbers exactly.
// For example, 0.1 + 0.2 gives 0.30000000000000004 and not 0.3.
// Whole numbers do not have this problem, so the money math is always exact.
// Only formatMoney (in format.js) turns piasters into text like "12.50 EGP".

// ---------- Products ----------

// Each product has:
//   id          - a short unique name. The cart and the page use it to find the product.
//   name        - the name that the user sees.
//   description - one short line about the product.
//   price       - the price of one piece, in piasters.
const PRODUCTS = [
  {
    id: "notebook",
    name: "Notebook",
    description: "A5, dot grid, 120 pages",
    price: 18000
  },
  {
    id: "pen-set",
    name: "Pen Set",
    description: "Three gel pens, 0.5 mm",
    price: 12450
  },
  {
    id: "desk-lamp",
    name: "Desk Lamp",
    description: "Warm light, metal arm",
    price: 65000
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Mug",
    description: "Holds 350 ml, matte glaze",
    price: 16500
  },
  {
    id: "monitor-stand",
    name: "Monitor Stand",
    description: "Solid oak, 10 cm high",
    price: 180000
  },
  {
    id: "mouse-pad",
    name: "Mouse Pad",
    description: "Soft felt, 25 x 20 cm",
    price: 8950
  },
  {
    id: "cable-organizer",
    name: "Cable Organizer",
    description: "Keeps loose cables together",
    price: 14000
  },
  {
    id: "plant-pot",
    name: "Plant Pot",
    description: "Concrete, 9 cm wide",
    price: 22500
  }
];

// ---------- Export for tests ----------

// In the browser, PRODUCTS is a global name. The scripts that load after this file can use it.
// The tests run in Node. There, a file must export the things that other files may use.
// Node gives every file an object called `module`. The browser does not have it,
// so the block below runs only in Node.
// `{ PRODUCTS }` is the short way to write `{ PRODUCTS: PRODUCTS }`.
if (typeof module !== "undefined") {
  module.exports = { PRODUCTS };
}
