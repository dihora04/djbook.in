
import React, { useState } from 'react';
import { View, User, Role } from './types';
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
      showToast('Login successful!', 'success');
      // Redirect based on role
      if (user.role === Role.DJ) setView({ page: 'dj-dashboard' });
      else if (user.role === Role.ADMIN) setView({ page: 'admin-dashboard' });
      else if (user.role === Role.CUSTOMER) setView({ page: 'user-dashboard' });
      else setView({ page: 'home' });
      return user;
    } catch (error: any) {
      showToast(error.message || 'Login failed.', 'error');
      throw error;
    }
  };

  const handleRegister = async (name: string, email: string, password_param: string, role: Role, location?: { lat: number, lon: number }): Promise<User> => {
     try {
      const newUser = await registerUser(name, email, password_param, role, location);
      setAuthModalConfig({ isOpen: false });

      if (newUser.role === Role.DJ) {
        // Don't log them in, they need approval first.
        showToast('Thanks! Your profile is submitted for admin approval.', 'success');
        setView({ page: 'home' });
        // We return the user but don't set it as currentUser
        return newUser;
      }
      
      // For customers, log them in immediately.
      setCurrentUser(newUser);
      showToast('Registration successful!', 'success');
      setView({ page: 'user-dashboard' });
      return newUser;

    } catch (error: any) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ page: 'home' });
    showToast('Logged out successfully.', 'success');
  };

  const authProps = {
    currentUser,
    logout: handleLogout,
    openLoginModal: () => setAuthModalConfig({ isOpen: true, initialTab: 'login', initialRole: Role.CUSTOMER }),
  };

  const openRegisterAsDjModal = () => {
    setAuthModalConfig({ isOpen: true, initialTab: 'register', initialRole: Role.DJ });
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
        return <PricingPage setView={setView} openRegisterModal={openRegisterAsDjModal} />;
      case 'dj-dashboard':
         if (currentUser?.role === Role.DJ && currentUser.djProfileId) {
          return <DjDashboardPage key={currentUser.id} djId={currentUser.djProfileId} setView={setView} showToast={showToast} />;
        }
        // Simple role-based access control
        showToast('You must be logged in as a DJ to view this page.', 'error');
        return <HomePage setView={setView} />;
      case 'admin-dashboard':
        if (currentUser?.role === Role.ADMIN) {
            return <AdminDashboardPage key={currentUser.id} setView={setView} showToast={showToast} />;
        }
        showToast('You do not have permission to view this page.', 'error');
        return <HomePage setView={setView} />;
      case 'user-dashboard':
        if (currentUser?.role === Role.CUSTOMER) {
            return <UserDashboardPage key={currentUser.id} currentUser={currentUser} setView={setView} />;
        }
         showToast('You must be logged in as a customer to view this page.', 'error');
        return <HomePage setView={setView} />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <CursorPianoEffect />
      <Header setView={setView} auth={authProps}/>
      <main>
        {renderContent()}
      </main>
      <Footer setView={setView}/>
      {authModalConfig.isOpen && <AuthModal 
        closeModal={() => setAuthModalConfig({ isOpen: false })}
        onLogin={handleLogin}
        onRegister={handleRegister}
        initialTab={authModalConfig.initialTab}
        initialRole={authModalConfig.initialRole}
      />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
