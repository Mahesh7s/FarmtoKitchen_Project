# Farm To Kitchen - Backend Setup

## Installation
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with your credentials
4. Start server: `npm run dev`

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- POST /api/auth/forgot-password - Forgot password
- POST /api/auth/reset-password - Reset password

### Products
- GET /api/products - Get all products
- POST /api/products - Create product (Farmer only)
- GET /api/products/farmer/my-products - Get farmer's products

### Orders
- POST /api/orders - Create order (Consumer)
- GET /api/orders/consumer/my-orders - Get consumer orders
- GET /api/orders/farmer/my-orders - Get farmer orders

### Admin
- GET /api/admin/dashboard/stats - Dashboard statistics
- GET /api/admin/users - Get all users

## Features Included
- ✅ User authentication & authorization
- ✅ Role-based access (Consumer, Farmer, Admin)
- ✅ Product management with image upload
- ✅ Order system with payment integration
- ✅ Real-time messaging
- ✅ Reviews and ratings
- ✅ Weather API integration
- ✅ Email notifications
- ✅ Analytics dashboard
- ✅ Admin panel