export interface Reservation {
  _id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  revenue: number;
  status: "upcoming" | "active" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  idea: string;
  platform: string;
  status: "idea" | "planned" | "published";
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: "maintenance" | "fix" | "improvement";
  status: "pending" | "in_progress" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  comment?: string;
  tags: string[];
  currency: "COP" | "USD";
  receiptUrl?: string;
  date: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

