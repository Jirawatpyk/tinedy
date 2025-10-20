# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tinedy Solutions CRM is a React-based booking management system for service businesses (Training and Cleaning). It features two distinct portals: an **Admin Portal** for administrators and managers, and a **Staff Portal** (mobile-optimized) for field staff. The application uses Supabase for backend services including PostgreSQL database, real-time subscriptions, and authentication.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
```

### Running the Application
```bash
npm run dev                    # Start development server (Vite)
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Database Setup
1. Create a Supabase project at [database.new](https://database.new)
2. Open `schema.md` and copy the SQL script from the grey code block
3. Paste and run the script in Supabase SQL Editor
4. Update credentials in `lib/supabaseClient.ts`:
   - Set `supabaseUrl` to your project URL
   - Set `supabaseAnonKey` to your anon key (from Project Settings > API)
5. Create user accounts in Supabase Authentication
6. Link users to staff records by setting `user_id` in the `staff` table

### Testing
```bash
# Tests are configured with Jest and React Testing Library
# Run tests (if configured in package.json scripts)
npm test
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript
- **Backend/Database**: Supabase (Backend-as-a-Service)
  - PostgreSQL database (managed)
  - Authentication service
  - Real-time subscriptions
  - Auto-generated REST API
- **State Management**:
  - Zustand (global UI state, auth, theme, settings)
  - TanStack Query (server state, caching, data fetching)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Vercel (Frontend hosting)

### Application Architecture

This is a **frontend-only application** that uses Supabase as the backend:

```
┌─────────────────────┐
│  React Frontend     │
│  (Vercel hosting)   │
│                     │
│  • UI Components    │
│  • Business Logic   │
│  • State Management │
└──────────┬──────────┘
           │
           │ Supabase Client (@supabase/supabase-js)
           │
           ▼
┌─────────────────────┐
│   Supabase (BaaS)   │
│                     │
│  • PostgreSQL DB    │
│  • Auth Service     │
│  • Realtime API     │
│  • Row Level Sec.   │
└─────────────────────┘
```

**No custom backend server** - all database operations go directly from the browser to Supabase using the client library. Security is enforced via Row Level Security (RLS) policies in PostgreSQL.

### Role-Based Architecture

The application has **role-based routing** implemented in [App.tsx:110-118](App.tsx#L110-L118):
- **Admin/Manager**: Routes to `MainLayout` (full CRM features)
- **Staff**: Routes to `StaffPortalLayout` (mobile-optimized portal)
- **Unauthenticated**: Shows `LoginPage`

Role determination happens during authentication when the user's staff profile is fetched from the database.

### Core Architectural Patterns

#### 1. Data Access Layer (DAL)
Location: `dal/` directory

All database operations are abstracted into DAL functions. Each entity has its own DAL file:
- `dal/bookings.ts` - Booking CRUD operations
- `dal/customers.ts` - Customer management
- `dal/staff.ts` - Staff management
- `dal/teams.ts` - Team management
- etc.

**Key pattern**: DAL functions handle:
- Database queries with proper joins
- Data mapping from snake_case (DB) to camelCase (App)
- Type safety with Supabase typed client
- Error handling

Example from [dal/bookings.ts:14-50](dal/bookings.ts#L14-L50):
- Query includes `customers!inner(*)` join
- `toBooking()` mapper transforms DB row to `Booking` type

#### 2. Custom Hooks for Business Logic
Location: `hooks/` directory

Business logic and data fetching are encapsulated in custom hooks using TanStack Query:
- `useBookings()` - Fetch bookings with caching
- `useAddBooking()` - Mutation hook for creating bookings
- `useStaff()` - Staff data management
- `useTeams()` - Team operations
- etc.

**Key pattern** from [hooks/useBookings.ts:35-50](hooks/useBookings.ts#L35-L50):
- Query hooks use `useQuery` for data fetching
- Mutation hooks use `useMutation` with:
  - Automatic cache invalidation via `queryClient.invalidateQueries()`
  - Audit logging via `addLog()`
  - User context from `useAuthStore()`
  - Success/error callbacks

#### 3. Global State Management
Location: `store/` directory

Zustand stores manage global application state:
- `authStore.ts` - Authentication state, login/logout
- `themeStore.ts` - Dark/light mode (persisted to localStorage)
- `notificationStore.ts` - In-app notifications
- `auditStore.ts` - Audit log (can persist to localStorage or database)
- `teamStore.ts`, `staffStore.ts`, etc. - Entity-specific UI state

**Key pattern** from [store/authStore.ts:18-50](store/authStore.ts#L18-L50):
- Stores expose state + actions
- Authentication state syncs with Supabase Auth
- Some stores use `persist` middleware for localStorage

#### 4. Real-time Subscriptions

The app uses Supabase Realtime to automatically update UI when data changes:
- Subscriptions are set up in custom hooks
- Example: Booking changes trigger automatic refetch
- Pattern: Subscribe in `useEffect`, cleanup on unmount

#### 5. Type Safety

**Centralized type definitions** in [types.ts](types.ts):
- Application types (camelCase): `Booking`, `Customer`, `StaffMember`, etc.
- Enums: `BookingStatus`, `Service`, `Role`, etc.

**Database type definitions** in [lib/supabaseClient.ts:10-534](lib/supabaseClient.ts#L10-L534):
- `Database` type defines complete schema
- Tables have `Row`, `Insert`, `Update` types
- Includes foreign key `Relationships`

**Path aliasing**: `@/*` maps to `src/` (configured in [tsconfig.json:21-25](tsconfig.json#L21-L25))

### Component Organization

```
components/
├── auth/           # Login, authentication
├── booking/        # Booking management components
├── customer/       # Customer management, tags
├── staff/          # Staff portal & admin staff management
├── teams/          # Team management
├── schedule/       # Calendar view, availability checker
├── dashboard/      # Dashboard charts and metrics
├── reports/        # Report generation
├── workload/       # Staff workload tracking
├── settings/       # Settings page
├── layout/         # Header, Sidebar, GlobalSearch, CommandPalette
├── layouts/        # BottomNavBar (staff portal)
└── ui/             # Reusable UI components (Button, Modal, etc.)

views/              # Top-level page components
├── staff/          # Staff portal views (mobile-optimized)
└── [entity]View.tsx # Admin portal views
```

### Key Features Architecture

#### Booking Management
- **Assignment System**: Supports both individual staff and team assignment
- **Conflict Detection**: Checks staff/team availability before assignment
- **Smart Suggestions**: Algorithm ranks staff/teams by skills, rating, workload, availability
- **Comments System**: Internal communication per booking via `booking_comments` table

#### Staff Portal (Mobile-Optimized)
Routes: `views/staff/Staff*.tsx`
- Separate layout (`StaffPortalLayout.tsx`) with bottom navigation
- Job management: View assignments, update status, report issues
- Availability management: Block time, request leave
- Performance tracking: View ratings, feedback, completed jobs
- Chat: Direct messaging with admin

#### Team Management
- Teams can have 2+ members with a designated lead
- Team assignment triggers availability check for all members
- Team performance tracking and reporting
- Conflict resolution with member substitution suggestions

#### Real-time Features
- Dashboard metrics update live
- Booking status changes reflect immediately
- In-app notifications via `notificationStore`
- Staff messages via `staff_messages` table with real-time sync

## Database Schema

Complete schema in [schema.md](schema.md). Key tables:

- `customers` - Customer profiles with tags, preferred staff, contact preferences
- `bookings` - Service bookings with status, assignments (staff/team), ratings
- `staff` - Staff members linked to auth users, notification preferences, skills
- `packages` - Service packages with pricing and duration
- `teams` / `team_members` - Team composition for multi-person jobs
- `booking_comments` - Internal notes on bookings
- `audit_logs` - Action tracking (linked to bookings)
- `tags` / `customer_tags` - Customer segmentation
- `staff_unavailability` - Blocked time slots (with recurrence support)
- `leave_requests` - Leave management with approval workflow
- `job_issues` - Issue reporting from field staff
- `staff_messages` - Chat between staff and admin

**RLS (Row Level Security)**: Comprehensive policies defined in schema:
- Admin/Manager can manage most entities
- Staff can view all data but only update their own assignments
- Audit logs are append-only

## Common Development Patterns

### Adding a New Feature

1. **Database**: Update `schema.md` if schema changes needed
2. **Types**: Add types to `types.ts`
3. **DAL**: Create/update DAL function in `dal/[entity].ts`
4. **Hook**: Create custom hook in `hooks/use[Entity].ts` using TanStack Query
5. **Store** (if needed): Add Zustand store for UI state
6. **Components**: Build UI components in `components/[feature]/`
7. **View**: Create page component in `views/`

### Working with Bookings

When modifying booking operations:
- Always use DAL functions from `dal/bookings.ts`
- Mutations automatically invalidate cache and create audit logs
- Check assignment conflicts before assigning staff/teams
- Update `booking_comments` for internal communication

### Staff Assignment Logic

Located in `hooks/useStaffSuggestions.ts` and `hooks/useTeamSuggestions.ts`:
- Match scoring algorithm considers: skills, availability, rating, current workload
- Travel time estimation for consecutive bookings
- Conflict detection checks overlapping assignments

### Audit Logging

Pattern (from mutation hooks):
```typescript
addLog(user.email, 'ACTION_TYPE', 'Human-readable description', bookingId);
```

All significant actions should be logged for accountability.

### Notification System

Two types:
1. **Toast Notifications**: Temporary UI feedback via `notificationStore.addToast()`
2. **App Notifications**: Persistent notifications (header bell icon) via `notificationStore.addNotification()`

Staff portal also supports push notifications (service worker configured).

## Important Notes

### Authentication Flow
1. User logs in via Supabase Auth (email/password)
2. [App.tsx:46-79](App.tsx#L46-L79) fetches staff profile by `user_id`
3. If no profile found, user is logged out with error
4. Auth state change triggers role-based routing

### Supabase Client Configuration
**Critical**: The client in [lib/supabaseClient.ts:548-553](lib/supabaseClient.ts#L548-L553) uses custom headers and fetch to prevent auth errors in sandboxed environments.

### Data Mapping Convention
- Database: snake_case (`booking_date`, `customer_id`)
- Application: camelCase (`bookingDate`, `customerId`)
- DAL mappers handle transformation

### Error Handling
- DAL functions throw errors for caller to handle
- Mutation hooks pass errors to `onError` callbacks
- UI displays errors via toast notifications

### Performance Considerations
- TanStack Query provides automatic caching and background refetching
- Real-time subscriptions are cleaned up on component unmount
- Indexes on database for faster queries (see `schema.md`)

## Deployment

### Deploying to Vercel

This application is designed to be deployed on Vercel:

1. **Prerequisites**:
   - Supabase project already set up (see Database Setup above)
   - GitHub repository connected to Vercel

2. **Environment Variables** (Vercel Dashboard):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Update Code** before deployment:
   - Modify [lib/supabaseClient.ts:6-7](lib/supabaseClient.ts#L6-L7) to use environment variables:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

4. **Build Settings** (Vercel):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**:
   - Push to main branch → Vercel auto-deploys
   - Or use Vercel CLI: `vercel --prod`

### Important Configuration

**Supabase CORS Settings**:
- Add your Vercel domain to Supabase allowed origins
- Go to Supabase Dashboard → Project Settings → API → CORS Allowed Origins
- Add: `https://your-app.vercel.app`

**Supabase Auth Redirect URLs**:
- Add Vercel URL to allowed redirect URLs
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add to Redirect URLs: `https://your-app.vercel.app/**`

### Production Considerations

- **Environment Variables**: Never commit Supabase keys to git - use Vercel environment variables
- **RLS Policies**: Ensure all tables have proper Row Level Security policies (already configured in schema)
- **Service Worker**: Staff portal uses service worker for offline support - ensure it's properly cached
- **Performance**: Vite automatically optimizes build with code splitting and tree shaking

## Future Development

See [TODO.md](TODO.md) for planned features including:
- E7: Team Management (mostly complete)
- E9: Mobile Staff Portal enhancements (in progress)
- Additional features deferred to future phases

When implementing features from TODO.md, follow the checklist structure and mark items complete as you progress.
