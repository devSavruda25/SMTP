import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SendEmail from './pages/SendEmail';
import Sidebar from './components/employee/Sidebar';

import EmpLogin from './pages/Employee/Emplogin';
import EmpDashboard from './pages/Employee/EmpDashbord';
import EmpSidebar from './components/employee/EmpSidebar';
import EmpAttendance from './pages/Employee/EmpAttendance';

function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('token'));
  const [empToken, setEmpToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    setAdminToken(localStorage.getItem('token'));
    setEmpToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  }, []);

  return (
    <Router>
      {adminToken && role === 'admin' && <Sidebar />}
      {empToken && role === 'employee' && <EmpSidebar />}

      <Routes>
        {/* Admin Routes */}
        <Route
          path="/"
          element={!adminToken ? <Login setToken={setAdminToken} setRole={setRole} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={adminToken ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/send"
          element={adminToken ? <SendEmail /> : <Navigate to="/" />}
        />

        {/* Employee Routes */}
        <Route
          path="/emplogin"
          element={!empToken ? <EmpLogin setToken={setEmpToken} setRole={setRole} /> : <Navigate to="/empdashboard" />}
        />
        <Route
          path="/empdashboard"
          element={empToken ? <EmpDashboard /> : <Navigate to="/emplogin" />}
        />
        <Route
          path="/empdattendance"
          element={empToken ? <EmpAttendance /> : <Navigate to="/emplogin" />}
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={<h1 className="text-center text-red-500 mt-10">404 - Page Not Found</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;