# Overview

Return It is a reverse delivery service platform that streamlines returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It offers an enterprise-grade solution with a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and valuation through a strong patent portfolio. Key capabilities include a complete customer experience (booking, tracking, order management) and robust admin/driver management.

## Current Status (November 2025)
**🚀 iOS App Store Submission in Progress**
- Google Places store locations integration complete (600+ St. Louis stores)
- EAS build configuration ready for production
- Both customer and driver apps configured for App Store submission
- See `IOS_BUILD_GUIDE.md` for complete submission steps

# User Preferences

Preferred communication style: Simple, everyday language.

**Code Sync Workflow**: Use GitHub for syncing code between Replit and local Windows machine (C:\Users\nsm21\Desktop\ReturnIt\). Do NOT use VS Code SSH. Workflow: Agent commits/pushes changes in Replit → User runs `git pull` locally → User runs mobile app commands (`npm install`, `eas update`) on local machine.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui (Radix UI, Tailwind CSS) with a custom cardboard/shipping theme (#B8956A and #FAF8F4).
- **State Management**: Zustand (global), React Query (server).
- **Design System**: Figma-based, mobile-first responsive design with a component library and design tokens, emphasizing a cardboard brown and masking tape aesthetic, sophisticated gradients, and Inter font.

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook via Passport.js; role-based authorization.

## Data Storage
- **Database**: PostgreSQL (Neon).
- **Schema Management**: Drizzle Kit.
- **Object Storage**: Replit App Storage (GCS-backed) for file uploads with ACL policies and presigned URLs.

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Driver Payment Methods**: PCI-compliant storage of Stripe references for bank accounts and debit cards (no raw PAN/ABA data).
- **Retailer Accounts**: Multi-admin access, role management, API keys, webhooks.
- **Store Locations**: Google Places-powered database of 600+ St. Louis retail locations with verified addresses, coordinates, and metadata.

## Key Features

### Customer Features
- **Google Places Store Location Integration**: Smart autocomplete with 600+ verified St. Louis store addresses from Google Places API. Requires typing (min 2 chars) before showing results. Server-side caching (5-min TTL) for performance.
- **Authentication-Required Checkout**: Customers must sign in before completing booking and payment for security and order tracking.
- Account management, social login.
- Store location autocomplete, real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.
- **Multiple Items Per Return**: Users can add unlimited items to a single return booking. Each item has its own name, description, and value. Items can be added/removed dynamically with automatic total value calculation.
- **Mandatory Photo Verification**: Users must upload at least one photo (receipt, tags, or packaging) before completing booking.
- **Customer-Paid Premium Pricing Tiers**: Standard ($6.99, driver earns $5), Priority ($9.99, driver earns $8), Instant ($12.99, driver earns $10) - shifts cost to customer for faster service.
- **Enhanced Tip Encouragement**: Pre-selected higher amounts ($3/$5/$8), prominent "100% to driver" messaging, round-up tip option, and post-delivery tip prompts to boost driver earnings without company subsidy.

### Driver Features
- **My Orders Page**: Dedicated driver order management with Active, Available, and Completed tabs for both web and mobile.
- **Native Mobile App**: React Native with Expo (com.returnit.app) featuring screens for Login, Available Jobs, Job Details, Active Job, Camera, Earnings, Payout.
- **Real-time Job Notifications**: Expo-notifications with background/foreground handling and deep linking.
- **GPS Navigation**: Expo-location with Google Maps integration.
- **Multi-Stop Batching**: AI-powered route optimization and cluster detection.
- **Camera Package Verification**: Expo-camera for pickup/dropoff photo capture.
- **Digital Signature**: Capture for delivery confirmation.
- **Earnings Dashboard**: Daily/weekly/monthly views.
- **Instant/Weekly Payouts**: Stripe Connect integration (70/30 split).
- **Instant Pay System**: Add bank accounts (Financial Connections) or debit cards, $0.50 fee, comprehensive KYC/balance/eligibility validation.
- **AI-Powered Nearby Order Detection**: Cluster visualization with recommended routes.
- **Stripe Identity Verification**: Complete KYC flow with session-based verification for driver onboarding.
- **Tax Documents Portal**: Access and download annual 1099-NEC forms for tax filing.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export.
- **AI Knowledge Center**: Self-updating AI assistant tracking database models and API endpoints with a draggable button.
- **Real-Time Driver Tracking**: Interactive Mapbox map with active driver locations and detailed modals.
- **Driver Identity Verification Management**: Review Stripe Identity verification results and status.
- **1099 Tax Form System**: Annual tax form generation, bulk processing, email distribution, and compliance tracking for IRS 1099-NEC requirements.
- **Comprehensive Orders Dashboard** (`/admin/orders`): Complete order lifecycle management with real-time data, stats overview (total/pending/completed/refunded/revenue), status filtering, bulk actions for status updates, Stripe refund processing with full or partial refunds, order details modal with payment breakdown, and 30-second auto-refresh.

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management, usage analytics.
- **Tier 2 (API & Integration System)**: RESTful API, API keys with permission scoping, webhook notification system.

### Exchange Feature Roadmap
- Comprehensive two-way exchange logistics (Patent #25) including collection, in-store exchange, and delivery or return.

### Return Graph - Proprietary Routing Intelligence
- A self-learning knowledge graph optimizing reverse logistics using a graph database and an A* Pathfinding Algorithm with a Machine Learning layer for real-time updates.

## Security & Compliance

### Multi-Layer Security Architecture
- **Level 1 (Public Access)**: Rate limiting, input validation, public tracking with ZIP code verification.
- **Level 2 (Authenticated Access)**: Session-based authentication, Bcrypt hashing, role-based authorization, OAuth, secure session cookies. **Checkout and payment pages require authentication** - unauthenticated users are redirected to login with session restore.
- **Level 3 (Sensitive Documents)**: HMAC-SHA256 signed URLs with configurable expiration for receipts, invoices, and order details.
- **Level 4 (Real-Time Tracking)**: Tracking number + ZIP code verification, enhanced rate limiting, IP-based throttling, WebSocket authentication.
- **Level 5 (Tax Documents)**: Private object storage with ACL policies, driver/admin-only access control for 1099 forms.

### Enhanced Rate Limiting
- Specific limits for authentication, registration, payments, tracking, sensitive documents, and admin endpoints.
- IP-based throttling for abuse prevention.

### Signed URL System
- HMAC-SHA256 cryptographic signatures with configurable expiration (default 72 hours) for tamper-proof, resource-specific access to order details, receipts, and invoices.

### Data Protection & Compliance
- **PCI-compliant payment processing via Stripe**: All payment card and bank account data stored only as Stripe references (IDs), never raw PAN/ABA data.
- **Driver Instant Pay System**: Complete backend implementation with $0.50 fee, comprehensive validation (KYC, balance, eligibility), and rate-limited API endpoints.
- Stripe Identity verification for drivers with webhook-based status sync.
- IRS-compliant 1099-NEC tax form generation and distribution system.
- Server-side session storage (PostgreSQL).
- SQL injection prevention (Drizzle ORM), XSS protection, security headers (Helmet), CORS protection.
- Data encryption in transit (HTTPS/TLS).
- Secure API key storage in environment variables.
- Private object storage for sensitive tax documents.

### Instant Pay System Implementation Status
**✅ Completed Backend Infrastructure:**
- `driver_payment_methods` table (PCI-compliant, Stripe references only)
- Complete storage interface with CRUD operations for payment methods
- Stripe service layer with Financial Connections API (bank accounts), Setup Intents (debit cards), and instant payout execution
- Comprehensive API routes with proper rate limiting (paymentRateLimit, driverActionRateLimit)
- Instant payout validation: KYC checks, balance verification, minimum amounts ($5), eligibility validation, payment method ownership
- $0.50 flat fee per instant payout transaction

**✅ Completed Frontend UI:**
- Driver payments page with 5 tabs: Instant Pay, Payment Methods, Earnings, Incentives, Tax Info
- Payment methods management interface (list, remove, set default)
- Instant payout modal with amount input, fee calculation, and confirmation
- Comprehensive validation warnings (KYC required, payment method required, insufficient balance)
- Complete data-testid coverage for e2e testing

**🔄 Next Steps (Stripe UI Integration):**
1. Integrate Stripe Financial Connections SDK for bank account linking
2. Integrate Stripe Card Element for debit card capture
3. Complete client-side flow handling and callbacks
4. Implement webhook handlers for payment method verification events
5. End-to-end testing with real Stripe test accounts

**API Endpoints:**
- `GET /api/driver/payment-methods` - List all payment methods (with driverActionRateLimit)
- `POST /api/driver/payment-methods/bank-account/session` - Create Financial Connections session (with paymentRateLimit)
- `POST /api/driver/payment-methods/bank-account` - Attach bank account (with paymentRateLimit)
- `POST /api/driver/payment-methods/card/setup` - Create card setup intent (with paymentRateLimit)
- `POST /api/driver/payment-methods/card` - Attach debit card (with paymentRateLimit)
- `DELETE /api/driver/payment-methods/:id` - Remove payment method (with paymentRateLimit)
- `POST /api/driver/payment-methods/:id/set-default` - Set default payment method (with driverActionRateLimit)
- `POST /api/driver/instant-payout` - Execute instant payout (with driverActionRateLimit)

### W-9 Tax Form Collection (In Development)
**⚠️ CRITICAL SECURITY REQUIREMENT**: The current W-9 implementation stores SSN/EIN in plaintext for development only. **Production deployment absolutely requires** implementing proper encryption using AES-256-GCM or similar before launch. This is documented in the code with security warnings.

**Status**: Development complete, pending encryption implementation for production
- Database schema: w9Forms table
- Storage methods: createW9Form, getW9FormByUserId, hasCompletedW9
- API routes with Zod validation:
  - `GET /api/driver/w9` - Get current user's W-9 status
  - `POST /api/driver/w9` - Submit W-9 form (with Zod validation)
  - `GET /api/admin/driver-applications/:id/w9` - Admin view W-9 status
- Frontend: W9Form component (client/src/components/W9Form.tsx)
- **Next Steps**: Integrate into driver onboarding flow, require W-9 completion before `approved_active` status, implement production-grade encryption

### Legal Compliance & Operating Model
- **Agency Model**: ReturnIt acts as the customer's agent for transport.
- **Requirements**: Proof of purchase upload, mandatory photo verification by drivers at drop-off.

## Infrastructure & Deployment
- Production deployment at returnit.online with Neon PostgreSQL.
- Multi-environment support, automated workflow.
- Server configuration binds to 0.0.0.0:5000 with a fast /health endpoint.
- Performance optimizations including AI Knowledge Base lazy loading.
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
- **ImprovMX**: Email forwarding.
- **Apple Maps**: Primary mapping solution with turn-by-turn navigation.
- **Google Maps**: Secondary mapping option for GPS tracking.
- **Replit App Storage**: Object storage for uploads.