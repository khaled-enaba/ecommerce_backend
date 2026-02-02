const express = require("express");
const {
  createCategory,
  getCategories,
  createSubCategory,
  getSubCategoriesByCategory,
} = require("../controller/category.controller");

const router = express.Router();

/* Category */
router.post("/", createCategory);
router.get("/", getCategories);

/* SubCategory */
router.post("/sub", createSubCategory);
router.get("/:categoryId/sub", getSubCategoriesByCategory);

module.exports = router;
