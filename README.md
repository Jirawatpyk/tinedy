# Tinedy Solutions CRM 🚀

A comprehensive booking management system for service businesses, featuring dual portals for administrators and field staff.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

---

## 📋 Overview

Tinedy Solutions CRM is a modern, React-based booking management system designed for service businesses (Training and Cleaning services). The application features:

- **Admin Portal**: Full-featured CRM for administrators and managers
- **Staff Portal**: Mobile-optimized portal for field staff
- **Real-time Updates**: Live data synchronization across all devices
- **Smart Scheduling**: Intelligent staff/team assignment with conflict detection

Built with React, TypeScript, and Supabase, this application provides a complete solution for managing bookings, customers, staff, and teams.

---

## ✨ Key Features

### Admin Portal
- **Dashboard**: Real-time metrics, revenue tracking, and performance analytics
- **Booking Management**:
  - Create, view, edit, and delete bookings
  - Smart staff/team assignment with conflict detection
  - Booking status tracking (Pending → Confirmed → In Progress → Completed)
  - Internal comments and communication
  - Rating and feedback system
- **Customer Management**:
  - Customer profiles with contact preferences
  - Tagging system for segmentation
  - Preferred staff assignment
  - Booking history
- **Staff Management**:
  - Staff profiles with skills and certifications
  - Performance tracking and ratings
  - Workload monitoring
  - Availability management
- **Team Management**:
  - Create teams with 2+ members
  - Designate team leads
  - Team performance tracking
  - Conflict resolution with member substitution
- **Schedule View**: Calendar interface with availability checker
- **Reports**: Generate reports on revenue, staff performance, and bookings
- **Settings**: Business hours, notification preferences, and system configuration

### Staff Portal (Mobile-Optimized)
- **Job Management**: View assigned jobs, update status, report issues
- **Availability**: Block time slots, request leave
- **Performance**: View ratings, feedback, and completed jobs
- **Messages**: Direct communication with admin
- **Real-time Notifications**: Push notifications for new assignments

### Technical Features
- **Real-time Subscriptions**: Automatic UI updates when data changes
- **Smart Suggestions**: Algorithm ranks staff/teams by skills, rating, workload, availability
- **Audit Logging**: Track all actions for accountability
- **Row Level Security**: Database-level security policies
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Theme toggle (persisted to localStorage)
- **Offline Support**: Service worker for basic offline functionality

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS
- **Shadcn UI** - Component library (Radix UI primitives)
- **Lucide React** - Icon library

### State Management
- **Zustand 4.5** - Global state (auth, theme, notifications)
- **TanStack Query 5.51** - Server state, caching, data fetching

### Backend (Supabase)
- **PostgreSQL** - Database
- **Supabase Auth** - Authentication service
- **Supabase Realtime** - WebSocket subscriptions
- **Row Level Security** - Database-level authorization

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend services

---

## 🏗️ Architecture

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
           │ @supabase/supabase-js
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

**No custom backend server** - all database operations go directly from the browser to Supabase. Security is enforced via Row Level Security (RLS) policies.

### Project Structure

```
src/
├── components/         # React components
│   ├── auth/          # Login, authentication
│   ├── booking/       # Booking management
│   ├── customer/      # Customer management
│   ├── staff/         # Staff portal & admin staff management
│   ├── teams/         # Team management
│   ├── schedule/      # Calendar view
│   ├── dashboard/     # Dashboard charts
│   ├── layout/        # Header, Sidebar, Search
│   └── ui/            # Reusable UI components
├── dal/               # Data Access Layer (database operations)
├── hooks/             # Custom React hooks (business logic)
├── store/             # Zustand stores (global state)
├── views/             # Top-level page components
├── lib/               # Supabase client, utilities
└── types.ts           # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier available)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tinedy-crm.git
   cd tinedy-crm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:

   a. Create a new project at [database.new](https://database.new)

   b. Run the database schema:
   - Open [schema.md](schema.md)
   - Copy the SQL script from the grey code block
   - Paste and run in Supabase SQL Editor

   c. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

4. **Configure Supabase client**:

   Edit [lib/supabaseClient.ts](lib/supabaseClient.ts#L6-L7):
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

   **For production**, use environment variables:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

5. **Create initial user**:

   a. In Supabase Dashboard → Authentication → Users:
   - Click "Add user" → "Create new user"
   - Email: `admin@tinedy.com` (or your email)
   - Password: (choose a password)
   - Enable "Auto Confirm User"

   b. Link user to staff profile:
   - Go to Table Editor → `staff` table
   - Insert a new row:
     - `name`: Your name
     - `email`: Same email as above
     - `role`: `admin`
     - `user_id`: Copy the UUID from Authentication → Users
   - Save

6. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) and login with your credentials.

---

## 📖 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive project documentation, architecture, and development patterns
- **[schema.md](schema.md)** - Complete database schema with SQL setup
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Step-by-step deployment guide for Vercel

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production (output: dist/)
npm run preview  # Preview production build locally
```

### Key Patterns

#### Data Access Layer (DAL)
All database operations are abstracted in `dal/` directory:
```typescript
// dal/bookings.ts
export async function fetchBookings() { ... }
export async function addBooking(booking: BookingInsert) { ... }
```

#### Custom Hooks with TanStack Query
Business logic encapsulated in hooks:
```typescript
// hooks/useBookings.ts
export function useBookings() {
  return useQuery({ queryKey: ['bookings'], queryFn: fetchBookings });
}

export function useAddBooking() {
  return useMutation({
    mutationFn: addBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      addLog(user.email, 'BOOKING_CREATED', 'Created new booking', bookingId);
    }
  });
}
```

#### Global State with Zustand
```typescript
// store/authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  login: async (email, password) => { ... },
  logout: async () => { ... }
}));
```

### Code Conventions

- **Path Aliasing**: `@/*` maps to `src/`
- **Naming Convention**:
  - Database: `snake_case` (e.g., `booking_date`)
  - Application: `camelCase` (e.g., `bookingDate`)
  - DAL mappers handle transformation
- **Type Safety**: All types defined in [types.ts](types.ts)

---

## 🚢 Deployment

### Deploy to Vercel

1. **Set environment variables** in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Configure Supabase**:
   - Add Vercel URL to CORS Allowed Origins (Project Settings → API)
   - Add Vercel URL to Auth Redirect URLs (Authentication → URL Configuration)

3. **Deploy**:
   - Connect GitHub repository to Vercel
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

---

## 🔐 Security

- ✅ Environment variables (never commit credentials)
- ✅ Row Level Security (RLS) policies on all tables
- ✅ Supabase anon key (public, safe to expose)
- ✅ CORS configured for specific domains only
- ✅ Audit logging for all critical actions

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code conventions (see [CLAUDE.md](CLAUDE.md))
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Workflow

- Use TanStack Query for data fetching
- Abstract database operations in DAL functions
- Add audit logs for significant actions
- Update types in [types.ts](types.ts)
- Test locally before pushing

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

**Common Issues:**

- **Login fails / "No staff profile found"**: Make sure `user_id` in `staff` table matches the UUID in Supabase Authentication
- **CORS errors**: Add your domain to Supabase CORS Allowed Origins
- **Build fails**: Run `npm run build` locally to catch TypeScript errors

**Need help?**
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- Review [CLAUDE.md](CLAUDE.md) for architecture questions
- Open an issue on GitHub

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Shadcn UI](https://ui.shadcn.com) - Component library
- [Radix UI](https://www.radix-ui.com) - Accessible primitives
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs) - State management

---

**Built with ❤️ for service businesses**
