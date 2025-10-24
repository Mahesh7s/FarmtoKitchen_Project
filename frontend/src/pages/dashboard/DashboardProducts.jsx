import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../hooks/useToast';
import { productsAPI } from '../../services/api';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  ShoppingCart,
  Star,
  MapPin,
  Leaf,
  ShoppingBag,
  Heart,
  X
} from 'lucide-react';

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    organic: false,
    seasonal: false,
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const categories = [
    'vegetables', 'fruits', 'dairy', 'grains', 'meat', 'poultry', 'herbs', 'other'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      let productsData = [];
      if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        const matchesFarmer = product.farmer?.farmName?.toLowerCase().includes(searchLower);
        return matchesName || matchesDescription || matchesFarmer;
      });
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    if (filters.organic) {
      filtered = filtered.filter(product => product.isOrganic === true);
    }
    if (filters.seasonal) {
      filtered = filtered.filter(product => product.isSeasonal === true);
    }
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

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showSuccess(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = async (product) => {
    try {
      if (isInWishlist(product._id)) {
        const result = await removeFromWishlist(product._id);
        if (result.success) {
          showSuccess(`${product.name} removed from wishlist`);
        } else {
          showError(result.message);
        }
      } else {
        const result = await addToWishlist(product._id);
        if (result.success) {
          showSuccess(`${product.name} added to wishlist`);
        } else {
          showError(result.message);
        }
      }
    } catch (error) {
      showError('Failed to update wishlist');
    }
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

  const handleViewCart = () => {
    navigate('/consumer/cart'); // Fixed navigation path
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-1xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fresh Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Discover amazing farm-fresh products from local farmers
          </p>
        </div>
        <button
          onClick={handleViewCart}
          className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">View Cart</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search products, farmers, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range ($)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    />
                    <span className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.organic}
                      onChange={(e) => setFilters({ ...filters, organic: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Organic Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.seasonal}
                      onChange={(e) => setFilters({ ...filters, seasonal: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Seasonal Only</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {(searchTerm || Object.values(filters).some(filter => filter && filter !== '')) && (
          <button
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 sm:h-10 sm:h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={clearFilters}
            className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/api/placeholder/300/200'}
                    alt={product.name}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      isInWishlist(product._id)
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                        : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 hover:text-red-500 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-md'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} 
                    />
                  </button>

                  {/* Product Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isOrganic && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit shadow-md">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </span>
                    )}
                    {product.isSeasonal && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                        Seasonal
                      </span>
                    )}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
                      ${product.price}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 text-base sm:text-lg">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Farmer and Rating Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                        {product.farmer?.farmName || 'Local Farm'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {product.rating?.average || '4.5'}
                      </span>
                    </div>
                  </div>

                  {/* Inventory Info */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-medium ${
                      product.inventory?.quantity > 10 
                        ? 'text-green-600 dark:text-green-400' 
                        : product.inventory?.quantity > 0 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {product.inventory?.quantity > 10 
                        ? 'In Stock' 
                        : product.inventory?.quantity > 0 
                          ? `Only ${product.inventory?.quantity} left` 
                          : 'Out of Stock'
                      }
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.inventory?.quantity || 0} {product.inventory?.unit || 'unit'}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inventory?.quantity || product.inventory?.quantity === 0}
                    className="w-full bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm sm:text-base">
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
  );
};

export default DashboardProducts;