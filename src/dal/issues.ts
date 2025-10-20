import { supabase } from '../lib/supabaseClient';
import { JobIssue, IssueCategory, IssueSeverity, IssueStatus } from '../types';
import { Database } from '../lib/supabaseClient';

type DbJobIssue = Database['public']['Tables']['job_issues']['Row'];

const toJobIssue = (dbIssue: DbJobIssue): JobIssue => ({
    id: dbIssue.id,
    createdAt: dbIssue.created_at,
    bookingId: dbIssue.booking_id,
    reportedByStaffId: dbIssue.reported_by_staff_id,
    category: dbIssue.category as IssueCategory,
    description: dbIssue.description,
    severity: dbIssue.severity as IssueSeverity,
    status: dbIssue.status as IssueStatus,
    photoUrls: dbIssue.photo_urls,
});

type CreateIssueData = Omit<JobIssue, 'id' | 'createdAt' | 'status'>;

export const createJobIssue = async (issueData: CreateIssueData): Promise<JobIssue> => {
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const newIssuePayload: Database['public']['Tables']['job_issues']['Insert'] = {
        booking_id: issueData.bookingId,
        reported_by_staff_id: issueData.reportedByStaffId,
        category: issueData.category,
        description: issueData.description,
        severity: issueData.severity,
        status: IssueStatus.Open,
        photo_urls: issueData.photoUrls || null,
    };

    const { data, error } = await supabase
        .from('job_issues')
        .insert([newIssuePayload])
        .select()
        .single();
    
    if (error) throw error;

    return toJobIssue(data);
};
