import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useNotificationStore } from "./stores/notificationStore";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MedicineList from "./pages/MedicineList";
import MedicineForm from "./pages/MedicineForm";
import ScheduleView from "./pages/ScheduleView";
import DoseHistory from "./pages/DoseHistory";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import NotificationCenter from "./pages/NotificationCenter";
import Settings from "./pages/Settings";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import NotFound from "./pages/NotFound";

// Layout
import Layout from "./components/Layout";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Load user settings and notifications when authenticated
    if (isAuthenticated && user) {
      fetchSettings(user.id);
      fetchNotifications(user.id);
    }
  }, [isAuthenticated, user, fetchSettings, fetchNotifications]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Medicine Management Routes */}
              <Route path="medicines" element={<MedicineList />} />
              <Route path="medicines/new" element={<MedicineForm />} />
              <Route path="medicines/:id/edit" element={<MedicineForm />} />
              <Route path="medicines/:medicineId/schedule" element={<ScheduleView />} />
              
              {/* Prescription Routes */}
              <Route path="prescriptions/upload" element={<PrescriptionUpload />} />
              
              {/* History and Analytics */}
              <Route path="history" element={<DoseHistory />} />
              
              {/* Caregiver Routes */}
              <Route path="caregiver" element={<CaregiverDashboard />} />
              
              {/* Settings and Notifications */}
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<NotificationCenter />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
