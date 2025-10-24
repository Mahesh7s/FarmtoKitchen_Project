import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { productsAPI, reviewsAPI } from '../services/api';
import { 
  Star, 
  MapPin, 
  Leaf, 
  Calendar,
  Truck,
  Shield,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Heart
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
      fetchRelatedProducts(response.data.category);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getFarmerReviews(product?.farmer?._id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await productsAPI.getAll({ category, limit: 4 });
      setRelatedProducts(response.data.products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart');
      navigate('/login');
      return;
    }

    addToCart(product, quantity);
    showSuccess(`${quantity} ${product.name} added to cart!`);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.inventory.quantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </motion.button>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <img
                src={product.images?.[activeImage]?.url || '/api/placeholder/600/400'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      activeImage === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isOrganic && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Leaf className="h-4 w-4 mr-1" />
                  Organic
                </span>
              )}
              {product.isSeasonal && (
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                  Seasonal
                </span>
              )}
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary-600">${product.price}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">per {product.inventory.unit}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {product.rating?.average || '4.5'}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({product.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Farmer Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">From the Farm</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600">
                    {product.farmer?.farmName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.farmer?.farmName}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{product.farmer?.farmLocation?.city}, {product.farmer?.farmLocation?.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.inventory.quantity} {product.inventory.unit} available
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-lg font-medium w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.inventory.quantity}
                    className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory.quantity === 0}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {product.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </button>

                <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Free Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Fresh Daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Locally Grown</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct._id}`}
                  className="card group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={relatedProduct.images?.[0]?.url || '/api/placeholder/300/200'}
                      alt={relatedProduct.name}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-primary-600 font-semibold text-sm">${relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;