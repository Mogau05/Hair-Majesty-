require("dotenv").config();

const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const siteData = require("./data/services.json");
const { validateBooking } = require("./server/booking-validation");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, "public");
const servicesById = new Map(siteData.services.map((service) => [service.id, service]));

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.static(publicDirectory));

app.get("/api/services", (_request, response) => {
  response.json(siteData);
});

app.post(
  "/api/bookings",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many booking attempts. Please try again in a little while." }
  }),
  async (request, response) => {
    if (!request.is("application/json")) {
      return response.status(415).json({ error: "Please submit the booking form using the website." });
    }

    if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
      return response.status(400).json({ error: "Please check the booking form and try again." });
    }

    const { errors, booking } = validateBooking(request.body, new Set(servicesById.keys()));
    if (errors.length) {
      return response.status(400).json({ error: "Please check the highlighted booking details.", details: errors });
    }

    const smtpPort = Number(process.env.SMTP_PORT);
    const requiredConfiguration = [
      process.env.SMTP_HOST,
      process.env.SMTP_USER,
      process.env.SMTP_PASSWORD,
      process.env.MAIL_FROM
    ];
    if (requiredConfiguration.some((value) => !value) || !Number.isInteger(smtpPort) || smtpPort < 1) {
      return response.status(503).json({
        error: "Booking email is not set up yet. Please contact the salon by email instead."
      });
    }

    const service = servicesById.get(booking.serviceId);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const lines = [
      "New booking request (this is a request, not a confirmed appointment).",
      "",
      `Booking type: ${booking.bookingType === "home" ? "Home call" : "Salon appointment"}`,
      `Service: ${service.name}`,
      `Requested date: ${booking.appointmentDate}`,
      `Requested time: ${booking.appointmentTime}`,
      `Person receiving the service: ${booking.firstName} ${booking.lastName}`,
      `Customer email: ${booking.customerEmail}`,
      `Customer phone: ${booking.phone}`
    ];
    if (booking.bookingType === "home") {
      lines.push(`Service address: ${booking.address}`);
      if (booking.accessNotes) lines.push(`Access/location notes: ${booking.accessNotes}`);
    }
    if (booking.message) lines.push(`Special request: ${booking.message}`);

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: "hairmajesty6@gmail.com",
        replyTo: booking.customerEmail,
        subject: `New Hair Majesty booking request — ${service.name}`,
        text: lines.join("\n")
      });
      return response.status(200).json({
        message: "Your booking request email has been sent to the salon. The salon will contact you to confirm your appointment."
      });
    } catch {
      console.error("Booking email could not be sent.");
      return response.status(502).json({
        error: "We could not send your booking request. Please contact the salon at hairmajesty6@gmail.com."
      });
    }
  }
);

app.use((error, _request, response, _next) => {
  if (error.type === "entity.too.large") {
    return response.status(413).json({ error: "The booking form is too large. Please shorten your message and try again." });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return response.status(400).json({ error: "The booking form could not be read. Please try again." });
  }
  console.error("Request could not be completed.");
  return response.status(500).json({ error: "Something went wrong. Please contact the salon by email." });
});

app.listen(port, () => {
  console.log(`Hair Majesty website is running at http://localhost:${port}`);
});
