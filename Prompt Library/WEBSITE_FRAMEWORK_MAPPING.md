# Automation Exercise Website → Framework Mapping

## Website Structure to Framework Mapping

### Website Features → Page Objects

| Website Feature | Page Object | Location | Key Methods |
|---|---|---|---|
| Home Page | `HomePage` | `automation-exercise.page.ts` | `goto()`, `verifyHomePageLoaded()` |
| Products Display | `HomePage` | `automation-exercise.page.ts` | `getFeaturedProducts()`, `clickProducts()` |
| Categories (Women/Men/Kids) | `HomePage` | `automation-exercise.page.ts` | `navigateToWomenCategory()`, `navigateToMenCategory()`, `navigateToKidsCategory()` |
| Brands Listing | `HomePage` | `automation-exercise.page.ts` | `brandSection` locator |
| Login Page | `LoginPage` | `automation-exercise.page.ts` | `goto()`, `login()`, `verifyLoginHeadingVisible()` |
| Signup Form | `LoginPage` | `automation-exercise.page.ts` | `signup()`, `verifySignupHeadingVisible()` |
| Products Page | `ProductsPage` | `automation-exercise.page.ts` | `goto()`, `getProductsCount()`, `searchProduct()` |
| Product Search | `ProductsPage` | `automation-exercise.page.ts` | `searchProduct()` |
| Category Filter | `ProductsPage` | `automation-exercise.page.ts` | `filterByCategory()` |
| Brand Filter | `ProductsPage` | `automation-exercise.page.ts` | `filterByBrand()` |
| Product Details | `ProductDetailsPage` | `automation-exercise.page.ts` | `gotoProductDetails()`, `getProductName()`, `getProductPrice()` |
| Add to Cart | `ProductDetailsPage` | `automation-exercise.page.ts` | `addToCart()` |
| Product Reviews | `ProductDetailsPage` | `automation-exercise.page.ts` | `writeReview()` |
| Shopping Cart | `CartPage` | `automation-exercise.page.ts` | `goto()`, `getCartItemsCount()`, `proceedToCheckout()` |
| Checkout Page | `CheckoutPage` | `automation-exercise.page.ts` | `goto()`, `fillPaymentDetails()`, `placeOrder()` |
| User Account | `DashboardPage` | `automation-exercise.page.ts` | `goto()`, `verifyLoggedInAsVisible()`, `clickDeleteAccount()` |
| Account Deletion | `AccountDeletedPage` | `automation-exercise.page.ts` | `verifyAccountDeletedMessageVisible()` |
| Contact Us | `ContactUsPage` | `automation-exercise.page.ts` | `goto()`, `fillContactForm()`, `submitForm()` |

## Website URLs → Framework Navigation

| Page | URL | Navigation Method |
|---|---|---|
| Home | `https://automationexercise.com` | `homePage.goto()` |
| Products | `https://automationexercise.com/products` | `productsPage.goto()` |
| Product Details | `https://automationexercise.com/product_details/{id}` | `productDetailsPage.gotoProductDetails(id)` |
| Cart | `https://automationexercise.com/view_cart` | `cartPage.goto()` |
| Checkout | `https://automationexercise.com/checkout` | `checkoutPage.goto()` |
| Login | `https://automationexercise.com/login` | `loginPage.goto()` |
| Account | `https://automationexercise.com/account` | `dashboardPage.goto()` |
| Contact Us | `https://automationexercise.com/contact_us` | `contactUsPage.goto()` |

## Test Data Alignment

### Real Products in test-data.json
```json
"products": [
  { "id": 1, "name": "Blue Top", "price": 500, "category": "Women", "brand": "Polo" },
  { "id": 2, "name": "Men Tshirt", "price": 400, "category": "Men", "brand": "H&M" },
  { "id": 3, "name": "Sleeveless Dress", "price": 1000, "category": "Women", "brand": "Madame" }
]
```

### Real Brands in test-data.json
```
"brands": ["Polo", "H&M", "Madame", "Mast & Harbour", "BABYHUG", "Allen Solly Junior", "Kookie Kids", "Biba"]
```

### Real Categories in test-data.json
```
"categories": [
  { "name": "Women", "subcategories": ["Dress", "Tops", "Saree"] },
  { "name": "Men", "subcategories": ["Shirts", "T-shirts", "Jeans"] },
  { "name": "Kids", "subcategories": ["Tops", "Dresses", "Clothing"] }
]
```

