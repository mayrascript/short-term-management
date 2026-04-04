import React, { useEffect, useState } from 'react';
import api from '../api';
import { PlusCircle } from 'lucide-react';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const Finance: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('cleaning');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    try {
      await api.post('/expenses', {
        description,
        amount: Number(amount),
        category
      });
      setDescription('');
      setAmount('');
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense", error);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <p className="page-subtitle">Track cleaning, maintenance, and other property expenses.</p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Add Expense</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Weekly Cleaning" required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <PlusCircle size={18} /> Add Expense
            </button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Expense Ledger</h2>
            <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Total: ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          
          {loading ? <p>Loading...</p> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center'}}>No expenses logged.</td></tr>
                  ) : (
                    expenses.map(exp => (
                      <tr key={exp._id}>
                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500 }}>{exp.description}</td>
                        <td>
                          <span className="badge badge-neutral">{exp.category}</span>
                        </td>
                        <td style={{ color: 'var(--danger)', fontWeight: 500 }}>${exp.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
