// FIX: Add missing Booking type import.
import { Service, BookingStatus, StaffMember, Package, Customer, NotificationPreferences, CustomerRelationship, Booking } from './types';

// Helper function to get a date relative to today using local timezone
const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const getRelativeDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toYYYYMMDD(date);
};

// Helper function to get a full ISO string relative to today for createdAt timestamps
const getRelativeISOString = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    // Add some random hours/minutes to make it look more realistic
    date.setHours(date.getHours() - Math.floor(Math.random() * 10));
    date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 60));
    return date.toISOString();
};

export const SERVICES = [
  { value: Service.Training, label: 'Personal Training Session' },
  { value: Service.Cleaning, label: 'Deep Cleaning Service' },
];

export const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; dotColor: string }> = {
  [BookingStatus.Pending]: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800',
    dotColor: 'bg-amber-500',
  },
  [BookingStatus.Confirmed]: {
    label: 'Confirmed',
    color: 'bg-tinedy-green/20 text-tinedy-green',
    dotColor: 'bg-tinedy-green',
  },
  [BookingStatus.InProgress]: {
    label: 'In Progress',
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    dotColor: 'bg-sky-500',
  },
  [BookingStatus.Completed]: {
    label: 'Completed',
    color: 'bg-tinedy-blue/20 text-tinedy-dark dark:bg-tinedy-blue/30 dark:text-slate-100',
    dotColor: 'bg-tinedy-blue',
  },
  [BookingStatus.Cancelled]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
  },
};

