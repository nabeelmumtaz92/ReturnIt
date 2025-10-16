# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations. It connects customers with drivers for pickup and return services, offering an enterprise-grade solution with a white/beige design, amber color scheme (#d97706), a comprehensive admin dashboard, and AI-powered support chat. The platform features a distinctive cardboard/shipping theme, supporting a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities. Return It is production-ready, deployed at returnit.online, aiming for significant market penetration and a strong valuation. The platform uses Mapbox GL for map visualization with Google Maps integration for turn-by-turn navigation. The platform also has a comprehensive patent portfolio strategy.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript (Vite).
- **UI Components**: Shadcn/ui built on Radix UI, styled with Tailwind CSS (custom cardboard/shipping theme).
- **State Management**: Zustand (global), React Query (server).
- **Design System**: Figma-based, mobile-first responsive design with a component library and design tokens. UI/UX emphasizes a white/beige aesthetic, sophisticated gradients, and professional typography using the Stitch design system (Stitch orange primary color, Work Sans font, specific border radius and shadow patterns).
- **Navigation**: Universal back button component (Instagram-style) for consistent navigation across all pages.

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Authentication**: Email/Password (bcrypt), Google, Apple, Facebook via Passport.js; role-based authorization.

## Data Storage
- **Database**: PostgreSQL (Neon).
- **Schema Management**: Drizzle Kit.
- **Object Storage**: Replit App Storage (GCS-backed) for file uploads.
  - **Receipt uploads**: Private ACL with user ownership, durable `/objects/uploads/{uuid}` paths stored in database
  - **Verification photos**: Driver pickup/delivery photos stored in JSONB fields with ACL policies
  - **Security**: All uploads finalized with ACL ownership before database persistence, presigned URLs for direct-to-storage uploads

## Core Data Models
- **Users**: Authentication, roles, Stripe Connect, payment preferences.
- **Orders**: Full lifecycle management, payment processing, retailer tracking.
- **Driver Payouts**: Tracking, Stripe transfers, 1099 generation.
- **Retailer Accounts**: Multi-admin access, role management, API keys, webhooks.

## Key Features

### Customer Features
- Account management, social login.
- **Guest Checkout**: Complete booking flow without account creation. Users can fill all booking steps as guests, with data saved to localStorage. Authentication prompt appears at final step with options to create account or sign in. After authentication, booking data is automatically restored for seamless completion.
- **Store Location Autocomplete**: Type store name (e.g., "Target") to see dropdown with:
  - "Any [Store] Location" option - driver delivers to nearest location (e.g., allows returning Target items at any Target store)
  - Specific store locations with addresses for precise routing
- Real-time WebSocket GPS tracking.
- Order history, multi-payment methods, promotional codes.
- AI-powered support chat, in-app messaging, push notifications.
- Multi-package booking, special handling, donation options.
- Mobile review system.

### Driver Features
- Native mobile app (React Native).
- Real-time job notifications, GPS navigation, multi-stop batching.
- Camera package verification, digital signature.
- Earnings dashboard, instant/weekly payouts, 70/30 split via Stripe Connect.
- AI-Powered Nearby Order Detection with cluster visualization and smart batch suggestions.
- Mobile review system.

### Admin Features
- Live operations dashboard, driver/customer management.
- Manual order creation, payment processing, bulk payouts.
- Advanced analytics, Excel export system.
- **AI Knowledge Center** (/ai-knowledge): Self-updating AI assistant with auto-scanning knowledge base. Automatically tracks all database models (84), API endpoints (240), and platform documentation. Features manual refresh capability and clean interface optimized for split-screen use with Replit AI. Master admin access only (nabeelmumtaz92@gmail.com, durremumtaz@gmail.com, nabeelmumtaz4.2@gmail.com).

### Retailer Enterprise Platform
- **Tier 1 (Self-Service Portal)**: Company registration, multi-admin access, subscription management, usage analytics.
- **Tier 2 (API & Integration System)**: RESTful API, API keys with permission scoping and rate limiting, webhook notification system.

### Exchange Feature Roadmap (Patent #25)
ReturnIt is expanding beyond returns to offer comprehensive **two-way exchange logistics**, transforming the platform into a full bidirectional delivery service.

