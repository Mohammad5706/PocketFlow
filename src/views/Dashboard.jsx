import { useState } from 'react';
import { Link } from 'react-router-dom';
import ExpenseCharts from '../components/ExpenseCharts';
import { 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  Wallet, 
  Activity,
  Edit2,
  Check
} from 'lucide-react';

export function Dashboard({ expenses, monthlyBudget, onUpdateBudget }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget);

  // Formatting helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Computations
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remainingBudget = monthlyBudget - totalExpenses;
  
  const averageExpense = expenses.length > 0 ? (totalExpenses / expenses.length) : 0;
  
  const highestExpense = expenses.length > 0 
    ? Math.max(...expenses.map(e => Number(e.amount || 0))) 
    : 0;

  // Most frequent category
  const categoryFreq = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  let mostFrequentCategory = 'None';
  let maxCount = 0;
  Object.entries(categoryFreq).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentCategory = cat;
    }
  });

  // Category tags classes mapping
  const CATEGORY_TAGS = {
    Food: 'cat-tag-food',
    Travel: 'cat-tag-travel',
    Shopping: 'cat-tag-shopping',
    Clothing: 'cat-tag-clothing',
    Bills: 'cat-tag-bills',
    Entertainment: 'cat-tag-entertainment',
    Health: 'cat-tag-health',
    Education: 'cat-tag-education',
    Other: 'cat-tag-other',
  };

  const handleSaveBudget = () => {
    const numBudget = Number(tempBudget);
    if (!isNaN(numBudget) && numBudget >= 0) {
      onUpdateBudget(numBudget);
      setIsEditingBudget(false);
    }
  };

  // 5 Recent transactions
  const recentTransactions = expenses.slice(0, 5);

  return (
    <div className="dashboard-view animate-fade">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {(() => {
              const name = localStorage.getItem('pocketflow_user_name');
              const hasValidName = name && name !== 'User' && name !== 'Guest' && name !== 'Unknown User';
              return hasValidName ? `Welcome back, ${name}` : 'Welcome to PocketFlow';
            })()}
          </h1>
          <p className="hero-subtitle">Track, analyze and manage your expenses efficiently.</p>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="dashboard-metrics-grid">
        {/* Total Expenses Card */}
        <div className="metric-card card-dark-forest">
          <div className="card-top">
            <span className="card-label-text">Total Expenses</span>
            <div className="card-icon">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="card-middle">
            <h2 className="metric-value">{formatCurrency(totalExpenses)}</h2>
            <p className="metric-detail">Money spent so far</p>
          </div>
        </div>

        {/* Monthly Budget Card */}
        <div className="metric-card card-muted-sage">
          <div className="card-top">
            <span className="card-label-text">Monthly Budget</span>
            <div className="card-icon">
              <Wallet size={20} />
            </div>
          </div>
          <div className="card-middle">
            {isEditingBudget ? (
              <div className="budget-edit-input-group">
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="budget-edit-input"
                  min="0"
                  autoFocus
                />
                <button className="budget-save-btn" onClick={handleSaveBudget}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="budget-display-group">
                <h2 className="metric-value">{formatCurrency(monthlyBudget)}</h2>
                <button 
                  className="budget-edit-btn" 
                  onClick={() => {
                    setTempBudget(monthlyBudget);
                    setIsEditingBudget(true);
                  }}
                  title="Edit Budget"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <p className="metric-detail">Configured target limit</p>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className={`metric-card ${remainingBudget < 0 ? 'card-alert-red' : 'card-soft-mint'}`}>
          <div className="card-top">
            <span className="card-label-text">Remaining Budget</span>
            <div className="card-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-middle">
            <h2 className="metric-value">{formatCurrency(remainingBudget)}</h2>
            <p className="metric-detail">Budget still available</p>
          </div>
        </div>
      </section>

      {/* Analytics & Key Stats Section */}
      <section className="dashboard-analytics-grid">
        {/* Left Column: Visualizer Chart */}
        <div className="analytics-chart-container">
          <ExpenseCharts expenses={expenses} />
        </div>

        {/* Right Column: Statistics */}
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">Expense Statistics</h3>
            <p className="stats-card-subtitle">Key metrics aggregated from logs</p>
          </div>
          
          <div className="stats-items-list">
            <div className="stats-item">
              <div className="stats-item-left">
                <span className="stats-item-title">Average Expense</span>
                <span className="stats-item-desc">Mean per transaction</span>
              </div>
              <div className="stats-item-value">{formatCurrency(averageExpense)}</div>
            </div>

            <div className="stats-item">
              <div className="stats-item-left">
                <span className="stats-item-title">Highest Expense</span>
                <span className="stats-item-desc">Max single transaction</span>
              </div>
              <div className="stats-item-value">{formatCurrency(highestExpense)}</div>
            </div>

            <div className="stats-item">
              <div className="stats-item-left">
                <span className="stats-item-title">Most Frequent Category</span>
                <span className="stats-item-desc">Highest log occurrence</span>
              </div>
              <div className={`stats-item-value-badge ${mostFrequentCategory !== 'None' ? CATEGORY_TAGS[mostFrequentCategory] || 'cat-tag-other' : ''}`}>
                {mostFrequentCategory}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions Section */}
      <section className="recent-transactions-section">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">Recent Transactions</h3>
            <p className="section-subtitle">Your latest cash outflow activities</p>
          </div>
          <Link to="/expenses" className="view-all-link">
            <span>View All Expenses</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="recent-list-container">
          {recentTransactions.length > 0 ? (
            <div className="recent-cards-list">
              {recentTransactions.map((expense) => (
                <div key={expense.id} className="recent-item-card animate-slide">
                  <div className="recent-item-left">
                    <span className={`cat-badge ${CATEGORY_TAGS[expense.category] || 'cat-tag-other'}`}>
                      {expense.category}
                    </span>
                    <span className="recent-item-title">{expense.title}</span>
                  </div>
                  <div className="recent-item-right">
                    <span className="recent-item-amount">{formatCurrency(expense.amount)}</span>
                    <span className="recent-item-date">
                      <Calendar size={12} style={{ marginRight: '4px' }} />
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="recent-empty-state">
              <Activity size={32} className="empty-state-icon" />
              <h4 className="empty-state-title">No transactions recorded</h4>
              <p className="empty-state-text">Navigate to the Expenses tab and click 'Add Expense' to get started.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
