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
import EditPost from '@/pages/EditPost';
import EditProfile from '@/pages/EditProfile';
import ClassicVinesPage from '@/pages/ClassicVines';
import Analytics from '@/pages/Analytics';
import Privacy from '@/pages/Privacy';
import Help from '@/pages/Help';
import NotifSettings from '@/pages/NotifSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
        {/* Animated background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-[#00c896]/20"
              style={{
                width: `${i * 160}px`,
                height: `${i * 160}px`,
                animation: `splashRing ${1 + i * 0.3}s ease-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 z-10" style={{ animation: "splashLogo 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl"
            style={{ background: "linear-gradient(135deg,#00c896,#00a8ff)", boxShadow: "0 0 40px rgba(0,200,150,0.5)" }}
          >
            ∞
          </div>
          <div className="text-white font-bold text-4xl tracking-tight" style={{ textShadow: "0 0 30px rgba(0,200,150,0.6)" }}>
            Loopd
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#00c896]"
                style={{ animation: `dotBounce 0.9s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes splashLogo {
            from { opacity: 0; transform: scale(0.5); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes splashRing {
            0%   { transform: scale(0.6); opacity: 0.6; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(1);   opacity: 0.5; }
            40%            { transform: scale(1.5); opacity: 1; }
          }
        `}</style>
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
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/notif-settings" element={<NotifSettings />} />
        <Route path="/edit-post" element={<EditPost />} />
        <Route path="/classic-vines" element={<ClassicVinesPage />} />
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