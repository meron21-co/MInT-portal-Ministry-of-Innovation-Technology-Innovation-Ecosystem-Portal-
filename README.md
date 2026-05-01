# MINT

> Explore and invest in projects — seamlessly.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## About

MINT is a full-stack web platform for exploring and investing in projects. It features a clean user-facing interface and a powerful admin dashboard for managing projects, users, and payments — all powered by a REST API backend.

---

## Features

- User authentication — register, login, and session management
- Project listing with detailed views per project
- Investment system with payment processing via **Chapa**
- Admin dashboard to manage users, projects, and transactions
- Fully responsive design for mobile and desktop

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, JavaScript, CSS |
| Backend | Node.js, Express.js, MongoDB |
| Tools & Integrations | REST API, Chapa, Git & GitHub |

---

## Project Structure

```
MINT/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── controllers/
├── mint-portal/        # frontend
│   ├── src/
│   └── public/
├── README.md
└── package.json
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MINT.git
cd MINT
```

### 2. Set up environment variables

Create a `.env` file inside the `/backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
CHAPA_SECRET_KEY=your_chapa_key
PORT=5000
```

### 3. Start the backend

```bash
cd backend
npm install
npm start
```

### 4. Start the frontend

```bash
cd mint-portal
npm install
npm start
```

---

## Usage

1. Open `http://localhost:3000` in your browser
2. Create an account or log in to an existing one
3. Browse available projects and view their details
4. Invest in a project using the integrated Chapa payment system
5. Admins can log into the dashboard to manage users and projects

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE) © 2025 MINT Project
