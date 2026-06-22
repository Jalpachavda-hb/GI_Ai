import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import About from '@/pages/About/About';
import Services from '@/pages/Services/Services';
import NotFound from '@/pages/NotFound/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
     
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
