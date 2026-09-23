const RATES = { KES: 1, USD: 130, EUR: 140, GBP: 165 };
const SYMBOLS = { KES: "KSh", USD: "$", EUR: "\u20ac", GBP: "\u00a3" };
const SESSION_COSTS = {
  "PlayStation - Standard": "KSh 100/hr",
  "FIFA": "KSh 150/hr",
  "Couple / Party Deal": "KSh 500 / 3 hrs"
};

/* ---------- Toast helper ---------- */
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Currency switcher ---------- */
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
      const wasActive = btn.classList.contains("active");
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      apply(btn.dataset.cur);
      if (!wasActive) showToast(`Currency switched to ${SYMBOLS[btn.dataset.cur]}`);
    });
  });

  apply("KES");
});

/* ---------- Mobile nav ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("nav ul");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = open ? "&times;" : "&#9776;";
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "&#9776;";
    });
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (!e.target.closest("nav")) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "&#9776;";
    }
  });
});

/* ---------- Header scroll state + progress bar + back-to-top ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");
  const backTop = document.getElementById("back-top");

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
    }
    if (backTop) backTop.classList.toggle("show", y > 480);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

/* ---------- Staggered child reveals ---------- */
function activateStagger(el) {
  el.querySelectorAll(".stagger-in").forEach((s) => s.classList.add("visible"));
}

/* ---------- Reveal on scroll ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          activateStagger(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
});

/* ---------- Animated stat counters ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length || !("IntersectionObserver" in window)) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animate(el) {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const val = Math.round(easeOut(t) * target);
      el.textContent = `${prefix}${val}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => io.observe(c));
});

/* ---------- 3D tilt on game cards ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
});

/* ---------- Game genre filters ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("filter-bar");
  const list = document.getElementById("game-list");
  if (!bar || !list) return;

  const cards = Array.from(list.querySelectorAll(".game-card"));

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    bar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    let shown = 0;
    cards.forEach((card, i) => {
      const match = filter === "all" || card.dataset.genre === filter;
      if (match) {
        shown++;
        card.classList.remove("hidden-card");
        card.style.animation = "none";
        void card.offsetWidth;
        card.style.animation = `fade-up 0.45s ${i * 0.04}s ease both`;
      } else {
        card.classList.add("hidden-card");
      }
    });

    const count = document.getElementById("game-count");
    if (count) count.innerHTML = `Showing <b>${shown}</b> of <b>${cards.length}</b> games`;
    showToast(`Filtered: ${btn.textContent.trim()}`);
  });
});

/* ---------- Lightbox ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("lightbox");
  if (!box) return;

  const img = document.getElementById("lightbox-img");
  const title = document.getElementById("lightbox-title");
  const price = document.getElementById("lightbox-price");
  const closeBtn = document.getElementById("lightbox-close");

  function open(card) {
    const src = card.querySelector("img");
    const name = card.querySelector(".games-meta p");
    img.src = src.getAttribute("src");
    img.alt = src.alt;
    title.textContent = name ? name.textContent : "";
    price.textContent = card.dataset.price || "";
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    box.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => open(card));
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
});

/* ---------- Booking calendar ---------- */
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
  const sessionSel = document.getElementById("session");

  function updateSummary() {
    const dayEl = document.getElementById("sum-day");
    const timeEl = document.getElementById("sum-time");
    const sessEl = document.getElementById("sum-session");
    const priceEl = document.getElementById("sum-price");
    if (!sessEl || !sessionSel) return;

    if (dayEl) {
      if (selectedDate) {
        dayEl.textContent = selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
        dayEl.classList.remove("pending");
        dayEl.classList.add("set");
      } else {
        dayEl.textContent = "Not chosen";
        dayEl.classList.add("pending");
        dayEl.classList.remove("set");
      }
    }
    if (timeEl) {
      if (selectedSlot) {
        timeEl.textContent = selectedSlot;
        timeEl.classList.remove("pending");
        timeEl.classList.add("set");
      } else {
        timeEl.textContent = "Not chosen";
        timeEl.classList.add("pending");
        timeEl.classList.remove("set");
      }
    }
    sessEl.textContent = sessionSel.value;
    if (priceEl) priceEl.textContent = SESSION_COSTS[sessionSel.value] || "";
  }

  if (sessionSel) {
    sessionSel.addEventListener("change", () => {
      updateSummary();
      showToast(`Session: ${sessionSel.value} · ${SESSION_COSTS[sessionSel.value] || ""}`);
    });
  }

  SLOTS.forEach((s) => {
    const b = document.createElement("button");
    b.className = "slot";
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      selectedSlot = s;
      updateSummary();
      showToast(`Time slot selected: ${s}`);
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
          updateSummary();
          showToast(
            `Day selected: ${date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}`
          );
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
    box.classList.add("show", "warn");
  }

  document.getElementById("book-btn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const session = document.getElementById("session").value;

    box.classList.remove("warn");

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
      Now send the booking as an SMS to +254 725 084 222:</small><br>
      <a class="btn sms-btn" href="${smsUrl}">Send Booking SMS</a>`;
    box.classList.add("show");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    showToast("Booking ready — send the SMS to confirm!");
  });

  render();
  updateSummary();
});

/* ---------- Live open/closed status ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const pill = document.getElementById("open-pill");
  const label = document.getElementById("open-label");
  const hero = document.getElementById("hero-status");
  if (!pill && !hero) return;

  function isOpen() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const mins = now.getHours() * 60 + now.getMinutes();
    if (day === 0) return mins >= 720 && mins < 1320; // Sunday 12:00 - 22:00
    return mins >= 540 && mins < 1320;                // Mon-Sat 9:00 - 22:00
  }

  function render() {
    const open = isOpen();
    if (pill && label) {
      pill.classList.toggle("open", open);
      pill.classList.toggle("closed", !open);
      label.textContent = open ? "Open Now" : "Closed";
      pill.title = open
        ? "Open until 10:00 PM"
        : "Opens 9:00 AM (noon on Sundays)";
    }
    if (hero) {
      hero.textContent = open
        ? "Open Now · Walk-ins Welcome"
        : "Currently Closed · See Hours";
    }
  }

  render();
  setInterval(render, 30000);
});

/* ---------- FIFA tournament countdown ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const cd = document.getElementById("countdown");
  if (!cd) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function nextTournament() {
    const now = new Date();
    const target = new Date(now);
    /* Saturday = 6 */
    let diff = (6 - now.getDay() + 7) % 7;
    if (diff === 0) {
      target.setHours(9, 30, 0, 0);
      if (target <= now) diff = 7;
    }
    target.setDate(now.getDate() + diff);
    target.setHours(9, 30, 0, 0);
    return target;
  }

  function render() {
    const remain = nextTournament() - Date.now();
    if (remain <= 0) return;
    const d = Math.floor(remain / 86400000);
    const h = Math.floor((remain / 3600000) % 24);
    const m = Math.floor((remain / 60000) % 60);
    const s = Math.floor((remain / 1000) % 60);
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = pad(v);
    };
    set("cd-d", d);
    set("cd-h", h);
    set("cd-m", m);
    set("cd-s", s);
  }

  render();
  setInterval(render, 1000);
});
