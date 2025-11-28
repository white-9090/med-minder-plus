import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, Pill, Calendar, Settings, Users, FileText, History } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSettingsStore } from '../stores/settingsStore';
import { cn } from '../lib/utils';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { settings } = useSettingsStore();

  const isElderlyMode = settings?.elderlyMode || false;

  const patientNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Pill, label: 'Medicines', path: '/medicines' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: FileText, label: 'Prescriptions', path: '/prescriptions' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const caregiverNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/caregiver' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const navItems = user?.role === 'PATIENT' ? patientNavItems : caregiverNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      isElderlyMode && "text-lg"
    )}>
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className={cn(
                "font-bold text-gray-900",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                MedMinder+
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size={isElderlyMode ? "lg" : "sm"}
                className="relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className={cn(
                  "text-gray-600",
                  isElderlyMode ? "h-6 w-6" : "h-5 w-5"
                )} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-gray-700",
                  isElderlyMode ? "text-lg" : "text-sm"
                )}>
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size={isElderlyMode ? "lg" : "sm"}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <nav className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200">
          <div className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isElderlyMode && "h-12 text-lg",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className={cn(
                    "mr-3",
                    isElderlyMode ? "h-6 w-6" : "h-4 w-4"
                  )} />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col h-auto py-2 px-1",
                  isActive && "text-blue-600"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="md:hidden h-16" />
    </div>
  );
};

export default Layout;