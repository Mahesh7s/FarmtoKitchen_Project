import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  ArrowLeft, 
  Star, 
  MapPin, 
  Leaf,
  Calendar,
  Tag,
  BarChart3,
  MoreVertical,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [viewingProduct, setViewingProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getFarmerProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ isOpen: true, product });
    setMobileMenuOpen(null);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const deleteProduct = async () => {
    if (!deleteModal.product) return;

    try {
      await productsAPI.delete(deleteModal.product._id);
      
      setProducts(products.filter(p => p._id !== deleteModal.product._id));
      
      if (viewingProduct && viewingProduct._id === deleteModal.product._id) {
        setViewingProduct(null);
      }
      
      showSuccess('Product deleted successfully');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Failed to delete product. Please try again.');
    }
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setMobileMenuOpen(null);
  };

  const handleBackToProducts = () => {
    setViewingProduct(null);
  };

  const toggleMobileMenu = (productId) => {
    setMobileMenuOpen(mobileMenuOpen === productId ? null : productId);
  };

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isAvailable) ||
                         (filterStatus === 'inactive' && !product.isAvailable);
    return matchesSearch && matchesStatus;
  });

  // Product Detail View
  if (viewingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6 p-4 sm:p-6">
          <ConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={closeDeleteModal}
            onConfirm={deleteProduct}
            title="Delete Product"
            message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
            confirmText="Delete Product"
            type="danger"
          />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToProducts}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={`/farmer/products/${viewingProduct._id}/edit`}
                className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Product</span>
              </Link>
              <button
                onClick={() => openDeleteModal(viewingProduct)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Product Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                  <img
                    src={viewingProduct.images?.[0]?.url || '/api/placeholder/600/400'}
                    alt={viewingProduct.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
                  />
                </div>
                
                {/* Additional Images Grid */}
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {viewingProduct.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`${viewingProduct.name} ${index + 2}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {viewingProduct.isOrganic && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center border border-green-200 dark:border-green-800">
                      <Leaf className="h-4 w-4 mr-1.5" />
                      Organic
                    </span>
                  )}
                  {viewingProduct.isSeasonal && (
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1.5 rounded-full text-sm font-medium flex items-center border border-orange-200 dark:border-orange-800">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Seasonal
                    </span>
                  )}
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium capitalize flex items-center border border-blue-200 dark:border-blue-800">
                    <Tag className="h-4 w-4 mr-1.5" />
                    {viewingProduct.category}
                  </span>
                </div>

                {/* Product Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {viewingProduct.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    SKU: {viewingProduct.sku || 'N/A'}
                  </p>
                </div>

                {/* Price and Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                      ${viewingProduct.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                      per {viewingProduct.inventory.unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {viewingProduct.rating?.average || '4.5'}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      ({viewingProduct.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {viewingProduct.description}
                  </p>
                </div>

                {/* Inventory Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Inventory</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingProduct.inventory.quantity} {viewingProduct.inventory.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Min Stock</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingProduct.inventory.minStock || 0} {viewingProduct.inventory.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                        <div className="flex items-center space-x-2">
                          {viewingProduct.isAvailable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            viewingProduct.isAvailable 
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {viewingProduct.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Featured</span>
                        <span className={`text-sm font-medium ${
                          viewingProduct.isFeatured 
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {viewingProduct.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                    From Your Farm
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg font-semibold text-white">
                        {viewingProduct.farmer?.farmName?.charAt(0) || 'F'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        {viewingProduct.farmer?.farmName || 'My Farm'}
                      </p>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{viewingProduct.farmer?.farmLocation?.city || 'City'}, {viewingProduct.farmer?.farmLocation?.state || 'State'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your products...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start by adding your first product to showcase on the marketplace.
            </p>
            <Link 
              to="/farmer/products/new" 
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Products List View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-6 p-4 sm:p-6">
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteProduct}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
          confirmText="Delete Product"
          type="danger"
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Products
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your product listings and inventory ({filteredProducts.length} products)
            </p>
          </div>
          <Link
            to="/farmer/products/new"
            className="btn-primary flex items-center space-x-2 px-4 py-2.5 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Desktop Table View */}
          {viewMode === 'table' && (
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Product</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Price</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Stock</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product._id} 
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.images?.[0]?.url || '/api/placeholder/60/60'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {product.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-primary-600 dark:text-primary-400">
                          ${product.price}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          per {product.inventory.unit}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {product.inventory.quantity} {product.inventory.unit}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Min: {product.inventory.minStock || 0}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isAvailable 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {product.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                          {product.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/farmer/products/${product._id}/edit`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product._id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={product.images?.[0]?.url || '/api/placeholder/60/60'}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {product.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-bold text-primary-600 dark:text-primary-400">
                              ${product.price}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              /{product.inventory.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.inventory.quantity}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isAvailable 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {product.isAvailable ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <Link
                        to={`/farmer/products/${product._id}/edit`}
                        className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredProducts.map((product) => (
              <div 
                key={product._id}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <img
                      src={product.images?.[0]?.url || '/api/placeholder/60/60'}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {product.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          ${product.price}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          /{product.inventory.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => toggleMobileMenu(product._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen === product._id && (
                      <div className="absolute right-0 top-10 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        <Link
                          to={`/farmer/products/${product._id}/edit`}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Product</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Product</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.inventory.quantity}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {product.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerProducts;