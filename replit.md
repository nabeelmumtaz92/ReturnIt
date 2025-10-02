# Overview

ReturnIt is a reverse delivery service platform designed to streamline returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It is an enterprise-grade solution featuring a white/beige design, a comprehensive admin dashboard, an AI-powered support chat, and professional business content, all unified by a distinctive cardboard/shipping theme. The platform supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities, including intelligent support automation. ReturnIt is production-ready, deployed at returnit.online, and prepared for scaling, partnerships, and hiring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI Components**: Shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme (tan, orange, brown).
- **State Management**: Zustand for global state, React Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Figma-based, mobile-first responsive design system with a full component library and design tokens.
- **UI/UX Decisions**: Refined white/beige aesthetic, sophisticated gradients, professional typography, and a distinctive cardboard/shipping theme with authentic stock photography. The customer booking page features a consistent delivery handoff background image. The admin dashboard is optimized for desktop and mobile responsiveness.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for type-safe interactions.
- **Session Management**: Express sessions with PostgreSQL store.
- **API Design**: RESTful API endpoints.

## Data Storage
- **Database**: PostgreSQL hosted on Neon.
- **Schema Management**: Drizzle Kit for migrations.
- **Session Storage**: PostgreSQL-based session storage using `connect-pg-simple`.

## Core Data Models
- **Users**: Authentication with driver/customer roles, Stripe Connect integration, payment preferences.
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split, retailer tracking, API metadata for programmatic returns.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.
- **Companies**: St. Louis area business directory with auto-population, category filtering, return policy preferences.
- **App Settings**: System-wide configuration storage (pricing, surge multipliers, feature flags) with admin management interface.
- **Retailer Accounts**: Multi-admin access control with role management, company association, invitation system.
- **Retailer Subscriptions**: Stripe billing integration, plan management, usage tracking.
- **Retailer API Keys**: Environment-aware key generation (test/live), SHA-256 hashing, scoped permissions, rate limiting, usage tracking.
- **Retailer Webhooks**: Event subscription management, HMAC signature verification, retry logic, health monitoring.
- **Retailer Webhook Deliveries**: Complete audit trail of delivery attempts, response tracking, failure analysis.

## Authentication and Authorization
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook sign-in via Passport.js. Exclusive admin access restricted to specific emails with auto-redirection to the admin dashboard. Persistent authentication (30-day session) for mobile.
- **Authorization**: Role-based access (driver vs. customer).
- **Session Management**: Server-side session storage.
- **Environment-Based Access Control**: Configurable authentication restrictions based on deployment environment (development/staging/production) with email whitelist support.

## Features and Capabilities

### **Customer Features (28 features)**
- Account creation & management with multi-address support
- Social login (Google, Facebook, Apple) and email/password authentication
- **Real-time WebSocket GPS tracking** with live driver location, auto-reconnect, and connection status
- Order history, status updates, and receipt generation
- Multi-payment methods (cards, Apple Pay, Google Pay, PayPal)
- Promotional code support and pricing transparency
- AI-powered support chat with navigation assistance
- In-app messaging and phone calling to drivers
- Push notifications for real-time updates
- Package photo verification view
- Multi-package booking with scheduled pickup times
- Special handling instructions and donation options

### **Driver Features (22 features)**
- Native mobile app (iOS/Android) with React Native
- Real-time job notifications via WebSocket
- GPS navigation integration with route optimization
- Multi-stop delivery batching for efficiency
- Camera package verification with QR code scanning
- Digital signature capture for deliveries
- Earnings dashboard with real-time tracking
- Instant payout option ($0.50 fee) and weekly automatic payouts
- 70/30 payment split with Stripe Connect integration
- Automatic 1099 tax form generation
- Performance ratings and incentive bonuses (size-based, peak season, multi-stop)
- In-app support chat with emergency hotline access
- Safety reporting and customer unavailable workflow

### **Admin Features (25 features)**
- Live operations dashboard with real-time job monitoring
- Driver and customer account management
- Manual order creation with status override capabilities
- Payment processing, refunds, and bulk driver payouts
- Advanced analytics: revenue charts, driver performance, customer satisfaction
- Excel export system (multi-sheet) with financial breakdowns
- Driver leaderboards and regional performance analysis
- System settings management (pricing, surge multipliers, feature flags)
- Company directory management (St. Louis businesses with auto-population)
- Email notifications (Resend), SMS alerts (email-to-SMS gateway)
- WebSocket real-time tracking service
- Performance monitoring (LRU caching, memory usage, request timing)
- Health check endpoints and crash recovery service

### **Communication System (6 channels)**
- SMS notifications via email-to-SMS gateway (Twilio-ready)
- Push notifications via WebSocket for real-time updates
- In-app chat between customers and drivers
- Direct phone calling with masked numbers for privacy
- Support hotlines (24/7 driver hotline, emergency line, safety line)
- Email notifications for critical updates

### **Retailer Enterprise Platform (Tier 1-3: 33 features)**
**Tier 1 - Self-Service Portal (10 features):**
- Retailer company registration with multi-admin access
- Role-based permissions (admin, finance, developer, support)
- Team member invitation system
- Subscription management ($99/mo Stripe billing)
- Invoice tracking and payment history
- Usage analytics dashboard with cost projections
- Return volume tracking and performance metrics

