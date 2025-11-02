import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import SeafarerProfileCompletion from './SeafarerProfileCompletion';

interface ProfileCheckProps {
  children: React.ReactNode;
}

const ProfileCompletionCheck: React.FC<ProfileCheckProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Only check if we have both user and profile, and haven't checked yet
    if (user && profile && isProfileComplete === null && profile.user_type === 'seafarer') {
      checkProfileCompletion();
    } else if (profile && profile.user_type !== 'seafarer') {
      // Non-seafarer users don't need profile completion
      setIsProfileComplete(true);
    }
  }, [user, profile]);

  const checkProfileCompletion = async () => {
    if (!user || !profile || profile.user_type !== 'seafarer') {
      return;
    }

    try {
      setChecking(true);

      // Check if seafarer profile exists and has required fields
      // Use .maybeSingle() instead of .single() to avoid 406 error when profile doesn't exist
      const { data: seafarerProfile, error } = await supabase
        .from('seafarer_profiles')
        .select('rank, experience_years, availability_status')
        .eq('user_id', user.id)
        .maybeSingle(); // Returns null if not found instead of throwing 406 error

      if (error) {
        // Log error but don't block - allow dashboard to load
        console.error('Error checking seafarer profile:', error);
        // If it's a network/RLS error, assume profile is incomplete
        setIsProfileComplete(false);
        return;
      }

      // Check if profile is complete
      // Profile is complete if it exists and has required fields
      const isComplete = seafarerProfile && 
                        seafarerProfile.rank && 
                        seafarerProfile.availability_status;

      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsProfileComplete(false);
    } finally {
      setChecking(false);
    }
  };

  // Only show profile completion form on dashboard route
  // Don't block other routes
  const isDashboardRoute = typeof window !== 'undefined' && window.location.pathname === '/dashboard';
  
  // If profile is not complete and user is a seafarer AND we're on dashboard, show completion form as modal/overlay
  // Only show after we've finished checking (not while checking)
  // IMPORTANT: Always render children first so dashboard loads immediately
  const showCompletionModal = isDashboardRoute && !checking && isProfileComplete === false && profile?.user_type === 'seafarer';
  
  return (
    <>
      {children}
      {showCompletionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <SeafarerProfileCompletion />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCompletionCheck;

