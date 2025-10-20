# Tinedy Solutions CRM

A sleek and modern CRM application for managing service bookings. This application allows customers to book appointments for services like Training and Cleaning, while administrators and managers can efficiently manage booking statuses, staff assignments, and gain valuable business insights through comprehensive reporting tools.

## ✨ Key Features

*   **📊 Interactive Dashboard**: Get a high-level overview of your business with key metrics like revenue, new customers, and unassigned jobs. Visualize data with dynamic charts for revenue trends and booking status breakdowns.
*   **🗓️ Comprehensive Booking Management**: Full CRUD functionality for bookings. Includes powerful filtering, searching, bulk actions (delete, update status, assign staff), and a detailed view with an internal commenting system.
*   **👥 Customer & Staff Management**: Easily manage customer and staff profiles with add, edit, and archive capabilities.
*   **📦 Service Package Management**: Define and manage the service packages your business offers, including pricing, duration, and included services.
*   **📅 Visual Schedule**: A responsive weekly/monthly calendar view of all bookings, filterable by staff and status, with quick actions for adding new bookings.
*   **📈 Insightful Reporting**: Generate and export reports on monthly revenue, staff performance, and popular packages to make data-driven decisions.
*   **🛡️ Secure Authentication & Profiles**: A complete authentication system with secure login, role-based access control, and a user profile page for managing personal info, password, and notification preferences.
*   **⚡ Real-time Updates**: Powered by Supabase Realtime, the UI updates instantly across all connected clients when data changes.
*   **🔔 In-App Notifications**: Stay informed with real-time notifications for key events like new bookings, assignments, and status changes.
*   **🌗 Light & Dark Mode**: A user-toggleable theme for comfortable viewing in any lighting condition.
*   **📝 Audit Trail**: Keep track of important actions performed within the system with a persistent audit log that can be stored in the browser or the database.

## 📝 Future Features & To-Do

This section outlines planned features to enhance the capabilities of the application.

### E4: Staff Assignment & Optimization
**Epic Description**: Enable intelligent staff assignment to bookings with conflict detection and optimization.

**Business Value**: Reduces scheduling conflicts, optimizes staff utilization, improves customer satisfaction.

**Success Metrics**:
- <30 seconds average assignment time
- Zero double-booking conflicts
- 85%+ staff utilization rate
- 80%+ optimal staff matches

#### User Stories

**Story E4-1: Manual Staff Assignment**
> As an admin user, I want to assign a staff member to a booking so that I can delegate work to my team.

*Acceptance Criteria*:
- [x] "Assign Staff" button on booking detail
- [x] Modal shows list of available staff for booking date/time
- [x] Staff cards show: photo, name, skills, current assignments, rating
- [x] Can search/filter staff list
- [x] Availability indicator: Available, Busy, Partially Available
- [x] Warning if staff has conflict or nearby booking
- [x] Shows estimated travel time from previous job
- [x] Confirmation before assigning
- [x] Assignment updates booking immediately
- [x] Notification sent to staff (if configured)

- **Story Points**: 8
- **Priority**: P0
- **Dependencies**: E1-2, E2-2, E2-4

---

**Story E4-2: Conflict Detection**
> As an admin user, I want the system to detect scheduling conflicts so that I don't double-book staff members.

*Acceptance Criteria*:
- [x] Real-time conflict check when assigning staff
- [x] Conflict types detected: Time overlap, Same time booking, Exceeds max daily jobs
- [x] Visual warning displayed clearly
- [x] Conflict details shown: conflicting booking ID, time, customer
- [x] Option to proceed anyway (with override reason required)
- [x] Option to view/resolve conflict
- [x] Cannot save assignment if hard conflict (without override permission)
- [x] Conflict logged in audit trail

- **Story Points**: 8
- **Priority**: P0
- **Dependencies**: E4-1

---

**Story E4-3: Staff Availability Check**
> As an admin user, I want to quickly check which staff are available so that I can make informed assignment decisions.

