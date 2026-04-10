"use client";

import { useEffect, useState } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/clientApi";
import type { Reservation } from "@/lib/types";

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await apiRequest<Reservation[]>("/reservations");
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const totalRevenue = reservations.reduce((sum, reservation) => sum + reservation.revenue, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening with your property.</p>
        <div style={{ marginTop: "16px" }}>
          <Button>Shadcn ready</Button>
        </div>
      </div>

      <div className="grid-cards">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ padding: "10px", backgroundColor: "#e0e7ff", borderRadius: "8px", color: "#4f46e5" }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Total Revenue</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ padding: "10px", backgroundColor: "#d1fae5", borderRadius: "8px", color: "#059669" }}>
              <Calendar size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Total Bookings</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{reservations.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Recent & Upcoming Reservations</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td style={{ fontWeight: 500 }}>{reservation.guestName}</td>
                      <td>{new Date(reservation.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(reservation.checkOut).toLocaleDateString()}</td>
                      <td>${reservation.revenue}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            reservation.status === "upcoming"
                              ? "warning"
                              : reservation.status === "active"
                                ? "primary"
                                : "success"
                          }`}
                        >
                          {reservation.status}
                        </span>
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
  );
}
