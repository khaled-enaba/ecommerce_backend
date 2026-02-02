const Category = require("../models/category.model");
const SubCategory = require("../models/subcategory.model");
const slugify = require("slugify");

/* ================= CATEGORY ================= */

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  const slug = slugify(name, { lower: true });

  const category = await Category.create({ name, slug });
  res.status(201).json(category);
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find({
    isDeleted: false,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json(categories);
};

/* ================= SUBCATEGORY ================= */

exports.createSubCategory = async (req, res) => {
  const { name, categoryId } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const slug = slugify(name, { lower: true });

  const subCategory = await SubCategory.create({
    name,
    slug,
    categoryId,
  });

  res.status(201).json(subCategory);
};

/* GET SubCategories by Category (POPULATE) */
exports.getSubCategoriesByCategory = async (req, res) => {
  const { categoryId } = req.params;

  const subCategories = await SubCategory.find({
    categoryId,
    isDeleted: false,
    isActive: true,
  }).populate("categoryId", "name slug");

  res.json(subCategories);
};
