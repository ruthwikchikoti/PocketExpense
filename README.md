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

## 🧪 Testing

1. Start MongoDB (local or use MongoDB Atlas)
2. Start backend server (`cd backend && npm start`)
3. Run frontend app (`cd frontend && npm start`)
4. Register a new user account
5. Add expenses with different categories
6. View insights screen for spending analytics
7. Test offline mode by disconnecting internet and adding expenses

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




###Pocket Expense Plus App Screenshots


*Above: Preview of Pocket Expense Plus UI, showing Home, Add Expense, and Insights screens.*
