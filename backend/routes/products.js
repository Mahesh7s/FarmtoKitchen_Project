const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getFarmerProducts
} = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');
// Remove upload import since we're not using it for product creation
// const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/farmer/my-products', auth, authorize('farmer'), getFarmerProducts);

// Remove upload.array('images', 5) middleware - we're sending JSON with pre-uploaded URLs
router.post('/', auth, authorize('farmer'), createProduct);
router.put('/:id', auth, authorize('farmer'), updateProduct);
router.delete('/:id', auth, authorize('farmer'), deleteProduct);

module.exports = router;