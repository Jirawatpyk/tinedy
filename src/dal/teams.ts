import { supabase } from '../lib/supabaseClient';
import { Team, StaffMember, TeamStatus } from '../types';
import { Database } from '../lib/supabaseClient';
import { defaultNotificationPreferences } from '../constants';

type DbTeam = Database['public']['Tables']['teams']['Row'];
type DbTeamMember = Database['public']['Tables']['team_members']['Row'];
type DbStaff = Database['public']['Tables']['staff']['Row'];

// Helper to map DB staff object to application StaffMember type
const mapDbStaffToStaffMember = (s: DbStaff): StaffMember => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    skills: s.skills,
    rating: s.rating,
    // FIX: Add missing 'staffNumber' to satisfy the StaffMember type.
    staffNumber: s.staff_number,
    notificationPreferences: { ...defaultNotificationPreferences, ...s.notification_preferences },
});


// Mapper from database (snake_case with joined members) to application Team
const toTeam = (dbTeam: DbTeam & { staff: DbStaff[] }): Team => {
    return {
        id: dbTeam.id,
        name: dbTeam.name,
        description: dbTeam.description,
        leadMemberId: dbTeam.lead_member_id,
        status: dbTeam.status as TeamStatus,
        members: dbTeam.staff.map(mapDbStaffToStaffMember),
    };
};

export const getTeams = async (): Promise<Team[]> => {
    if (!supabase) return [];
    
    // This is a more complex query using rpc to get teams and their members correctly
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        staff:team_members!inner(staff(*))
      `);

    if (error) throw error;
    
    // The data structure from this query needs careful mapping
    return data.map(item => {
        const teamData = item as any; // Cast to any to handle the nested structure
        return {
            id: teamData.id,
            name: teamData.name,
            description: teamData.description,
            leadMemberId: teamData.lead_member_id,
            status: teamData.status,
            // FIX: Correctly map nested staff object to the StaffMember type.
            members: teamData.staff.map((m: any) => mapDbStaffToStaffMember(m.staff)),
        }
    });
};

type CreateTeamData = {
    name: string;
    description: string | null;
    leadMemberId: string | null;
    status: TeamStatus;
    memberIds: string[];
};

export const createTeam = async (teamData: CreateTeamData): Promise<Team> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // Step 1: Create the team
    const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
            name: teamData.name,
            description: teamData.description,
            lead_member_id: teamData.leadMemberId,
            status: teamData.status,
        })
        .select()
        .single();
    if (teamError) throw teamError;

    // Step 2: Add members to the team
    const memberLinks = teamData.memberIds.map(staff_id => ({
        team_id: newTeam.id,
        staff_id,
    }));
    const { error: memberError } = await supabase.from('team_members').insert(memberLinks);
    if (memberError) {
        // Rollback: delete the team if member insertion fails
        await supabase.from('teams').delete().eq('id', newTeam.id);
        throw memberError;
    }

    // Step 3: Fetch the full team data with members to return
    const { data: fullTeamData, error: fetchError } = await supabase
        .from('teams')
        .select(`*, staff:team_members!inner(staff(*))`)
        .eq('id', newTeam.id)
        .single();

    if (fetchError) throw fetchError;
    
    const finalTeam = fullTeamData as any;
    return {
        id: finalTeam.id,
        name: finalTeam.name,
        description: finalTeam.description,
        leadMemberId: finalTeam.lead_member_id,
        status: finalTeam.status,
        // FIX: Correctly map nested staff object to the StaffMember type.
        members: finalTeam.staff.map((m: any) => mapDbStaffToStaffMember(m.staff)),
    };
};


export const updateTeam = async (teamData: Team): Promise<Team> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { id, members, ...updateData } = teamData;

    // Step 1: Update the team's main details
    const { data: updatedTeam, error: teamError } = await supabase
        .from('teams')
        .update({
            name: updateData.name,
            description: updateData.description,
            lead_member_id: updateData.leadMemberId,
            status: updateData.status,
        })
        .eq('id', id)
        .select()
        .single();
    if (teamError) throw teamError;

    // Step 2: Sync team members
    // Get current members
    const { data: currentMembers } = await supabase.from('team_members').select('staff_id').eq('team_id', id);
    const currentMemberIds = currentMembers?.map(m => m.staff_id) || [];
    const newMemberIds = members.map(m => m.id);

    // Find members to add and remove
    const membersToAdd = newMemberIds.filter(mid => !currentMemberIds.includes(mid));
    const membersToRemove = currentMemberIds.filter(mid => !newMemberIds.includes(mid));

    if (membersToRemove.length > 0) {
        const { error } = await supabase.from('team_members').delete().eq('team_id', id).in('staff_id', membersToRemove);
        if (error) throw error;
    }
    if (membersToAdd.length > 0) {
        const { error } = await supabase.from('team_members').insert(membersToAdd.map(staff_id => ({ team_id: id, staff_id })));
        if (error) throw error;
    }
    
    // Step 3: Return the updated team object, which we already have
    return teamData;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    // Deleting a team will cascade and delete team_members due to DB constraints
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;
};
