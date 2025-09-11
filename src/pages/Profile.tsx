import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Flag, 
  CreditCard, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Save, 
  Edit, 
  Camera, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  GraduationCap,
  FileText,
  Settings,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'employment' | 'settings' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    assignments: true,
    documents: true,
    tasks: true,
    training: false
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  // Get user data (in a real app, this would come from API)
  const userData = mockUsers.find(u => u.id === user?.id) || user;

  const handleSaveProfile = () => {
    console.log('Saving profile changes');
    alert('Profile updated successfully! This would save changes in a real application.');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    console.log('Changing password');
    alert('Password change initiated! This would send a reset email in a real application.');
  };

  const handleUploadAvatar = () => {
    console.log('Uploading avatar');
    alert('Avatar upload started! This would open file picker in a real application.');
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'employment', label: 'Employment', icon: Briefcase },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          Profile & Settings
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage your personal information and account preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {/* Profile Summary */}
            <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0 auto'
                }}>
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </div>
                <button
                  onClick={handleUploadAvatar}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#3b82f6',
                    border: '2px solid white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
                {userData?.firstName} {userData?.lastName}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                {userData?.rank?.replace('_', ' ').toUpperCase()}
              </p>
              <div style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Active
              </div>
            </div>

            {/* Navigation */}
            <div style={{ padding: '8px' }}>
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: activeTab === tab.key ? '#f0f9ff' : 'transparent',
                      color: activeTab === tab.key ? '#3b82f6' : '#64748b',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      textAlign: 'left'
                    }}
                  >
                    <IconComponent size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isEditing ? '#6b7280' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isEditing ? <Save size={16} /> : <Edit size={16} />}
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Basic Information */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Basic Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          First Name
                        </label>
                        <input
                          type="text"
                          value={userData?.firstName || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={userData?.lastName || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                          <input
                            type="email"
                            value={userData?.email || ''}
                            disabled={!isEditing}
                            style={{
                              width: '100%',
                              padding: '12px 12px 12px 40px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: isEditing ? 'white' : '#f9fafb'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Phone Number
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                          <input
                            type="tel"
                            value={userData?.phone || ''}
                            disabled={!isEditing}
                            style={{
                              width: '100%',
                              padding: '12px 12px 12px 40px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: isEditing ? 'white' : '#f9fafb'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maritime Information */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Maritime Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Seafarer ID
                        </label>
                        <input
                          type="text"
                          value={userData?.seafarerId || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Rank
                        </label>
                        <input
                          type="text"
                          value={userData?.rank?.replace('_', ' ').toUpperCase() || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Department
                        </label>
                        <input
                          type="text"
                          value={userData?.department?.toUpperCase() || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          value={userData?.experience || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Personal Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Date of Birth
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                          <input
                            type="date"
                            value={userData?.dateOfBirth || ''}
                            disabled={!isEditing}
                            style={{
                              width: '100%',
                              padding: '12px 12px 12px 40px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: isEditing ? 'white' : '#f9fafb'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Nationality
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Flag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                          <input
                            type="text"
                            value={userData?.nationality || ''}
                            disabled={!isEditing}
                            style={{
                              width: '100%',
                              padding: '12px 12px 12px 40px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: isEditing ? 'white' : '#f9fafb'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={userData?.passportNumber || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Seaman Book Number
                        </label>
                        <input
                          type="text"
                          value={userData?.seamanBookNumber || ''}
                          disabled={!isEditing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: isEditing ? 'white' : '#f9fafb'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0', color: '#1f2937' }}>
                  Preferences & Settings
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                  {/* Notifications */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Notification Preferences
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={16} color="#6b7280" />
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' }}>
                              {key.replace('_', ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleNotificationToggle(key)}
                            style={{
                              width: '44px',
                              height: '24px',
                              backgroundColor: value ? '#3b82f6' : '#d1d5db',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              left: value ? '22px' : '2px',
                              transition: 'left 0.2s ease'
                            }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* App Preferences */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      App Preferences
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Theme
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[
                            { key: 'light', label: 'Light', icon: Sun },
                            { key: 'dark', label: 'Dark', icon: Moon },
                            { key: 'system', label: 'System', icon: Monitor }
                          ].map(theme => {
                            const IconComponent = theme.icon;
                            return (
                              <button
                                key={theme.key}
                                onClick={() => handlePreferenceChange('theme', theme.key)}
                                style={{
                                  flex: 1,
                                  padding: '12px',
                                  border: `2px solid ${preferences.theme === theme.key ? '#3b82f6' : '#e2e8f0'}`,
                                  backgroundColor: preferences.theme === theme.key ? '#f0f9ff' : 'white',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  fontWeight: '500',
                                  color: preferences.theme === theme.key ? '#3b82f6' : '#64748b'
                                }}
                              >
                                <IconComponent size={16} />
                                {theme.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Timezone
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="GMT">Greenwich Mean Time</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Currency
                        </label>
                        <select
                          value={preferences.currency}
                          onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0', color: '#1f2937' }}>
                  Security & Privacy
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Password Change */}
                  <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Change Password
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Current Password
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            style={{
                              width: '100%',
                              padding: '12px 40px 12px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: '#6b7280'
                            }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Key size={16} />
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1f2937' }}>
                      Two-Factor Authentication
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Shield size={16} />
                      Enable 2FA
                    </button>
                  </div>

                  {/* Account Actions */}
                  <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#991b1b' }}>
                      Danger Zone
                    </h3>
                    <p style={{ fontSize: '14px', color: '#dc2626', margin: '0 0 16px 0' }}>
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={logout}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <AlertTriangle size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;