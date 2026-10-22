const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBooking(input, serviceIds) {
  const errors = [];
  const requiredText = (field, label, maxLength = 200) => {
    const value = typeof input[field] === "string" ? input[field].trim() : "";
    if (!value) {
      errors.push(`${label} is required.`);
    } else if (value.length > maxLength) {
      errors.push(`${label} must be ${maxLength} characters or fewer.`);
    }
    return value;
  };

  const bookingType = input.bookingType;
  if (!["salon", "home"].includes(bookingType)) {
    errors.push("Choose a valid booking type.");
  }

  const serviceId = requiredText("serviceId", "A hairstyle or beauty service", 100);
  if (serviceId && !serviceIds.has(serviceId)) {
    errors.push("Choose a service from the list.");
  }

  const appointmentDate = requiredText("appointmentDate", "Appointment date");
  const appointmentTime = requiredText("appointmentTime", "Appointment time");
  if (appointmentDate && !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    errors.push("Enter a valid appointment date.");
  } else if (appointmentDate) {
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      errors.push("Enter a valid appointment date.");
    } else {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (appointmentDate < today) errors.push("Appointment date cannot be in the past.");
    }
  }
  if (appointmentTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
    errors.push("Enter a valid appointment time.");
  }

  const firstName = requiredText("firstName", "First name", 80);
  const lastName = requiredText("lastName", "Last name", 80);
  const customerEmail = requiredText("customerEmail", "Email address", 254);
  if (customerEmail && !EMAIL_PATTERN.test(customerEmail)) {
    errors.push("Enter a valid email address.");
  }
  const phone = requiredText("phone", "Phone number", 40);
  if (phone && !/^[+()\d\s.-]{7,40}$/.test(phone)) {
    errors.push("Enter a valid phone number.");
  }

  const address = typeof input.address === "string" ? input.address.trim() : "";
  const accessNotes = typeof input.accessNotes === "string" ? input.accessNotes.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (bookingType === "home" && !address) {
    errors.push("Service address is required for a home call.");
  }
  if (address.length > 300) errors.push("Service address must be 300 characters or fewer.");
  if (accessNotes.length > 500) errors.push("Access notes must be 500 characters or fewer.");
  if (message.length > 1000) errors.push("Special request must be 1000 characters or fewer.");

  return {
    errors,
    booking: {
      bookingType,
      serviceId,
      appointmentDate,
      appointmentTime,
      firstName,
      lastName,
      customerEmail,
      phone,
      address,
      accessNotes,
      message
    }
  };
}

module.exports = { validateBooking };
