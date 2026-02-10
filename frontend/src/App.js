import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Tours from './components/Tours';
import TourDetails from './components/TourDetails';
import SuggestTour from './components/SuggestTour';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreatePrivateTour from './components/CreatePrivateTour';
import CreateTour from './components/CreateTour';
import PaymentPage from './components/PaymentPage';
import OrganizerPaymentDetails from './components/OrganizerPaymentDetails';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import VirtualTourGuide from './components/VirtualTourGuide';
import OrganizerPrivateTours from './components/OrganizerPrivateTours';
import OrganizerProfile from './components/OrganizerProfile';
import FloatingChat from './components/FloatingChat';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isVirtualTourGuide = location.pathname === '/virtual-tour-guide';
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div className={`App ${isVirtualTourGuide ? 'chatgpt-layout' : ''}`}>
      {!isAuthPage && <Header className={isVirtualTourGuide ? 'sticky-header' : ''} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/suggest" element={<SuggestTour />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/virtual-tour-guide" element={<VirtualTourGuide />} />
        <Route path="/private-tours" element={<OrganizerPrivateTours />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-private-tour" element={<CreatePrivateTour />} />
        <Route path="/create-tour" element={<CreateTour />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/organizer/:username" element={<OrganizerProfile />} />
        <Route path="/payment-details" element={<OrganizerPaymentDetails />} />
      </Routes>
      {!isAuthPage && !isVirtualTourGuide && <Footer />}
      {!isAuthPage && !isVirtualTourGuide && token && <FloatingChat />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
