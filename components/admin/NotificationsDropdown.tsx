"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  read_at?: string;
}

interface NotificationsDropdownProps {
  userId: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?user_id=${userId}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId, fetchNotifications]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?user_id=${userId}&status=unread&limit=1`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchUnreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, status: 'read' as const, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_approved':
        return '✅';
      case 'payment_reminder':
        return '💰';
      case 'stock_alert':
        return '📦';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 glass rounded-premium hover:bg-white/35 transition-all group h-10 w-10 flex items-center justify-center"
      >
        <Bell className="w-4 h-4 text-neutral-700 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white shadow-sm">
            {unreadCount > 9 && (
              <span className="absolute -top-1 -right-1 text-[8px] text-white bg-primary rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 glass-strong rounded-premium shadow-lg border border-white/30 z-50">
          <Card className="p-0">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-neutral-600">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-600">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                        notification.status === 'unread' ? 'bg-primary-50/30' : ''
                      }`}
                      onClick={() => {
                        if (notification.status === 'unread') {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-neutral-200 text-center">
                <button
                  onClick={() => {
                    // Navigate to full notifications page if exists
                    window.location.href = '/admin/notifications';
                  }}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  View all notifications
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

