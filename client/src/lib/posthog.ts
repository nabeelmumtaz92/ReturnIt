import posthog from 'posthog-js';

// Initialize PostHog
export const initPostHog = () => {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;

  if (apiKey && host) {
    posthog.init(apiKey, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'],
        url_allowlist: ['returnit.online', window.location.hostname],
        element_allowlist: ['button', 'a', 'input', 'select', 'textarea'],
        css_selector_allowlist: ['[data-testid]']
      },
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          color: false,
          date: false,
          'datetime-local': false,
          email: false,
          month: false,
          number: false,
          range: false,
          search: false,
          tel: false,
          text: false,
          time: false,
          url: false,
          week: false,
          textarea: false,
          select: false,
        }
      },
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('PostHog initialized');
        }
      }
    });
  } else {
    console.warn('PostHog not initialized: Missing API credentials');
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    // PostHog automatically queues events if not loaded yet, so we can just call capture
    posthog.capture(eventName, properties);
    if (import.meta.env.DEV) {
      console.log('[PostHog] Event tracked:', eventName, properties);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[PostHog] Event tracking failed:', eventName, error);
    }
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  try {
    posthog.identify(userId, traits);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[PostHog] User identification failed:', error);
    }
  }
};

// Reset user (on logout)
export const resetUser = () => {
  try {
    posthog.reset();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[PostHog] Reset failed:', error);
    }
  }
};

// Track page view
export const trackPageView = (pageName?: string) => {
  try {
    posthog.capture('$pageview', { page: pageName || window.location.pathname });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[PostHog] Page view tracking failed:', error);
    }
  }
};

// Create feature flags hook
export const useFeatureFlag = (flagKey: string) => {
  try {
    return posthog.isFeatureEnabled(flagKey) || false;
  } catch (error) {
    return false;
  }
};

export default posthog;
