# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It offers an enterprise-grade solution featuring a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and valuation through a strong patent portfolio, providing a complete customer experience (booking, tracking, order management) and robust admin/driver management.

# Recent Changes (November 6, 2025)

## Secure Admin Password System ✅
- **Database Schema**: Added `admin_passwords` and `reset_nonces` tables to shared/schema.ts for secure password storage with bcrypt hashing.
- **AdminPasswordService**: Created server/services/adminPasswordService.ts with bcrypt encryption (cost factor 12), token versioning, and offline recovery.
- **API Routes**: Added three endpoints at /api/admin/password (verify, change, reset-signed) with rate limiting (5 attempts/minute).
- **Initialization Script**: Created server/scripts/initAdminPassword.ts with placeholder for user to enter secure password.
- **Documentation**: Comprehensive setup guide in ADMIN_PASSWORD_SETUP.md with step-by-step instructions.
- **Rate Limiting**: Integrated rate-limiter-flexible package to prevent brute force attacks.
- **Token Versioning**: Password changes automatically invalidate old sessions to enhance security.

# Recent Changes (November 5, 2025)

## SMS Verification System - Twilio Integration ✅
- **Twilio SMS Service**: Created `server/services/smsVerification.ts` module for sending verification codes via SMS.
- **Backend API Endpoint**: Added `POST /api/auth/send-sms-verification` route to send SMS codes to users' phone numbers.
- **Enhanced Verify Email Page**: Updated verify-email.tsx with "Get Code via Text Message" button as alternative to email verification.
- **Graceful Degradation**: System checks if Twilio is configured; falls back to email-only if SMS unavailable.
- **Configuration**: Requires three Replit secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- **User Experience**: Users can request SMS verification if they haven't received email, uses same verification code for both channels.
- **Error Handling**: Clear error messages for missing phone numbers, SMS service unavailable, or delivery failures.

## Separate Boxes & Bags Input System with Corrected Pricing ✅
- **Independent Package Inputs**: Each item now has separate "Boxes (0-3)" and "Bags (0-5)" inputs, both starting at 0 (no longer required to select 1 box minimum).
- **Database Schema Update**: Added `numberOfBags` column to orders table with default 0; changed `numberOfBoxes` default from 1 to 0.
- **8-Item Total Limit**: Maximum 8 total items (boxes + bags combined) enforced across entire order, with real-time counter showing "Total items: X/8 boxes & bags".
- **Fixed Multi-Package Pricing Bug**: Corrected calculation to charge $3 per package beyond first package **order-wide** (not per-item). Previously gave each item its own "first package free" allowance, resulting in undercharges for multi-item orders.
- **Robust Number Handling**: Explicit type coercion with `parseInt` and `|| 0` fallback prevents pricing errors from empty string values during form editing.
- **Smart Validation**: Prevents adding new items or increasing package counts when at 8-item limit; shows helpful error toasts.
- **UX Improvement**: Users can now clear inputs and retype values without premature snap-to-minimum; empty values normalized only on blur event.
- **Backend Integration**: API routes correctly extract and persist both `numberOfBoxes` and `numberOfBags` to database.

## Photo Upload System Rebuilt & Store Dropdown Enhanced ✅
- **SimplePhotoUploader Component**: Completely rebuilt photo upload system from scratch, replacing complex Uppy modal with native file input and XMLHttpRequest.
- **Fixed Gray-Out Issue**: Upload buttons no longer become disabled or grayed out - users can click to open file picker/camera reliably.
- **Mobile Camera Support**: Native file input with `capture="environment"` automatically opens rear camera on mobile devices.
- **Upload Progress**: Shows real-time "Uploading X%" feedback in button during transfer.
- **Removed Auth Dependency**: Upload completion handlers now use S3 URLs directly without calling auth-protected endpoints, allowing guest users to upload photos.
- **Store Autocomplete - Full Catalog**: Enhanced to show ALL 600+ stores immediately when clicking empty field (limit=1000 for empty query, limit=100 when filtering).
- **Dynamic Limits**: Empty field loads full store catalog, typed queries use smaller limit for performance.
- **Number of Boxes/Bags Input Fixed**: Corrected validation logic to allow users to clear field and retype values without snap-to-1 interference - empty values stored temporarily, normalized to valid range (1 to max) only on blur.

