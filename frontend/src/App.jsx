import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MessageProvider } from './context/MessageContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ConsumerDashboard from './pages/dashboard/ConsumerDashboard';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/dashboard/Wishlist';
import Settings from './pages/dashboard/Settings';
import OrderDetail from './pages/OrderDetail';
import Messages from './pages/Messages';
import FarmerProducts from './pages/dashboard/FarmerProducts';
import FarmerAnalytics from './pages/dashboard/FarmerAnalytics';
import FarmerCustomers from './pages/dashboard/FarmerCustomers';
import FarmerSettings from './pages/dashboard/FarmerSettings';
import AddProduct from './pages/dashboard/AddProduct';
import DashboardProducts from './pages/dashboard/DashboardProducts';
import EditProduct from './pages/dashboard/EditProduct';
import ProductDetailStandalone from './pages/ProductDetailStandalone';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SocketProvider>
            <MessageProvider>
              <Router>
                <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <Routes>
                    {/* Public routes with navbar & footer */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/:id" element={<ProductDetail />} />
                    </Route>

                    {/* Auth routes without navbar & footer */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Standalone product view route */}
                    <Route 
                      path="/product-standalone/:id" 
                      element={<ProductDetailStandalone />} 
                    />

                    {/* Protected consumer routes */}
                    <Route 
                      path="/consumer" 
                      element={
                        <ProtectedRoute requiredRole="consumer">
                          <ConsumerDashboard />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/consumer/orders" replace />} />
                      <Route path="products" element={<DashboardProducts />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="orders/:id" element={<OrderDetail />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="messages" element={<Messages />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Protected farmer routes */}
                    <Route 
                      path="/farmer" 
                      element={
                        <ProtectedRoute requiredRole="farmer">
                          <FarmerDashboard />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<div>Farmer Overview</div>} />
                      <Route path="products" element={<FarmerProducts />} />
                      <Route path="products/new" element={<AddProduct />} />
                      <Route path="products/:id/edit" element={<EditProduct />} />
                      <Route path="orders/:id" element={<OrderDetail />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="messages" element={<Messages />} />
                      <Route path="analytics" element={<FarmerAnalytics />} />
                      <Route path="customers" element={<FarmerCustomers />} />
                      <Route path="settings" element={<FarmerSettings />} />
                    </Route>

                    {/* Protected admin routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Redirect based on role */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Navigate to="/consumer/orders" replace />
                        </ProtectedRoute>
                      } 
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </div>
              </Router>
            </MessageProvider>
          </SocketProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;