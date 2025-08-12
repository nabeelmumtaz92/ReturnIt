# Overview

Returnly is a reverse delivery service platform designed to simplify returns, exchanges, and donations by managing the pickup and return process for customers. The platform connects customers needing returns handled with drivers capable of providing the service. It aims to be an enterprise-grade solution featuring a sophisticated white/beige design, a comprehensive admin dashboard, a driver onboarding system, and professional business content, all while retaining a distinctive cardboard/shipping theme. The system supports a complete customer experience (booking, tracking, order management) and robust admin/driver management capabilities for pilot operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite.
- **UI Components**: Shadcn/ui built on Radix UI primitives for accessibility.
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme (tan, orange, brown).
- **State Management**: Zustand for global state, React Query for server state.
- **Routing**: Wouter for client-side routing.
- **Form Handling**: React Hook Form with Zod validation.
- **Design System**: Comprehensive Figma-based design system with mobile-first responsive components, including a full component library and design token system.
- **UI/UX Decisions**: Refined white/beige design aesthetic, sophisticated gradients, professional typography, and a distinctive cardboard/shipping theme with authentic stock photography.

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
- **Orders**: Full lifecycle management (created, assigned, picked_up, dropped_off, refunded), payment processing with 70/30 split.
- **Driver Payouts**: Tracking for instant vs. weekly payments, Stripe transfers, 1099 generation.
- **Driver Incentives**: Bonus system (size-based, peak season, multi-stop).
- **Business Information**: Company profile, contact details, mission statements.

## Authentication and Authorization
- **Authentication**: Basic username/password, Email/Password (bcrypt), Google, Apple, Facebook sign-in via Passport.js.
- **Authorization**: Role-based access (driver vs. customer).
- **Session Management**: Server-side session storage.

## Features and Capabilities
- **Customer Website**: Book pickups, real-time tracking, order history, mobile-responsive.
- **Customer Mobile App (Future)**: Native mobile experience, camera integration, push notifications, location services, offline capabilities.
- **Driver Mobile App**: View/accept jobs, GPS navigation, status updates, earnings dashboard with instant pay/incentives, payment management (Stripe Connect 70/30 split), automatic 1099 generation, driver ratings.
- **Admin Tools**: Comprehensive operations dashboard for live jobs, reassign, refund, manual payouts, content controls (pricing, fees, blackout dates).
- **Payment Processing**: Multi-method (cards, Apple Pay, Google Pay, PayPal via Stripe), promotional codes, driver incentive system, 70/30 payment split.

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

## Integrations (Planned/Implemented)
- **Stripe**: Payment processing (Stripe Connect for driver payouts, Stripe Identity for driver onboarding).
- **Google OAuth**: For user authentication (requires proper Replit domain configuration).
- **Google/Mapbox**: Geocoding and routing (planned).
- **Checkr**: Background checks (planned).
- **Twilio (or similar)**: Push + SMS notifications (planned).