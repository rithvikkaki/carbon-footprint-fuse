import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CarbonFootprintProvider } from '@/contexts/CartonFootprintContext';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Calculator from '@/pages/Calculator';
import Marketplace from '@/pages/Marketplace';
import BlockchainPage from '@/pages/BlockchainPage';
import About from '@/pages/About';
import ConnectWallet from '@/pages/ConnectWallet';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarbonFootprintProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/blockchain" element={<BlockchainPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/connect-wallet" element={<ConnectWallet />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </CarbonFootprintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
