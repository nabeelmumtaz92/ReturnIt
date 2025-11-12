# Google Places API Setup Guide

## Current Status
- **API Key:** Configured in environment (`VITE_GOOGLE_MAPS_API_KEY`)
- **Places API Status:** ❌ NOT ENABLED (Text Search endpoint returns "REQUEST_DENIED")
- **Current Store Count:** 78 manually curated St. Louis stores
- **Target Store Count:** 600+ St. Louis area retail locations

## Required Setup Steps

### 1. Enable Google Places API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **"APIs & Services"** > **"Library"**
4. Search for **"Places API"** and click on it
5. Click **"ENABLE"** button
6. Also enable **"Places API (New)"** if available

### 2. Configure API Restrictions (Recommended)

To secure your API key and prevent unauthorized usage:

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click on your API key
3. Under **"API restrictions"**, select **"Restrict key"**
4. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
5. Under **"Website restrictions"**, add your domains:
   - `returnit.online`
   - `*.returnit.online`
   - `*.replit.app` (for development)
   - `localhost:5000` (for local development)

### 3. Verify API Access

Once enabled, test the API:

```bash
# Run the sync script
npm run sync-stores

# Or test manually with curl:
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Target+St+Louis+MO&key=YOUR_API_KEY"
```

## Store Sync Script Usage

### Manual Sync
```bash
npm run sync-stores
```

### What It Does
- Searches for major retailers in St. Louis area (63+ brands)
- Uses Google Places Text Search API to find store locations
- Validates addresses and extracts structured data
- Automatically applies return policies based on retailer name
- Stores data in `store_locations` table

### Retailer Coverage
The script searches for these retailer categories:

**Major Chains (Accept Third-Party Returns):**
- Target, Kohl's, JCPenney, Macy's, Nordstrom
- Lowe's, Gap, Barnes & Noble, H&M, REI, IKEA
- Nike, Adidas, Sephora, Ulta, Whole Foods

**Major Chains (Do NOT Accept Third-Party Returns):**
- Walmart, Best Buy, Costco, Sam's Club, Home Depot
- Apple, Schnucks, Dierbergs, and more

### Return Policy Data
The sync script automatically applies the comprehensive 2025 return policies to all stores based on retailer name mapping (see `server/services/placesSync.ts`).

## Troubleshooting

### Error: "REQUEST_DENIED"
- **Cause:** Places API not enabled in Google Cloud Console
- **Solution:** Follow Step 1 above to enable the API

### Error: "OVER_QUERY_LIMIT"
- **Cause:** Too many API requests or billing not enabled
- **Solution:** 
  - Enable billing in Google Cloud Console
  - Check your API quotas under "APIs & Services" > "Quotas"
  - Consider implementing request throttling in the sync script

### Error: "ZERO_RESULTS"
- **Cause:** Search query too specific or location not found
- **Solution:** Check retailer name spelling in `RETAILERS` array in `placesSync.ts`

## Cost Estimates

**Google Places API Pricing (as of 2025):**
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests

**Estimated Costs for ReturnIt:**
- Initial sync (600 stores): ~$20-30
- Monthly maintenance syncs: ~$5-10

**Free Tier:**
- Google provides $200/month free credit
- Sufficient for ReturnIt's needs

## Future Enhancements

1. **Scheduled Syncs:** Set up cron job to sync stores weekly
2. **Incremental Updates:** Only fetch new/changed stores
3. **Store Hours Integration:** Add operating hours from Places API
4. **Rating Data:** Include Google ratings/reviews
5. **Phone Numbers:** Add store contact information
6. **Photo URLs:** Store business photos for UI display

## Additional Resources

- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Places API (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [Google Cloud Console](https://console.cloud.google.com)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
