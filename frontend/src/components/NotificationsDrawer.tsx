import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Bell, X, Check, AlertTriangle, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, setActiveTab } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notificationsOpen) {
      loadNotifications();
    }
  }, [notificationsOpen]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!notificationsOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.4)',
      }}
      onClick={() => setNotificationsOpen(false)}
    >
      <div
        style={{
          position: 'absolute',
          top: '64px',
          right: '1.5rem',
          width: '380px',
          maxHeight: '520px',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
              Alerts & Notifications
            </span>
            {unreadCount > 0 && (
              <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                {unreadCount} New
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                className="btn btn-outline btn-sm"
                onClick={markAllRead}
                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => setNotificationsOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No notifications at this time
            </div>
          ) : (
            notifications.map((n) => {
              const isShortage = n.type === 'shortage_detected';
              const isForecast = n.type === 'forecast_updated';

              return (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid',
                    borderColor: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    if (isShortage) setActiveTab('gaps');
                    else if (isForecast) setActiveTab('forecasts');
                    else setActiveTab('data-sources');
                    setNotificationsOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <div style={{ marginTop: '2px' }}>
                      {isShortage ? (
                        <AlertTriangle size={16} color="#f87171" />
                      ) : isForecast ? (
                        <TrendingUp size={16} color="#38bdf8" />
                      ) : (
                        <ShieldCheck size={16} color="#10b981" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '4px', fontSize: '0.65rem', color: '#64748b' }}>
                        <Clock size={10} />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
