// Saves the cart in the browser and loads it again when the page opens.
// This is the only file that uses localStorage.
//
// localStorage can fail, for example in a private window or when it is full.
// So every call is inside try/catch. When it fails, the shop still works.
// The cart is only not remembered after a reload.
//
// This file needs cleanSavedCart (cart.js).

"use strict";

// ---------- Settings ----------

// The name under which the cart is saved in localStorage.
const STORAGE_KEY = "deskwork-cart";

// ---------- Save and load ----------

// Saves the cart as JSON text. Returns nothing.
function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // Saving failed. There is nothing to do: the shop works without a saved cart.
  }
}

// Loads the saved cart. Returns a cart array.
// The saved text can be missing, broken or changed by someone, so it is not trusted:
// cleanSavedCart keeps only the rows that are valid.
// Returns an empty cart when nothing can be read.
function loadCart() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    return cleanSavedCart(JSON.parse(savedText));
  } catch (error) {
    return [];
  }
}
