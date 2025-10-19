import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import styles from './UserManagement.module.css';

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'seafarer' | 'company' | 'admin';
  phone?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  company?: {
    name: string;
  };
  seafarer_profile?: {
    rank: string;
    experience_years: number;
    availability_status: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  user_type: 'seafarer' | 'company' | 'admin';
  phone: string;
  company_id: string;
  rank: string;
  experience_years: number;
  certificate_number: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    full_name: '',
    user_type: 'seafarer',
    phone: '',
    company_id: '',
    rank: 'Cadet',
    experience_years: 0,
    certificate_number: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(name),
          seafarer_profile:seafarer_profiles(rank, experience_years, availability_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch users',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user using database function
        const { data: result, error: functionError } = await supabase
          .rpc('update_user_profile', {
            p_user_id: editingUser.id,
            p_email: formData.email,
            p_full_name: formData.full_name,
            p_user_type: formData.user_type,
            p_phone: formData.phone || null,
            p_company_id: formData.company_id || null,
            p_rank: formData.rank || null,
            p_experience_years: formData.experience_years || null,
            p_certificate_number: formData.certificate_number || null
          });

        if (functionError) throw functionError;
        
        if (result && !result.success) {
          throw new Error(result.error || 'Failed to update user profile');
        }

        addToast({
          type: 'success',
          title: 'User updated successfully',
          duration: 5000
        });
      } else {
        // Create new user using Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Get Supabase URL from environment or use default
        const supabaseUrl = 'https://tdtynyofltrqvkbkyhzo.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            user_type: formData.user_type,
            phone: formData.phone || null,
            company_id: formData.company_id || null,
            rank: formData.rank || null,
            experience_years: formData.experience_years || null,
            certificate_number: formData.certificate_number || null
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create user');
        }

        if (!result.success) {
          throw new Error(result.error || 'Failed to create user');
        }

        addToast({
          type: 'success',
          title: 'User created successfully',
          description: `User account and profile created for ${formData.email}. They can now log in with the provided credentials.`,
          duration: 8000
        });
      }

      // Reset form and refresh data
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      addToast({
        type: 'error',
        title: editingUser ? 'Failed to update user' : 'Failed to create user',
        duration: 5000
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't show password
      full_name: user.full_name,
      user_type: user.user_type,
      phone: user.phone || '',
      company_id: user.company_id || '',
      rank: user.seafarer_profile?.rank || 'Cadet',
      experience_years: user.seafarer_profile?.experience_years || 0,
      certificate_number: ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete user (this will cascade to user_profiles and seafarer_profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'User deleted successfully',
        duration: 5000
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete user',
        duration: 5000
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      user_type: 'seafarer',
      phone: '',
      company_id: '',
      rank: 'Cadet',
      experience_years: 0,
      certificate_number: ''
    });
    setEditingUser(null);
    setShowCreateForm(false);
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'seafarer': return 'Seafarer';
      case 'company': return 'Company User';
      case 'admin': return 'Admin';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'seafarer': return 'var(--color-primary)';
      case 'company': return 'var(--color-success)';
      case 'admin': return 'var(--color-warning)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create User
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.formContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
              <button className={styles.closeButton} onClick={resetForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
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
                    placeholder="Enter full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    disabled={!!editingUser}
                  />
                </div>

                {!editingUser && (
                  <div className={styles.formGroup}>
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                      minLength={6}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="user_type">User Type *</label>
                  <select
                    id="user_type"
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser}
                  >
                    <option value="seafarer">Seafarer</option>
                    <option value="company">Company User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                 {(formData.user_type === 'company' || formData.user_type === 'seafarer') && (
                   <div className={styles.formGroup}>
                     <label htmlFor="company_id">
                       {formData.user_type === 'company' ? 'Company' : 'Assigned Company'}
                     </label>
                     <select
                       id="company_id"
                       name="company_id"
                       value={formData.company_id}
                       onChange={handleInputChange}
                     >
                       <option value="">Select a company</option>
                       {companies.map(company => (
                         <option key={company.id} value={company.id}>
                           {company.name}
                         </option>
                       ))}
                     </select>
                     {companies.length === 0 && (
                       <small style={{ color: 'var(--color-warning)', marginTop: '4px', display: 'block' }}>
                         No companies available. Create a company first.
                       </small>
                     )}
                   </div>
                 )}

                {formData.user_type === 'seafarer' && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="rank">Rank</label>
                      <select
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleInputChange}
                      >
                        <option value="Cadet">Cadet</option>
                        <option value="OS Seaman">OS Seaman</option>
                        <option value="AB Seaman">AB Seaman</option>
                        <option value="Bosun">Bosun</option>
                        <option value="Third Officer">Third Officer</option>
                        <option value="Second Officer">Second Officer</option>
                        <option value="Chief Officer">Chief Officer</option>
                        <option value="Master">Master</option>
                        <option value="Engine Cadet">Engine Cadet</option>
                        <option value="Wiper">Wiper</option>
                        <option value="Oiler">Oiler</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Fourth Engineer">Fourth Engineer</option>
                        <option value="Third Engineer">Third Engineer</option>
                        <option value="Second Engineer">Second Engineer</option>
                        <option value="Chief Engineer">Chief Engineer</option>
                        <option value="Cook">Cook</option>
                        <option value="Chief Cook">Chief Cook</option>
                        <option value="Steward">Steward</option>
                        <option value="Radio Officer">Radio Officer</option>
                        <option value="Pumpman">Pumpman</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="experience_years">Experience (Years)</label>
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
                        placeholder="Enter certificate number"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.usersGrid}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Users Found</h3>
            <p>Get started by creating your first user.</p>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create User
            </button>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userHeader}>
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{user.full_name}</h3>
                  <p className={styles.userEmail}>{user.email}</p>
                  <div className={styles.userType} style={{ color: getUserTypeColor(user.user_type) }}>
                    {getUserTypeLabel(user.user_type)}
                  </div>
                </div>
                <div className={styles.userActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(user)}
                    title="Edit user"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user.id)}
                    title="Delete user"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.userDetails}>
                {user.phone && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 1.08 5.35 2.05 5.72 2.95C5.85 3.28 5.8 3.65 5.6 3.95L4.31 5.24C5.77 8.1 7.9 10.23 10.76 11.69L12.05 10.4C12.35 10.2 12.72 10.15 13.05 10.28C13.95 10.65 14.92 10.84 15.92 10.84C16.52 10.84 17 11.32 17 11.92V14.92C17 15.52 16.52 16 15.92 16Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                )}

                {user.company && (
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 21H21L19 7H5L3 21Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9V13" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 9V13" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{user.company.name}</span>
                  </div>
                )}

                {user.seafarer_profile && (
                  <>
                    <div className={styles.detailItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{user.seafarer_profile.rank}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{user.seafarer_profile.experience_years} years experience</span>
                    </div>
                    <div className={styles.detailItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Status: {user.seafarer_profile.availability_status}</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.userFooter}>
                <span className={styles.createdDate}>
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;
