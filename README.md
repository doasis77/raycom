# Raycom Web Dialer

A web-based SIP dialer and billing platform with an Express.js backend and PostgreSQL database.

## Features

- **Web dialer** — make calls from the browser using SIP.js
- **Billing page** — view and manage billing records
- **Live chat** — real-time chat interface
- **REST API** — Express backend with PostgreSQL storage

## Project Structure

```
raycom/
├── index.html          # Web dialer UI
├── bill.html           # Billing interface
├── try/
│   └── live chat.html  # Live chat page
└── backend/
    ├── server.js       # Express API server
    ├── sip.js          # SIP configuration
    └── package.json
```

## Setup

### Backend

```bash
cd backend
npm install
npm start
```

The server runs on port **7050** by default.

Configure your PostgreSQL connection via environment variables before running in production (do not commit credentials).

### Frontend

Open `index.html` in a browser, or serve the project with any static file server.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, SIP.js
- **Backend:** Node.js, Express, PostgreSQL

## Author

[doasis77](https://github.com/doasis77)
