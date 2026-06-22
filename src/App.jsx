import React from 'react';
import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import AppRoutes from '@/routes/AppRoutes';

function App() {
  return (
    <>
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;
