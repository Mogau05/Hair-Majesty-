const bookingForm = document.querySelector("#booking-form");
const bookingType = document.querySelector("#booking-type");
const homeFields = document.querySelector("#home-fields");
const addressField = document.querySelector("#service-address");
const serviceSelect = document.querySelector("#service-id");
const formStatus = document.querySelector("#form-status");

document.querySelector("#year").textContent = new Date().getFullYear();
const today = new Date();
document.querySelector("#appointment-date").min =
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

function formatPrice(amount, currency, locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

function updateBookingType() {
  const isHome = bookingType.value === "home";
  homeFields.hidden = !isHome;
  addressField.required = isHome;
}

bookingType.addEventListener("change", updateBookingType);
updateBookingType();

document.querySelectorAll("[data-booking-type]").forEach((link) => {
  link.addEventListener("click", () => {
    bookingType.value = link.dataset.bookingType;
    updateBookingType();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("is-open", !isOpen);
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("is-open");
  });
});

async function loadServices() {
  try {
    const response = await fetch("/api/services");
    if (!response.ok) throw new Error("Service list unavailable");
    const data = await response.json();
    const styles = data.services.filter((service) => service.category === "Hairstyle");
    const beauty = data.services.filter((service) => service.category === "Beauty service");
    serviceSelect.replaceChildren(new Option("Choose a service", ""));
    data.services.forEach((service) => {
      serviceSelect.add(new Option(`${service.name} — ${formatPrice(service.price, data.currency, data.currencyLocale)}`, service.id));
    });

    document.querySelector("#beauty-service-list").replaceChildren(
      ...beauty.map((service) => {
        const item = document.createElement("div");
        item.className = "service-item";
        const copy = document.createElement("div");
        const name = document.createElement("h3");
        name.textContent = service.name;
        const description = document.createElement("p");
        description.textContent = service.description;
        const price = document.createElement("span");
        price.textContent = formatPrice(service.price, data.currency, data.currencyLocale);
        copy.append(name, description);
        item.append(copy, price);
        return item;
      })
    );

    const groups = [
      { title: "Hairstyles", services: styles },
      { title: "Beauty services", services: beauty },
      {
        title: "Appointments & home calls",
        fees: [
          { ...data.bookingFees.salon },
          { ...data.bookingFees.home, label: `${data.bookingFees.home.label} (example)` }
        ]
      }
    ];
    document.querySelector("#price-note").textContent = data.priceNote;
    document.querySelector("#price-groups").replaceChildren(
      ...groups.map((group) => {
        const section = document.createElement("section");
        section.className = "price-group";
        const heading = document.createElement("h3");
        heading.textContent = group.title;
        const list = document.createElement("div");
        list.className = "price-list";
        const entries = group.services || group.fees;
        entries.forEach((entry) => {
          const row = document.createElement("div");
          row.className = "price-row";
          const label = document.createElement("span");
          label.textContent = entry.name || entry.label;
          const amount = document.createElement("strong");
          amount.textContent = formatPrice(entry.price, data.currency, data.currencyLocale);
          row.append(label, amount);
          list.append(row);
        });
        section.append(heading, list);
        return section;
      })
    );
  } catch {
    serviceSelect.replaceChildren(new Option("Services could not load. Please refresh and try again.", ""));
    document.querySelector("#beauty-service-list").textContent = "Please refresh the page to view beauty services.";
    document.querySelector("#price-groups").textContent = "Please refresh the page to view example prices.";
  }
}

loadServices();

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  if (!bookingForm.reportValidity()) return;

  const submitButton = bookingForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Sending request…";
  const payload = Object.fromEntries(new FormData(bookingForm).entries());

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      const detail = Array.isArray(result.details) ? ` ${result.details.join(" ")}` : "";
      throw new Error(`${result.error || "We could not send your request."}${detail}`);
    }
    formStatus.className = "form-status is-success";
    formStatus.textContent = result.message;
    bookingForm.reset();
    updateBookingType();
  } catch (error) {
    formStatus.className = "form-status is-error";
    const message = error instanceof TypeError
      ? "We could not reach the booking service. Please try again later."
      : error.message;
    formStatus.textContent = `${message} If you need help, contact hairmajesty6@gmail.com.`;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send booking request <span aria-hidden="true">↗</span>';
    formStatus.focus();
  }
});

document.querySelectorAll(".style-photo img, .hero-image-wrap img, .beauty-image img").forEach((image) => {
  image.addEventListener("error", () => {
    image.parentElement.classList.add("image-unavailable");
    image.hidden = true;
  }, { once: true });
});
