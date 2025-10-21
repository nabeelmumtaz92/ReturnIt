# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations. It connects customers with drivers for pickup and return services, offering an enterprise-grade solution with a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and a strong valuation, supported by a comprehensive patent portfolio strategy. Key capabilities include a complete customer experience (booking, tracking, order management) and robust admin/driver management.

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
- Bcrypt password hashing, server-side session storage, CSRF protection, rate limiting.
- PCI-compliant payment processing, secure API key storage, Stripe Identity verification.
- Data encryption, SQL injection prevention, security headers, CORS protection.

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