export const RELATIONSHIP_CONFIG: Record<CustomerRelationship, { label: string; color: string; }> = {
  [CustomerRelationship.New]: { label: 'New', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  [CustomerRelationship.Regular]: { label: 'Regular', color: 'bg-tinedy-green/20 text-tinedy-green' },
  [CustomerRelationship.VIP]: { label: 'VIP', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
};

// Centralized default notification preferences.
// "assignedToMeOnly" is now true by default for status changes.
export const defaultNotificationPreferences: NotificationPreferences = {
    'NEW_BOOKING': true,
    'ASSIGNMENT': true,
    'STATUS_CHANGE': { enabled: true, assignedToMeOnly: true },
    'CANCELLATION': true,
    'MENTION': true,
};

export const MAX_DAILY_JOBS = 4;

export const INITIAL_STAFF: StaffMember[] = [
    // FIX: Add missing 'skills' and 'rating' properties to satisfy the StaffMember type.
    { id: 's1', name: 'John Doe', email: 'john.d@example.com', phone: '555-0101', role: 'Lead Trainer', notificationPreferences: defaultNotificationPreferences, skills: ['Cardio', 'Strength Training'], rating: 4.8, staffNumber: 'ST-101' },
    { id: 's2', name: 'Jane Smith', email: 'jane.s@example.com', phone: '555-0102', role: 'Senior Cleaner', notificationPreferences: defaultNotificationPreferences, skills: ['Deep Cleaning', 'Eco-friendly Products'], rating: 4.9, staffNumber: 'ST-102' },
    { id: 's3', name: 'Carol White', email: 'carol.w@example.com', phone: '555-0103', role: 'Trainer', notificationPreferences: defaultNotificationPreferences, skills: ['Yoga', 'Pilates'], rating: 4.6, staffNumber: 'ST-103' },
    { id: 's4', name: 'David Green', email: 'david.g@example.com', phone: '555-0104', role: 'Cleaning Specialist', notificationPreferences: defaultNotificationPreferences, skills: ['Window Cleaning'], rating: 4.7, staffNumber: 'ST-104' },
    { id: 's5', name: 'Eva Brown', email: 'eva.b@example.com', phone: '555-0105', role: 'Junior Trainer', notificationPreferences: defaultNotificationPreferences, skills: ['CrossFit'], rating: 4.5, staffNumber: 'ST-105' },
];

export const INITIAL_PACKAGES: Package[] = [
    // FIX: Add missing 'createdAt' property to satisfy the Package type.
    { id: 'p1', createdAt: getRelativeISOString(-30), name: 'Starter Training Pack', description: '5 introductory personal training sessions.', price: 250, duration: 60, services: [Service.Training] },
    { id: 'p2', createdAt: getRelativeISOString(-28), name: 'Full Home Deep Clean', description: 'A comprehensive deep clean for a standard 3-bedroom home.', price: 400, duration: 240, services: [Service.Cleaning] },
    { id: 'p3', createdAt: getRelativeISOString(-25), name: 'Monthly Wellness Subscription', description: '4 training sessions and 1 deep clean per month.', price: 550, duration: 90, services: [Service.Training, Service.Cleaning] },
    { id: 'p4', createdAt: getRelativeISOString(-22), name: 'Weekend Warrior', description: '2 intense training sessions over the weekend.', price: 120, duration: 90, services: [Service.Training] },
    { id: 'p5', createdAt: getRelativeISOString(-20), name: 'Ultimate Relaxation', description: 'Deep clean plus organizational services.', price: 600, duration: 300, services: [Service.Cleaning] },
];

export const INITIAL_CUSTOMERS: Customer[] = [
    // FIX: Add missing 'notes' property to satisfy the Customer type.
    { id: 'c1', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '555-0201', createdAt: getRelativeISOString(-20), relationship: CustomerRelationship.Regular, notes: 'Loves the morning sessions.' },
    { id: 'c2', name: 'Bob Williams', email: 'bob.w@example.com', phone: '555-0202', createdAt: getRelativeISOString(-15), relationship: CustomerRelationship.VIP, notes: 'Prefers eco-friendly cleaning products.' },
    { id: 'c3', name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '555-0203', createdAt: getRelativeISOString(-10), relationship: CustomerRelationship.New, notes: null },
    { id: 'c4', name: 'Diana Miller', email: 'diana.m@example.com', phone: '555-0204', createdAt: getRelativeISOString(-5), relationship: CustomerRelationship.Regular, notes: null },
];


export const INITIAL_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        bookingNumber: 'BK-1001',
        customerId: 'c1',
        customer: INITIAL_CUSTOMERS[0],
        packageId: 'p1',
        bookingDate: getRelativeDate(-10),
        bookingTime: '10:00',
        // FIX: Add missing 'address' property.
        address: '123 Wellness Ave, Health City, 10110',
        status: BookingStatus.Completed,
        notes: 'Client wants to focus on cardio.',
        assignedStaffId: 's1',
        createdAt: getRelativeISOString(-11),
        reminderSent: true,
        rating: 4.5,
    },
    {
        id: 'b2',
        bookingNumber: 'BK-1002',
        customerId: 'c2',
        customer: INITIAL_CUSTOMERS[1],
        packageId: 'p2',
        bookingDate: getRelativeDate(2),
        bookingTime: '09:00',
        // FIX: Add missing 'address' property.
        address: '456 Clean St, Sparkle Town, 20220',
        status: BookingStatus.Confirmed,
        notes: 'Allergic to bleach, please use alternative products.',
        assignedStaffId: 's2',
        createdAt: getRelativeISOString(-2),
        reminderSent: false,
        rating: null,
    },
    {
        id: 'b3',
        bookingNumber: 'BK-1003',
        customerId: 'c3',
        customer: INITIAL_CUSTOMERS[2],
        packageId: 'p3',
        bookingDate: getRelativeDate(5),
        bookingTime: '14:00',
        // FIX: Add missing 'address' property.
        address: '789 Subscription Rd, Newville, 30330',
        status: BookingStatus.Pending,
        notes: 'First session of the monthly subscription.',
        assignedStaffId: null,
        createdAt: getRelativeISOString(-1),
        reminderSent: false,
        rating: null,
    },
    {
        id: 'b4',
        bookingNumber: 'BK-1004',
        customerId: 'c4',
        customer: INITIAL_CUSTOMERS[3],
        packageId: 'p4',
        bookingDate: getRelativeDate(-5),
        bookingTime: '11:00',
        // FIX: Add missing 'address' property.
        address: '101 Fitness Blvd, Workout City, 40440',
        status: BookingStatus.Cancelled,
        assignedStaffId: 's3',
        createdAt: getRelativeISOString(-6),
        reminderSent: false,
        rating: null,
    },
    {
        id: 'b5',
        bookingNumber: 'BK-1005',
        customerId: 'c1',
        customer: INITIAL_CUSTOMERS[0],
        packageId: 'p5',
        bookingDate: getRelativeDate(12),
        bookingTime: '13:00',
        // FIX: Add missing 'address' property.
        address: '123 Wellness Ave, Health City, 10110',
        status: BookingStatus.Confirmed,
        assignedStaffId: 's4',
        createdAt: getRelativeISOString(0),
        reminderSent: false,
        rating: null,
    },
    {
        id: 'b6',
        bookingNumber: 'BK-1006',
        customerId: 'c2',
        customer: INITIAL_CUSTOMERS[1],
        packageId: 'p1',
        bookingDate: getRelativeDate(1), // Set to tomorrow to test reminder
        bookingTime: '15:00',
        // FIX: Add missing 'address' property.
        address: '456 Clean St, Sparkle Town, 20220',
        status: BookingStatus.Confirmed,
        notes: 'Follow-up training session.',
        assignedStaffId: 's5',
        createdAt: getRelativeISOString(0),
        reminderSent: false,
        rating: null,
    },
    {
        id: 'b7',
        bookingNumber: 'BK-1007',
        customerId: 'c4',
        customer: INITIAL_CUSTOMERS[3],
        packageId: 'p2',
        bookingDate: getRelativeDate(3),
        bookingTime: '10:30',
        // FIX: Add missing 'address' property.
        address: '101 Fitness Blvd, Workout City, 40440',
        status: BookingStatus.Pending,
        notes: 'Needs quick confirmation.',
        assignedStaffId: null,
        createdAt: getRelativeISOString(1),
        reminderSent: false,
        rating: null,
    }
];