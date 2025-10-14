import React, { useState } from 'react'
import { useAuth } from '../contexts/SupabaseAuthContext'
import styles from './SimpleLoginTest.module.css'

export const SimpleLoginTest: React.FC = () => {
  const { signIn, user, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Login successful!')
      }
    } catch (err) {
      setMessage(`Error: ${err}`)
    }
  }

  if (user) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h2>✅ Login Successful!</h2>
          <div className={styles.userInfo}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded (tables missing)'}</p>
            <p><strong>User Type:</strong> {profile?.user_type || 'Unknown'}</p>
          </div>
          <div className={styles.status}>
            <p>🎉 Supabase authentication is working!</p>
            <p>📝 Database tables need to be created for full functionality</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>🔐 Supabase Login Test</h2>
        <p>Test authentication with existing users:</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seafarer@wavesync.com"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.testCredentials}>
          <h3>Test Credentials:</h3>
          <div className={styles.credential}>
            <strong>Seafarer:</strong> seafarer@wavesync.com / password123
          </div>
          <div className={styles.credential}>
            <strong>Company:</strong> company@wavesync.com / password123
          </div>
          <div className={styles.credential}>
            <strong>Admin:</strong> admin@wavesync.com / password123
          </div>
        </div>
      </div>
    </div>
  )
}
