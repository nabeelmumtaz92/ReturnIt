# Overview

Return It is a reverse delivery service platform that connects customers with drivers for streamlined returns, exchanges, and donations. The platform provides an enterprise-grade solution with a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. Its purpose is to achieve significant market penetration and valuation through a strong patent portfolio, offering a complete customer experience (booking, tracking, order management) and robust admin/driver management. A recent feature addition includes full support for charitable donations, allowing customers to donate items for free pickup.

# User Preferences

Preferred communication style: Simple, everyday language.

**Code Sync Workflow**: Use GitHub for syncing code between Replit and local Windows machine (C:\Users\nsm21\Desktop\ReturnIt\). Do NOT use VS Code SSH. Workflow: Agent commits/pushes changes in Replit → User runs `git pull` locally → User runs mobile app commands (`npm install`, `eas update`) on local machine.

**Mobile App Testing Workflow**: Customer app uses bare React Native workflow for Xcode building. Workflow: Pull changes on Windows → Transfer to Mac via GitHub → Run `npm install --legacy-peer-deps` on Mac → Run `npx expo prebuild --platform ios --clean` on Mac → Open `ios/ReturnItCustomer.xcworkspace` in Xcode → Build to iPhone. See `mobile-apps/returnit-customer/XCODE_SETUP.md` for complete guide.

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
  - **OAuth Account Linking**: Users can link multiple OAuth providers (Google, Facebook, Apple) to single account.
  - **Security Features**: Email verification required, provider ID conflict detection, no password for OAuth-only accounts.
  - **Apple OAuth Handling**: Checks appleId first before requiring email (Apple only sends email on first authorization).

## Data Storage
- **Database**: PostgreSQL (Neon).
- **Schema Management**: Drizzle Kit.
- **Object Storage**: Replit App Storage (GCS-backed) for file uploads with ACL policies and presigned URLs.

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking, including new `isDonation` field for charitable donations.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Store Locations**: Google Places-powered database of 600+ St. Louis retail locations.
- **Donation Locations**: Stores information for charities (name, address, hours, accepted items).
- **St. Louis Compliance** (7 tables): MVR checks, insurance policies, contractor agreements, partner agreements, prohibited items, incidents, custody ledger (append-only audit trail).

## Key Features

### Customer Features
- **Booking Flow**: Supports returns, exchanges, and free charitable donations.
- **Google Places Store Location Integration**: Smart autocomplete for 600+ verified St. Louis store addresses.
- **Authentication-Required Checkout**: Customers must sign in before completing booking.
- **Multiple Items Per Return/Donation**: Users can add unlimited items, with a combined limit of 8 boxes/bags per order.
- **Mandatory Photo Verification**: Requires at least one photo (receipt, tags, or packaging).
- **Customer-Paid Premium Pricing Tiers**: Standard, Priority, Instant options.
- **Enhanced Tip Encouragement**: Pre-selected higher amounts, prominent messaging.
- **SMS Verification**: Alternative to email verification via Twilio.
- **Google Maps Integration**: For pickup location selection and display.

### Mobile Apps
- **Customer App**: React Native with Expo SDK 54 (bare workflow) for booking returns, exchanges, and donations. Built with Xcode for iOS testing.
- **Driver App**: React Native with Expo SDK 52 for job management, navigation, and earnings.
- **Real-time Job Notifications**: Expo-notifications with deep linking.
- **GPS Navigation**: Expo-location with Google Maps integration.
- **Multi-Stop Batching**: AI-powered route optimization.
- **Camera Package Verification**: Expo-camera for photo capture.
- **Instant/Weekly Payouts**: Stripe Connect integration with 70/30 split.
- **Instant Pay System**: Add bank accounts or debit cards.
- **Stripe Identity Verification**: KYC flow for driver onboarding.
- **Tax Documents Portal**: Access annual 1099-NEC forms.
- **Extra Fees System**: Drivers can charge customers for supplies (boxes, tape, packing materials) purchased during delivery. Features preset buttons for common items and custom fee input. Charges are processed automatically via Stripe using customer's saved payment method.
- **Refund Tracking System**: Drivers indicate how customer refunds were received (original payment method, cash, or check). For cash/check refunds, system tracks when driver needs to physically return money to customer. Includes completion tracking when driver confirms money was returned.

### Admin Features
- Live operations dashboard, driver/customer management.
- **AI Knowledge Center**: Self-updating AI assistant.
- **Real-Time Driver Tracking**: Interactive map with active driver locations.
- **Driver Identity Verification Management**: Review Stripe Identity verification results.
- **1099 Tax Form System**: Annual tax form generation and distribution.
- **Comprehensive Orders Dashboard**: Full order lifecycle management with real-time data and Stripe refund processing.
- **Physical Refund Management**: "Cash/Check Pending" stat card and filter for tracking orders where drivers received cash/check refunds and need to physically return money to customers.
- **Secure Admin Password System**: Bcrypt hashing, token versioning, and offline recovery.
- **St. Louis Compliance Module**: MVR tracking, insurance verification, contractor/partner agreements, prohibited items database, incident reporting, chain-of-custody logging (29 API routes with multi-layer security).

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management.
- **Tier 2 (API & Integration System)**: RESTful API, API keys, webhook notification system.

## Security & Compliance
- **Multi-Layer Security Architecture**: Rate limiting, input validation, authentication (session-based, Bcrypt hashing, OAuth), role-based authorization, signed URLs, WebSocket authentication, private object storage.
- **Donation Security System**: Comprehensive multi-layer validation to prevent payment bypass attacks:
  - Database-backed validation against `donationLocations` table (verified charity addresses)
  - Full address validation (street, city, state, ZIP) to prevent location spoofing
  - Server-side price recalculation using `paymentCalculator.ts` (never trust client amounts)
  - Stripe PaymentIntent amount validation against server-calculated totals
  - Payment replay attack prevention (check for duplicate payment intent IDs)
  - Active location verification (inactive charities rejected)
- **PCI-compliant payment processing via Stripe**.
- **IRS-compliant 1099-NEC tax form generation**.
- **W-9 Tax Form Collection**: Database schema and API routes for W-9 submission.
- **St. Louis Compliance System**: Driver vetting (MVR checks, insurance tracking), contractor agreements, store partner agreements, prohibited items validation, incident reporting, append-only chain-of-custody ledger with 6-layer security (authentication, user hydration, resource-level authz, order-level authz, input validation, admin-only mutations).

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
- **Apple Maps**: Primary mapping solution for mobile.
- **Google Maps**: Mapping solution for web, including Places Autocomplete API.
- **Replit App Storage**: Object storage for uploads.
- **Twilio**: SMS verification service.