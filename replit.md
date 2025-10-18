# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It offers an enterprise-grade solution with a distinctive cardboard/shipping theme (cardboard brown #B8956A and masking tape #FAF8F4), a comprehensive admin dashboard, and AI-powered support. The platform supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities. Return It aims for significant market penetration, a strong valuation, and features a comprehensive patent portfolio strategy.

# Recent Changes (October 18, 2025)

## Real-Time Driver Tracking Implementation
**NEW**: Admin panel real-time driver tracking with GPS location monitoring:
- **Backend API Endpoints**: Added GET `/api/admin/drivers/tracking` (all active drivers) and GET `/api/admin/drivers/:id/location` (specific driver)
- **Tracking Dashboard**: Comprehensive real-time tracking page with:
  - Interactive Mapbox map showing all active driver locations
  - Search by name, email, phone number (for support)
  - Auto-refresh every 10 seconds with toggle control
  - Stats cards: Total Drivers, Online Now, With Location, Offline
  - Driver list with status badges, vehicle info, location availability
  - Detailed driver modal: contact info, vehicle details, GPS coordinates, speed, accuracy
- **Navigation**: Accessible via "Real-time Tracking" button in Business Operations section
- **Database Integration**: Uses existing `users.currentLocation` (jsonb) and `users.isOnline` (boolean) fields

## Admin Dashboard Verification & Cleanup
**System Integration Verified**: Confirmed all admin features are connected to real database:
- **Order Management**: Connected to booking form via `/api/admin/orders` endpoint - all orders from `/book-return` appear in admin dashboard
- **Enhanced Analytics**: Existing comprehensive analytics dashboard with real-time metrics (not replaced)
- **Driver Applications**: Fetches pending applications from database via `/api/admin/driver-applications/pending`
- **Identified for Cleanup**: Duplicate DriverApplicationsContent functions and some hardcoded demo data in chat/support sections

