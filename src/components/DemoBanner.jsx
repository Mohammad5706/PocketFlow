import { AlertCircle, RefreshCw } from 'lucide-react';

export function DemoBanner({ isDemo, isRetrying, onRetry }) {
  if (!isDemo) return null;

  return (
    <div className="demo-banner animate-fade">
      <div className="demo-banner-content">
        <AlertCircle size={18} className="demo-banner-icon" />
        <span className="demo-banner-text">
          <strong>Demo Mode Active:</strong> Spring Boot backend (<code>http://localhost:8081</code>) is unreachable. Changes are saved locally.
        </span>
      </div>
      <button 
        className={`demo-banner-btn ${isRetrying ? 'loading' : ''}`} 
        onClick={onRetry} 
        disabled={isRetrying}
      >
        <RefreshCw size={14} className={isRetrying ? 'spin' : ''} />
        {isRetrying ? 'Retrying...' : 'Connect Backend'}
      </button>
    </div>
  );
}

export default DemoBanner;
