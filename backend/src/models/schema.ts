import mongoose, { Document, Schema } from 'mongoose';

// Reservation
export interface IReservation extends Document {
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  revenue: number;
  status: 'upcoming' | 'active' | 'completed';
}
const ReservationSchema = new Schema<IReservation>({
  guestName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  revenue: { type: Number, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' }
}, { timestamps: true });
export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);

// Social Post
export interface IPost extends Document {
  idea: string;
  platform: string;
  status: 'idea' | 'planned' | 'published';
  scheduledDate?: Date;
}
const PostSchema = new Schema<IPost>({
  idea: { type: String, required: true },
  platform: { type: String, required: true },
  status: { type: String, enum: ['idea', 'planned', 'published'], default: 'idea' },
  scheduledDate: { type: Date }
}, { timestamps: true });
export const Post = mongoose.model<IPost>('Post', PostSchema);

// Expense
export interface IExpense extends Document {
  description: string;
  amount: number;
  category: 'cleaning' | 'maintenance' | 'supplies' | 'other';
  date: Date;
}
const ExpenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['cleaning', 'maintenance', 'supplies', 'other'], required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);

// Task
export interface ITask extends Document {
  title: string;
  description?: string;
  category: 'maintenance' | 'fix' | 'improvement';
  status: 'pending' | 'in_progress' | 'completed';
}
const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['maintenance', 'fix', 'improvement'], required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }
}, { timestamps: true });
export const Task = mongoose.model<ITask>('Task', TaskSchema);
