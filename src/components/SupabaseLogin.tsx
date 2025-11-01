import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/SupabaseAuthContext'
import { useToast } from '../hooks/useToast'
import styles from './SupabaseLogin.module.css'

interface LoginFormData {
  email: string
  password: string
  fullName: string
  userType: 'seafarer' | 'company' | 'admin'
  phone: string
  companyName?: string
  rank?: string
  certificateNumber?: string
  experienceYears?: number
}

export const SupabaseLogin: React.FC = () => {
  const { signIn, signUp, authLoading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const showDemoCredentials = (import.meta as any)?.env?.VITE_SHOW_DEMO_CREDENTIALS === 'true' || (import.meta as any)?.env?.MODE !== 'production'
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    fullName: '',
    userType: 'seafarer',
    phone: '',
    companyName: '',
    rank: 'Cadet',
    certificateNumber: '',
    experienceYears: 0
  })

  const fillCredentials = (email: string, password: string) => {
    setFormData(prev => ({
      ...prev,
      email,
      password
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Form submitted, isSignUp:', isSignUp)
    
    if (isSignUp) {
      // Handle sign up
      console.log('📝 Processing sign up...')
      const userData = {
        full_name: formData.fullName,
        user_type: formData.userType,
        phone: formData.phone,
        rank: formData.rank,
        certificate_number: formData.certificateNumber,
        experience_years: formData.experienceYears
      }

      const { error } = await signUp(formData.email, formData.password, userData)
      
      if (error) {
        console.log('❌ Sign up failed:', error)
        addToast({
          type: 'error',
          title: 'Sign up failed',
          description: error.message,
          duration: 5000
        })
      } else {
        console.log('✅ Sign up successful')
        addToast({
          type: 'success',
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
          duration: 5000
        })
      }
    } else {
      // Handle sign in
      console.log('🔐 Processing sign in...')
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        console.log('❌ Sign in failed:', error)
        addToast({
          type: 'error',
          title: 'Sign in failed',
          description: error.message,
          duration: 5000
        })
      } else {
        console.log('✅ Sign in successful, navigating to dashboard')
        // Navigate to dashboard on successful sign-in
        navigate('/dashboard', { replace: true })
      }
    }
  }

  return (
    <>
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>WaveSync Maritime</h1>
          <p className={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {isSignUp && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="userType" className={styles.label}>
                  User Type
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="seafarer">Seafarer</option>
                  <option value="company">Company</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your phone number"
                />
              </div>

              {formData.userType === 'seafarer' && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="rank" className={styles.label}>
                      Rank
                    </label>
                    <select
                      id="rank"
                      name="rank"
                      value={formData.rank}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="Cadet">Cadet</option>
                      <option value="Ordinary Seaman">Ordinary Seaman</option>
                      <option value="Able Seaman">Able Seaman</option>
                      <option value="Bosun">Bosun</option>
                      <option value="Third Officer">Third Officer</option>
                      <option value="Second Officer">Second Officer</option>
                      <option value="Chief Officer">Chief Officer</option>
                      <option value="Captain">Captain</option>
                      <option value="Engine Cadet">Engine Cadet</option>
                      <option value="Junior Engineer">Junior Engineer</option>
                      <option value="Third Engineer">Third Engineer</option>
                      <option value="Second Engineer">Second Engineer</option>
                      <option value="Chief Engineer">Chief Engineer</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="certificateNumber" className={styles.label}>
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      id="certificateNumber"
                      name="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Enter certificate number"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="experienceYears" className={styles.label}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className={styles.input}
                      min="0"
                      max="50"
                    />
                  </div>
                </>
              )}

              {formData.userType === 'company' && (
                <div className={styles.formGroup}>
                  <label htmlFor="companyName" className={styles.label}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter company name"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={authLoading}
          >
            {authLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className={styles.toggleButton}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
    {showDemoCredentials && (
      <div style={{ maxWidth: 420, margin: '12px auto 0', padding: '12px 14px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8 }}>
        <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, marginBottom: 8 }}>Test Accounts (for demo only)</div>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Admin</span>: admin@wavesync.com / password123
            </div>
            <button type="button" onClick={() => fillCredentials('admin@wavesync.com', 'password123')} style={{ fontSize: 12, padding: '6px 8px', background: '#3B82F6', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>Fill</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Company</span>: company1@wavesync.com / Company1
            </div>
            <button type="button" onClick={() => fillCredentials('company1@wavesync.com', 'Company1')} style={{ fontSize: 12, padding: '6px 8px', background: '#3B82F6', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>Fill</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Seafarer</span>: seafarer1@wavesync.com / Seafarer1
            </div>
            <button type="button" onClick={() => fillCredentials('seafarer1@wavesync.com', 'Seafarer1')} style={{ fontSize: 12, padding: '6px 8px', background: '#3B82F6', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>Fill</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
