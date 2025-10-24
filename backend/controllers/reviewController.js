const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');

// Create review
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment, farmerId, productId } = req.body;

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      consumer: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ message: 'Order not found or not delivered' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    const review = await Review.create({
      consumer: req.user._id,
      farmer: farmerId,
      product: productId,
      order: orderId,
      rating,
      comment
    });

    // Update farmer rating
    await updateFarmerRating(farmerId);

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get reviews for farmer
const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('consumer', 'name avatar')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update farmer rating
const updateFarmerRating = async (farmerId) => {
  const reviews = await Review.find({ farmer: farmerId });
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  await User.findByIdAndUpdate(farmerId, {
    $set: {
      'rating.average': average,
      'rating.count': reviews.length
    }
  });
};

module.exports = {
  createReview,
  getFarmerReviews
};