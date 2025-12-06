
import React, { useState, useCallback } from 'react';
import { User, Role, SubscriptionTier, View } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import DjProfilePage from './components/DjProfilePage';
import DjDashboardPage from './components/dj/DjDashboardPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import PricingPage from './components/PricingPage';
import AuthModal from './components/auth/AuthModal';
import UserDashboardPage from './components/user/UserDashboardPage';
import CityPage from './components/CityPage';
import BlogList from './components/blog/BlogList';
import BlogPostPage from './components/blog/BlogPost';
import { Toast, ToastMessage } from './components/ui/Toast';
import CursorPianoEffect from './components/ui/CursorPianoEffect';
import { loginUser, registerUser } from './services/mockApiService';

// NEW: Import Sound System
import { SoundProvider } from './contexts/SoundContext';
import SoundToggle from './components/ui/SoundToggle';
import ChatBot from './components/ChatBot';
import VoiceAgentCall from './components/VoiceAgentCall';

interface AuthModalConfig {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  initialRole?: Role;
  initialPlan?: SubscriptionTier;
  timestamp?: number;
}

function App() {
  const [view, setView] = useState<View>({ page: 'home' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalConfig, setAuthModalConfig] = useState<AuthModalConfig>({ isOpen: false });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Memoize showToast to avoid infinite re-render loops in consumers
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = async (email: string, password_param: string): Promise<User> => {
    try {
      const user = await loginUser(email, password_param);
      setCurrentUser(user);
      setAuthModalConfig({ isOpen: false });
      showToast('Authentication verified.', 'success');
      
      if (user.role === Role.DJ) setView({ page: 'dj-dashboard' });
      else if (user.role === Role.ADMIN) setView({ page: 'admin-dashboard' });
      else if (user.role === Role.CUSTOMER) setView({ page: 'user-dashboard' });
      else setView({ page: 'home' });
      return user;
    } catch (error: any) {
      showToast(error.message || 'Authentication failed.', 'error');
      throw error;
    }
  };

  const handleRegister = async (name: string, email: string, password_param: string, role: Role, location?: { lat: number, lon: number }, plan?: SubscriptionTier, state?: string, city?: string): Promise<User> => {
     try {
      const newUser = await registerUser(name, email, password_param, role, location, plan, state, city);
      setAuthModalConfig({ isOpen: false });
      setCurrentUser(newUser);

      if (newUser.role === Role.DJ) {
        showToast('Artist profile created successfully.', 'success');
        setView({ page: 'dj-dashboard' });
      } else {
        showToast('User account active.', 'success');
        setView({ page: 'user-dashboard' });
      }
      return newUser;

    } catch (error: any) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ page: 'home' });
    showToast('Session terminated.', 'success');
  };
  
  const openAuthModal = (initialTab: 'login' | 'register' = 'login', initialRole: Role = Role.CUSTOMER, plan?: SubscriptionTier) => {
    setAuthModalConfig({ 
        isOpen: true, 
        initialTab, 
        initialRole, 
        initialPlan: plan, 
        timestamp: Date.now() 
    });
  };

  const authProps = {
    currentUser,
    logout: handleLogout,
    openLoginModal: () => openAuthModal('login', Role.CUSTOMER),
    setView,
  };

  return (
    <SoundProvider>
      <div className="min-h-screen font-sans text-white selection:bg-brand-cyan selection:text-black">
        {/* Only render the Piano Effect on the Home Page */}
        {view.page === 'home' && <CursorPianoEffect />}
        
        {/* Global Sound Toggle */}
        <SoundToggle />
        
        {/* AI Assistants */}
        <ChatBot />
        <VoiceAgentCall />

        <Header auth={authProps} setView={setView} />
        <main>
          {view.page === 'home' && <HomePage setView={setView} />}
          {view.page === 'search' && <SearchPage setView={setView} />}
          {view.page === 'pricing' && <PricingPage setView={setView} openRegisterModal={(plan) => openAuthModal('register', Role.DJ, plan)} />}
          {view.page === 'city' && view.cityParam && <CityPage city={view.cityParam} setView={setView} />}
          {view.page === 'blog' && <BlogList setView={setView} />}
          {view.page === 'blog-post' && view.slug && <BlogPostPage slug={view.slug} setView={setView} />}
          
          {/* Dashboard Routes */}
          {view.page === 'dj-dashboard' && (
              currentUser?.role === Role.DJ && currentUser.djProfileId ? 
              <DjDashboardPage key={currentUser.id} djId={currentUser.djProfileId} setView={setView} showToast={showToast} /> : 
              <HomePage setView={setView} /> 
          )}
          {view.page === 'user-dashboard' && (
              currentUser?.role === Role.CUSTOMER ?
              <UserDashboardPage key={currentUser.id} currentUser={currentUser} setView={setView} /> :
              <HomePage setView={setView} />
          )}
          {view.page === 'admin-dashboard' && (
              currentUser?.role === Role.ADMIN ? 
              <AdminDashboardPage key={currentUser.id} setView={setView} showToast={showToast} /> : 
              <HomePage setView={setView} /> 
          )}

          {/* Dynamic Profile Route */}
          {view.page === 'profile' && view.slug && (
              <DjProfilePage slug={view.slug} setView={setView} currentUser={currentUser} showToast={showToast} openLoginModal={authProps.openLoginModal} />
          )}

        </main>
        <Footer setView={setView} />
        
        {authModalConfig.isOpen && (
            <AuthModal 
              key={authModalConfig.timestamp}
              closeModal={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
              onLogin={handleLogin}
              onRegister={handleRegister}
              initialTab={authModalConfig.initialTab}
              initialRole={authModalConfig.initialRole}
              initialPlan={authModalConfig.initialPlan}
            />
        )}
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </SoundProvider>
  );
}

export default App;
