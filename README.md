# Hair Majesty — Own Your Crown

A responsive salon website built with HTML, CSS, browser JavaScript, and a small Express server. The server emails booking requests to Hair Majesty; it does not save bookings in a database.

> **Before publishing:** The service names and descriptions, all prices, travel fee, and currency on this site are examples. Check and replace them with Hair Majesty’s real services, prices, and currency before sharing the site with customers. A booking request is not an appointment confirmation.

## 1. Install Node.js

If Node.js is not installed, download the current **LTS** release from [nodejs.org](https://nodejs.org/), run the installer, then restart VS Code. Check the installation in a terminal:

```text
node --version
npm --version
```

The project requires Node.js 18 or newer.

## 2. Open the project in VS Code

Open the `hair-majesty` folder in VS Code using **File → Open Folder**. In VS Code, choose **Terminal → New Terminal**. Make sure the terminal is in the project folder (the folder containing `package.json`).

## 3. Install project dependencies

Run:

```text
npm install
```

## 4. Configure booking email

Copy `.env.example` to a new file named `.env` in the project folder. Fill in the SMTP settings and sender address supplied by your email provider:

```text
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
```

Use the SMTP host, port, security setting, username, password, and verified sender address from your email provider. Use `SMTP_SECURE=true` when your provider requires a direct TLS connection (commonly port 465); use `false` for STARTTLS (commonly port 587). Provider-specific setup may differ.

**Real booking emails require valid email-provider/SMTP credentials in `.env`.** The form will not send a booking email until those credentials are configured and the sender address is accepted by your provider. Without that setup, visitors receive a clear message to email the salon directly. `.env` is ignored by Git; never share it or put its values in browser code.

## 5. Start the website

Run:

```text
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the terminal window open while using the site. Stop the server with **Ctrl+C**.

For automatic server restarts during development, use `npm run dev`.

## Publish on Render

The included [`render.yaml`](./render.yaml) configures this project as a Render Node.js web service. Render builds the Express site, starts it with `npm start`, and checks that `/api/services` responds.

1. Push the project, including `render.yaml`, to the `main` branch of your GitHub repository.
2. Sign in to [Render](https://render.com/) and choose **New → Blueprint**.
3. Connect GitHub and select `Mogau05/Hair-Majesty-`.
4. Review the `hair-majesty` web service and select **Apply**. Render reads its build and start settings from `render.yaml`.
5. In the service's **Environment** settings, add the real `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM` values supplied by your email provider. The Blueprint pre-fills `SMTP_PORT=587` and `SMTP_SECURE=false`; change these if your provider requires different SMTP settings. Keep credentials in Render's environment settings, never in website files or GitHub.
6. Wait for the deploy to finish, then open the public `onrender.com` URL shown on the service page.

Booking emails will not work until valid SMTP settings have been added to Render. If you change the service names, prices, or currency, update `data/services.json`, commit the change, and push it to GitHub so Render can redeploy.

## 6. Test a booking

1. Confirm valid SMTP credentials are configured in `.env`.
2. Open the local site and fill in all required fields.
3. Choose a salon appointment or home call. Home calls also require a service address.
4. Submit the form. A success message appears only after the SMTP provider accepts the email for sending. This is a **booking request**, not confirmation of availability; the salon must contact the customer to confirm.
5. Check the inbox for `hairmajesty6@gmail.com`. The customer’s email is set as the reply-to address.

If email is not configured or sending fails, the page shows an error and the salon email address. No booking request is saved by this starter project.

Run the built-in validation tests from the project folder with:

```text
npm test
```

## How to change prices, services, and currency

Edit [`data/services.json`](./data/services.json). Each service has an `id`, `name`, `category`, `description`, and example `price`. Keep each `id` unique and use the category `Hairstyle` or `Beauty service` so the site groups it correctly. Change the `bookingFees` values to update the salon and home-call fees.

Set `currency` to a supported three-letter currency code (for example `USD`, `GBP`, or `EUR`) and `currencyLocale` to a suitable locale (for example `en-US`, `en-GB`, or `fr-FR`). Prices and currency are read from this one data file and displayed throughout the website. Update `priceNote` to keep the pricing disclaimer accurate.

## Project structure

```text
hair-majesty/
├── data/
│   └── services.json          # Editable service list, currency, and example prices
├── public/
│   ├── css/styles.css         # Responsive styling
│   ├── js/main.js             # Navigation, dynamic prices, and booking form
│   └── index.html             # Website content and accessible form
├── server/
│   └── booking-validation.js  # Shared server-side booking validation
├── test/
│   └── booking-validation.test.js
├── .env.example               # SMTP variable names (blank placeholders)
├── .gitignore
├── package.json
├── README.md
└── server.js                  # Express API and outgoing booking emails
```
