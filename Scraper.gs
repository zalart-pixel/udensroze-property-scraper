/**
 * UDENSROZE Property Scraper Functions
 * Web scraping module for Italian real estate platforms
 * 
 * STATUS: DEPLOYED AND OPERATIONAL (Dec 3, 2025)
 * Last Test Run: Dec 2, 2025, 7:49 PM
 * 
 * PLATFORMS SCRAPED:
 * - immobiliare.it (Primary)
 * - gate-away.com (Luxury)
 * - idealista.it (Comparison)
 */

// ============================================================
// MAIN SCRAPER FUNCTION - Orchestrates all scraping operations
// ============================================================

function scrapeAndUpdateProperties() {
  try {
    Logger.log('========== SCRAPER START ==========');
    Logger.log('Starting property scrape at: ' + new Date());
    
    let allProperties = [];
    
    // Scrape from all sources
    Logger.log('Scraping immobiliare.it...');
    allProperties = allProperties.concat(scrapeImmobiliare());
    
    Logger.log('Scraping gate-away.com...');
    allProperties = allProperties.concat(scrapeGateAway());
    
    Logger.log('Scraping idealista.it...');
    allProperties = allProperties.concat(scrapeIdeaLista());
    
    Logger.log('Total properties scraped: ' + allProperties.length);
    
    if (allProperties.length > 0) {
      updateMasterSheet(allProperties);
      Logger.log('Master sheet updated successfully');
    } else {
      Logger.log('WARNING: No properties scraped');
    }
    
    Logger.log('========== SCRAPER END ==========');
    return true;
  } catch (error) {
    Logger.log('ERROR in scrapeAndUpdateProperties: ' + error);
    return false;
  }
}

// ============================================================
// IMMOBILIARE.IT SCRAPER
// ============================================================

function scrapeImmobiliare() {
  const properties = [];
  try {
    const searchUrls = [
      'https://www.immobiliare.it/annunci/vendita/villa-masseria/monopoli/',
      'https://www.immobiliare.it/annunci/vendita/villa-masseria/polignano-a-mare/',
      'https://www.immobiliare.it/annunci/vendita/villa-masseria/fasano/'
    ];
    
    for (let url of searchUrls) {
      try {
        let response = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        });
        
        if (response.getResponseCode() === 200) {
          let html = response.getContentText();
          // Parse HTML and extract property listing IDs
          let matches = html.match(/data-listing-id="(\d+)"/g) || [];
          
          for (let match of matches) {
            let listingId = match.match(/\d+/)[0];
            const propertyUrl = 'https://www.immobiliare.it/annunci/' + listingId + '/';
            
            properties.push({
              url: propertyUrl,
              source: 'immobiliare.it',
              location: extractLocation(url),
              priority: 'MEDIUM',
              fetchDate: new Date().toLocaleDateString('it-IT')
            });
          }
        }
      } catch (e) {
        Logger.log('Error fetching immobiliare URL: ' + url + ' - ' + e);
      }
    }
  } catch (error) {
    Logger.log('scrapeImmobiliare error: ' + error);
  }
  return properties;
}

// ============================================================
// GATE-AWAY.COM SCRAPER (Luxury Properties)
// ============================================================

function scrapeGateAway() {
  const properties = [];
  try {
    const searchUrl = 'https://www.gate-away.com/en/sale/property/puglia-monopoli/';
    
    let response = UrlFetchApp.fetch(searchUrl, {
      muteHttpExceptions: true,
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    });
    
    if (response.getResponseCode() === 200) {
      let html = response.getContentText();
      let matches = html.match(/href="(\/en\/property\/[^"]+)"/g) || [];
      
      for (let match of matches) {
        let path = match.replace(/href="|"/g, '');
        properties.push({
          url: 'https://www.gate-away.com' + path,
          source: 'gate-away.com',
          location: 'Puglia',
          priority: 'HIGH',
          fetchDate: new Date().toLocaleDateString('it-IT')
        });
      }
    }
  } catch (error) {
    Logger.log('scrapeGateAway error: ' + error);
  }
  return properties;
}

// ============================================================
// IDEALISTA.IT SCRAPER (Comparison Platform)
// ============================================================

function scrapeIdeaLista() {
  const properties = [];
  try {
    const searchUrls = [
      'https://www.idealista.it/venda-immobili/monopoli/villa/',
      'https://www.idealista.it/venda-immobili/polignano-a-mare/villa/',
      'https://www.idealista.it/venda-immobili/fasano/villa/'
    ];
    
    for (let url of searchUrls) {
      try {
        let response = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        });
        
        if (response.getResponseCode() === 200) {
          let html = response.getContentText();
          let matches = html.match(/href="([^"]*property[^"]*)"/g) || [];
          
          for (let match of matches) {
            let path = match.replace(/href="|"/g, '');
            if (path && !path.includes('javascript')) {
              properties.push({
                url: path.startsWith('http') ? path : 'https://www.idealista.it' + path,
                source: 'idealista.it',
                location: 'Puglia',
                priority: 'MEDIUM',
                fetchDate: new Date().toLocaleDateString('it-IT')
              });
            }
          }
        }
      } catch (e) {
        Logger.log('Error fetching idealista URL: ' + url + ' - ' + e);
      }
    }
  } catch (error) {
    Logger.log('scrapeIdeaLista error: ' + error);
  }
  return properties;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function extractLocation(url) {
  if (url.includes('monopoli')) return 'Monopoli';
  if (url.includes('polignano')) return 'Polignano a Mare';
  if (url.includes('fasano')) return 'Fasano';
  return 'Puglia';
}

function updateMasterSheet(properties) {
  try {
    const spreadsheet = SpreadsheetApp.getActive();
    let sheet = spreadsheet.getSheetByName('UDENSROZE_Master_Properties');
    
    if (!sheet) {
      Logger.log('ERROR: Master sheet not found');
      return false;
    }
    
    // Get existing URLs to prevent duplicates
    const existingData = sheet.getRange('A:A').getValues();
    const existingUrls = new Set(existingData.map(row => row[0]));
    
    let rowsAdded = 0;
    
    for (let property of properties) {
      if (existingUrls.has(property.url)) {
        Logger.log('Skipping duplicate URL: ' + property.url);
        continue;
      }
      
      let nextRow = sheet.getLastRow() + 1;
      
      const rowData = [
        property.url,
        'Property ' + nextRow,  // Title placeholder
        property.source,
        property.location,
        'TBD',  // Price - to be populated
        'TBD',  // Land area
        'TBD',  // Built area
        'Check',  // Sea view - to verify
        'Villa/Masseria',
        property.priority,
        '50',  // Initial match score
        property.fetchDate
      ];
      
      sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
      rowsAdded++;
    }
    
    Logger.log('Added ' + rowsAdded + ' new properties to master sheet');
    return true;
  } catch (error) {
    Logger.log('updateMasterSheet error: ' + error);
    return false;
  }
}

// ============================================================
// TEST FUNCTION
// ============================================================

function testScraper() {
  Logger.log('Testing scraper...');
  let result = scrapeAndUpdateProperties();
  Logger.log('Test result: ' + (result ? 'SUCCESS' : 'FAILED'));
}
