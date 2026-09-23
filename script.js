const RATES = { KES: 1, USD: 130, EUR: 140, GBP: 165 };
const SYMBOLS = { KES: "KSh", USD: "$", EUR: "\u20ac", GBP: "\u00a3" };

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".cur-btn");
  if (!buttons.length) return;

  const amounts = document.querySelectorAll(".amount");
  const curs = document.querySelectorAll(".curr");

  function format(value) {
    return value % 1 === 0
      ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : value.toFixed(2);
  }

  function apply(currency) {
    const rate = RATES[currency];
    amounts.forEach((a) => {
      a.textContent = format(Number(a.dataset.kes) / rate);
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

document.addEventListener("DOMContentLoaded", () => {
  const cells = document.getElementById("cal-cells");
  if (!cells) return;

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedSlot = null;

  const monthLabel = document.getElementById("cal-month");
  const slotsBox = document.getElementById("slots");

  SLOTS.forEach((s) => {
    const b = document.createElement("button");
    b.className = "slot";
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      selectedSlot = s;
    });
    slotsBox.appendChild(b);
  });

  function sameDay(a, b) {
    return a && b && a.toDateString() === b.toDateString();
  }

  function render() {
    monthLabel.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    cells.innerHTML = "";

    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (let i = 0; i < first.getDay(); i++) {
      const pad = document.createElement("span");
      pad.className = "cal-cell empty";
      cells.appendChild(pad);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const cell = document.createElement("span");
      cell.className = "cal-cell";
      cell.textContent = d;

      if (date < today) {
        cell.classList.add("past");
      } else {
        if (sameDay(date, today)) cell.classList.add("today");
        if (sameDay(date, selectedDate)) cell.classList.add("selected");
        cell.addEventListener("click", () => {
          selectedDate = date;
          render();
        });
      }
      cells.appendChild(cell);
    }
  }

  document.getElementById("prev").addEventListener("click", () => {
    const min = new Date(today.getFullYear(), today.getMonth(), 1);
    if (view > min) {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    }
  });

  document.getElementById("next").addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    render();
  });

  const box = document.getElementById("confirmation");

  function warn(msg) {
    box.innerHTML = `<small>${msg}</small>`;
    box.classList.add("show");
  }

  document.getElementById("book-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const session = document.getElementById("session").value;

    if (!selectedDate) return warn("Please choose a day on the calendar.");
    if (!selectedSlot) return warn("Please pick a time slot.");
    if (!name) return warn("Please enter your name.");
    if (!phone) return warn("Please enter your phone number.");

    const dateStr = selectedDate.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    const msg = `108 Games Arcade booking: ${session}, ${dateStr} at ${selectedSlot}. Name: ${name}. Call me on ${phone}.`;
    const smsUrl = `sms:+254725084222?&body=${encodeURIComponent(msg)}`;

    box.innerHTML = `<strong>Booking confirmed, ${name}!</strong><br>
      <small>${session} &middot; ${dateStr} at ${selectedSlot}<br>
      Now send the booking as an SMS to 0725 084 222:</small><br>
      <a class="btn sms-btn" href="${smsUrl}">Send Booking SMS</a>`;
    box.classList.add("show");
  });

  render();
});