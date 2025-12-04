const ExcelJS = require('exceljs');

async function createTestDataFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cart Checkout');

  // Add headers
  const headers = ['Test ID', 'Product Name', 'Quantity', 'Price', 'Coupon Code', 'Expected Discount', 'Shipping', 'Payment Method', 'Test Description'];
  
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Add test data
  const testData = [
    ['CART-001', 'Blue Top', 2, 500, 'SAVE10', 100, 'Free', 'Credit Card', 'Add product to cart and apply 10% discount'],
    ['CART-002', 'Men Tshirt', 1, 400, 'SAVE20', 80, 'Express', 'Debit Card', 'Single item checkout with express shipping'],
    ['CART-003', 'Sleeveless Dress', 3, 1000, 'FLAT50', 150, 'Standard', 'PayPal', 'Multiple items with flat discount'],
    ['CART-004', 'Stylish Dress', 1, 1500, '', 0, 'Free', 'Credit Card', 'Checkout without coupon'],
    ['CART-005', 'Winter Top', 2, 600, 'NEWUSER', 120, 'Standard', 'Debit Card', 'New user discount code'],
    ['CART-006', 'Summer Top', 1, 400, 'BULK10', 40, 'Express', 'Credit Card', 'Bulk purchase discount'],
    ['CART-007', 'Premium Dress', 2, 2000, 'VIP25', 500, 'Free', 'PayPal', 'VIP member special pricing'],
    ['CART-008', 'Casual Shirt', 1, 350, 'WELCOME5', 17.5, 'Standard', 'Credit Card', 'Welcome discount for new customers']
  ];

  testData.forEach(data => {
    worksheet.addRow(data);
  });

  // Adjust column widths
  worksheet.columns = [
    { width: 12 },
    { width: 18 },
    { width: 10 },
    { width: 10 },
    { width: 15 },
    { width: 17 },
    { width: 12 },
    { width: 15 },
    { width: 40 }
  ];

  // Save file
  await workbook.xlsx.writeFile('/Users/banus2/Desktop/playwright-framework/test-data/cart-checkout-test-data.xlsx');
  console.log('✅ Excel test data file created: cart-checkout-test-data.xlsx');
  console.log(`📊 Total test cases: ${testData.length}`);
}

createTestDataFile().catch(err => console.error('❌ Error:', err));
