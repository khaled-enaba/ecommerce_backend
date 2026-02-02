const Product = require("../models/product.model");
const slugify = require("slugify");

/* ================= CREATE ================= */
exports.createProduct = async (req, res) => {
  const {
    name,
    price,
    categoryId,
    subCategoryId,
    description,
    stock,
  } = req.body;

  const slug = slugify(name, { lower: true });

  const product = await Product.create({
    name,
    slug,
    price,
    categoryId,
    subCategoryId,
    description,
    stock,
    image: req.file.filename,
  });

  res.status(201).json(product);
};

/* ================= GET PRODUCTS (FILTER + SORT + DYNAMIC LIMIT) ================= */
exports.getProducts = async (req, res) => {
  const {
    category,
    subCategory,
    sort = "newest",  // 'newest', 'bestSeller', or 'price'
    search,
    minPrice,
    maxPrice,
    isSummer,
    page = 1,
    limit = 20,  // Dynamic limit - default 20, can be changed by frontend
  } = req.query;

  const filter = {
    isDeleted: false,
    isActive: true,
  };

  // Category and subcategory filters
  if (category && category !== 'undefined') filter.categoryId = category;
  if (subCategory && subCategory !== 'undefined') filter.subCategoryId = subCategory;
  if (isSummer === 'true') filter.isSummer = true;

  // Search by name and description (case-insensitive)
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
    if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);

    // Remove if empty
    if (Object.keys(filter.price).length === 0) delete filter.price;
  }

  let query = Product.find(filter)
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug");

  // Sorting 
  const sortObj = {};
  switch (sort) {
    case "newest":
      sortObj.createdAt = -1;
      break;
    case "bestSeller":
      sortObj.soldCount = -1;
      break;
    case "price-low":
      sortObj.price = 1; 
      break;
    case "price-high":
      sortObj.price = -1; 
      break;
    default:
      sortObj.createdAt = -1; 
  }

  query = query.sort(sortObj);

  // Pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  query = query.skip(skip).limit(limitNum);

  const products = await query;
  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
};



/* ================= BEST SELLERS (HOME) - Uses getProducts with sort filter ================= */
exports.getBestSellers = async (req, res) => {
  req.query.sort = "bestSeller";
  req.query.limit = req.query.limit || 8;  
  
  return exports.getProducts(req, res);
};

/* ================= NEW ARRIVALS (HOME) - Uses getProducts with sort filter ================= */
exports.getNewArrivals = async (req, res) => {
  req.query.sort = "newest";
  req.query.limit = req.query.limit || 8; 
  
  return exports.getProducts(req, res);
};



exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.isDeleted = true;
  await product.save();

  res.json({ message: "Product deleted successfully" });
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id)
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({ data: product }); 
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isDeleted: false, isActive: true })
    .populate("categoryId", "name slug")
    .populate("subCategoryId", "name slug");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

/* ================= UPDATE ================= */
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, categoryId, subCategoryId, description, stock } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (name) {
    product.name = name;
    product.slug = slugify(name, { lower: true });
  }
  if (price) product.price = price;
  if (categoryId) product.categoryId = categoryId;
  if (subCategoryId) product.subCategoryId = subCategoryId;
  if (description) product.description = description;
  if (stock) product.stock = stock;

  if (req.file) {
    product.image = [req.file.filename]; 
  }

  await product.save();
  res.json(product);
};