*Acceptance Criteria*:
- [x] "Check Availability" tool accessible from toolbar
- [x] Input: date, time range, required skills (optional)
- [x] Shows: Available staff, Partially available staff, Unavailable staff
- [x] Each staff shows: availability hours, current bookings
- [x] Shows next free slot
- [ ] Response time < 200ms
- [x] Results sortable by match score (rating)
- [x] Can create booking directly from results
- [ ] Availability cached for 5 minutes

- **Story Points**: 5
- **Priority**: P0
- **Dependencies**: E2-4, E2-5

---

**Story E4-4: Smart Assignment Suggestions**
> As an admin user, I want the system to suggest best-fit staff for bookings so that I can make optimal assignments quickly.

*Acceptance Criteria*:
- [x] "Suggested Staff" section on assignment modal
- [x] Shows top 3-5 best matches
- [x] Match score displayed (0-100)
- [x] Match criteria shown: Skills match, Availability, Performance, Workload
- [x] Algorithm considers: Required skills, Staff rating, Previous assignments, Travel distance, Current workload
- [x] Can sort by different criteria
- [x] One-click assign from suggestions
- [x] "Why this suggestion?" tooltip explains scoring

- **Story Points**: 8
- **Priority**: P1
- **Dependencies**: E4-1, E2-5

---

**Story E4-5: Travel Time Calculation**
> As an admin user, I want to see estimated travel time between jobs so that I can schedule realistic assignments.

*Acceptance Criteria*:
- [x] Shows travel time when assigning staff with previous booking
- [x] Uses previous booking address and new booking address
- [x] Estimates based on: distance, typical Bangkok traffic, time of day
- [x] Warning if travel time > 30 minutes
- [x] Warning if insufficient buffer time
- [ ] Suggests buffer time addition
- [ ] Can manually adjust estimated travel time
- [ ] Travel time visible on staff schedule view

- **Story Points**: 5
- **Priority**: P1
- **Dependencies**: E4-1

---

**Story E4-6: Reassign Staff**
> As an admin user, I want to reassign a booking to different staff so that I can handle schedule changes or conflicts.

*Acceptance Criteria*:
- [x] "Reassign" button on assigned booking
- [x] Shows currently assigned staff with reason for reassignment
- [x] Shows available replacement staff
- [x] Tracks reassignment history
- [x] Previous staff unassigned cleanly
- [x] New staff assigned with notification
- [x] Reason required for reassignment
- [x] Confirmation before completing reassignment
- [x] Both staff notified of change (if configured)

- **Story Points**: 5
- **Priority**: P0
- **Dependencies**: E4-1

---

**Story E4-7: Unassign Staff**
> As an admin user, I want to remove staff assignment from booking so that I can handle cancellations or reassignments.

*Acceptance Criteria*:
- [x] "Unassign" button on assigned booking
- [x] Requires confirmation
- [x] Reason required (dropdown)
- [x] Staff notified of unassignment (if configured)
- [x] Booking status remains unchanged (still needs assignment)
- [x] Unassignment logged in history
- [x] Staff availability freed up
- [x] Warning if booking is within 24 hours

- **Story Points**: 3
- **Priority**: P0
- **Dependencies**: E4-1

---

**Story E4-8: Workload Balancing**
> As an admin user, I want to see staff workload distribution so that I can balance assignments fairly.

*Acceptance Criteria*:
- [x] Workload view shows: Jobs per period, Hours per period, Utilization %
- [x] Visual indicators: Under-utilized, Optimal, Over-utilized
- [x] Color coding: Green (good), Yellow (approaching max), Red (overloaded)
- [x] Can filter by date range
- [x] Shows compared to team average
- [x] Warning when assigning to overloaded staff
- [x] Suggests under-utilized alternatives (via sorted view)
- [ ] Export workload report

- **Story Points**: 5
- **Priority**: P1
- **Dependencies**: E2-2, E4-1

---

**Story E4-9: Preferred Staff Assignment**
> As an admin user, I want to honor customer preferred staff requests so that I can improve customer satisfaction.

