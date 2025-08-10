# Overview

Returnly is a reverse delivery service web application that facilitates returns, exchanges, and donations by handling the pickup and return process for customers. The platform connects customers who need items returned with drivers who can handle the delivery. The application features a modern React frontend with a Node.js/Express backend, using a PostgreSQL database for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom cardboard/shipping theme featuring tan, orange, and brown brand colors
- **State Management**: Zustand for global state management, React Query for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints for order management

## Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Fallback**: Memory storage implementation for development/testing
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Core Data Models
- **Users**: Authentication with driver/customer role distinction
- **Orders**: Complete order lifecycle management with status tracking (created, assigned, picked_up, dropped_off, refunded)

## Authentication and Authorization
- **Simple Authentication**: Basic username/password system without external providers
- **Role-Based Access**: Driver vs customer role differentiation
- **Session Management**: Server-side session storage with PostgreSQL

## Mobile-First Design
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Touch-Friendly**: Optimized for mobile interactions and gestures
- **Cardboard Theme**: Custom shipping/logistics-inspired theme with warm tan, orange, and brown colors for accessibility and brand consistency

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database toolkit and query builder

## UI and Styling
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **Replit**: Development environment with live preview capabilities
- **ESBuild**: Fast JavaScript bundler for production builds

## Runtime Libraries
- **React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Zustand**: Lightweight state management
- **Date-fns/Dayjs**: Date manipulation utilities
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition