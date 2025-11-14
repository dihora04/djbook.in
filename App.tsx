
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


function App() {
  const [view, setView] = useState<View>({ page: 'home' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (email: string, password_param: string): Promise<User> => {
    try {
      const user = await loginUser(email, password_param);
      setCurrentUser(user);
      setAuthModalOpen(false);
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

  const handleRegister = async (name: string, email: string, password_param: string, role: Role): Promise<User> => {
     try {
      const newUser = await registerUser(name, email, password_param, role);
      setCurrentUser(newUser);
      setAuthModalOpen(false);
      showToast('Registration successful!', 'success');
       // Redirect based on role
      if (newUser.role === Role.DJ) setView({ page: 'dj-dashboard' });
      else if (newUser.role === Role.CUSTOMER) setView({ page: 'user-dashboard' });
      else setView({ page: 'home' });
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
    openLoginModal: () => setAuthModalOpen(true),
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
        return <PricingPage setView={setView} openRegisterModal={() => setAuthModalOpen(true)} />;
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
      {isAuthModalOpen && <AuthModal 
        closeModal={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
