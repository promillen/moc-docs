# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a technical documentation site for the MOC-IoT device management system, built with Next.js and Nextra. The documentation covers a complete IoT ecosystem including:

- **IoT Devices** → **Fly.io Server** (CoAP/UDP) → **Supabase Edge Functions** → **Database** → **Frontend Dashboard**
- Real-time data processing with location services (HERE API integration)
- Authentication-gated documentation site deployed to Vercel
- Role-based access requiring `developer` role from the `user_roles` table

## Common Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access locally at http://localhost:3000
```

### Building and Deployment
```bash
# Build documentation site
npm run build

# Manual Vercel deployment (if needed)
vercel --prod
```

## Architecture and Key Concepts

### Data Flow Architecture
The system follows this pattern:
1. **IoT Devices** send data via CoAP/UDP to Fly.io servers
2. **Python servers** on Fly.io process protobuf payloads and forward via HMAC-secured HTTP
3. **Supabase Edge Functions** (`ingest-sensor-data`) handle data ingestion
4. **HERE Positioning API** processes location data
5. **Real-time WebSocket subscriptions** update the frontend dashboard

### Key Database Tables
- `device_config` - Device configuration and metadata
- `sensor_data` - All sensor readings and telemetry (flexible JSONB storage)
- `locations` - Dedicated location data with coordinates and accuracy
- `activity` - Device activity logs and power consumption
- `reboot` - Device reboot events
- `profiles` - User profile information
- `user_roles` - Role-based access control (admin/moderator/developer/user)
- `device_access` - User-device access permissions

### Development Change Process
When modifying data structures:
1. Update protobuf schemas in `/Protobuf/`
2. Regenerate protobuf files for all platforms
3. Update Python server processing logic
4. Modify Supabase Edge Functions
5. Update database schema if needed
6. Update frontend components

## Authentication System

The documentation site uses role-based authentication integrated with the main MOC-IoT system:

### Implementation
- **Client-side authentication** using Supabase Auth (same as main dashboard)
- **Role verification** against `user_roles` table requiring `developer` role
- **Session management** handled entirely client-side for reliability
- **Automatic redirects** to login page with return URL preservation

### Key Components
- `/pages/login.tsx` - Authentication form with role verification
- `/pages/_app.tsx` - Global auth wrapper checking sessions on all pages
- `/middleware.ts` - Minimal pass-through middleware (auth handled client-side)
- `/lib/supabase.ts` - Supabase client configuration with connection details

### User Flow
1. User accesses any documentation page
2. `_app.tsx` checks for valid Supabase session
3. If no session, redirects to `/login?redirect=<original-path>`
4. Login verifies credentials and checks for `developer` role in database
5. Successful login redirects back to original page
6. Session persists across pages and browser restarts

### Database Requirement
Users must exist in the `user_roles` table with `role = 'developer'` to access docs.

## Deployment Configuration

- **Platform**: Vercel with automatic deployment from main branch
- **Framework**: Next.js 14 with Nextra 3.0 theme for documentation
- **Build Command**: `npm run build`
- **Output Directory**: `.next/`
- **Authentication**: Client-side Supabase Auth with role verification
- **Security**: HTTPS-only, XSS protection headers, content security policies
- **URL Redirects**: Configured in `vercel.json` for `/docs/:path*` → `/:path*`

## Key Technologies

### Documentation Stack
- **Next.js 14**: React framework with SSR/SSG capabilities
- **Nextra 3.0**: Documentation theme with MDX support
- **TypeScript**: Type-safe component development
- **Tailwind CSS 4.1**: Utility-first CSS framework
- **Supabase Client 2.56+**: Database and authentication
- **Lucide React**: Icon library for UI elements

### Supabase Integration
- **Project**: `cdwtsrzshpotkfbyyyjk.supabase.co`
- **Client Library**: `@supabase/supabase-js`
- **Configuration**: Stored in `/lib/supabase.ts`
- **Auth Flow**: Password-based with role verification
- **Real-time**: Not actively used in docs (read-only access)

## Important Notes

### File Structure
```
pages/
├── _app.tsx              # Global auth wrapper
├── _meta.tsx             # Main navigation structure
├── login.tsx             # Authentication page
├── index.mdx             # Homepage
├── architecture/         # Architecture documentation
│   ├── _meta.tsx
│   ├── system-overview.mdx
│   ├── coap-bridge.mdx
│   ├── dashboard.mdx
│   └── protocol-specs.mdx
├── development/          # Development guides
│   ├── _meta.tsx
│   ├── firmware-guide.mdx
│   ├── local-testing.mdx
│   ├── database-troubleshooting.mdx
│   └── deployment.mdx
├── api-docs/             # API documentation
│   ├── _meta.tsx
│   └── edge-function.mdx
└── reference/            # Reference materials
    ├── _meta.tsx
    ├── database-schema.mdx
    └── environment-vars.mdx

lib/
└── supabase.ts           # Supabase client configuration

public/
└── mermaid-zoom.js       # Custom Mermaid diagram zoom functionality

styles/
└── mermaid.css           # Mermaid diagram styling
```

### Authentication Behavior
- All routes except `/login` require authentication
- Auth check happens in `_app.tsx` useEffect on every route
- Users without `developer` role are automatically signed out
- Login page preserves redirect URL for seamless return after auth
- Loading spinner shown during authentication verification