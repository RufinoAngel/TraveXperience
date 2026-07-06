import React, { useState, useEffect } from 'react';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import SettingsSidebar from './components/SettingsSidebar.jsx';

// Pages
import LandingPage from './pages/landing.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ForgotPassword from './pages/recuperarContraseña.jsx';
import NearMeHome from './pages/Inicio.jsx';
import InteractiveMap from './pages/mapa.jsx';
import AwayFromHomePlanner from './pages/itinerario.jsx';
import HotelDetail from './pages/infoCards.jsx';
import Checkout from './pages/pago.jsx';
import BookingConfirmed from './pages/confirmacionPago.jsx';

// Settings sub-pages
import UserProfile from './pages/perfil.jsx';
import PrivacySecurity from './pages/seguridad.jsx';
import UserNotifications from './pages/notificaciones.jsx';
import SavedTrips from './pages/favoritos.jsx';
import PaymentsBilling from './pages/historialPagos.jsx';
import AccountSettings from './pages/privacidad.jsx';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [settingsTab, setSettingsTab] = useState('Personal Info');
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Sync window hash with router page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      if (['landing', 'login', 'register', 'forgot-password', 'inicio', 'mapa', 'itinerario', 'hotel-detail', 'checkout', 'payment-success'].includes(hash)) {
        setCurrentPage(hash);
      } else if (['personal-info', 'security', 'notifications', 'favorites', 'payments', 'privacy'].includes(hash)) {
        setCurrentPage('settings');
        // Map hash to Settings tab name
        const tabMap = {
          'personal-info': 'Personal Info',
          'security': 'Security',
          'notifications': 'Notifications',
          'favorites': 'Favorites',
          'payments': 'Payments',
          'privacy': 'Privacy'
        };
        setSettingsTab(tabMap[hash]);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page, params = {}) => {
    if (page === 'settings') {
      const tab = params.tab || 'Personal Info';
      setSettingsTab(tab);
      const tabHash = tab.toLowerCase().replace(/\s+/g, '-');
      window.location.hash = `#${tabHash}`;
      setCurrentPage('settings');
    } else {
      if (params.hotel) {
        setSelectedHotel(params.hotel);
      }
      window.location.hash = `#${page}`;
      setCurrentPage(page);
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    navigate('landing');
  };

  // Determine if we should show standard header/footer
  const showHeader = true; // Every page gets a header
  const noFooterPages = ['mapa']; // fullscreen pages skip footer
  const showFooter = !noFooterPages.includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return (
          <Login 
            onNavigate={navigate} 
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              navigate('inicio');
            }} 
          />
        );
      case 'register':
        return (
          <Register 
            onNavigate={navigate} 
            onRegisterSuccess={() => {
              setIsLoggedIn(true);
              navigate('inicio');
            }} 
          />
        );
      case 'forgot-password':
        return <ForgotPassword onNavigate={navigate} />;
      case 'inicio':
        return <NearMeHome onNavigate={navigate} />;
      case 'mapa':
        return <InteractiveMap onNavigate={navigate} />;
      case 'itinerario':
        return <AwayFromHomePlanner onNavigate={navigate} />;
      case 'hotel-detail':
        return <HotelDetail onNavigate={navigate} hotel={selectedHotel} />;
      case 'checkout':
        return <Checkout onNavigate={navigate} hotel={selectedHotel} />;
      case 'payment-success':
        return <BookingConfirmed onNavigate={navigate} />;
      case 'settings':
        return renderSettingsPage();
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  const renderSettingsPage = () => {
    const renderActiveTab = () => {
      switch (settingsTab) {
        case 'Personal Info':
          return <UserProfile onNavigate={navigate} isSettingsTab={true} />;
        case 'Security':
          return <PrivacySecurity onNavigate={navigate} isSettingsTab={true} />;
        case 'Notifications':
          return <UserNotifications onNavigate={navigate} isSettingsTab={true} />;
        case 'Favorites':
          return <SavedTrips onNavigate={navigate} isSettingsTab={true} />;
        case 'Payments':
          return <PaymentsBilling onNavigate={navigate} isSettingsTab={true} />;
        case 'Privacy':
          return <AccountSettings onNavigate={navigate} isSettingsTab={true} />;
        default:
          return <UserProfile onNavigate={navigate} isSettingsTab={true} />;
      }
    };

    return (
      <div className="bg-background text-on-background font-sans min-h-screen flex">
        <SettingsSidebar 
          currentTab={settingsTab} 
          onTabChange={(tab) => navigate('settings', { tab })} 
        />
        <div className="flex-1 md:pl-64 pt-20">
          {renderActiveTab()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-on-background selection:bg-secondary-container antialiased">
      {showHeader && (
        <Header 
          isLoggedIn={isLoggedIn} 
          onNavigate={navigate} 
          currentPage={currentPage}
          currentTab={settingsTab}
          onSignOut={handleSignOut}
        />
      )}
      
      <div className="flex-grow">
        {renderPage()}
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

export default Home;