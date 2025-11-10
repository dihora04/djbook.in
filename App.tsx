
import React, { useState } from 'react';
import { View } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import DjProfilePage from './components/DjProfilePage';

function App() {
  const [view, setView] = useState<View>({ page: 'home' });

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
        // Fallback to search if no slug
        return <SearchPage setView={setView} />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header setView={setView} />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
