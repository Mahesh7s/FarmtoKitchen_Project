const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Create product
const createProduct = async (req, res) => {
  try {
    console.log('=== PRODUCT CREATION DEBUG ===');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    console.log('User creating product:', req.user._id);

    // Debug the inventory specifically
    console.log('Raw inventory from request:', req.body.inventory);
    console.log('Inventory quantity raw:', req.body.inventory?.quantity);
    console.log('Inventory quantity type:', typeof req.body.inventory?.quantity);
    console.log('Inventory unit:', req.body.inventory?.unit);

    // Parse quantity safely
    let quantity = req.body.inventory?.quantity;
    if (typeof quantity === 'string') {
      quantity = parseFloat(quantity);
    }
    
    // If parseFloat fails, try Number
    if (isNaN(quantity)) {
      quantity = Number(req.body.inventory?.quantity);
    }

    console.log('Parsed quantity:', quantity);
    console.log('Is quantity valid number?', !isNaN(quantity));

    // Create product data with proper formatting
    const productData = {
      name: req.body.name?.trim(),
      description: req.body.description?.trim(),
      category: req.body.category,
      price: parseFloat(req.body.price),
      farmer: req.user._id,
      inventory: {
        quantity: quantity,
        unit: req.body.inventory?.unit
      },
      isOrganic: Boolean(req.body.isOrganic),
      isSeasonal: Boolean(req.body.isSeasonal),
      isAvailable: Boolean(req.body.isAvailable),
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      images: []
    };

    console.log('Final productData inventory:', productData.inventory);

    // Validate required fields
    if (!productData.name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!productData.description) {
      return res.status(400).json({ message: 'Product description is required' });
    }
    if (!productData.category) {
      return res.status(400).json({ message: 'Product category is required' });
    }
    if (!productData.price || isNaN(productData.price)) {
      return res.status(400).json({ message: 'Valid product price is required' });
    }

    // Validate inventory fields
    if (!productData.inventory.quantity || isNaN(productData.inventory.quantity)) {
      console.log('Quantity validation failed. Value:', productData.inventory.quantity, 'Type:', typeof productData.inventory.quantity);
      return res.status(400).json({ message: 'Valid inventory quantity is required' });
    }
    if (!productData.inventory.unit) {
      console.log('Unit validation failed:', productData.inventory.unit);
      return res.status(400).json({ message: 'Inventory unit is required' });
    }

    // Validate images
    if (req.body.images && Array.isArray(req.body.images)) {
      productData.images = req.body.images.map(img => ({
        url: img.url,
        public_id: img.public_id || img.publicId
      }));
    }

    if (productData.images.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    console.log('Final validated productData:', productData);

    const product = await Product.create(productData);
    await product.populate("farmer", "name farmName farmLocation");

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
// Get all products with filters
const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      organic,
      seasonal,
      search,
      farmer,
      page = 1,
      limit = 12,
    } = req.query;

    let query = { isAvailable: true };

    // Apply filters
    if (category) query.category = category;
    if (organic !== undefined) query.isOrganic = organic === "true";
    if (seasonal !== undefined) query.isSeasonal = seasonal === "true";
    if (farmer) query.farmer = farmer;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const products = await Product.find(query)
      .populate("farmer", "name farmName farmLocation city avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name farmName farmLocation contactNumber rating"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
// Update product - FIXED VERSION
const updateProduct = async (req, res) => {
  try {
    console.log('=== PRODUCT UPDATE DEBUG ===');
    console.log('Update request body:', JSON.stringify(req.body, null, 2));
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Parse and validate the update data
    const updateData = { ...req.body };

    // Handle inventory parsing
    if (req.body.inventory) {
      updateData.inventory = {
        quantity: parseFloat(req.body.inventory.quantity),
        unit: req.body.inventory.unit
      };
      
      if (isNaN(updateData.inventory.quantity)) {
        return res.status(400).json({ message: "Invalid inventory quantity" });
      }
    }

    // Handle boolean fields
    if (req.body.isOrganic !== undefined) {
      updateData.isOrganic = Boolean(req.body.isOrganic);
    }
    if (req.body.isSeasonal !== undefined) {
      updateData.isSeasonal = Boolean(req.body.isSeasonal);
    }
    if (req.body.isAvailable !== undefined) {
      updateData.isAvailable = Boolean(req.body.isAvailable);
    }

    // Handle price parsing
    if (req.body.price) {
      updateData.price = parseFloat(req.body.price);
      if (isNaN(updateData.price)) {
        return res.status(400).json({ message: "Invalid price" });
      }
    }

    console.log('Final update data:', updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("farmer", "name farmName");

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get farmer's products
const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts,
};
