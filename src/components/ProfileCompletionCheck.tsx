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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, [user, profile]);

  const checkProfileCompletion = async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is a seafarer
      if (profile.user_type !== 'seafarer') {
        setIsProfileComplete(true);
        setLoading(false);
        return;
      }

      // Check if seafarer profile exists and has required fields
      const { data: seafarerProfile, error } = await supabase
        .from('seafarer_profiles')
        .select('rank, experience_years, availability_status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking seafarer profile:', error);
        setIsProfileComplete(false);
        setLoading(false);
        return;
      }

      // Check if profile is complete
      const isComplete = seafarerProfile && 
                        seafarerProfile.rank && 
                        seafarerProfile.availability_status;

      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-light)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If profile is not complete and user is a seafarer, show completion form
  if (!isProfileComplete && profile?.user_type === 'seafarer') {
    return <SeafarerProfileCompletion />;
  }

  // Otherwise, show the normal content
  return <>{children}</>;
};

export default ProfileCompletionCheck;
