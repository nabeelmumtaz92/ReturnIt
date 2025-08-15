// Environment configuration for Returnly platform
export interface EnvironmentConfig {
  allowPublicRegistration: boolean;
  allowPublicLogin: boolean;
  allowGoogleAuth: boolean;
  allowDriverSignup: boolean;
  enableDemoMode: boolean;
  restrictToWhitelist: boolean;
  whitelistedEmails: string[];
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  // Default configuration for development
  const defaultConfig: EnvironmentConfig = {
    allowPublicRegistration: true,
    allowPublicLogin: true,
    allowGoogleAuth: true,
    allowDriverSignup: true,
    enableDemoMode: true,
    restrictToWhitelist: false,
    whitelistedEmails: []
  };

  // Production configuration - restricted access
  const productionConfig: EnvironmentConfig = {
    allowPublicRegistration: false,
    allowPublicLogin: false,
    allowGoogleAuth: false,
    allowDriverSignup: false,
    enableDemoMode: false,
    restrictToWhitelist: true,
    whitelistedEmails: [
      // Primary authorized account for mobile app testing
      'nabeelmumtaz92@gmail.com',
      // Admin accounts
      'admin@returnly.tech',
      'demo@returnly.tech',
    ]
  };

  // Staging configuration - limited access
  const stagingConfig: EnvironmentConfig = {
    allowPublicRegistration: false,
    allowPublicLogin: true,
    allowGoogleAuth: true,
    allowDriverSignup: false,
    enableDemoMode: true,
    restrictToWhitelist: true,
    whitelistedEmails: [
      // Primary authorized account for mobile app testing
      'nabeelmumtaz92@gmail.com',
      'admin@returnly.tech',
      'demo@returnly.tech',
      'test@returnly.tech',
    ]
  };

  // Custom configuration via environment variables
  if (process.env.RETURNLY_ENV_CONFIG) {
    try {
      return JSON.parse(process.env.RETURNLY_ENV_CONFIG);
    } catch (error) {
      console.warn('Invalid RETURNLY_ENV_CONFIG, using defaults');
    }
  }

  // Select configuration based on environment
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return defaultConfig;
  }
}

export const envConfig = getEnvironmentConfig();

// Helper functions for access control
export function isEmailWhitelisted(email: string): boolean {
  if (!envConfig.restrictToWhitelist) return true;
  return envConfig.whitelistedEmails.includes(email.toLowerCase());
}

export function canRegister(): boolean {
  return envConfig.allowPublicRegistration;
}

export function canLogin(): boolean {
  return envConfig.allowPublicLogin;
}

export function canUseGoogleAuth(): boolean {
  return envConfig.allowGoogleAuth;
}

export function canSignupAsDriver(): boolean {
  return envConfig.allowDriverSignup;
}

export function isDemoMode(): boolean {
  return envConfig.enableDemoMode;
}