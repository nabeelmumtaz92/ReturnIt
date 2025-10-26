# Overview

Return It is a reverse delivery service platform that streamlines returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It offers an enterprise-grade solution with a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and valuation through a strong patent portfolio. Key capabilities include a complete customer experience (booking, tracking, order management) and robust admin/driver management.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Retailer Accounts**: Multi-admin access, role management, API keys, webhooks.

## Key Features

### Customer Features
- Account management, social login, guest checkout.
- Store location autocomplete, real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.
- Mandatory photo upload for proof-of-purchase.

### Driver Features
- **Native Mobile App**: React Native with Expo (com.returnit.app) featuring screens for Login, Available Jobs, Job Details, Active Job, Camera, Earnings, Payout.
- **Real-time Job Notifications**: Expo-notifications with background/foreground handling and deep linking.
- **GPS Navigation**: Expo-location with Google Maps integration.
- **Multi-Stop Batching**: AI-powered route optimization and cluster detection.
- **Camera Package Verification**: Expo-camera for pickup/dropoff photo capture.
- **Digital Signature**: Capture for delivery confirmation.
- **Earnings Dashboard**: Daily/weekly/monthly views.
- **Instant/Weekly Payouts**: Stripe Connect integration (70/30 split).
- **AI-Powered Nearby Order Detection**: Cluster visualization with recommended routes.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export.
- **AI Knowledge Center**: Self-updating AI assistant tracking database models and API endpoints with a draggable button.
- **Real-Time Driver Tracking**: Interactive Mapbox map with active driver locations and detailed modals.

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
- **Level 2 (Authenticated Access)**: Session-based authentication, Bcrypt hashing, role-based authorization, OAuth, secure session cookies.
- **Level 3 (Sensitive Documents)**: HMAC-SHA256 signed URLs with configurable expiration for receipts, invoices, and order details.
- **Level 4 (Real-Time Tracking)**: Tracking number + ZIP code verification, enhanced rate limiting, IP-based throttling, WebSocket authentication.

### Enhanced Rate Limiting
- Specific limits for authentication, registration, payments, tracking, sensitive documents, and admin endpoints.
- IP-based throttling for abuse prevention.

### Signed URL System
- HMAC-SHA256 cryptographic signatures with configurable expiration (default 72 hours) for tamper-proof, resource-specific access to order details, receipts, and invoices.

### Data Protection & Compliance
- PCI-compliant payment processing via Stripe.
- Stripe Identity verification for drivers.
- Server-side session storage (PostgreSQL).
- SQL injection prevention (Drizzle ORM), XSS protection, security headers (Helmet), CORS protection.
- Data encryption in transit (HTTPS/TLS).
- Secure API key storage in environment variables.

### Legal Compliance & Operating Model
- **Agency Model**: ReturnIt acts as the customer's agent for transport.
- **Requirements**: Proof of purchase upload, mandatory photo verification by drivers at drop-off.

## Infrastructure & Deployment
- Production deployment at returnit.online with Neon PostgreSQL.
- Multi-environment support, automated workflow.
- Server configuration binds to 0.0.0.0:5000 with a fast /health endpoint.
- Performance optimizations including AI Knowledge Base lazy loading.
- Multi-provider map system (Mapbox, Google Maps, OpenStreetMap, Apple Maps).

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