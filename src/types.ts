// Added for Staff Portal - Availability
export enum UnavailabilityReason {
    Personal = 'ธุระส่วนตัว',
    Appointment = 'นัดหมาย',
    Training = 'อบรม',
    Other = 'อื่นๆ',
}

// Added for Staff Portal - Leave Request
export enum LeaveType {
    Annual = 'วันลาพักร้อน',
    Sick = 'วันลาป่วย',
    Personal = 'วันลากิจ',
    Emergency = 'วันลาฉุกเฉิน',
}

export enum LeaveStatus {
    Pending = 'รออนุมัติ',
    Approved = 'อนุมัติ',
    Rejected = 'ไม่อนุมัติ',
}

export interface LeaveRequest {
    id: string;
    createdAt: string;
    staffId: string;
    startDate: string; // ISO date string 'YYYY-MM-DD'
    endDate: string; // ISO date string 'YYYY-MM-DD'
    leaveType: LeaveType;
    reason?: string | null;
    status: LeaveStatus;
    attachmentUrl?: string | null;
}


export interface StaffUnavailability {
    id: string;
    createdAt: string;
    staffId: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    allDay: boolean;
    reason: UnavailabilityReason;
    notes?: string | null;
    recurrenceRule?: string | null;
}

export type Role = 'admin' | 'manager' | 'staff';

// A granular setting for a single notification type
export type NotificationSetting = boolean | {
  enabled: boolean;
  assignedToMeOnly?: boolean; // For context-specific rules like status changes
};

// Updated preferences structure to use the more flexible NotificationSetting
export type NotificationPreferences = {
  NEW_BOOKING: NotificationSetting;
  ASSIGNMENT: NotificationSetting;
  STATUS_CHANGE: NotificationSetting;
  CANCELLATION: NotificationSetting;
  MENTION: NotificationSetting;
};


export interface User {
  id: string;
  email: string;
  role: Role;
  notificationPreferences: NotificationPreferences;
}

