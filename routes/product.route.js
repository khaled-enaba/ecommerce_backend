const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct, getProductById, getProductBySlug, getBestSellers, getNewArrivals, } = require('../controller/product.controller');
const { getTopProducts, getLowStockProducts } = require('../controller/product-dashboard.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');


/* ================= MAIN PRODUCTS ENDPOINT (UNIFIED) ================= */
 

router.get('/', getProducts);
router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('image'), require('../controller/product.controller').updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

/* ================= HOME PAGE SHORTCUTS ================= */
router.get("/best-sellers", getBestSellers);
router.get("/new-arrivals", getNewArrivals);

/* ================= DASHBOARD ================= */
router.get("/dashboard/top-products", authenticate, authorize('ADMIN'), getTopProducts);
router.get("/dashboard/low-stock", authenticate, authorize('ADMIN'), getLowStockProducts);

/* Direct routes for frontend */
router.get("/top-products", authenticate, authorize('ADMIN'), getTopProducts);
router.get("/low-stock", authenticate, authorize('ADMIN'), getLowStockProducts);

router.get("/id/:id", getProductById);
router.get("/:slug", getProductBySlug);

module.exports = router;
