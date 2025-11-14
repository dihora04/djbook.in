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
import { MOCK_USERS } from './constants';
import { LoaderIcon } from './components/icons';
import { Toast, ToastMessage } from './components/ui/Toast';
import CursorPianoEffect from './components/ui/CursorPianoEffect';


const UserDashboardPage = () => (
    <div className="pt-24 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-400 mt-4">This is where a customer would see their upcoming and past bookings.</p>
         <div className="bg-brand-surface mt-8 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold">Upcoming Event</h2>
            <p className="mt-2 text-gray-300">Private Party with DJ Rohan</p>
            <p className="text-sm text-gray-500">Tomorrow at Juhu, Mumbai</p>
        </div>
    </div>
);


function App() {
  const [view, setView] = useState<View>({ page: 'home' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  // In a real app, this would be a context provider
  const auth = {
    currentUser,
    login: (user: User) => {
      setCurrentUser(user);
      setAuthModalOpen(false);
      if (user.role === Role.DJ) setView({ page: 'dj-dashboard' });
      else if (user.role === Role.ADMIN) setView({ page: 'admin-dashboard' });
      else if (user.role === Role.CUSTOMER) setView({ page: 'user-dashboard' });
      else setView({ page: 'home' });
    },
    logout: () => {
      setCurrentUser(null);
      setView({ page: 'home' });
    },
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
          return <DjProfilePage slug={view.slug} setView={setView} />;
        }
        return <SearchPage setView={setView} />;
      case 'pricing':
        return <PricingPage setView={setView} />;
      case 'dj-dashboard':
         if (currentUser?.role === Role.DJ && currentUser.djProfileId) {
          return <DjDashboardPage djId={currentUser.djProfileId} setView={setView} showToast={showToast} />;
        }
        // Redirect if not a DJ
        return <HomePage setView={setView} />;
      case 'admin-dashboard':
        if (currentUser?.role === Role.ADMIN) {
            return <AdminDashboardPage setView={setView} />;
        }
        return <HomePage setView={setView} />;
      case 'user-dashboard':
        if (currentUser?.role === Role.CUSTOMER) {
            return <UserDashboardPage />;
        }
        return <HomePage setView={setView} />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <CursorPianoEffect />
      <Header setView={setView} auth={auth}/>
      <main>
        {renderContent()}
      </main>
      <Footer setView={setView}/>
      {isAuthModalOpen && <AuthModal 
        closeModal={() => setAuthModalOpen(false)}
        onLogin={auth.login}
        users={MOCK_USERS}
      />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;