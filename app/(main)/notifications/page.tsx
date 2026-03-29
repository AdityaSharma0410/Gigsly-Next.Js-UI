'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useAuth';
import { useNotification } from '@/lib/contexts/NotificationContext';
import { chatApi } from '@/lib/api';
import { Bell, MessageSquare, Trash2, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  useRequireAuth();
  const { notifications, removeNotification } = useNotification();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [loadingUnread, setLoadingUnread] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingUnread(true);
        const count = await chatApi.getUnreadCount();
        if (!cancelled) setUnreadMessages(Number.isFinite(count) ? count : 0);
      } catch {
        if (!cancelled) setUnreadMessages(0);
      } finally {
        if (!cancelled) setLoadingUnread(false);
      }
    };

    load();
    const t = window.setInterval(load, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  const hasNotifications = notifications.length > 0;
  const sortedNotifications = useMemo(() => [...notifications].reverse(), [notifications]);

  const clearAll = () => {
    for (const n of notifications) removeNotification(n.id);
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Updates, alerts, and message status.
            </p>
          </div>
          {hasNotifications && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        <div className="grid gap-6">
          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>

            {loadingUnread ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking unread messages…
              </div>
            ) : unreadMessages > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    You have <span className="text-blue-600 font-bold">{unreadMessages}</span> unread message{unreadMessages === 1 ? '' : 's'}.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Open chat to reply and mark them as read.
                  </p>
                </div>
                <Link
                  href="/chat"
                  className="px-5 py-2.5 rounded-xl gradient-hero text-white font-semibold hover:opacity-90"
                >
                  Go to chat
                </Link>
              </div>
            ) : (
              <div>
                <p className="font-medium">You’re all caught up.</p>
                <p className="text-sm text-muted-foreground">No unread messages right now.</p>
              </div>
            )}
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Recent notifications</h2>
            </div>

            {!hasNotifications ? (
              <div className="text-center py-12">
                <Bell className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  When something needs your attention, it will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between gap-4 border border-border rounded-xl p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            n.type === 'success'
                              ? 'bg-green-600/10 text-green-700 border-green-600/20'
                              : n.type === 'error'
                              ? 'bg-red-600/10 text-red-700 border-red-600/20'
                              : 'bg-blue-600/10 text-blue-700 border-blue-600/20'
                          }`}
                        >
                          {n.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium break-words">{n.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNotification(n.id)}
                      className="flex-shrink-0 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

