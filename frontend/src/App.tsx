import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import PageTransition from './components/PageTransition/PageTransition';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import UPIPayments from './pages/UPIPayments/UPIPayments';
import Budgets from './pages/Budgets/Budgets';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';
import RecurringTransactions from './pages/RecurringTransactions/RecurringTransactions';
import DebtTracker from './pages/DebtTracker/DebtTracker';
import Savings from './pages/Savings/Savings';
import Investments from './pages/Investments/Investments';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Initialize scroll reveal animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/transactions" element={<PageTransition transitionType="fade-left"><Transactions /></PageTransition>} />
          <Route path="/recurring" element={<PageTransition transitionType="blur-reveal"><RecurringTransactions /></PageTransition>} />
          <Route path="/debt" element={<PageTransition transitionType="scale"><DebtTracker /></PageTransition>} />
          <Route path="/savings" element={<PageTransition transitionType="fade-up"><Savings /></PageTransition>} />
          <Route path="/investments" element={<PageTransition transitionType="scale"><Investments /></PageTransition>} />
          <Route path="/payments" element={<PageTransition transitionType="fade-right"><UPIPayments /></PageTransition>} />
          <Route path="/budgets" element={<PageTransition transitionType="smooth-scale"><Budgets /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition transitionType="fade-up"><Analytics /></PageTransition>} />
          <Route path="/profile" element={<PageTransition transitionType="blur-reveal"><Profile /></PageTransition>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
