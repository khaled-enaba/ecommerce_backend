// ==========================================
// FRONTEND USAGE EXAMPLES - Product API
// ==========================================

// ==================== 1. Home Page - New Arrivals ====================
async function getNewArrivals() {
  try {
    const response = await fetch('/api/products?sort=newest&limit=8');
    const result = await response.json();
    
    if (result.success) {
      console.log('New Arrivals:', result.data);
      console.log('Total Products:', result.pagination.total);
      // Display in home page slider/carousel
    }
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
  }
}

// ==================== 2. Home Page - Best Sellers ====================
async function getBestSellers() {
  try {
    const response = await fetch('/api/products?sort=bestSeller&limit=8');
    const result = await response.json();
    
    if (result.success) {
      console.log('Best Sellers:', result.data);
      // Display in home page section
    }
  } catch (error) {
    console.error('Error fetching best sellers:', error);
  }
}

// ==================== 3. Products Page with Filters ====================
async function getFilteredProducts(filters) {
  const {
    sort = 'newest',           // newest, bestSeller, price-low, price-high
    category = '',
    subCategory = '',
    minPrice = '',
    maxPrice = '',
    search = '',
    page = 1,
    limit = 20
  } = filters;

  // Build query string
  const params = new URLSearchParams({
    ...(sort && { sort }),
    ...(category && { category }),
    ...(subCategory && { subCategory }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(search && { search }),
    page,
    limit
  });

  try {
    const response = await fetch(`/api/products?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        products: result.data,
        pagination: result.pagination
      };
    }
  } catch (error) {
    console.error('Error fetching filtered products:', error);
  }
}

// Usage Example:
// const { products, pagination } = await getFilteredProducts({
//   sort: 'bestSeller',
//   category: 'cat_123',
//   minPrice: 100,
//   maxPrice: 500,
//   page: 1,
//   limit: 12
// });

// ==================== 4. Search Products ====================
async function searchProducts(query, limit = 20) {
  try {
    const response = await fetch(
      `/api/products?search=${encodeURIComponent(query)}&sort=newest&limit=${limit}`
    );
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error searching products:', error);
  }
}

// ==================== 5. Category Filter ====================
async function getProductsByCategory(categoryId, sort = 'newest', limit = 20) {
  try {
    const response = await fetch(
      `/api/products?category=${categoryId}&sort=${sort}&limit=${limit}`
    );
    const result = await response.json();
    
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.error('Error fetching by category:', error);
  }
}

// ==================== 6. Price Filter ====================
async function getProductsByPriceRange(minPrice, maxPrice, limit = 20) {
  try {
    const response = await fetch(
      `/api/products?minPrice=${minPrice}&maxPrice=${maxPrice}&sort=price-low&limit=${limit}`
    );
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching by price:', error);
  }
}

// ==================== 7. Pagination ====================
async function getProductsPage(page = 1, limit = 20) {
  try {
    const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        products: result.data,
        currentPage: result.pagination.page,
        totalPages: result.pagination.pages,
        total: result.pagination.total
      };
    }
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

// ==================== 8. Advanced Filtering ====================
class ProductFilters {
  constructor() {
    this.filters = {
      sort: 'newest',
      category: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      page: 1,
      limit: 20
    };
  }

  setSort(sort) {
    this.filters.sort = sort;
    return this;
  }

  setCategory(categoryId) {
    this.filters.category = categoryId;
    return this;
  }

  setPriceRange(min, max) {
    this.filters.minPrice = min;
    this.filters.maxPrice = max;
    return this;
  }

  setSearch(query) {
    this.filters.search = query;
    return this;
  }

  setPage(page) {
    this.filters.page = page;
    return this;
  }

  setLimit(limit) {
    this.filters.limit = limit;
    return this;
  }

  async fetch() {
    const params = new URLSearchParams(
      Object.entries(this.filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {})
    );

    const response = await fetch(`/api/products?${params}`);
    return await response.json();
  }

  // Fluent API Usage
  // new ProductFilters()
  //   .setCategory('cat_123')
  //   .setPriceRange(100, 500)
  //   .setSort('bestSeller')
  //   .setLimit(12)
  //   .fetch()
}

// ==================== 9. React Hook Example ====================
/*
import { useState, useEffect } from 'react';

function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null) acc[key] = value;
          return acc;
        }, {})
      );

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(initialFilters);
  }, [initialFilters]);

  return { products, pagination, loading, error, fetchProducts };
}

// Usage in Component:
// const { products, pagination, loading } = useProducts({
//   sort: 'newest',
//   limit: 8
// });
*/

// ==================== 10. Vue 3 Composition API Example ====================
/*
import { ref } from 'vue';

export function useProducts() {
  const products = ref([]);
  const pagination = ref({});
  const loading = ref(false);

  const fetchProducts = async (filters = {}) => {
    loading.value = true;
    try {
      const params = new URLSearchParams(
        Object.entries({
          sort: 'newest',
          limit: 20,
          ...filters
        }).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      );

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        products.value = result.data;
        pagination.value = result.pagination;
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    pagination,
    loading,
    fetchProducts
  };
}
*/

// ==================== Response Structure ====================
/*
Success Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "price": 99.99,
      "categoryId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Electronics",
        "slug": "electronics"
      },
      "subCategoryId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Phones",
        "slug": "phones"
      },
      "image": ["product-image.jpg"],
      "stock": 50,
      "soldCount": 15,
      "isActive": true,
      "isSummer": false,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:22:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "pages": 6
  }
}
*/
