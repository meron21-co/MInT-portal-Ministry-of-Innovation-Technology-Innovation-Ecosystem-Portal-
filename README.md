                     🌿 Mint Portal
Mint Portal is a modern web-based financial management system built with React. It is designed to handle investor operations, payments, invoices, and transaction tracking in a clean, fast, and responsive dashboard interface.

The system supports role-based workflows (Investor/Admin) and provides real-time financial insights through a structured UI.

🚀 Key Features
💼 Investor Dashboard
View investments and transaction history

Track payments in real time

View detailed invoice records

Wallet-style balance overview

🧾 Invoice System
Auto-generated invoice numbers (e.g. INV-XXXXXX)

Clean formatted currency display

Payment summaries with structured breakdown

Download-ready invoice UI

💳 Payment & Transactions
Secure payment tracking from backend

Real-time transaction updates

Payment status monitoring (success/pending/failed)

⭐ Interactive UI Features
SweetAlert2 notifications for actions

Icon-based UI (React Icons)

Responsive and mobile-friendly design

Clean modern dashboard layout

🔐 Role-Based System (if enabled in backend)
Investor view

Admin management view

Conditional rendering based on user role

🧠 Tech Stack
Frontend

React.js (Create React App)

JavaScript (ES6+)

CSS3 (custom styling)

React Icons

SweetAlert2

Integration

REST API (backend connection)

JSON-based data handling

📁 Project Structure
mint-portal/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Invoice/
│   │   ├── Payment/
│   │   └── Shared UI
│   ├── image/
│   ├── App.js
│   ├── index.js
│   └── styles/
├── package.json
└── README.md
⚙️ Installation & Setup
1. Clone the project
git clone https://github.com/your-username/mint-portal.git
cd mint-portal
2. Install dependencies
npm install
3. Start development server
npm start
App runs at:

http://localhost:3000
🧪 Testing
npm test
🏗️ Production Build
npm run build
Optimized output will be generated in /build.

💡 Example Feature Logic
Invoice Number Generation
const invoiceNumber = `INV-${tx_ref?.slice(-6).toUpperCase()}`;
Currency Formatting
totalAmount.toLocaleString(undefined, {
  minimumFractionDigits: 2
});
🌐 API Integration
The frontend communicates with a backend system for:

Payments

Transactions

Investor data

Invoice records

Make sure backend server is running before full usage.

📱 Responsive Design
Mint Portal is fully responsive:

Desktop dashboard experience

Tablet-friendly layout

Mobile optimized components

🔐 Security Notes
Sensitive data should be handled in backend only

Environment variables should be used for API URLs

Never expose private keys in frontend

🚀 Deployment
Recommended platforms:

Vercel

Netlify

Firebase Hosting

👨‍💻 Developer Notes
This project focuses on:

Clean UI/UX design

Real-world financial dashboard structure

Scalable React component architecture

API-driven frontend logic

📌 Status
✔ Active development
✔ Frontend stable
⚙ Backend integration dependent