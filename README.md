# 💰 PocketExpense+ - Expense Tracking App

A full-stack React Native expense tracking application with spending insights and offline support.

## 📁 Project Structure

```
pocket-expense-plus/
├── backend/          # Node.js + Express + MongoDB
│   ├── models/       # Database models (User, Expense)
│   ├── routes/       # API routes (auth, expenses)
│   ├── middleware/   # Authentication middleware
│   ├── utils/        # Helper functions
│   └── server.js     # Main server file
├── frontend/         # React Native (Expo)
│   ├── context/      # React Context (Auth, Expense)
│   ├── screens/      # Screen components
│   ├── navigation/   # Navigation setup
│   └── utils/        # API, config, offline sync
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- Expo CLI

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pocket-expense
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start MongoDB and run server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `utils/config.ts` if needed (defaults to `http://localhost:5000/api`)

4. Start the app:
```bash
npm start
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- REST APIs

**Frontend:**
- React Native (Expo)
- TypeScript
- React Navigation
- Context API
- AsyncStorage (Offline Support)

## 📋 Features

- User Authentication (Register/Login with JWT)
- Add/Edit/Delete Expenses
- View Expense List with categories and payment methods
- Category-wise Breakdown
- Monthly Spending Insights
- Offline Support (save expenses locally, sync when online)

**Categories:** Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other  
**Payment Methods:** Cash, Card, UPI, Online, Other

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses (Protected - requires JWT token)
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/expenses/stats/daily?date=YYYY-MM-DD` - Daily summary
- `GET /api/expenses/stats/monthly?year=2024&month=1` - Monthly summary
- `GET /api/expenses/stats/categories` - Category breakdown
- `GET /api/expenses/stats/insights` - Monthly comparison insights

## 📱 App Screens

1. **Login Screen** - User authentication with email and password
2. **Register Screen** - Create new user account
3. **Home Screen** - List of all expenses with category icons and payment methods
4. **Add Expense Screen** - Create new expense with custom dropdowns
5. **Edit Expense Screen** - Update or delete existing expense
6. **Insights Screen** - Monthly spending comparison and category breakdown



## 🔐 Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pocket-expense
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Frontend:**
Update `utils/config.ts` with your backend URL if needed (defaults to `http://localhost:5000/api`).

## 🎯 Key Implementation Details

### Authentication
- JWT-based authentication with secure token storage
- Protected routes with authentication middleware

### State Management
- React Context API for global state (Auth, Expenses)
- Automatic data synchronization

### Offline Support
- Expenses saved locally using AsyncStorage
- Automatic sync when connection is restored




### Pocket Expense Plus App Screenshots
<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/0f67d3bf-3831-4bf5-8a18-12894a8a499d" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/fecb1818-63a3-4d60-bfcd-9b6e296a33c5" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/112e1ac5-824a-4c91-bf42-5844d092162d" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/3ca43c49-cd8a-4fd4-9ddd-f6fb66a981af" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/d9fb13e0-1032-402e-b1f1-d145e846709c" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/197db111-c628-4c11-9b1b-edbf4c4b22ea" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/ab7a7c53-000a-40ef-804a-810b41b672c3" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/0f187ab7-4d39-4a77-bb83-28ed2e2c0976" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/a8a7bb67-6d55-42ae-ae32-67efaa6cb650" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/f0036d9c-66c8-4d10-a9b7-c99af909e4db" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/d6094cb2-6635-4e91-9cdb-690b8db995c5" />

<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/3f7f6955-6adb-4ccb-8b5e-6b16b48fe329" />
<img width="404" height="830" alt="image" src="https://github.com/user-attachments/assets/d955a4fc-831a-4971-9f3a-9109dd1a4580" />
















*Above: Preview of Pocket Expense Plus UI, showing Home, Add Expense, and Insights screens.*
