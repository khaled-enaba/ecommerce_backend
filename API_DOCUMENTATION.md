# Product API Documentation

## Unified Products Endpoint

### Base Endpoint
```
GET /api/products
```

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort` | string | `newest` | Sort option: `newest`, `bestSeller`, `price-low`, `price-high` |
| `limit` | number | `20` | Number of products per page |
| `page` | number | `1` | Page number for pagination |
| `category` | string | - | Filter by category ID |
| `subCategory` | string | - | Filter by sub-category ID |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |
| `search` | string | - | Search by product name or description |
| `isSummer` | boolean | - | Filter summer products |

---

## Usage Examples

### 1. Get Latest Products (for home page)
```bash
GET /api/products?sort=newest&limit=8
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "123...",
      "name": "Product Name",
      "slug": "product-name",
      "price": 99.99,
      "stock": 50,
      "soldCount": 15,
      "image": ["image.jpg"],
      "categoryId": { "name": "Electronics", "slug": "electronics" },
      "subCategoryId": { "name": "Phones", "slug": "phones" },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
    // ... more products
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 8,
    "pages": 7
  }
}
```

---

### 2. Get Best Sellers (for home page)
```bash
GET /api/products?sort=bestSeller&limit=8
```

**Features:** Returns 8 most sold products

---

### 3. Get with Filters & Sorting

#### Best Sellers in Electronics Category
```bash
GET /api/products?sort=bestSeller&category=cat_123&limit=12
```

#### New Arrivals with Price Range
```bash
GET /api/products?sort=newest&minPrice=50&maxPrice=500&limit=20
```

#### Search with Sort
```bash
GET /api/products?search=iphone&sort=price-low&limit=10
```

#### Multiple Filters Combined
```bash
GET /api/products?sort=bestSeller&category=cat_123&subCategory=subcat_456&minPrice=100&maxPrice=1000&search=phone&page=2&limit=20
```

---

### 4. Price Sorting
```bash
# Low to High
GET /api/products?sort=price-low

# High to Low
GET /api/products?sort=price-high
```

---

## Home Page Shortcuts (Still Supported)

### Latest Arrivals
```bash
GET /api/products/new-arrivals
```
- Shortcut for: `?sort=newest&limit=8`
- Supports all filters: `/api/products/new-arrivals?category=123&limit=12`

### Best Sellers
```bash
GET /api/products/best-sellers
```
- Shortcut for: `?sort=bestSeller&limit=8`
- Supports all filters: `/api/products/best-sellers?category=123&limit=12`

---

## Response Structure

### Success Response (2xx)
```json
{
  "success": true,
  "data": [ /* products array */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Error Response (4xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Frontend Integration Examples

### React / Next.js
```javascript
// Get new arrivals
const response = await fetch('/api/products?sort=newest&limit=8');
const { data, pagination } = await response.json();

// Get best sellers with category filter
const response = await fetch('/api/products?sort=bestSeller&category=123&limit=8');

// Search products
const response = await fetch(`/api/products?search=${searchQuery}&sort=newest&limit=20`);

// Apply filters
const params = new URLSearchParams({
  sort: 'bestSeller',
  category: selectedCategory,
  minPrice: minPrice,
  maxPrice: maxPrice,
  limit: 12
});
const response = await fetch(`/api/products?${params}`);
```

---

## Migration Guide (if coming from old endpoints)

| Old Endpoint | New Endpoint |
|-------------|-------------|
| `/products?newest=true` | `/products?sort=newest` |
| `/products?bestSeller=true` | `/products?sort=bestSeller` |
| `/products/new-arrivals` | `/products?sort=newest&limit=8` ✓ (still works) |
| `/products/best-sellers` | `/products?sort=bestSeller&limit=8` ✓ (still works) |

---

## Sort Priority

When multiple sort parameters are provided, only one is applied in this order:
1. `newest` (createdAt DESC)
2. `bestSeller` (soldCount DESC)
3. `price-low` (price ASC)
4. `price-high` (price DESC)

Default: `newest`

---

## Pagination Tips

- Use `page` and `limit` for pagination
- Example: Skip first 20, get next 20: `?page=2&limit=20`
- Calculate total pages: `Math.ceil(total / limit)`

---

## Filter Combinations

- ✅ All filters work together
- ✅ Sort works with any filter
- ✅ Search works with category & price filters
- ✅ Price filters work independently or together
- ✅ Summer filter can combine with other filters