export enum Service {
  Training = 'Training',
  Cleaning = 'Cleaning',
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export type Page = 'dashboard' | 'bookings' | 'customers' | 'schedule' | 'staff' | 'packages' | 'audit' | 'reports' | 'profile' | 'workload' | 'settings' | 'teams' | 'chat';

// Renaming the existing toast notification type for clarity
export type ToastType = 'success' | 'error' | 'info';
export interface ToastNotification {
  id: number;
  message: string;
  type: ToastType;
  title: string;
}

// For persistent, user-facing notifications in the header
export type AppNotificationType = 'NEW_BOOKING' | 'ASSIGNMENT' | 'STATUS_CHANGE' | 'CANCELLATION' | 'MENTION' | 'ISSUE_REPORTED';

export interface AppNotification {
  id: string;
  createdAt: string; // ISO string
  message: string;
  isRead: boolean;
  type: AppNotificationType;
  // Optional: For linking to a specific page or entity
  targetPage?: Page;
  targetId?: string; // e.g., the booking ID
}

export enum CustomerRelationship {
  New = 'New',
  Regular = 'Regular',
  VIP = 'VIP',
}

// Added for tagging feature
export interface Tag {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  // FIX: Made phone nullable to match database schema and fix type errors.
  phone: string | null;
  // Added for dashboard metrics
  createdAt: string;
  relationship: CustomerRelationship;
  notes: string | null;
  preferredStaffId?: string | null;
  lineId?: string | null;
  preferredContactMethod?: 'Email' | 'Phone' | 'Line' | null;
  tags?: Tag[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer: Customer;
  packageId: string;
  bookingDate: string;
  bookingTime: string;
  address: string; // Added address field
  status: BookingStatus;
  notes?: string;
  assignedStaffId?: string | null;
  assignedTeamId?: string | null; // Added for Team Management
  // Added for dashboard metrics
  createdAt?: string; 
  // Added to track SMS reminder status
  reminderSent: boolean;
  rating: number | null;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  staffNumber: string;
  // FIX: Made phone nullable to match database schema and fix type errors.
  phone: string | null;
  role: string;
  notificationPreferences: NotificationPreferences;
  skills: string[] | null;
  rating: number | null;
}

export interface Package {
  id:string;
  createdAt: string;
  name: string;
  // FIX: Made description nullable to allow for optional descriptions.
  description: string | null;
  price: number;
  duration: number; // Duration in minutes
  services: Service[];
}

// Added for Team Management feature
export type TeamStatus = 'Active' | 'Inactive';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  leadMemberId: string | null;
  status: TeamStatus;
  members: StaffMember[];
}


// Added for Audit Trail feature
export type AuditAction = 
  'CREATE_BOOKING' | 'UPDATE_BOOKING' | 'UPDATE_STATUS' | 'DELETE_BOOKING' | 'ASSIGN_STAFF' | 'OVERRIDE_ASSIGNMENT' | 'SEND_REMINDER' |
  'CREATE_CUSTOMER' | 'UPDATE_CUSTOMER' | 'DELETE_CUSTOMER' |
  'CREATE_STAFF' | 'UPDATE_STAFF' | 'DELETE_STAFF' |
  'CREATE_PACKAGE' | 'UPDATE_PACKAGE' | 'DELETE_PACKAGE' | 'USER_LOGIN' |
  'POST_COMMENT' | 'DELETE_COMMENT';

export interface AuditLog {
  id: string;
  createdAt: string;
  userEmail: string;
  action: AuditAction;
  details: string; // Human-readable summary
  bookingId?: string;
}

// Added for Reporting feature
export interface RevenueReportData {
  period: string;
  revenue: number;
  bookings: number;
}

export interface StaffPerformanceReportData {
  staffId: string;
  staffName: string;
  completedBookings: number;
}

export interface PopularPackageReportData {
  packageId: string;
  packageName: string;
  bookingCount: number;
  percentage: string;
}

// Added for internal communication feature
export interface BookingComment {
  id: string;
  createdAt: string;
  bookingId: string;
  authorId: string;
  authorName: string;
  content: string;
}

// Added for Team Performance feature
export interface TeamPerformanceData {
  teamId: string;
  teamName: string;
  completedJobs: number;
  totalRevenue: number;
  totalHours: number;
  averageRating: number;
}

// Added for Workload feature
export interface StaffWorkload {
  staffMember: StaffMember;
  totalJobs: number;
  totalHours: number;
  utilization: number; // Percentage
  workDays: number;
}

export interface TeamWorkload {
    team: Team;
    totalJobs: number;
    totalHours: number;
    avgUtilization: number;
}

// Added for Staff Portal - Job Issues
export enum IssueCategory {
    AccessProblem = 'ปัญหาการเข้าพื้นที่',
    EquipmentIssue = 'อุปกรณ์ขัดข้อง',
    SafetyConcern = 'ปัญหาด้านความปลอดภัย',
    CustomerIssue = 'ปัญหาเกี่ยวกับลูกค้า',
    Other = 'อื่นๆ',
}

export enum IssueSeverity {
    Low = 'ต่ำ',
    Medium = 'ปานกลาง',
    High = 'สูง',
    Emergency = 'ฉุกเฉิน',
}

export enum IssueStatus {
    Open = 'Open',
    Resolved = 'Resolved',
}

export interface JobIssue {
    id: string;
    createdAt: string;
    bookingId: string;
    reportedByStaffId: string;
    category: IssueCategory;
    description: string;
    severity: IssueSeverity;
    status: IssueStatus;
    photoUrls?: string[] | null;
}

// Added for Staff Portal - Chat
export interface StaffMessage {
  id: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
}

// Added for Admin Chat
export interface ConversationSummary {
  staffMember: StaffMember;
  lastMessage: StaffMessage;
  unreadCount: number;
}
