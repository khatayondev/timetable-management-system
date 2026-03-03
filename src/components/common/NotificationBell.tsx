import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Clock, MapPin, BookOpen, CheckCheck } from 'lucide-react';
import { useReminders, Notification, EventType } from '../../context/ReminderContext';
import { useAuth } from '../../context/AuthContext';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { notifications, getNotificationsForUser, markNotificationAsRead } = useReminders();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = user ? getNotificationsForUser(user.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
  };

  const markAllAsRead = () => {
    userNotifications.forEach(n => {
      if (!n.read) {
        markNotificationAsRead(n.id);
      }
    });
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'LECTURE':
        return <BookOpen className="w-4 h-4" />;
      case 'EXAM':
        return <Clock className="w-4 h-4" />;
      case 'INVIGILATION':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'LECTURE':
        return 'bg-blue-100 text-blue-600';
      case 'EXAM':
        return 'bg-red-100 text-red-600';
      case 'INVIGILATION':
        return 'bg-purple-100 text-purple-600';
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF]">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-white/90 hover:text-white flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {userNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {userNotifications.slice(0, 20).map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${getEventColor(notification.type)}`}>
                        {getEventIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[#4F4F4F] text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-line line-clamp-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.scheduledFor)}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.channel.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {userNotifications.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-center text-xs text-gray-500">
                Showing {Math.min(userNotifications.length, 20)} of {userNotifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
