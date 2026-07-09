import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import expenseService from './services/api';
import Header from './components/Header';
import DemoBanner from './components/DemoBanner';
import ExpenseModal from './components/ExpenseModal';
import Dashboard from './views/Dashboard';
import ExpensesPage from './views/ExpensesPage';
import LoginPage from './views/LoginPage';
import SignupPage from './views/SignupPage';
import { CheckCircle, AlertTriangle, Info, Loader } from 'lucide-react';
import './App.css';

export function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pocketflow_authenticated') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('pocketflow_user_email') || '';
  });

  const handleLogin = (email) => {
    setIsAuthenticated(true);
    localStorage.setItem('pocketflow_authenticated', 'true');
    localStorage.setItem('pocketflow_user_email', email);
    setCurrentUserEmail(email);
    
    // Retrieve the user's name separately from email address using a users store
    const users = JSON.parse(localStorage.getItem('pocketflow_users') || '{}');
    const user = users[email.toLowerCase()];
    
    if (user && user.name) {
      localStorage.setItem('pocketflow_user_name', user.name);
    } else {
      localStorage.removeItem('pocketflow_user_name');
    }
  };

  const handleSignup = (email, userName) => {
    setIsAuthenticated(true);
    localStorage.setItem('pocketflow_authenticated', 'true');
    localStorage.setItem('pocketflow_user_email', email);
    setCurrentUserEmail(email);
    
    // Store the email-to-name mapping separately
    const users = JSON.parse(localStorage.getItem('pocketflow_users') || '{}');
    users[email.toLowerCase()] = { name: userName };
    localStorage.setItem('pocketflow_users', JSON.stringify(users));
    
    localStorage.setItem('pocketflow_user_name', userName);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pocketflow_authenticated');
    localStorage.removeItem('pocketflow_user_name');
    localStorage.removeItem('pocketflow_user_email');
    setCurrentUserEmail('');
    showToast('Logged out successfully.', 'info');
  };
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Budget limits state
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('pocketflow_monthly_budget');
    return saved ? Number(saved) : 5000;
  });

  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Trigger toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Auto-clear after 4 seconds
    setTimeout(() => {
      setToast(prev => {
        if (prev && prev.message === message) return null;
        return prev;
      });
    }, 4000);
  }, []);

  // Fetch expenses from service
  const loadExpenses = useCallback(async (useDemo, email = currentUserEmail) => {
    setIsLoading(true);
    try {
      const data = await expenseService.getAll(useDemo, email);
      // Sort by date descending, then id descending so newer items show first
      const sorted = [...data].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return Number(b.id) - Number(a.id);
      });
      setExpenses(sorted);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      showToast('Error loading expenses from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, currentUserEmail]);

  // Check connection and load expenses on mount
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      const isBackendOnline = await expenseService.testConnection();
      
      if (!isBackendOnline) {
        setIsDemoMode(true);
        showToast('Running in local offline mode.', 'info');
        loadExpenses(true, currentUserEmail);
      } else {
        setIsDemoMode(false);
        showToast('Successfully connected to backend API!', 'success');
        loadExpenses(false, currentUserEmail);
      }
    };
    
    initializeApp();
  }, [loadExpenses, showToast, currentUserEmail]);

  // Add / Update handler
  const handleSaveExpense = async (expenseData) => {
    setIsLoading(true);
    try {
      if (expenseData.id) {
        // Update (PUT)
        await expenseService.update(expenseData.id, expenseData, isDemoMode, currentUserEmail);
        showToast(`"${expenseData.title}" updated successfully!`, 'success');
      } else {
        // Create (POST)
        await expenseService.create(expenseData, isDemoMode, currentUserEmail);
        showToast(`"${expenseData.title}" added successfully!`, 'success');
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      await loadExpenses(isDemoMode, currentUserEmail);
    } catch (err) {
      console.error('Error saving expense:', err);
      showToast('Error saving transaction. Check connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handler
  const handleDeleteExpense = async (id) => {
    setIsLoading(true);
    try {
      await expenseService.delete(id, isDemoMode, currentUserEmail);
      showToast('Transaction deleted successfully.', 'success');
      if (editingExpense && editingExpense.id === id) {
        setEditingExpense(null);
        setIsModalOpen(false);
      }
      await loadExpenses(isDemoMode, currentUserEmail);
    } catch (err) {
      console.error('Error deleting expense:', err);
      showToast('Error deleting transaction.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry Spring Boot connection manual trigger
  const handleRetryConnection = async () => {
    setIsRetryingConnection(true);
    showToast('Checking connection to API...', 'info');
    
    const isBackendOnline = await expenseService.testConnection();
    
    if (isBackendOnline) {
      setIsDemoMode(false);
      showToast('Connected! Synchronizing with API server.', 'success');
      await loadExpenses(false, currentUserEmail);
    } else {
      showToast('Backend still unreachable. Remaining in demo mode.', 'error');
      await loadExpenses(true, currentUserEmail);
    }
    setIsRetryingConnection(false);
  };

  // Budget updater handler
  const handleUpdateBudget = (newBudget) => {
    setMonthlyBudget(newBudget);
    localStorage.setItem('pocketflow_monthly_budget', String(newBudget));
    showToast(`Monthly budget updated successfully.`, 'success');
  };

  // Modal control handlers
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  return (
    <Router>
      <div className="pocketflow-app">
        {/* Toast Notification */}
        {toast && (
          <div className={`toast-notification toast-${toast.type} animate-fade`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertTriangle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span className="toast-message">{toast.message}</span>
          </div>
        )}

        {isAuthenticated ? (
          <>
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Connection Banner */}
            <DemoBanner 
              isDemo={isDemoMode} 
              isRetrying={isRetryingConnection} 
              onRetry={handleRetryConnection} 
            />

            {/* Main Content Router Switch */}
            <main className="app-main-content">
              {isLoading && expenses.length === 0 ? (
                <div className="dashboard-loading-card">
                  <Loader size={36} className="spin loading-icon" />
                  <h3>Retrieving expenses ledger...</h3>
                  <p>Fetching database tables</p>
                </div>
              ) : (
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <Dashboard 
                        expenses={expenses} 
                        monthlyBudget={monthlyBudget} 
                        onUpdateBudget={handleUpdateBudget} 
                      />
                    } 
                  />
                  <Route 
                    path="/expenses" 
                    element={
                      <ExpensesPage 
                        expenses={expenses} 
                        onAddClick={handleOpenAddModal} 
                        onEditClick={handleOpenEditModal} 
                        onDeleteClick={handleDeleteExpense} 
                      />
                    } 
                  />
                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
              <ExpenseModal 
                key={editingExpense ? `edit-${editingExpense.id}` : 'new'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExpense}
                editingExpense={editingExpense}
              />
            )}

            {/* Footer Branding */}
            <footer className="dashboard-footer">
              <p className="footer-credits">
                <span>© PocketFlow | By Gulshan 2026</span>
              </p>
            </footer>
          </>
        ) : (
          <div className="auth-layout-wrapper">
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} showToast={showToast} />} />
              <Route path="/signup" element={<SignupPage onSignup={handleSignup} showToast={showToast} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
