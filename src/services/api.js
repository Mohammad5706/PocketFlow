import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
});

// Mock Storage Key
const LOCAL_STORAGE_KEY = 'pocketflow_expenses';

// Pre-seeded Mock Data for presentation
const MOCK_DATA_SEED = [
  { id: 1, title: 'Weekly Groceries', category: 'Food', amount: 850, date: '2026-06-21' },
  { id: 2, title: 'Gas Station Fuel', category: 'Travel', amount: 450, date: '2026-06-20' },
  { id: 3, title: 'Summer Jacket', category: 'Clothing', amount: 1200, date: '2026-06-18' },
  { id: 4, title: 'Electricity Bill', category: 'Bills', amount: 2400, date: '2026-06-15' },
  { id: 5, title: 'Cinema Tickets', category: 'Entertainment', amount: 350, date: '2026-06-12' },
  { id: 6, title: 'Gym Membership', category: 'Health', amount: 900, date: '2026-06-10' },
  { id: 7, title: 'Data Structures Book', category: 'Education', amount: 650, date: '2026-06-05' },
];

// LocalStorage helpers
export const localDb = {
  getStorageKey: (userEmail) => {
    return userEmail ? `${LOCAL_STORAGE_KEY}_${userEmail.toLowerCase()}` : LOCAL_STORAGE_KEY;
  },
  get: (userEmail = '') => {
    const key = localDb.getStorageKey(userEmail);
    const data = localStorage.getItem(key);
    if (!data) {
      const initialData = userEmail ? [] : MOCK_DATA_SEED;
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },
  save: (data, userEmail = '') => {
    const key = localDb.getStorageKey(userEmail);
    localStorage.setItem(key, JSON.stringify(data));
  },
  add: (expense, userEmail = '') => {
    const data = localDb.get(userEmail);
    const newId = data.length > 0 ? Math.max(...data.map(e => e.id)) + 1 : 1;
    const newExpense = { ...expense, id: newId };
    data.push(newExpense);
    localDb.save(data, userEmail);
    return newExpense;
  },
  update: (id, updatedExpense, userEmail = '') => {
    const data = localDb.get(userEmail);
    const index = data.findIndex(e => e.id === Number(id));
    if (index === -1) throw new Error('Expense not found');
    const newExpense = { ...updatedExpense, id: Number(id) };
    data[index] = newExpense;
    localDb.save(data, userEmail);
    return newExpense;
  },
  delete: (id, userEmail = '') => {
    const data = localDb.get(userEmail);
    const filtered = data.filter(e => e.id !== Number(id));
    localDb.save(filtered, userEmail);
    return true;
  }
};

// API Services
export const expenseService = {
  // Test connection to Spring Boot backend
  testConnection: async () => {
    try {
      await axios.get(`${API_BASE_URL}/expenses`, { timeout: 2000 });
      return true;
    } catch (error) {
      console.warn('Backend server is unreachable, falling back to LocalStorage demo mode.', error.message);
      return false;
    }
  },

  // GET all expenses
  getAll: async (useMock = false, userEmail = '') => {
    if (useMock) {
      return localDb.get(userEmail);
    }
    const response = await apiClient.get('/expenses', {
      headers: { 'X-User-Email': userEmail }
    });
    return response.data;
  },

  // POST new expense
  create: async (expense, useMock = false, userEmail = '') => {
    if (useMock) {
      return localDb.add(expense, userEmail);
    }
    const response = await apiClient.post('/expenses', expense, {
      headers: { 'X-User-Email': userEmail }
    });
    return response.data;
  },

  // PUT update expense
  update: async (id, expense, useMock = false, userEmail = '') => {
    if (useMock) {
      return localDb.update(id, expense, userEmail);
    }
    const response = await apiClient.put(`/expenses/${id}`, expense, {
      headers: { 'X-User-Email': userEmail }
    });
    return response.data;
  },

  // DELETE expense
  delete: async (id, useMock = false, userEmail = '') => {
    if (useMock) {
      return localDb.delete(id, userEmail);
    }
    const response = await apiClient.delete(`/expenses/${id}`, {
      headers: { 'X-User-Email': userEmail }
    });
    return response.data;
  }
};

export default expenseService;
