import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Reservation, Post, Expense, Task, ExpenseCategory } from './models/schema';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/short_term_rental';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

type ExpensePayloadResult =
  | {
      ok: true;
      payload: {
        description: string;
        amount: number;
        category: string;
        currency: 'COP' | 'USD';
        comment?: string;
        receiptUrl?: string;
        tags: string[];
        date?: unknown;
      };
    }
  | { ok: false; status: number; error: string };

const buildExpensePayload = (rawBody: unknown): ExpensePayloadResult => {
  const body = (rawBody ?? {}) as Record<string, unknown>;
  const description = String(body.description ?? '').trim();
  const amount = Number(body.amount);
  const category = String(body.category ?? '').trim();
  const currency = String(body.currency ?? 'COP').toUpperCase();
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const receiptUrl = typeof body.receiptUrl === 'string' ? body.receiptUrl.trim() : '';
  const tags = Array.isArray(body.tags)
    ? body.tags
        .filter((tag: unknown): tag is string => typeof tag === 'string')
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : [];

  if (!description || !category || Number.isNaN(amount)) {
    return { ok: false, status: 400, error: 'description, amount and category are required' };
  }

  if (currency !== 'COP' && currency !== 'USD') {
    return { ok: false, status: 400, error: 'currency must be COP or USD' };
  }

  if (receiptUrl && !isValidHttpUrl(receiptUrl)) {
    return { ok: false, status: 400, error: 'receiptUrl must be a valid http/https URL' };
  }

  return {
    ok: true,
    payload: {
      description,
      amount,
      category,
      currency,
      comment: comment || undefined,
      receiptUrl: receiptUrl || undefined,
      tags,
      date: body.date
    }
  };
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// =======================
// ROUTES
// =======================

// --- Dashboard / Reservations ---
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ checkIn: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const newRes = new Reservation(req.body);
    await newRes.save();
    res.status(201).json(newRes);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Social Posts ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Finances (Expenses) ---
app.get('/api/expense-categories', async (_req, res) => {
  try {
    const categories = await ExpenseCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/expense-categories', async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = slugify(name);
    if (!slug) {
      return res.status(400).json({ error: 'Invalid category name' });
    }

    const existing = await ExpenseCategory.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = new ExpenseCategory({ name, slug });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const { startDate, endDate, includeDeleted } = req.query;
    const filter: Record<string, unknown> = {};
    if (includeDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      // Include legacy documents that don't have isDeleted yet.
      filter.isDeleted = { $ne: true };
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate as string + 'T23:59:59.999Z');
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const parsed = buildExpensePayload(req.body);
    if (!parsed.ok) {
      return res.status(parsed.status).json({ error: parsed.error });
    }

    const newExpense = new Expense({
      ...parsed.payload,
      isDeleted: false
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const parsed = buildExpensePayload(req.body);
    if (!parsed.ok) {
      return res.status(parsed.status).json({ error: parsed.error });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      parsed.payload,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(deletedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.patch('/api/expenses/:id/restore', async (req, res) => {
  try {
    const restoredExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!restoredExpense) {
      return res.status(404).json({ error: 'Expense not found in trash' });
    }

    res.json(restoredExpense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// --- Tasks ---
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
