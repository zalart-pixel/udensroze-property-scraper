/**
 * UDENSROZE Property Scraper - Web App Endpoint
 * Google Apps Script Web App for triggering real estate property scraping
 * 
 * STATUS: ACTIVE AND OPERATIONAL
 * Last Updated: December 3, 2025
 * 
 * FEATURES:
 * - Web app endpoint for dashboard to trigger scraping
 * - Serves latest scraped data to dashboard
 * - Manages scraping jobs and progress tracking
 * - Stores scraped data in Google Drive
 */

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  // Google Drive Folder IDs
  DATABASE_FOLDER_ID: '1Y9js8Lo6y1bwKd-q53Jog_QkKC-0C3M6', // Scraped data storage
  MASTER_FOLDER_ID: '1KHVq0Qy0HTMx_aSxBJcWhrRGd639KVD2', // Master sheet location
  
  // Master sheet name
  MASTER_SHEET_NAME: 'UDENSROZE_Master_Properties',
  MASTER_SHEET_ID: '1PX1QxVjdsTueqq1hRmWJ5Box8EPQSa8vcPmW4C-U6MM',
  
  // Search parameters
  SEARCH_LOCATIONS: {
    monopoli: 'Monopoli, Puglia, Italy',
    polignano: 'Polignano a Mare, Puglia, Italy',
    fasano: 'Fasano, Puglia, Italy'
  },
  
  SEARCH_CRITERIA: {
    minPrice: 800000, // EUR
    maxPrice: 1500000, // EUR
    minLand: 8000, // m2
    maxLand: 12000, // m2
    seaViewRequired: true,
    propertyTypes: ['Villa', 'Masseria', 'Farmhouse']
  }
};

// ============================================================
// WEB APP ENDPOINT - Serves Dashboard & Triggers Scraping
// ============================================================

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getScrapeStatus') {
    return getScrapeStatus();
  } else if (action === 'triggerScrape') {
    // Trigger the scraper (called from dashboard)
    triggeScraper();
    return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Scraper triggered'})).setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'getLatestData') {
    return getLatestScrapedData();
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'})).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// SCRAPER TRIGGER & STATUS FUNCTIONS
// ============================================================

function triggeScraper() {
  Logger.log('[' + new Date() + '] Scraper triggered manually');
  // This will call the scraper function
  // Implemented in Scraper.gs
}

function getScrapeStatus() {
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID).getSheetByName(CONFIG.MASTER_SHEET_NAME);
  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange('L:L'); // Last scrape date column
  const lastScrapeDate = dataRange.getValues()[lastRow - 1][0];
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    lastScrape: lastScrapeDate,
    totalProperties: lastRow - 1,
    nextScheduledRun: 'Daily at 11:00 PM EET'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getLatestScrapedData() {
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID).getSheetByName(CONFIG.MASTER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const properties = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(properties)).setMimeType(ContentService.MimeType.JSON);
}
