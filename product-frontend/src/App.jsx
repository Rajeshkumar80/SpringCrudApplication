import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Chatbot from './components/Chatbot';

import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductsPage from './pages/ProductsPage';
import AiAssistantPage from './pages/AiAssistantPage';

let toastId = 1;

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply dark mode to document
  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const showToast = useCallback((message, type = 'info') => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage />;
      case 'analytics':    return <AnalyticsPage />;
      case 'products':     return <ProductsPage openAdd={openAdd} setOpenAdd={setOpenAdd} showToast={showToast} />;
      case 'ai-assistant': return <AiAssistantPage />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => { setActivePage(page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Main */}
      <div className="main-content">
        <Navbar
          activePage={activePage}
          darkMode={darkMode}
          toggleDark={toggleDark}
          onAddProduct={() => { setActivePage('products'); setOpenAdd(true); }}
          toggleSidebar={() => setSidebarOpen((p) => !p)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ flex: 1 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
