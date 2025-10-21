// API Configuration
export const API_BASE_URL = 'https://returnit.online';

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  JOBS_AVAILABLE: '/api/driver/jobs/available',
  JOB_ACCEPT: '/api/driver/jobs/accept',
  JOB_COMPLETE: '/api/driver/jobs/complete',
  EARNINGS: '/api/driver/earnings',
  PAYOUT: '/api/driver/payout',
  PROFILE: '/api/driver/profile',
};

export const PAYOUT_SPLIT = {
  DRIVER: 0.70,
  PLATFORM: 0.30,
};