## Upload Modal & Store Autocomplete Fixes ✅
- **Upload Modal Click-Outside Fix**: Enhanced ObjectUploader with proper event listener on `.uppy-Dashboard-overlay` that closes modal when clicking dark background outside modal content.
- **Store Autocomplete Display Fallback**: Added `displayName || storeName` fallback in StoreAutocomplete to prevent blank labels when displayName is null in database.
- **Improved UX**: Modal now closes intuitively by clicking outside or pressing ESC key, matching standard modal behavior.
- **Robust Error Handling**: Store autocomplete gracefully handles null displayName values without crashes.

## Address Autocomplete Dropdown for Pickup Location ✅
- **Google Places Autocomplete Integration**: Replaced manual street address input with AddressAutocomplete component featuring dropdown suggestions.
- **Structured Address Parsing**: Enhanced locationServices.ts to fetch and parse address_components from Google Places API, providing reliable extraction of street number, street, city, state, and ZIP code.
- **Auto-Fill Functionality**: Selecting an address from dropdown automatically populates all related fields (street, city, state, ZIP) with structured data.
- **Initialization Guards**: Added isInitialized state to prevent autocomplete searches before Google Maps API loads, avoiding runtime errors.
- **Graceful Fallback**: Fields remain editable after auto-fill, allowing users to manually correct any values.
- **User Experience**: Includes "Use current location" button for quick address entry via geolocation.

## Google Maps Integration - Production Ready ✅
- **Complete Google Maps Rendering**: Integrated @react-google-maps/api with LoadScript, GoogleMap, Marker, Polyline, and InfoWindow components for full-featured mapping.
- **Runtime Safety Guards**: All `google.maps.*` API references protected with `window.google?.maps` checks to prevent ReferenceError before API loads.
- **Feature Parity**: Supports custom marker colors via SymbolPath.CIRCLE, route polylines with color/width customization, map click handlers, marker onClick callbacks, and auto-fit bounds on load and marker updates.
- **Geolocation Support**: Custom 📍 button (when showGeolocate=true) uses navigator.geolocation to center map on user position with zoom level 15.
- **Map Provider Flexibility**: UniversalMap component supports both Apple Maps (native iOS) and Google Maps (web) via MapProviderType enum.
- **Cleaned Codebase**: Removed all unused Mapbox-gl dependencies and code references for maintainability.

# Recent Changes (November 4, 2025)

## Store Autocomplete - Now Fully Functional ✅
- **Fixed Express route ordering bug**: Moved `/api/stores/search` and `/api/stores/count` routes BEFORE the parameterized `/api/stores/:retailer` route in server/routes.ts (line ~4090). Previously, Express was matching `/api/stores/search` to the `:retailer` route, preventing the search endpoint from executing.
- **Fixed StoreAutocomplete crash**: Removed undefined `store.displayName` field reference in book-return.tsx. Now constructs display value from available API fields: `${store.storeName} - ${store.streetAddress}, ${store.city}, ${store.state}`.
- **Verified end-to-end**: Store autocomplete in booking form (Step 2) now works perfectly - typing "tar" shows 3 Target locations, clicking a store auto-populates all destination fields (name, address, city, state).

# User Preferences

Preferred communication style: Simple, everyday language.

