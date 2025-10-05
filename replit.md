# Overview

ReturnIt is a reverse delivery service platform designed to streamline returns, exchanges, and donations. It connects customers with drivers for pickup and return services, offering an enterprise-grade solution with a white/beige design, a comprehensive admin dashboard, and AI-powered support chat. The platform features a distinctive cardboard/shipping theme, supporting a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities. ReturnIt is production-ready, deployed at returnit.online, and prepared for scaling, partnerships, and hiring, aiming for significant market penetration and a strong valuation.

## Recent Mobile App Development Progress (October 2024)
- ✅ Customer App: Stripe Payment Sheet integration with ephemeral keys and automatic payment methods
- ✅ Customer App: PayPal payment flow with browser-based approval and React Native-safe deep-link handling  
- ✅ Customer App: Google OAuth social login via expo-auth-session with dedicated mobile endpoint
- ✅ Customer App: Promo code validation and discount application in booking flow (percentage/fixed/free_delivery)
- ✅ Driver App: Camera verification system (expo-camera) with up to 5 photos per delivery
- ✅ Driver App: Digital signature capture (text-based) with delivery notes
- ✅ Driver App: Mapbox GL v7.1.x Live Order Map with real-time WebSocket updates
- ✅ Driver App: Stripe Connect payout management with instant payout requests ($0.50 fee, 15-30 min arrival)
- 📝 Documentation: Facebook & Apple OAuth setup guide (credentials pending)
- 🔄 Planned: Real-time GPS tracking visualization for customer app (Mapbox integration)

## Performance Optimizations (October 2024)
- ✅ Database Indexes: Added indexes to 6 critical tables (users, orders, driver_earnings, notifications, driver_payouts, companies) with 25+ total indexes including composite indexes for common query patterns
- ✅ API Pagination: Implemented pagination for driver and customer order endpoints with page/limit support (default 50, max 100 per page) and metadata
- ✅ React Component Optimization: Added React.memo to frequently rendered list components (DriverOrderCard, CustomerOrderCard, DriverJobCard) to prevent unnecessary re-renders
- ✅ Response Caching: Implemented 15-minute LRU cache for static data endpoints (companies, return policies, locations) with unique cache keys per query/filter combination
- ✅ Lazy Loading: Verified 80+ heavy components already use React.lazy with Suspense fallbacks for optimal code splitting
- ✅ Database Schema Fixes: Resolved schema drift by adding missing columns to orders table (return_label_url, authorization_signed, authorization_signature, authorization_timestamp)

## Stitch Design System Implementation (October 2024)
- ✅ **Design System Foundation**: Migrated to Stitch visual patterns while preserving ReturnIt's professional enterprise messaging
  - Updated primary color to #f99806 (Stitch orange) from previous amber palette
  - Implemented Work Sans font family across all web components
  - Applied Stitch border radius system (sm: 0.25rem, md: 0.5rem, lg: 1rem, xl: 1.5rem)
  - Added Stitch shadow pattern: `shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]` with dark mode variant
  - Updated background to #f8f7f5 (Stitch beige) for consistent platform aesthetic

- ✅ **Web Platform Updates**: Applied Stitch visual patterns to key customer-facing pages
  - Landing page: Modernized with sticky header, backdrop blur, hero image overlay, mobile bottom nav
  - Booking form: Simplified sticky header, Stitch card shadows, horizontal progress bar, cleaner layouts
  - Customer dashboard: Stitch shadows on stats cards, profile panel, and active order cards
  - All implementations preserve 100% of existing professional copy, validation logic, and business functionality

- 📝 **Mobile Driver App Documentation**: Comprehensive Stitch design requirements documented for React Native implementation
  - Created `mobile-apps/returnit-driver/STITCH_DESIGN_REQUIREMENTS.md` with detailed before/after examples
  - Includes Work Sans font setup, cross-platform shadow implementation (iOS + Android)
  - Component-specific updates for CompleteDeliveryScreen, DriverDashboard, LiveOrderMap, PackageVerification
  - 4-phase implementation checklist with 30-40 hour timeline estimate
  - Ready for mobile development team to achieve cross-platform visual consistency

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui built on Radix UI, styled with Tailwind CSS (custom cardboard/shipping theme).
- **State Management**: Zustand (global), React Query (server).
- **Routing**: Wouter.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Figma-based, mobile-first responsive design with a component library and design tokens. UI/UX emphasizes a white/beige aesthetic, sophisticated gradients, and professional typography.

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook via Passport.js; role-based authorization (driver/customer).

## Data Storage
- **Database**: PostgreSQL (Neon).
- **Schema Management**: Drizzle Kit.
- **Session Storage**: PostgreSQL-based.

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system.
- **Companies**: St. Louis business directory, return policy preferences.
- **App Settings**: System-wide configuration.
- **Retailer Accounts**: Multi-admin access, role management.
- **Retailer Subscriptions**: Stripe billing.
- **Retailer API Keys**: Environment-aware, scoped permissions, rate limiting.
- **Retailer Webhooks**: Event subscription, HMAC verification, retry logic, health monitoring.

## Key Features

### Customer Features
- Account management, social login.
- Real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.

### Driver Features
- Native mobile app (React Native).
- Real-time job notifications, GPS navigation, multi-stop batching.
- Camera package verification, digital signature.
- Earnings dashboard, instant/weekly payouts, 70/30 split via Stripe Connect.
- 1099 generation, incentives, in-app support.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export system.
- System settings, company directory management.
- Email/SMS notifications, WebSocket tracking.

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management, usage analytics.
- **Tier 2 (API & Integration System)**: RESTful API, bearer token authentication, API keys with permission scoping and rate limiting, webhook notification system with retry logic and audit trail.
- **Tier 3 (Developer Dashboard - In Progress)**: API Key management UI, usage tracking visualization, webhook configuration UI, interactive API documentation.

## Security & Compliance
- Bcrypt password hashing, server-side session storage, CSRF protection, rate limiting.
- Secure API key storage, PCI-compliant payment processing via Stripe.
- Stripe Identity driver verification, data encryption at rest and in transit.

## Infrastructure & Deployment
- Production deployment at returnit.online, Neon PostgreSQL.
- Multi-environment support, automated workflow with Replit.
- Database migration system, error logging, scalable architecture.

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
- **ImprovMX**: Email forwarding.