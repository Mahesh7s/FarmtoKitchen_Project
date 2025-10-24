const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const setupSocket = require('./socket/socketHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Connect to Redis with error handling
connectRedis().catch(() => {
  console.log('⚠️  Redis connection failed - continuing without cache');
});

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
 ' https://farm-to-kitchen.netlify.app/',
  'https://farmtokitchen-project.onrender.com', // Replace with your actual deployed frontend URL
  process.env.CLIENT_URL
].filter(Boolean);
//uPDATING THE URL
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Update Socket.IO CORS configuration
 
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Allow Netlify domains
      if (origin.endsWith('.netlify.app')) {
        return callback(null, true);
      }
      
      // Allow Render domains
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      
      // Check allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Socket-ID"]
  },
  transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
 
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for production
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup WebSocket
setupSocket(io);

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const shippingRoutes = require('./routes/shipping');
const uploadRoutes = require('./routes/upload');
const wishlistRoutes = require('./routes/wishlist');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contact');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Enhanced routes
app.get('/api/search', async (req, res) => {
  try {
    const { advancedSearch } = require('./config/elasticsearch');
    const results = await advancedSearch(req.query);
    res.json(results);
  } catch (error) {
    // Fallback to MongoDB search if Elasticsearch fails
    const Product = require('./models/Product');
    const products = await Product.find({
      $or: [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } }
      ]
    });
    res.json(products);
  }
});

// Push notification subscription
app.post('/api/subscribe', (req, res) => {
  try {
    const { subscribeUser } = require('./utils/pushNotifications');
    const { userId, subscription } = req.body;
    
    subscribeUser(userId, subscription);
    res.json({ message: 'Subscription successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { getProductRecommendations } = require('./utils/aiRecommendations');
    // Simple recommendations for now
    const Product = require('./models/Product');
    const products = await Product.find().limit(10);
    res.json({ recommendations: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB Connected`);
  console.log(`⚡ WebSocket real-time updates enabled`);
  console.log(`🔍 Enhanced search available`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`📧 Contact routes: /api/contact`);
  console.log(`📁 Upload routes: /api/upload`);
  console.log(`👥 User search routes: /api/auth/farmers, /api/auth/consumers`);
  console.log(`⚠️  Redis: ${process.env.REDIS_URL ? 'Configured' : 'Not configured - using memory fallback'}`);
  console.log(`🏥 Health check: /health`);
});