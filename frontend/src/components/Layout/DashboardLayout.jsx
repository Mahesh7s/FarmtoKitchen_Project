// components/Layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import Footer from './Footer';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;