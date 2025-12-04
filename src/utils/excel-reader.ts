import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

/**
 * Interface for Excel test data
 */
export interface ExcelTestData {
  testId: string;
  productName: string;
  quantity: number;
  price: number;
  couponCode?: string;
  expectedDiscount?: number;
  shipping: string;
  paymentMethod: string;
  description: string;
}

/**
 * Utility class for reading Excel test data
 */
export class ExcelReader {
  private static instance: ExcelReader;
  private workbook: ExcelJS.Workbook | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ExcelReader {
    if (!ExcelReader.instance) {
      ExcelReader.instance = new ExcelReader();
    }
    return ExcelReader.instance;
  }

  /**
   * Read Excel file and return data
   */
  async readTestData(
    filePath: string,
    sheetName: string = 'Cart Checkout'
  ): Promise<ExcelTestData[]> {
    try {
      // Resolve file path
      const fullPath = path.resolve(filePath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Excel file not found: ${fullPath}`);
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(fullPath);

      // Get worksheet
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Worksheet "${sheetName}" not found in Excel file`);
      }

      const testData: ExcelTestData[] = [];

      // Skip header row and read data
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const values = row.values as (string | number | undefined)[];
        if (!values || values.length < 2) return; // Skip empty rows

        const data: ExcelTestData = {
          testId: values[1] ? String(values[1]) : '',
          productName: values[2] ? String(values[2]) : '',
          quantity: values[3] ? Number(values[3]) : 1,
          price: values[4] ? Number(values[4]) : 0,
          couponCode: values[5] ? String(values[5]) : '',
          expectedDiscount: values[6] ? Number(values[6]) : 0,
          shipping: values[7] ? String(values[7]) : 'Standard',
          paymentMethod: values[8] ? String(values[8]) : 'Credit Card',
          description: values[9] ? String(values[9]) : ''
        };

        if (data.testId) {
          testData.push(data);
        }
      });

      console.log(`✅ Read ${testData.length} test cases from Excel: ${sheetName}`);
      return testData;
    } catch (error) {
      console.error('❌ Error reading Excel file:', error);
      throw error;
    }
  }

  /**
   * Read specific test data by test ID
   */
  async readTestDataById(
    filePath: string,
    testId: string,
    sheetName: string = 'Cart Checkout'
  ): Promise<ExcelTestData | null> {
    const allData = await this.readTestData(filePath, sheetName);
    return allData.find(data => data.testId === testId) || null;
  }

  /**
   * Read all test data for specific payment method
   */
  async readTestDataByPaymentMethod(
    filePath: string,
    paymentMethod: string,
    sheetName: string = 'Cart Checkout'
  ): Promise<ExcelTestData[]> {
    const allData = await this.readTestData(filePath, sheetName);
    return allData.filter(data => data.paymentMethod === paymentMethod);
  }

  /**
   * Read test data with discount codes only
   */
  async readTestDataWithCoupons(
    filePath: string,
    sheetName: string = 'Cart Checkout'
  ): Promise<ExcelTestData[]> {
    const allData = await this.readTestData(filePath, sheetName);
    return allData.filter(data => data.couponCode && data.couponCode.trim() !== '');
  }
}

export default ExcelReader;
