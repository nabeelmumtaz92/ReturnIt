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
  if (posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (posthog.__loaded) {
    posthog.identify(userId, traits);
  }
};

// Reset user (on logout)
export const resetUser = () => {
  if (posthog.__loaded) {
    posthog.reset();
  }
};

// Track page view
export const trackPageView = (pageName?: string) => {
  if (posthog.__loaded) {
    posthog.capture('$pageview', { page: pageName || window.location.pathname });
  }
};

// Create feature flags hook
export const useFeatureFlag = (flagKey: string) => {
  if (posthog.__loaded) {
    return posthog.isFeatureEnabled(flagKey);
  }
  return false;
};

export default posthog;
