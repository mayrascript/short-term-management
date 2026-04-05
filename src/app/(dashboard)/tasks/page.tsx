"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Circle, PlusCircle } from "lucide-react";
import { apiRequest } from "@/lib/clientApi";
import type { Task } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("maintenance");

  const fetchTasks = async () => {
    try {
      const data = await apiRequest<Task[]>("/tasks");
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      await apiRequest<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, category }),
      });
      setTitle("");
      fetchTasks();
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  const toggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await apiRequest(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task", error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Property Tasks</h1>
        <p className="page-subtitle">Manage maintenance, fixes, and property improvements.</p>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label className="form-label">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="maintenance">Maintenance</option>
              <option value="fix">Fix</option>
              <option value="improvement">Improvement</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "42px" }}>
            <PlusCircle size={18} /> Add Task
          </button>
        </form>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: "minmax(300px, 1fr)" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Task List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tasks.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No tasks pending! Fantastic.</p> : null}
              {tasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    backgroundColor: task.status === "completed" ? "var(--sidebar-hover)" : "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => toggleStatus(task)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: task.status === "completed" ? "var(--success)" : "var(--text-muted)",
                      }}
                    >
                      {task.status === "completed" ? <CheckCircle2 /> : <Circle />}
                    </button>
                    <span
                      style={{
                        fontWeight: 500,
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                        color: task.status === "completed" ? "var(--text-muted)" : "var(--text-color)",
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className={`badge badge-${task.category === "fix" ? "warning" : "neutral"}`}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

