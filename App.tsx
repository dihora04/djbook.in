

import React, { useState } from 'react';
import { View, User, Role, SubscriptionTier } from './types';
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
import { Toast, ToastMessage } from './components/ui/Toast';
import CursorPianoEffect from './components/ui/CursorPianoEffect';
import { loginUser, registerUser } from './services/mockApiService';

interface AuthModalConfig {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  initialRole?: Role;
  initialPlan?: SubscriptionTier;
  timestamp?: number; // CRITICAL: Ensures component remounts on every open
}

function App() {
  const [view, setView] = useState<View>({ page: 'home' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalConfig, setAuthModalConfig] = useState<AuthModalConfig>({ isOpen: false });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
  
  // This function forces a hard reset of the modal by updating the timestamp key
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
  };

  const renderContent = () => {
    switch (view.page) {
      case 'home':
        return <HomePage setView={setView} />;
      case 'search':
        return <SearchPage setView={setView} />;
      case 'profile':
        if (view.slug) {
          return <DjProfilePage slug={view.slug} setView={setView} currentUser={currentUser} showToast={showToast} openLoginModal={authProps.openLoginModal}/>;
        }
        return <SearchPage setView={setView} />;
      case 'pricing':
        return <PricingPage setView={setView} openRegisterModal={(plan) => openAuthModal('register', Role.DJ, plan)} />;
      case 'dj-dashboard':
         if (currentUser?.role === Role.DJ && currentUser.djProfileId) {
          return <DjDashboardPage key={currentUser.id} djId={currentUser.djProfileId} setView={setView} showToast={showToast} />;
        }
        showToast('Access Denied. Artist credentials required.', 'error');
        return <HomePage setView={setView} />;
      case 'admin-dashboard':
        if (currentUser?.role === Role.ADMIN) {
            return <AdminDashboardPage key={currentUser.id} setView={setView} showToast={showToast} />;
        }
        showToast('Access Denied. Admin credentials required.', 'error');
        return <HomePage setView={setView} />;
      case 'user-dashboard':
        if (currentUser?.role === Role.CUSTOMER) {
            return <UserDashboardPage key={currentUser.id} currentUser={currentUser} setView={setView} />;
        }
         showToast('Login required to view bookings.', 'error');
        return <HomePage setView={setView} />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-white selection:bg-brand-cyan selection:text-black">
      <CursorPianoEffect />
      <Header setView={setView} auth={authProps}/>
      <main>
        {renderContent()}
      </main>
      <Footer setView={setView}/>
      
      {authModalConfig.isOpen && (
          <AuthModal 
            key={authModalConfig.timestamp} // This ensures a fresh instance every time
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
  );
}

export default App;