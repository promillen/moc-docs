# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a documentation site for the MOC-IoT device management system, built with MkDocs Material. The documentation covers a complete IoT ecosystem including:

- **IoT Devices** → **Fly.io Server** (CoAP/UDP) → **Supabase Edge Functions** → **Database** → **Frontend Dashboard**
- Real-time data processing with location services (HERE API integration)
- Authentication-gated documentation site deployed to Vercel

## Common Development Commands

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Start development server (no auth checks)
mkdocs serve

# Access locally at http://localhost:8000
```

### Building and Deployment
```bash
# Build documentation site
mkdocs build

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
- `sensor_data` - All sensor readings and telemetry  
- `activity` - Device activity logs
- `reboot` - Device reboot events

### Development Change Process
When modifying data structures:
1. Update protobuf schemas in `/Protobuf/`
2. Regenerate protobuf files for all platforms
3. Update Python server processing logic
4. Modify Supabase Edge Functions
5. Update database schema if needed
6. Update frontend components

## Documentation Structure

The docs follow a structured organization:
- **Architecture** - System overviews and data flow
- **API Documentation** - Edge functions, CoAP interfaces, schemas
- **Operations** - Deployment, monitoring, troubleshooting
- **Development** - Local setup, testing, contributing guides
- **Reference** - Environment variables, database schema, changelog

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
- `/pages/authentication.mdx` - Complete documentation of auth flow

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

- **Vercel** handles automatic deployment from `main` branch
- Build process: `pip install -r requirements.txt && mkdocs build`
- Output directory: `site/`
- Security headers configured for XSS protection and content security