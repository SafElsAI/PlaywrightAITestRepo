import { test, expect } from '@playwright/test';

const API_BASE_URL = 'https://automationexercise.com/api';

interface ProductCategory {
  usertype: {
    usertype: string;
  };
  category: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: ProductCategory;
}

interface ProductsResponse {
  responseCode: number;
  products: Product[];
}

test.describe('Automation Exercise API - Products Endpoint', () => {
  test('should successfully retrieve products list with 200 status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/productsList`);
    
    expect(response.status()).toBe(200);
    
    const json = await response.json();
    expect(json).toHaveProperty('responseCode', 200);
    expect(json).toHaveProperty('products');
    expect(Array.isArray(json.products)).toBe(true);
  });

  test('should return products with required fields', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/productsList`);
    expect(response.status()).toBe(200);
    
    const json = await response.json() as ProductsResponse;
    expect(json.products.length).toBeGreaterThan(0);
    
    // Verify each product has required fields
    json.products.forEach((product: Product) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('category');
      
      // Validate data types
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('string');
      expect(typeof product.brand).toBe('string');
      expect(typeof product.category).toBe('object');
    });
  });

  test('should verify product categories have correct structure', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/productsList`);
    expect(response.status()).toBe(200);
    
    const json = await response.json() as ProductsResponse;
    const products: Product[] = json.products.slice(0, 5); // Check first 5 products
    
    products.forEach((product: Product) => {
      // Each category should have usertype and category properties
      expect(product.category).toHaveProperty('usertype');
      expect(product.category).toHaveProperty('category');
      
      const { usertype, category } = product.category;
      expect(usertype).toHaveProperty('usertype');
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    });
  });
});