**Current Status**: Planning Phase
- UI tab placeholder added to booking interface ("Exchange - Coming Soon")
- Patent documentation complete (Patent #25: Two-Way Exchange Logistics System)

**Exchange Flow Overview**:
1. **Order Creation**: Customer selects "Exchange" and specifies replacement item details
2. **Pickup**: Driver collects original item from customer
3. **Store Interaction**: Driver brings item to store for exchange processing
4. **Three Scenarios**:
   - **Immediate Exchange**: Store issues replacement on-the-spot, driver delivers to customer (single trip)
   - **Delayed Exchange**: Store accepts item but replacement pending, operator holds until ready, new driver delivers
   - **Exchange Refused**: Store rejects exchange, item returned to customer or operator hold pending resolution

**Technical Implementation Plan**:
- **Phase 1** (Q1 2026): Core exchange workflow, order type classification, driver app exchange interface
- **Phase 2** (Q2 2026): Operator warehouse holding system, multi-leg routing optimization, price differential payment processing
- **Phase 3** (Q3 2026): Enterprise API for merchant integration, white-label exchange platform, ML-powered exchange prediction

**Database Schema Additions**:
- `order_type`: ENUM('return', 'exchange')
- `exchange_status`: ENUM('pending', 'replacement_issued', 'replacement_delivered', 'refused')
- `replacement_tracking`: Tracking info for delayed exchanges
- `linked_order_id`: References second leg of two-part exchange

**Business Impact**:
- **2x Revenue**: Exchanges generate both pickup and delivery fees
- **Higher Merchant Value**: Exchanges reduce refunds, increase customer retention
- **Market Differentiation**: First doorstep exchange service in reverse logistics industry

**Legal Compliance**:
- Agency model extends to exchanges: "ReturnIt acts solely to transport items between customer and retailer, not purchasing or reselling merchandise"
- Store authorization required for all exchanges
- Photo documentation at both pickup and delivery

### Return Graph - Proprietary Routing Intelligence (Competitive Moat)
The **Return Graph** is ReturnIt's core competitive advantage - a self-learning knowledge graph that becomes smarter with every return, creating an unassailable moat that competitors cannot replicate.

**Core Concept**: A graph database that tracks which drop-off locations work best, which stores accept third-party returns, and optimal routing strategies based on real-world performance data.

**Database Architecture** (5 Tables, 89 Total Models):
- **graph_nodes**: Physical locations (stores, drop-off points, partner networks, collection centers)
- **graph_edges**: Connections with multi-dimensional weights (distance, time, cost, acceptance probability)
- **routing_decisions**: Every routing decision logged for ML training
- **node_performance_history**: Time-series performance metrics per node
- **graph_policy_rules**: Dynamic rules learned from experience

**Intelligence System**:
- **A* Pathfinding Algorithm**: Multi-criteria optimization considering distance, time, cost, and acceptance probability
- **Machine Learning Layer**: Exponential moving average (EMA) learning updates node success rates, wait times, and satisfaction scores in real-time
- **Multi-Dimensional Weights**: Each edge tracks distance (km), time (min), fuel cost ($), traffic multipliers, acceptance probability (0.0-1.0), and reliability scores
- **Dynamic Policy Learning**: System learns rules like "Target Chesterfield accepts Nike returns 95% of the time before 3pm"

**Proprietary Data Moat**:
- **Historical Success Patterns**: Which stores accept which brands/items
- **Time-Window Optimization**: Best times to visit each location
- **Capacity Intelligence**: Real-time tracking of store return desk congestion
- **Driver Performance Correlation**: How different drivers perform at different nodes

**Business Value**:
- **Network Effects**: Graph gets smarter with every completed return (100K+ returns = unbeatable routing intelligence)
- **Patent Potential**: Novel multi-criteria pathfinding for reverse logistics (Patent #26 candidate)
- **Competitive Barrier**: New competitors start with empty graph - ReturnIt has years of learned patterns
- **Enterprise Value**: Can license graph intelligence to retailers for their own reverse logistics

**Technical Implementation** (server/return-graph-service.ts):
- ReturnGraphService class with A* pathfinding
- findOptimalDropoffNode(): Multi-criteria route optimization
- logRoutingDecision(): Captures every decision for ML training
- updateRoutingDecisionActuals(): Compares predictions vs reality for learning
- updateNodePerformance(): Real-time EMA learning of node quality

**Future ML Enhancements**:
- Deep learning models to predict acceptance probability based on item category, brand, condition, time, and store characteristics
- Clustering algorithms to identify optimal new node locations
- Anomaly detection to flag underperforming nodes requiring verification

## Security & Compliance
- Bcrypt password hashing, server-side session storage, CSRF protection, rate limiting.
- Secure API key storage, PCI-compliant payment processing via Stripe.
- Stripe Identity driver verification, data encryption.
- SQL injection prevention, sensitive data protection, security headers (Helmet), CORS protection, robust authentication security, API security, and webhook security.

## Legal Compliance & Operating Model
- **Agency Model**: ReturnIt operates as customer's agent, not as courier service - no courier license required.
- **Proof of Purchase**: Required receipt/order confirmation upload in booking flow for all returns.
- **Photo Verification**: Mandatory drop-off photo documentation by drivers showing completion at store return desk.
- **Store Interaction**: Drivers use public return desks only, present as customer's agent, never misrepresent authority.
- **Professional Standards**: Clear conduct guidelines, no store employee impersonation, acceptance of store decisions.
- **Documentation**: Comprehensive legal compliance guidelines (LEGAL_COMPLIANCE_GUIDELINES.md), driver checklist (mobile-apps/returnit-driver/LEGAL_CHECKLIST.md).
- **Risk Mitigation**: Photo audit trail, agency disclosure in terms of service, professional driver training requirements.

## Infrastructure & Deployment
- Production deployment at returnit.online, Neon PostgreSQL.
- Multi-environment support, automated workflow with Replit.
- **Server Configuration**: Binds to 0.0.0.0:5000 for deployment compatibility
- **Health Check Endpoint**: 
  - GET /health endpoint registered BEFORE all middleware for instant response (~45ms)
  - Returns `{"status":"healthy","service":"ReturnIt API","timestamp":"..."}`
  - No database calls, no heavy operations - deployment-ready
  - Registered as first route before Vite dev server to prevent interference
  - Responds immediately without going through session, authentication, or database middleware
- **Performance Optimizations**:
  - AI Knowledge Base uses lazy loading (loads on first AI request, not startup)
  - Server startup time: ~2 seconds (down from 30s)
  - Health check response time: ~45-50ms average
- **Map Provider System**: Multi-provider support (Mapbox, Google Maps, OpenStreetMap, Apple Maps) with user preferences stored in account settings

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
- **Replit App Storage**: Object storage for receipt uploads, verification photos, and driver documents with ACL-based access control.