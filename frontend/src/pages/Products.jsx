import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import { productsAPI } from '../services/api';
import {  
  Search, 
  Filter, 
  SlidersHorizontal, 
  ShoppingCart,
  Star,
  MapPin,
  Leaf,
  RefreshCw,
  Heart
} from 'lucide-react';

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    organic: false,
    seasonal: false,
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();

  const categories = [
    'vegetables', 'fruits', 'dairy', 'grains', 'meat', 'poultry', 'herbs', 'other'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log('Products updated:', products.length);
    filterProducts();
  }, [products, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching products...');
      
      const response = await productsAPI.getAll();
      console.log('API Response:', response);
      
      // FIX: Handle different response structures
      let productsData = [];
      if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Invalid products data format');
      }
      
      console.log('Products data:', productsData);
      setProducts(productsData);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      showError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    console.log('Filtering products...', {
      totalProducts: products.length,
      searchTerm,
      filters
    });

    let filtered = [...products]; // Create a copy to avoid mutation

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        const matchesFarmer = product.farmer?.farmName?.toLowerCase().includes(searchLower);
        
        return matchesName || matchesDescription || matchesFarmer;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Organic filter
    if (filters.organic) {
      filtered = filtered.filter(product => product.isOrganic === true);
    }

    // Seasonal filter
    if (filters.seasonal) {
      filtered = filtered.filter(product => product.isSeasonal === true);
    }

    // Price filter - handle empty strings and convert to numbers
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(product => product.price >= minPrice);
      }
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(product => product.price <= maxPrice);
      }
    }

    console.log('Filtered products:', filtered.length);
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showSuccess(`${product.name} added to cart!`);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      organic: false,
      seasonal: false,
      minPrice: '',
      maxPrice: ''
    });
    setSearchTerm('');
  };

  const retryFetch = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <RefreshCw className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to load products
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button onClick={retryFetch} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fresh Farm Products
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover the finest produce from local farmers
          </p>
        </motion.div>

        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Debug: {products.length} total products, {filteredProducts.length} filtered
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, farmers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full input-field"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="flex-1 input-field"
                        min="0"
                        step="0.01"
                      />
                      <span className="flex items-center text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="flex-1 input-field"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.organic}
                        onChange={(e) => setFilters({ ...filters, organic: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Organic Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.seasonal}
                        onChange={(e) => setFilters({ ...filters, seasonal: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Seasonal Only</span>
                    </label>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchTerm || Object.values(filters).some(filter => filter)) && (
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm || Object.values(filters).some(filter => filter) 
                ? 'Try adjusting your search or filters' 
                : 'No products available at the moment'
              }
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              {searchTerm || Object.values(filters).some(filter => filter) ? 'Clear Filters' : 'Refresh'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card group hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || '/api/placeholder/300/200'}
                      alt={product.name}
                      className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Top Bar - Favorite, Price, and Badges */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
                      {/* Left Side - Badges */}
                      <div className="flex flex-col gap-3">
                        {/* First Row - Organic and Seasonal */}
                        <div className="flex gap-2">
                          {product.isOrganic && (
                            <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-lg">
                              <Leaf className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              Organic
                            </span>
                          )}
                          {product.isSeasonal && (
                            <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                              Seasonal
                            </span>
                          )}
                        </div>
                        
                        {/* Second Row - Additional badges */}
                        {(product.isNew || product.isFeatured) && (
                          <div className="flex gap-2">
                            {product.isNew && (
                              <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                                New
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="bg-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                                Featured
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Side - Favorite and Price */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(product._id)}
                          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favorites.has(product._id) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-600 dark:text-gray-300'
                            }`} 
                          />
                        </button>
                        
                        {/* Price Badge */}
                        <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
                          ${product.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Farmer Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {product.farmer?.farmName || 'Local Farm'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {product.rating?.average || '4.5'}
                        </span>
                      </div>
                    </div>

                    {/* Inventory Status */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        product.inventory?.quantity > 10 
                          ? 'text-green-600' 
                          : product.inventory?.quantity > 0 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                      }`}>
                        {product.inventory?.quantity > 10 
                          ? 'In Stock' 
                          : product.inventory?.quantity > 0 
                            ? `Only ${product.inventory?.quantity} left` 
                            : 'Out of Stock'
                        }
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {product.inventory?.quantity || 0} {product.inventory?.unit || 'unit'}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inventory?.quantity || product.inventory?.quantity === 0}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        {!product.inventory?.quantity || product.inventory?.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardProducts;