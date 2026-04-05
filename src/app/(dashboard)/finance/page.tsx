"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { apiRequest } from "@/lib/clientApi";
import type { Expense, ExpenseCategory } from "@/lib/types";

const DEFAULT_CATEGORIES = ["Cleaning", "Maintenance", "Supplies", "Other"];

export default function FinancePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrash, setShowTrash] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");

  // Edit Form State
  const [editDescription, setEditDescription] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCurrency, setEditCurrency] = useState<"COP" | "USD">("COP");
  const [editReceiptUrl, setEditReceiptUrl] = useState("");
  const [editDate, setEditDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [editMessage, setEditMessage] = useState("");

  // Filter State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterActive, setFilterActive] = useState(false);

  // FX State
  const [usdToCopRate, setUsdToCopRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState("");
  const [targetCurrency, setTargetCurrency] = useState<"COP" | "USD">("COP");

  const availableCategoryNames = categories.length > 0 ? categories.map((item) => item.name) : DEFAULT_CATEGORIES;

  const formatMoney = (value: number, unit: "COP" | "USD") =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: unit, maximumFractionDigits: 2 }).format(value);

  const fetchExpenses = async (useFilter = filterActive, useTrashView = showTrash) => {
    try {
      const params = new URLSearchParams();
      if (useFilter && startDate) params.set("startDate", startDate);
      if (useFilter && endDate) params.set("endDate", endDate);
      if (useTrashView) params.set("includeDeleted", "true");
      const query = params.toString();
      const data = await apiRequest<Expense[]>(`/expenses${query ? `?${query}` : ""}`);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiRequest<ExpenseCategory[]>("/expense-categories");
      setCategories(data);
      if (data.length > 0) {
        const names = data.map((item) => item.name);
        if (!names.includes(category)) {
          setCategory(names[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching expense categories", error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      setRateError("");
      const response = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { rates?: { COP?: number } };
      if (!payload?.rates?.COP) throw new Error("Missing COP rate");
      setUsdToCopRate(Number(payload.rates.COP));
    } catch (error) {
      console.error("Error fetching exchange rate", error);
      setRateError("No se pudo actualizar la tasa de cambio. Mostrando totales por moneda.");
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchExchangeRate();
  }, []);

  const resetCreateForm = () => {
    setDescription("");
    setComment("");
    setTagsInput("");
    setAmount("");
    setCategory(availableCategoryNames[0] ?? DEFAULT_CATEGORIES[0]);
    setCurrency("COP");
    setReceiptUrl("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpenseId(expense._id);
    setEditDescription(expense.description);
    setEditComment(expense.comment ?? "");
    setEditTagsInput(expense.tags?.join(", ") ?? "");
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditCurrency(expense.currency ?? "COP");
    setEditReceiptUrl(expense.receiptUrl ?? "");
    setEditDate(new Date(expense.date).toISOString().split("T")[0]);
    setEditMessage("");
  };

  const resetEditForm = () => {
    setEditingExpenseId(null);
    setEditDescription("");
    setEditComment("");
    setEditTagsInput("");
    setEditAmount("");
    setEditCategory("");
    setEditCurrency("COP");
    setEditReceiptUrl("");
    setEditDate(new Date().toISOString().split("T")[0]);
    setEditMessage("");
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!description || !amount) return;
    const tags = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await apiRequest<Expense>("/expenses", {
        method: "POST",
        body: JSON.stringify({
          description,
          comment,
          tags,
          amount: Number(amount),
          category,
          currency,
          receiptUrl: receiptUrl.trim() || undefined,
          date: new Date(`${date}T12:00:00`).toISOString(),
        }),
      });
      setFormMessage("Expense creada correctamente.");
      resetCreateForm();
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense", error);
      setFormMessage("No se pudo crear la expense.");
    }
  };

  const handleUpdateExpense = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingExpenseId || !editDescription || !editAmount || !editCategory) return;

    const tags = editTagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await apiRequest<Expense>(`/expenses/${editingExpenseId}`, {
        method: "PUT",
        body: JSON.stringify({
          description: editDescription,
          comment: editComment,
          tags,
          amount: Number(editAmount),
          category: editCategory,
          currency: editCurrency,
          receiptUrl: editReceiptUrl.trim() || undefined,
          date: new Date(`${editDate}T12:00:00`).toISOString(),
        }),
      });
      resetEditForm();
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense", error);
      setEditMessage("No se pudo actualizar la expense.");
    }
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const existing = availableCategoryNames.find((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setCategory(existing);
      setCategoryMessage("Esa categoría ya existe.");
      return;
    }

    try {
      const created = await apiRequest<ExpenseCategory>("/expense-categories", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCategory(created.name);
      setNewCategoryName("");
      setCategoryMessage("Categoría agregada.");
      if (editingExpenseId) setEditCategory(created.name);
    } catch (error) {
      console.error("Error creating category", error);
      setCategoryMessage("No se pudo agregar la categoría.");
    }
  };

  const convertAmount = (value: number, from: "COP" | "USD", to: "COP" | "USD") => {
    if (from === to) return value;
    if (!usdToCopRate) return null;
    if (from === "USD" && to === "COP") return value * usdToCopRate;
    if (from === "COP" && to === "USD") return value / usdToCopRate;
    return null;
  };

  const totalsByCurrency = expenses.reduce(
    (acc, expense) => {
      const unit = expense.currency ?? "COP";
      acc[unit] += expense.amount;
      return acc;
    },
    { COP: 0, USD: 0 }
  );

  const totalConverted = (() => {
    let total = 0;
    for (const expense of expenses) {
      const fromCurrency = expense.currency ?? "COP";
      const converted = convertAmount(expense.amount, fromCurrency, targetCurrency);
      if (converted === null) return null;
      total += converted;
    }
    return total;
  })();

  const handleSoftDelete = async (expenseId: string) => {
    const confirmed = window.confirm("¿Seguro que quieres enviar esta expense a la papelera?");
    if (!confirmed) return;

    try {
      await apiRequest<Expense>(`/expenses/${expenseId}`, { method: "DELETE" });
      if (editingExpenseId === expenseId) resetEditForm();
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  const handleRestore = async (expenseId: string) => {
    try {
      await apiRequest<Expense>(`/expenses/${expenseId}/restore`, { method: "PATCH" });
      if (editingExpenseId === expenseId) resetEditForm();
      fetchExpenses();
    } catch (error) {
      console.error("Error restoring expense", error);
    }
  };

  const handleToggleTrash = async () => {
    const nextTrash = !showTrash;
    setShowTrash(nextTrash);
    resetEditForm();
    await fetchExpenses(filterActive, nextTrash);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Finance</h1>
        <p className="page-subtitle">Track cleaning, maintenance, and other property expenses.</p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: "minmax(300px, 1fr) 2fr" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Add Expense</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Weekly Cleaning"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comment / Notes</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Optional details..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="urgent, guest-related, monthly"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select value={currency} onChange={(event) => setCurrency(event.target.value as "COP" | "USD")}>
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {availableCategoryNames.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">New Category</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="e.g. Utilities"
                />
                <button type="button" className="btn" onClick={handleCreateCategory}>
                  Add
                </button>
              </div>
              {categoryMessage && (
                <p style={{ marginTop: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>{categoryMessage}</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Receipt URL</label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(event) => setReceiptUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              <PlusCircle size={18} /> Add Expense
            </button>
            {formMessage && (
              <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>{formMessage}</p>
            )}
          </form>

          {editingExpenseId && (
            <div style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Edit Expense</h3>
              <form onSubmit={handleUpdateExpense}>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment / Notes</label>
                  <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input type="text" value={editTagsInput} onChange={(event) => setEditTagsInput(event.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" step="0.01" value={editAmount} onChange={(event) => setEditAmount(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select value={editCurrency} onChange={(event) => setEditCurrency(event.target.value as "COP" | "USD")}>
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} required>
                    {availableCategoryNames.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Receipt URL</label>
                  <input
                    type="url"
                    value={editReceiptUrl}
                    onChange={(event) => setEditReceiptUrl(event.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save Changes
                  </button>
                  <button type="button" className="btn" onClick={resetEditForm}>
                    Cancel
                  </button>
                </div>
                {editMessage && (
                  <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>{editMessage}</p>
                )}
              </form>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Expense Ledger</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={handleToggleTrash}>
                {showTrash ? "Back to active" : "Show trash"}
              </button>
              <select value={targetCurrency} onChange={(event) => setTargetCurrency(event.target.value as "COP" | "USD")}>
                <option value="COP">Total in COP</option>
                <option value="USD">Total in USD</option>
              </select>
              <div style={{ fontWeight: 600, color: "var(--danger)" }}>
                {totalConverted !== null
                  ? `Total: ${formatMoney(totalConverted, targetCurrency)}`
                  : `Total: ${formatMoney(totalsByCurrency.COP, "COP")} + ${formatMoney(totalsByCurrency.USD, "USD")}`}
              </div>
            </div>
          </div>
          <p style={{ marginTop: "-6px", marginBottom: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Rates by{" "}
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
              ExchangeRate-API
            </a>
            {usdToCopRate ? ` (1 USD = ${usdToCopRate.toFixed(2)} COP)` : ""}
          </p>
          {rateError && <p style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--warning)" }}>{rateError}</p>}

          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>From:</label>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} style={{ padding: "4px 8px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500 }}>To:</label>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} style={{ padding: "4px 8px" }} />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: "4px 12px", fontSize: "0.85rem" }}
              onClick={() => {
                setFilterActive(true);
                fetchExpenses(true);
              }}
            >
              Filter
            </button>
            {filterActive && (
              <button
                type="button"
                className="btn"
                style={{ padding: "4px 12px", fontSize: "0.85rem" }}
                onClick={() => {
                  setFilterActive(false);
                  fetchExpenses(false);
                }}
              >
                Clear Filter
              </button>
            )}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Tags</th>
                    <th>Comment</th>
                    <th>Receipt</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }}>
                        {showTrash ? "Trash is empty." : "No expenses logged."}
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500 }}>{expense.description}</td>
                        <td>
                          <span className="badge badge-neutral">{expense.category}</span>
                        </td>
                        <td>{expense.tags && expense.tags.length > 0 ? expense.tags.join(", ") : "-"}</td>
                        <td>{expense.comment?.trim() ? expense.comment : "-"}</td>
                        <td>
                          {expense.receiptUrl ? (
                            <a href={expense.receiptUrl} target="_blank" rel="noreferrer">
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ color: "var(--danger)", fontWeight: 500 }}>
                          {formatMoney(expense.amount, expense.currency ?? "COP")}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {showTrash ? (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                onClick={() => handleRestore(expense._id)}
                              >
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                  onClick={() => openEditForm(expense)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                  onClick={() => handleSoftDelete(expense._id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
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
}

