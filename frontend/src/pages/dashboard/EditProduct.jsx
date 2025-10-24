import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, uploadAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    inventory: {
      quantity: '',
      unit: 'kg'
    },
    isOrganic: false,
    isSeasonal: false,
    isAvailable: true,
    tags: [],
    images: []
  });

  const categories = [
    'vegetables', 'fruits', 'dairy', 'grains', 'meat', 'poultry', 'herbs', 'other'
  ];

  const units = ['kg', 'lb', 'piece', 'bunch', 'dozen', 'pack'];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      const productData = response.data;
      setProduct(productData);
      setFormData({
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price.toString(),
        inventory: {
          quantity: productData.inventory.quantity.toString(),
          unit: productData.inventory.unit
        },
        isOrganic: productData.isOrganic,
        isSeasonal: productData.isSeasonal,
        isAvailable: productData.isAvailable,
        tags: productData.tags || [],
        images: productData.images || []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      showError('Failed to load product');
      navigate('/farmer/products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('inventory.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [field]: type === 'number' ? parseFloat(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.image(file));
      const responses = await Promise.all(uploadPromises);
      
      // Use the same structure as AddProduct component
      const newImages = responses.map(response => {
        // Check both possible response structures
        const imageData = response.data;
        return {
          url: imageData.imageUrl || imageData.url,
          public_id: imageData.publicId || imageData.public_id,
          // Include additional fields if they exist
          ...(imageData.thumbnailUrl && { thumbnailUrl: imageData.thumbnailUrl }),
          ...(imageData.fileName && { fileName: imageData.fileName }),
          ...(imageData.size && { size: imageData.size })
        };
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
      showSuccess('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API - ensure it matches the structure expected by your backend
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: {
          quantity: parseFloat(formData.inventory.quantity),
          unit: formData.inventory.unit
        },
        // Ensure images have the correct structure
        images: formData.images.map(img => ({
          url: img.url,
          public_id: img.public_id
          // Remove any extra fields that might not be in your schema
        }))
      };

      await productsAPI.update(id, submitData);
      showSuccess('Product updated successfully');
      navigate('/farmer/products');
    } catch (error) {
      console.error('Error updating product:', error);
      showError(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/farmer/products')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Product
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update your product information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-vertical"
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pricing & Inventory
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="inventory.quantity"
                  value={formData.inventory.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit *
                </label>
                <select
                  name="inventory.unit"
                  value={formData.inventory.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Features
            </h2>
            
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Organic</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isSeasonal"
                  checked={formData.isSeasonal}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Seasonal</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 transition-colors"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Images
            </h2>
            
            {/* Current Images */}
            {formData.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Current Images ({formData.images.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {formData.images.length === 0 ? 'Upload Images *' : 'Add More Images'}
              </label>
              
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                uploading 
                  ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400 mb-2"></div>
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              
              {uploading && (
                <p className="text-sm text-primary-600 dark:text-primary-400 mt-2 text-center">
                  Uploading images...
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 sm:space-y-0 space-x-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.images.length === 0}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;