*Acceptance Criteria*:
- [x] Customer profile shows preferred staff (if any)
- [x] Preferred staff highlighted when assigning
- [x] Preferred staff shown first in suggestions
- [x] Booking shows "Preferred staff request" badge
- [ ] Can override preference with reason
- [x] Track preferred staff satisfaction rate
- [ ] Notify if preferred staff unavailable
- [ ] Suggest booking alternative time when preferred staff available

- **Story Points**: 5
- **Priority**: P1
- **Dependencies**: E4-1, E1-2

---

**Story E4-10: Assignment History**
> As an admin user, I want to view assignment history for bookings so that I can track changes and accountability.

*Acceptance Criteria*:
- [x] Assignment history section on booking detail
- [x] Shows: Date/time, Previous staff, New staff, Changed by, Reason
- [ ] Can expand for full details
- [ ] Linked to staff profiles
- [ ] Shows assignment duration
- [ ] Export assignment history
- [ ] Filter by staff member

- **Story Points**: 3
- **Priority**: P1
- **Dependencies**: E4-1, E4-6

### E5: Customer Profile Enhancements
**Epic Description**: Expand the customer profile to include more detailed information, enabling better segmentation, personalization, and operational efficiency.

**Business Value**: Increases customer retention, improves service personalization, reduces administrative overhead.

**Success Metrics**:
- 90%+ customer profiles have complete contact/preference info
- 50% reduction in time to find customer info
- 25% increase in bookings from targeted marketing (using tags)
- 15% increase in customer satisfaction score

#### User Stories

**Story E5-1: Multiple Addresses & Extended Contact Info**
> As an admin, I want to store multiple addresses and extended contact info (Line ID, preferred contact method) for a customer so I can provide more flexible and personalized service.

*Acceptance Criteria*:
- [ ] Customer profile supports multiple addresses (e.g., 'Home', 'Office').
- [ ] Can set a default address for new bookings.
- [x] `line_id` field added to customer profile.
- [x] `preferred_contact_method` (Email, Phone, Line) field added.
- [ ] UI supports adding/editing/deleting addresses.
- [ ] New booking form allows selecting from saved addresses.

- **Story Points**: 8
- **Priority**: P1
- **Dependencies**: E1-2

---

**Story E5-2: Profile Quick Actions**
> As an admin, I want to quick action buttons on a customer's profile so I can perform common tasks efficiently.

*Acceptance Criteria*:
- [x] "Create Booking" button on customer detail modal.
- [x] Clicking it opens the new booking form, pre-filled with the customer's details.
- [x] "Send Email" button (opens default mail client).
- [x] "Call" button (initiates call on mobile).

- **Story Points**: 3
- **Priority**: P0
- **Dependencies**: E1-2, E1-3

---

**Story E5-3: Advanced Tagging**
> As an admin, I want to apply tags to customers so that I can segment them for marketing and reporting.

*Acceptance Criteria*:
- [x] UI for adding and removing tags on the customer detail modal.
- [x] Tags are displayed clearly on the customer profile.
- [x] Tags are searchable in the global search.
- [x] Can filter the main customer list by one or more tags.
- [x] Database schema updated to support a many-to-many relationship between customers and tags.
- [x] Can create/delete/rename tags globally (admin only).

- **Story Points**: 8
- **Priority**: P1
- **Dependencies**: E1-2

---

**Story E5-4: Address Map Links**
> As a staff member, I want to click on a booking address to open it in a map so that I can easily find the location.

*Acceptance Criteria*:
- [x] Address in the booking detail modal is a clickable link.
- [x] Clicking the link opens Google Maps in a new tab with the address pre-filled.
- [x] Link is also available on the schedule view popover.

- **Story Points**: 2
- **Priority**: P0
- **Dependencies**: E1-3

---

**Story E5-5: Advanced Notes & Preferences**
> As an admin, I want a more structured way to record customer notes and preferences so that service can be highly personalized.

*Acceptance Criteria*:
- [x] 'Preferred Staff' is a dedicated, selectable field.
- [x] Notes system tracks author and timestamp for each entry.
- [ ] Can categorize notes (e.g., 'Service', 'Billing', 'Access').
- [ ] Can mark notes as "Important" to pin them to the top.
- [x] Notes are searchable.

