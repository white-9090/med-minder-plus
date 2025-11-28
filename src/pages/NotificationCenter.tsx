import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Pill,
  Users,
  MarkAsRead
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { NotificationType } from '../types';
import { cn } from '../lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType
  } = useNotificationStore();
  const { settings } = useSettingsStore();

  const [filterType, setFilterType] = useState<'all' | NotificationType>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const isElderlyMode = settings?.elderlyMode || false;

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        await fetchNotifications(user.id);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user, fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const readMatch = filterRead === 'all' || 
                     (filterRead === 'read' && notification.read) ||
                     (filterRead === 'unread' && !notification.read);
    
    return typeMatch && readMatch;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'DOSE_DUE':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'MISSED_DOSE':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'REFILL_WARNING':
        return <Pill className="h-5 w-5 text-orange-600" />;
      case 'CAREGIVER_ALERT':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'DOSE_DUE':
        return 'Dose Due';
      case 'MISSED_DOSE':
        return 'Missed Dose';
      case 'REFILL_WARNING':
        return 'Refill Warning';
      case 'CAREGIVER_ALERT':
        return 'Caregiver Alert';
      default:
        return 'Notification';
    }
  };

  const getNotificationTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'DOSE_DUE':
        return <Badge className="bg-blue-100 text-blue-800">Dose Due</Badge>;
      case 'MISSED_DOSE':
        return <Badge variant="destructive">Missed</Badge>;
      case 'REFILL_WARNING':
        return <Badge className="bg-orange-100 text-orange-800">Refill</Badge>;
      case 'CAREGIVER_ALERT':
        return <Badge className="bg-purple-100 text-purple-800">Caregiver</Badge>;
      default:
        return <Badge variant="outline">General</Badge>;
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d at h:mm a');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      await clearAllNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={cn(
            "font-bold text-gray-900",
            isElderlyMode ? "text-3xl" : "text-2xl"
          )}>
            Notifications
          </h1>
          <p className={cn(
            "text-gray-600 mt-1",
            isElderlyMode ? "text-lg" : "text-base"
          )}>
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <CheckCircle className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Mark All Read
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className={cn(
                "text-red-600 hover:text-red-700",
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Trash2 className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className={cn(
                  isElderlyMode && "h-12 text-lg"
                )}>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DOSE_DUE">Dose Due</SelectItem>
                  <SelectItem value="MISSED_DOSE">Missed Dose</SelectItem>
                  <SelectItem value="REFILL_WARNING">Refill Warning</SelectItem>
                  <SelectItem value="CAREGIVER_ALERT">Caregiver Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={filterRead} onValueChange={(value: any) => setFilterRead(value)}>
                <SelectTrigger className={cn(
                  isElderlyMode && "h-12 text-lg"
                )}>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <Bell className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className={cn(
                "font-semibold text-gray-900 mb-2",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                {notifications.length === 0 ? 'No Notifications' : 'No Matching Notifications'}
              </h3>
              <p className={cn(
                "text-gray-600",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {notifications.length === 0 
                  ? 'You\'ll see medication reminders and alerts here'
                  : 'Try adjusting your filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    "transition-colors",
                    !notification.read && "border-l-4 border-l-blue-500 bg-blue-50"
                  )}
                >
                  <CardContent className={cn(
                    "p-4",
                    isElderlyMode && "p-6"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={cn(
                              "font-semibold text-gray-900",
                              isElderlyMode ? "text-xl" : "text-lg"
                            )}>
                              {notification.title}
                            </h3>
                            
                            {getNotificationTypeBadge(notification.type)}
                            
                            {!notification.read && (
                              <Badge className="bg-blue-600 text-white">New</Badge>
                            )}
                          </div>
                          
                          <p className={cn(
                            "text-gray-700 mb-2",
                            isElderlyMode ? "text-lg" : "text-base"
                          )}>
                            {notification.message}
                          </p>
                          
                          <p className={cn(
                            "text-gray-500",
                            isElderlyMode ? "text-base" : "text-sm"
                          )}>
                            {formatNotificationDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size={isElderlyMode ? "default" : "sm"}
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <CheckCircle className={cn(
                              "text-green-600",
                              isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                            )} />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size={isElderlyMode ? "default" : "sm"}
                          onClick={() => handleDelete(notification.id)}
                          title="Delete notification"
                        >
                          <Trash2 className={cn(
                            "text-red-500",
                            isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-blue-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {notifications.length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-orange-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {unreadCount}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-red-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {getNotificationsByType('MISSED_DOSE').length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Missed Doses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-purple-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {getNotificationsByType('REFILL_WARNING').length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Refill Alerts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;