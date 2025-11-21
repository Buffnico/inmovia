import React, { useState } from "react";

type NotificationType = "agenda" | "system" | "task";

interface Notification {
  id: string;
  title: string;
  description?: string;
  timeLabel: string; // "Hace 10 min", "Hoy 17:00", etc.
  type: NotificationType;
  read: boolean;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Visita con comprador 17:00 hs",
      description: "Propiedad en Banfield · Agente: Juan Pérez",
      timeLabel: "Hoy · 16:30 (en 30 min)",
      type: "agenda",
      read: false,
    },
    {
      id: "2",
      title: "Aniversario de mudanza",
      description: "Cliente: Familia González · Hace 1 año",
      timeLabel: "Hoy · 09:00",
      type: "agenda",
      read: false,
    },
    {
      id: "3",
      title: "Recordatorio interno",
      description: "Revisar documentos de reserva antes del viernes.",
      timeLabel: "Ayer · 18:10",
      type: "task",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function togglePanel() {
    console.log("🔔 togglePanel, open pasa a:", !open);
    setOpen((prev) => !prev);
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleClickNotification(id: string) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );
    console.log("🔔 clic en notificación", id);
  }

  function typeLabel(type: NotificationType) {
    if (type === "agenda") return "Agenda";
    if (type === "task") return "Tarea";
    return "Sistema";
  }

  return (
    <div className="notif-bell-wrapper">
      <button
        type="button"
        className="notif-bell-button"
        onClick={togglePanel}
        aria-label="Notificaciones"
      >
        <span className="notif-bell-icon" />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <div>
              <div className="notif-panel-title">Notificaciones</div>
              <div className="notif-panel-subtitle">
                {unreadCount === 0
                  ? "No tenés notificaciones pendientes."
                  : `${unreadCount} notificación${
                      unreadCount === 1 ? "" : "es"
                    } sin leer`}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all"
                onClick={markAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notif-panel-body">
            {notifications.length === 0 ? (
              <p className="notif-empty">
                Todavía no hay movimientos en tu agenda.
              </p>
            ) : (
              <ul className="notif-list">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={
                      "notif-item" + (n.read ? " notif-item--read" : "")
                    }
                    onClick={() => handleClickNotification(n.id)}
                  >
                    <div className="notif-item-main">
                      <div className="notif-item-top">
                        <span className="notif-item-title">{n.title}</span>
                        <span className={`notif-chip notif-chip--${n.type}`}>
                          {typeLabel(n.type)}
                        </span>
                      </div>
                      {n.description && (
                        <div className="notif-item-desc">{n.description}</div>
                      )}
                    </div>
                    <div className="notif-item-meta">{n.timeLabel}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
