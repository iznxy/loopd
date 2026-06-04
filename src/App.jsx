import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeContext';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// App layout + pages
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Record from '@/pages/Record';
import Post from '@/pages/Post';
import Profile from '@/pages/Profile';
import Earn from '@/pages/Earn';
import Messages from '@/pages/Messages';
import ChatWindow from '@/pages/ChatWindow';
import Notifications from '@/pages/Notifications';
import CreatorProfile from '@/pages/CreatorProfile';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Privacy from '@/pages/Privacy';
import Help from '@/pages/Help';
import NotifSettings from '@/pages/NotifSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl font-display" style={{ color: "#00c896" }}>Loopd</div>
          <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* Full-screen routes (no bottom nav) */}
        <Route path="/record" element={<Record />} />
        <Route path="/post" element={<Post />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:conversationId" element={<ChatWindow />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/creator/:username" element={<CreatorProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/notif-settings" element={<NotifSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;