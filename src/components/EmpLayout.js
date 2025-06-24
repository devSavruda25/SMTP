// src/components/Layout.js (new component)
import React from 'react';

import EmpSidebar from './EmpSidebar';

export default function EmpLayout({ children }) {
  return (
    <div className="d-flex">
      <EmpSidebar />
      <main style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}