## Booking Form Redesign & Dynamic Pricing
**Professional UI Overhaul**: Complete booking form redesign with dynamic pricing system:
- **UI Redesign**: Crisp, professional 3-step form with solid color buttons (#B8956A), progress indicator, removed arcade-style elements
- **Dynamic Pricing Calculator**: Real-time pricing with itemized breakdown
  - Base pickup fee: $8.99 (up from $3.99)
  - Size upcharges: Small $0, Medium +$2, Large +$4
  - Multi-box fee: $3 per additional box (previously $1.50)
  - Service fee: $1.50 flat
  - Tax: 8.75% on subtotal
  - Total range: $11-$18 depending on box size/quantity
- **Backend Pricing Fix**: Removed hardcoded backend pricing recalculation that was overriding frontend values (was forcing $3.99 base price)
- **Confirmation Page**: Added Step 4 showing order ID, tracking number, and total paid after successful booking
- **apiRequest Fix**: Fixed `client/src/lib/queryClient.ts` to parse JSON responses (was returning raw Response object causing undefined order data)
- **End-to-End Verified**: Testing confirmed correct pricing persistence to database, confirmation page displays all values, dynamic totals calculate accurately

## Booking Form Schema Drift Resolution
**Critical Fix**: Resolved massive database schema drift affecting booking functionality:
- **Database Schema Cleanup**: Removed 60+ non-existent columns from `shared/schema.ts` orders table (refund tracking, policy enforcement, gift card handling, driver timeline fields)
- **ID Generation Fix**: Added proper ID and tracking number generation to `DatabaseStorage.createOrder` (previously missing, causing null constraint violations)
- **Database Adjustments**: Made `orders.user_id`, `orders.pickup_address`, and `orders.pickup_method` nullable to support guest bookings and match code expectations
- **Timeline Functions**: Stubbed out `extendOrderDeadline` and `getOverdueOrders` functions (relied on non-existent `completionDeadline` and `driverAcceptedAt` columns)
- **Frontend Fix**: Updated booking success redirect from `/orders` (404) to `/` with improved toast message
- **Impact**: Booking form now works end-to-end - customers can successfully create orders via `/book-return`

## Schema Simplification
The production database uses simplified payment/refund tracking:
- **Payment Breakdown**: Single aggregate fields (`driverEarning`, `returnlyFee`) instead of detailed breakdowns
- **Refund Tracking**: Retailer-focused fields only (`retailer_issued_refund`, `retailer_refund_amount`, `retailer_refund_method`, `retailer_refund_timeline`)
- **Address Fields**: Hybrid model with both `pickup_address` (nullable) and separate component fields (`pickup_street_address`, `pickup_city`, `pickup_state`, `pickup_zip_code`)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui built on Radix UI, styled with Tailwind CSS (custom cardboard/shipping theme).
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
- **Object Storage**: Replit App Storage (GCS-backed) for file uploads (receipts, verification photos) with ACL policies and presigned URLs.

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Retailer Accounts**: Multi-admin access, role management, API keys, webhooks.

## Key Features

### Customer Features
- Account management, social login, guest checkout.
- Store location autocomplete (any location or specific address).
- Real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.

### Driver Features
- Native mobile app (React Native).
- Real-time job notifications, GPS navigation, multi-stop batching.
- Camera package verification, digital signature.
- Earnings dashboard, instant/weekly payouts, 70/30 split via Stripe Connect.
- AI-Powered Nearby Order Detection with cluster visualization.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export system.
- **AI Knowledge Center**: Self-updating AI assistant tracking database models and API endpoints.

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management, usage analytics.
- **Tier 2 (API & Integration System)**: RESTful API, API keys with permission scoping, webhook notification system.

### Exchange Feature Roadmap
- Planning for comprehensive two-way exchange logistics (Patent #25).
- **Exchange Flow**: Customer selects "Exchange," driver collects original, driver takes to store for exchange, replacement delivered or returned to customer if refused.
- **Technical Plan**: Core workflow, driver app integration, operator warehouse system, multi-leg routing, price differential payments, enterprise API.

### Return Graph - Proprietary Routing Intelligence
- A self-learning knowledge graph optimizing reverse logistics.
- **Core Concept**: Graph database tracking optimal drop-off locations, store acceptance policies, and routing strategies.
- **Database Architecture**: Tables for nodes, edges (with multi-dimensional weights), routing decisions, node performance history, and policy rules.
- **Intelligence System**: A* Pathfinding Algorithm with a Machine Learning layer for real-time updates and dynamic policy learning based on success rates, wait times, and satisfaction scores.
- **Business Value**: Creates a strong competitive moat through network effects, patent potential (Patent #26 candidate), and high enterprise value.

## Security & Compliance
- Bcrypt password hashing, server-side session storage, CSRF protection, rate limiting.
- PCI-compliant payment processing, secure API key storage, Stripe Identity verification.
- Data encryption, SQL injection prevention, security headers, CORS protection.

## Legal Compliance & Operating Model
- **Agency Model**: ReturnIt acts as the customer's agent for transport.
- **Requirements**: Proof of purchase upload, mandatory photo verification by drivers at drop-off.
- **Driver Conduct**: Drivers interact with public return desks, present as customer's agent, and adhere to professional standards.

## Infrastructure & Deployment
- Production deployment at returnit.online with Neon PostgreSQL.
- Multi-environment support, automated workflow.
- **Server Configuration**: Binds to 0.0.0.0:5000, includes a fast /health endpoint.
- **Performance Optimizations**: AI Knowledge Base lazy loading, optimized server startup and health check response times.
- **Map Provider System**: Multi-provider support (Mapbox, Google Maps, OpenStreetMap, Apple Maps).

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
- **Mapbox GL**: GPS tracking and mapping.
- **Replit App Storage**: Object storage for uploads with ACL-based access control.