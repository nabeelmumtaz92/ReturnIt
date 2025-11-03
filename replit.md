# Overview

Return It is a reverse delivery service platform designed to streamline returns, exchanges, and donations by connecting customers with drivers for pickup and return services. It offers an enterprise-grade solution featuring a distinctive cardboard/shipping theme, a comprehensive admin dashboard, and AI-powered support. The platform aims for significant market penetration and valuation through a strong patent portfolio, providing a complete customer experience (booking, tracking, order management) and robust admin/driver management.

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