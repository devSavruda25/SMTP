// src/components/Layout.js (new component)
import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <main style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}