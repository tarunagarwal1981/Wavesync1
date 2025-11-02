import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

export interface SidebarBadges {
  // Seafarer badges
  assignments?: number;
  tasks?: number;
  documents?: number;
  training?: number;
  messages?: number;
  
  // Company badges
  crewDirectory?: number;
  fleetManagement?: number;
  assignmentManagement?: number;
  taskManagement?: number;
  documentManagement?: number;
  travelManagement?: number;
  compliance?: number;
  userManagement?: number;
}

/**
 * Hook to fetch all sidebar badge counts based on user role
 */
export const useSidebarBadges = (): SidebarBadges => {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<SidebarBadges>({});

  useEffect(() => {
    if (!user || !profile) {
      setBadges({});
      return;
    }

    const fetchBadges = async () => {
      const newBadges: SidebarBadges = {};

      if (profile.user_type === 'seafarer') {
        // Seafarer badges
        try {
          // My Assignments: Count pending assignments for seafarer
          try {
            const [pendingCount, acceptedCount] = await Promise.all([
              supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('seafarer_id', user.id).eq('status', 'pending'),
              supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('seafarer_id', user.id).eq('status', 'accepted')
            ]);

            newBadges.assignments = (pendingCount.count || 0) + (acceptedCount.count || 0);
          } catch (error) {
            console.error('Error fetching assignments count:', error);
            newBadges.assignments = 0;
          }

          // Tasks: Count pending/in-progress tasks
          // Use separate queries and sum the counts, as PostgREST doesn't support .or() with count queries
          try {
            const [pendingCount, inProgressCount, overdueCount] = await Promise.all([
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'pending'),
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'in_progress'),
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'overdue')
            ]);

            newBadges.tasks = (pendingCount.count || 0) + (inProgressCount.count || 0) + (overdueCount.count || 0);
          } catch (error) {
            console.error('Error fetching tasks count:', error);
            newBadges.tasks = 0;
          }

          // Documents: Count expiring soon documents (expiring in next 90 days)
          const ninetyDaysFromNow = new Date();
          ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
          
          const { count: documentsCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .lte('expiry_date', ninetyDaysFromNow.toISOString())
            .gte('expiry_date', new Date().toISOString());

          newBadges.documents = documentsCount || 0;

          // Training: Count pending training assignments
          // Note: Assuming training assignments are in tasks with category 'training'
          try {
            const [pendingCount, inProgressCount] = await Promise.all([
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('category', 'training').eq('status', 'pending'),
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('category', 'training').eq('status', 'in_progress')
            ]);

            newBadges.training = (pendingCount.count || 0) + (inProgressCount.count || 0);
          } catch (error) {
            console.error('Error fetching training count:', error);
            newBadges.training = 0;
          }

          // Messages: Count unread messages using conversations
          // Get conversations where user is a participant and count unread messages
          const { data: conversations } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);
          
          if (conversations && conversations.length > 0) {
            const conversationIds = conversations.map(c => c.id);
            const { count: messagesCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', conversationIds)
              .neq('sender_id', user.id)
              .is('read_at', null);
            
            newBadges.messages = messagesCount || 0;
          } else {
            newBadges.messages = 0;
          }
        } catch (error) {
          console.error('Error fetching seafarer badges:', error);
        }
      } else if (profile.user_type === 'company' && profile.company_id) {
        // Company badges
        try {
          // Crew Directory: Total crew count
          const { count: crewCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'seafarer')
            .eq('company_id', profile.company_id);

          newBadges.crewDirectory = crewCount || 0;

          // Fleet Management: Total vessels
          const { count: fleetCount } = await supabase
            .from('vessels')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id);

          newBadges.fleetManagement = fleetCount || 0;

          // Assignment Management: Pending assignments without seafarer
          const { count: assignmentCount } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .eq('status', 'pending')
            .is('seafarer_id', null);

          newBadges.assignmentManagement = assignmentCount || 0;

          // Task Management: Pending/in-progress tasks for company
          try {
            const [pendingCount, inProgressCount, overdueCount] = await Promise.all([
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'pending'),
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'in_progress'),
              supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'overdue')
            ]);

            newBadges.taskManagement = (pendingCount.count || 0) + (inProgressCount.count || 0) + (overdueCount.count || 0);
          } catch (error) {
            console.error('Error fetching task management count:', error);
            newBadges.taskManagement = 0;
          }

          // Document Management: Pending document approvals
          const { count: documentCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .eq('status', 'pending');

          newBadges.documentManagement = documentCount || 0;

          // Travel Management: Pending travel requests
          try {
            const [pendingCount, approvedCount] = await Promise.all([
              supabase.from('travel_requests').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'pending'),
              supabase.from('travel_requests').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('status', 'approved')
            ]);

            newBadges.travelManagement = (pendingCount.count || 0) + (approvedCount.count || 0);
          } catch (error) {
            console.error('Error fetching travel management count:', error);
            newBadges.travelManagement = 0;
          }

          // Compliance: Count documents expiring in next 30 days
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          
          const { count: complianceCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .lte('expiry_date', thirtyDaysFromNow.toISOString())
            .gte('expiry_date', new Date().toISOString());

          newBadges.compliance = complianceCount || 0;

          // User Management: This could be pending invitations or active users
          // For now, let's use active company users (non-seafarers with company_id)
          const { count: userCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'company')
            .eq('company_id', profile.company_id);

          newBadges.userManagement = userCount || 0;
        } catch (error) {
          console.error('Error fetching company badges:', error);
        }
      }

      setBadges(newBadges);
    };

    fetchBadges();

    // Poll every 60 seconds to keep badges updated
    const interval = setInterval(fetchBadges, 60000);

    return () => clearInterval(interval);
  }, [user, profile]);

  return badges;
};

