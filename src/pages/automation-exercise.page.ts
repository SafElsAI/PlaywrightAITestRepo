/**
 * Automation Exercise Page Objects
 * Page objects for https://automationexercise.com
 * This file contains all page interactions for the Automation Exercise website
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

const BASE_URL = 'https://automationexercise.com';

/**
 * Home Page - Initial landing page with product showcase
 */
export class HomePage extends BasePage {
  readonly signupLoginButton: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly contactUsLink: Locator;
  readonly testCasesLink: Locator;
  readonly apiTestingLink: Locator;
  readonly womenCategory: Locator;
  readonly menCategory: Locator;
  readonly kidsCategory: Locator;
  readonly brandSection: Locator;
  readonly featuredItemsSection: Locator;

  constructor(page: Page) {
    super(page);
    // Navigation locators
    this.signupLoginButton = page.getByRole('link', { name: /Signup \/ Login/i });
    this.productsLink = page.getByRole('link', { name: /Products/i });
    this.cartLink = page.getByRole('link', { name: /Cart/i });
    this.contactUsLink = page.getByRole('link', { name: /Contact us/i });
    this.testCasesLink = page.getByRole('link', { name: /Test Cases/i });
    this.apiTestingLink = page.getByRole('link', { name: /API Testing/i });
    
    // Category locators
    this.womenCategory = page.getByRole('link', { name: /Women/i });
    this.menCategory = page.getByRole('link', { name: /Men/i });
    this.kidsCategory = page.getByRole('link', { name: /Kids/i });
    
    // Content sections
    this.brandSection = page.locator('div').filter({ hasText: /BRANDS/i }).first();
    this.featuredItemsSection = page.locator('div').filter({ hasText: /FEATURES ITEMS/i }).first();
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify home page is loaded
   */
  async verifyHomePageLoaded(): Promise<boolean> {
    try {
      const logoImage = this.page.locator('img[alt="Website for automation practice"]').first();
      return await logoImage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Locator[]> {
    return await this.page.locator('div.productinfo').all();
  }

  /**
   * Click on Signup/Login button
   */
  async clickSignupLoginButton(): Promise<void> {
    await this.signupLoginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Products link
   */
  async clickProducts(): Promise<void> {
    await this.productsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Cart link
   */
  async clickCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click on Contact Us link
   */
  async clickContactUs(): Promise<void> {
    await this.contactUsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Women category
   */
  async navigateToWomenCategory(): Promise<void> {
    await this.womenCategory.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Men category
   */
  async navigateToMenCategory(): Promise<void> {
    await this.menCategory.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to Kids category
   */
  async navigateToKidsCategory(): Promise<void> {
    await this.kidsCategory.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}


/**
 * Login Page - Login and signup form page
 */
export class LoginPage extends BasePage {
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupHeading: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Login form locators using data-qa attributes
    this.loginEmailInput = page.locator('input[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('input[data-qa="login-password"]');
    this.loginButton = page.locator('button[data-qa="login-button"]');
    this.loginHeading = page.locator('h2').filter({ hasText: /Login to your account/i });
    
    // Signup form locators
    this.signupNameInput = page.locator('input[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('input[data-qa="signup-email"]');
    this.signupButton = page.locator('button[data-qa="signup-button"]');
    this.signupHeading = page.locator('h2').filter({ hasText: /New User Signup!/i });
    
    // Error message
    this.errorMessage = page.locator('p').filter({ hasText: /incorrect|invalid|email|password/i }).first();
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify login page heading is visible
   */
  async verifyLoginHeadingVisible(): Promise<boolean> {
    try {
      return await this.loginHeading.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Verify signup heading is visible
   */
  async verifySignupHeadingVisible(): Promise<boolean> {
    try {
      return await this.signupHeading.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Perform login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform signup with name and email
   */
  async signup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get login email input value
   */
  async getLoginEmailValue(): Promise<string> {
    return await this.loginEmailInput.inputValue();
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}


/**
 * Products Page - Product listing and browsing
 */
export class ProductsPage extends BasePage {
  readonly productsList: Locator;
  readonly productItem: Locator;
  readonly viewProductButtons: Locator;
  readonly addToCartButtons: Locator;
  readonly categoryFilter: Locator;
  readonly brandFilter: Locator;
  readonly priceFilter: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productsList = page.locator('div.products-section');
    this.productItem = page.locator('div.productinfo');
    this.viewProductButtons = page.getByRole('link', { name: /View Product/i });
    this.addToCartButtons = page.locator('a.btn[data-product-id]');
    this.categoryFilter = page.locator('div.left-sidebar');
    this.brandFilter = page.locator('div.brands-name');
    this.priceFilter = page.locator('input[name="price"]');
    this.searchInput = page.locator('input[id="search_product"]');
    this.searchButton = page.locator('button[id="submit_search"]');
  }

  /**
   * Navigate to products page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/products`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get all products count
   */
  async getProductsCount(): Promise<number> {
    return await this.productItem.count();
  }

  /**
   * Click view product button by index
   */
  async viewProductByIndex(index: number): Promise<void> {
    const buttons = await this.viewProductButtons.all();
    if (index < buttons.length) {
      await buttons[index].click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Search for a product
   */
  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Add product to cart by index
   */
  async addToCartByIndex(index: number): Promise<void> {
    const buttons = await this.addToCartButtons.all();
    if (index < buttons.length) {
      await buttons[index].click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Filter by category
   */
  async filterByCategory(categoryName: string): Promise<void> {
    const categoryLink = this.page.getByRole('link', { name: new RegExp(categoryName, 'i') });
    await categoryLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Filter by brand
   */
  async filterByBrand(brandName: string): Promise<void> {
    const brandLink = this.page.getByRole('link', { name: new RegExp(brandName, 'i') });
    await brandLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Product Details Page - Individual product view
 */
export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productRating: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly writeReviewButton: Locator;
  readonly reviewNameInput: Locator;
  readonly reviewEmailInput: Locator;
  readonly reviewTextInput: Locator;
  readonly submitReviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('h2').first();
    this.productPrice = page.locator('span[data-qa="product-price"]').or(page.locator('span').filter({ hasText: /Rs\./ }).first());
    this.productDescription = page.locator('p').first();
    this.productRating = page.locator('b').filter({ hasText: /based on/ });
    this.quantityInput = page.locator('input[name="quantity"]').or(page.locator('input#quantity'));
    this.addToCartButton = page.getByRole('button', { name: /Add to cart/i }).or(page.locator('button').filter({ hasText: /Add to cart/i }).first());
    this.writeReviewButton = page.getByRole('button', { name: /Write Your Review/i }).or(page.locator('button').filter({ hasText: /Write Your Review/i }));
    this.reviewNameInput = page.locator('input[id="review_name"]');
    this.reviewEmailInput = page.locator('input[id="review_email"]');
    this.reviewTextInput = page.locator('textarea[id="review_text"]');
    this.submitReviewButton = page.locator('button[id="button-review"]');
  }

  /**
   * Navigate to product details by product ID
   */
  async gotoProductDetails(productId: number): Promise<void> {
    await this.page.goto(`${BASE_URL}/product_details/${productId}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get product name
   */
  async getProductName(): Promise<string> {
    return await this.productName.textContent() || '';
  }

  /**
   * Get product price
   */
  async getProductPrice(): Promise<string> {
    return await this.productPrice.textContent() || '';
  }

  /**
   * Increase quantity
   */
  async increaseQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
  }

  /**
   * Add product to cart
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }


  /**
   * Write a review
   */
  async writeReview(name: string, email: string, review: string): Promise<void> {
    await this.reviewNameInput.fill(name);
    await this.reviewEmailInput.fill(email);
    await this.reviewTextInput.fill(review);
    await this.submitReviewButton.click();
  }
}

/**
 * Dashboard / Account Page - Logged in user dashboard
 */
export class DashboardPage extends BasePage {
  readonly loggedInAsText: Locator;
  readonly deleteAccountButton: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly logoutButton: Locator;
  readonly accountInformationSection: Locator;
  readonly ordersSection: Locator;

  constructor(page: Page) {
    super(page);
    this.loggedInAsText = page.locator('li').filter({ hasText: /Logged in as/i });
    this.deleteAccountButton = page.getByRole('link', { name: /Delete Account/i });
    this.downloadInvoiceButton = page.getByRole('link', { name: /Download Invoice/i });
    this.logoutButton = page.getByRole('link', { name: /Logout/i });
    this.accountInformationSection = page.locator('div').filter({ hasText: /Account Information/i });
    this.ordersSection = page.locator('div').filter({ hasText: /Your Orders/i });
  }

  /**
   * Navigate to account page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/account`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify user is logged in
   */
  async verifyLoggedInAsVisible(): Promise<boolean> {
    try {
      return await this.loggedInAsText.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Get the logged in username text
   */
  async getLoggedInUsername(): Promise<string> {
    const text = await this.loggedInAsText.textContent();
    return text || '';
  }

  /**
   * Click delete account button
   */
  async clickDeleteAccount(): Promise<void> {
    await this.deleteAccountButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click logout button
   */
  async clickLogout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if orders are visible
   */
  async areOrdersVisible(): Promise<boolean> {
    try {
      return await this.ordersSection.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }
}

/**
 * Account Deleted Page - Confirmation page after account deletion
 */
export class AccountDeletedPage extends BasePage {
  readonly deletedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.deletedHeading = page.locator('h2[data-qa="account-deleted"]').or(
      page.locator('h2').filter({ hasText: /ACCOUNT DELETED!/i })
    );
    this.continueButton = page.locator('a[data-qa="continue-button"]').or(
      page.getByRole('link', { name: /Continue/i })
    );
  }

  /**
   * Verify account deleted message is visible
   */
  async verifyAccountDeletedMessageVisible(): Promise<boolean> {
    try {
      return await this.deletedHeading.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Get the account deleted heading text
   */
  async getAccountDeletedMessage(): Promise<string> {
    return await this.deletedHeading.textContent() || '';
  }

  /**
   * Click continue button
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Cart Page - Shopping cart view
 */
export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedCheckoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly quantityInputs: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('table tbody tr');
    this.emptyCartMessage = page.locator('p').filter({ hasText: /Your cart is empty/i });
    this.proceedCheckoutButton = page.getByRole('link', { name: /Proceed To Checkout/i });
    this.continueShoppingButton = page.getByRole('link', { name: /Continue Shopping/i });
    this.quantityInputs = page.locator('input[name="quantity"]');
    this.removeButtons = page.getByRole('link', { name: /Remove from cart/i });
  }

  /**
   * Navigate to cart page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/view_cart`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Verify cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    try {
      return await this.emptyCartMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.proceedCheckoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Remove item from cart by index
   */
  async removeItemByIndex(index: number): Promise<void> {
    const buttons = await this.removeButtons.all();
    if (index < buttons.length) {
      await buttons[index].click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
}

/**
 * Checkout Page - Order checkout and payment
 */
export class CheckoutPage extends BasePage {
  readonly commentInput: Locator;
  readonly placeOrderButton: Locator;
  readonly paymentDetailsSection: Locator;
  readonly cardNumberInput: Locator;
  readonly cvvInput: Locator;
  readonly expiryInput: Locator;
  readonly nameOnCardInput: Locator;
  readonly payButton: Locator;

  constructor(page: Page) {
    super(page);
    this.commentInput = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a[data-qa="place-order"]').or(
      page.getByRole('link', { name: /Place Order/i })
    );
    this.paymentDetailsSection = page.locator('div').filter({ hasText: /Payment Details/i });
    this.cardNumberInput = page.locator('input[name="card_number"]');
    this.cvvInput = page.locator('input[placeholder="ex. 311"]');
    this.expiryInput = page.locator('input[placeholder="MM/YY"]');
    this.nameOnCardInput = page.locator('input[name="name_on_card"]');
    this.payButton = page.locator('button[id="submit"]').or(page.getByRole('button', { name: /Pay/i }));
  }

  /**
   * Navigate to checkout page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/checkout`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Add order comment
   */
  async addComment(comment: string): Promise<void> {
    await this.commentInput.fill(comment);
  }

  /**
   * Place order
   */
  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill payment details
   */
  async fillPaymentDetails(
    cardNumber: string,
    cvv: string,
    expiry: string,
    nameOnCard: string
  ): Promise<void> {
    await this.cardNumberInput.fill(cardNumber);
    await this.cvvInput.fill(cvv);
    await this.expiryInput.fill(expiry);
    await this.nameOnCardInput.fill(nameOnCard);
  }

  /**
   * Submit payment
   */
  async submitPayment(): Promise<void> {
    await this.payButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Contact Us Page - Contact form
 */
export class ContactUsPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly fileUploadInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('input[data-qa="name"]').or(page.locator('input[name="name"]'));
    this.emailInput = page.locator('input[data-qa="email"]').or(page.locator('input[name="email"]'));
    this.subjectInput = page.locator('input[data-qa="subject"]').or(page.locator('input[name="subject"]'));
    this.messageInput = page.locator('textarea[data-qa="message"]').or(page.locator('textarea[name="message"]'));
    this.fileUploadInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('button[data-qa="submit-button"]').or(page.getByRole('button', { name: /Submit/i }));
    this.successMessage = page.locator('div').filter({ hasText: /Success|Thank you/i }).first();
  }

  /**
   * Navigate to contact us page
   */
  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/contact_us`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill contact form
   */
  async fillContactForm(
    name: string,
    email: string,
    subject: string,
    message: string
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.subjectInput.fill(subject);
    await this.messageInput.fill(message);
  }

  /**
   * Upload file
   */
  async uploadFile(filePath: string): Promise<void> {
    await this.fileUploadInput.setInputFiles(filePath);
  }

  /**
   * Submit contact form
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if success message is visible
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      return await this.successMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }
}
