const RATES = { KES: 1, USD: 130, EUR: 140, GBP: 165 };
const SYMBOLS = { KES: "KSh", USD: "$", EUR: "\u20ac", GBP: "\u00a3" };

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cur-btn");
  const amounts = document.querySelectorAll(".amount");
  const curs = document.querySelectorAll(".curr");
  if (!buttons.length) return;

  function format(value) {
    return value % 1 === 0
      ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : value.toFixed(2);
  }

  function apply(currency) {
    const rate = RATES[currency];
    amounts.forEach((a) => {
      const kes = Number(a.dataset.kes);
      a.textContent = format(kes / rate);
    });
    curs.forEach((c) => {
      c.textContent = SYMBOLS[currency];
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      apply(btn.dataset.cur);
    });
  });

  apply("KES");
});