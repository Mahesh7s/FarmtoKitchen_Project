const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    console.log('🔄 Fetching wishlist for user:', req.user.id);
    
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product', 'name price images description isOrganic isSeasonal farmer inventory');
    
    if (!wishlist) {
      console.log('📝 Creating new wishlist for user:', req.user.id);
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    
    console.log('✅ Wishlist fetched successfully. Items:', wishlist.products.length);
    res.json(wishlist);
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log('➕ Adding product to wishlist. User:', req.user.id, 'Product:', productId);
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      // Create new wishlist if doesn't exist
      console.log('📝 Creating new wishlist for user:', req.user.id);
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [{ product: productId }]
      });
    } else {
      // Check if product already in wishlist
      const existingProduct = wishlist.products.find(
        item => item.product.toString() === productId
      );
      
      if (existingProduct) {
        console.log('⚠️ Product already in wishlist:', productId);
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      
      // Add product to wishlist
      console.log('✅ Adding product to existing wishlist');
      wishlist.products.push({ product: productId });
      await wishlist.save();
    }
    
    await wishlist.populate('products.product', 'name price images description isOrganic isSeasonal farmer inventory');
    
    console.log('✅ Product added to wishlist successfully');
    res.json({ 
      message: 'Product added to wishlist', 
      wishlist 
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('➖ Removing product from wishlist. User:', req.user.id, 'Product:', productId);
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      console.log('❌ Wishlist not found for user:', req.user.id);
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove product from wishlist
    const initialCount = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );
    
    if (wishlist.products.length === initialCount) {
      console.log('⚠️ Product not found in wishlist:', productId);
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    await wishlist.save();
    await wishlist.populate('products.product', 'name price images description isOrganic isSeasonal farmer inventory');
    
    console.log('✅ Product removed from wishlist successfully');
    res.json({ 
      message: 'Product removed from wishlist', 
      wishlist 
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    console.log('🗑️ Clearing wishlist for user:', req.user.id);
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      console.log('❌ Wishlist not found for user:', req.user.id);
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const itemCount = wishlist.products.length;
    wishlist.products = [];
    await wishlist.save();
    
    console.log('✅ Wishlist cleared successfully. Removed', itemCount, 'items');
    res.json({ message: 'Wishlist cleared', wishlist });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};