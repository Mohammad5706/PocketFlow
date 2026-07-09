import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Eye, EyeOff } from 'lucide-react';

export function LoginPage({ onLogin, showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const users = JSON.parse(localStorage.getItem('pocketflow_users') || '{}');
      const user = users[email.toLowerCase()];
      if (!user) {
        setErrors({ email: 'No account found with this email. Please sign up.' });
        return;
      }
      if (user.password !== password) {
        setErrors({ password: 'Incorrect password' });
        return;
      }
      onLogin(email);
      showToast('Logged in successfully!', 'success');
      navigate('/');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(`Password reset link sent to ${email}`, 'success');
    } else {
      showToast('Please enter your email address first.', 'error');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card animate-fade">
        {/* Brand Logo */}
        <div className="auth-logo-section">
          <div className="auth-logo-wrapper">
            <Wallet size={24} className="auth-logo-icon" />
          </div>
          <span className="auth-brand-name">PocketFlow</span>
        </div>

        {/* Header Message */}
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to manage your expenses.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
              />
            </div>
            {errors.email && <span className="auth-error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                }}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="auth-error-message">{errors.password}</span>}
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="auth-options-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <a href="#forgot" onClick={handleForgotPassword} className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary auth-submit-btn">
            Sign In
          </button>
        </form>

        {/* Link to Sign Up */}
        <div className="auth-footer-text">
          <span>Don't have an account? </span>
          <Link to="/signup" className="auth-redirect-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
