import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { Button, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'seafarer' | 'company_user' | 'admin') => {
    setIsLoading(true);
    
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Demo login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    alert('Forgot password functionality will be implemented soon.');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🌊</div>
            <h1 className={styles.logoText}>WaveSync</h1>
            <div className={styles.aiBadge}>
              <span className={styles.aiSparkle}>✨</span>
              <span className={styles.aiText}>AI-Powered</span>
            </div>
          </div>
          <p className={styles.subtitle}>Maritime Crew Management Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {errors.general}
            </div>
          )}

          <div className={styles.inputGroup}>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Remember me</span>
            </label>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              className={styles.forgotLink}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className={styles.loginButton}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <button className={styles.signupLink}>
              Contact your administrator
            </button>
          </p>
        </div>

        {/* Demo Login Section */}
        <div className={styles.demoSection}>
          <div className={styles.demoDivider}>
            <span className={styles.demoDividerText}>DEMO MODE</span>
          </div>
          
          <div className={styles.demoButtons}>
            <button
              onClick={() => handleDemoLogin('seafarer')}
              disabled={isLoading}
              className={styles.demoButton}
              title="Login as a Seafarer to view assignments, tasks, and documents"
            >
              <span className={styles.demoIcon}>⚓</span>
              <div className={styles.demoButtonContent}>
                <span className={styles.demoButtonTitle}>Seafarer</span>
                <span className={styles.demoButtonSubtitle}>View assignments & tasks</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('company_user')}
              disabled={isLoading}
              className={styles.demoButton}
              title="Login as a Company User to manage crew and vessels"
            >
              <span className={styles.demoIcon}>🏢</span>
              <div className={styles.demoButtonContent}>
                <span className={styles.demoButtonTitle}>Company User</span>
                <span className={styles.demoButtonSubtitle}>Manage crew & vessels</span>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className={styles.demoButton}
              title="Login as an Admin to access all features"
            >
              <span className={styles.demoIcon}>👨‍💼</span>
              <div className={styles.demoButtonContent}>
                <span className={styles.demoButtonTitle}>Admin</span>
                <span className={styles.demoButtonSubtitle}>Full system access</span>
              </div>
            </button>
          </div>

          <p className={styles.demoNote}>
            💡 Demo accounts have full access to all features without requiring passwords
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.wave1}></div>
        <div className={styles.wave2}></div>
        <div className={styles.wave3}></div>
        <div className={styles.ship}></div>
      </div>
    </div>
  );
};

export default Login;
