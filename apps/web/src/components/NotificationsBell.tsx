import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  metadata?: any;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notificaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_BASE_URL}/notificaciones/marcar-leidas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: notification.id })
        });

        // Update local state
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Navigate based on type/metadata if needed
    if (notification.type === 'agenda') {
      navigate('/agenda');
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/notificaciones/marcar-todas-leidas`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="notif-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "1.2rem",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            backgroundColor: "#ef4444",
            color: "white",
            fontSize: "0.6rem",
            fontWeight: "bold",
            borderRadius: "50%",
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white"
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notif-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            width: "320px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            zIndex: 1000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px"
          }}
        >
          <div
            className="notif-header"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              color: "#1e293b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8fafc"
            }}
          >
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Marcar leídas
              </button>
            )}
          </div>

          <div className="notif-body" style={{ overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                No hay notificaciones.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                    backgroundColor: notif.read ? "white" : "#eff6ff",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.read ? "#f8fafc" : "#e0f2fe"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? "white" : "#eff6ff"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "0.85rem",
                      fontWeight: notif.read ? 500 : 700,
                      color: "#1e293b"
                    }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.4" }}>
                    {notif.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
