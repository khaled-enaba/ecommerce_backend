const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const {getCart, addToCart, updateCartItem, removeCartItem} = require("../controller/cart.controller");

router.use(authenticate);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeCartItem);

module.exports = router;
