# Affiliate Network Connectors

This directory contains API connectors for major affiliate networks: Impact.com, Rakuten Advertising, and CJ (Commission Junction).

## Architecture

- **BaseConnector**: Abstract class defining the standard interface for all affiliate network integrations
- **Network-specific connectors**: ImpactConnector, RakutenConnector, CJConnector
- **Factory pattern**: `createConnectorFromEnv()` automatically creates connectors from environment variables

## Environment Variables

### Impact.com
```bash
IMPACT_ACCOUNT_SID=your_account_sid_here
IMPACT_AUTH_TOKEN=your_auth_token_here
```

**How to get credentials:**
1. Log into your Impact.com partner account
2. Navigate to Account Settings → Technical → API
3. Click "Create Access Token"
4. Enter a token name and description
5. Select required scopes (Catalogs, Actions, Reports)
6. Copy Account SID and Auth Token

**Documentation:** https://integrations.impact.com/impact-publisher

---

### Rakuten Advertising
```bash
RAKUTEN_CLIENT_ID=your_client_id_here
RAKUTEN_CLIENT_SECRET=your_client_secret_here
RAKUTEN_SCOPE_ID=your_scope_id_here
```

**How to get credentials:**
1. Log into Rakuten Advertising Publisher Dashboard
2. Navigate to "Links and Web Services"
3. Access the Developer Portal (nine-dot menu → Developer Portal)
4. Generate OAuth credentials (Client ID, Client Secret)
5. Copy the Scope ID for your account

**Documentation:** https://developers.rakutenadvertising.com/

---

### CJ (Commission Junction)
```bash
CJ_ACCESS_TOKEN=your_personal_access_token_here
CJ_PUBLISHER_ID=your_publisher_id_here
```

**How to get credentials:**
1. Log into your CJ account
2. Navigate to Account Settings
3. Generate a Personal Access Token for API access
4. Find your Publisher ID (PID) in your account profile

**Documentation:** https://developers.cj.com/

---

## Usage

### Basic Usage

```typescript
import { createConnectorFromEnv, getAllConfiguredConnectors } from './affiliateConnectors';

// Create a single connector
const impactConnector = createConnectorFromEnv('impact');

// Get all configured connectors
const connectors = getAllConfiguredConnectors();

// Authenticate
await impactConnector.authenticate();

// Fetch offers
const offers = await impactConnector.fetchOffers({
  category: 'Fashion',
  limit: 50,
});

console.log(offers);
```

### Direct Instantiation

```typescript
import { ImpactConnector, RakutenConnector, CJConnector } from './affiliateConnectors';

// Impact.com
const impact = new ImpactConnector({
  accountSid: 'YOUR_ACCOUNT_SID',
  authToken: 'YOUR_AUTH_TOKEN',
});

// Rakuten
const rakuten = new RakutenConnector({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopeId: 'YOUR_SCOPE_ID',
});

// CJ
const cj = new CJConnector({
  accessToken: 'YOUR_ACCESS_TOKEN',
  publisherId: 'YOUR_PUBLISHER_ID',
});
```

---

## API Methods

All connectors implement the following methods:

### `authenticate(): Promise<boolean>`
Authenticates with the affiliate network. Returns true if successful.

### `validateCredentials(): Promise<boolean>`
Validates API credentials without full authentication. Returns true if credentials are valid.

### `fetchOffers(options?): Promise<AffiliateOffer[]>`
Fetches available offers from the network.

**Options:**
- `category?: string` - Filter by category
- `advertiser?: string` - Filter by advertiser
- `limit?: number` - Maximum number of results (default: 100)
- `offset?: number` - Pagination offset
- `catalogId?: string` - (Impact.com only) Specific catalog ID to fetch from

**Important - Impact.com Pagination:**
- Multi-catalog mode (no catalogId specified) only supports offset=0 (first page)
- For paginated requests with offset > 0, you must specify a catalogId
- This ensures correct pagination behavior across the API

Example:
```typescript
// First request: get offers without catalogId (first page from all catalogs)
const firstPage = await impactConnector.fetchOffers({ limit: 50 });

// For pagination: specify a catalogId
const secondPage = await impactConnector.fetchOffers({ 
  catalogId: 'specific-catalog-id',
  limit: 50, 
  offset: 50 
});
```

### `getRateLimits(): { requestsPerMinute: number; requestsPerDay?: number }`
Returns the network's API rate limits.

---

## Standard Offer Format

All connectors normalize offers to this standard format:

```typescript
interface AffiliateOffer {
  networkOfferId: string;       // Unique ID from the network
  network: string;              // 'impact', 'rakuten', or 'cj'
  advertiserName: string;       // Brand/advertiser name
  advertiserId?: string;        // Advertiser ID
  title: string;                // Offer title
  description: string;          // Offer description
  category?: string;            // Product category
  trackingUrl: string;          // Affiliate tracking link
  imageUrl?: string;            // Offer image URL
  commissionRate?: number;      // Commission percentage
  expiresAt?: Date;             // Expiration date
  terms?: string;               // Terms and conditions
  couponCode?: string;          // Promo/coupon code (if applicable)
  isActive: boolean;            // Whether offer is currently active
  lastSyncedAt: Date;           // Last sync timestamp
}
```

---

## Rate Limits

Each network has different rate limits:

| Network | Requests/Minute | Requests/Day |
|---------|----------------|--------------|
| Impact.com | 120 | 50,000 |
| Rakuten | 100 | 25,000 |
| CJ | 120 | 10,000 |

The connectors include automatic timeout handling (30-second default).

---

## Error Handling

All connectors include consistent error handling:

```typescript
try {
  const offers = await connector.fetchOffers();
} catch (error) {
  console.error('Error fetching offers:', error.message);
}
```

Errors are logged with the network name prefix for easy debugging:
- `[impact] Error in fetchOffers: ...`
- `[rakuten] Error in authenticate: ...`
- `[cj] Error in validateCredentials: ...`

---

## Security Best Practices

1. **Never commit API credentials** - Always use environment variables
2. **Use Replit Secrets** - Store sensitive credentials in Replit's secret manager
3. **Rotate tokens regularly** - Most networks support token rotation
4. **Use scoped tokens** - Request only the permissions you need
5. **Monitor rate limits** - Implement proper rate limiting to avoid API bans

---

## Testing

To test a connector without production credentials:

```typescript
// Check if connector is configured
const connector = createConnectorFromEnv('impact');
if (!connector) {
  console.log('Impact.com not configured');
  return;
}

// Validate credentials
const isValid = await connector.validateCredentials();
console.log('Credentials valid:', isValid);

// Test fetching offers
const offers = await connector.fetchOffers({ limit: 5 });
console.log(`Fetched ${offers.length} offers`);
```

---

## Next Steps

1. Sign up for affiliate network accounts (Impact, Rakuten, CJ)
2. Generate API credentials for each network
3. Add credentials to Replit Secrets
4. Test connectors using the validation methods
5. Implement offer sync worker to pull offers automatically
