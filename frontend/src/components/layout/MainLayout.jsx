import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SupportWidget from '../common/SupportWidget';

/**
 * Dedicated Layout component providing shared Navbar, Footer, and SupportWidget
 * across all pages without repetition.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-yellow-200 selection:text-yellow-900 transition-colors duration-300 relative">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}
