const express = require("express");

const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/OrderController');

const router = express.Router();

const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRole("admin"), getAllOrders);
router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRole("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRole("admin"), deleteOrder)

module.exports = router;