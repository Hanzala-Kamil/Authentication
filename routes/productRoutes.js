const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// get all posts
router.route('/products').get(getAllProducts)
// create post
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRole("admin"), createProduct)
// edit post & Delete Post 
router
    .route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRole("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRole("admin"), deleteProduct)
// get single Post
router.route('/product/:id').get(getProductDetails);

router.route('/review').put(isAuthenticatedUser, createProductReview)

router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser , deleteReview)


module.exports = router