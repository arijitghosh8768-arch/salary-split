# 💰 SalarySplit — Personal Salary Allocation Dashboard

> *"Give every rupee a job."*

`SalarySplit` is a security-hardened, full-stack personal salary allocation dashboard designed around the **35/25/10/15/15 financial rule** (*Home, Investment, Emergency, Car/Travel, Personal*). It transitions simple salary calculation into an interactive budget management, goal tracking, and security audit system.

---

## 🌟 Core Features

1. **🧮 Salary Allocation Calculator & Custom Rule Engine**:
   - Automatically splits monthly salary (e.g. ₹50,000 → Home ₹17,500, Investment ₹12,500, Emergency ₹5,000, Travel ₹7,500, Personal ₹7,500).
   - Allows users to customize rule percentages (e.g., 30/30/10/10/20) with live server-side validation that total equals 100%.

2. **📊 Visual Interactive Dashboard**:
   - Donut/Pie breakdown chart, Target vs Actual bar chart, and individual category cards.
   - Live remaining unspent balance tracking.

3. **📝 Budget & Actual Expense Tracking**:
   - Log expenses with category picker, date, subcategory, and description.
   - Dynamic progress bars showing percentage spent vs allocated target per category.

4. **📈 Investment Portfolio Module**:
   - Track SIPs, Mutual Funds, Stocks, ETFs, Gold, and Fixed Deposits against the monthly 25% allocation target.

5. **🛟 Emergency Fund Module**:
   - Calculates 6-month safety net goal based on monthly essential expenses (e.g., ₹20,000 × 6 = ₹1,20,000).
   - Shows progress percentage and estimated timeframe to full fund completion.

6. **🚗 Car / Travel / Goal Buckets**:
   - Create goal buckets (e.g., New Bike ₹1,20,000, Goa Trip ₹30,000).
   - Automated timeline projection (`(target - current) / monthly_contribution`).

7. **📜 Monthly History & Behavior Trends**:
   - Historical monthly tables and salary growth vs spending trajectory charts.

8. **🔐 Cybersecurity & Audit Shield**:
   - Password hashing (Argon2 / Bcrypt), JWT authentication, express-rate-limit brute force defense, Helmet security headers, 100% parameterized SQL queries, and live Security Audit Logs.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- **Node.js**: v18+ installed

### 1. Run Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` with SQLite WAL mode database initialized automatically.*

### 2. Run Frontend App
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000` with Vite live reloading.*

---

## 📂 Project Structure

```text
SalarySplit/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth, Salary, Expense, Goal, Investment, Analytics controllers
│   │   ├── db/               # Database connection & SQL schema initialization
│   │   ├── middleware/       # JWT Auth, Rate limiting, Audit logger
│   │   ├── routes/           # Express REST endpoints
│   │   └── utils/            # Calculation engine & rule validators
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, BudgetRuleModal, Cards
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Dashboard, Expenses, Investments, EmergencyFund, Goals, History, Security
│   │   ├── services/         # Axios API client
│   │   └── utils/            # Formatters (INR currency)
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── architecture.md
│   └── security.md
│
└── README.md
```
