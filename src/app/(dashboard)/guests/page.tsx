"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { apiRequest } from "@/lib/clientApi";
import type { Guest, Reservation } from "@/lib/types";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const fetchData = async () => {
    try {
      const [guestsData, reservationsData] = await Promise.all([
        apiRequest<Guest[]>("/guests"),
        apiRequest<Reservation[]>("/reservations"),
      ]);
      setGuests(guestsData);
      setReservations(reservationsData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setFormMessage("");
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await apiRequest<Guest>("/guests", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      setFormMessage("Guest added.");
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating guest", error);
      setFormMessage("Could not add guest.");
    }
  };

  const handleDelete = async (guestId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this guest?");
    if (!confirmed) return;

    try {
      await apiRequest(`/guests/${guestId}`, { method: "DELETE" });
      if (selectedGuest?._id === guestId) {
        dialogRef.current?.close();
        setSelectedGuest(null);
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting guest", error);
    }
  };

  const openDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    dialogRef.current?.showModal();
  };

  const getGuestReservations = (guestName: string) =>
    reservations.filter((r) => r.guestName.toLowerCase() === guestName.toLowerCase());

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Guests</h1>
        <p className="page-subtitle">Manage guest information and view reservation history.</p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: "minmax(300px, 1fr) 2fr" }}>
        {/* Left card: Add Guest form */}
        <div className="card">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Add Guest</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Guest name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              <PlusCircle size={18} /> Save Guest
            </button>
            {formMessage && (
              <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>{formMessage}</p>
            )}
          </form>
        </div>

        {/* Right card: Guest list */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Guest List</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "320px", flex: 1 }}>
              <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Reservations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        {search ? "No guests match your search." : "No guests yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const count = getGuestReservations(guest.name).length;
                      return (
                        <tr key={guest._id}>
                          <td style={{ fontWeight: 500 }}>{guest.name}</td>
                          <td>{guest.email || "-"}</td>
                          <td>{guest.phone || "-"}</td>
                          <td>
                            <span className="badge badge-neutral">{count}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                onClick={() => openDetails(guest)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                onClick={() => handleDelete(guest._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Guest Details Modal */}
      <dialog
        ref={dialogRef}
        style={{
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "560px",
          width: "90vw",
          backgroundColor: "var(--card-bg, #fff)",
          color: "var(--text-primary, #000)",
        }}
        onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        {selectedGuest && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{selectedGuest.name}</h2>
              <button
                type="button"
                className="btn"
                style={{ padding: "4px 12px", fontSize: "0.85rem" }}
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>Email</p>
                <p style={{ fontWeight: 500 }}>{selectedGuest.email || "-"}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>Phone</p>
                <p style={{ fontWeight: 500 }}>{selectedGuest.phone || "-"}</p>
              </div>
            </div>

            {selectedGuest.notes && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>Notes</p>
                <p>{selectedGuest.notes}</p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Reservation History</h3>
              {(() => {
                const guestRes = getGuestReservations(selectedGuest.name);
                if (guestRes.length === 0) {
                  return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No reservations found.</p>;
                }
                return (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Check-in</th>
                          <th>Check-out</th>
                          <th>Revenue</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guestRes.map((r) => (
                          <tr key={r._id}>
                            <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                            <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 500 }}>
                              {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(r.revenue)}
                            </td>
                            <td>
                              <span className={`badge ${r.status === "completed" ? "badge-success" : r.status === "active" ? "badge-warning" : "badge-neutral"}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
