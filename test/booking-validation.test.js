const test = require("node:test");
const assert = require("node:assert/strict");
const { validateBooking } = require("../server/booking-validation");

const serviceIds = new Set(["silk-press", "makeup"]);

function validBooking(overrides = {}) {
  return {
    bookingType: "salon",
    serviceId: "silk-press",
    appointmentDate: "2099-08-18",
    appointmentTime: "14:30",
    firstName: "Taylor",
    lastName: "Example",
    customerEmail: "taylor@example.com",
    phone: "+1 555 123 4567",
    address: "",
    accessNotes: "",
    message: "",
    ...overrides
  };
}

test("accepts a valid salon booking", () => {
  const result = validateBooking(validBooking(), serviceIds);
  assert.deepEqual(result.errors, []);
  assert.equal(result.booking.serviceId, "silk-press");
});

test("requires an address for a home call", () => {
  const result = validateBooking(validBooking({ bookingType: "home" }), serviceIds);
  assert.ok(result.errors.includes("Service address is required for a home call."));
});

test("rejects unknown services, invalid email, and invalid time", () => {
  const result = validateBooking(validBooking({
    serviceId: "unknown",
    customerEmail: "not-an-email",
    appointmentTime: "25:99"
  }), serviceIds);
  assert.ok(result.errors.includes("Choose a service from the list."));
  assert.ok(result.errors.includes("Enter a valid email address."));
  assert.ok(result.errors.includes("Enter a valid appointment time."));
});

test("rejects dates in the past", () => {
  const result = validateBooking(validBooking({ appointmentDate: "2000-01-01" }), serviceIds);
  assert.ok(result.errors.includes("Appointment date cannot be in the past."));
});
