
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BookingStatus, Service } from '../types';

// Get Supabase credentials from environment variables
// For local development, create a .env file with these values
// For production (Vercel), set these in the Vercel dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ravdqtsfstfzqaghvgzq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdmRxdHNmc3RmenFhZ2h2Z3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzgzMTEsImV4cCI6MjA3NTc1NDMxMX0.l_-VJb-qd34j7vxGhgs6szGNI6nlgxAPCWyMxUzPTJ0';

// FIX: Changed interface to type and added Relationships to fix Supabase type inference.
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          relationship: string | null;
          notes: string | null;
          preferred_staff_id: string | null;
          line_id: string | null;
          preferred_contact_method: string | null;
        };
        Insert: {
          name: string;
          email: string;
          // FIX: Made phone optional on insert to match schema.
          phone?: string | null;
          relationship?: string | null;
          notes?: string | null;
          preferred_staff_id?: string | null;
          line_id?: string | null;
          preferred_contact_method?: string | null;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          relationship?: string | null;
          notes?: string | null;
          preferred_staff_id?: string | null;
          line_id?: string | null;
          preferred_contact_method?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_preferred_staff_id_fkey",
            columns: ["preferred_staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          package_id: string;
          booking_date: string;
          booking_time: string;
          address: string; // Added address
          status: BookingStatus;
          notes: string | null;
          assigned_staff_id: string | null;
          assigned_team_id: string | null; // Added for Team Management
          reminder_sent: boolean;
          booking_number: string;
          rating: number | null;
        };
        Insert: {
          customer_id: string;
          package_id: string;
          booking_date: string;
          booking_time: string;
          address: string; // Added address
          status: BookingStatus;
          notes?: string | null;
          assigned_staff_id?: string | null;
          assigned_team_id?: string | null; // Added for Team Management
          reminder_sent?: boolean;
          booking_number?: string;
          rating?: number | null;
        };
        Update: {
          customer_id?: string;
          package_id?: string;
          booking_date?: string;
          booking_time?: string;
          address?: string; // Added address
          status?: BookingStatus;
          notes?: string | null;
          assigned_staff_id?: string | null;
          assigned_team_id?: string | null; // Added for Team Management
          reminder_sent?: boolean;
          rating?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey",
            columns: ["customer_id"],
            referencedRelation: "customers",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "bookings_package_id_fkey",
            columns: ["package_id"],
            referencedRelation: "packages",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "bookings_assigned_staff_id_fkey",
            columns: ["assigned_staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "bookings_assigned_team_id_fkey",
            columns: ["assigned_team_id"],
            referencedRelation: "teams",
            referencedColumns: ["id"],
          }
        ];
      };
      staff: {
        Row: {
            id: string;
            created_at: string;
            name: string;
            email: string;
            phone: string | null;
            role: string;
            user_id: string | null;
            notification_preferences: any; // Using `any` for JSONB is often simplest
            skills: string[] | null;
            rating: number | null;
            staff_number: string;
        };
        Insert: {
            name: string;
            email: string;
            // FIX: Made phone optional on insert to match schema.
            phone?: string | null;
            role: string;
            user_id?: string | null;
            notification_preferences?: any;
            skills?: string[] | null;
            rating?: number | null;
            staff_number?: string;
        };
        Update: {
            name?: string;
            email?: string;
            phone?: string | null;
            role?: string;
            user_id?: string | null;
            notification_preferences?: any;
            skills?: string[] | null;
            rating?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_user_id_fkey",
            columns: ["user_id"],
            referencedRelation: "users",
            referencedColumns: ["id"],
          }
        ];
      };
      packages: {
         Row: {
            id: string;
            created_at: string;
            name: string;
            description: string | null;
            price: number;
            duration: number;
            services: Service[];
         };
         Insert: {
            name: string;
            // FIX: Made description optional and nullable on insert.
            description?: string | null;
            price: number;
            duration: number;
            services: Service[];
         };
         Update: {
            name?: string;
            description?: string | null;
            price?: number;
            duration?: number;
            services?: Service[];
         };
         Relationships: [];
      };
      booking_comments: {
        Row: {
            id: string;
            created_at: string;
            booking_id: string;
            author_id: string;
            author_name: string;
            content: string;
        };
        Insert: {
            booking_id: string;
            author_id: string;
            author_name: string;
            content: string;
        };
        Update: {
            content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_comments_booking_id_fkey",
            columns: ["booking_id"],
            referencedRelation: "bookings",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "booking_comments_author_id_fkey",
            columns: ["author_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          created_at: string;
          user_email: string;
          action: string;
          details: string | null;
          // FIX: Add missing booking_id to align with database schema and application logic.
          booking_id: string | null;
        };
        Insert: {
          user_email: string;
          action: string;
          details?: string | null;
          // FIX: Add missing booking_id to align with database schema and application logic.
          booking_id?: string | null;
        };
        Update: {
            // No updates allowed
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          created_at: string;
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      customer_tags: {
        Row: {
          customer_id: string;
          tag_id: string;
        };
        Insert: {
          customer_id: string;
          tag_id: string;
        };
        Update: {}; // No updates, just insert/delete
        Relationships: [
          {
            foreignKeyName: "customer_tags_customer_id_fkey",
            columns: ["customer_id"],
            referencedRelation: "customers",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "customer_tags_tag_id_fkey",
            columns: ["tag_id"],
            referencedRelation: "tags",
            referencedColumns: ["id"],
          }
        ];
      };
      teams: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          lead_member_id: string | null;
          status: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          lead_member_id?: string | null;
          status?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          lead_member_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_lead_member_id_fkey",
            columns: ["lead_member_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      team_members: {
        Row: {
          team_id: string;
          staff_id: string;
        };
        Insert: {
          team_id: string;
          staff_id: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey",
            columns: ["team_id"],
            referencedRelation: "teams",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "team_members_staff_id_fkey",
            columns: ["staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      job_issues: {
        Row: {
          id: string;
          created_at: string;
          booking_id: string;
          reported_by_staff_id: string;
          category: string;
          description: string;
          severity: string;
          status: string;
          photo_urls: string[] | null;
        };
        Insert: {
          booking_id: string;
          reported_by_staff_id: string;
          category: string;
          description: string;
          severity: string;
          status?: string;
          photo_urls?: string[] | null;
        };
        Update: {
          status?: string;
          description?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_issues_booking_id_fkey",
            columns: ["booking_id"],
            referencedRelation: "bookings",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "job_issues_reported_by_staff_id_fkey",
            columns: ["reported_by_staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      staff_unavailability: {
        Row: {
          id: string;
          created_at: string;
          staff_id: string;
          start_time: string;
          end_time: string;
          all_day: boolean;
          reason: string;
          notes: string | null;
          recurrence_rule: string | null;
        };
        Insert: {
          staff_id: string;
          start_time: string;
          end_time: string;
          all_day?: boolean;
          reason: string;
          notes?: string | null;
          recurrence_rule?: string | null;
        };
        Update: {
          start_time?: string;
          end_time?: string;
          all_day?: boolean;
          reason?: string;
          notes?: string | null;
          recurrence_rule?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_unavailability_staff_id_fkey",
            columns: ["staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      leave_requests: {
        Row: {
          id: string;
          created_at: string;
          staff_id: string;
          start_date: string;
          end_date: string;
          leave_type: string;
          reason: string | null;
          status: string;
          attachment_url: string | null;
        };
        Insert: {
          staff_id: string;
          start_date: string;
          end_date: string;
          leave_type: string;
          reason?: string | null;
          status?: string;
          attachment_url?: string | null;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          leave_type?: string;
          reason?: string | null;
          status?: string;
          attachment_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leave_requests_staff_id_fkey",
            columns: ["staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      staff_messages: {
        Row: {
          id: string;
          created_at: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read: boolean;
        };
        Insert: {
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read?: boolean;
        };
        Update: {
          content?: string;
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "staff_messages_sender_id_fkey",
            columns: ["sender_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "staff_messages_recipient_id_fkey",
            columns: ["recipient_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
      // FIX: Add missing 'push_subscriptions' table definition to the Database type.
      push_subscriptions: {
        Row: {
          staff_id: string;
          subscription: any;
        };
        Insert: {
          staff_id: string;
          subscription: any;
        };
        Update: {
          subscription?: any;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_staff_id_fkey",
            columns: ["staff_id"],
            referencedRelation: "staff",
            referencedColumns: ["id"],
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Initialize Supabase client, capturing any potential errors.
let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseInitializationError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseInitializationError = 'Supabase credentials are not configured. The application cannot connect to the database.';
  console.error(`-- TINEDY CRM CONFIGURATION ERROR --\n${supabaseInitializationError}\nPlease set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.`);
} else {
  try {
    // FIX: Explicitly pass a custom fetch implementation and global headers. This resolves 'Failed to fetch'
    // errors in some sandboxed environments where the Supabase client might lose context
    // and fail to attach necessary headers (like apikey or Authorization) to requests.
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: { 
            headers: { apikey: supabaseAnonKey },
            fetch: (input, init) => fetch(input, init),
        }
    });
  } catch (e: any) {
    supabaseInitializationError = `Failed to initialize Supabase client: ${e.message}`;
    console.error(supabaseInitializationError);
  }
}

export const supabase = supabaseInstance;
export const supabaseInitError = supabaseInitializationError;