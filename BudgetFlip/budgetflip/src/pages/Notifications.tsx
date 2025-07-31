import { useState } from 'react';
import { Bell, MessageCircle, UserCheck, CheckCircle } from 'lucide-react';

type NotificationType = 'all' | 'unread' | 'mentioned' | 'assigned';

interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'update' | 'completion';
  title: string;
  message: string;
  project: string;
  time: string;
  isRead: boolean;
  user: {
    name: string;
    initials: string;
    color: string;
  };
}

export function Notifications() {
  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned in a comment',
      message: 'Anthony mentioned you in Kitchen Cabinet Installation',
      project: 'Jersey City Renovation',
      time: '2h ago',
      isRead: false,
      user: { name: 'Anthony Sandoval', initials: 'AS', color: 'bg-pink-500' }
    },
    {
      id: '2',
      type: 'assignment',
      title: 'New task assigned to you',
      message: 'Bathroom Tile Purchase has been assigned to you',
      project: 'Brooklyn Townhouse',
      time: '4h ago',
      isRead: false,
      user: { name: 'John Doe', initials: 'JD', color: 'bg-blue-500' }
    },
    {
      id: '3',
      type: 'completion',
      title: 'Task completed',
      message: 'Electrical Work Complete has been marked as done',
      project: 'Bronx Apartment',
      time: '1d ago',
      isRead: true,
      user: { name: 'Emily Davis', initials: 'ED', color: 'bg-yellow-500' }
    },
    {
      id: '4',
      type: 'update',
      title: 'Budget updated',
      message: 'Paint Living Room budget has been updated to $1,200',
      project: 'Queens Duplex',
      time: '2d ago',
      isRead: true,
      user: { name: 'Sarah Smith', initials: 'SS', color: 'bg-green-500' }
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'assignment': return <UserCheck className="w-4 h-4 text-orange-500" />;
      case 'completion': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'update': return <Bell className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const filterNotifications = (notifications: Notification[], filter: NotificationType) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'mentioned':
        return notifications.filter(n => n.type === 'mention');
      case 'assigned':
        return notifications.filter(n => n.type === 'assignment');
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications(notifications, activeFilter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const FilterTab = ({ filter, label, count }: { filter: NotificationType; label: string; count?: number }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
        activeFilter === filter
          ? 'border-primary-500 text-primary-500'
          : 'border-gray-200 text-gray-500'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
          activeFilter === filter ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
      !notification.isRead ? 'border-l-4 border-l-primary-500' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${notification.user.color} rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
          {notification.user.initials}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getNotificationIcon(notification.type)}
            <h3 className="font-medium text-gray-900 text-sm truncate">{notification.title}</h3>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{notification.project}</span>
            <span className="text-xs text-gray-500">{notification.time}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 md:bg-background-secondary">
      <div className="max-w-md mx-auto bg-gray-100 md:bg-background-secondary px-4 py-6 md:hidden">
        {/* Filter Tabs */}
        <div className="flex mb-6 -mx-4 px-4 bg-white border-b border-gray-200">
          <FilterTab filter="all" label="All" />
          <FilterTab filter="unread" label="Unread" count={unreadCount} />
          <FilterTab filter="mentioned" label="I was mentioned" />
          <FilterTab filter="assigned" label="Assigned" />
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 mb-6">No new notifications to show</p>
            <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Desktop fallback */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
            <p className="text-gray-600">This page is optimized for mobile. Please view on a mobile device for the best experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}