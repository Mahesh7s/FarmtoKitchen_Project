// utils/aiRecommendations.js
const Product = require('../models/Product');
const Order = require('../models/Order');

// Simple AI-based recommendation engine
const getProductRecommendations = async (user, limit = 10) => {
  try {
    const recommendations = [];
    const products = await Product.find({ isAvailable: true })
      .populate('farmer', 'name farmName farmLocation city')
      .limit(100); // Limit for performance

    // Based on user preferences
    if (user.preferences) {
      if (user.preferences.organic) {
        const organicProducts = products.filter(p => p.isOrganic);
        recommendations.push(...organicProducts);
      }
      
      if (user.preferences.local && user.deliveryAddress?.city) {
        const localProducts = products.filter(p => 
          p.farmer.farmLocation?.city === user.deliveryAddress.city
        );
        recommendations.push(...localProducts);
      }
      
      if (user.preferences.productCategories?.length > 0) {
        const categoryProducts = products.filter(p => 
          user.preferences.productCategories.includes(p.category)
        );
        recommendations.push(...categoryProducts);
      }
    }

    // Based on order history
    const orders = await Order.find({ consumer: user._id })
      .populate('items.product')
      .limit(50);

    const orderedCategories = orders.flatMap(order => 
      order.items.map(item => item.product?.category).filter(Boolean)
    );

    const popularCategories = [...new Set(orderedCategories)];
    if (popularCategories.length > 0) {
      const categoryBased = products.filter(p => 
        popularCategories.includes(p.category)
      );
      recommendations.push(...categoryBased);
    }

    // Based on season
    const seasonalProducts = products.filter(p => 
      p.isSeasonal && isProductInSeason(p, new Date().getMonth())
    );
    recommendations.push(...seasonalProducts);

    // Based on rating (popular products)
    const popularProducts = products
      .filter(p => p.rating.average >= 4)
      .sort((a, b) => b.rating.average - a.rating.average);
    
    recommendations.push(...popularProducts);

    // Remove duplicates and return unique products
    const uniqueRecommendations = [...new Map(
      recommendations.map(item => [item._id.toString(), item])
    ).values()];

    // Score and sort recommendations
    const scoredRecs = uniqueRecommendations.map(product => ({
      product,
      score: calculateRecommendationScore(product, user, orders)
    }));

    return scoredRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

  } catch (error) {
    console.error('Recommendation error:', error);
    // Fallback: return popular products
    return await Product.find({ isAvailable: true })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(limit)
      .populate('farmer', 'name farmName farmLocation city');
  }
};

const calculateRecommendationScore = (product, user, orders) => {
  let score = 0;

  // Preference matching
  if (user.preferences) {
    if (user.preferences.organic && product.isOrganic) score += 2;
    if (user.preferences.local && 
        user.deliveryAddress?.city === product.farmer.farmLocation?.city) score += 3;
  }

  // Rating based
  score += product.rating.average;

  // Seasonality
  if (product.isSeasonal && isProductInSeason(product, new Date().getMonth())) {
    score += 1;
  }

  // Popularity
  if (product.rating.count > 10) score += 1;

  return score;
};

const isProductInSeason = (product, month) => {
  // Simple season mapping - can be enhanced with actual crop data
  const seasonMap = {
    winter: [11, 0, 1],   // Dec, Jan, Feb - root vegetables, citrus
    spring: [2, 3, 4],    // Mar, Apr, May - leafy greens, strawberries
    summer: [5, 6, 7],    // Jun, Jul, Aug - tomatoes, corn, berries
    fall: [8, 9, 10]      // Sep, Oct, Nov - apples, squash, pumpkins
  };

  // This is a simplified version - would need actual product season data
  // For now, return true for all seasonal products
  return product.isSeasonal;
};

// Get recommendations for new users (without order history)
const getNewUserRecommendations = async (limit = 10) => {
  return await Product.find({ isAvailable: true })
    .sort({ 
      'rating.average': -1, 
      'rating.count': -1,
      createdAt: -1 
    })
    .limit(limit)
    .populate('farmer', 'name farmName farmLocation city');
};

module.exports = { 
  getProductRecommendations, 
  getNewUserRecommendations 
};