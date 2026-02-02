const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct, getProductById, getProductBySlug, getBestSellers, getNewArrivals, } = require('../controller/product.controller');
const { getTopProducts, getLowStockProducts } = require('../controller/product-dashboard.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');


/* ================= MAIN PRODUCTS ENDPOINT (UNIFIED) ================= */
/* 
  GET /products - Get all products with filters and sorting
  Query params:
    - sort: 'newest' | 'bestSeller' | 'price-low' | 'price-high' (default: newest)
    - limit: number (default: 20, can be 8 for home page)
    - category: categoryId
    - subCategory: subCategoryId
    - minPrice, maxPrice: price range
    - search: search by name/description
    - page: page number (default: 1)
*/
router.get('/', getProducts);
router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('image'), require('../controller/product.controller').updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

/* ================= HOME PAGE SHORTCUTS ================= */
/* These use getProducts with predefined sort and limit */
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
