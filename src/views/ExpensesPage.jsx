import { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Info, Plus, Download, Calendar } from 'lucide-react';

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

export function ExpensesPage({ expenses, onAddClick, onEditClick, onDeleteClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Filter category list options
  const filterCategories = ['All', 'Food', 'Travel', 'Shopping', 'Clothing', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  // Combined search & filter logic
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = (expense.title || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleDeleteConfirm = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDeleteClick(id);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ['ID', 'Title', 'Category', 'Amount', 'Date'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.category,
      exp.amount,
      exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0]
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pocketflow_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="expenses-view animate-fade">
      {/* View Header */}
      <div className="expenses-view-header">
        <div className="header-left">
          <h1 className="view-title">Expense Transactions</h1>
          <p className="view-subtitle">Search, filter and manage all your expense records.</p>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="expenses-control-bar">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter */}
        <div className="filter-select-wrapper">
          <Filter size={18} className="filter-icon" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {filterCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Actions Button Group */}
        <div className="action-buttons-group">
          <button 
            className="btn btn-secondary btn-export" 
            onClick={handleExportCSV}
            title="Export current view to CSV"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn btn-primary btn-add" 
            onClick={onAddClick}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Table Ledger */}
      <div className="table-container">
        {filteredExpenses.length > 0 ? (
          <table className="expense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="table-row animate-slide">
                  <td>
                    <span className="row-id">{expense.id}</span>
                  </td>
                  <td>
                    <span className="row-title">{expense.title}</span>
                  </td>
                  <td>
                    <span className={`cat-badge ${CATEGORY_TAGS[expense.category] || 'cat-tag-other'}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="text-right font-semibold">
                    <span className="row-amount">{formatCurrency(expense.amount)}</span>
                  </td>
                  <td>
                    <span className="row-date">
                      <Calendar size={13} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                      {formatDate(expense.date)}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="action-buttons-wrapper">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEditClick(expense)}
                        title="Edit expense"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteConfirm(expense.id, expense.title)}
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="table-empty-state">
            <Info size={32} className="empty-state-icon" />
            <h4 className="empty-state-title">No transactions found</h4>
            <p className="empty-state-text">
              {expenses.length === 0
                ? "Start listing expenses by clicking 'Add Expense' above."
                : "No items match your search or filter. Try a different query."}
            </p>
          </div>
        )}
      </div>

      {/* Table Footer Summary */}
      {filteredExpenses.length > 0 && (
        <div className="table-footer-summary">
          <span>Showing {filteredExpenses.length} of {expenses.length} records</span>
          <span className="footer-total">
            Total Selected: {formatCurrency(filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
          </span>
        </div>
      )}
    </div>
  );
}

export default ExpensesPage;