**Tier 2 - API & Integration System (16 features):**
- RESTful API v1 (/api/v1/returns endpoints)
- Bearer token authentication with SHA-256 secure hashing
- Environment-aware API keys (ret_test_/ret_live_ prefixes)
- Permission scoping (read/write/delete) per API key
- Rate limiting (1000 requests/hour) with usage tracking
- POST /api/v1/returns (create return) and GET /api/v1/returns/:id
- Auto-dispatch integration with driver assignment
- Webhook notification system with HMAC SHA-256 signatures
- Webhook retry logic (3 attempts, 60s exponential backoff)
- Webhook delivery tracking with complete audit trail
- Response tracking and failure analysis
- Webhook health monitoring with consecutive failure detection

**Tier 3 - Developer Dashboard (7 features - In Progress):**
- ✅ API Keys Management UI (view, create, revoke with permissions)
- ✅ Usage tracking visualization with rate limits
- ✅ One-time secure key display with copy functionality
- 🔄 Webhook Configuration UI (add/edit endpoints, event selection)
- 🔄 Usage Analytics Dashboard (API call charts, success rates)
- 🔄 Interactive API Documentation with code examples
- 🔄 Webhook Testing Tool and Sandbox Environment

### **Security & Compliance (17 features)**
- Bcrypt password hashing with server-side session storage
- 30-day persistent authentication for mobile
- Environment-based access control with email whitelist
- Master admin email restriction with auto-redirection
- CSRF protection and rate limiting
- Secure API key storage (SHA-256 hashing)
- PCI-compliant payment processing via Stripe
- Stripe Identity driver verification and background checks
- Data encryption at rest and SSL/TLS in transit

### **Integrations & Services (13 integrations)**
- Stripe (payments, Connect payouts, Identity verification)
- PayPal payment processing
- Google/Facebook/Apple OAuth authentication
- Resend email service with ImprovMX forwarding
- OpenAI GPT-4o (AI support chat, developer console)
- Tawk.to live chat widget
- WebSocket real-time tracking
- Google Maps integration for navigation

### **SEO & Marketing (9 features)**
- Comprehensive meta tags with Open Graph and Twitter cards
- Structured data markup for search engines
- Canonical URLs and DNS prefetch optimization
- Custom domain support (returnit.online)
- Mobile-first responsive design with PWA capabilities
- Professional business content with cardboard/shipping theme

### **Developer Experience (14 features)**
- TypeScript type safety across full stack
- Drizzle ORM with type-safe queries
- Zod runtime validation for API requests
- React Hook Form with TanStack React Query
- Shadcn/ui component library with Tailwind CSS
- Vite fast build system with hot module replacement
- Git version control with automated crash recovery
- Enhanced AI developer console with OpenAI integration

### **Intellectual Property (6+ patents)**
- **Patent 1**: Retailer API Integration System (ready to file)
- **Patent 2**: QR Code Return System (ready to file)
- **Patent 3**: Webhook Notification System (ready to file)
- **Future Patents**: Tier 3+ UI/UX innovations (4-5 additional patents planned)

### **Infrastructure & Deployment (11 features)**
- Production deployment at returnit.online
- Neon PostgreSQL serverless hosting
- Multi-environment support (dev/staging/production)
- Automated workflow management with Replit
- Database migration system with Drizzle Kit
- Error logging and performance monitoring
- Load balancing ready architecture
- Scalable microservices-ready design

---

## Recent Progress (October 2025)

### **WebSocket GPS Tracking - Customer Mobile App (October 2, 2025)**
- ✅ **Real-time Location Updates**: WebSocket integration connects to `ws://localhost:5000/ws/tracking` for live driver GPS tracking
- ✅ **Auto-Reconnection**: Exponential backoff reconnection strategy (1s → 16s) with max 5 attempts
- ✅ **Connection Status UI**: Live connection badge (🟢 Live / ⚫ Offline) with real-time ETA, distance, and timestamp display
- ✅ **Robust Cleanup**: Proper WebSocket cleanup handling all socket states (OPEN, CONNECTING, CLOSING)
- ✅ **User Feedback**: Toast notifications when connection fails after max retry attempts
- ✅ **Message Handling**: Processes location_update, initial_data, and status_update events
- ✅ **Database Fix**: Added missing `receipt_url` column to orders table
- **Architect-Approved**: Production-ready implementation with comprehensive error handling

### **Tier 3 Implementation - Retailer Developer Portal**
- ✅ **API Keys Management UI**: Complete interface for viewing, creating, and revoking API keys with permission controls, usage tracking, and secure one-time key display
- 🔄 **Next**: Webhook Configuration UI, Usage Analytics Dashboard, API Documentation, Testing Tools

### **Patent Portfolio**
- 3 comprehensive patent applications ready for immediate filing
- Tier 3 completion expected to generate 4-5 additional patents
- Building insurmountable competitive moat through IP protection

### **Strategic Positioning**
- Current: 2-3 enterprise retail partners ($1.5M-2.5M valuation)
- Target: 50+ partners ($100M-200M valuation)
- Competitive advantages: Network effects, integration barriers, patent protection

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database toolkit and query builder.

## UI and Styling
- **Shadcn/ui**: Component library.
- **Radix UI**: Low-level UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.

## Runtime Libraries
- **React Query**: Server state management.
- **Wouter**: Lightweight client-side routing.
- **Zustand**: Lightweight state management.
- **Date-fns/Dayjs**: Date manipulation utilities.
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation.

## Integrations
- **Stripe**: Payment processing (Stripe Connect for driver payouts, Stripe Identity for driver onboarding).
- **Google OAuth**: For user authentication.
- **ImprovMX**: Email forwarding.
- **Tawk.to**: Live chat.
- **Resend**: Outbound email service.
- **OpenAI**: AI assistant integration (GPT-4o).