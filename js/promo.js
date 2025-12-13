document.addEventListener("DOMContentLoaded", function () {
  const promoTitle = document.querySelector(".promo-title");
  const promoTag = document.querySelector(".promo-tag");

  if (!promoTitle || !promoTag) return;

  const hour = new Date().getHours(); // 0 - 23
  let meal = "Breakfast";

  // Define time slots (24-hour format)
  // Breakfast: 5:00 - 10:59
  // Lunch: 11:00 - 15:59
  // Dinner: 16:00 - 22:59
  if (hour >= 11 && hour < 16) {
    meal = "Lunch";
  } else if (hour >= 16 && hour < 23) {
    meal = "Dinner";
  } else {
    meal = "Breakfast";
  }

  promoTitle.textContent = `${meal} Offer`;
  promoTag.textContent = `${meal} Special`;
});


