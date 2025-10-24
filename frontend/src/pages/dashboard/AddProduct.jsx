import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { productsAPI, uploadAPI } from '../../services/api';
import { Plus, X, Upload, Save, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const AddProduct = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    inventory: {
      quantity: '',
      unit: 'kg'
    },
    isOrganic: false,
    isSeasonal: false,
    isAvailable: true,
    tags: []
  });
  
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Categories and units data
  const categories = [
    'vegetables', 'fruits', 'dairy', 'grains', 'meat', 'poultry', 'herbs', 'other'
  ];

  const units = ['kg', 'g', 'lb', 'oz', 'piece', 'bunch', 'dozen', 'pack'];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('inventory.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [field]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle image upload with progress tracking
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (files.length + images.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        showError(`${file.name} is not a valid image file`);
        return false;
      }
      
      if (!isValidSize) {
        showError(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setLoading(true);
      
      // Upload files sequentially with progress tracking
      const newImages = [];
      for (const [index, file] of validFiles.entries()) {
        try {
          // Update progress for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 0
          }));

          // Simulate progress (in real app, you'd use axios upload progress)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: prev[file.name] < 90 ? prev[file.name] + 10 : 90
            }));
          }, 200);

          const response = await uploadAPI.image(file);
          
          clearInterval(progressInterval);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));

          if (response.data.success) {
            newImages.push({
              url: response.data.imageUrl,
              thumbnailUrl: response.data.thumbnailUrl,
              public_id: response.data.publicId,
              fileName: file.name,
              size: response.data.size,
              dimensions: {
                width: response.data.width,
                height: response.data.height
              }
            });
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          showError(`Failed to upload ${file.name}`);
        }
      }

      // Add new images to state
      setImages(prev => [...prev, ...newImages]);
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);

      if (newImages.length > 0) {
        showSuccess(`${newImages.length} images uploaded successfully`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  // Remove image from list
  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    try {
      // Optionally delete from Cloudinary
      if (imageToRemove.public_id) {
        await uploadAPI.delete(imageToRemove.public_id);
      }
      
      setImages(prev => prev.filter((_, i) => i !== index));
      showSuccess('Image removed successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      // Still remove from local state even if Cloudinary delete fails
      setImages(prev => prev.filter((_, i) => i !== index));
      showSuccess('Image removed from list');
    }
  };

  // Handle tag operations
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('Product name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      showError('Product description is required');
      return false;
    }
    
    if (!formData.category) {
      showError('Please select a category');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('Please enter a valid price');
      return false;
    }
    
    if (!formData.inventory.quantity || parseFloat(formData.inventory.quantity) < 0) {
      showError('Please enter a valid quantity');
      return false;
    }
    
    if (images.length === 0) {
      showError('Please upload at least one product image');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare product data - ensure it matches backend expectations
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        inventory: {
          quantity: parseFloat(formData.inventory.quantity),
          unit: formData.inventory.unit
        },
        isOrganic: formData.isOrganic,
        isSeasonal: formData.isSeasonal,
        isAvailable: formData.isAvailable,
        tags: formData.tags,
        // Send only the essential image data that matches Product schema
        images: images.map(img => ({
          url: img.url,
          public_id: img.public_id  // Make sure this matches your Product schema field name
        }))
      };

      console.log('Submitting product data:', JSON.stringify(productData, null, 2));
      
      const response = await productsAPI.create(productData);
      
      if (response.data.success) {
        showSuccess('Product created successfully!');
        navigate('/farmer/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showError(error.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/farmer/products')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Add New Product
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Add a new product to your farm inventory
              </p>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          
          {/* Basic Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price ($) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  placeholder="Describe your product, including features, benefits, and any special notes..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Inventory Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3">
              Inventory Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="inventory.quantity"
                  value={formData.inventory.quantity}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="0"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit *
                </label>
                <select
                  name="inventory.unit"
                  value={formData.inventory.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  required
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

          {/* Product Features Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3">
              Product Features
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              <label className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleInputChange}
                  className="mt-1 sm:mt-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organic Product
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Certified organic and grown without synthetic pesticides
                  </p>
                </div>
              </label>

              <label className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="isSeasonal"
                  checked={formData.isSeasonal}
                  onChange={handleInputChange}
                  className="mt-1 sm:mt-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seasonal Product
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only available during specific seasons
                  </p>
                </div>
              </label>

              <label className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="mt-1 sm:mt-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available for Sale
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Product is ready for customers to purchase
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Product Images Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3">
              Product Images *
            </h2>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <label className="flex flex-col sm:flex-row sm:items-center justify-center space-x-2 px-4 py-6 sm:py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Images
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading || images.length >= 10}
                  />
                </label>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-right">
                  {images.length}/10 images<br className="sm:hidden" /> Max 10MB each
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploading Files</h4>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="flex items-center space-x-3 text-sm">
                      <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-gray-600 dark:text-gray-400 truncate text-xs sm:text-sm">
                        {fileName}
                      </span>
                      <div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-shrink-0">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 sm:w-8 text-right">
                        {progress}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1.5 sm:p-2 truncate">
                        {formatFileSize(image.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3">
              Product Tags
            </h2>
            
            <div className="space-y-3">
              <div className="flex flex-col xs:flex-row gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Add tags (e.g., fresh, local, premium)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">Add Tag</span>
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-3 py-1.5 rounded-full text-sm border border-primary-200 dark:border-primary-800"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-100 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 space-y-reverse sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;