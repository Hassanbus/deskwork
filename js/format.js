// Turns numbers into text for the screen.
// Money is a whole number of piasters everywhere else in the project.
// Only this file makes text like "1,250.50 EGP".

"use strict";

// ---------- Money ----------

// Puts a comma between groups of three digits.
// Takes a whole number like 1250000 and returns the text "1,250,000".
function addThousandsCommas(wholeNumber) {
  const digits = String(wholeNumber);
  let result = "";
  let digitsLeft = digits.length;
  for (const digit of digits) {
    result = result + digit;
    digitsLeft = digitsLeft - 1;
    // A comma comes when the digits that are left make full groups of three.
    if (digitsLeft > 0 && digitsLeft % 3 === 0) {
      result = result + ",";
    }
  }
  return result;
}

// Turns piasters into money text for the screen.
// Takes a whole number that is 0 or more. Example: 125050 returns "1,250.50 EGP".
function formatMoney(piasters) {
  // The piasters that do not make a full pound: 125050 gives 50.
  const piastersLeft = piasters % 100;
  // Take them away first, so the division gives a whole number: 125000 / 100 = 1250.
  const pounds = (piasters - piastersLeft) / 100;
  let piastersText = String(piastersLeft);
  if (piastersLeft < 10) {
    piastersText = "0" + piastersText;
  }
  return addThousandsCommas(pounds) + "." + piastersText + " EGP";
}

// ---------- Shipping ----------

// Turns a shipping price into text.
// Returns "Free" when the price is 0. Returns money text like "50.00 EGP" for any other price.
function formatShipping(piasters) {
  if (piasters === 0) {
    return "Free";
  }
  return formatMoney(piasters);
}

// ---------- Export for tests ----------

// The browser has no `module`, so this block runs only in Node, where the tests run.
// The same pattern is explained at the end of products.js.
if (typeof module !== "undefined") {
  module.exports = { formatMoney, formatShipping };
}
