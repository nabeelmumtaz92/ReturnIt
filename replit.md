# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations. It connects customers with drivers for pickup and return services, offering an enterprise-grade solution with a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and a strong valuation, supported by a comprehensive patent portfolio strategy. Key capabilities include a complete customer experience (booking, tracking, order management) and robust admin/driver management.

# Recent Changes

**October 25, 2025 - Admin Dashboard Critical Bug Fixes**
- **Navigation Fix**: Replaced `setLocation()` with `window.history.replaceState()` in changeSection() to prevent component remounting
- **WebSocket Stability**: Converted state variables to refs (isManualDisconnect, connectionAttempts) in useAdminWebSocket to eliminate infinite dependency loops
- **Database Schema Sync**: Added missing columns to orders table (receipt_photo_url, receipt_verified_at, driver_verified_total, total_discrepancy, discrepancy_flagged, discrepancy_notes)
- **Variable Ordering Bug**: Fixed OrdersContent component crash by moving activeOrders/completedOrders definitions before functions that use them
- Result: All navigation buttons now work correctly, no component crashes, smooth section switching

**October 25, 2025 - Demo Login Privacy & Security**
- Removed demo login button from public login page for privacy
- Demo endpoint remains functional at `/api/auth/demo-login` for company presentations when needed
- Demo admin access environment-gated: Only grants isAdmin in development (NODE_ENV check)

**October 24, 2025 - Admin Dashboard Navigation Fixes**
- Fixed critical JSX structure error in admin dashboard that prevented all navigation buttons from working (removed extra closing div tag in header section)
- Enhanced demo login security: Admin access now environment-gated (development only) via NODE_ENV check
- Added demo@returnit.demo to master admins allowlist for development testing
- Verified all 30+ admin dashboard content components are properly wired and functional
- All navigation buttons now properly call changeSection() and route to correct sections

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui built on Radix UI, styled with Tailwind CSS (custom cardboard/shipping theme: cardboard brown #B8956A and masking tape #FAF8F4).
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
- **Retailer Accounts**: Multi-admin access, role management, API keys, webhooks.

## Key Features

### Customer Features
- Account management, social login, guest checkout.
- Store location autocomplete, real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.

### Driver Features
- **Native Mobile App** (React Native with Expo) - Complete production-ready app built.
  - **Package**: com.returnit.app
  - **Screens**: Login, Available Jobs, Job Details, Active Job, Camera, Earnings, Payout
  - **Components**: Button, Input, JobClusterMap (AI cluster visualization)
  - **Services**: API integration, Push notifications
- **Real-time Job Notifications** - expo-notifications with background/foreground handling, deep linking.
- **GPS Navigation** - expo-location with Google Maps integration for turn-by-turn directions.
- **Multi-Stop Batching** - AI-powered route optimization and cluster detection.
- **Camera Package Verification** - expo-camera for pickup/dropoff photo capture.
- **Digital Signature** - Store receipt signature capture for delivery confirmation.
- **Earnings Dashboard** - Daily/weekly/monthly views with job history and stats.
- **Instant/Weekly Payouts** - Stripe Connect integration with $1.50 instant fee or free standard.
- **70/30 Split** - Driver earnings automatically calculated (PAYOUT_SPLIT constant).
- **AI-Powered Nearby Order Detection** - Cluster visualization with recommended routes and multi-stop earnings aggregation.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export system.
- **AI Knowledge Center**: Self-updating AI assistant tracking database models and API endpoints.
  - **Draggable AI Button**: Floating button (bottom-right corner) that can be repositioned anywhere on screen, with 5px drag threshold to distinguish drag from click.
  - **Contact Support**: Separate fixed button (bottom-left corner) for customer support at (636) 254-4821.
- **Real-Time Driver Tracking**: Admin panel with interactive Mapbox map showing active driver locations, search capabilities, and detailed driver modals.

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management, usage analytics.
- **Tier 2 (API & Integration System)**: RESTful API, API keys with permission scoping, webhook notification system.

### Exchange Feature Roadmap
- Comprehensive two-way exchange logistics (Patent #25).
- **Exchange Flow**: Driver collects original, takes to store for exchange, replacement delivered or returned.

### Return Graph - Proprietary Routing Intelligence
- A self-learning knowledge graph optimizing reverse logistics.
- **Core Concept**: Graph database tracking optimal drop-off locations, store acceptance policies, and routing strategies.
- **Intelligence System**: A* Pathfinding Algorithm with a Machine Learning layer for real-time updates and dynamic policy learning.

## Security & Compliance

### Multi-Layer Security Architecture
Return It implements a comprehensive 4-level security architecture to protect customer data and prevent unauthorized access:

**Level 1: Public Access (No Authentication)**
- Basic rate limiting on all endpoints
- Public tracking page with ZIP code verification requirement
- Input validation and sanitization

**Level 2: Authenticated Access (Session Required)**
- Secure session-based authentication with server-side storage
- Bcrypt password hashing (10 rounds)
- Role-based authorization (Customer, Driver, Admin)
- OAuth integration (Google, Facebook, Apple)
- Session cookies with sameSite and httpOnly flags

**Level 3: Sensitive Documents (Signed URLs)**
- HMAC-SHA256 signed URLs for receipts, invoices, and order details
- Token expiration (24-72 hours configurable)
- Resource-specific access tokens stored in database
- Prevents tampering and unauthorized sharing
- Automatic email delivery with secure links

**Level 4: Real-Time Tracking (Multi-Factor Verification)**
- Tracking number + ZIP code verification required
- Enhanced rate limiting (30 requests per 5 minutes)
- IP-based throttling for abuse prevention
- WebSocket authentication for live updates

### Enhanced Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes
- **Registration**: 3 requests per hour
- **Payments**: 10 requests per minute
- **Tracking queries**: 30 requests per 5 minutes
- **Sensitive documents**: 20 requests per hour
- **IP throttling**: Automatic 1-hour block after 10 failed auth attempts
- **Admin endpoints**: 100 requests per 15 minutes

### Signed URL System
- **Implementation**: HMAC-SHA256 cryptographic signatures
- **Token Format**: `{base64url-payload}.{base64url-signature}`
- **Expiration**: Configurable (default 72 hours)
- **Use Cases**: Order receipts, invoices, confirmation emails
- **Security**: Tamper-proof, resource-specific, user-bound (optional)
- **Endpoints**:
  - `/api/orders/:id/view?token=...` - Full order details
  - `/api/orders/:id/receipt?token=...` - Receipt information
  - `/api/orders/:id/invoice?token=...` - Invoice with line items

### Data Protection & Compliance
- PCI-compliant payment processing via Stripe
- Stripe Identity verification for drivers
- Server-side session storage (PostgreSQL)
- SQL injection prevention via Drizzle ORM
- XSS protection with input sanitization
- Security headers (Helmet middleware)
- CORS protection with environment-specific origins
- Data encryption in transit (HTTPS/TLS)
- Secure API key storage in environment variables

### Tracking Security
- ZIP code verification required for all tracking queries
- Prevents unauthorized order visibility
- Rate limiting prevents enumeration attacks
- WebSocket connections require tracking# + ZIP validation
- Smart polling reduces server load (30s → 2min when WS connected)

## Legal Compliance & Operating Model
- **Agency Model**: ReturnIt acts as the customer's agent for transport.
- **Requirements**: Proof of purchase upload, mandatory photo verification by drivers at drop-off.
- **Driver Conduct**: Drivers interact with public return desks, present as customer's agent.

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
- **Replit App Storage**: Object storage for uploads.