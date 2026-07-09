import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Wallet, Eye, EyeOff, CheckCircle } from 'lucide-react';

export function ResetPasswordPage({ showToast }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const users = JSON.parse(localStorage.getItem('pocketflow_users') || '{}');
      const userKey = email.toLowerCase();
      
      if (!users[userKey]) {
        setErrors({ email: 'No account found with this email' });
        return;
      }

      // Update password
      users[userKey].password = password;
      localStorage.setItem('pocketflow_users', JSON.stringify(users));

      showToast('Password updated successfully! Please login.', 'success');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card animate-fade">
        <div className="auth-logo-section">
          <div className="auth-logo-wrapper">
            <Wallet size={24} className="auth-logo-icon" />
          </div>
          <span className="auth-brand-name">PocketFlow</span>
        </div>

        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email and new password to recover access.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
              />
            </div>
            {errors.email && <span className="auth-error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password</label>
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                }}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="auth-error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            Update Password
          </button>
        </form>

        <div className="auth-footer-text">
          <span>Back to </span>
          <Link to="/login" className="auth-redirect-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
