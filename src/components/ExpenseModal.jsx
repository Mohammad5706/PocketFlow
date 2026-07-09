import { useState } from 'react';
import { PlusCircle, Edit, X, AlertTriangle, Banknote, QrCode, CreditCard, Landmark } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Clothing',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other'
];

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'UPI', label: 'UPI', icon: QrCode },
  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark }
];

export function ExpenseModal({ isOpen, onClose, onSave, editingExpense }) {
  const [title, setTitle] = useState(editingExpense?.title || '');
  const [category, setCategory] = useState(editingExpense?.category || 'Food');
  const [amount, setAmount] = useState(editingExpense?.amount || '');
  const [date, setDate] = useState(() => {
    if (editingExpense?.date) {
      return editingExpense.date.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState(editingExpense?.paymentMethod || 'Cash');
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setCategory('Food');
    setAmount('');
    setPaymentMethod('Cash');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validations
    if (!title.trim()) {
      setError('Please provide an expense title.');
      return;
    }
    if (!category) {
      setError('Please select a spending category.');
      return;
    }
    if (amount === '' || isNaN(amount)) {
      setError('Please enter a valid expense amount.');
      return;
    }
    const numAmount = Number(amount);
    if (numAmount < 0) {
      setError('Expense amount cannot be negative.');
      return;
    }
    if (numAmount === 0) {
      setError('Expense amount must be greater than zero.');
      return;
    }
    if (!date) {
      setError('Please select a transaction date.');
      return;
    }

    // Success - trigger onSave
    const expenseData = {
      title: title.trim(),
      category,
      amount: numAmount,
      date,
      paymentMethod
    };

    if (editingExpense) {
      expenseData.id = editingExpense.id;
    }

    onSave(expenseData);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-container animate-modal-fade" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-section">
          <h3 className="modal-title">
            {editingExpense ? 'Edit Expense Details' : 'Add New Expense'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <p className="modal-subtitle">
          Enter the details of your expense
        </p>

        <form onSubmit={handleSubmit} className="expense-form">
          {error && (
            <div className="form-error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-body-scroll">
            <div className="form-group">
              <label htmlFor="expense-title">Title</label>
              <input
                type="text"
                id="expense-title"
                placeholder="e.g., Dinner at Bistro"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                className={error && !title.trim() ? 'input-error' : ''}
                autoFocus
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="expense-category">Category</label>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expense-amount">Amount (₹)</label>
                <input
                  type="number"
                  id="expense-amount"
                  placeholder="0.00"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError('');
                  }}
                  className={error && (amount === '' || Number(amount) < 0) ? 'input-error' : ''}
                />
              </div>
            </div>

            {/* Payment Method selectable cards */}
            <div className="form-group">
              <label>Payment Method</label>
              <div className="payment-methods-grid">
                {PAYMENT_METHODS.map((method) => {
                  const IconComponent = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="payment-method-icon-container">
                        <IconComponent size={18} className="payment-method-icon" />
                      </div>
                      <span className="payment-method-label">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Transaction Date</label>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="form-actions-flex">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExpense ? (
                <>
                  <Edit size={16} />
                  <span>Update Expense</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseModal;
