# UDENSROZE Property Scraper - Deployment Guide

## Prerequisites
- Google Account with access to Google Apps Script
- Google Sheets access
- Basic understanding of Google Apps Script
- Access to the target real estate platforms (immobiliare.it, gate-away.com, idealista.it)

## Current Deployment Status
✅ **DEPLOYED AND OPERATIONAL** - December 3, 2025

The scraper is currently running in production mode with daily automated executions.

## Architecture Overview

### Components
1. **Google Apps Script Project (UDENSROZE_Scraping)**
   - Project ID: 1w1PyMp26At3JwUO_WiDJzUI_7pXqGxtYbsoYt0Twatd8layZlRFKVN11
   - Type: Web App Deployment
   - Runtime: Google Apps Script runtime

2. **Google Sheets (Data Storage)**
   - Sheet Name: UDENSROZE_Master_Properties
   - Purpose: Central repository for all scraped property data
   - Access: Real-time data serving to dashboard

3. **Dashboard (Web Frontend)**
   - URL: https://ian.tech/real-estate-search/dashboard.html
   - Purpose: Visualization and real-estate search interface
   - Refresh Rate: Every 5 minutes

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/zalart-pixel/udensroze-property-scraper.git
cd udensroze-property-scraper
```

### Step 2: Create Google Apps Script Project
1. Go to https://script.google.com
2. Click "Create Project"
3. Name: "UDENSROZE_Scraping"
4. Copy contents of Code.gs into the default file
5. Create a new file named "Scraper.gs"
6. Copy contents of Scraper.gs from this repository

### Step 3: Configure Google Sheets
1. Create a new Google Sheet named "UDENSROZE_Master_Properties"
2. Set up header row with columns:
   - Property ID
   - Title
   - Location
   - Price
   - Land Area (m²)
   - Sea View
   - Source Platform
   - URL
   - Last Updated
   - Description

### Step 4: Configure Apps Script Settings
1. In Apps Script editor, go to Project Settings
2. Enable the following APIs:
   - Google Sheets API
   - UrlFetch Service (for web scraping)
3. Set execution timeout to maximum (6 minutes)

### Step 5: Deploy as Web App
1. Click "Deploy" → "New Deployment"
2. Select type: "Web app"
3. Execute as: Your account
4. Who has access: Anyone
5. Click Deploy
6. Note the deployment URL for API calls

### Step 6: Set Up Trigger for Daily Execution
1. In Apps Script, click on Triggers (clock icon)
2. Click "Create new trigger"
3. Configure:
   - Function: `scrapeAndUpdateProperties`
   - Event source: Time-driven
   - Type: Day timer
   - Time: 11:00 PM (23:00 EET)
4. Save

### Step 7: Connect Dashboard
1. Update dashboard configuration with:
   - Sheet ID: [Your UDENSROZE_Master_Properties Sheet ID]
   - Web App URL: [Your deployed Apps Script URL]
2. Test data retrieval from Apps Script endpoint

## Testing the Scraper

### Manual Test Run
```javascript
// In Apps Script console, run:
testScraper();
```

Expected output:
- Console logs showing scraped property count
- No error messages
- Successful update to Google Sheets

### Verify Data Collection
1. Open UDENSROZE_Master_Properties sheet
2. Check for new properties added in the last row
3. Verify all columns have data
4. Confirm URLs point to actual listings

### Dashboard Verification
1. Navigate to https://ian.tech/real-estate-search/dashboard.html
2. Verify properties are displayed
3. Check filter functionality
4. Confirm price and location data matches Google Sheets

## Monitoring & Maintenance

### Daily Checks
- Monitor Apps Script execution logs for errors
- Verify new properties appear in Google Sheets
- Check dashboard updates every 5 minutes

### Weekly Tasks
- Review failed executions (if any) in execution history
- Verify all three platforms are returning data
- Check for any changes to website structure

### Monthly Reviews
- Analyze data quality and completeness
- Update search criteria if needed
- Review platform changes that might affect scraping

## Troubleshooting

### Issue: "Script function not found: dailyExport"
**Solution:** This is a legacy error from previous trigger configuration. The new scraper uses `scrapeAndUpdateProperties()` function. Old triggers can be safely deleted from the Triggers page.

### Issue: No data appearing in Google Sheets
**Solution:** 
1. Check if Web App is properly deployed
2. Verify Apps Script has access to Google Sheets
3. Check execution logs for specific error messages
4. Test `testScraper()` function manually

### Issue: Dashboard showing no properties
**Solution:**
1. Verify Sheet ID is correctly configured in dashboard
2. Check if Google Sheets API is enabled
3. Verify CORS settings if using cross-origin requests
4. Check browser console for JavaScript errors

### Issue: Scraper takes too long (timeout)
**Solution:**
1. Reduce number of pages scraped per site
2. Optimize network requests in Scraper.gs
3. Consider splitting scraping into separate triggers
4. Increase Apps Script timeout to maximum 6 minutes

## Performance Optimization

### Scraping Speed
- Parallel requests to multiple platforms
- Caching of previous results to avoid duplicates
- Optimized CSS selectors for faster DOM parsing

### Data Storage
- Only store properties matching criteria
- Limit sheet size to last 500 results
- Archive old data monthly

## API Reference

### Main Functions

**scrapeAndUpdateProperties()**
- Purpose: Main orchestration function
- Parameters: None
- Returns: Number of properties added
- Schedule: Daily at 11:00 PM EET

**scrapeImmobiliare()**
- Purpose: Scrape immobiliare.it listings
- Returns: Array of property objects

**scrapeGateAway()**
- Purpose: Scrape gate-away.com luxury properties
- Returns: Array of property objects

**scrapeIdeaLista()**
- Purpose: Scrape idealista.it listings
- Returns: Array of property objects

**updateMasterSheet(rowData)**
- Purpose: Add new row to Google Sheets
- Parameters: Array of column values
- Returns: Boolean success indicator

**testScraper()**
- Purpose: Test scraper functionality
- Parameters: None
- Returns: Test results summary

## Security Considerations

1. **API Keys**: Do not commit API keys or credentials to repository
2. **Sheet Sharing**: Keep UDENSROZE_Master_Properties private
3. **Web App Access**: Currently set to "Anyone" - consider restricting if needed
4. **Rate Limiting**: Monitor for IP blocks from target websites
5. **User Agent**: Scraper uses appropriate user-agent headers

## Future Enhancements

- [ ] Add support for additional Italian real estate platforms
- [ ] Implement machine learning for property value prediction
- [ ] Add email notifications for new matching properties
- [ ] Create property comparison analytics
- [ ] Implement price trend tracking
- [ ] Add mortgage calculation tools

## Support & Documentation

- **Status Report:** See PROJECT_STATUS.md
- **Code Documentation:** Inline comments in Code.gs and Scraper.gs
- **Repository:** https://github.com/zalart-pixel/udensroze-property-scraper
- **Issues:** GitHub Issues page for bug reports and feature requests

## Last Updated
December 3, 2025
