/**
 * Products Test Suite
 * Tests for product browsing, searching, and filtering functionality
 */

import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Products', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should display home page with featured items @smoke', async ({ homePage }) => {
    const isLoaded = await homePage.verifyHomePageLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should navigate to products page @smoke', async ({ homePage, productsPage }) => {
    await homePage.clickProducts();
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product details @smoke', async ({ productsPage, productDetailsPage }) => {
    await productsPage.goto();
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);

    await productsPage.viewProductByIndex(0);
    const name = await productDetailsPage.getProductName();
    expect(name.length).toBeGreaterThan(0);
  });

  test('should search for a product @smoke', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.searchProduct('Blue Top');
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.filterByCategory('Women');
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by brand', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.filterByBrand('Polo');
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should add product to cart', async ({ productDetailsPage, testData }) => {
    await productDetailsPage.gotoProductDetails(testData.testProduct.id);
    await productDetailsPage.addToCart();
    // Verify product details page still loaded
    const productName = await productDetailsPage.getProductName();
    expect(productName.length).toBeGreaterThan(0);
  });

  test('should write product review', async ({ productDetailsPage, testData }) => {
    await productDetailsPage.gotoProductDetails(testData.testProduct.id);
    await productDetailsPage.writeReview('QA Tester', 'qa@test.com', 'Great product!');
    // Verify product details page still loaded
    const productName = await productDetailsPage.getProductName();
    expect(productName.length).toBeGreaterThan(0);
  });
});