- **Story Points**: 5
- **Priority**: P1
- **Dependencies**: E1-2

---

**Story E5-6: Global Search Enhancement**
> As a user, I want the main search bar to provide instant results as I type so that I can find information faster.

*Acceptance Criteria*:
- [x] Global search bar in the header is always visible.
- [x] Results appear in a dropdown as the user types (debounced).
- [x] Results are grouped by type (Customers, Staff, Bookings).
- [x] Clicking a result navigates to the relevant page and applies a filter.
- [ ] Keyboard navigable (up/down/enter).

- **Story Points**: 5
- **Priority**: P0
- **Dependencies**: E1-1, E1-2, E1-3

---

**Story E5-7: Duplicate Detection**
> As an admin, I want the system to warn me about potential duplicates when creating a customer so that I can maintain a clean database.

*Acceptance Criteria*:
- [x] When entering an email or phone number in the new customer form, the system checks for duplicates in real-time (debounced).
- [x] If a match is found, a warning is displayed with a link to the existing profile.
- [x] User can choose to proceed with creation despite the warning.

- **Story Points**: 3
- **Priority**: P2
- **Dependencies**: E1-2

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript
*   **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime Subscriptions)
*   **State Management**: Zustand (for global UI state) & TanStack Query (for server state, caching, and mutations)
*   **Styling**: Tailwind CSS
*   **Testing**: Jest & React Testing Library

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need a Supabase project. If you don't have one, create a new project at [database.new](https://database.new).

### 1. Set Up the Database

1.  Navigate to the **SQL Editor** in your Supabase project dashboard.
2.  Open the `schema.md` file in this repository.
3.  Copy the entire SQL script provided inside the grey code block.
4.  Paste the script into the Supabase SQL Editor and click **RUN**. This will create all the necessary tables, relationships, and Row Level Security (RLS) policies.

### 2. Configure Environment Variables

1.  In the `lib/supabaseClient.ts` file, you need to replace the placeholder credentials with your actual Supabase project credentials.
2.  Find your Project URL and `anon` public key in your Supabase project's **API Settings** (under `Project Settings` > `API`).
3.  Update the following variables in `lib/supabaseClient.ts`:

    ```typescript
    // lib/supabaseClient.ts

    // Replace with your Supabase project's URL and Anon Key
    const supabaseUrl = 'https://your-project-ref.supabase.co';
    const supabaseAnonKey = 'your-supabase-anon-key';
    ```

### 3. Create User Accounts

1.  Navigate to the **Authentication** section in your Supabase dashboard.
2.  Create at least one user account (e.g., `admin@tinedy.com`).
3.  After creating the user in Supabase Auth, you need to link it to a staff profile in the database to assign a role. Go to the **Table Editor**, select the `staff` table, and insert a new row.
4.  Fill in the staff details (name, email, etc.) and, most importantly, copy the `id` of the user you created in Auth and paste it into the `user_id` column for this new staff row. Set the `role` column to `admin`.

## 🖥️ Usage

Once the application is running, you can log in with the user you created in the setup step. The login page is pre-filled with `admin@tinedy.com` for convenience.

*   **Admin Email**: `admin@tinedy.com` (or the email you created)
*   **Password**: The password you set for the user.

The application uses Zustand's `persist` middleware to store some data (like notifications and audit logs in browser mode) in `localStorage`. This data can be cleared via your browser's developer tools if needed.

## 📁 Project Structure

The codebase is organized to be clean, scalable, and maintainable.

```
/
├── __tests__/             # Jest test files
├── components/            # Reusable React components (UI, layout, etc.)
│   ├── auth/
│   ├── booking/
│   └── ...
├── dal/                   # Data Access Layer (functions interacting with Supabase)
├── hooks/                 # Custom React hooks for business logic and data fetching
├── lib/                   # Third-party client initializations (Supabase)
├── store/                 # Zustand stores for global state
├── views/                 # Top-level page components for each feature
├── App.tsx                # Main application component with auth logic
├── index.html             # Main HTML file
├── index.tsx              # Application entry point
└── types.ts               # Global TypeScript type definitions
```