## Test Suites Organization

### Smoke Tests (Basic Functionality)
- Authentication suite - 10 tests
- Products suite - 8 tests (5 marked @smoke)
- Cart/Checkout suite - 8 tests (1 marked @smoke)
- Contact Us suite - 3 tests (1 marked @smoke)
- Dashboard suite - 8 tests

**Total: 37 tests | 8 smoke tests**

## Fixture-to-Page Mapping

| Fixture | Page Object | Purpose |
|---|---|---|
| `homePage` | `HomePage` | Homepage navigation and feature access |
| `loginPage` | `LoginPage` | User authentication |
| `productsPage` | `ProductsPage` | Product browsing and filtering |
| `productDetailsPage` | `ProductDetailsPage` | Individual product information |
| `dashboardPage` | `DashboardPage` | User account management |
| `cartPage` | `CartPage` | Shopping cart operations |
| `checkoutPage` | `CheckoutPage` | Order processing and payment |
| `contactUsPage` | `ContactUsPage` | Contact form submission |
| `authenticatedPage` | N/A (Page) | Pre-authenticated page for testing |
| `testData` | N/A (Interface) | Test data provider |
| `apiHelper` | N/A (Utility) | API testing utilities |

## Locator Strategies Used

### Primary (Recommended)
- `getByRole()` - For buttons, links, headings
- `data-qa` attributes - For form inputs
- `getByText()` - For visible text content

### Secondary (Fallbacks)
- CSS selectors - For complex hierarchies
- XPath - For dynamic content (when needed)
- Filter methods - For multiple similar elements

## Test Scenario Mapping

### From test-data.json
```json
"testScenarios": {
  "login": "Navigate → Enter credentials → Verify logged in",
  "signup": "Navigate → Enter info → Verify account",
  "addToCart": "Browse → Select product → Add to cart",
  "checkout": "Add items → Proceed → Fill details → Order",
  "accountDeletion": "Login → Delete account → Verify"
}
```

### Implemented in Test Suites
- `authentication.spec.ts` - Login & signup scenarios
- `products.spec.ts` - Browse & add to cart
- `cart-checkout.spec.ts` - Checkout flow
- `dashboard-new.spec.ts` - Account management
- `contact-us.spec.ts` - Contact form

## Browser Support

All tests run on:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

## Command Reference

```bash
# Test by category
npm test -- tests/e2e/authentication.spec.ts
npm test -- tests/e2e/products.spec.ts
npm test -- tests/e2e/cart-checkout.spec.ts

# Test by browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit

# Test with visibility
npm test -- --headed
npm test -- --ui

# Test reports
npm run test:report
npm run test:trace
```

## Environment Configuration

Located in: `src/config/environments.ts`

### Available Environments
- `development` - Dev server settings
- `qa` - QA environment
- `production` - Production settings

### Configured for
- Base URL: `https://automationexercise.com`
- API Base URL: `https://automationexercise.com/api/productsList`
- Timeouts: Action (15-20s), Navigation (30-40s)

## Next Features to Implement

1. **API Testing** - Use `apiHelper` fixture
2. **Visual Testing** - Playwright visual comparisons
3. **Performance** - Page load metrics
4. **Accessibility** - WCAG compliance
5. **Database** - Direct data setup
6. **CI/CD** - GitHub Actions integration

## Troubleshooting Guide

### Issue: Tests timeout
**Solution**: Check if website is accessible, increase timeout in config

### Issue: Selectors not found
**Solution**: Verify page-qa attributes exist, use Inspector tool

### Issue: Tests fail intermittently
**Solution**: Check for dynamic content, use wait conditions

### Issue: Cross-browser failures
**Solution**: Test-specific browser checks in fixtures

## References

- **Framework**: Playwright (1.40+)
- **Language**: TypeScript 5+
- **Website**: https://automationexercise.com
- **Docs**: https://playwright.dev
- **Best Practices**: Followed Playwright official recommendations

---

**This mapping ensures:**
✅ All website features are covered
✅ Tests are maintainable and scalable
✅ Real website data is used
✅ Best practices are followed
✅ Easy to add new tests
✅ Cross-browser compatible
