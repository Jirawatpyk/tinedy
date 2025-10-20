### ⚠️ Important: How to Use This File

Do **NOT** copy the entire content of this file.

Only copy the SQL code that is inside the grey box below and paste it into the Supabase SQL Editor. This script is safe to run multiple times.

---

### Tinedy Solutions - Database Schema Script

This script will set up all the necessary tables, types, relationships, and security policies for the CRM application.

```sql
-- =================================================================
-- Tinedy Solutions - Complete Database Setup Script
-- Version: 4.9
-- Description: Adds RLS policy for staff to update their assigned bookings.
-- =================================================================

-- 1. Create custom enum types for statuses and services
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE public.service_type AS ENUM ('Training', 'Cleaning');
    END IF;
END$$;

-- Add 'InProgress' status to the booking_status enum if it doesn't exist.
-- This needs to be run in a separate transaction from the creation.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'InProgress' AND enumtypid = 'public.booking_status'::regtype) THEN
        ALTER TYPE public.booking_status ADD VALUE 'InProgress' AFTER 'Confirmed';
    END IF;
END $$;


-- 2. Create the 'customers' table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT
);

-- Add 'relationship' column to 'customers' if it's missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'customers'
        AND column_name = 'relationship'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN relationship TEXT;
    END IF;
END$$;

-- Add 'notes' column for customer-specific notes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'customers'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN notes TEXT;
    END IF;
END$$;

-- Add 'preferred_staff_id' column for customer preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'customers'
        AND column_name = 'preferred_staff_id'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN preferred_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add 'line_id' for customer contact info
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'customers'
        AND column_name = 'line_id'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN line_id TEXT;
    END IF;
END$$;

-- Add 'preferred_contact_method' for customer contact info
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'customers'
        AND column_name = 'preferred_contact_method'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN preferred_contact_method TEXT;
    END IF;
END$$;


-- 3. Create the 'staff' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL
);

-- Create a sequence for staff numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.staff_number_seq
    START WITH 101
    INCREMENT BY 1;

-- Add 'staff_number' column to 'staff' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff'
        AND column_name = 'staff_number'
    ) THEN
        ALTER TABLE public.staff
        ADD COLUMN staff_number TEXT NOT NULL UNIQUE DEFAULT ('ST-' || nextval('public.staff_number_seq'));
    END IF;
END$$;

-- Add 'user_id' column to 'staff' if it's missing, making the script safe for existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.staff
        ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add notification preferences column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff'
        AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.staff
        ADD COLUMN notification_preferences JSONB NOT NULL DEFAULT
        '{
          "NEW_BOOKING": true,
          "ASSIGNMENT": true,
          "STATUS_CHANGE": true,
          "CANCELLATION": true
        }';
    END IF;
END$$;

-- Add skills column for staff assignment optimization
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff'
        AND column_name = 'skills'
    ) THEN
        ALTER TABLE public.staff
        ADD COLUMN skills TEXT[];
    END IF;
END$$;

-- Add rating column for staff assignment optimization
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff'
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE public.staff
        ADD COLUMN rating NUMERIC(3, 2) CHECK (rating >= 0 AND rating <= 5);
    END IF;
END$$;


-- Add an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);


-- 4. Create the 'packages' table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- Duration in minutes
  services public.service_type[] NOT NULL
);

-- 5. Create the 'bookings' table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'Pending',
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add 'address' column for the service location
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'address'
    ) THEN
        -- Add the column as nullable first to avoid errors on existing tables with data
        ALTER TABLE public.bookings
        ADD COLUMN address TEXT;
        
        -- Then, if you need it to be NOT NULL, you would first populate existing rows:
        -- UPDATE public.bookings SET address = 'Default Address' WHERE address IS NULL;
        
        -- And finally, alter the column to be NOT NULL.
        -- For this script, we'll assume new bookings will have it and leave it nullable
        -- to prevent breaking changes on existing deployments. The app logic will enforce it.
    END IF;
END$$;

-- Add 'assigned_team_id' column for Team Management (E7)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'assigned_team_id'
    ) THEN
        ALTER TABLE public.bookings
        ADD COLUMN assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Create a sequence for booking numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.booking_number_seq
    START WITH 1001
    INCREMENT BY 1;

-- Add 'booking_number' column to 'bookings' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'booking_number'
    ) THEN
        ALTER TABLE public.bookings
        ADD COLUMN booking_number TEXT NOT NULL UNIQUE DEFAULT ('BK-' || nextval('public.booking_number_seq'));
    END IF;
END$$;

-- Add 'rating' column for bookings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE public.bookings
        ADD COLUMN rating NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5);
    END IF;
END$$;


-- 6. Create the 'booking_comments' table
CREATE TABLE IF NOT EXISTS public.booking_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL, -- Denormalized for easier display
  content TEXT NOT NULL
);

-- Index for faster comment lookups
CREATE INDEX IF NOT EXISTS idx_booking_comments_booking_id ON public.booking_comments(booking_id);

-- 7. Create the 'audit_logs' table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT
);

-- Add booking_id column to link logs to bookings for the activity feed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'audit_logs'
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE public.audit_logs
        ADD COLUMN booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
    END IF;
END$$;


-- Index for faster log lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_booking_id ON public.audit_logs(booking_id);

-- 8. Create 'tags' and 'customer_tags' tables for E5-3
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL UNIQUE
);
-- Add an index for faster tag name lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

CREATE TABLE IF NOT EXISTS public.customer_tags (
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (customer_id, tag_id)
);

-- 9. Create 'teams' and 'team_members' tables for E7
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    lead_member_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Active' -- 'Active' or 'Inactive'
);

CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, staff_id)
);

-- 10. Create 'job_issues' table for E9-5
CREATE TABLE IF NOT EXISTS public.job_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reported_by_staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open', -- 'Open' or 'Resolved'
  photo_urls TEXT[]
);

-- Add indexes for job_issues
CREATE INDEX IF NOT EXISTS idx_job_issues_booking_id ON public.job_issues(booking_id);
CREATE INDEX IF NOT EXISTS idx_job_issues_status ON public.job_issues(status);

-- 11. Create 'staff_unavailability' table for E9-6
CREATE TABLE IF NOT EXISTS public.staff_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT NOT NULL,
  notes TEXT
);

-- Add 'recurrence_rule' column for recurring events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'staff_unavailability'
        AND column_name = 'recurrence_rule'
    ) THEN
        ALTER TABLE public.staff_unavailability
        ADD COLUMN recurrence_rule TEXT;
    END IF;
END$$;


-- Add indexes for staff_unavailability
CREATE INDEX IF NOT EXISTS idx_staff_unavailability_staff_id ON public.staff_unavailability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_unavailability_start_time ON public.staff_unavailability(start_time);

-- 12. Create 'leave_requests' table for E9-7
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'รออนุมัติ', -- 'รออนุมัติ', 'อนุมัติ', 'ไม่อนุมัติ'
  attachment_url TEXT
);

-- Add indexes for leave_requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff_id ON public.leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);

-- 13. Create 'staff_messages' table for E9-9
CREATE TABLE IF NOT EXISTS public.staff_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sender_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add indexes for staff_messages
CREATE INDEX IF NOT EXISTS idx_staff_messages_sender_id ON public.staff_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_recipient_id ON public.staff_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_conversation ON public.staff_messages(sender_id, recipient_id);


-- =================================================================
-- RLS (Row Level Security) Policies
-- =================================================================

-- Helper function to get a user's role from the 'staff' table
-- SECURITY DEFINER allows this function to bypass RLS policies of the calling user.
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.staff
    WHERE public.staff.user_id = $1
  );
END;
$$;

-- Helper function to securely get the current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;


-- --- Customers Table Policies ---
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view customers" ON public.customers;
DROP POLICY IF EXISTS "Allow admin/manager to manage customers" ON public.customers;

-- SELECT: Any authenticated user can read customer data.
CREATE POLICY "Allow authenticated users to view customers"
  ON public.customers FOR SELECT
  USING (auth.role() = 'authenticated');

-- MANAGE (INSERT, UPDATE, DELETE): Only admins/managers can manage customers.
CREATE POLICY "Allow admin/manager to manage customers"
  ON public.customers FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));


-- --- Staff Table Policies ---
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view staff" ON public.staff;
DROP POLICY IF EXISTS "Allow admin/manager to create staff" ON public.staff;
DROP POLICY IF EXISTS "Allow admin/manager to delete staff" ON public.staff;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.staff;

-- SELECT: Any authenticated user can see staff profiles.
CREATE POLICY "Allow authenticated users to view staff"
  ON public.staff FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Only admin/manager can create staff.
CREATE POLICY "Allow admin/manager to create staff"
  ON public.staff FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- DELETE: Only admin/manager can delete staff.
CREATE POLICY "Allow admin/manager to delete staff"
  ON public.staff FOR DELETE
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- UPDATE: A user can update their own profile, OR an admin/manager can update any profile.
CREATE POLICY "Allow users to update their own profile"
  ON public.staff FOR UPDATE
  USING (
    user_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('admin', 'manager')
  )
  WITH CHECK (
    user_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );


-- --- Packages Table Policies ---
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view packages" ON public.packages;
DROP POLICY IF EXISTS "Allow admin/manager to manage packages" ON public.packages;

-- SELECT: Any authenticated user can read package data.
CREATE POLICY "Allow authenticated users to view packages"
  ON public.packages FOR SELECT
  USING (auth.role() = 'authenticated');

-- MANAGE (INSERT, UPDATE, DELETE): Only admins/managers can manage packages.
CREATE POLICY "Allow admin/manager to manage packages"
  ON public.packages FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));


-- --- Bookings Table Policies ---
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admin/manager to manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow staff to update their assigned bookings" ON public.bookings;

-- SELECT: Any authenticated user can read booking data.
CREATE POLICY "Allow authenticated users to view bookings"
  ON public.bookings FOR SELECT
  USING (auth.role() = 'authenticated');

-- MANAGE (INSERT, UPDATE, DELETE): Only admins/managers can manage bookings.
CREATE POLICY "Allow admin/manager to manage bookings"
  ON public.bookings FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- UPDATE for Staff: Allow staff to update bookings assigned to them or their team.
CREATE POLICY "Allow staff to update their assigned bookings"
  ON public.bookings FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'staff' AND
    (
      -- Directly assigned to the staff member
      assigned_staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid())
      OR
      -- Assigned to a team the staff member is in
      assigned_team_id IN (
        SELECT team_id FROM public.team_members WHERE staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'staff' AND
    (
      -- They can't change the assignment away from themselves, so check is the same
      assigned_staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid())
      OR
      assigned_team_id IN (
        SELECT team_id FROM public.team_members WHERE staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid())
      )
    )
  );
  
  
-- --- Booking Comments Table Policies ---
ALTER TABLE public.booking_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view comments" ON public.booking_comments;
DROP POLICY IF EXISTS "Allow users to insert their own comments" ON public.booking_comments;
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.booking_comments;

-- SELECT: Any authenticated user can view comments.
CREATE POLICY "Allow authenticated users to view comments"
  ON public.booking_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Users can only insert comments as themselves.
CREATE POLICY "Allow users to insert their own comments"
  ON public.booking_comments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    author_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  );
  
-- DELETE: Users can delete their own comments, or admins/managers can delete any comment.
CREATE POLICY "Allow users to delete their own comments"
  ON public.booking_comments FOR DELETE
  USING (
    author_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1) OR
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- --- Audit Logs Table Policies ---
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin/manager to view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Restrict modification of audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Restrict deletion of audit logs" ON public.audit_logs;

-- SELECT: Only admin/manager can view audit logs.
CREATE POLICY "Allow admin/manager to view audit logs"
  ON public.audit_logs FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- INSERT: Any authenticated user can create a log entry. This is more secure now.
CREATE POLICY "Allow authenticated users to insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    lower(user_email) = lower(public.get_current_user_email())
  );
  
-- UPDATE/DELETE: Nobody can modify logs to ensure integrity.
CREATE POLICY "Restrict modification of audit logs"
  ON public.audit_logs FOR UPDATE
  USING (FALSE);

CREATE POLICY "Restrict deletion of audit logs"
  ON public.audit_logs FOR DELETE
  USING (FALSE);

-- --- RLS for tags ---
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view tags" ON public.tags;
CREATE POLICY "Allow authenticated users to view tags"
  ON public.tags FOR SELECT
  USING (auth.role() = 'authenticated');
  
DROP POLICY IF EXISTS "Allow admin/manager to manage tags" ON public.tags;
CREATE POLICY "Allow admin/manager to manage tags"
  ON public.tags FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));
  
-- --- RLS for customer_tags ---
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to view customer tag links" ON public.customer_tags;
CREATE POLICY "Allow authenticated users to view customer tag links"
  ON public.customer_tags FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin/manager to manage customer tag links" ON public.customer_tags;
CREATE POLICY "Allow admin/manager to manage customer tag links"
  ON public.customer_tags FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));
  
-- --- RLS for teams and team_members ---
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view teams" ON public.teams;
CREATE POLICY "Allow authenticated users to view teams"
  ON public.teams FOR SELECT
  USING (auth.role() = 'authenticated');
  
DROP POLICY IF EXISTS "Allow admin/manager to manage teams" ON public.teams;
CREATE POLICY "Allow admin/manager to manage teams"
  ON public.teams FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));
  
DROP POLICY IF EXISTS "Allow authenticated users to view team members" ON public.team_members;
CREATE POLICY "Allow authenticated users to view team members"
  ON public.team_members FOR SELECT
  USING (auth.role() = 'authenticated');
  
DROP POLICY IF EXISTS "Allow admin/manager to manage team members" ON public.team_members;
CREATE POLICY "Allow admin/manager to manage team members"
  ON public.team_members FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- --- RLS for job_issues ---
ALTER TABLE public.job_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff to create their own issues" ON public.job_issues;
DROP POLICY IF EXISTS "Allow admin/manager to manage all issues" ON public.job_issues;
DROP POLICY IF EXISTS "Allow relevant staff to view issues" ON public.job_issues;

-- INSERT: Staff can create issues for jobs they are assigned to.
CREATE POLICY "Allow staff to create their own issues"
  ON public.job_issues FOR INSERT
  WITH CHECK (
    reported_by_staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  );
  
-- MANAGE (ALL): Admins and managers can do anything.
CREATE POLICY "Allow admin/manager to manage all issues"
  ON public.job_issues FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'manager'));
  
-- SELECT: Users can see issues they reported, or if they are an admin/manager.
CREATE POLICY "Allow relevant staff to view issues"
  ON public.job_issues FOR SELECT
  USING (
    reported_by_staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1) OR
    get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- --- RLS for staff_unavailability ---
ALTER TABLE public.staff_unavailability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff to manage their own unavailability" ON public.staff_unavailability;
DROP POLICY IF EXISTS "Allow admin/manager to view all unavailability" ON public.staff_unavailability;

-- ALL: Staff can manage their own records.
CREATE POLICY "Allow staff to manage their own unavailability"
  ON public.staff_unavailability FOR ALL
  USING (
    staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  ) WITH CHECK (
    staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  );

-- SELECT for admin/manager
CREATE POLICY "Allow admin/manager to view all unavailability"
  ON public.staff_unavailability FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));

-- --- RLS for leave_requests ---
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff to manage their own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow admin/manager to view all leave requests" ON public.leave_requests;

-- ALL for staff on their own requests
CREATE POLICY "Allow staff to manage their own leave requests"
  ON public.leave_requests FOR ALL
  USING (
    staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  ) WITH CHECK (
    staff_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  );

-- SELECT/UPDATE for admin/manager
CREATE POLICY "Allow admin/manager to view all leave requests"
  ON public.leave_requests FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'manager'));
  
-- --- RLS for staff_messages ---
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow staff to access their own messages" ON public.staff_messages;

CREATE POLICY "Allow staff to access their own messages"
  ON public.staff_messages FOR ALL
  USING (
    sender_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1) OR
    recipient_id = (SELECT id FROM public.staff WHERE user_id = auth.uid() LIMIT 1)
  );
  

-- =================================================================
-- End of Script
-- =================================================================
```