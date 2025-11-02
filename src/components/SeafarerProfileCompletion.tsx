import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../hooks/useToast';
import styles from './SeafarerProfileCompletion.module.css';

interface ProfileFormData {
  full_name: string;
  phone: string;
  rank: string;
  experience_years: number;
  certificate_number: string;
  preferred_vessel_types: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  address: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
}

const SeafarerProfileCompletion: React.FC = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    rank: 'Cadet',
    experience_years: 0,
    certificate_number: '',
    preferred_vessel_types: [],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    address: '',
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    passport_expiry: ''
  });

  const vesselTypes = [
    'Container Ship',
    'Bulk Carrier',
    'Tanker',
    'Gas Carrier',
    'Ro-Ro Ship',
    'Passenger Ship',
    'Offshore Vessel',
    'Tug Boat',
    'Fishing Vessel',
    'Other'
  ];

  const ranks = [
    'Cadet',
    'OS Seaman',
    'AB Seaman',
    'Bosun',
    'Third Officer',
    'Second Officer',
    'Chief Officer',
    'Master',
    'Engine Cadet',
    'Wiper',
    'Oiler',
    'Electrician',
    'Fourth Engineer',
    'Third Engineer',
    'Second Engineer',
    'Chief Engineer',
    'Cook',
    'Chief Cook',
    'Steward',
    'Radio Officer',
    'Pumpman',
    'Other'
  ];

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      }));
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value
    }));
  };

  const handleVesselTypeChange = (vesselType: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_vessel_types: prev.preferred_vessel_types.includes(vesselType)
        ? prev.preferred_vessel_types.filter(type => type !== vesselType)
        : [...prev.preferred_vessel_types, vesselType]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      addToast({
        type: 'error',
        title: 'User not authenticated',
        duration: 5000
      });
      return;
    }

    try {
      setLoading(true);

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update or create seafarer profile
      const { error: seafarerError } = await supabase
        .from('seafarer_profiles')
        .upsert({
          user_id: user.id,
          rank: formData.rank,
          experience_years: formData.experience_years,
          certificate_number: formData.certificate_number || null,
          preferred_vessel_types: formData.preferred_vessel_types,
          availability_status: 'available'
        });

      if (seafarerError) throw seafarerError;

      // Create additional profile data (you might want to create a separate table for this)
      // For now, we'll store it in a JSON field or create a seafarer_details table
      const { error: detailsError } = await supabase
        .from('seafarer_profiles')
        .update({
          // Store additional details in a JSON field or extend the table
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (detailsError) throw detailsError;

      addToast({
        type: 'success',
        title: 'Profile completed successfully!',
        description: 'Your profile has been updated. The dashboard will refresh.',
        duration: 5000
      });

      // Refresh the page to reload profile completion check
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Failed to update profile. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>
          Please complete your seafarer profile to access all features of the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="full_name">Full Name *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nationality">Nationality</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                placeholder="Enter your nationality"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter your address"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="rank">Rank *</label>
              <select
                id="rank"
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                required
              >
                {ranks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="experience_years">Years of Experience</label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                max="50"
                placeholder="Years of experience"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="certificate_number">Certificate Number</label>
              <input
                type="text"
                id="certificate_number"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleInputChange}
                placeholder="Enter your certificate number"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferred Vessel Types</h2>
          <div className={styles.vesselTypesGrid}>
            {vesselTypes.map(vesselType => (
              <label key={vesselType} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.preferred_vessel_types.includes(vesselType)}
                  onChange={() => handleVesselTypeChange(vesselType)}
                />
                <span className={styles.checkboxText}>{vesselType}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Emergency Contact</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="emergency_contact_name">Contact Name</label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="emergency_contact_phone">Contact Phone</label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                placeholder="Enter emergency contact phone"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="emergency_contact_relationship">Relationship</label>
              <input
                type="text"
                id="emergency_contact_relationship"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleInputChange}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Document Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="passport_number">Passport Number</label>
              <input
                type="text"
                id="passport_number"
                name="passport_number"
                value={formData.passport_number}
                onChange={handleInputChange}
                placeholder="Enter passport number"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="passport_expiry">Passport Expiry Date</label>
              <input
                type="date"
                id="passport_expiry"
                name="passport_expiry"
                value={formData.passport_expiry}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Saving Profile...
              </>
            ) : (
              'Complete Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SeafarerProfileCompletion;
