// Marketing & Analytics Tracking Parameters
// Similar to DoorDash's tracking system

export interface TrackingParams {
  utm_source?: string;      // Where traffic came from (google, facebook, email)
  utm_medium?: string;      // Marketing medium (cpc, banner, email)
  utm_campaign?: string;    // Campaign name (summer_sale, driver_recruitment)
  utm_term?: string;        // Paid keywords
  utm_content?: string;     // A/B testing variants
  srsltid?: string;        // Search result tracking ID
  gclid?: string;          // Google Ads click ID
  fbclid?: string;         // Facebook click ID
  ref?: string;            // Referral source
}

/**
 * Captures tracking parameters from URL and stores them
 */
export function captureTrackingParams(): TrackingParams {
  const urlParams = new URLSearchParams(window.location.search);
  
  const params: TrackingParams = {
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    srsltid: urlParams.get('srsltid') || undefined,
    gclid: urlParams.get('gclid') || undefined,
    fbclid: urlParams.get('fbclid') || undefined,
    ref: urlParams.get('ref') || undefined,
  };

  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  ) as TrackingParams;

  // Store in localStorage for attribution tracking
  if (Object.keys(cleanParams).length > 0) {
    localStorage.setItem('returnit_tracking', JSON.stringify(cleanParams));
    localStorage.setItem('returnit_tracking_timestamp', new Date().toISOString());
  }

  return cleanParams;
}

/**
 * Gets stored tracking parameters
 */
export function getStoredTrackingParams(): TrackingParams | null {
  const stored = localStorage.getItem('returnit_tracking');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Generates a shareable tracking URL
 */
export function generateTrackingUrl(
  baseUrl: string,
  source: string,
  medium?: string,
  campaign?: string
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  url.searchParams.set('utm_source', source);
  if (medium) url.searchParams.set('utm_medium', medium);
  if (campaign) url.searchParams.set('utm_campaign', campaign);
  
  // Generate unique tracking ID (similar to DoorDash's srsltid)
  const trackingId = generateTrackingId();
  url.searchParams.set('srsltid', trackingId);
  
  return url.toString();
}

/**
 * Generates a unique tracking ID
 */
function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Clears tracking data (e.g., after conversion)
 */
export function clearTrackingParams(): void {
  localStorage.removeItem('returnit_tracking');
  localStorage.removeItem('returnit_tracking_timestamp');
}

/**
 * Appends tracking params to analytics events
 */
export function getTrackingContext(): Record<string, any> {
  const tracking = getStoredTrackingParams();
  const timestamp = localStorage.getItem('returnit_tracking_timestamp');
  
  return {
    ...tracking,
    tracking_age_hours: timestamp 
      ? Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60))
      : null,
  };
}
