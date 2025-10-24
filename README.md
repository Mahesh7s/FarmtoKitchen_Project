# Farm to Kitchen - Full Stack Application

Farm to Kitchen is a comprehensive full-stack web application that connects local farmers directly with consumers. The platform enables farmers to showcase and sell their fresh produce while allowing consumers to browse, purchase, and communicate directly with farmers in real-time.

**Live Demo:** [https://farm-to-kitchen.netlify.app](https://farm-to-kitchen.netlify.app)

---

## 📋 Project Overview

Farm to Kitchen aims to streamline the connection between farmers and consumers by providing a multi-role system, real-time messaging, product management, payment integration, and order tracking—all in a responsive and user-friendly interface.

---

## 🎯 Key Features

- Multi-role System (Consumer, Farmer, Admin)
- Real-time Messaging with WebSocket support
- Product Management with image uploads
- Shopping Cart & Checkout with Stripe integration
- Order Management with status tracking
- User Authentication & Authorization
- Responsive Design for all devices
- Dark/Light Mode support

---

## 🚀 Frontend

### 🛠️ Tools & Technologies
- **React** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling and UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### 📁 Project Structure
frontend/
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page components
│ ├── context/ # React context providers
│ ├── services/ # API service functions
│ ├── hooks/ # Custom React hooks
│ └── utils/ # Utility functions
├── public/ # Static assets
└── dist/ # Build output

### ⚙️ Setup Instructions

1. Navigate to frontend directory:
  cd frontend
2. Install dependencies:
    npm install
3. Create a .env file in the frontend directory and configure your environment variables:

VITE_API_BASE_URL=https://farmtokitchen-backend url/api
VITE_API_URL=https://farmtokitchen-backend url/api
VITE_SOCKET_URL=https://farmtokitchen-backend url/api
4.Run development server:
  npm run dev
-->Deployed Frontend URL: https://farm-to-kitchen.netlify.app


# Backend
🛠️ Tools & Technologies

Node.js - Runtime environment

Express.js - Web framework

MongoDB - Database

Mongoose - ODM for MongoDB

JWT - Authentication

Socket.IO - Real-time communication

Cloudinary - Image storage

Stripe - Payment processing

Nodemailer - Email service

Bcrypt - Password hashing

CORS - Cross-origin resource sharing

📁 Project Structure
backend/
├── config/          # Database and external service configs
├── controllers/     # Route controllers
├── models/          # MongoDB models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── socket/          # Socket.IO handlers

⚙️ Setup Instructions

1. Navigate to backend directory:
   cd backend
2. Install dependencies:
   npm install
3. Create a .env file in the backend directory and configure environment variables:
   # Server Configuration
PORT=3000
NODE_ENV=development

  Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

 Authentication
JWT_SECRET=your_jwt_secret_key

 Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

  Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

  Payment (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

  External APIs
WEATHER_API_KEY=your_weather_api_key

 Frontend URL (for CORS)
CLIENT_URL=https://farm-to-kitchen.netlify.app

 Redis (Optional)
REDIS_URL=redis://localhost:6379

  Push Notifications (Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
4.Start production server:
 npm start