**Code Sync Workflow**: Use GitHub for syncing code between Replit and local Windows machine (C:\Users\nsm21\Desktop\ReturnIt\). Do NOT use VS Code SSH. Workflow: Agent commits/pushes changes in Replit → User runs `git pull` locally → User runs mobile app commands (`npm install`, `eas update`) on local machine.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui (Radix UI, Tailwind CSS) with a custom cardboard/shipping theme (#B8956A and #FAF8F4).
- **State Management**: Zustand (global), React Query (server).
- **Design System**: Figma-based, mobile-first responsive design emphasizing a cardboard brown and masking tape aesthetic.

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Authentication**: Email/Password, Google, Apple, Facebook via Passport.js; role-based authorization.

## Data Storage
- **Database**: PostgreSQL (Neon).
- **Schema Management**: Drizzle Kit.
- **Object Storage**: Replit App Storage (GCS-backed) for file uploads with ACL policies and presigned URLs.

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Store Locations**: Google Places-powered database of 600+ St. Louis retail locations.

## Key Features

### Customer Features
- **Google Places Store Location Integration**: Smart autocomplete with 600+ verified St. Louis store addresses.
- **Authentication-Required Checkout**: Customers must sign in before completing booking and payment.
- **Multiple Items Per Return**: Users can add unlimited items to a single return booking.
- **Mandatory Photo Verification**: Users must upload at least one photo (receipt, tags, or packaging) before completing booking.
- **Customer-Paid Premium Pricing Tiers**: Standard, Priority, Instant options shifting cost to customer for faster service.
- **Enhanced Tip Encouragement**: Pre-selected higher amounts, prominent "100% to driver" messaging, round-up tip, and post-delivery prompts.

### Driver Features
- **Native Mobile App**: React Native with Expo (com.returnit.app) for job management, navigation, and earnings.
- **Real-time Job Notifications**: Expo-notifications with deep linking.
- **GPS Navigation**: Expo-location with Google Maps integration.
- **Multi-Stop Batching**: AI-powered route optimization.
- **Camera Package Verification**: Expo-camera for photo capture.
- **Instant/Weekly Payouts**: Stripe Connect integration with 70/30 split.
- **Instant Pay System**: Add bank accounts or debit cards with comprehensive validation.
- **Stripe Identity Verification**: Complete KYC flow for driver onboarding.
- **Tax Documents Portal**: Access annual 1099-NEC forms.

### Admin Features
- Live operations dashboard, driver/customer management.
- **AI Knowledge Center**: Self-updating AI assistant.
- **Real-Time Driver Tracking**: Interactive map with active driver locations.
- **Driver Identity Verification Management**: Review Stripe Identity verification results.
- **1099 Tax Form System**: Annual tax form generation and distribution.
- **Comprehensive Orders Dashboard**: Full order lifecycle management with real-time data and Stripe refund processing.

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management.
- **Tier 2 (API & Integration System)**: RESTful API, API keys, webhook notification system.

## Security & Compliance
- **Multi-Layer Security Architecture**: Rate limiting, input validation, authentication (session-based, Bcrypt hashing, OAuth), role-based authorization, signed URLs, WebSocket authentication, private object storage for tax documents.
- **PCI-compliant payment processing via Stripe**: Only Stripe references stored.
- **Instant Pay System**: Backend with $0.50 fee, comprehensive validation (KYC, balance, eligibility).
- **IRS-compliant 1099-NEC tax form generation**.
- **W-9 Tax Form Collection**: Database schema and API routes for W-9 submission, pending production-grade encryption for sensitive data.

## Infrastructure & Deployment
- Production deployment at returnit.online with Neon PostgreSQL.
- Multi-environment support, automated workflow.
- Multi-provider map system (Apple Maps, Google Maps).

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database toolkit.

## UI and Styling
- **Shadcn/ui**: Component library.
- **Radix UI**: Low-level UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.

## Integrations
- **Stripe**: Payments, Connect payouts, Identity verification.
- **PayPal**: Payment processing.
- **Google/Facebook/Apple**: OAuth authentication.
- **Resend**: Outbound email service.
- **OpenAI**: AI assistant integration (GPT-4o).
- **Tawk.to**: Live chat widget.
- **Apple Maps**: Primary mapping solution.
- **Google Maps**: Secondary mapping option.
- **Replit App Storage**: Object storage for uploads.